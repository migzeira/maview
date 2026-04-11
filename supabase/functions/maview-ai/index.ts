import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

const SYSTEM_PROMPT = `Você é a IA Maview, assistente especializado para criadores de conteúdo e empreendedores digitais brasileiros.

Seu objetivo é ajudar os usuários a:
- Criar bios profissionais e atraentes para redes sociais
- Escrever descrições persuasivas de produtos digitais (cursos, e-books, templates, mentorias)
- Desenvolver planos de conteúdo estratégicos para Instagram, TikTok e YouTube
- Gerar hashtags relevantes e de alta performance
- Criar legendas e textos de vendas com copywriting persuasivo
- Gerar prompts para criar imagens com DALL-E ou Midjourney
- Dar dicas de marketing digital e monetização online

Tom: direto, motivador, próximo e profissional. Use linguagem brasileira natural.
Formato: use markdown quando necessário (negrito, listas), mas mantenha as respostas concisas e acionáveis.
Sempre termine com uma dica prática ou próximo passo quando relevante.`;

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }

  try {
    const { message, history = [] } = await req.json();

    // Input validation
    if (!message || typeof message !== "string" || message.length > 5000) {
      return new Response(
        JSON.stringify({ text: "Mensagem inválida. Máximo 5000 caracteres." }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }
    if (!Array.isArray(history) || history.length > 10) {
      return new Response(
        JSON.stringify({ text: "Histórico inválido." }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured", text: "⚠️ Chave da API OpenAI não configurada. Adicione OPENAI_API_KEY nas variáveis de ambiente do Supabase." }),
        { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Build messages array with history (last 6 messages for context)
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "OpenAI API error");
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "Não consegui gerar uma resposta. Tente novamente.";

    return new Response(
      JSON.stringify({ text }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("maview-ai error:", error);
    return new Response(
      JSON.stringify({ text: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente." }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
