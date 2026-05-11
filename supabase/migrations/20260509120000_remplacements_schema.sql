-- Remplace questionnaire_submissions / generated_contracts par un modèle centré
-- « remplacement » : un dossier par utilisateur, réponses ligne à ligne, contrats versionnés.

-- Anciennes tables (peu utilisées en prod ; pas de migration de données JSONB → lignes ici)
drop table if exists public.generated_contracts;
drop table if exists public.questionnaire_submissions;

-- Un dossier de remplacement par utilisateur authentifié (Supabase Auth)
create table public.remplacements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'generated', 'signed', 'archived')),
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Une ligne par question du formulaire (clé stable côté front, ex. temporaire, type-remplacement)
create table public.remplacement_reponses (
  id uuid primary key default gen_random_uuid(),
  remplacement_id uuid not null references public.remplacements (id) on delete cascade,
  question_key text not null,
  answer_value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (remplacement_id, question_key)
);

-- Chaque génération de contrat (réédition = nouvelle ligne, traçabilité)
create table public.remplacement_contrats (
  id uuid primary key default gen_random_uuid(),
  remplacement_id uuid not null references public.remplacements (id) on delete cascade,
  template_id uuid references public.document_templates (id) on delete set null,
  content_html text,
  content_text text,
  -- Préférer Storage Supabase pour les PDF lourds ; chemin type bucket/path
  pdf_storage_path text,
  created_at timestamptz not null default now()
);

create index idx_remplacements_user_id on public.remplacements (user_id);
create index idx_remplacements_updated_at on public.remplacements (updated_at desc);
create index idx_reponses_replacement on public.remplacement_reponses (remplacement_id);
create index idx_contrats_replacement on public.remplacement_contrats (remplacement_id);

drop trigger if exists trg_remplacements_set_updated_at on public.remplacements;
create trigger trg_remplacements_set_updated_at
before update on public.remplacements
for each row execute function public.set_updated_at();

drop trigger if exists trg_reponses_set_updated_at on public.remplacement_reponses;
create trigger trg_reponses_set_updated_at
before update on public.remplacement_reponses
for each row execute function public.set_updated_at();

alter table public.remplacements enable row level security;
alter table public.remplacement_reponses enable row level security;
alter table public.remplacement_contrats enable row level security;

-- Propriétaire du dossier uniquement (JWT utilisateur)
create policy remplacements_select_own
  on public.remplacements for select
  using (auth.uid() = user_id);

create policy remplacements_insert_own
  on public.remplacements for insert
  with check (auth.uid() = user_id);

create policy remplacements_update_own
  on public.remplacements for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy remplacements_delete_own
  on public.remplacements for delete
  using (auth.uid() = user_id);

create policy reponses_all_own_replacement
  on public.remplacement_reponses for all
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

create policy contrats_all_own_replacement
  on public.remplacement_contrats for all
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
