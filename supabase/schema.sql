-- ONNIS & MEEKS - esquema base
-- Ejecutar en Supabase > SQL Editor. Es idempotente.

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create extension if not exists unaccent with schema extensions;

-- unaccent() es STABLE y una columna generada exige una funcion IMMUTABLE.
-- La version de dos argumentos fija el diccionario, asi que envolverla es seguro.
create or replace function public.om_unaccent(text)
returns text
language sql
immutable
parallel safe
as $$
  select extensions.unaccent('extensions.unaccent'::regdictionary, $1)
$$;

-- ---------------------------------------------------------------- clientes --
create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  logo_url    text,
  logo_slug   text,                 -- slug de Simple Icons cuando no hay archivo
  story       text,
  website     text,
  services    text[] not null default '{}',
  sort_order  int    not null default 0,
  created_at  timestamptz not null default now()
);

-- --------------------------------------------------------------- proyectos --
create table if not exists public.projects (
  id                uuid primary key default gen_random_uuid(),
  youtube_id        text unique,
  slug              text not null unique,
  title             text not null,
  project_name      text,
  client_name       text,
  client_slug       text,
  year              int,
  project_date      date,
  services          text[] not null default '{}',
  category          text,
  location          text,
  story             text,
  results           text,
  tags              text[] not null default '{}',
  cover_url         text,
  duration_seconds  int,
  published_at      timestamptz,

  featured    boolean not null default false,
  hidden      boolean not null default false,
  sort_order  int     not null default 0,
  status      text    not null default 'published' check (status in ('draft','published')),
  source      text    not null default 'youtube'   check (source in ('youtube','manual')),

  credits       jsonb not null default '[]'::jsonb,
  gallery       jsonb not null default '[]'::jsonb,
  extra_videos  jsonb not null default '[]'::jsonb,
  making_of     jsonb not null default '[]'::jsonb,

  -- IA
  ai_summary        text,
  seo_title         text,
  seo_description   text,
  keywords          text[] not null default '{}',
  home_excerpt      text,
  social_linkedin   text,
  social_instagram  text,
  social_facebook   text,
  ai_generated_at   timestamptz,

  -- sincronizacion
  raw_description   text,
  description_hash  text,
  synced_at         timestamptz,

  -- campos tocados a mano en el panel. La sync no los pisa.
  locked_fields  text[] not null default '{}',

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists projects_published_idx
  on public.projects (status, hidden, published_at desc);
create index if not exists projects_featured_idx
  on public.projects (featured, sort_order);
create index if not exists projects_client_idx on public.projects (client_slug);
create index if not exists projects_year_idx   on public.projects (year);

-- Busqueda full text en espanol, sin acentos.
alter table public.projects
  drop column if exists search_tsv;
alter table public.projects
  add column search_tsv tsvector
  generated always as (
    to_tsvector(
      'spanish',
      public.om_unaccent(
        coalesce(title, '') || ' ' ||
        coalesce(project_name, '') || ' ' ||
        coalesce(client_name, '') || ' ' ||
        coalesce(category, '') || ' ' ||
        coalesce(location, '') || ' ' ||
        coalesce(story, '') || ' ' ||
        coalesce(array_to_string(services, ' '), '') || ' ' ||
        coalesce(array_to_string(tags, ' '), '') || ' ' ||
        coalesce(array_to_string(keywords, ' '), '') || ' ' ||
        coalesce(year::text, '')
      )
    )
  ) stored;

create index if not exists projects_search_idx on public.projects using gin (search_tsv);

-- ------------------------------------------------------ corridas de sync ---
create table if not exists public.sync_runs (
  id          uuid primary key default gen_random_uuid(),
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  trigger     text not null default 'cron',
  found       int  not null default 0,
  created     int  not null default 0,
  updated     int  not null default 0,
  enriched    int  not null default 0,
  errors      jsonb not null default '[]'::jsonb,
  status      text not null default 'running'
);

-- ------------------------------------------------------- mensajes de web ---
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  company    text,
  budget     text,
  message    text not null,
  source     text default 'web',
  created_at timestamptz not null default now()
);

-- --------------------------------------------------------------- updated_at --
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

-- --------------------------------------------------------------------- RLS --
alter table public.projects         enable row level security;
alter table public.clients          enable row level security;
alter table public.sync_runs        enable row level security;
alter table public.contact_messages enable row level security;

-- Los mensajes solo los lee el panel. El alta la hace el servidor con service role.
drop policy if exists "messages admin read" on public.contact_messages;
create policy "messages admin read" on public.contact_messages
  for select to authenticated using (true);

-- Lectura publica: solo lo publicado y no oculto.
drop policy if exists "projects readable" on public.projects;
create policy "projects readable" on public.projects
  for select using (status = 'published' and hidden = false);

drop policy if exists "clients readable" on public.clients;
create policy "clients readable" on public.clients
  for select using (true);

-- Escritura y lectura completa: solo usuarios autenticados (panel) o service role.
drop policy if exists "projects admin read" on public.projects;
create policy "projects admin read" on public.projects
  for select to authenticated using (true);

drop policy if exists "projects admin write" on public.projects;
create policy "projects admin write" on public.projects
  for all to authenticated using (true) with check (true);

drop policy if exists "clients admin write" on public.clients;
create policy "clients admin write" on public.clients
  for all to authenticated using (true) with check (true);

drop policy if exists "sync runs admin read" on public.sync_runs;
create policy "sync runs admin read" on public.sync_runs
  for select to authenticated using (true);

-- ------------------------------------------------------------- storage -----
-- Bucket publico para galerias y logos subidos desde el panel.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media admin write" on storage.objects;
create policy "media admin write" on storage.objects
  for all to authenticated
  using (bucket_id = 'media') with check (bucket_id = 'media');
