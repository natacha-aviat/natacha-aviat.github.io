-- Champs fixes pour : Infirmier remplacé, Infirmier remplaçant, Lieu d'exercice
-- Objectif :
-- - stocker ces informations en colonnes dédiées (préremplissage rapide, réutilisation)
-- - conserver un snapshot au niveau du dossier (traçabilité)
-- - laisser le reste du questionnaire dans dossier_reponses (JSONB) plus tard si nécessaire

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,

  -- Profil “l’infirmier de l’utilisateur” (sert à préremplir selon qui est l’utilisateur dans le contrat)
  civilite text,
  nom_prenom text,
  ordinal text,
  rpps text unique,
  statut text,
  adresse text,

  siret text,
  siren text,
  tva text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_profiles_rpps_not_null on public.user_profiles (rpps)
  where rpps is not null;

drop trigger if exists trg_user_profiles_set_updated_at on public.user_profiles;
create trigger trg_user_profiles_set_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

-- Snapshot des “parties” sur un dossier
create table if not exists public.dossier_parties (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers (id) on delete cascade,

  party_role text not null
    check (party_role in ('remplace', 'remplacant')),

  -- si la partie correspond à un utilisateur connu (rattaché après match par RPPS), sinon null
  linked_user_id uuid references auth.users (id) on delete set null,

  civilite text,
  nom_prenom text,
  ordinal text,
  rpps text,
  statut text,
  adresse text,

  -- champs spécifiques à ce questionnaire (remplacé / remplaçant)
  mode_exercice text,
  associes_info text check (associes_info in ('oui', 'non')),
  multi_remplacements text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (dossier_id, party_role)
);

drop trigger if exists trg_dossier_parties_set_updated_at on public.dossier_parties;
create trigger trg_dossier_parties_set_updated_at
before update on public.dossier_parties
for each row execute function public.set_updated_at();

create index if not exists idx_dossier_parties_role on public.dossier_parties (party_role);
create index if not exists idx_dossier_parties_rpps on public.dossier_parties (rpps);

-- Snapshot du lieu d’exercice pendant le remplacement
create table if not exists public.dossier_lieu_exercice (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null unique references public.dossiers (id) on delete cascade,
  lieu text not null check (lieu in ('cabinet-remplace', 'cabinet-remplacant')),
  adresse text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_dossier_lieu_exercice_set_updated_at on public.dossier_lieu_exercice;
create trigger trg_dossier_lieu_exercice_set_updated_at
before update on public.dossier_lieu_exercice
for each row execute function public.set_updated_at();

-- RLS
alter table public.user_profiles enable row level security;
alter table public.dossier_parties enable row level security;
alter table public.dossier_lieu_exercice enable row level security;

-- user_profiles : accès seulement au propriétaire
drop policy if exists user_profiles_all_own on public.user_profiles;
create policy user_profiles_all_own
  on public.user_profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- dossiers & enfants : on réutilise la logique “dossier appartient à l’utilisateur”
drop policy if exists dossier_parties_all_own on public.dossier_parties;
create policy dossier_parties_all_own
  on public.dossier_parties for all
  using (
    exists (
      select 1
      from public.dossiers d
      where d.id = dossier_id and d.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.dossiers d
      where d.id = dossier_id and d.user_id = auth.uid()
    )
  );

drop policy if exists dossier_lieu_exercice_all_own on public.dossier_lieu_exercice;
create policy dossier_lieu_exercice_all_own
  on public.dossier_lieu_exercice for all
  using (
    exists (
      select 1
      from public.dossiers d
      where d.id = dossier_id and d.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.dossiers d
      where d.id = dossier_id and d.user_id = auth.uid()
    )
  );

