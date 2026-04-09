import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  CheckCircle2, Circle, ArrowRight, Sparkles,
  Copy, Check, ExternalLink, Palette, Package, Bot, Link2,
  QrCode, X, Download, Star,
} from "lucide-react";

/* ── localStorage ──────────────────────────────────────────── */
const LS_KEY = "maview_vitrine_config";
function loadVitrine() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; }
}

/* ── Health score ──────────────────────────────────────────── */
function calcHealth(cfg: Record<string, unknown>): number {
  let score = 0;
  if (cfg.avatarUrl)  score += 15;
  if (cfg.displayName && cfg.bio) score += 10;
  if (cfg.theme)      score += 10;
  if ((cfg.products as unknown[])?.filter((p: unknown) => (p as Record<string,unknown>).active).length > 0) score += 20;
  if (((cfg.links as unknown[]) || []).length > 0)        score += 15;
  if (((cfg.testimonials as unknown[]) || []).length > 0) score += 15;
  if (cfg.whatsapp)   score += 15;
  return score;
}

function healthLabel(s: number) {
  if (s >= 80) return { text: "Vitrine top! 🏆", color: "#10b981" };
  if (s >= 50) return { text: "Quase lá!",        color: "#8b5cf6" };
  if (s >= 20) return { text: "Bom começo!",       color: "#f59e0b" };
  return              { text: "Vamos lá!",          color: "#94a3b8" };
}

/* ── Count-up hook ─────────────────────────────────────────── */
function useCountUp(target: number, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    const t = setTimeout(() => {
      const dur = 750;
      const start = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - start) / dur, 1);
        setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay]);
  return val;
}

/* ── Health Ring SVG ───────────────────────────────────────── */
const HealthRing = ({ score }: { score: number }) => {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const { text, color } = healthLabel(score);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-[96px] h-[96px]">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none"
            stroke="hsl(var(--dash-surface-2))" strokeWidth="9" />
          <circle cx="50" cy="50" r={r} fill="none"
            stroke={color} strokeWidth="9" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[21px] font-extrabold text-[hsl(var(--dash-text))] leading-none">{score}</span>
          <span className="text-[9px] text-[hsl(var(--dash-text-subtle))] font-medium mt-0.5">/100</span>
        </div>
      </div>
      <p className="text-[11px] font-semibold text-[hsl(var(--dash-text-secondary))]">{text}</p>
    </div>
  );
};

/* ── Greeting subtitles ────────────────────────────────────── */
const SUBTITLES = [
  "Sua vitrine está esperando para crescer.",
  "Hora de criar algo novo?",
  "Vamos construir sua vitrine e começar a vender.",
  "Seu próximo cliente pode estar a um clique.",
  "O que vamos construir hoje?",
  "Cada visita é uma oportunidade.",
  "Uma bio poderosa começa aqui.",
];

/* ── Bento hero cards ──────────────────────────────────────── */
const HERO_CARDS = [
  {
    title: "Personalize sua vitrine",
    desc: "Temas, cores e fontes da sua marca",
    path: "/dashboard/aparencia",
    gradient: "from-violet-50 via-purple-50 to-fuchsia-50",
    borderHover: "hover:border-violet-300",
    icon: Palette,
    iconBg: "bg-violet-100", iconColor: "text-violet-600",
    glow: "rgba(139,92,246,0.18)",
    badge: null, badgeColor: "",
  },
  {
    title: "Crie seu produto",
    desc: "Venda digital com 0% de taxa",
    path: "/dashboard/produtos",
    gradient: "from-blue-50 via-indigo-50 to-sky-50",
    borderHover: "hover:border-blue-300",
    icon: Package,
    iconBg: "bg-blue-100", iconColor: "text-blue-600",
    glow: "rgba(59,130,246,0.18)",
    badge: "0% taxa", badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Adicione seus links",
    desc: "Um link para redes, produtos e contato",
    path: "/dashboard/blocos",
    gradient: "from-emerald-50 via-teal-50 to-cyan-50",
    borderHover: "hover:border-emerald-300",
    icon: Link2,
    iconBg: "bg-emerald-100", iconColor: "text-emerald-600",
    glow: "rgba(16,185,129,0.18)",
    badge: null, badgeColor: "",
  },
];

/* ── Theme backgrounds for preview ────────────────────────── */
const THEME_BG: Record<string, string> = {
  "dark-purple": "linear-gradient(135deg,#1a0533,#2d1060)",
  "midnight":    "linear-gradient(135deg,#0f1117,#1a1f2e)",
  "forest":      "linear-gradient(135deg,#0a1f0a,#1a3a1a)",
  "rose":        "linear-gradient(135deg,#2a0a14,#3d1020)",
  "amber":       "linear-gradient(135deg,#1a1205,#2d2010)",
  "ocean":       "linear-gradient(135deg,#05101a,#0a2030)",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "M";
}

/* ══ COMPONENT ═════════════════════════════════════════════ */
const DashboardHome = () => {
  const [displayName, setDisplayName] = useState("");
  const [username,    setUsername]    = useState("");
  const [copied,      setCopied]      = useState(false);
  const [visible,     setVisible]     = useState(false);
  const [showQR,      setShowQR]      = useState(false);
  const [cfg,         setCfg]         = useState<Record<string, unknown>>({});
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const profileUrl = username ? `maview.app/@${username}` : "";

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
      QRCode.toCanvas(qrCanvasRef.current!, `https://${profileUrl}`, {
        width: 188,
        margin: 2,
        color: { dark: "#1a0533", light: "#ffffff" },
      });
    }).catch(() => {});
  }, [showQR, profileUrl]);

  /* ── Derived ── */
  type Product    = { active: boolean; emoji?: string; name: string; price: number };
  type LinkItem   = { active?: boolean; title?: string; label?: string };
  type Testimonial = { text: string };

  const products     = ((cfg.products as Product[])     || []).filter(p => p.active);
  const links        = ((cfg.links    as LinkItem[])    || []);
  const testimonials = ((cfg.testimonials as Testimonial[]) || []);
  const health       = calcHealth(cfg);

  const CHECKLIST = [
    { label: "Criar conta",               done: true,                              path: null },
    { label: "Adicionar foto de perfil",  done: !!(cfg.avatarUrl),                 path: "/dashboard/configuracoes" },
    { label: "Personalizar aparência",    done: !!(cfg.theme),                     path: "/dashboard/aparencia" },
    { label: "Criar primeiro produto",    done: products.length > 0,               path: "/dashboard/produtos" },
    { label: "Adicionar link ou rede",    done: links.length > 0,                  path: "/dashboard/blocos" },
    { label: "Publicar página",           done: !!(cfg.username && cfg.displayName), path: "/dashboard/pagina" },
  ];

  const doneCount   = CHECKLIST.filter(c => c.done).length;
  const progressPct = Math.round((doneCount / CHECKLIST.length) * 100);
  const subtitle    = SUBTITLES[new Date().getDay() % SUBTITLES.length];

  /* count-up values */
  const prodCount   = useCountUp(products.length,     300);
  const linkCount   = useCountUp(links.length,         400);
  const testCount   = useCountUp(testimonials.length,  500);
  const healthCount = useCountUp(health,               200);

  const vitrineBg = THEME_BG[(cfg.theme as string)] || THEME_BG["dark-purple"];

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${profileUrl}`);
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

  return (
    <div className={`max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8 transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}>

      {/* ── Greeting ── */}
      <div className="flex items-center gap-4" style={{ animation: "fadeSlideUp 0.4s ease both" }}>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-200">
          <span className="text-white font-extrabold text-[15px] tracking-wide">{getInitials(displayName)}</span>
        </div>
        <div>
          <h1 className="text-[26px] md:text-[32px] font-extrabold text-[hsl(var(--dash-text))] tracking-tight leading-tight">
            {getGreeting()}, {displayName.split(" ")[0]} 👋
          </h1>
          <p className="text-[hsl(var(--dash-text-muted))] text-[14px] mt-0.5 font-medium">{subtitle}</p>
        </div>
      </div>

      {/* ── Bento Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ animation: "fadeSlideUp 0.45s ease 0.05s both" }}>

        {/* 3 action cards */}
        {HERO_CARDS.map(({ title, desc, path, gradient, borderHover, icon: Icon, iconBg, iconColor, glow, badge, badgeColor }) => (
          <Link key={path} to={path}
            className={`group relative glass-card rounded-2xl p-6 overflow-hidden cursor-pointer border border-[hsl(var(--dash-border-subtle))] ${borderHover} hover:shadow-xl hover:scale-[1.025] transition-all duration-200`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60`} />
            {/* inset glow on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
              style={{ boxShadow: `inset 0 0 50px ${glow}` }} />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}>
                  <Icon size={20} className={iconColor} />
                </div>
                {badge && (
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${badgeColor}`}>{badge}</span>
                )}
              </div>
              <h3 className="text-[hsl(var(--dash-text))] font-bold text-[15px] leading-snug mb-1">{title}</h3>
              <p className="text-[hsl(var(--dash-text-subtle))] text-[12.5px] leading-relaxed mb-4">{desc}</p>
              <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[hsl(var(--dash-text-secondary))] group-hover:text-primary transition-colors duration-150">
                Começar <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-150" />
              </div>
            </div>
          </Link>
        ))}

        {/* IA Maview — dark featured full-width */}
        <Link to="/dashboard/ia"
          className="group relative rounded-2xl p-6 md:p-8 overflow-hidden cursor-pointer sm:col-span-3 border border-fuchsia-800/40 hover:border-fuchsia-500/70 hover:shadow-2xl hover:shadow-fuchsia-900/30 hover:scale-[1.005] transition-all duration-200"
          style={{ background: "linear-gradient(135deg,#1a0533 0%,#2d1060 50%,#1e0a4a 100%)" }}
        >
          <div className="absolute right-[-40px] top-[-40px] w-56 h-56 rounded-full bg-fuchsia-500 opacity-[0.08] blur-3xl pointer-events-none" />
          <div className="absolute left-[-20px] bottom-[-20px] w-40 h-40 rounded-full bg-violet-500 opacity-[0.10] blur-2xl pointer-events-none" />
          {/* dot grid */}
          <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "22px 22px" }} />
          {/* hover radial glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
            style={{ background: "radial-gradient(ellipse at 80% 50%,rgba(217,70,239,0.1) 0%,transparent 60%)" }} />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-400/30 flex items-center justify-center flex-shrink-0">
              <Bot size={26} className="text-fuchsia-300" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-1.5">
                <h3 className="text-white font-extrabold text-[18px] leading-snug">IA Maview</h3>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-fuchsia-400/20 text-fuchsia-200 flex items-center gap-1 border border-fuchsia-400/20">
                  <Sparkles size={9} /> Novo
                </span>
              </div>
              <p className="text-white/60 text-[13.5px] leading-relaxed max-w-xl">
                Crie bios, descrições, planos de conteúdo e imagens com Inteligência Artificial treinada para criadores
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-[13.5px] font-bold flex-shrink-0 transition-colors duration-150 cursor-pointer shadow-lg shadow-fuchsia-900/40">
              Usar IA <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-150" />
            </button>
          </div>
        </Link>
      </div>

      {/* ── Share Banner ── */}
      {profileUrl && (
        <div className="glass-card rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
          style={{ animation: "fadeSlideUp 0.45s ease 0.1s both" }}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
              <ExternalLink size={15} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[hsl(var(--dash-text))] text-[13px] font-semibold flex items-center gap-1.5">
                Seu perfil está no ar!
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              </p>
              <p className="text-[hsl(var(--dash-text-subtle))] text-xs font-mono truncate">{profileUrl}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* QR Code button */}
            <button onClick={() => setShowQR(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 text-[13px] text-[hsl(var(--dash-text-secondary))] font-medium transition-all duration-150 cursor-pointer">
              <QrCode size={13} /> QR Code
            </button>
            <button onClick={copyLink}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 text-[13px] text-[hsl(var(--dash-text-secondary))] font-medium transition-all duration-150 cursor-pointer">
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              {copied ? "Copiado!" : "Copiar link"}
            </button>
            <a href={`https://${profileUrl}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl btn-primary-gradient text-[13px] font-medium cursor-pointer">
              <ExternalLink size={13} /> Ver página
            </a>
          </div>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        style={{ animation: "fadeSlideUp 0.45s ease 0.15s both" }}>
        {[
          { label: "Produtos ativos",  raw: products.length,      val: prodCount,   icon: Package, color: "text-violet-600", bg: "bg-violet-50",  border: "border-violet-100",  empty: "Crie seu primeiro produto" },
          { label: "Links adicionados",raw: links.length,          val: linkCount,   icon: Link2,   color: "text-blue-600",   bg: "bg-blue-50",    border: "border-blue-100",    empty: "Adicione seus links"       },
          { label: "Depoimentos",      raw: testimonials.length,   val: testCount,   icon: Star,    color: "text-amber-600",  bg: "bg-amber-50",   border: "border-amber-100",   empty: "Colete avaliações"         },
          { label: "Score da vitrine", raw: health,                val: healthCount, icon: Sparkles,color: "text-fuchsia-600",bg: "bg-fuchsia-50", border: "border-fuchsia-100", empty: "Complete seu perfil"       },
        ].map(({ label, raw, val, icon: Icon, color, bg, border, empty }) => (
          <div key={label}
            className={`glass-card rounded-2xl p-5 hover:shadow-md hover:scale-[1.02] transition-all duration-150 cursor-default border ${border}`}>
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={16} className={color} />
            </div>
            {raw === 0 ? (
              <>
                <p className="text-[22px] font-extrabold text-[hsl(var(--dash-text-muted))] leading-none tracking-tight">0</p>
                <p className="text-[11px] text-[hsl(var(--dash-text-subtle))] mt-1.5 font-medium leading-snug">{empty}</p>
              </>
            ) : (
              <>
                <p className="text-[24px] font-extrabold text-[hsl(var(--dash-text))] leading-none tracking-tight">
                  {label === "Score da vitrine" ? `${val}%` : val}
                </p>
                <p className="text-[12px] text-[hsl(var(--dash-text-muted))] mt-1.5 font-medium">{label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* ── Bottom row: left (Health + Checklist) | right (Preview) ── */}
      <div className="grid lg:grid-cols-5 gap-4 md:gap-5"
        style={{ animation: "fadeSlideUp 0.45s ease 0.2s both" }}>

        {/* Left col — Health Score + Checklist */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Health Score */}
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[14px] mb-4">Score da vitrine</h2>
            <div className="flex items-center gap-5">
              <HealthRing score={health} />
              <div className="flex-1 space-y-2">
                {[
                  { label: "Foto de perfil",    done: !!(cfg.avatarUrl) },
                  { label: "Tema selecionado",  done: !!(cfg.theme) },
                  { label: "Produto criado",    done: products.length > 0 },
                  { label: "Link adicionado",   done: links.length > 0 },
                  { label: "Depoimento",        done: testimonials.length > 0 },
                  { label: "WhatsApp",          done: !!(cfg.whatsapp) },
                ].map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 transition-colors duration-500 ${done ? "bg-emerald-400" : "bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border))]"}`} />
                    <span className={`text-[11px] font-medium ${done ? "text-[hsl(var(--dash-text-secondary))]" : "text-[hsl(var(--dash-text-subtle))]"}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="glass-card rounded-2xl p-5 flex-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[14px]">Primeiros passos</h2>
              <span className="text-xs font-bold text-primary bg-[hsl(var(--dash-accent))] px-2.5 py-1 rounded-full">
                {doneCount}/{CHECKLIST.length}
              </span>
            </div>

            <div className="space-y-0.5 mb-4">
              {CHECKLIST.map(({ label, done, path }) => {
                const inner = (
                  <div className={`flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all duration-150 ${
                    done ? "opacity-50" : "hover:bg-[hsl(var(--dash-surface-2))] cursor-pointer group"
                  }`}>
                    {done
                      ? <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                      : <Circle size={15} className="text-[hsl(var(--dash-text-subtle))] flex-shrink-0 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                    }
                    <span className={`text-[12px] flex-1 font-medium ${done ? "line-through text-[hsl(var(--dash-text-muted))]" : "text-[hsl(var(--dash-text-secondary))]"}`}>
                      {label}
                    </span>
                    {!done && <ArrowRight size={11} className="text-[hsl(var(--dash-text-subtle))] group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />}
                  </div>
                );
                return done || !path
                  ? <div key={label}>{inner}</div>
                  : <Link key={label} to={path} className="block">{inner}</Link>;
              })}
            </div>

            <div className="h-1.5 rounded-full bg-[hsl(var(--dash-surface-2))] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
                style={{ width: `${progressPct}%` }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <p className="text-[10.5px] text-[hsl(var(--dash-text-subtle))] font-medium">
                {progressPct === 100 ? "🎉 Tudo pronto!" : `${CHECKLIST.length - doneCount} etapas restantes`}
              </p>
              <p className="text-[10.5px] text-[hsl(var(--dash-text-subtle))] font-semibold">{progressPct}%</p>
            </div>
          </div>
        </div>

        {/* Right col — Vitrine Preview */}
        <div className="lg:col-span-3 glass-card rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[14px]">Sua vitrine</h2>
              <p className="text-[hsl(var(--dash-text-subtle))] text-[11.5px] mt-0.5">Preview em tempo real</p>
            </div>
            <div className="flex gap-3">
              <Link to="/dashboard/pagina"
                className="text-[12px] font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                <Palette size={12} /> Editar
              </Link>
              {username && (
                <a href={`https://maview.app/@${username}`} target="_blank" rel="noopener noreferrer"
                  className="text-[12px] font-medium text-[hsl(var(--dash-text-subtle))] hover:text-[hsl(var(--dash-text))] transition-colors flex items-center gap-1">
                  <ExternalLink size={12} /> Abrir
                </a>
              )}
            </div>
          </div>

          {/* Phone mockup */}
          <div className="flex-1 flex items-center justify-center py-6">
            <div className="relative w-[195px]">
              <div className="rounded-[28px] overflow-hidden border-[5px] border-[hsl(var(--dash-text))] shadow-2xl"
                style={{ background: vitrineBg }}>
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-4 rounded-b-xl z-10"
                  style={{ background: "hsl(var(--dash-text))" }} />

                <div className="px-4 pt-8 pb-6 min-h-[360px] flex flex-col items-center gap-3">
                  {/* Avatar */}
                  <div className="w-[52px] h-[52px] rounded-full ring-2 ring-white/20 overflow-hidden flex-shrink-0 mt-2">
                    {cfg.avatarUrl ? (
                      <img src={cfg.avatarUrl as string} className="w-full h-full object-cover" alt=""
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-fuchsia-500 to-violet-500 flex items-center justify-center text-white text-[17px] font-bold">
                        {getInitials((cfg.displayName as string) || displayName || "M")}
                      </div>
                    )}
                  </div>

                  {/* Name & bio */}
                  <div className="text-center space-y-0.5">
                    <p className="text-white font-bold text-[11px] leading-tight">
                      {(cfg.displayName as string) || displayName || "Seu nome"}
                    </p>
                    <p className="text-white/50 text-[8.5px]">
                      @{(cfg.username as string) || username || "usuario"}
                    </p>
                    {cfg.bio && (
                      <p className="text-white/60 text-[8px] leading-snug line-clamp-2 max-w-[140px] mx-auto mt-0.5">
                        {cfg.bio as string}
                      </p>
                    )}
                  </div>

                  {/* Products */}
                  {products.length > 0 ? (
                    <div className="w-full space-y-1.5 mt-1">
                      <p className="text-white/40 text-[8px] uppercase tracking-wider font-semibold">Produtos</p>
                      {products.slice(0, 2).map((p, i) => (
                        <div key={i} className="bg-white/10 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                          <span className="text-[10px]">{p.emoji || "📦"}</span>
                          <span className="text-white text-[8.5px] font-medium flex-1 truncate">{p.name}</span>
                          <span className="text-emerald-300 text-[8px] font-bold">R${p.price}</span>
                        </div>
                      ))}
                      {products.length > 2 && (
                        <p className="text-white/30 text-[7.5px] text-center">+{products.length - 2} mais</p>
                      )}
                    </div>
                  ) : (
                    <div className="w-full bg-white/5 rounded-xl px-3 py-3 text-center border border-white/10 border-dashed">
                      <Package size={13} className="text-white/25 mx-auto mb-1" />
                      <p className="text-white/25 text-[7.5px]">Nenhum produto ainda</p>
                    </div>
                  )}

                  {/* Links */}
                  {links.length > 0 && (
                    <div className="w-full space-y-1">
                      {links.slice(0, 2).map((l, i) => (
                        <div key={i} className="bg-white/10 rounded-lg px-2.5 py-1.5 text-center">
                          <span className="text-white/80 text-[8.5px] font-medium">{l.title || l.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats below phone */}
          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-[hsl(var(--dash-border-subtle))]">
            {[
              { label: "Produtos",     val: products.length },
              { label: "Links",        val: links.length },
              { label: "Depoimentos",  val: testimonials.length },
              { label: "Score",        val: `${health}%`, colored: true },
            ].map(({ label, val, colored }) => (
              <div key={label} className="text-center">
                <p className={`text-[15px] font-bold ${colored ? (health >= 80 ? "text-emerald-500" : health >= 50 ? "text-primary" : "text-amber-500") : "text-[hsl(var(--dash-text))]"}`}>
                  {val}
                </p>
                <p className="text-[9.5px] text-[hsl(var(--dash-text-subtle))] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

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
              <p className="text-gray-500 text-[11px] mt-0.5 font-mono">{profileUrl}</p>
            </div>
            <canvas ref={qrCanvasRef} className="rounded-xl border border-gray-100" />
            <button onClick={downloadQR}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary-gradient text-[13px] font-semibold w-full justify-center">
              <Download size={14} /> Baixar PNG
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardHome;
