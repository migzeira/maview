-- ═══════════════════════════════════════════════════════════════
-- MAVIEW — Email Queue + pg_cron Setup
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- 1. Create email_queue table
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  template TEXT NOT NULL,
  template_data JSONB DEFAULT '{}',
  send_at TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Index for efficient pending email queries
CREATE INDEX IF NOT EXISTS idx_email_queue_pending
  ON email_queue (send_at)
  WHERE sent = false;

-- 3. Enable RLS
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Allow authenticated users to insert their own emails only
CREATE POLICY "users_can_insert_own_queue"
  ON email_queue FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to read their own queue items
CREATE POLICY "users_can_read_own_queue"
  ON email_queue FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Only service role can do everything (for the processor)
CREATE POLICY "service_role_full_access"
  ON email_queue FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- NOTE: Anon insert removed for security. Nurture emails are now
-- enqueued after signup when user is authenticated. If you need to
-- enqueue during signup before auth completes, use a Supabase Edge
-- Function with service_role key instead.


-- ═══════════════════════════════════════════════════════════════
-- pg_cron SETUP (requires pg_cron extension enabled)
-- Go to: Supabase Dashboard > Database > Extensions > Enable pg_cron
-- Then run these:
-- ═══════════════════════════════════════════════════════════════

-- Enable pg_net extension (for HTTP calls from cron)
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule nurture processor: every hour
-- SELECT cron.schedule(
--   'nurture-processor',
--   '0 * * * *',
--   $$
--   SELECT net.http_post(
--     url := 'YOUR_SUPABASE_URL/functions/v1/nurture-processor',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
--       'Content-Type', 'application/json'
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );

-- Schedule weekly report: every Monday at 9am UTC
-- SELECT cron.schedule(
--   'weekly-report',
--   '0 9 * * 1',
--   $$
--   SELECT net.http_post(
--     url := 'YOUR_SUPABASE_URL/functions/v1/weekly-report',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
--       'Content-Type', 'application/json'
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );

-- ═══════════════════════════════════════════════════════════════
-- DATABASE WEBHOOKS (configure in Supabase Dashboard)
-- Go to: Database > Webhooks > Create
--
-- Webhook 1: automation-runner-orders
--   Table: orders
--   Events: INSERT
--   URL: YOUR_SUPABASE_URL/functions/v1/automation-runner
--   Headers: Authorization: Bearer YOUR_SERVICE_ROLE_KEY
--
-- Webhook 2: automation-runner-leads
--   Table: leads
--   Events: INSERT
--   URL: YOUR_SUPABASE_URL/functions/v1/automation-runner
--   Headers: Authorization: Bearer YOUR_SERVICE_ROLE_KEY
-- ═══════════════════════════════════════════════════════════════
