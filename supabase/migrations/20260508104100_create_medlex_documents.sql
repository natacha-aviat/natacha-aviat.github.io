create extension if not exists pgcrypto;

create table if not exists public.document_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  version text not null default 'v1',
  content_markdown text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.questionnaire_submissions (
  id uuid primary key default gen_random_uuid(),
  answers_json jsonb not null,
  status text not null default 'draft' check (status in ('draft', 'generated', 'signed')),
  created_at timestamptz not null default now()
);

create table if not exists public.generated_contracts (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.questionnaire_submissions(id) on delete cascade,
  template_id uuid references public.document_templates(id) on delete set null,
  content_html text not null,
  content_text text,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_document_templates_set_updated_at on public.document_templates;
create trigger trg_document_templates_set_updated_at
before update on public.document_templates
for each row
execute function public.set_updated_at();

alter table public.document_templates enable row level security;
alter table public.questionnaire_submissions enable row level security;
alter table public.generated_contracts enable row level security;
