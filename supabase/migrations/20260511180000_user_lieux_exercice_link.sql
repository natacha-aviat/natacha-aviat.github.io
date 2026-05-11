-- Modéliser un ou plusieurs “lieux d’exercice” par utilisateur (cabinet(s))
-- pour pouvoir préremplir plus proprement les champs fixes du questionnaire.

create table if not exists public.user_lieux_exercice (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  -- Libellé optionnel (“cabinet principal”, “cabinet secondaire”, etc.)
  label text,

  adresse text not null,
  -- Un seul lieu “par défaut” par utilisateur (utile pour préremplir vite).
  is_default boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, adresse)
);

drop trigger if exists trg_user_lieux_exercice_set_updated_at on public.user_lieux_exercice;
create trigger trg_user_lieux_exercice_set_updated_at
before update on public.user_lieux_exercice
for each row execute function public.set_updated_at();

create index if not exists idx_user_lieux_exercice_user_id on public.user_lieux_exercice (user_id);
create index if not exists idx_user_lieux_exercice_default on public.user_lieux_exercice (user_id, is_default);

-- Unicité du “default” par utilisateur
create unique index if not exists uq_user_lieux_exercice_default
  on public.user_lieux_exercice (user_id)
  where is_default = true;

alter table public.dossier_lieu_exercice
  add column if not exists user_lieu_exercice_id uuid
  references public.user_lieux_exercice (id)
  on delete set null;

alter table public.dossier_lieu_exercice
  alter column user_lieu_exercice_id drop not null;

alter table public.user_lieux_exercice enable row level security;

drop policy if exists user_lieux_exercice_all_own on public.user_lieux_exercice;
create policy user_lieux_exercice_all_own
  on public.user_lieux_exercice for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

