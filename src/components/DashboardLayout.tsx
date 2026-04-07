import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import MaviewLogo from "./MaviewLogo";
import {
  Home, Layout, Blocks, ShoppingBag, BarChart3, Users, Settings,
  LogOut, ExternalLink, Copy, Check, ChevronLeft, ChevronRight, Menu, X,
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Home", icon: Home },
  { path: "/dashboard/pagina", label: "Minha Página", icon: Layout },
  { path: "/dashboard/blocos", label: "Blocos", icon: Blocks },
  { path: "/dashboard/produtos", label: "Produtos", icon: ShoppingBag },
  { path: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/dashboard/clientes", label: "Clientes", icon: Users },
  { path: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

interface Props {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const username = user?.user_metadata?.username || user?.email?.split("@")[0] || "usuario";
  const displayName = user?.user_metadata?.full_name || username;
  const profileUrl = `maview.app/@${username}`;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login");
      else setUser(session.user);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/login");
      else setUser(session.user);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${profileUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0B1F] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#6D28D9]/30 border-t-[#6D28D9] rounded-full animate-spin" />
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-6">
        <MaviewLogo size={28} />
        {!collapsed && <span className="text-white text-lg font-bold tracking-tight">Maview</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? "bg-[#6D28D9]/20 text-white border border-[#6D28D9]/30"
                  : "text-[#A78BFA]/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={18} className={active ? "text-[#A78BFA]" : "text-[#A78BFA]/40 group-hover:text-[#A78BFA]/70"} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle (desktop only) */}
      <div className="hidden md:block px-3 pb-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-xl text-[#A78BFA]/40 hover:text-[#A78BFA] hover:bg-white/5 transition-all"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F0B1F] flex">
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 border-r border-white/[0.06] bg-[#0F0B1F] transition-all duration-300 ${
          collapsed ? "w-[68px]" : "w-[240px]"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[260px] bg-[#0F0B1F] border-r border-white/[0.06]">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/[0.06] flex-shrink-0 bg-[#0F0B1F]/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-[#A78BFA]/60 hover:text-white">
              <Menu size={20} />
            </button>
            {/* Profile URL */}
            <button
              onClick={copyLink}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-[#6D28D9]/40 transition-all text-sm text-[#A78BFA]/70 font-mono"
            >
              {profileUrl}
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`https://${profileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#6D28D9] text-white text-sm font-medium hover:bg-[#7C3AED] transition-all"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Ver minha página</span>
            </a>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] flex items-center justify-center text-white text-xs font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-white/70 hidden md:block">{displayName}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-[#A78BFA]/40 hover:text-white hover:bg-white/5 transition-all text-sm"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
