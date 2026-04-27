import { useEffect, useState } from "react";
import { X, Copy, Check, ExternalLink, Sparkles } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   FirstPublishCelebration — modal de celebração da primeira publicação

   Triggered when:
   - usuário completa onboarding
   - tem health > 50% (vitrine pronta)
   - localStorage.maview_first_publish_done !== "1"

   Features:
   - Confetti animado canvas-free (puro CSS)
   - Modal premium com gradient
   - Compartilhamento pré-preenchido: WhatsApp / Instagram / Copiar link
   - Some após dismissed e nunca mais aparece
   ═══════════════════════════════════════════════════════════════════════════ */

interface Props {
  username: string;
  displayName?: string;
  onClose: () => void;
}

const STORAGE_KEY = "maview_first_publish_done";

/* Trigger helper — chamado de qualquer lugar */
export function shouldShowFirstPublish(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== "1";
}

export function markFirstPublishDone() {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, "1");
}

/* Confetti particle component (puro CSS, sem dependência) */
function Confetti() {
  const colors = ["#a855f7", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"];
  const particles = Array.from({ length: 60 }, (_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 2;
    const duration = 2 + Math.random() * 2;
    const size = 6 + Math.random() * 8;
    const color = colors[i % colors.length];
    const rotate = Math.random() * 360;
    return { left, delay, duration, size, color, rotate, i };
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <div
          key={p.i}
          className="absolute top-0 rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
            transform: `rotate(${p.rotate}deg)`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function FirstPublishCelebration({ username, displayName, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const profileUrl = `${window.location.origin}/${(username || "").replace(/^@/, "")}`;
  const cleanUsername = (username || "").replace(/^@/, "");
  const name = displayName || cleanUsername;

  useEffect(() => {
    /* Mark done immediately so doesn't reappear on accidental close */
    markFirstPublishDone();
    /* Lock body scroll */
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`🎉 Acabei de criar minha vitrine no Maview! Confira aqui: ${profileUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareInstagram = () => {
    /* Instagram não tem URL share nativa, então copiamos + abre IG stories */
    handleCopy();
    window.open("https://www.instagram.com/", "_blank");
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* Confetti rain */}
      <Confetti />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-gradient-to-br from-[hsl(var(--dash-surface))] via-[hsl(var(--dash-surface))] to-primary/5 border border-primary/20 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full text-[hsl(var(--dash-text-subtle))] hover:text-[hsl(var(--dash-text))] hover:bg-[hsl(var(--dash-surface-2))] transition-all"
        >
          <X size={18} />
        </button>

        {/* Header com gradient */}
        <div className="relative h-[140px] overflow-hidden bg-gradient-to-br from-primary via-purple-600 to-pink-600 flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent_50%)]" />
          <div className="relative animate-in zoom-in-50 duration-700 delay-200">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-5xl shadow-2xl">
              🎉
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-7 text-center">
          <h2 className="text-[24px] font-extrabold text-[hsl(var(--dash-text))] tracking-tight">
            Sua vitrine está no ar!
          </h2>
          <p className="text-[14px] text-[hsl(var(--dash-text-muted))] mt-2 leading-relaxed">
            Parabéns, <strong>{name}</strong>! Agora é hora de espalhar pelo mundo. <br />
            Compartilhe seu link e comece a vender.
          </p>

          {/* URL display + copy */}
          <button
            onClick={handleCopy}
            className="w-full mt-5 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border))] hover:border-primary/40 transition-all group"
          >
            <span className="text-[13px] font-mono text-[hsl(var(--dash-text))] truncate">
              {profileUrl.replace(/^https?:\/\//, "")}
            </span>
            <span className="flex-shrink-0 flex items-center gap-1.5 text-[12px] font-semibold text-primary">
              {copied ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar</>}
            </span>
          </button>

          {/* Share buttons */}
          <div className="grid grid-cols-2 gap-2.5 mt-3">
            <button
              onClick={shareWhatsApp}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-[13px] transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-500/30"
            >
              💬 WhatsApp
            </button>
            <button
              onClick={shareInstagram}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 hover:opacity-90 text-white font-semibold text-[13px] transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-pink-500/30"
            >
              📸 Instagram
            </button>
          </div>

          {/* Open in new tab */}
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[hsl(var(--dash-text))] hover:bg-[hsl(var(--dash-text))]/90 text-[hsl(var(--dash-bg))] font-semibold text-[13px] transition-all hover:scale-[1.02] active:scale-95"
          >
            <ExternalLink size={14} />
            Abrir minha vitrine
          </a>

          {/* Stats encouragement */}
          <div className="mt-5 pt-5 border-t border-[hsl(var(--dash-border-subtle))] flex items-center justify-center gap-1.5 text-[11px] text-[hsl(var(--dash-text-subtle))]">
            <Sparkles size={12} className="text-primary" />
            <span>Criadores que compartilham na primeira hora vendem 3x mais</span>
          </div>

          {/* Continue */}
          <button
            onClick={onClose}
            className="mt-5 text-[12px] text-[hsl(var(--dash-text-subtle))] hover:text-[hsl(var(--dash-text))] transition-colors"
          >
            Continuar editando
          </button>
        </div>
      </div>
    </div>
  );
}
