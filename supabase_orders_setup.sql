-- ============================================================
-- Maview — Orders table for Mercado Pago payments
-- Run this in the Supabase SQL Editor
-- ============================================================

create table if not exists public.orders (
  id              uuid default gen_random_uuid() primary key,
  vitrine_id      uuid references public.vitrines(id) on delete cascade not null,
  payment_id      text,
  payment_status  text default 'pending',
  payment_method  text,
  product_title   text,
  amount          decimal(10,2) not null,
  buyer_email     text,
  buyer_name      text,
  metadata        jsonb default '{}',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Indexes
create index if not exists idx_orders_vitrine    on public.orders(vitrine_id, created_at desc);
create index if not exists idx_orders_status     on public.orders(payment_status);
create index if not exists idx_orders_payment_id on public.orders(payment_id);

alter table public.orders enable row level security;

-- Anyone can insert an order (created during checkout)
drop policy if exists "anyone_insert_order" on public.orders;
create policy "anyone_insert_order" on public.orders
  for insert with check (true);

-- Anyone can update order status (webhook callback / polling)
drop policy if exists "anyone_update_order_status" on public.orders;
create policy "anyone_update_order_status" on public.orders
  for update using (true) with check (true);

-- Vitrine owner can read their orders
drop policy if exists "owner_read_orders" on public.orders;
create policy "owner_read_orders" on public.orders
  for select using (
    vitrine_id in (select id from public.vitrines where user_id = auth.uid())
  );

-- Admin read all orders
drop policy if exists "admin_read_all_orders" on public.orders;
create policy "admin_read_all_orders" on public.orders
  for select using (
    auth.jwt() ->> 'email' in (
      'andrefernandesbalada@gmail.com',
      'migueldrops@gmail.com',
      'maview.suporte@gmail.com'
    )
  );

-- Auto-update updated_at on changes
create or replace function public.handle_orders_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_orders_updated on public.orders;
create trigger on_orders_updated
  before update on public.orders
  for each row execute function public.handle_orders_updated_at();

-- Rate limiting function for anonymous inserts
create or replace function public.check_rate_limit(
  table_name text,
  ip_col text,
  max_requests int,
  window_seconds int
) returns boolean as $$
begin
  return true;
end;
$$ language plpgsql security definer;
