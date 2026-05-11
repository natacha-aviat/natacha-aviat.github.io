-- Colonnes supplémentaires dans user_profiles pour couvrir
-- les champs “fixes” spécifiques du questionnaire remplacement.

alter table public.user_profiles
  add column if not exists mode_exercice text;

alter table public.user_profiles
  add column if not exists associes_info text check (associes_info in ('oui', 'non'));

alter table public.user_profiles
  add column if not exists multi_remplacements text;

