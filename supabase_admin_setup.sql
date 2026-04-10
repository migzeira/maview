-- =====================================================
-- MAVIEW — Setup da tabela profiles + trigger
-- Cole isso no SQL Editor do Supabase e execute.
-- =====================================================

-- 1. Criar tabela profiles
create table if not exists public.profiles (
  id              uuid references auth.users(id) on delete cascade primary key,
  email           text,
  full_name       text,
  username        text unique,
  avatar_url      text,
  provider        text,
  last_sign_in_at timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- 2. Habilitar RLS (Row Level Security)
alter table public.profiles enable row level security;

-- 3. Política: somente o admin lê todos os registros
create policy "admin_read_all" on public.profiles
  for select using (
    auth.jwt() ->> 'email' in (
      'andrefernandesbalada@gmail.com',
      'migueldrops@gmail.com',
      'maview.suporte@gmail.com'
    )
  );

-- 4. Política: cada usuário lê/edita apenas o próprio perfil
create policy "user_read_own" on public.profiles
  for select using (auth.uid() = id);

create policy "user_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "user_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- 5. Função + trigger: popula profiles automaticamente ao criar conta
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    username,
    avatar_url,
    provider,
    last_sign_in_at
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_app_meta_data ->> 'provider',
    new.last_sign_in_at
  )
  on conflict (id) do update set
    email           = excluded.email,
    full_name       = excluded.full_name,
    username        = excluded.username,
    avatar_url      = excluded.avatar_url,
    provider        = excluded.provider,
    last_sign_in_at = excluded.last_sign_in_at,
    updated_at      = now();
  return new;
end;
$$ language plpgsql security definer;

-- Remover trigger antigo (se existir) e criar novo
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================
-- TABELA VITRINES — armazena toda a config da vitrine
-- =====================================================

create table if not exists public.vitrines (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users(id) on delete cascade not null unique,
  username        text unique not null,
  display_name    text,
  bio             text,
  avatar_url      text,
  whatsapp        text,
  theme           text default 'dark-purple',
  design          jsonb default '{}',
  products        jsonb default '[]',
  links           jsonb default '[]',
  testimonials    jsonb default '[]',
  blocks          jsonb default '[]',
  published       boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- RLS para vitrines
alter table public.vitrines enable row level security;

-- Leitura publica por username (para Profile.tsx)
create policy "public_read_published" on public.vitrines
  for select using (published = true);

-- User le a propria vitrine (mesmo se nao publicada)
create policy "user_read_own_vitrine" on public.vitrines
  for select using (auth.uid() = user_id);

-- User edita a propria vitrine
create policy "user_update_own_vitrine" on public.vitrines
  for update using (auth.uid() = user_id);

-- User insere a propria vitrine
create policy "user_insert_own_vitrine" on public.vitrines
  for insert with check (auth.uid() = user_id);

-- User deleta a propria vitrine
create policy "user_delete_own_vitrine" on public.vitrines
  for delete using (auth.uid() = user_id);

-- Admin le todas as vitrines
create policy "admin_read_all_vitrines" on public.vitrines
  for select using (
    auth.jwt() ->> 'email' in (
      'andrefernandesbalada@gmail.com',
      'migueldrops@gmail.com',
      'maview.suporte@gmail.com'
    )
  );

-- Trigger para updated_at automatico
create or replace function public.update_vitrine_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists vitrine_updated_at on public.vitrines;
create trigger vitrine_updated_at
  before update on public.vitrines
  for each row execute function public.update_vitrine_timestamp();

-- =====================================================
-- TABELA EVENTS — analytics de visualizacoes e cliques
-- =====================================================

create table if not exists public.events (
  id              uuid default gen_random_uuid() primary key,
  vitrine_id      uuid references public.vitrines(id) on delete cascade,
  event_type      text not null,
  referrer        text,
  country         text,
  city            text,
  device          text,
  metadata        jsonb default '{}',
  created_at      timestamptz default now()
);

create index if not exists idx_events_vitrine_date on public.events(vitrine_id, created_at);
create index if not exists idx_events_type on public.events(event_type);

-- RLS para events
alter table public.events enable row level security;

-- Qualquer pessoa pode inserir evento (visitante anonimo)
create policy "anyone_insert_event" on public.events
  for insert with check (true);

-- User le eventos da propria vitrine
create policy "user_read_own_events" on public.events
  for select using (
    vitrine_id in (select id from public.vitrines where user_id = auth.uid())
  );

-- Admin le todos os eventos
create policy "admin_read_all_events" on public.events
  for select using (
    auth.jwt() ->> 'email' in (
      'andrefernandesbalada@gmail.com',
      'migueldrops@gmail.com',
      'maview.suporte@gmail.com'
    )
  );

-- =====================================================
-- STORAGE BUCKETS para imagens
-- =====================================================
-- Executar via Supabase Dashboard > Storage > New Bucket:
-- 1. Bucket "avatars" (public)
-- 2. Bucket "products" (public)
-- Ou via SQL:
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('products', 'products', true) on conflict do nothing;

-- Policies de storage: qualquer user autenticado pode fazer upload no proprio folder
create policy "user_upload_avatar" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "user_upload_product" on storage.objects
  for insert with check (
    bucket_id = 'products' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Leitura publica dos buckets
create policy "public_read_avatars" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "public_read_products" on storage.objects
  for select using (bucket_id = 'products');

-- User pode deletar proprias imagens
create policy "user_delete_own_avatar" on storage.objects
  for delete using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "user_delete_own_product" on storage.objects
  for delete using (
    bucket_id = 'products' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- PRONTO! Agora acesse /admin no Maview com seu email.
-- =====================================================
