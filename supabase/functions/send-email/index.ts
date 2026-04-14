import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const ALLOWED_ORIGINS = [
  "https://maview.lovable.app",
  "https://maview.app",
  "http://localhost:8080",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

/* ── Email templates ─────────────────────────────────────────── */

const BRAND_COLOR = "#7C3AED";
const BRAND_NAME = "Maview";

function wrapHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
  body { margin: 0; padding: 0; background: #f4f0ff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
  .card { background: #fff; border-radius: 16px; padding: 36px 28px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
  .logo { font-size: 22px; font-weight: 800; color: ${BRAND_COLOR}; letter-spacing: -0.5px; }
  h1 { font-size: 20px; color: #1a1a2e; margin: 24px 0 12px; }
  p { font-size: 15px; color: #4a4a6a; line-height: 1.6; margin: 8px 0; }
  .btn { display: inline-block; background: ${BRAND_COLOR}; color: #fff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 14px; margin: 20px 0; }
  .footer { text-align: center; margin-top: 28px; font-size: 12px; color: #9ca3af; }
  .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
  ul { padding-left: 20px; }
  li { margin: 6px 0; color: #4a4a6a; font-size: 14px; }
</style>
</head>
<body>
<div class="container">
  <div class="card">
    <div class="logo">✦ ${BRAND_NAME}</div>
    ${body}
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} ${BRAND_NAME} — Sua vitrine digital</p>
    <p>Você recebeu este email porque se cadastrou no Maview.</p>
  </div>
</div>
</body>
</html>`;
}

type TemplateName = "welcome" | "purchase_confirmation" | "new_lead" | "weekly_report" | "custom";

interface TemplateData {
  buyer_name?: string;
  product_title?: string;
  amount?: string;
  seller_name?: string;
  // Weekly report
  views?: number;
  clicks?: number;
  leads?: number;
  sales?: number;
  revenue?: string;
  period?: string;
  // Custom
  custom_html?: string;
}

function buildTemplate(template: TemplateName, data: TemplateData): { subject: string; html: string } {
  switch (template) {
    case "welcome":
      return {
        subject: `Bem-vindo ao ${BRAND_NAME}! 🎉`,
        html: wrapHtml(`Bem-vindo ao ${BRAND_NAME}`, `
          <h1>Bem-vindo ao ${BRAND_NAME}! 🎉</h1>
          <p>Estamos muito felizes em ter você aqui. Sua vitrine digital está pronta para ser personalizada!</p>
          <hr class="divider">
          <p><strong>3 passos para começar:</strong></p>
          <ul>
            <li>🎨 Personalize seu tema e cores</li>
            <li>📦 Adicione seus produtos digitais</li>
            <li>🔗 Compartilhe seu link nas redes sociais</li>
          </ul>
          <a href="https://maview.app/dashboard" class="btn">Ir para o Dashboard →</a>
          <p style="font-size:13px;color:#9ca3af;">Precisa de ajuda? Use a IA Maview no dashboard!</p>
        `),
      };

    case "purchase_confirmation":
      return {
        subject: `Compra confirmada! 🛍️`,
        html: wrapHtml("Compra confirmada", `
          <h1>Obrigado pela compra! 🛍️</h1>
          <p>Olá${data.buyer_name ? ` ${data.buyer_name}` : ""},</p>
          <p>Sua compra foi confirmada com sucesso.</p>
          <hr class="divider">
          <p><strong>Detalhes do pedido:</strong></p>
          <ul>
            <li>Produto: <strong>${data.product_title || "Produto digital"}</strong></li>
            <li>Valor: <strong>${data.amount || "—"}</strong></li>
            ${data.seller_name ? `<li>Vendedor: ${data.seller_name}</li>` : ""}
          </ul>
          <p>Se tiver qualquer dúvida, entre em contato com o vendedor.</p>
          <p style="font-size:13px;color:#9ca3af;">Email enviado via ${BRAND_NAME}</p>
        `),
      };

    case "new_lead":
      return {
        subject: `Novo lead capturado! 📩`,
        html: wrapHtml("Novo lead", `
          <h1>Você tem um novo lead! 📩</h1>
          <p>Alguém se cadastrou na sua vitrine.</p>
          <hr class="divider">
          <p><strong>Email:</strong> ${data.buyer_name || "—"}</p>
          <a href="https://maview.app/dashboard/clientes" class="btn">Ver Clientes →</a>
        `),
      };

    case "weekly_report":
      return {
        subject: `Seu relatório semanal ${BRAND_NAME} 📊`,
        html: wrapHtml("Relatório Semanal", `
          <h1>Relatório da Semana 📊</h1>
          <p>Aqui está o resumo da sua vitrine nos últimos 7 dias:</p>
          <hr class="divider">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:12px 8px;text-align:center;border-bottom:1px solid #e5e7eb;">
                <div style="font-size:24px;font-weight:700;color:#1a1a2e;">${data.views ?? 0}</div>
                <div style="font-size:12px;color:#9ca3af;">Visualizações</div>
              </td>
              <td style="padding:12px 8px;text-align:center;border-bottom:1px solid #e5e7eb;">
                <div style="font-size:24px;font-weight:700;color:#1a1a2e;">${data.clicks ?? 0}</div>
                <div style="font-size:12px;color:#9ca3af;">Cliques</div>
              </td>
              <td style="padding:12px 8px;text-align:center;border-bottom:1px solid #e5e7eb;">
                <div style="font-size:24px;font-weight:700;color:#1a1a2e;">${data.leads ?? 0}</div>
                <div style="font-size:12px;color:#9ca3af;">Leads</div>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 8px;text-align:center;">
                <div style="font-size:24px;font-weight:700;color:#7C3AED;">${data.sales ?? 0}</div>
                <div style="font-size:12px;color:#9ca3af;">Vendas</div>
              </td>
              <td colspan="2" style="padding:12px 8px;text-align:center;">
                <div style="font-size:24px;font-weight:700;color:#10b981;">${data.revenue || "R$ 0"}</div>
                <div style="font-size:12px;color:#9ca3af;">Receita</div>
              </td>
            </tr>
          </table>
          <a href="https://maview.app/dashboard/analytics" class="btn">Ver Dashboard Completo →</a>
        `),
      };

    case "custom":
      return {
        subject: data.product_title || `Mensagem do ${BRAND_NAME}`,
        html: wrapHtml(data.product_title || "Mensagem", data.custom_html || "<p>Sem conteúdo.</p>"),
      };

    default:
      return { subject: `${BRAND_NAME}`, html: wrapHtml(BRAND_NAME, "<p>Mensagem do Maview</p>") };
  }
}

/* ── Main handler ─────────────────────────────────────────────── */

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }

  try {
    const body = await req.json();

    // ── Enqueue nurture action (uses service_role to insert into email_queue) ──
    if (body.action === "enqueue_nurture") {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const admin = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { email: nurEmail, templates } = body;
      if (!nurEmail || !templates?.length) {
        return new Response(
          JSON.stringify({ error: "email and templates required" }),
          { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
        );
      }
      const now = Date.now();
      const rows = templates.map((t: { template: string; delay_hours: number }) => ({
        email: nurEmail,
        template: t.template,
        template_data: {},
        send_at: new Date(now + t.delay_hours * 3600000).toISOString(),
      }));
      const { error: insErr } = await admin.from("email_queue").insert(rows);
      if (insErr) {
        console.error("enqueue_nurture error:", insErr);
        return new Response(
          JSON.stringify({ error: "Failed to enqueue" }),
          { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ success: true, enqueued: rows.length }),
        { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const { to, template, data = {}, subject: customSubject, html: customHtml, from_name } = body;

    // Validate required fields
    if (!to || typeof to !== "string" || !to.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Email 'to' inválido" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Serviço de email não configurado" }),
        { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Build email content
    let emailSubject: string;
    let emailHtml: string;

    if (template && template !== "custom") {
      const built = buildTemplate(template as TemplateName, data);
      emailSubject = customSubject || built.subject;
      emailHtml = built.html;
    } else if (customHtml) {
      emailSubject = customSubject || `Mensagem do ${BRAND_NAME}`;
      emailHtml = wrapHtml(customSubject || BRAND_NAME, customHtml);
    } else {
      return new Response(
        JSON.stringify({ error: "Forneça 'template' ou 'html'" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Send via Resend API
    const senderName = from_name || BRAND_NAME;
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${senderName} <noreply@maview.app>`,
        to: [to],
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Resend API error:", err);
      return new Response(
        JSON.stringify({ error: "Falha ao enviar email", details: err }),
        { status: 502, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("send-email error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno no serviço de email" }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
