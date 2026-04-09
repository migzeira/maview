import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import MaviewLogo from "./MaviewLogo";
import FloatingAIButton from "./FloatingAIButton";
import {
  Home, FileText, BarChart3, Sparkles, Settings,
  LogOut, ExternalLink, Copy, Check, ChevronLeft, ChevronRight, Menu,
  TrendingUp, Zap, X, ArrowUpRight,
} from "lucide-react";

// ── Navigation ─────────────────────────────────────────────────────────────

interface NavItem {
  path: string;
  label: string;
  icon: typeof Home;
  badge?: string | null;
  pulse?: boolean;
}

const NAV_TOP: NavItem[] = [
  { path: "/dashboard", label: "Home", icon: Home },
];

const NAV_MAIN: NavItem[] = [
  { path: "/dashboard/pagina", label: "Minha Página", icon: FileText },
  { path: "/dashboard/audiencia", label: "Analytics", icon: BarChart3 },
  { path: "/dashboard/ia", label: "IA Maview", icon: Sparkles, badge: "Novo" },
];

const NAV_BOTTOM: NavItem[] = [
  { path: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

// ── Health calculator (lightweight, from localStorage) ──────────────────────

const LS_KEY = "maview_vitrine_config";

function getHealthFromStorage(): { score: number; missing: string[] } {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { score: 0, missing: ["perfil", "produto", "links", "depoimentos", "whatsapp"] };
    const cfg = JSON.parse(raw);
    const missing: string[] = [];
    let s = 0;
    if (cfg.avatarUrl) s += 15; else missing.push("foto");
    if (cfg.displayName && cfg.bio) s += 10; else missing.push("bio");
    if (cfg.theme) s += 10;
    if (cfg.products?.some((p: { active: boolean }) => p.active)) s += 20; else missing.push("produto");
    if (cfg.links?.length > 0) s += 15; else missing.push("links");
    if (cfg.testimonials?.length > 0) s += 15; else missing.push("depoimentos");
    if (cfg.whatsapp) s += 15; else missing.push("whatsapp");
    return { score: s, missing };
  } catch {
    return { score: 0, missing: [] };
  }
}

// ── Component ──────────────────────────────────────────────────────────────

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
  const [health, setHealth] = useState({ score: 0, missing: [] as string[] });

  // Read username from vitrine config (most reliable) or fall back to auth
  const authUsername = user?.user_metadata?.username || user?.email?.split("@")[0] || "usuario";
  const vitrineUsername = (() => {
    try {
      const cfg = JSON.parse(localStorage.getItem("maview_vitrine_config") || "{}");
      return cfg.username || authUsername;
    } catch { return authUsername; }
  })();
  const username = vitrineUsername.replace(/^@/, "");
  const displayName = user?.user_metadata?.full_name || username;
  const profileUrl = `maview.app/@${username}`;
  const initials = displayName.slice(0, 2).toUpperCase();

  // Auth
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

  // Health score — refresh on route change (user may have edited vitrine)
  useEffect(() => {
    setHealth(getHealthFromStorage());
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Build the vitrine URL using current origin so it works on any deploy
  const vitrineUrl = `${window.location.origin}/${username}`;

  const copyLink = () => {
    navigator.clipboard.writeText(vitrineUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const openVitrine = () => {
    window.open(vitrineUrl, "_blank", "noopener,noreferrer");
  };

  // Health ring SVG
  const healthRing = useMemo(() => {
    const r = 8;
    const c = 2 * Math.PI * r;
    const offset = c - (health.score / 100) * c;
    const color = health.score >= 80 ? "#10b981" : health.score >= 50 ? "#f59e0b" : "#ef4444";
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" className="flex-shrink-0">
        <circle cx="11" cy="11" r={r} fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[hsl(var(--dash-border-subtle))]" />
        <circle cx="11" cy="11" r={r} fill="none" stroke={color} strokeWidth="2.5"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 11 11)" className="transition-all duration-700" />
        <text x="11" y="11.5" textAnchor="middle" dominantBaseline="middle"
          fontSize="6" fontWeight="700" fill={color}>
          {health.score}
        </text>
      </svg>
    );
  }, [health.score]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--dash-bg))] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // ── Nav item renderer ──────────────────────────────────────────────────────

  const renderNavItem = (item: NavItem, showHealth = false) => {
    const active = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
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
        <item.icon
          size={17}
          strokeWidth={active ? 2.2 : 1.8}
          className={`transition-colors flex-shrink-0 ${active ? "text-primary" : "text-[hsl(var(--dash-text-subtle))] group-hover:text-primary/60"}`}
        />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {showHealth && health.score < 100 && healthRing}
            {item.badge && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white leading-none animate-pulse">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );
  };

  // ── Sidebar content ────────────────────────────────────────────────────────

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 flex-shrink-0">
        <MaviewLogo size={36} />
        {!collapsed && (
          <span className="text-[20px] font-extrabold tracking-tight bg-gradient-to-r from-[#6D28D9] via-[#8B5CF6] to-[#60A5FA] bg-clip-text text-transparent">
            Maview
          </span>
        )}
      </div>

      <div className="mx-4 dash-divider" />

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-4 space-y-1 overflow-y-auto">
        {/* Home */}
        {NAV_TOP.map(item => renderNavItem(item))}

        {/* Divider */}
        <div className="pt-3 pb-1">
          {!collapsed && (
            <div className="dash-divider mx-1" />
          )}
          {collapsed && <div className="dash-divider mx-1" />}
        </div>

        {/* Main nav */}
        {NAV_MAIN.map((item, i) => renderNavItem(item, i === 0))}

        {/* Divider */}
        <div className="pt-3 pb-1">
          <div className="dash-divider mx-1" />
        </div>

        {/* Bottom nav */}
        {NAV_BOTTOM.map(item => renderNavItem(item))}
      </nav>

      {/* ── Bottom section: Profile + CTA ── */}
      {!collapsed && (
        <div className="px-3 pb-4 pt-2 space-y-3">
          <div className="dash-divider" />

          {/* Health progress card — engagement trigger */}
          {health.score < 100 && (
            <Link to="/dashboard/pagina"
              className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10 hover:border-primary/25 transition-all group">
              {healthRing}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[hsl(var(--dash-text))]">
                  {health.score < 30 ? "Monte sua página" : health.score < 70 ? "Quase lá!" : "Últimos ajustes"}
                </p>
                <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] truncate">
                  {health.missing.length > 0
                    ? `Falta: ${health.missing.slice(0, 2).join(", ")}${health.missing.length > 2 ? "..." : ""}`
                    : "Finalizando..."
                  }
                </p>
              </div>
              <ArrowUpRight size={12} className="text-[hsl(var(--dash-text-subtle))] group-hover:text-primary transition-colors flex-shrink-0" />
            </Link>
          )}

          {/* Pro upgrade teaser — conversion trigger */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1035] to-[#0f0a1e] p-3.5 border border-white/5">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-violet-500/20 to-transparent rounded-bl-full" />
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Zap size={12} className="text-amber-400" />
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Pro</span>
              </div>
              <p className="text-white text-[12px] font-semibold leading-tight mb-1">
                Domínio próprio + analytics avançado
              </p>
              <p className="text-white/40 text-[10px] mb-2.5">
                Remova "maview.app" do seu link
              </p>
              <button className="w-full text-[11px] font-semibold py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all">
                Em breve
              </button>
            </div>
          </div>

          {/* Profile mini-card */}
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-[11px] font-bold ring-2 ring-primary/10 flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-[hsl(var(--dash-text))] truncate">{displayName}</p>
              <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] font-mono truncate">@{username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-red-400 hover:bg-red-50 transition-all flex-shrink-0"
              title="Sair"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Collapsed: collapse toggle */}
      <div className="hidden md:block px-3 pb-4 pt-2">
        {collapsed && <div className="dash-divider mb-3" />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-xl text-[hsl(var(--dash-text-subtle))] hover:text-primary hover:bg-[hsl(var(--dash-surface-2))] transition-all"
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[hsl(var(--dash-bg))] flex">

      {/* ── Copy toast ── */}
      {copied && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[hsl(var(--dash-text))] text-[hsl(var(--dash-bg))] shadow-2xl text-[13px] font-semibold">
            <Check size={15} className="text-emerald-500 flex-shrink-0" />
            Link copiado! Cole e compartilhe sua vitrine 🚀
          </div>
        </div>
      )}
      {/* Desktop sidebar */}
      <aside
        className={`
          hidden md:flex flex-col flex-shrink-0
          border-r border-[hsl(var(--dash-border-subtle))]
          bg-[hsl(var(--dash-surface))]
          transition-all duration-300
          ${collapsed ? "w-[68px]" : "w-[260px]"}
        `}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-[hsl(var(--dash-surface))] border-r border-[hsl(var(--dash-border-subtle))] shadow-2xl"
            style={{ animation: "slideRight 0.2s ease" }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-[hsl(var(--dash-border-subtle))] flex-shrink-0 bg-[hsl(var(--dash-surface))]/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-colors">
              <Menu size={20} />
            </button>
            <button
              onClick={copyLink}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 transition-all text-[12px] text-[hsl(var(--dash-text-muted))] font-mono"
            >
              {profileUrl}
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="opacity-40" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openVitrine}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg btn-primary-gradient text-[12px] font-medium transition-transform active:scale-95"
            >
              <ExternalLink size={12} />
              <span className="hidden sm:inline">Ver página</span>
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
