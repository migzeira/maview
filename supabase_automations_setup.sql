-- ══════════════════════════════════════════════════════════════
-- Maview: Automations table
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ══════════════════════════════════════════════════════════════

-- 1. Create automations table
CREATE TABLE IF NOT EXISTS public.automations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vitrine_id UUID REFERENCES public.vitrines(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('compra', 'lead', 'visualizacao')),
  action_type TEXT NOT NULL CHECK (action_type IN ('email', 'liberar', 'redirecionar')),
  active BOOLEAN DEFAULT true,
  description TEXT DEFAULT '',
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Index for fast lookups by vitrine
CREATE INDEX IF NOT EXISTS idx_automations_vitrine ON public.automations(vitrine_id);
CREATE INDEX IF NOT EXISTS idx_automations_active ON public.automations(vitrine_id, active) WHERE active = true;

-- 3. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_automations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS automations_updated_at ON public.automations;
CREATE TRIGGER automations_updated_at
  BEFORE UPDATE ON public.automations
  FOR EACH ROW EXECUTE FUNCTION update_automations_updated_at();

-- 4. Enable RLS
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: owner-only via vitrine ownership
-- Read own automations
CREATE POLICY "owner_read_automations"
  ON public.automations FOR SELECT
  USING (
    vitrine_id IN (
      SELECT id FROM public.vitrines WHERE user_id = auth.uid()
    )
  );

-- Insert own automations
CREATE POLICY "owner_insert_automations"
  ON public.automations FOR INSERT
  WITH CHECK (
    vitrine_id IN (
      SELECT id FROM public.vitrines WHERE user_id = auth.uid()
    )
  );

-- Update own automations
CREATE POLICY "owner_update_automations"
  ON public.automations FOR UPDATE
  USING (
    vitrine_id IN (
      SELECT id FROM public.vitrines WHERE user_id = auth.uid()
    )
  );

-- Delete own automations
CREATE POLICY "owner_delete_automations"
  ON public.automations FOR DELETE
  USING (
    vitrine_id IN (
      SELECT id FROM public.vitrines WHERE user_id = auth.uid()
    )
  );

-- Admin access (same 3 admin emails from other tables)
CREATE POLICY "admin_read_all_automations"
  ON public.automations FOR SELECT
  USING (
    auth.jwt() ->> 'email' IN (
      'andre@maview.app',
      'admin@maview.app',
      'maview.suporte@gmail.com'
    )
  );
