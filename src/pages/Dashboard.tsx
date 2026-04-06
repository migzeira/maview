import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { LogOut, User as UserIcon } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login");
      else setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-maview-bg flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-maview-purple/30 border-t-maview-purple rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Criador";

  return (
    <div className="min-h-screen bg-maview-bg">
      {/* Header */}
      <header className="border-b border-white/[0.05] px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-maview-purple to-maview-purple-dark flex items-center justify-center shadow-lg shadow-maview-purple/20">
            <span className="text-white font-bold text-sm leading-none">M</span>
          </div>
          <span className="text-white text-xl font-semibold tracking-tight">Maview</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-maview-purple to-maview-purple-dark flex items-center justify-center">
              <UserIcon size={12} className="text-white" />
            </div>
            <span className="text-sm text-white/70 hidden sm:block">{user?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-maview-muted hover:text-white hover:bg-white/[0.04] transition-all duration-200 text-sm"
          >
            <LogOut size={15} />
            <span className="hidden sm:block">Sair</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-maview-purple to-maview-purple-dark flex items-center justify-center mx-auto mb-6 shadow-xl shadow-maview-purple/20">
          <span className="text-white font-bold text-2xl leading-none">M</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">
          Olá, {displayName}! 👋
        </h1>
        <p className="text-maview-muted text-lg mb-12">
          Sua vitrine digital está sendo preparada. Em breve você poderá criar sua página aqui.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            { label: "Minha página", desc: "Configure seu link in bio", soon: true },
            { label: "Produtos", desc: "Adicione itens à sua loja", soon: true },
            { label: "Analytics", desc: "Veja seus acessos e vendas", soon: true },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-maview-card/60 border border-white/[0.06] rounded-2xl p-5 text-left relative overflow-hidden"
            >
              {item.soon && (
                <span className="absolute top-3 right-3 text-[10px] font-medium text-maview-purple-light bg-maview-purple/10 border border-maview-purple/20 px-2 py-0.5 rounded-full">
                  Em breve
                </span>
              )}
              <p className="text-white font-medium text-sm mb-1">{item.label}</p>
              <p className="text-maview-muted text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
