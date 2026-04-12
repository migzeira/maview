-- =====================================================
-- MAVIEW — Tabela LEADS + campos de integração
-- Execute no Supabase SQL Editor
-- =====================================================

-- 1. Tabela leads (captura de email no perfil público)
create table if not exists public.leads (
  id              uuid default gen_random_uuid() primary key,
  vitrine_id      uuid references public.vitrines(id) on delete cascade not null,
  email           text not null,
  name            text,
  source          text default 'profile',
  metadata        jsonb default '{}',
  created_at      timestamptz default now()
);

create index if not exists idx_leads_vitrine on public.leads(vitrine_id, created_at);
create index if not exists idx_leads_email on public.leads(email);

-- Unique constraint: same email per vitrine (no duplicates)
create unique index if not exists idx_leads_unique_email on public.leads(vitrine_id, email);

-- RLS
alter table public.leads enable row level security;

-- Anyone can insert a lead (visitor on public profile)
drop policy if exists "anyone_insert_lead" on public.leads;
create policy "anyone_insert_lead" on public.leads
  for insert with check (true);

-- Vitrine owner can read their leads
drop policy if exists "owner_read_leads" on public.leads;
create policy "owner_read_leads" on public.leads
  for select using (
    vitrine_id in (select id from public.vitrines where user_id = auth.uid())
  );

-- Vitrine owner can delete their leads
drop policy if exists "owner_delete_leads" on public.leads;
create policy "owner_delete_leads" on public.leads
  for delete using (
    vitrine_id in (select id from public.vitrines where user_id = auth.uid())
  );

-- Admin read all leads
drop policy if exists "admin_read_all_leads" on public.leads;
create policy "admin_read_all_leads" on public.leads
  for select using (
    auth.jwt() ->> 'email' in (
      'andrefernandesbalada@gmail.com',
      'migueldrops@gmail.com',
      'maview.suporte@gmail.com'
    )
  );

-- =====================================================
-- PRONTO! Tabela leads criada.
-- =====================================================
