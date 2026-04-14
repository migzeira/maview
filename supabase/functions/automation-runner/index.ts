import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

/**
 * Automation Runner Edge Function
 *
 * Called by Supabase Database Webhooks on:
 * - INSERT on `orders` (trigger_type = 'compra')
 * - INSERT on `leads` (trigger_type = 'lead')
 *
 * For each matching active automation, executes the configured action:
 * - email: sends email via send-email function
 * - redirecionar: stores redirect_url in record metadata
 * - liberar: marks content as unlocked in record metadata
 *
 * Database Webhook setup (Supabase Dashboard > Database > Webhooks):
 *   Table: orders | Event: INSERT | HTTP POST to this function URL
 *   Table: leads  | Event: INSERT | HTTP POST to this function URL
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: Record<string, any>;
  schema: string;
  old_record?: Record<string, any>;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const payload: WebhookPayload = await req.json();
    const { table, record } = payload;

    if (!record?.vitrine_id) {
      return new Response(JSON.stringify({ skipped: true, reason: "No vitrine_id" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Determine trigger type based on table
    let triggerType: string;
    if (table === "orders") {
      // Only run for approved payments
      if (record.payment_status !== "approved") {
        return new Response(JSON.stringify({ skipped: true, reason: "Not approved" }), {
          headers: { "Content-Type": "application/json" },
        });
      }
      triggerType = "compra";
    } else if (table === "leads") {
      triggerType = "lead";
    } else {
      return new Response(JSON.stringify({ skipped: true, reason: `Unsupported table: ${table}` }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch active automations for this vitrine and trigger type
    const { data: automations, error: aErr } = await admin
      .from("automations")
      .select("*")
      .eq("vitrine_id", record.vitrine_id)
      .eq("trigger_type", triggerType)
      .eq("active", true);

    if (aErr) throw aErr;
    if (!automations || automations.length === 0) {
      return new Response(JSON.stringify({ skipped: true, reason: "No matching automations" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const results: { id: string; action: string; success: boolean; error?: string }[] = [];

    for (const automation of automations) {
      try {
        const config = automation.config as Record<string, any> || {};

        switch (automation.action_type) {
          case "email": {
            // Send email to buyer/lead
            const recipientEmail = record.buyer_email || record.email;
            if (!recipientEmail) {
              results.push({ id: automation.id, action: "email", success: false, error: "No recipient email" });
              break;
            }

            const emailTemplate = config.email_template || "custom";
            const customHtml = config.email_html || `<h1>${automation.name}</h1><p>${automation.description || "Obrigado!"}</p>`;
            const customSubject = config.email_subject || automation.name;

            await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                to: recipientEmail,
                template: emailTemplate === "custom" ? "custom" : emailTemplate,
                subject: customSubject,
                html: emailTemplate === "custom" ? customHtml : undefined,
                data: {
                  buyer_name: record.buyer_name || record.name || "",
                  product_title: record.product_title || "",
                  amount: record.amount ? `R$ ${(record.amount / 100).toFixed(2).replace(".", ",")}` : "",
                },
              }),
            });

            results.push({ id: automation.id, action: "email", success: true });
            break;
          }

          case "redirecionar": {
            // Store redirect URL in record metadata
            const redirectUrl = config.redirect_url;
            if (!redirectUrl) {
              results.push({ id: automation.id, action: "redirecionar", success: false, error: "No redirect_url configured" });
              break;
            }

            const metadataField = table === "orders" ? "metadata" : "metadata";
            const currentMeta = record[metadataField] || {};
            const newMeta = { ...currentMeta, redirect_url: redirectUrl, automation_id: automation.id };

            await admin
              .from(table)
              .update({ [metadataField]: newMeta })
              .eq("id", record.id);

            results.push({ id: automation.id, action: "redirecionar", success: true });
            break;
          }

          case "liberar": {
            // Unlock content by marking in metadata
            const contentId = config.content_id;
            const currentMeta = record.metadata || {};
            const newMeta = {
              ...currentMeta,
              unlocked_content: [...(currentMeta.unlocked_content || []), contentId].filter(Boolean),
              automation_id: automation.id,
            };

            await admin
              .from(table)
              .update({ metadata: newMeta })
              .eq("id", record.id);

            results.push({ id: automation.id, action: "liberar", success: true });
            break;
          }

          default:
            results.push({ id: automation.id, action: automation.action_type, success: false, error: "Unknown action type" });
        }
      } catch (autoErr: any) {
        console.error(`Automation ${automation.id} failed:`, autoErr);
        results.push({ id: automation.id, action: automation.action_type, success: false, error: autoErr.message });
      }
    }

    return new Response(
      JSON.stringify({ success: true, trigger: triggerType, automations_run: results.length, results }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("automation-runner error:", error);
    return new Response(
      JSON.stringify({ error: "Erro na execução de automações" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
