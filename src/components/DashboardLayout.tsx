import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import MaviewLogo from "./MaviewLogo";
import FloatingAIButton from "./FloatingAIButton";
import {
  Home, Layout, Users, Settings,
  LogOut, ExternalLink, Copy, Check, ChevronLeft, ChevronRight, Menu,
  Zap, Palette, Bot, Wallet,
} from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: typeof Home;
  badge: string | null;
}

interface NavGroup {
  label: string | null;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [
      { path: "/dashboard", label: "Home", icon: Home, badge: null },
    ],
  },
  {
    label: "CRIAÇÃO",
    items: [
      { path: "/dashboard/pagina", label: "Minha Vitrine", icon: Layout, badge: null },
      { path: "/dashboard/aparencia", label: "Aparência", icon: Palette, badge: null },
    ],
  },
  {
    label: "MONETIZAÇÃO",
    items: [
      { path: "/dashboard/monetizacao", label: "Monetização", icon: Wallet, badge: null },
    ],
  },
  {
    label: "AUDIÊNCIA",
    items: [
      { path: "/dashboard/audiencia", label: "Audiência", icon: Users, badge: null },
    ],
  },
  {
    label: "CRESCIMENTO",
    items: [
      { path: "/dashboard/automacoes", label: "Automações", icon: Zap, badge: null },
      { path: "/dashboard/ia", label: "IA Maview", icon: Bot, badge: "Novo" },
    ],
  },
  {
    label: "SISTEMA",
    items: [
      { path: "/dashboard/configuracoes", label: "Configurações", icon: Settings, badge: null },
    ],
  },
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
      <div className="flex items-center gap-3 px-5 h-16 flex-shrink-0">
        <MaviewLogo size={36} />
        {!collapsed && (
          <span className="text-[20px] font-extrabold tracking-tight bg-gradient-to-r from-[#6D28D9] via-[#8B5CF6] to-[#60A5FA] bg-clip-text text-transparent">
            Maview
          </span>
        )}
      </div>

      <div className="mx-4 dash-divider" />

      <nav className="flex-1 px-3 pt-4 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.label && !collapsed && (
              <p className="text-[10px] font-semibold tracking-widest text-[hsl(var(--dash-text-subtle))] uppercase px-3 mb-2">
                {group.label}
              </p>
            )}
            {group.label && collapsed && <div className="dash-divider mx-1 mb-2" />}
            <div className="space-y-0.5">
              {group.items.map(({ path, label, icon: Icon, badge }) => {
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
                        ? "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-accent-fg))]"
                        : "text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text-secondary))] hover:bg-[hsl(var(--dash-surface-2))]"
                      }
                    `}
                  >
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
                    )}
                    <Icon
                      size={17}
                      strokeWidth={active ? 2.2 : 1.8}
                      className={`transition-colors flex-shrink-0 ${active ? "text-primary" : "text-[hsl(var(--dash-text-subtle))] group-hover:text-primary/60"}`}
                    />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{label}</span>
                        {badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-fuchsia-100 text-fuchsia-600 leading-none">
                            {badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="hidden md:block px-3 pb-4 pt-2">
        <div className="dash-divider mb-3" />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-xl text-[hsl(var(--dash-text-subtle))] hover:text-primary hover:bg-[hsl(var(--dash-surface-2))] transition-all"
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[hsl(var(--dash-bg))] flex">
      <aside
        className={`
          hidden md:flex flex-col flex-shrink-0 
          border-r border-[hsl(var(--dash-border-subtle))]
          bg-[hsl(var(--dash-surface))]
          transition-all duration-300
          ${collapsed ? "w-[68px]" : "w-[240px]"}
        `}
      >
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[260px] bg-[hsl(var(--dash-surface))] border-r border-[hsl(var(--dash-border-subtle))] shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-[hsl(var(--dash-border-subtle))] flex-shrink-0 bg-[hsl(var(--dash-surface))]/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))]">
              <Menu size={20} />
            </button>
            <button
              onClick={copyLink}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 transition-all text-[13px] text-[hsl(var(--dash-text-muted))] font-mono"
            >
              {profileUrl}
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} className="opacity-40" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://${profileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg btn-primary-gradient text-[13px]"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">Ver minha página</span>
            </a>

            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))]">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-xs font-bold ring-2 ring-primary/10">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-[13px] text-[hsl(var(--dash-text-secondary))] hidden md:block">{displayName}</span>
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

        <main className="flex-1 overflow-y-auto bg-[hsl(var(--dash-bg))]">
          {children}
        </main>
        <FloatingAIButton />
      </div>
    </div>
  );
};

export default DashboardLayout;
