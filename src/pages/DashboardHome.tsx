import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  CheckCircle2, Circle, ArrowRight,
  Copy, Check, ExternalLink,
  QrCode, X, Download, MessageCircle, Clock,
  Sparkles, Package, Link2, Star, Image, FileText,
  Trophy, Share2, BarChart3, PartyPopper,
} from "lucide-react";

/* ── localStorage ──────────────────────────────────────────── */
const LS_KEY = "maview_vitrine_config";
function loadVitrine() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; }
}

/* ── Health ─────────────────────────────────────────────────── */
interface HealthStep {
  key: string;
  label: string;
  tip: string;
  points: number;
  done: boolean;
  path: string;
}

function buildHealthSteps(cfg: Record<string, unknown>): HealthStep[] {
  const products = ((cfg.products as { active: boolean }[]) || []).filter(p => p.active);
  const links = ((cfg.links as unknown[]) || []);
  const testimonials = ((cfg.testimonials as unknown[]) || []);
  return [
    { key: "avatar", label: "Foto de perfil", tip: "Perfis com foto recebem 80% mais cliques", points: 15, done: !!cfg.avatarUrl, path: "/dashboard/pagina" },
    { key: "bio", label: "Nome e bio", tip: "Complete para gerar confiança", points: 10, done: !!(cfg.displayName && cfg.bio), path: "/dashboard/pagina" },
    { key: "theme", label: "Tema escolhido", tip: "Visual consistente reforça sua marca", points: 10, done: !!cfg.theme, path: "/dashboard/pagina" },
    { key: "product", label: "Primeiro produto", tip: "Produtos geram receita direta", points: 20, done: products.length > 0, path: "/dashboard/pagina" },
    { key: "links", label: "Links adicionados", tip: "Conecte suas redes sociais", points: 15, done: links.length > 0, path: "/dashboard/pagina" },
    { key: "testimonials", label: "Depoimento", tip: "Prova social aumenta conversão em 72%", points: 15, done: testimonials.length > 0, path: "/dashboard/pagina" },
    { key: "whatsapp", label: "WhatsApp", tip: "Contato direto converte 3x mais", points: 15, done: !!cfg.whatsapp, path: "/dashboard/pagina" },
  ];
}

/* ── Greeting ──────────────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

/* ── Theme map ─────────────────────────────────────────────── */
const THEMES: Record<string, { bg: string; accent: string; accent2: string }> = {
  "dark-purple": { bg: "#080612", accent: "#a855f7", accent2: "#ec4899" },
  "midnight":    { bg: "#05080f", accent: "#60a5fa", accent2: "#818cf8" },
  "forest":      { bg: "#050f05", accent: "#4ade80", accent2: "#34d399" },
  "rose":        { bg: "#100509", accent: "#f43f5e", accent2: "#fb7185" },
  "amber":       { bg: "#0f0a00", accent: "#f59e0b", accent2: "#fcd34d" },
  "ocean":       { bg: "#020c14", accent: "#06b6d4", accent2: "#22d3ee" },
};

/* ══ COMPONENT ═════════════════════════════════════════════ */
const DashboardHome = () => {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [cfg, setCfg] = useState<Record<string, unknown>>({});
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const profileUrl = username ? `${window.location.origin}/${username.replace(/^@/, "")}` : "";
  const displayUrl = username ? `maview.app/${username.replace(/^@/, "")}` : "";

  /* ── Load ── */
  useEffect(() => {
    const stored = loadVitrine();
    setCfg(stored);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const m = session.user.user_metadata;
        setDisplayName(
          (stored.displayName as string) || m?.full_name ||
          session.user.email?.split("@")[0] || "Criador"
        );
        setUsername(
          (stored.username as string) || m?.username ||
          session.user.email?.split("@")[0] || ""
        );
      }
    });
    setTimeout(() => setVisible(true), 60);
  }, []);

  /* ── QR code ── */
  useEffect(() => {
    if (!showQR || !qrCanvasRef.current || !profileUrl) return;
    import("qrcode").then(QRCode => {
      QRCode.toCanvas(qrCanvasRef.current!, profileUrl, {
        width: 188, margin: 2, color: { dark: "#1a0533", light: "#ffffff" },
      });
    }).catch(() => {});
  }, [showQR, profileUrl]);

  /* ── Derived ── */
  const steps = buildHealthSteps(cfg);
  const health = steps.reduce((s, st) => s + (st.done ? st.points : 0), 0);
  const doneCount = steps.filter(s => s.done).length;
  const nextStep = steps.find(s => !s.done);

  /* ── Animated health counter ── */
  const [animatedHealth, setAnimatedHealth] = useState(0);
  const prevHealthRef = useRef(0);
  const [milestone, setMilestone] = useState<number | null>(null);

  useEffect(() => {
    const from = prevHealthRef.current;
    const to = health;
    if (from === to) { setAnimatedHealth(to); return; }

    const duration = 800;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setAnimatedHealth(Math.round(from + (to - from) * eased));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);

    // Milestone celebrations
    if (to >= 50 && from < 50) setMilestone(50);
    else if (to >= 80 && from < 80) setMilestone(80);
    else if (to >= 100 && from < 100) setMilestone(100);

    prevHealthRef.current = to;
  }, [health]);

  // Auto-dismiss milestone
  useEffect(() => {
    if (milestone === null) return;
    const t = setTimeout(() => setMilestone(null), 3500);
    return () => clearTimeout(t);
  }, [milestone]);

  const products = ((cfg.products as { active: boolean; emoji?: string; title?: string; price?: string }[]) || []).filter(p => p.active);
  const links = ((cfg.links as { title?: string; url?: string; icon?: string; active?: boolean; type?: string }[]) || []);
  const testimonials = ((cfg.testimonials as { name?: string; text?: string; stars?: number }[]) || []);
  const blocks = ((cfg.blocks as { id: string; type: string; refId?: string; title?: string }[]) || []);

  const theme = THEMES[(cfg.theme as string)] || THEMES["dark-purple"];

  const healthColor = health >= 80 ? "#10b981" : health >= 50 ? "#a855f7" : health >= 20 ? "#f59e0b" : "#94a3b8";

  /* SVG ring */
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (health / 100) * circ;

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const downloadQR = () => {
    if (!qrCanvasRef.current) return;
    const a = document.createElement("a");
    a.download = `maview-qr-${username}.png`;
    a.href = qrCanvasRef.current.toDataURL();
    a.click();
  };

  /* ── Smart subtitle based on progress ── */
  const getSubtitle = () => {
    if (health === 100) return "Sua vitrine está completa. Hora de compartilhar!";
    if (health >= 80) return "Quase perfeita — finalize os últimos detalhes";
    if (health >= 50) return "Bom progresso! Continue construindo";
    if (nextStep) return nextStep.tip;
    return "Vamos montar sua vitrine?";
  };

  return (
    <div className={`max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10 page-enter transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}>

      {/* ── Greeting ── */}
      <div className="mb-6" style={{ animation: "fadeSlideUp 0.4s ease both" }}>
        <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">
          {getGreeting()}, {displayName.split(" ")[0]}
        </h1>
        <p className="text-[hsl(var(--dash-text-muted))] text-[14px] mt-1">{getSubtitle()}</p>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6" style={{ animation: "fadeSlideUp 0.45s ease 0.05s both" }}>

        {/* ══ LEFT COLUMN ══ */}
        <div className="space-y-5 min-w-0">

          {/* ── Progress card / Celebration card ── */}
          {health === 100 ? (
            /* ── Celebration: vitrine complete ── */
            <div className="glass-card rounded-2xl p-5 md:p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                  <Trophy size={22} className="text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-[hsl(var(--dash-text))] font-bold text-[16px]">Vitrine 100% completa!</h2>
                  <p className="text-[hsl(var(--dash-text-muted))] text-[12px] mt-0.5">Agora é hora de compartilhar e crescer</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={copyLink}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 transition-all text-[hsl(var(--dash-text-secondary))]">
                  <Share2 size={16} className="text-primary" />
                  <span className="text-[10px] font-medium">Compartilhar</span>
                </button>
                <Link to="/dashboard/audiencia"
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 transition-all text-[hsl(var(--dash-text-secondary))]">
                  <BarChart3 size={16} className="text-primary" />
                  <span className="text-[10px] font-medium">Analytics</span>
                </Link>
                <Link to="/dashboard/pagina"
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 transition-all text-[hsl(var(--dash-text-secondary))]">
                  <FileText size={16} className="text-primary" />
                  <span className="text-[10px] font-medium">Editar</span>
                </Link>
              </div>
            </div>
          ) : (
            /* ── Progress: health < 100 ── */
            <div className="glass-card rounded-2xl p-5 md:p-6">
              <div className="flex items-start gap-5">
                {/* Health ring */}
                <div className="flex-shrink-0">
                  <div className="relative w-[100px] h-[100px]">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r={r} fill="none"
                        stroke="hsl(var(--dash-surface-2))" strokeWidth="8" />
                      <circle cx="50" cy="50" r={r} fill="none"
                        stroke={healthColor} strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={circ} strokeDashoffset={offset}
                        style={{ transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[22px] font-extrabold text-[hsl(var(--dash-text))] leading-none tabular-nums">{animatedHealth}</span>
                      <span className="text-[9px] text-[hsl(var(--dash-text-muted))] font-medium mt-0.5">/100</span>
                    </div>
                  </div>
                </div>

                {/* Checklist */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[15px]">Complete sua vitrine</h2>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: healthColor + "18", color: healthColor }}>
                      {doneCount}/{steps.length}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {steps.map(step => (
                      <Link key={step.key} to={step.path}
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all group ${
                          step.done ? "opacity-50" : "hover:bg-[hsl(var(--dash-surface-2))]"
                        }`}>
                        {step.done
                          ? <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                          : <Circle size={15} className="text-[hsl(var(--dash-text-muted))] flex-shrink-0 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                        }
                        <span className={`text-[12px] flex-1 font-medium ${step.done ? "line-through text-[hsl(var(--dash-text-muted))]" : "text-[hsl(var(--dash-text-secondary))]"}`}>
                          {step.label}
                        </span>
                        {!step.done && (
                          <span className="text-[10px] text-[hsl(var(--dash-text-muted))] hidden sm:inline">+{step.points}pts</span>
                        )}
                        {!step.done && <ArrowRight size={11} className="text-[hsl(var(--dash-text-muted))] group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />}
                      </Link>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="h-1.5 rounded-full bg-[hsl(var(--dash-surface-2))] overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${health}%`, background: `linear-gradient(90deg, ${healthColor}, ${healthColor}cc)` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary CTA */}
              <Link to="/dashboard/pagina"
                className="mt-5 w-full btn-primary-gradient text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98]">
                <FileText size={16} />
                {nextStep ? `Próximo: ${nextStep.label}` : "Montar Vitrine"}
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* ── Share card ── */}
          {profileUrl && (
            <div className="glass-card rounded-2xl p-4 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[hsl(var(--dash-text))] text-[13px] font-semibold">Sua vitrine está no ar</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] mb-3">
                <p className="flex-1 text-[12px] text-[hsl(var(--dash-text-muted))] font-mono truncate">{displayUrl}</p>
                <button onClick={copyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 text-[11px] text-[hsl(var(--dash-text-secondary))] font-medium transition-all flex-shrink-0">
                  {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowQR(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 text-[12px] text-[hsl(var(--dash-text-secondary))] font-medium transition-all">
                  <QrCode size={14} /> QR Code
                </button>
                <a href={profileUrl} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl btn-primary-gradient text-[12px] font-medium transition-transform active:scale-95">
                  <ExternalLink size={14} /> Ver vitrine
                </a>
              </div>
            </div>
          )}

          {/* ── Quick stats (inline, not big cards) ── */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Produtos", val: products.length, icon: Package, color: "text-violet-500", bg: "bg-violet-50" },
              { label: "Links", val: links.length, icon: Link2, color: "text-blue-500", bg: "bg-blue-50" },
              { label: "Depoimentos", val: testimonials.length, icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
            ].map(({ label, val, icon: Icon, color, bg }) => (
              <Link key={label} to="/dashboard/pagina"
                className="glass-card rounded-xl p-3.5 hover:shadow-sm hover:scale-[1.02] transition-all group">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={14} className={color} />
                  </div>
                  <div>
                    <p className="text-[18px] font-bold text-[hsl(var(--dash-text))] leading-none">{val}</p>
                    <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mt-0.5">{label}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* ── IA teaser (subtle, not overwhelming) ── */}
          <Link to="/dashboard/ia"
            className="glass-card rounded-2xl p-4 flex items-center gap-4 group hover:shadow-md hover:border-fuchsia-200 transition-all">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500/15 to-violet-500/15 border border-fuchsia-200/50 flex items-center justify-center flex-shrink-0">
              <Sparkles size={18} className="text-fuchsia-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[hsl(var(--dash-text))] text-[13px] font-semibold">IA Maview</p>
              <p className="text-[hsl(var(--dash-text-subtle))] text-[11px]">Crie bios, descrições e conteúdo com IA</p>
            </div>
            <ArrowRight size={14} className="text-[hsl(var(--dash-text-subtle))] group-hover:text-fuchsia-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>
        </div>

        {/* ══ RIGHT COLUMN: Phone preview ══ */}
        <div className="hidden lg:block">
          <div className="sticky top-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[hsl(var(--dash-text-subtle))] text-xs font-medium uppercase tracking-wider">Preview</p>
              <Link to="/dashboard/pagina" className="text-[11px] text-primary font-medium flex items-center gap-1 hover:underline">
                Editar <ArrowRight size={10} />
              </Link>
            </div>

            {/* Phone mockup */}
            <div className="relative mx-auto" style={{ width: 310 }}>
              <div className="rounded-[2.8rem] border-[3px] border-[hsl(var(--dash-text))] overflow-hidden shadow-2xl flex flex-col"
                style={{ aspectRatio: "9/16" }}>
                {/* Status bar */}
                <div className="flex items-center justify-between px-6 pt-3 pb-1 flex-shrink-0" style={{ background: theme.bg }}>
                  <span className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="flex gap-[2px] items-end">
                      {[3, 4, 5, 6].map(h => (
                        <div key={h} className="w-[3px] rounded-sm" style={{ height: h, background: "rgba(255,255,255,0.7)" }} />
                      ))}
                    </div>
                    <div className="w-5 h-2.5 rounded-sm border ml-1 relative" style={{ borderColor: "rgba(255,255,255,0.5)" }}>
                      <div className="absolute inset-[2px] rounded-[1px]" style={{ background: "rgba(255,255,255,0.75)" }} />
                    </div>
                  </div>
                </div>

                {/* Dynamic Island */}
                <div className="flex justify-center pb-3 flex-shrink-0" style={{ background: theme.bg }}>
                  <div className="w-[88px] h-[26px] rounded-full bg-black" />
                </div>

                {/* Screen content */}
                <div className="flex-1 overflow-y-auto" style={{ background: `linear-gradient(160deg,${theme.bg} 60%,${theme.accent}18)` }}>
                  <div className="p-5">
                    {/* Profile */}
                    <div className="flex flex-col items-center mb-5">
                      <div className="w-14 h-14 rounded-full mb-2 overflow-hidden"
                        style={{ boxShadow: `0 0 0 2px ${theme.accent}40` }}>
                        {cfg.avatarUrl ? (
                          <img src={cfg.avatarUrl as string} alt="" className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg,${theme.accent},${theme.accent2})` }}>
                            <span className="text-white text-lg font-bold">
                              {(displayName || "M")[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="font-bold text-[12px] text-white">{(cfg.displayName as string) || displayName || "Seu Nome"}</p>
                      {(cfg.username || username) && (
                        <p className="text-[10px] mt-0.5" style={{ color: theme.accent }}>@{(cfg.username as string) || username}</p>
                      )}
                      {cfg.bio && (
                        <p className="text-[9px] text-center mt-1 px-3 line-clamp-2" style={{ color: "rgba(220,220,220,0.8)" }}>
                          {cfg.bio as string}
                        </p>
                      )}
                    </div>

                    {/* Render blocks if available, else show items directly */}
                    {blocks.length > 0 ? (
                      blocks.map(block => {
                        if (block.type === "product") {
                          const p = products.find(pr => pr.title && (pr as Record<string, unknown>).id === block.refId);
                          if (!p) return null;
                          return (
                            <div key={block.id} className="flex items-center gap-2 rounded-xl border p-2 mb-1.5"
                              style={{ borderColor: theme.accent + "30", background: theme.accent + "0a" }}>
                              <span className="text-[11px] flex-shrink-0">{p.emoji || "📦"}</span>
                              <span className="text-[9px] font-semibold text-white flex-1 truncate">{p.title}</span>
                              {p.price && <span className="text-[9px] font-bold" style={{ color: theme.accent }}>{p.price}</span>}
                            </div>
                          );
                        }
                        if (block.type === "link") {
                          const l = links.find(lk => (lk as Record<string, unknown>).id === block.refId);
                          if (!l) return null;
                          return (
                            <div key={block.id} className="flex items-center gap-2 rounded-xl border p-2 mb-1.5"
                              style={{ borderColor: theme.accent + "25", background: theme.accent + "08" }}>
                              <span className="text-[9px] truncate" style={{ color: "rgba(200,200,200,0.8)" }}>{l.title || l.url}</span>
                            </div>
                          );
                        }
                        if (block.type === "testimonial") {
                          const t = testimonials.find(te => (te as Record<string, unknown>).id === block.refId);
                          if (!t) return null;
                          return (
                            <div key={block.id} className="rounded-xl border p-2 mb-1.5"
                              style={{ borderColor: theme.accent + "20", background: theme.accent + "08" }}>
                              <p className="text-[9px] italic line-clamp-1" style={{ color: "rgba(200,200,200,0.85)" }}>"{t.text}"</p>
                              <p className="text-[8px] mt-0.5 font-semibold" style={{ color: theme.accent }}>— {t.name}</p>
                            </div>
                          );
                        }
                        if (block.type === "header") {
                          return (
                            <div key={block.id} className="flex items-center gap-2 mb-1.5">
                              <div className="flex-1 h-px" style={{ background: theme.accent + "30" }} />
                              <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: theme.accent + "90" }}>{block.title}</span>
                              <div className="flex-1 h-px" style={{ background: theme.accent + "30" }} />
                            </div>
                          );
                        }
                        return null;
                      })
                    ) : (
                      <>
                        {products.length > 0 ? products.slice(0, 3).map((p, i) => (
                          <div key={i} className="flex items-center gap-2 rounded-xl border p-2 mb-1.5"
                            style={{ borderColor: theme.accent + "30", background: theme.accent + "0a" }}>
                            <span className="text-[11px]">{p.emoji || "📦"}</span>
                            <span className="text-[9px] font-semibold text-white flex-1 truncate">{p.title}</span>
                            {p.price && <span className="text-[9px] font-bold" style={{ color: theme.accent }}>{p.price}</span>}
                          </div>
                        )) : (
                          <div className="rounded-xl border border-dashed p-3 mb-2 flex flex-col items-center gap-1"
                            style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                            <Package size={12} style={{ color: "rgba(255,255,255,0.35)" }} />
                            <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>Adicione produtos</p>
                          </div>
                        )}

                        {links.slice(0, 2).map((l, i) => (
                          <div key={i} className="rounded-xl border p-2 mb-1.5 text-center"
                            style={{ borderColor: theme.accent + "25", background: theme.accent + "08" }}>
                            <span className="text-[9px]" style={{ color: "rgba(200,200,200,0.8)" }}>{l.title || l.url}</span>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Empty state */}
                    {products.length === 0 && links.length === 0 && blocks.length === 0 && (
                      <div className="text-center py-4 opacity-50">
                        <p className="text-[9px]" style={{ color: "#aaa" }}>Adicione itens à sua vitrine</p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="pt-4 pb-2 text-center">
                      <p className="text-[8px]" style={{ color: "#555" }}>Criado com maview.app</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp button */}
              {cfg.whatsapp && (
                <div className="absolute bottom-10 right-[-4px] w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: "#25d366" }}>
                  <MessageCircle size={12} className="text-white" />
                </div>
              )}
            </div>

            {/* Below preview */}
            <div className="mt-3 text-center">
              <p className="text-[hsl(var(--dash-text-subtle))] text-[10px]">
                Atualiza em tempo real ao editar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile preview button ── */}
      <Link to="/dashboard/pagina"
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 lg:hidden flex items-center gap-2 px-5 py-3 rounded-full btn-primary-gradient shadow-xl text-sm font-semibold transition-transform active:scale-95"
      >
        <FileText size={16} /> Editar Vitrine
      </Link>

      {/* ── QR Code Modal ── */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-5 w-[260px]"
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={18} />
            </button>
            <div className="text-center">
              <h3 className="font-bold text-gray-900 text-[16px]">QR Code</h3>
              <p className="text-gray-500 text-[11px] mt-0.5 font-mono">{displayUrl}</p>
            </div>
            <canvas ref={qrCanvasRef} className="rounded-xl border border-gray-100" />
            <button onClick={downloadQR}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary-gradient text-[13px] font-semibold w-full justify-center">
              <Download size={14} /> Baixar PNG
            </button>
          </div>
        </div>
      )}

      {/* ── Milestone celebration popup ── */}
      {milestone !== null && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          style={{ animation: "fadeSlideUp 0.4s ease both" }}>
          <div className="glass-card rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-3 border-primary/20">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center celebrate">
              {milestone === 100 ? <Trophy size={20} className="text-amber-500" /> : <PartyPopper size={20} className="text-primary" />}
            </div>
            <div>
              <p className="text-[hsl(var(--dash-text))] text-sm font-bold">
                {milestone === 100 ? "Vitrine perfeita!" : milestone === 80 ? "Quase lá!" : "Meio caminho!"}
              </p>
              <p className="text-[hsl(var(--dash-text-muted))] text-xs">
                {milestone === 100
                  ? "Sua vitrine está 100% completa — hora de crescer!"
                  : milestone === 80
                    ? "80% completa — Analytics desbloqueado!"
                    : "50% completa — continue assim!"}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardHome;
