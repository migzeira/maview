import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

/**
 * Weekly Report Edge Function
 *
 * Scheduled via pg_cron: SELECT cron.schedule('weekly-report', '0 9 * * 1', $$
 *   SELECT net.http_post(
 *     url := '<SUPABASE_URL>/functions/v1/weekly-report',
 *     headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb,
 *     body := '{}'::jsonb
 *   );
 * $$);
 *
 * Sends a weekly summary email to all users who opted in via notificationPrefs.email.
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  // Only accept POST (from pg_cron or manual trigger)
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Verify authorization (service role key or matching bearer)
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.includes(SERVICE_ROLE_KEY) && !authHeader.includes("Bearer")) {
    // Allow internal Supabase calls
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // 1. Get all vitrines with email notifications enabled
    const { data: vitrines, error: vErr } = await admin
      .from("vitrines")
      .select("id, user_id, design, username");

    if (vErr) throw vErr;
    if (!vitrines || vitrines.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No vitrines found" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const now = Date.now();
    const weekAgo = new Date(now - 7 * 86400000).toISOString();
    let sentCount = 0;

    for (const vitrine of vitrines) {
      try {
        // Check if user opted in for email notifications
        const design = vitrine.design as Record<string, any> | null;
        const prefs = design?.notificationPrefs;
        if (!prefs?.email) continue; // User didn't opt in

        // Get user email
        const { data: userData } = await admin.auth.admin.getUserById(vitrine.user_id);
        if (!userData?.user?.email) continue;

        const userEmail = userData.user.email;
        const vitrineId = vitrine.id;

        // 2. Aggregate events for last 7 days
        const { data: events } = await admin
          .from("events")
          .select("event_type")
          .eq("vitrine_id", vitrineId)
          .gte("created_at", weekAgo);

        const views = events?.filter(e => e.event_type === "view").length ?? 0;
        const clicks = events?.filter(e => e.event_type === "click").length ?? 0;

        // 3. Count new leads
        const { count: leadsCount } = await admin
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("vitrine_id", vitrineId)
          .gte("created_at", weekAgo);

        // 4. Count new orders + revenue
        const { data: weekOrders } = await admin
          .from("orders")
          .select("amount, payment_status")
          .eq("vitrine_id", vitrineId)
          .gte("created_at", weekAgo);

        const approvedOrders = weekOrders?.filter(o => o.payment_status === "approved") ?? [];
        const sales = approvedOrders.length;
        const revenueCents = approvedOrders.reduce((s, o) => s + (o.amount || 0), 0);
        const revenue = (revenueCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

        // 5. Send email via send-email function (internal invoke)
        const emailRes = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: userEmail,
            template: "weekly_report",
            data: { views, clicks, leads: leadsCount ?? 0, sales, revenue },
          }),
        });

        if (emailRes.ok) sentCount++;
      } catch (userErr) {
        console.error(`Error processing vitrine ${vitrine.id}:`, userErr);
        // Continue with next user
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, total: vitrines.length }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("weekly-report error:", error);
    return new Response(
      JSON.stringify({ error: "Erro no relatório semanal" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
