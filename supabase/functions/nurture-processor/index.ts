import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

/**
 * Nurture Email Processor
 *
 * Scheduled via pg_cron to run hourly:
 *   SELECT cron.schedule('nurture-processor', '0 * * * *', $$
 *     SELECT net.http_post(
 *       url := '<SUPABASE_URL>/functions/v1/nurture-processor',
 *       headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb,
 *       body := '{}'::jsonb
 *     );
 *   $$);
 *
 * Processes the email_queue table:
 * - Finds unsent emails where send_at <= now()
 * - Sends each via send-email function
 * - Marks as sent
 *
 * SQL to create email_queue table:
 *   CREATE TABLE email_queue (
 *     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *     email TEXT NOT NULL,
 *     template TEXT NOT NULL,
 *     template_data JSONB DEFAULT '{}',
 *     send_at TIMESTAMPTZ NOT NULL,
 *     sent BOOLEAN DEFAULT false,
 *     sent_at TIMESTAMPTZ,
 *     created_at TIMESTAMPTZ DEFAULT now()
 *   );
 *   CREATE INDEX idx_email_queue_pending ON email_queue (send_at) WHERE sent = false;
 *   ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Nurture templates (hardcoded for MVP)
const NURTURE_TEMPLATES: Record<string, { subject: string; html: string }> = {
  getting_started: {
    subject: "Dica #1: Personalize sua vitrine em 5 minutos",
    html: `
      <h1>Comece a personalizar! 🎨</h1>
      <p>Sua vitrine está pronta, mas ainda tem muito potencial.</p>
      <hr class="divider">
      <p><strong>3 coisas para fazer agora:</strong></p>
      <ul>
        <li>📸 Adicione sua foto de perfil</li>
        <li>✍️ Escreva uma bio que chame atenção</li>
        <li>🎨 Escolha um tema que combine com você</li>
      </ul>
      <p>Leva menos de 5 minutos e faz toda diferença!</p>
      <a href="https://maview.app/dashboard" class="btn">Personalizar Agora →</a>
    `,
  },
  add_products: {
    subject: "Dica #2: Comece a vender na sua vitrine",
    html: `
      <h1>Hora de monetizar! 💰</h1>
      <p>Sabia que você pode vender produtos digitais direto pela sua vitrine? E o melhor: <strong>0% de taxa</strong>.</p>
      <hr class="divider">
      <p><strong>Ideias de produtos:</strong></p>
      <ul>
        <li>📚 E-books e guias</li>
        <li>🎓 Cursos e mentorias</li>
        <li>🎨 Templates e presets</li>
        <li>🎵 Músicas e beats</li>
      </ul>
      <p>Adicione seu primeiro produto em minutos.</p>
      <a href="https://maview.app/dashboard/monetizacao" class="btn">Adicionar Produto →</a>
    `,
  },
  first_week_report: {
    subject: "Sua primeira semana no Maview! 🎯",
    html: `
      <h1>1 semana com o Maview! 🎉</h1>
      <p>Parabéns por completar sua primeira semana! Aqui vão algumas dicas para acelerar seus resultados:</p>
      <hr class="divider">
      <p><strong>Próximos passos:</strong></p>
      <ul>
        <li>📊 Confira seus analytics e veja de onde vêm seus visitantes</li>
        <li>🔗 Compartilhe seu link em todas as redes sociais</li>
        <li>⚡ Configure automações para engajar seus leads</li>
        <li>🤖 Use a IA Maview para criar descrições e bios</li>
      </ul>
      <a href="https://maview.app/dashboard/analytics" class="btn">Ver Analytics →</a>
      <p style="font-size:13px;color:#9ca3af;margin-top:16px;">Dica: compartilhe seu link no WhatsApp, Instagram e TikTok para aumentar o tráfego!</p>
    `,
  },
};

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Find pending emails ready to send
    const { data: pending, error: qErr } = await admin
      .from("email_queue")
      .select("*")
      .eq("sent", false)
      .lte("send_at", new Date().toISOString())
      .limit(50); // Process max 50 per run to stay within rate limits

    if (qErr) throw qErr;
    if (!pending || pending.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    let processed = 0;
    let errors = 0;

    for (const item of pending) {
      try {
        // Build email content from template
        const templateKey = item.template;
        const template = NURTURE_TEMPLATES[templateKey];

        let emailPayload: Record<string, any>;

        if (template) {
          emailPayload = {
            to: item.email,
            template: "custom",
            subject: template.subject,
            html: template.html,
          };
        } else {
          // Fallback: use template name directly
          emailPayload = {
            to: item.email,
            template: templateKey,
            data: item.template_data || {},
          };
        }

        const emailRes = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailPayload),
        });

        if (emailRes.ok) {
          // Mark as sent
          await admin
            .from("email_queue")
            .update({ sent: true, sent_at: new Date().toISOString() })
            .eq("id", item.id);
          processed++;
        } else {
          errors++;
          console.error(`Failed to send email ${item.id}: ${await emailRes.text()}`);
        }
      } catch (itemErr) {
        errors++;
        console.error(`Error processing email_queue item ${item.id}:`, itemErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed, errors, total: pending.length }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("nurture-processor error:", error);
    return new Response(
      JSON.stringify({ error: "Erro no processamento de nurture" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
