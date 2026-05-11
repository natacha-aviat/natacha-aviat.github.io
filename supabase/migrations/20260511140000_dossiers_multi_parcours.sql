-- Généralise le modèle « remplacement uniquement » → dossiers multi-parcours.
-- Un client peut avoir plusieurs dossiers (un par dossier légal / parcours) : installation,
-- déménagement, remplacement… Chaque parcours a ses propres gabarits questionnaire + contrat.

-- ─── Catalogue métier des parcours (un slug = une famille questionnaire + documents) ───
create table public.parcours (
  slug text primary key,
  title text not null,
  description text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.parcours is
  'Famille de dossier (ex. remplacement_infirmiers, installation_liberal). Un dossier utilisateur cite un parcours_slug ; '
  'les gabarits document_templates rattachent le questionnaire et les contrats à ce même slug.';

insert into public.parcours (slug, title, sort_order)
values ('remplacement_infirmiers', 'Contrat de remplacement – infirmiers libéraux', 10)
on conflict (slug) do nothing;

-- ─── Gabarits : lien parcours + nature (questionnaire vs contrat) ───
alter table public.document_templates
  add column if not exists parcours_slug text references public.parcours (slug);

alter table public.document_templates
  add column if not exists template_kind text;

update public.document_templates
set
  parcours_slug = coalesce(parcours_slug, 'remplacement_infirmiers'),
  template_kind = case
    when template_kind is not null then template_kind
    when slug ilike '%questionnaire%' then 'questionnaire'
    else 'contrat'
  end
where parcours_slug is null or template_kind is null;

update public.document_templates
set parcours_slug = 'remplacement_infirmiers'
where parcours_slug is null;

update public.document_templates
set template_kind = 'contrat'
where template_kind is null;

alter table public.document_templates
  drop constraint if exists document_templates_template_kind_check;

alter table public.document_templates
  add constraint document_templates_template_kind_check check (
    template_kind in ('questionnaire', 'contrat', 'annexe', 'lettre')
  );

alter table public.document_templates
  alter column parcours_slug set not null;

alter table public.document_templates
  alter column template_kind set not null;

create index if not exists idx_document_templates_parcours_kind
  on public.document_templates (parcours_slug, template_kind);

-- ─── RLS / triggers : retirer l’ancien modèle remplacement_* avant renommage ───
drop policy if exists replacement_refs_all_own_replacement on public.remplacement_references;
drop policy if exists contrats_all_own_replacement on public.remplacement_contrats;
drop policy if exists reponses_all_own_replacement on public.remplacement_reponses;
drop policy if exists remplacements_delete_own on public.remplacements;
drop policy if exists remplacements_update_own on public.remplacements;
drop policy if exists remplacements_insert_own on public.remplacements;
drop policy if exists remplacements_select_own on public.remplacements;

drop trigger if exists trg_remplacements_set_updated_at on public.remplacements;
drop trigger if exists trg_reponses_set_updated_at on public.remplacement_reponses;

-- Dossier utilisateur : parcours + statut (plusieurs dossiers / client / type possibles)
alter table public.remplacements
  add column if not exists parcours_slug text references public.parcours (slug);

update public.remplacements
set parcours_slug = 'remplacement_infirmiers'
where parcours_slug is null;

alter table public.remplacements
  alter column parcours_slug set not null;

alter table public.remplacements rename to dossiers;

create trigger trg_dossiers_set_updated_at
before update on public.dossiers
for each row execute function public.set_updated_at();

alter index idx_remplacements_user_id rename to idx_dossiers_user_id;
alter index idx_remplacements_updated_at rename to idx_dossiers_updated_at;

create index if not exists idx_dossiers_user_parcours
  on public.dossiers (user_id, parcours_slug);

-- Réponses au questionnaire (clés libres selon le formulaire du parcours)
alter table public.remplacement_reponses rename to dossier_reponses;
alter table public.dossier_reponses rename column remplacement_id to dossier_id;

create trigger trg_dossier_reponses_set_updated_at
before update on public.dossier_reponses
for each row execute function public.set_updated_at();

alter index idx_reponses_replacement rename to idx_reponses_dossier;

-- Documents générés (contrats, courriers…) — plusieurs versions par dossier
alter table public.remplacement_contrats rename to dossier_documents;
alter table public.dossier_documents rename column remplacement_id to dossier_id;

alter index idx_contrats_replacement rename to idx_documents_dossier;

alter table public.remplacement_references rename to dossier_references;
alter table public.dossier_references rename column remplacement_id to dossier_id;
alter table public.dossier_references rename column remplacement_contrat_id to dossier_document_id;

alter table public.dossier_references drop constraint if exists chk_remplacement_reference_kind_vs_contrat;

alter table public.dossier_references
  add constraint chk_dossier_reference_kind_vs_document check (
    (reference_kind = 'contrat' and dossier_document_id is not null)
    or (reference_kind <> 'contrat' and dossier_document_id is null)
  );

drop index if exists public.uq_replacement_ref_dossier_questionnaire;
drop index if exists public.uq_replacement_ref_contrat_version;

create unique index uq_dossier_ref_kind_no_document
  on public.dossier_references (dossier_id, reference_kind)
  where dossier_document_id is null;

create unique index uq_dossier_ref_kind_with_document
  on public.dossier_references (dossier_id, reference_kind, dossier_document_id)
  where dossier_document_id is not null;

alter index idx_replacement_refs_replacement rename to idx_dossier_refs_dossier;
alter index idx_replacement_refs_contrat rename to idx_dossier_refs_document;

comment on table public.dossiers is
  'Dossier légal utilisateur pour un parcours donné (remplacement, installation…). '
  'Un même user_id peut avoir plusieurs lignes pour des parcours_slug différents ou plusieurs dossiers du même parcours.';

comment on table public.dossier_reponses is
  'Une ligne par question ; question_key est imposée par le questionnaire du parcours (contrat métier front / doc template questionnaire).';

comment on table public.dossier_documents is
  'Génération ou version exportée : contrat principal, annexes selon template_id (document_templates).';

comment on table public.dossier_references is
  'Numéros métier publics liés au dossier ; pour kind=contrat, lier à dossier_documents.id.';

-- ─── RLS dossiers & enfants ───
create policy dossiers_select_own
  on public.dossiers for select
  using (auth.uid() = user_id);

create policy dossiers_insert_own
  on public.dossiers for insert
  with check (auth.uid() = user_id);

create policy dossiers_update_own
  on public.dossiers for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy dossiers_delete_own
  on public.dossiers for delete
  using (auth.uid() = user_id);

create policy dossier_reponses_all_own
  on public.dossier_reponses for all
  using (
    exists (
      select 1 from public.dossiers d
      where d.id = dossier_id and d.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.dossiers d
      where d.id = dossier_id and d.user_id = auth.uid()
    )
  );

create policy dossier_documents_all_own
  on public.dossier_documents for all
  using (
    exists (
      select 1 from public.dossiers d
      where d.id = dossier_id and d.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.dossiers d
      where d.id = dossier_id and d.user_id = auth.uid()
    )
  );

create policy dossier_references_all_own
  on public.dossier_references for all
  using (
    exists (
      select 1 from public.dossiers d
      where d.id = dossier_id and d.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.dossiers d
      where d.id = dossier_id and d.user_id = auth.uid()
    )
  );

-- Parcours & gabarits : lecture publique contrôlée (catalogue pour le front)
alter table public.parcours enable row level security;

create policy parcours_select_active
  on public.parcours for select
  using (active = true);

drop policy if exists document_templates_select_catalog on public.document_templates;

create policy document_templates_select_catalog
  on public.document_templates for select
  using (true);
