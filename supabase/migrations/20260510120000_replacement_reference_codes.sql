-- Numéros métier (questionnaire, contrat, dossier…) : séparés de `remplacements`
-- pour ne pas exposer de « numéro client » sur la table dossier et permettre plusieurs
-- types de références par même utilisateur via le même dossier (join remplacements.user_id).

create table public.remplacement_references (
  id uuid primary key default gen_random_uuid(),
  remplacement_id uuid not null references public.remplacements (id) on delete cascade,
  -- Type de pièce concernée (évolutif : ajouter des valeurs en migration si besoin)
  reference_kind text not null
    check (reference_kind in ('dossier', 'questionnaire', 'contrat')),
  -- Numéro affiché factures / support (ex. ML-RPL-2026-00042) — unique globalement
  reference_code text not null unique,
  -- Si le numéro concerne une version précise de contrat généré ; null pour dossier / questionnaire
  remplacement_contrat_id uuid references public.remplacement_contrats (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint chk_remplacement_reference_kind_vs_contrat check (
    (reference_kind = 'contrat' and remplacement_contrat_id is not null)
    or (reference_kind <> 'contrat' and remplacement_contrat_id is null)
  )
);

-- Une seule référence par (dossier + type) lorsqu’elle n’est pas rattachée à une version de contrat
create unique index uq_replacement_ref_dossier_questionnaire
  on public.remplacement_references (remplacement_id, reference_kind)
  where remplacement_contrat_id is null;

-- Pour kind = contrat : au plus une ligne par version de contrat générée
create unique index uq_replacement_ref_contrat_version
  on public.remplacement_references (remplacement_id, reference_kind, remplacement_contrat_id)
  where remplacement_contrat_id is not null;

comment on table public.remplacement_references is
  'Lie les références publiques (numéros de questionnaire, contrat, dossier) au dossier remplacement ; '
  'l’utilisateur est obtenu par join sur remplacements.user_id — ne pas stocker de numéro client sur remplacements.';

comment on column public.remplacement_references.reference_kind is
  'dossier = dossier médico-légal global ; questionnaire = référence du questionnaire ; contrat = référence d’une généraiton de contrat.';

create index idx_replacement_refs_replacement on public.remplacement_references (remplacement_id);
create index idx_replacement_refs_contrat on public.remplacement_references (remplacement_contrat_id)
  where remplacement_contrat_id is not null;

alter table public.remplacement_references enable row level security;

create policy replacement_refs_all_own_replacement
  on public.remplacement_references for all
  using (
    exists (
      select 1 from public.remplacements r
      where r.id = remplacement_id and r.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.remplacements r
      where r.id = remplacement_id and r.user_id = auth.uid()
    )
  );
