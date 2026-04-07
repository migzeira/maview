import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Bot, Send, Sparkles, RotateCcw, Copy, Check,
  FileText, ShoppingBag, Image, Hash, User, Lightbulb,
  ChevronDown, ChevronUp,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────── */
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/* ─── Prompt templates ──────────────────────────────────────── */
const TEMPLATES = [
  {
    category: "Perfil",
    icon: User,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    items: [
      {
        label: "Criar bio profissional",
        prompt: "Crie uma bio profissional e atraente para meu perfil de criador de conteúdo. Inclua um CTA para clicar no link. Tom: profissional mas próximo. Máximo 150 caracteres.",
      },
      {
        label: "Bio para Instagram",
        prompt: "Crie uma bio impactante para Instagram com emojis, linha de valor, e CTA para o link na bio. Máximo 150 caracteres.",
      },
    ],
  },
  {
    category: "Produto",
    icon: ShoppingBag,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    items: [
      {
        label: "Descrição de produto digital",
        prompt: "Crie uma descrição de vendas persuasiva para um produto digital (e-book, curso ou template). Inclua: problema que resolve, benefícios, para quem é, e CTA. Tom: direto e motivador.",
      },
      {
        label: "Título magnético para produto",
        prompt: "Crie 5 títulos magnéticos e persuasivos para um produto digital. Cada título deve gerar curiosidade e desejo de compra.",
      },
    ],
  },
  {
    category: "Conteúdo",
    icon: FileText,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    items: [
      {
        label: "Plano de conteúdo semanal",
        prompt: "Crie um plano de conteúdo para 7 dias para criador de conteúdo brasileiro. Inclua: tema do dia, formato sugerido (reels, carrossel, stories), e gancho de abertura para cada post.",
      },
      {
        label: "Legenda para post de venda",
        prompt: "Crie uma legenda para post de divulgação de produto digital no Instagram. Use storytelling, mostre o problema e a solução, e finalize com CTA direto. Tom: autêntico e persuasivo.",
      },
    ],
  },
  {
    category: "Hashtags",
    icon: Hash,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    items: [
      {
        label: "Hashtags para criador de conteúdo",
        prompt: "Sugira 30 hashtags estratégicas em português para criador de conteúdo digital no Instagram. Misture: nicho específico (alta conversão), médias (50k-500k posts) e grandes (500k+). Organize por categoria.",
      },
      {
        label: "Hashtags para produto digital",
        prompt: "Sugira 25 hashtags em português para divulgar um produto digital (curso, e-book ou mentoria). Foco em intenção de compra.",
      },
    ],
  },
  {
    category: "Imagem IA",
    icon: Image,
    color: "text-fuchsia-600",
    bg: "bg-fuchsia-50",
    border: "border-fuchsia-200",
    items: [
      {
        label: "Prompt para capa de produto",
        prompt: "Crie um prompt detalhado em inglês para gerar com DALL-E ou Midjourney uma capa profissional para produto digital. Estilo: minimalista moderno, cores vibrantes, tipografia clean.",
      },
      {
        label: "Prompt para foto de perfil",
        prompt: "Crie um prompt detalhado em inglês para gerar com DALL-E uma foto de perfil profissional para criador de conteúdo. Estilo: moderno, confiante, fundo neutro ou gradiente.",
      },
    ],
  },
];

/* ─── Helper ─────────────────────────────────────────────────── */
const formatTime = (d: Date) =>
  d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

/* ─── Component ─────────────────────────────────────────────── */
const DashboardIA = () => {
  const [messages, setMessages]         = useState<Message[]>([]);
  const [input, setInput]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [copiedIndex, setCopiedIndex]   = useState<number | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>("Perfil");
  const messagesEndRef                  = useRef<HTMLDivElement>(null);
  const textareaRef                     = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* auto-resize textarea */
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
    }
  }, [input]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("maview-ai", {
        body: { message: text.trim(), history: messages.slice(-6) },
      });

      if (error) throw error;

      const assistantMsg: Message = {
        role: "assistant",
        content: data?.text || "Desculpe, não consegui processar sua mensagem. Tente novamente.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Ops! A IA está sendo configurada. Para ativar, adicione sua chave OpenAI nas configurações do Supabase (secret: OPENAI_API_KEY).",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10">

      {/* ── Header ── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-[22px] font-extrabold text-[hsl(var(--dash-text))] tracking-tight">IA Maview</h1>
            <p className="text-[hsl(var(--dash-text-subtle))] text-xs">Seu assistente de criação e vendas</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-6 items-start">

        {/* ── Templates sidebar ── */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[hsl(var(--dash-border-subtle))]">
            <div className="flex items-center gap-2">
              <Lightbulb size={14} className="text-amber-500" />
              <p className="text-[13px] font-semibold text-[hsl(var(--dash-text))]">Templates prontos</p>
            </div>
            <p className="text-[11px] text-[hsl(var(--dash-text-subtle))] mt-0.5">Clique para usar no chat</p>
          </div>

          <div className="divide-y divide-[hsl(var(--dash-border-subtle))]">
            {TEMPLATES.map(({ category, icon: Icon, color, bg, border, items }) => (
              <div key={category}>
                <button
                  onClick={() => setOpenCategory(openCategory === category ? null : category)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[hsl(var(--dash-surface-2))] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
                      <Icon size={13} className={color} />
                    </div>
                    <span className="text-[13px] font-medium text-[hsl(var(--dash-text-secondary))]">{category}</span>
                  </div>
                  {openCategory === category
                    ? <ChevronUp size={13} className="text-[hsl(var(--dash-text-subtle))]" />
                    : <ChevronDown size={13} className="text-[hsl(var(--dash-text-subtle))]" />
                  }
                </button>

                {openCategory === category && (
                  <div className={`px-4 pb-3 space-y-2`}>
                    {items.map(({ label, prompt }) => (
                      <button
                        key={label}
                        onClick={() => sendMessage(prompt)}
                        disabled={loading}
                        className={`w-full text-left px-3 py-2.5 rounded-xl border ${border} bg-white hover:bg-[hsl(var(--dash-surface-2))] transition-all text-[12px] text-[hsl(var(--dash-text-secondary))] font-medium disabled:opacity-50`}
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles size={11} className={color} />
                          {label}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Chat area ── */}
        <div className="glass-card rounded-2xl flex flex-col" style={{ height: "calc(100vh - 180px)", minHeight: "520px" }}>

          {/* Chat header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[hsl(var(--dash-border-subtle))] flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
                  <Bot size={14} className="text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[hsl(var(--dash-text))]">IA Maview</p>
                <p className="text-[11px] text-emerald-500 font-medium">Online</p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="flex items-center gap-1.5 text-[11px] text-[hsl(var(--dash-text-subtle))] hover:text-[hsl(var(--dash-text))] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-[hsl(var(--dash-surface-2))]"
              >
                <RotateCcw size={12} /> Limpar
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-100 to-purple-100 flex items-center justify-center">
                  <Bot size={28} className="text-fuchsia-500" />
                </div>
                <div>
                  <p className="text-[hsl(var(--dash-text))] font-semibold text-[16px]">Olá! Sou a IA Maview 👋</p>
                  <p className="text-[hsl(var(--dash-text-muted))] text-[13px] mt-1 max-w-[300px]">
                    Posso criar bios, descrições de produtos, planos de conteúdo e muito mais. Use os templates ou escreva sua pergunta!
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {["Criar minha bio", "Descrever um produto", "Plano de conteúdo"].map(q => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="text-[12px] px-3.5 py-1.5 rounded-full bg-[hsl(var(--dash-accent))] text-primary font-medium hover:bg-primary hover:text-white transition-all border border-primary/20"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-primary to-secondary text-white"
                      : "bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white"
                  }`}>
                    {msg.role === "user" ? "U" : <Bot size={14} />}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[75%] group`}>
                    <div className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-primary to-secondary text-white rounded-tr-sm"
                        : "bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text-secondary))] rounded-tl-sm border border-[hsl(var(--dash-border-subtle))]"
                    }`}>
                      {msg.content}
                    </div>
                    <div className={`flex items-center gap-2 mt-1 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <span className="text-[10px] text-[hsl(var(--dash-text-subtle))]">{formatTime(msg.timestamp)}</span>
                      {msg.role === "assistant" && (
                        <button
                          onClick={() => copyMessage(msg.content, i)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[hsl(var(--dash-text-subtle))] hover:text-primary"
                        >
                          {copiedIndex === i ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Loading bubble */}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))]">
                  <div className="flex gap-1.5 items-center h-4">
                    <span className="w-2 h-2 bg-fuchsia-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 p-4 border-t border-[hsl(var(--dash-border-subtle))]">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(input);
                    }
                  }}
                  placeholder="Escreva sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
                  rows={1}
                  className="w-full resize-none px-4 py-3 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] focus:border-primary/40 focus:outline-none text-[13px] text-[hsl(var(--dash-text))] placeholder:text-[hsl(var(--dash-text-subtle))] transition-all"
                  style={{ maxHeight: "160px" }}
                />
              </div>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:opacity-90 transition-opacity shadow-sm"
              >
                <Send size={16} className="text-white" />
              </button>
            </div>
            <p className="text-[11px] text-[hsl(var(--dash-text-subtle))] mt-2 text-center">
              A IA pode cometer erros. Revise o conteúdo antes de publicar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardIA;
