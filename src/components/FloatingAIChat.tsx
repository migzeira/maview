import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Send, SquarePen, Package, ImageIcon, ArrowUp } from "lucide-react";
import logoSrc from "@/assets/maview-logo.png";
import robotImg from "@/assets/maview-robot-transparent.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_ACTIONS = [
  { label: "Criar Produto",       icon: Package,    prompt: "Me ajude a criar um produto digital para vender na minha vitrine. Quero sugestões de nome, descrição e preço." },
  { label: "Post de Marketing",   icon: ImageIcon,  prompt: "Crie uma legenda persuasiva para um post de divulgação da minha vitrine digital no Instagram. Use emojis e finalize com CTA." },
];

const FloatingAIChat = ({ onClose }: { onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("maview-ai", {
        body: { message: text.trim(), history: messages.slice(-4) },
      });
      if (error) throw error;
      setMessages(prev => [...prev, { role: "assistant", content: data?.text || "Tente novamente." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Erro ao conectar com a IA. Verifique sua conexão e tente novamente." }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    /* Backdrop blur overlay */
    <div className="fixed inset-0 z-[100] flex items-end justify-end p-4 md:p-6 pointer-events-none">
      <div
        className="pointer-events-auto w-[340px] rounded-3xl overflow-hidden shadow-[0_24px_80px_rgba(109,40,217,0.25)] border border-white/60"
        style={{ height: "560px", display: "flex", flexDirection: "column" }}
      >

        {/* ── Header ── */}
        <div
          className="relative flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #1a0533 0%, #2d1060 50%, #1e0a4a 100%)" }}
        >
          {/* Logo watermark in header */}
          <img
            src={logoSrc}
            alt=""
            className="absolute left-1/2 -translate-x-1/2 opacity-[0.07] pointer-events-none select-none"
            style={{ width: 120, height: 120, top: -30, objectFit: "contain", filter: "brightness(3)" }}
          />

          <div className="flex items-center gap-2.5 relative z-10">
            <img src={robotImg} alt="IA" className="w-8 h-8 object-contain" />
            <div>
              <p className="text-white text-[13px] font-bold leading-none">IA Maview</p>
              <p className="text-purple-300 text-[10px] mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
                Online agora
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 relative z-10">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-1.5 rounded-xl text-purple-300 hover:text-white hover:bg-white/10 transition-all"
                title="Nova conversa"
              >
                <SquarePen size={14} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-purple-300 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Chat body ── */}
        <div
          className="flex-1 overflow-y-auto relative"
          style={{ background: "#f5f3ff" }}
        >
          {/* Maview logo watermark centered */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <img
              src={logoSrc}
              alt=""
              className="w-48 opacity-[0.045]"
              style={{ objectFit: "contain", filter: "saturate(0)" }}
            />
          </div>

          <div className="relative z-10 p-4 space-y-3 h-full">
            {messages.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-start justify-end h-full pb-2 gap-3">
                <div className="flex items-center gap-2">
                  <img src={robotImg} alt="" className="w-7 h-7 object-contain opacity-60" />
                  <p className="text-[#4c1d95] font-bold text-[15px]">Como posso ajudar?</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_ACTIONS.map(({ label, icon: Icon, prompt }) => (
                    <button
                      key={label}
                      onClick={() => send(prompt)}
                      disabled={loading}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-purple-100 shadow-sm text-[12px] font-semibold text-[#4c1d95] hover:bg-purple-50 hover:border-purple-200 transition-all"
                    >
                      <Icon size={13} className="text-purple-500" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Messages */
              <>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <img src={robotImg} alt="" className="w-6 h-6 object-contain mr-1.5 flex-shrink-0 mt-1 opacity-80" />
                    )}
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap shadow-sm ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-[#6d28d9] to-[#8b5cf6] text-white rounded-br-sm"
                          : "bg-white text-gray-700 rounded-bl-sm border border-purple-50"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start items-center gap-1.5">
                    <img src={robotImg} alt="" className="w-6 h-6 object-contain mr-1 opacity-80" />
                    <div className="bg-white border border-purple-50 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1.5">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </>
            )}
          </div>
        </div>

        {/* ── Input ── */}
        <div
          className="flex-shrink-0 p-3 border-t border-purple-100"
          style={{ background: "#ffffff" }}
        >
          <div className="flex items-end gap-2 bg-[#f5f3ff] rounded-2xl px-3 py-2 border border-purple-100">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Pergunte à IA Maview..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none leading-relaxed"
              style={{ maxHeight: 80 }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6d28d9] to-[#8b5cf6] flex items-center justify-center flex-shrink-0 disabled:opacity-30 hover:opacity-90 transition-all shadow-sm"
            >
              <ArrowUp size={14} className="text-white" />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-1.5">
            A IA pode cometer erros. Revise antes de publicar.
          </p>
        </div>

      </div>
    </div>
  );
};

export default FloatingAIChat;
