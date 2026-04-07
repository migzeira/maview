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
    auth.jwt() ->> 'email' = 'andrefernandesbalada@gmail.com'
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
-- PRONTO! Agora acesse /admin no Maview com seu email.
-- =====================================================
