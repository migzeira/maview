import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  DollarSign, Eye, TrendingUp, ShoppingCart,
  CheckCircle2, Circle, ArrowRight, Sparkles,
  Copy, Check, ExternalLink, Flame, AlertCircle,
  Palette, Package, Bot, Link2, Zap, Star,
} from "lucide-react";

/* ─── Hero action cards ─────────────────────────────────────── */
const HERO_CARDS = [
  {
    title: "Personalize sua vitrine",
    desc: "Temas, cores e fontes da sua marca",
    path: "/dashboard/aparencia",
    gradient: "from-violet-50 via-purple-50 to-fuchsia-50",
    borderHover: "hover:border-violet-300",
    icon: Palette,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    glowColor: "bg-violet-300",
    badge: null,
    featured: false,
  },
  {
    title: "Crie seu produto",
    desc: "Venda digital com 0% de taxa",
    path: "/dashboard/produtos",
    gradient: "from-blue-50 via-indigo-50 to-sky-50",
    borderHover: "hover:border-blue-300",
    icon: Package,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    glowColor: "bg-blue-300",
    badge: "0% taxa",
    badgeColor: "bg-emerald-100 text-emerald-700",
    featured: false,
  },
  {
    title: "Adicione seus links",
    desc: "Um link para redes, produtos e contato",
    path: "/dashboard/blocos",
    gradient: "from-emerald-50 via-teal-50 to-cyan-50",
    borderHover: "hover:border-emerald-300",
    icon: Link2,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    glowColor: "bg-emerald-300",
    badge: null,
    featured: false,
  },
  {
    title: "IA Maview",
    desc: "Crie bios, descrições, planos de conteúdo e imagens com Inteligência Artificial treinada para criadores",
    path: "/dashboard/ia",
    gradient: "from-violet-900 via-purple-900 to-fuchsia-900",
    borderHover: "hover:border-fuchsia-500",
    icon: Bot,
    iconBg: "bg-white/10",
    iconColor: "text-white",
    glowColor: "bg-fuchsia-400",
    badge: "Novo",
    badgeColor: "bg-fuchsia-400/20 text-fuchsia-200",
    featured: true,
  },
];

/* ─── Stats ─────────────────────────────────────────────────── */
const STATS = [
  { label: "Receita total",  value: "R$ 0",  empty: "Nenhuma venda ainda",  icon: DollarSign,  color: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-100" },
  { label: "Visitantes",     value: "0",     empty: "Compartilhe seu link",  icon: Eye,          color: "text-blue-600",   bg: "bg-blue-50",    border: "border-blue-100"   },
  { label: "Taxa de conv.",  value: "0%",    empty: "Aguardando dados",      icon: TrendingUp,   color: "text-amber-600",  bg: "bg-amber-50",   border: "border-amber-100"  },
  { label: "Vendas",         value: "0",     empty: "Crie seu primeiro produto", icon: ShoppingCart, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
];

/* ─── Checklist ─────────────────────────────────────────────── */
const CHECKLIST = [
  { label: "Criar conta",             done: true,  path: null                      },
  { label: "Criar primeiro bloco",    done: false, path: "/dashboard/blocos"       },
  { label: "Adicionar produto",       done: false, path: "/dashboard/produtos"     },
  { label: "Personalizar aparência",  done: false, path: "/dashboard/aparencia"    },
  { label: "Publicar página",         done: false, path: "/dashboard/pagina"       },
];

/* ─── Insights ──────────────────────────────────────────────── */
const INSIGHTS = [
  { text: "Páginas com foto de perfil têm 40% mais cliques",                icon: Eye,          color: "text-blue-500",   border: "border-l-blue-400",   bg: "bg-blue-50/50"   },
  { text: "Adicione um produto para começar a vender agora",                icon: ShoppingCart, color: "text-violet-500", border: "border-l-violet-400", bg: "bg-violet-50/50" },
  { text: "Um botão de destaque pode aumentar sua conversão em 2x",         icon: Zap,          color: "text-amber-500",  border: "border-l-amber-400",  bg: "bg-amber-50/50"  },
  { text: "Criadores com IA geram 3x mais conteúdo por semana",             icon: Sparkles,     color: "text-fuchsia-500",border: "border-l-fuchsia-400",bg: "bg-fuchsia-50/50"},
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "M";
}

/* ─── Component ─────────────────────────────────────────────── */
const DashboardHome = () => {
  const [displayName, setDisplayName] = useState("");
  const [username,    setUsername]    = useState("");
  const [copied,      setCopied]      = useState(false);
  const [visible,     setVisible]     = useState(false);

  const profileUrl  = username ? `maview.app/@${username}` : "";
  const doneCount   = CHECKLIST.filter(c => c.done).length;
  const progressPct = Math.round((doneCount / CHECKLIST.length) * 100);
  const insightOfDay = INSIGHTS[new Date().getDay() % INSIGHTS.length];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const m = session.user.user_metadata;
        setDisplayName(m?.full_name || session.user.email?.split("@")[0] || "Criador");
        setUsername(m?.username    || session.user.email?.split("@")[0] || "");
      }
    });
    // stagger entrance
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${profileUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const nonFeatured = HERO_CARDS.filter(c => !c.featured);
  const featuredCard = HERO_CARDS.find(c => c.featured)!;

  return (
    <div className={`max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8 transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}>

      {/* ── Greeting ── */}
      <div
        className="flex items-center gap-4"
        style={{ animation: "fadeSlideUp 0.4s ease both" }}
      >
        {/* Avatar */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-200">
          <span className="text-white font-extrabold text-[15px] tracking-wide">
            {getInitials(displayName)}
          </span>
        </div>
        <div>
          <h1 className="text-[26px] md:text-[32px] font-extrabold text-[hsl(var(--dash-text))] tracking-tight leading-tight">
            {getGreeting()}, {displayName.split(" ")[0]} 👋
          </h1>
          <p className="text-[hsl(var(--dash-text-muted))] text-[14px] mt-0.5 font-medium">
            Vamos construir sua vitrine e começar a vender.
          </p>
        </div>
      </div>

      {/* ── Bento Grid — 3 cols top + IA featured full width ── */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        style={{ animation: "fadeSlideUp 0.45s ease 0.05s both" }}
      >
        {/* 3 regular cards — equal columns */}
        {nonFeatured.map(({ title, desc, path, gradient, borderHover, icon: Icon, iconBg, iconColor, glowColor, badge, badgeColor }) => (
          <Link
            key={path}
            to={path}
            className={`
              group relative glass-card rounded-2xl p-6 overflow-hidden cursor-pointer
              border border-[hsl(var(--dash-border-subtle))] ${borderHover}
              hover:shadow-lg hover:scale-[1.025] transition-all duration-200
            `}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60`} />
            <div className={`absolute right-3 top-3 w-24 h-24 rounded-full ${glowColor} opacity-[0.12] blur-2xl pointer-events-none`} />

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

        {/* IA Maview — dark featured card, full width */}
        <Link
          to={featuredCard.path}
          className={`
            group relative rounded-2xl p-6 md:p-8 overflow-hidden cursor-pointer
            sm:col-span-3
            border border-fuchsia-800/40 hover:border-fuchsia-500/70
            hover:shadow-2xl hover:shadow-fuchsia-900/30 hover:scale-[1.005]
            transition-all duration-200
          `}
          style={{ background: "linear-gradient(135deg, #1a0533 0%, #2d1060 50%, #1e0a4a 100%)" }}
        >
          {/* Ambient glow blobs */}
          <div className="absolute right-[-40px] top-[-40px] w-56 h-56 rounded-full bg-fuchsia-500 opacity-[0.08] blur-3xl pointer-events-none" />
          <div className="absolute left-[-20px] bottom-[-20px] w-40 h-40 rounded-full bg-violet-500 opacity-[0.10] blur-2xl pointer-events-none" />
          {/* Subtle grid texture */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-400/30 flex items-center justify-center flex-shrink-0">
              <Bot size={26} className="text-fuchsia-300" />
            </div>

            {/* Text */}
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-1.5">
                <h3 className="text-white font-extrabold text-[18px] leading-snug">{featuredCard.title}</h3>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-fuchsia-400/20 text-fuchsia-200 flex items-center gap-1 border border-fuchsia-400/20">
                  <Sparkles size={9} /> Novo
                </span>
              </div>
              <p className="text-white/60 text-[13.5px] leading-relaxed max-w-xl">{featuredCard.desc}</p>
            </div>

            {/* CTA button */}
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-[13.5px] font-bold flex-shrink-0 transition-colors duration-150 cursor-pointer shadow-lg shadow-fuchsia-900/40">
              Usar IA <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-150" />
            </button>
          </div>
        </Link>
      </div>

      {/* ── Share banner ── */}
      {profileUrl && (
        <div
          className="glass-card rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
          style={{ animation: "fadeSlideUp 0.45s ease 0.1s both" }}
        >
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
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 text-[13px] text-[hsl(var(--dash-text-secondary))] font-medium transition-all duration-150 cursor-pointer"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              {copied ? "Copiado!" : "Copiar link"}
            </button>
            <a
              href={`https://${profileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl btn-primary-gradient text-[13px] font-medium cursor-pointer"
            >
              <ExternalLink size={13} />
              Ver página
            </a>
          </div>
        </div>
      )}

      {/* ── Stats strip ── */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        style={{ animation: "fadeSlideUp 0.45s ease 0.15s both" }}
      >
        {STATS.map(({ label, value, empty, icon: Icon, color, bg, border }) => {
          const isEmpty = value === "0" || value === "R$ 0" || value === "0%";
          return (
            <div
              key={label}
              className={`glass-card rounded-2xl p-5 hover:shadow-md hover:scale-[1.02] transition-all duration-150 cursor-default border ${border}`}
            >
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon size={16} className={color} />
              </div>
              {isEmpty ? (
                <>
                  <p className="text-[22px] font-extrabold text-[hsl(var(--dash-text-muted))] leading-none tracking-tight">{value}</p>
                  <p className="text-[11px] text-[hsl(var(--dash-text-subtle))] mt-1.5 font-medium leading-snug">{empty}</p>
                </>
              ) : (
                <>
                  <p className="text-[24px] font-extrabold text-[hsl(var(--dash-text))] leading-none tracking-tight">{value}</p>
                  <p className="text-[12px] text-[hsl(var(--dash-text-muted))] mt-1.5 font-medium">{label}</p>
                </>
              )}
              {!isEmpty && (
                <p className="text-[11px] text-[hsl(var(--dash-text-subtle))] mt-0.5">{label}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Insight do dia + Checklist ── */}
      <div
        className="grid lg:grid-cols-5 gap-4 md:gap-5"
        style={{ animation: "fadeSlideUp 0.45s ease 0.2s both" }}
      >

        {/* Insight do dia + lista */}
        <div className="lg:col-span-3 space-y-3">
          {/* Insight rotativo */}
          <div className={`flex items-start gap-3 p-4 rounded-2xl bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))] border-l-4 ${insightOfDay.border} ${insightOfDay.bg}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-white/70`}>
              <insightOfDay.icon size={15} className={insightOfDay.color} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[hsl(var(--dash-text-subtle))] uppercase tracking-wide mb-0.5">Insight do dia</p>
              <p className="text-[hsl(var(--dash-text-secondary))] text-[13.5px] leading-relaxed font-medium">{insightOfDay.text}</p>
            </div>
          </div>

          {/* Outros insights */}
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[13px] flex items-center gap-2 mb-3">
              <Star size={13} className="text-amber-400 fill-amber-400" />
              Dicas para crescer
            </h2>
            <div className="space-y-2">
              {INSIGHTS.filter(i => i !== insightOfDay).map(({ text, icon: Icon, color, border }, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl bg-[hsl(var(--dash-surface-2))] border-l-4 ${border}`}>
                  <Icon size={14} className={`${color} mt-0.5 flex-shrink-0`} />
                  <p className="text-[hsl(var(--dash-text-secondary))] text-[12.5px] leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[14px]">Primeiros passos</h2>
            <span className="text-xs font-bold text-primary bg-[hsl(var(--dash-accent))] px-2.5 py-1 rounded-full">
              {doneCount}/{CHECKLIST.length}
            </span>
          </div>

          <div className="space-y-0.5 mb-5">
            {CHECKLIST.map(({ label, done, path }) => {
              const inner = (
                <div
                  className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all duration-150 ${
                    done
                      ? "opacity-50"
                      : "hover:bg-[hsl(var(--dash-surface-2))] cursor-pointer group"
                  }`}
                >
                  {done
                    ? <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                    : <Circle size={16} className="text-[hsl(var(--dash-text-subtle))] flex-shrink-0 group-hover:text-primary transition-colors duration-150" strokeWidth={1.5} />
                  }
                  <span className={`text-[12.5px] flex-1 font-medium ${
                    done ? "line-through text-[hsl(var(--dash-text-muted))]" : "text-[hsl(var(--dash-text-secondary))]"
                  }`}>
                    {label}
                  </span>
                  {!done && (
                    <ArrowRight size={11} className="text-[hsl(var(--dash-text-subtle))] group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-150 flex-shrink-0" />
                  )}
                </div>
              );

              return done || !path
                ? <div key={label}>{inner}</div>
                : <Link key={label} to={path} className="block">{inner}</Link>;
            })}
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full bg-[hsl(var(--dash-surface-2))] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-[11px] text-[hsl(var(--dash-text-subtle))] font-medium">
              {progressPct === 100 ? "🎉 Tudo pronto!" : `${CHECKLIST.length - doneCount} etapas restantes`}
            </p>
            <p className="text-[11px] text-[hsl(var(--dash-text-subtle))] font-semibold">{progressPct}%</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardHome;
