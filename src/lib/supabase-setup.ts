import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if the required Supabase tables exist.
 * Returns { vitrines: boolean, events: boolean }
 */
export async function checkTablesExist(): Promise<{ vitrines: boolean; events: boolean }> {
  const result = { vitrines: false, events: false };

  try {
    const { error: ve } = await supabase.from("vitrines").select("id").limit(0);
    result.vitrines = !ve || ve.code !== "42P01"; // 42P01 = relation does not exist
  } catch { /* table doesn't exist */ }

  try {
    const { error: ee } = await supabase.from("events").select("id").limit(0);
    result.events = !ee || ee.code !== "42P01";
  } catch { /* table doesn't exist */ }

  return result;
}

/**
 * SQL to create all required tables.
 * Must be run in Supabase Dashboard > SQL Editor.
 */
export const SETUP_SQL = `
-- ══════════════════════════════════════════════════
-- MAVIEW — Database Setup
-- Run this in Supabase Dashboard > SQL Editor
-- ══════════════════════════════════════════════════

-- 1. Vitrines table (stores all storefront data)
CREATE TABLE IF NOT EXISTS public.vitrines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  whatsapp TEXT,
  theme TEXT DEFAULT 'dark-purple',
  design JSONB DEFAULT '{}',
  products JSONB DEFAULT '[]',
  links JSONB DEFAULT '[]',
  testimonials JSONB DEFAULT '[]',
  blocks JSONB DEFAULT '[]',
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Events table (analytics tracking)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vitrine_id UUID REFERENCES public.vitrines(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  referrer TEXT,
  country TEXT,
  city TEXT,
  device TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_vitrine ON public.events(vitrine_id, created_at);

-- 3. Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_vitrine_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vitrine_updated ON public.vitrines;
CREATE TRIGGER trg_vitrine_updated
  BEFORE UPDATE ON public.vitrines
  FOR EACH ROW EXECUTE FUNCTION public.update_vitrine_timestamp();

-- 4. RLS Policies
ALTER TABLE public.vitrines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Vitrines: public read for published, user CRUD own
CREATE POLICY IF NOT EXISTS "Public can read published vitrines"
  ON public.vitrines FOR SELECT
  USING (published = true);

CREATE POLICY IF NOT EXISTS "Users can manage own vitrine"
  ON public.vitrines FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Events: anonymous insert, owner read
CREATE POLICY IF NOT EXISTS "Anyone can insert events"
  ON public.events FOR INSERT
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Vitrine owner can read events"
  ON public.events FOR SELECT
  USING (
    vitrine_id IN (
      SELECT id FROM public.vitrines WHERE user_id = auth.uid()
    )
  );

-- 5. Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY IF NOT EXISTS "Avatar upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Avatar public read" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
CREATE POLICY IF NOT EXISTS "Product upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Product public read" ON storage.objects FOR SELECT
  USING (bucket_id = 'products');
`.trim();
