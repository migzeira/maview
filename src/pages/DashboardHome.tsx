import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  DollarSign, MousePointer, TrendingUp, ShoppingCart,
  CheckCircle2, Circle, Plus, Blocks, ShoppingBag, Layout,
  ArrowRight, Sparkles, Zap,
} from "lucide-react";

const STATS = [
  { label: "Receita total", value: "R$ 0,00", icon: DollarSign, accent: "emerald" },
  { label: "Cliques", value: "0", icon: MousePointer, accent: "blue" },
  { label: "Conversão", value: "0%", icon: TrendingUp, accent: "amber" },
  { label: "Vendas", value: "0", icon: ShoppingCart, accent: "purple" },
];

const accentMap: Record<string, { icon: string; bg: string; ring: string }> = {
  emerald: { icon: "text-emerald-400", bg: "bg-emerald-500/[0.08]", ring: "ring-emerald-500/20" },
  blue: { icon: "text-blue-400", bg: "bg-blue-500/[0.08]", ring: "ring-blue-500/20" },
  amber: { icon: "text-amber-400", bg: "bg-amber-500/[0.08]", ring: "ring-amber-500/20" },
  purple: { icon: "text-[hsl(var(--dash-accent))]", bg: "bg-primary/[0.08]", ring: "ring-primary/20" },
};

const CHECKLIST = [
  { label: "Criar conta", done: true },
  { label: "Criar primeiro bloco", done: false, path: "/dashboard/blocos" },
  { label: "Adicionar produto", done: false, path: "/dashboard/produtos" },
  { label: "Publicar página", done: false, path: "/dashboard/pagina" },
];

const QUICK_ACTIONS = [
  { label: "Criar bloco", icon: Blocks, path: "/dashboard/blocos", desc: "Adicione conteúdo à sua página" },
  { label: "Criar produto", icon: ShoppingBag, path: "/dashboard/produtos", desc: "Venda produtos digitais" },
  { label: "Editar página", icon: Layout, path: "/dashboard/pagina", desc: "Personalize sua vitrine" },
];

const DashboardHome = () => {
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setDisplayName(session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Criador");
      }
    });
  }, []);

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10 space-y-10">
      {/* Welcome */}
      <div className="space-y-1.5">
        <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">
          Bem-vindo, {displayName} <span className="inline-block animate-[fadeInUp_0.4s_ease]">👋</span>
        </h1>
        <p className="text-[hsl(var(--dash-text-muted))] text-[15px]">Vamos construir sua vitrine digital</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {STATS.map(({ label, value, icon: Icon, accent }) => {
          const a = accentMap[accent];
          return (
            <div
              key={label}
              className="glass-card-hover rounded-2xl p-5 md:p-6 group"
            >
              <div className={`w-10 h-10 rounded-xl ${a.bg} ring-1 ${a.ring} flex items-center justify-center mb-4`}>
                <Icon size={18} className={a.icon} />
              </div>
              <p className="text-[26px] font-bold text-[hsl(var(--dash-text))] tracking-tight leading-none">{value}</p>
              <p className="text-[13px] text-[hsl(var(--dash-text-muted))] mt-1.5">{label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        {/* Progress checklist */}
        <div className="glass-card rounded-2xl p-6 md:p-7">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/[0.08] ring-1 ring-primary/20 flex items-center justify-center">
              <Sparkles size={15} className="text-[hsl(var(--dash-accent))]" />
            </div>
            <div>
              <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[15px]">Primeiros passos</h2>
              <p className="text-[hsl(var(--dash-text-subtle))] text-xs">Complete seu setup</p>
            </div>
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
                  <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                ) : (
                  <Circle size={18} className="text-[hsl(var(--dash-text-subtle))] flex-shrink-0" strokeWidth={1.5} />
                )}
                <span className={`text-[13px] flex-1 ${done ? "text-[hsl(var(--dash-text-muted))] line-through" : "text-[hsl(var(--dash-text))]/80"}`}>
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
            <div className="h-1.5 rounded-full bg-[hsl(var(--dash-surface-2))] overflow-hidden">
              <div className="h-full w-1/4 rounded-full bg-gradient-to-r from-primary to-[hsl(var(--dash-accent))] transition-all duration-500" />
            </div>
            <p className="text-xs text-[hsl(var(--dash-text-subtle))] mt-2">1 de 4 concluído</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="glass-card rounded-2xl p-6 md:p-7">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/[0.08] ring-1 ring-primary/20 flex items-center justify-center">
              <Zap size={15} className="text-[hsl(var(--dash-accent))]" />
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
                className="flex items-center gap-4 p-4 rounded-xl bg-[hsl(var(--dash-surface-2))]/50 border border-transparent hover:border-[hsl(var(--dash-border))] hover:bg-[hsl(var(--dash-surface-2))] transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/[0.08] ring-1 ring-primary/20 flex items-center justify-center group-hover:bg-primary/[0.12] transition-colors">
                  <Icon size={18} className="text-[hsl(var(--dash-accent))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium">{label}</p>
                  <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-0.5">{desc}</p>
                </div>
                <ArrowRight size={15} className="text-[hsl(var(--dash-text-subtle))] group-hover:text-[hsl(var(--dash-accent))] group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
