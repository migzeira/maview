import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  DollarSign, Eye, TrendingUp, ShoppingCart,
  CheckCircle2, Circle, ArrowRight, Sparkles,
  Copy, Check, ExternalLink, Flame, AlertCircle,
  Palette, Package, Bot, Link2,
} from "lucide-react";

/* ─── Hero action cards ─────────────────────────────────────── */
const HERO_CARDS = [
  {
    title: "Personalize sua vitrine",
    desc: "Escolha temas, cores e fontes da sua marca",
    path: "/dashboard/aparencia",
    gradient: "from-violet-500 to-purple-600",
    softBg: "from-violet-50 via-purple-50 to-fuchsia-50",
    borderHover: "hover:border-violet-200",
    icon: Palette,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    badge: null,
    deco: "🎨",
  },
  {
    title: "Crie seu produto",
    desc: "Venda digital com 0% de taxa, sem mensalidade",
    path: "/dashboard/produtos",
    gradient: "from-blue-500 to-indigo-600",
    softBg: "from-blue-50 via-indigo-50 to-blue-50",
    borderHover: "hover:border-blue-200",
    icon: Package,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    badge: "0% taxa",
    badgeColor: "bg-emerald-100 text-emerald-700",
    deco: "📦",
  },
  {
    title: "IA Maview",
    desc: "Crie bios, descrições de produtos e imagens com IA",
    path: "/dashboard/ia",
    gradient: "from-fuchsia-500 to-purple-700",
    softBg: "from-fuchsia-50 via-purple-50 to-violet-50",
    borderHover: "hover:border-fuchsia-200",
    icon: Bot,
    iconBg: "bg-fuchsia-100",
    iconColor: "text-fuchsia-600",
    badge: "Novo ✨",
    badgeColor: "bg-fuchsia-100 text-fuchsia-700",
    deco: "🤖",
  },
  {
    title: "Adicione seus links",
    desc: "Um link para tudo: redes, produtos e contato",
    path: "/dashboard/blocos",
    gradient: "from-emerald-500 to-teal-600",
    softBg: "from-emerald-50 via-teal-50 to-emerald-50",
    borderHover: "hover:border-emerald-200",
    icon: Link2,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    badge: null,
    deco: "🔗",
  },
];

/* ─── Stats ─────────────────────────────────────────────────── */
const STATS = [
  { label: "Receita total", value: "R$ 0,00", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Visitantes",    value: "0",        icon: Eye,         color: "text-blue-600",   bg: "bg-blue-50"    },
  { label: "Conversão",     value: "0%",       icon: TrendingUp,  color: "text-amber-600",  bg: "bg-amber-50"   },
  { label: "Vendas",        value: "0",        icon: ShoppingCart,color: "text-primary",    bg: "bg-[hsl(var(--dash-accent))]" },
];

/* ─── Checklist ─────────────────────────────────────────────── */
const CHECKLIST = [
  { label: "Criar conta",             done: true  },
  { label: "Criar primeiro bloco",    done: false, path: "/dashboard/blocos"    },
  { label: "Adicionar produto",       done: false, path: "/dashboard/produtos"  },
  { label: "Personalizar aparência",  done: false, path: "/dashboard/aparencia" },
  { label: "Publicar página",         done: false, path: "/dashboard/pagina"    },
];

/* ─── Insights ──────────────────────────────────────────────── */
const INSIGHTS = [
  { text: "Sua página pode converter mais com um botão de destaque", icon: Flame,       color: "text-amber-500",  border: "border-l-amber-400"  },
  { text: "Adicione um produto para começar a vender agora",         icon: ShoppingCart,color: "text-primary",    border: "border-l-primary"    },
  { text: "Páginas com foto de perfil têm 40% mais cliques",         icon: AlertCircle, color: "text-blue-500",   border: "border-l-blue-400"   },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

/* ─── Component ─────────────────────────────────────────────── */
const DashboardHome = () => {
  const [displayName, setDisplayName] = useState("");
  const [username,    setUsername]    = useState("");
  const [copied,      setCopied]      = useState(false);

  const profileUrl  = username ? `maview.app/@${username}` : "";
  const doneCount   = CHECKLIST.filter(c => c.done).length;
  const progressPct = Math.round((doneCount / CHECKLIST.length) * 100);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const m = session.user.user_metadata;
        setDisplayName(m?.full_name || session.user.email?.split("@")[0] || "Criador");
        setUsername(m?.username    || session.user.email?.split("@")[0] || "");
      }
    });
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${profileUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8">

      {/* ── Greeting ── */}
      <div>
        <h1 className="text-[28px] md:text-[34px] font-extrabold text-[hsl(var(--dash-text))] tracking-tight leading-tight">
          {getGreeting()}, {displayName.split(" ")[0]} <span className="inline-block">👋</span>
        </h1>
        <p className="text-[hsl(var(--dash-text-muted))] text-[16px] mt-1">
          Vamos construir sua vitrine e começar a vender.
        </p>
      </div>

      {/* ── Hero action cards (2×2) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {HERO_CARDS.map(({ title, desc, path, softBg, borderHover, icon: Icon, iconBg, iconColor, badge, badgeColor, deco }) => (
          <Link
            key={path}
            to={path}
            className={`
              group relative glass-card rounded-2xl p-6 overflow-hidden
              border border-[hsl(var(--dash-border-subtle))] ${borderHover}
              hover:shadow-lg transition-all duration-300
            `}
          >
            {/* soft gradient bg */}
            <div className={`absolute inset-0 bg-gradient-to-br ${softBg} opacity-60`} />

            {/* floating deco emoji */}
            <div className="absolute right-5 top-5 text-[52px] opacity-[0.12] select-none pointer-events-none group-hover:opacity-20 transition-opacity duration-300">
              {deco}
            </div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}>
                  <Icon size={20} className={iconColor} />
                </div>
                {badge && (
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${badgeColor}`}>
                    {badge}
                  </span>
                )}
              </div>

              <h3 className="text-[hsl(var(--dash-text))] font-bold text-[16px] leading-snug mb-1">
                {title}
              </h3>
              <p className="text-[hsl(var(--dash-text-subtle))] text-[13px] leading-relaxed mb-4">
                {desc}
              </p>

              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[hsl(var(--dash-text-secondary))] group-hover:text-primary transition-colors">
                Começar <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Share banner ── */}
      {profileUrl && (
        <div className="glass-card rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
              <ExternalLink size={15} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[hsl(var(--dash-text))] text-[13px] font-semibold">Seu perfil está no ar!</p>
              <p className="text-[hsl(var(--dash-text-subtle))] text-xs font-mono truncate">{profileUrl}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 text-[13px] text-[hsl(var(--dash-text-secondary))] font-medium transition-all"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              {copied ? "Copiado!" : "Copiar link"}
            </button>
            <a
              href={`https://${profileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl btn-primary-gradient text-[13px] font-medium"
            >
              <ExternalLink size={13} />
              Ver página
            </a>
          </div>
        </div>
      )}

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass-card rounded-2xl p-5 group hover:shadow-sm transition-shadow">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={16} className={color} />
            </div>
            <p className="text-[24px] font-extrabold text-[hsl(var(--dash-text))] leading-none tracking-tight">{value}</p>
            <p className="text-[12px] text-[hsl(var(--dash-text-muted))] mt-1.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Insights + Checklist row ── */}
      <div className="grid lg:grid-cols-5 gap-4 md:gap-6">

        {/* Insights (3/5) */}
        <div className="lg:col-span-3 glass-card rounded-2xl p-6">
          <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[14px] flex items-center gap-2 mb-4">
            <Sparkles size={14} className="text-primary" />
            Insights para você
          </h2>
          <div className="space-y-3">
            {INSIGHTS.map(({ text, icon: Icon, color, border }, i) => (
              <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl bg-[hsl(var(--dash-surface-2))] border-l-4 ${border}`}>
                <Icon size={15} className={`${color} mt-0.5 flex-shrink-0`} />
                <p className="text-[hsl(var(--dash-text-secondary))] text-[13px] leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Checklist (2/5) */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[14px]">Primeiros passos</h2>
            <span className="text-xs font-bold text-primary bg-[hsl(var(--dash-accent))] px-2 py-0.5 rounded-full">
              {doneCount}/{CHECKLIST.length}
            </span>
          </div>

          <div className="space-y-0.5 mb-4">
            {CHECKLIST.map(({ label, done, path }) => (
              <div
                key={label}
                className={`flex items-center gap-3 px-2 py-2.5 rounded-xl transition-colors ${
                  done ? "opacity-50" : "hover:bg-[hsl(var(--dash-surface-2))]"
                }`}
              >
                {done
                  ? <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                  : <Circle size={16} className="text-[hsl(var(--dash-text-subtle))] flex-shrink-0" strokeWidth={1.5} />
                }
                <span className={`text-[12px] flex-1 ${done ? "line-through text-[hsl(var(--dash-text-muted))]" : "text-[hsl(var(--dash-text-secondary))]"}`}>
                  {label}
                </span>
                {!done && path && (
                  <Link to={path} className="text-[11px] text-primary/70 hover:text-primary font-medium flex items-center gap-0.5">
                    Fazer <ArrowRight size={10} />
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-[hsl(var(--dash-surface-2))] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-[11px] text-[hsl(var(--dash-text-subtle))] mt-1.5 text-right font-medium">{progressPct}% completo</p>
        </div>
      </div>

    </div>
  );
};

export default DashboardHome;
