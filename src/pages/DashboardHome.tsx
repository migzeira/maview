import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  DollarSign, Eye, TrendingUp, ShoppingCart,
  CheckCircle2, Circle, Blocks, ShoppingBag, Layout,
  ArrowRight, Sparkles, Zap, Copy, Check, ExternalLink,
  Lightbulb, Target, Star,
} from "lucide-react";

const accentMap: Record<string, { icon: string; bg: string; ring: string }> = {
  emerald: { icon: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-100" },
  blue:    { icon: "text-blue-600",    bg: "bg-blue-50",    ring: "ring-blue-100"    },
  amber:   { icon: "text-amber-600",   bg: "bg-amber-50",   ring: "ring-amber-100"  },
  purple:  { icon: "text-primary",     bg: "bg-[hsl(var(--dash-accent))]", ring: "ring-primary/10" },
};

const STATS = [
  { label: "Receita total",  value: "R$ 0,00", icon: DollarSign,  accent: "emerald" },
  { label: "Visitantes",     value: "0",        icon: Eye,         accent: "blue"    },
  { label: "Conversão",      value: "0%",       icon: TrendingUp,  accent: "amber"   },
  { label: "Vendas",         value: "0",        icon: ShoppingCart,accent: "purple"  },
];

const CHECKLIST = [
  { label: "Criar conta",           done: true  },
  { label: "Criar primeiro bloco",  done: false, path: "/dashboard/blocos"   },
  { label: "Adicionar produto",     done: false, path: "/dashboard/produtos" },
  { label: "Publicar página",       done: false, path: "/dashboard/pagina"   },
];

const QUICK_ACTIONS = [
  { label: "Criar bloco",   icon: Blocks,    path: "/dashboard/blocos",   desc: "Links, vídeos, redes sociais" },
  { label: "Criar produto", icon: ShoppingBag, path: "/dashboard/produtos", desc: "Venda com 0% de taxa"        },
  { label: "Editar página", icon: Layout,    path: "/dashboard/pagina",   desc: "Temas, cores, personalização" },
];

const TIPS = [
  "Páginas com foto de perfil têm 40% mais cliques. Adicione uma em 'Minha Página'.",
  "Cole seu link Maview na bio do Instagram para multiplicar seus cliques.",
  "Produtos com descrição detalhada convertem até 3× mais. Capriche no texto!",
  "Adicione pelo menos 3 links para maximizar o engajamento da sua página.",
  "Compartilhe sua página no WhatsApp para acelerar suas primeiras vendas.",
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

const DashboardHome = () => {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername]       = useState("");
  const [copied, setCopied]           = useState(false);

  const tipIndex  = new Date().getDate() % TIPS.length;
  const profileUrl = username ? `maview.app/@${username}` : "";

  const doneCount   = CHECKLIST.filter(c => c.done).length;
  const progressPct = Math.round((doneCount / CHECKLIST.length) * 100);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata;
        setDisplayName(meta?.full_name || session.user.email?.split("@")[0] || "Criador");
        setUsername(meta?.username    || session.user.email?.split("@")[0] || "");
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
      <div className="space-y-1">
        <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">
          {getGreeting()}, {displayName} <span className="inline-block animate-[fadeInUp_0.4s_ease]">👋</span>
        </h1>
        <p className="text-[hsl(var(--dash-text-muted))] text-[15px]">
          Aqui está o resumo da sua vitrine digital
        </p>
      </div>

      {/* ── Share banner ── */}
      {profileUrl && (
        <div className="glass-card rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
              <Star size={16} className="text-white" />
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

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {STATS.map(({ label, value, icon: Icon, accent }) => {
          const a = accentMap[accent];
          return (
            <div key={label} className="glass-card-hover rounded-2xl p-5 md:p-6 group">
              <div className={`w-10 h-10 rounded-xl ${a.bg} ring-1 ${a.ring} flex items-center justify-center mb-4`}>
                <Icon size={18} className={a.icon} />
              </div>
              <p className="text-[26px] font-bold text-[hsl(var(--dash-text))] tracking-tight leading-none">{value}</p>
              <p className="text-[13px] text-[hsl(var(--dash-text-muted))] mt-1.5">{label}</p>
            </div>
          );
        })}
      </div>

      {/* ── Checklist + Quick actions ── */}
      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">

        {/* Progress checklist */}
        <div className="glass-card rounded-2xl p-6 md:p-7">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center">
                <Sparkles size={15} className="text-primary" />
              </div>
              <div>
                <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[15px]">Primeiros passos</h2>
                <p className="text-[hsl(var(--dash-text-subtle))] text-xs">Complete seu setup</p>
              </div>
            </div>
            <span className="text-xs font-bold text-primary bg-[hsl(var(--dash-accent))] px-2.5 py-1 rounded-full">
              {doneCount}/{CHECKLIST.length}
            </span>
          </div>

          <div className="space-y-1">
            {CHECKLIST.map(({ label, done, path }) => (
              <div
                key={label}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                  done ? "opacity-60" : "hover:bg-[hsl(var(--dash-surface-2))]"
                }`}
              >
                {done ? (
                  <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                ) : (
                  <Circle size={18} className="text-[hsl(var(--dash-text-subtle))] flex-shrink-0" strokeWidth={1.5} />
                )}
                <span className={`text-[13px] flex-1 ${done ? "text-[hsl(var(--dash-text-muted))] line-through" : "text-[hsl(var(--dash-text-secondary))]"}`}>
                  {label}
                </span>
                {!done && path && (
                  <Link
                    to={path}
                    className="text-xs text-primary/70 hover:text-primary transition-colors flex items-center gap-1 font-medium"
                  >
                    Fazer <ArrowRight size={11} />
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 px-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs text-[hsl(var(--dash-text-subtle))]">{doneCount} de {CHECKLIST.length} concluído</p>
              <p className="text-xs font-bold text-primary">{progressPct}%</p>
            </div>
            <div className="h-1.5 rounded-full bg-[hsl(var(--dash-surface-2))] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="glass-card rounded-2xl p-6 md:p-7">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center">
              <Zap size={15} className="text-primary" />
            </div>
            <div>
              <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[15px]">Ações rápidas</h2>
              <p className="text-[hsl(var(--dash-text-subtle))] text-xs">Comece por aqui</p>
            </div>
          </div>
          <div className="space-y-2">
            {QUICK_ACTIONS.map(({ label, icon: Icon, path, desc }) => (
              <Link
                key={label}
                to={path}
                className="flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-[hsl(var(--dash-border))] hover:bg-[hsl(var(--dash-surface-2))] transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center group-hover:ring-primary/20 transition-all">
                  <Icon size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium">{label}</p>
                  <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-0.5">{desc}</p>
                </div>
                <ArrowRight size={15} className="text-[hsl(var(--dash-text-subtle))] group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom row: Tip + Goal ── */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* Dica do dia */}
        <div className="glass-card rounded-2xl p-5 md:p-6 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-amber-50 ring-1 ring-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Lightbulb size={18} className="text-amber-500" />
          </div>
          <div>
            <p className="text-[hsl(var(--dash-text))] text-[13px] font-semibold mb-1">Dica do dia</p>
            <p className="text-[hsl(var(--dash-text-secondary))] text-[13px] leading-relaxed">
              {TIPS[tipIndex]}
            </p>
          </div>
        </div>

        {/* First sale goal */}
        <div className="glass-card rounded-2xl p-5 md:p-6 flex gap-4 items-center">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center flex-shrink-0">
            <Target size={18} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[hsl(var(--dash-text))] text-[13px] font-semibold">Meta: primeira venda 🎯</p>
            <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-0.5 leading-relaxed">
              Crie um produto e compartilhe sua página para começar
            </p>
          </div>
          <Link
            to="/dashboard/produtos"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 whitespace-nowrap flex-shrink-0"
          >
            Criar produto <ArrowRight size={11} />
          </Link>
        </div>
      </div>

    </div>
  );
};

export default DashboardHome;
