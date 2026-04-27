import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import MaviewLogo from "./MaviewLogo";
import FloatingAIButton from "./FloatingAIButton";
import AmbientGlow from "./AmbientGlow";
import NotificationCenter from "./NotificationCenter";
import StanleyAvatar from "./StanleyAvatar";
import CommandPalette from "./CommandPalette";
import {
  Home, FileText, BarChart3, Sparkles, Settings,
  LogOut, ExternalLink, Copy, Check, ChevronLeft, ChevronRight, Menu,
  TrendingUp, Zap, X, ArrowUpRight, Sun, Moon, Users, DollarSign,
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
  { path: "/dashboard", label: "Início", icon: Home },
];

const NAV_MAIN: NavItem[] = [
  { path: "/dashboard/pagina", label: "Minha Loja", icon: FileText },
  { path: "/dashboard/monetizacao", label: "Renda", icon: DollarSign },
  { path: "/dashboard/analytics", label: "Análises", icon: BarChart3 },
  { path: "/dashboard/clientes", label: "Clientes", icon: Users },
  { path: "/dashboard/automacoes", label: "AutoDM", icon: Zap },
  { path: "/dashboard/ia", label: "IA Stanley", icon: Sparkles, badge: "Novo" },
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

// ── Route transition wrapper ──────────────────────────────────────────────

const RouteTransition = ({ children, locationKey }: { children: React.ReactNode; locationKey: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const prevKey = useRef(locationKey);
  useEffect(() => {
    if (prevKey.current !== locationKey && ref.current) {
      ref.current.classList.remove("route-enter");
      void ref.current.offsetWidth; // force reflow
      ref.current.classList.add("route-enter");
      prevKey.current = locationKey;
    }
  }, [locationKey]);
  return <div ref={ref} className="route-enter">{children}</div>;
};

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
  const [proWaitlist, setProWaitlist] = useState(() => localStorage.getItem("maview_pro_waitlist") === "1");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("maview_dark") === "1");

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
  const profileUrl = `maview.app/${username}`;
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

  // Dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("maview_dark", darkMode ? "1" : "0");
  }, [darkMode]);

  // SEO: noindex for dashboard pages
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    if (meta) meta.content = "noindex, nofollow";
    else {
      meta = document.createElement("meta");
      meta.name = "robots";
      meta.content = "noindex, nofollow";
      document.head.appendChild(meta);
    }
    document.title = "Maview — Link na bio + Loja digital gratis para criadores";
    return () => { if (meta) meta.content = "index, follow"; };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Build the vitrine URL using current origin so it works on any deploy
  const vitrineUrl = `${window.location.origin}/${username}`;

  const copyLink = () => {
    navigator.clipboard.writeText(vitrineUrl).catch(() => {});
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
        {/* Stanley AI tem mascot exclusivo (estilo Stan que usa avatar do Stanley) */}
        {item.path === "/dashboard/ia" ? (
          <div className="flex-shrink-0" style={{ width: 17, height: 17 }}>
            <StanleyAvatar size="xs" animated />
          </div>
        ) : (
          <item.icon
            size={17}
            strokeWidth={active ? 2.2 : 1.8}
            className={`transition-colors flex-shrink-0 ${active ? "text-primary" : "text-[hsl(var(--dash-text-subtle))] group-hover:text-primary/60"}`}
          />
        )}
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {showHealth && health.score < 100 && healthRing}
            {item.badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-white leading-none">
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
          <span className="text-[20px] font-bold tracking-tight text-[hsl(var(--dash-text))]">
            Maview
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-4 space-y-1 overflow-y-auto" aria-label="Menu principal">
        {/* Home */}
        {NAV_TOP.map(item => renderNavItem(item))}

        {/* Spacer */}
        <div className="pt-2" />

        {/* Main nav */}
        {NAV_MAIN.map((item, i) => renderNavItem(item, i === 0))}
      </nav>

      {/* ── Bottom section: Settings + Profile (estilo Stan minimalista) ── */}
      {!collapsed && (
        <div className="px-3 pb-3 pt-2 space-y-1">
          {/* Settings — link discreto (igual Stan) */}
          <Link
            to="/dashboard/configuracoes"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all group ${
              location.pathname === "/dashboard/configuracoes"
                ? "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-accent-fg))]"
                : "text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text-secondary))] hover:bg-[hsl(var(--dash-surface-2))]"
            }`}
          >
            <Settings size={17} strokeWidth={1.8} className="text-[hsl(var(--dash-text-subtle))] group-hover:text-primary/60 transition-colors" />
            <span className="flex-1">Configurações</span>
          </Link>

          {/* Profile mini-card — clica abre menu (Stan style) */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[hsl(var(--dash-surface-2))] transition-all group"
            title="Clique para sair"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[12px] font-semibold text-[hsl(var(--dash-text))] truncate">{displayName}</p>
              <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] font-mono truncate">@{username}</p>
            </div>
            <LogOut size={13} className="text-[hsl(var(--dash-text-subtle))] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </button>
        </div>
      )}

      {/* Collapsed: collapse toggle */}
      <div className="hidden md:block px-3 pb-4 pt-2">
        {collapsed && <div className="dash-divider mb-3" />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-xl text-[hsl(var(--dash-text-subtle))] hover:text-primary hover:bg-[hsl(var(--dash-surface-2))] transition-all"
          aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[hsl(var(--dash-bg))] flex relative">
      <AmbientGlow />
      {/* Skip to content — accessibility */}
      <a href="#main-content" className="skip-to-content">Pular para o conteúdo</a>

      {/* ── Copy toast ── */}
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg transition-all duration-300 pointer-events-none ${copied ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}`}
        style={{ background: "hsl(var(--primary))", color: "#fff" }}>
        <Check size={14} />
        <span className="text-body-sm font-semibold">Link copiado com sucesso!</span>
      </div>
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
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} role="button" aria-label="Fechar menu" tabIndex={0} onKeyDown={(e) => e.key === "Escape" && setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-[hsl(var(--dash-surface))] border-r border-[hsl(var(--dash-border-subtle))] shadow-2xl"
            style={{ animation: "slideRight 0.2s ease" }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar — URL bar PROEMINENTE estilo Stan ('stan.store/fzandre__') */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-[hsl(var(--dash-border-subtle))] flex-shrink-0 bg-[hsl(var(--dash-surface))]/80 backdrop-blur-xl z-10">
          {/* Esquerda: menu mobile */}
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 -ml-2 touch-target text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-colors" aria-label="Abrir menu">
              <Menu size={20} />
            </button>
          </div>

          {/* CENTRO: URL bar destacada (estilo Stan) */}
          <button
            onClick={copyLink}
            className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[hsl(var(--dash-surface-2))] to-[hsl(var(--dash-surface-2))]/60 border border-[hsl(var(--dash-border))] hover:border-primary/40 hover:shadow-md hover:shadow-primary/10 transition-all group"
            title="Clique para copiar"
          >
            {/* Indicador LIVE pulsante */}
            <div className="flex items-center gap-1.5">
              <div className="relative w-2 h-2">
                <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-50" />
                <div className="relative w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Live</span>
            </div>
            {/* Separador */}
            <div className="w-px h-4 bg-[hsl(var(--dash-border))]" />
            {/* URL */}
            <span className="text-[13px] font-mono font-semibold text-[hsl(var(--dash-text))] group-hover:text-primary transition-colors">
              {profileUrl}
            </span>
            {/* Copy icon */}
            {copied ? (
              <Check size={14} className="text-emerald-500" />
            ) : (
              <Copy size={14} className="text-[hsl(var(--dash-text-subtle))] group-hover:text-primary transition-colors" />
            )}
          </button>

          {/* Direita: cmd+k hint + notifications + dark mode + ver vitrine */}
          <div className="flex items-center gap-2">
            {/* Hint Cmd+K (estilo Linear/Notion) */}
            <button
              onClick={() => {
                /* Trigger Cmd+K via keyboard event simulado */
                const isMac = navigator.platform.toLowerCase().includes("mac");
                const event = new KeyboardEvent("keydown", {
                  key: "k",
                  metaKey: isMac,
                  ctrlKey: !isMac,
                  bubbles: true,
                });
                window.dispatchEvent(event);
              }}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 transition-all text-[hsl(var(--dash-text-subtle))] hover:text-[hsl(var(--dash-text))]"
              title="Abrir comandos (Cmd+K)"
            >
              <span className="text-[11px] font-medium">Comandos</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border))] text-[10px] font-mono">⌘K</kbd>
            </button>
            <NotificationCenter />
            <button
              onClick={() => setDarkMode(d => !d)}
              className="p-2 rounded-lg touch-target text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] hover:bg-[hsl(var(--dash-surface-2))] transition-all"
              title={darkMode ? "Modo claro" : "Modo escuro"}
              aria-label={darkMode ? "Ativar modo claro" : "Ativar modo escuro"}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={openVitrine}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg btn-primary-gradient text-[13px] font-semibold transition-transform active:scale-95 shadow-md"
              aria-label="Ver vitrine"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">Abrir página</span>
            </button>
          </div>
        </header>

        <main id="main-content" className="flex-1 overflow-y-auto bg-[hsl(var(--dash-bg))]" role="main">
          <RouteTransition locationKey={location.pathname}>
            {children}
          </RouteTransition>
        </main>
        <FloatingAIButton />
      </div>

      {/* Command Palette global — Cmd+K abre de qualquer lugar */}
      <CommandPalette username={username} />
    </div>
  );
};

export default DashboardLayout;
