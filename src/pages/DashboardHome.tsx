import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  DollarSign, MousePointer, TrendingUp, ShoppingCart,
  CheckCircle2, Circle, Plus, Blocks, ShoppingBag, Layout,
  ArrowRight, Sparkles,
} from "lucide-react";

const STATS = [
  { label: "Receita total", value: "R$ 0,00", icon: DollarSign, color: "from-emerald-500/20 to-emerald-600/5", iconColor: "text-emerald-400" },
  { label: "Cliques", value: "0", icon: MousePointer, color: "from-blue-500/20 to-blue-600/5", iconColor: "text-blue-400" },
  { label: "Conversão", value: "0%", icon: TrendingUp, color: "from-amber-500/20 to-amber-600/5", iconColor: "text-amber-400" },
  { label: "Vendas", value: "0", icon: ShoppingCart, color: "from-[#A78BFA]/20 to-[#6D28D9]/5", iconColor: "text-[#A78BFA]" },
];

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
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
          Bem-vindo, {displayName} <span className="text-2xl">👋</span>
        </h1>
        <p className="text-[#A78BFA]/60 mt-1">Vamos construir sua vitrine digital</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, color, iconColor }) => (
          <div
            key={label}
            className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#1A1333] p-5 group hover:border-[#6D28D9]/30 transition-all duration-300"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <div className="relative">
              <div className={`w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3 ${iconColor}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-sm text-[#A78BFA]/50 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Progress checklist */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#1A1333] p-6">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles size={18} className="text-[#A78BFA]" />
            <h2 className="text-white font-semibold">Primeiros passos</h2>
          </div>
          <div className="space-y-3">
            {CHECKLIST.map(({ label, done, path }) => (
              <div key={label} className="flex items-center gap-3">
                {done ? (
                  <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
                ) : (
                  <Circle size={20} className="text-[#A78BFA]/20 flex-shrink-0" />
                )}
                <span className={`text-sm flex-1 ${done ? "text-[#A78BFA]/40 line-through" : "text-white/80"}`}>
                  {label}
                </span>
                {!done && path && (
                  <Link
                    to={path}
                    className="text-xs text-[#A78BFA]/60 hover:text-[#A78BFA] transition-colors flex items-center gap-1"
                  >
                    Fazer <ArrowRight size={12} />
                  </Link>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 h-2 rounded-full bg-white/[0.04] overflow-hidden">
            <div className="h-full w-1/4 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#A78BFA]" />
          </div>
          <p className="text-xs text-[#A78BFA]/40 mt-2">1 de 4 concluído</p>
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#1A1333] p-6">
          <h2 className="text-white font-semibold mb-5">Ações rápidas</h2>
          <div className="space-y-3">
            {QUICK_ACTIONS.map(({ label, icon: Icon, path, desc }) => (
              <Link
                key={label}
                to={path}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-[#6D28D9]/30 hover:bg-[#6D28D9]/5 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#6D28D9]/10 flex items-center justify-center text-[#A78BFA] group-hover:bg-[#6D28D9]/20 transition-colors">
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-[#A78BFA]/40 text-xs">{desc}</p>
                </div>
                <ArrowRight size={16} className="text-[#A78BFA]/20 group-hover:text-[#A78BFA]/60 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
