import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import MaviewLogo from "./MaviewLogo";
import {
  Home, Layout, Blocks, ShoppingBag, BarChart3, Users, Settings,
  LogOut, ExternalLink, Copy, Check, ChevronLeft, ChevronRight, Menu,
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
      <div className="min-h-screen bg-[hsl(var(--dash-bg))] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 flex-shrink-0">
        <MaviewLogo size={26} />
        {!collapsed && (
          <span className="text-[hsl(var(--dash-text))] text-[15px] font-bold tracking-tight">
            Maview
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 dash-divider" />

      {/* Nav */}
      <nav className="flex-1 px-3 pt-4 space-y-0.5">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium
                transition-all duration-200 group relative
                ${active
                  ? "bg-primary/[0.12] text-[hsl(var(--dash-text))]"
                  : "text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] hover:bg-[hsl(var(--dash-surface-2))]"
                }
              `}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
              )}
              <Icon
                size={17}
                strokeWidth={active ? 2.2 : 1.8}
                className={`transition-colors ${active ? "text-[hsl(var(--dash-accent))]" : "text-[hsl(var(--dash-text-subtle))] group-hover:text-[hsl(var(--dash-accent))]"}`}
              />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="hidden md:block px-3 pb-4 pt-2">
        <div className="dash-divider mb-3" />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-xl text-[hsl(var(--dash-text-subtle))] hover:text-[hsl(var(--dash-accent))] hover:bg-[hsl(var(--dash-surface-2))] transition-all"
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[hsl(var(--dash-bg))] flex">
      {/* Desktop sidebar */}
      <aside
        className={`
          hidden md:flex flex-col flex-shrink-0 
          border-r border-[hsl(var(--dash-border-subtle))]
          bg-[hsl(var(--dash-bg))]
          transition-all duration-300
          ${collapsed ? "w-[68px]" : "w-[240px]"}
        `}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[260px] bg-[hsl(var(--dash-bg))] border-r border-[hsl(var(--dash-border-subtle))] shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-[hsl(var(--dash-border-subtle))] flex-shrink-0 bg-[hsl(var(--dash-bg))]/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))]">
              <Menu size={20} />
            </button>
            {/* Profile URL */}
            <button
              onClick={copyLink}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 transition-all text-[13px] text-[hsl(var(--dash-text-muted))] font-mono"
            >
              {profileUrl}
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} className="opacity-50" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://${profileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-all glow-sm"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">Ver minha página</span>
            </a>

            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))]">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-[hsl(263,76%,30%)] flex items-center justify-center text-primary-foreground text-xs font-bold ring-2 ring-primary/20">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-[13px] text-[hsl(var(--dash-text))]/70 hidden md:block">{displayName}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 p-2 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-[hsl(var(--dash-text))] hover:bg-[hsl(var(--dash-surface-2))] transition-all"
              title="Sair"
            >
              <LogOut size={15} />
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
