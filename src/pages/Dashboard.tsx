import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  LogOut, User as UserIcon, Plus, Link2, ShoppingBag,
  BarChart3, Palette, Eye, Copy, Check, Trash2,
  GripVertical, Globe, Instagram, Youtube, Twitter,
} from "lucide-react";

/* ─── Logo ────────────────────────────────────────────────────── */

const MaviewLogo = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dFront" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
        <stop offset="0%" stopColor="#8B5CF6"/><stop offset="100%" stopColor="#4C1D95"/>
      </linearGradient>
      <linearGradient id="dBack" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
        <stop offset="0%" stopColor="#5B21B6"/><stop offset="100%" stopColor="#1A0A35"/>
      </linearGradient>
      <clipPath id="dClip"><rect width="100" height="100"/></clipPath>
    </defs>
    <g clipPath="url(#dClip)">
      <polygon points="18,92 38,8 63,46 88,8 108,92" fill="url(#dBack)" opacity="0.68"/>
      <polygon points="4,92 26,12 50,52 74,12 96,92" fill="url(#dFront)"/>
    </g>
  </svg>
);

/* ─── Types ───────────────────────────────────────────────────── */

type Tab = "links" | "aparencia" | "analytics";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  active: boolean;
}

const ICON_OPTIONS = [
  { value: "globe",     icon: Globe,      label: "Website" },
  { value: "instagram", icon: Instagram,  label: "Instagram" },
  { value: "youtube",   icon: Youtube,    label: "YouTube" },
  { value: "twitter",   icon: Twitter,    label: "Twitter / X" },
  { value: "shop",      icon: ShoppingBag, label: "Loja" },
  { value: "link",      icon: Link2,      label: "Outro" },
];

const THEMES = [
  { id: "dark-purple", name: "Dark Purple", bg: "#0F0B1F", accent: "#6D28D9", card: "#1A1333" },
  { id: "midnight",    name: "Midnight",    bg: "#0a0a0f", accent: "#3B82F6", card: "#111827" },
  { id: "forest",      name: "Forest",      bg: "#0d1f0d", accent: "#22C55E", card: "#0f2a0f" },
  { id: "rose",        name: "Rose",        bg: "#1a0d12", accent: "#F43F5E", card: "#2a1018" },
  { id: "amber",       name: "Amber",       bg: "#1a1200", accent: "#F59E0B", card: "#2a1e00" },
  { id: "cyan",        name: "Ocean",       bg: "#031220", accent: "#06B6D4", card: "#081f35" },
];

const getLinkIcon = (iconValue: string) => {
  const found = ICON_OPTIONS.find((o) => o.value === iconValue);
  return found ? found.icon : Link2;
};

/* ─── Dashboard ───────────────────────────────────────────────── */

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("links");
  const [copied, setCopied] = useState(false);

  // Links state
  const [links, setLinks] = useState<LinkItem[]>([
    { id: "1", title: "Meu Instagram", url: "https://instagram.com/seunome", icon: "instagram", active: true },
    { id: "2", title: "Meu YouTube",   url: "https://youtube.com/@seunome",  icon: "youtube",   active: true },
  ]);
  const [addingLink, setAddingLink] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newIcon, setNewIcon] = useState("link");

  // Appearance state
  const [selectedTheme, setSelectedTheme] = useState("dark-purple");
  const [bioName, setBioName] = useState("");
  const [bioText, setBioText] = useState("");

  const username = user?.user_metadata?.username || user?.email?.split("@")[0] || "seunome";
  const displayName = user?.user_metadata?.full_name || username;
  const profileUrl = `maview.app/${username}`;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/login");
      else setUser(session.user);
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

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${profileUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addLink = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    const url = newUrl.startsWith("http") ? newUrl : `https://${newUrl}`;
    setLinks((prev) => [...prev, { id: Date.now().toString(), title: newTitle, url, icon: newIcon, active: true }]);
    setNewTitle(""); setNewUrl(""); setNewIcon("link"); setAddingLink(false);
  };

  const toggleLink = (id: string) => setLinks((prev) => prev.map((l) => l.id === id ? { ...l, active: !l.active } : l));
  const deleteLink = (id: string) => setLinks((prev) => prev.filter((l) => l.id !== id));

  const currentTheme = THEMES.find((t) => t.id === selectedTheme) || THEMES[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-maview-bg flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-maview-purple/30 border-t-maview-purple rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-maview-bg flex flex-col">

      {/* ── Header ── */}
      <header className="border-b border-white/[0.05] px-6 h-16 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="drop-shadow-[0_0_8px_rgba(109,40,217,0.4)]">
            <MaviewLogo size={28} />
          </div>
          <span className="text-white text-lg font-bold tracking-tight">Maview</span>
        </div>

        {/* Profile link pill */}
        <button
          onClick={copyLink}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-maview-purple/10 border border-maview-purple/20 hover:bg-maview-purple/20 transition-all text-sm text-maview-purple-light font-medium"
        >
          <Globe size={13} />
          {profileUrl}
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-maview-purple to-maview-purple-dark flex items-center justify-center">
              <UserIcon size={11} className="text-white" />
            </div>
            <span className="text-sm text-white/70 hidden md:block">{displayName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-maview-muted hover:text-white hover:bg-white/[0.04] transition-all text-sm"
          >
            <LogOut size={14} />
            <span className="hidden sm:block">Sair</span>
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar nav ── */}
        <aside className="hidden md:flex flex-col w-56 border-r border-white/[0.05] px-3 py-6 gap-1 flex-shrink-0">
          {([
            { id: "links",     icon: Link2,      label: "Meus Links" },
            { id: "aparencia", icon: Palette,     label: "Aparência" },
            { id: "analytics", icon: BarChart3,   label: "Analytics" },
          ] as { id: Tab; icon: any; label: string }[]).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === id
                  ? "bg-maview-purple/15 text-white border border-maview-purple/25"
                  : "text-maview-muted hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">

            {/* ── Left panel ── */}
            <div className="flex-1 min-w-0">

              {/* Mobile tabs */}
              <div className="flex md:hidden bg-white/[0.04] rounded-xl p-1 mb-6 border border-white/[0.05]">
                {([
                  { id: "links", label: "Links" },
                  { id: "aparencia", label: "Aparência" },
                  { id: "analytics", label: "Analytics" },
                ] as { id: Tab; label: string }[]).map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                      tab === id ? "bg-maview-purple text-white" : "text-maview-muted"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* ══ LINKS TAB ══ */}
              {tab === "links" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-white font-semibold text-lg">Meus Links</h2>
                      <p className="text-maview-muted text-sm">Gerencie os links da sua vitrine</p>
                    </div>
                    <button
                      onClick={() => setAddingLink(true)}
                      className="flex items-center gap-2 bg-maview-purple text-white text-sm font-medium px-4 py-2 rounded-xl hover:brightness-110 transition-all active:scale-[0.98]"
                    >
                      <Plus size={15} /> Adicionar link
                    </button>
                  </div>

                  {/* Add link form */}
                  {addingLink && (
                    <div className="bg-maview-card/60 border border-maview-purple/30 rounded-2xl p-5 space-y-3">
                      <p className="text-white text-sm font-medium mb-2">Novo link</p>
                      <input
                        type="text" placeholder="Título (ex: Meu Instagram)"
                        value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-maview-muted/50 outline-none focus:border-maview-purple transition-all"
                      />
                      <input
                        type="url" placeholder="URL (ex: https://instagram.com/seunome)"
                        value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-maview-muted/50 outline-none focus:border-maview-purple transition-all"
                      />
                      <div className="flex flex-wrap gap-2">
                        {ICON_OPTIONS.map(({ value, icon: Icon, label }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setNewIcon(value)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                              newIcon === value
                                ? "bg-maview-purple/20 border-maview-purple/50 text-white"
                                : "bg-white/[0.03] border-white/[0.07] text-maview-muted hover:text-white"
                            }`}
                          >
                            <Icon size={12} /> {label}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={addLink}
                          className="flex-1 h-9 rounded-xl bg-maview-purple text-white text-sm font-medium hover:brightness-110 transition-all"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => { setAddingLink(false); setNewTitle(""); setNewUrl(""); }}
                          className="flex-1 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] text-maview-muted text-sm hover:text-white transition-all"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Links list */}
                  {links.length === 0 && !addingLink && (
                    <div className="text-center py-16 text-maview-muted">
                      <Link2 size={32} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Nenhum link ainda. Adicione o primeiro!</p>
                    </div>
                  )}

                  {links.map((link) => {
                    const Icon = getLinkIcon(link.icon);
                    return (
                      <div
                        key={link.id}
                        className={`flex items-center gap-3 bg-maview-card/50 border rounded-2xl px-4 py-3.5 transition-all ${
                          link.active ? "border-white/[0.07]" : "border-white/[0.03] opacity-50"
                        }`}
                      >
                        <GripVertical size={16} className="text-maview-muted/40 cursor-grab flex-shrink-0" />
                        <div className="w-9 h-9 rounded-xl bg-maview-purple/10 border border-maview-purple/20 flex items-center justify-center flex-shrink-0">
                          <Icon size={16} className="text-maview-purple-light" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{link.title}</p>
                          <p className="text-maview-muted/60 text-xs truncate">{link.url}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Toggle */}
                          <button
                            onClick={() => toggleLink(link.id)}
                            className={`w-10 h-5 rounded-full transition-all relative ${
                              link.active ? "bg-maview-purple" : "bg-white/[0.08]"
                            }`}
                          >
                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                              link.active ? "left-[22px]" : "left-0.5"
                            }`} />
                          </button>
                          <button onClick={() => deleteLink(link.id)} className="text-maview-muted/40 hover:text-red-400 transition-colors p-1">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ══ APARÊNCIA TAB ══ */}
              {tab === "aparencia" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-white font-semibold text-lg mb-1">Aparência</h2>
                    <p className="text-maview-muted text-sm">Personalize sua vitrine</p>
                  </div>

                  {/* Bio info */}
                  <div className="space-y-4">
                    <p className="text-white text-sm font-medium">Informações do perfil</p>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-maview-muted block mb-1.5">Nome exibido</label>
                        <input
                          type="text" placeholder={displayName}
                          value={bioName} onChange={(e) => setBioName(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-maview-muted/50 outline-none focus:border-maview-purple transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-maview-muted block mb-1.5">Bio</label>
                        <textarea
                          placeholder="Escreva algo sobre você..."
                          value={bioText} onChange={(e) => setBioText(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-maview-muted/50 outline-none focus:border-maview-purple transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Theme picker */}
                  <div>
                    <p className="text-white text-sm font-medium mb-3">Tema da vitrine</p>
                    <div className="grid grid-cols-3 gap-3">
                      {THEMES.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setSelectedTheme(theme.id)}
                          className={`relative rounded-2xl p-3 border transition-all ${
                            selectedTheme === theme.id
                              ? "border-maview-purple shadow-lg shadow-maview-purple/20"
                              : "border-white/[0.07] hover:border-white/[0.15]"
                          }`}
                          style={{ background: theme.bg }}
                        >
                          {selectedTheme === theme.id && (
                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-maview-purple flex items-center justify-center">
                              <Check size={10} className="text-white" />
                            </div>
                          )}
                          <div className="flex gap-1 mb-2">
                            {[1,2].map((i) => (
                              <div key={i} className="h-2 rounded-full flex-1" style={{ background: i === 1 ? theme.accent : theme.card, opacity: i === 2 ? 0.5 : 1 }} />
                            ))}
                          </div>
                          <div className="h-1.5 rounded-full mb-1.5 w-3/4" style={{ background: theme.card }} />
                          <div className="h-1.5 rounded-full w-1/2" style={{ background: theme.card }} />
                          <p className="text-white/60 text-[10px] mt-2 font-medium">{theme.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-600 to-maview-purple text-white text-sm font-semibold hover:brightness-110 transition-all active:scale-[0.98]">
                    Salvar alterações
                  </button>
                </div>
              )}

              {/* ══ ANALYTICS TAB ══ */}
              {tab === "analytics" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-white font-semibold text-lg mb-1">Analytics</h2>
                    <p className="text-maview-muted text-sm">Acompanhe o desempenho da sua vitrine</p>
                  </div>

                  {/* Stats cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Visitas hoje",    value: "—", sub: "em breve" },
                      { label: "Cliques totais",  value: "—", sub: "em breve" },
                      { label: "Link mais clicado", value: "—", sub: "em breve" },
                      { label: "Conversão",       value: "—", sub: "em breve" },
                    ].map((s) => (
                      <div key={s.label} className="bg-maview-card/50 border border-white/[0.06] rounded-2xl p-5">
                        <p className="text-maview-muted text-xs mb-2">{s.label}</p>
                        <p className="text-white text-2xl font-bold">{s.value}</p>
                        <p className="text-maview-muted/50 text-xs mt-1">{s.sub}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-maview-card/30 border border-white/[0.05] rounded-2xl p-8 text-center">
                    <BarChart3 size={36} className="mx-auto mb-3 text-maview-purple/40" />
                    <p className="text-white/60 text-sm font-medium">Analytics em desenvolvimento</p>
                    <p className="text-maview-muted/50 text-xs mt-1">Em breve você verá seus dados aqui</p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right panel — Live preview ── */}
            <div className="lg:w-[260px] flex-shrink-0">
              <div className="sticky top-8">
                <div className="flex items-center gap-2 mb-4">
                  <Eye size={14} className="text-maview-muted" />
                  <span className="text-maview-muted text-xs font-medium">Preview ao vivo</span>
                </div>

                {/* Phone mockup */}
                <div className="rounded-[28px] border-4 border-white/10 overflow-hidden shadow-2xl shadow-black/50" style={{ background: currentTheme.bg }}>
                  <div className="px-5 pt-8 pb-6">
                    {/* Avatar */}
                    <div className="flex flex-col items-center mb-4">
                      <div className="w-16 h-16 rounded-full mb-3 flex items-center justify-center shadow-xl" style={{ background: `linear-gradient(135deg, ${currentTheme.accent}, ${currentTheme.accent}88)` }}>
                        <span className="text-white text-xl font-bold">{(bioName || displayName).charAt(0).toUpperCase()}</span>
                      </div>
                      <p className="text-white text-sm font-bold text-center">{bioName || displayName}</p>
                      {bioText && <p className="text-white/50 text-xs text-center mt-1 leading-relaxed">{bioText}</p>}
                      <p className="text-xs mt-1.5 font-medium" style={{ color: currentTheme.accent }}>@{username}</p>
                    </div>

                    {/* Links preview */}
                    <div className="space-y-2.5">
                      {links.filter((l) => l.active).slice(0, 4).map((link) => {
                        const Icon = getLinkIcon(link.icon);
                        return (
                          <div
                            key={link.id}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-white"
                            style={{ background: currentTheme.card, border: `1px solid ${currentTheme.accent}30` }}
                          >
                            <Icon size={13} style={{ color: currentTheme.accent }} />
                            <span className="truncate">{link.title}</span>
                          </div>
                        );
                      })}
                      {links.filter((l) => l.active).length === 0 && (
                        <p className="text-center text-xs text-white/20 py-4">Seus links aparecem aqui</p>
                      )}
                    </div>

                    {/* Maview badge */}
                    <div className="mt-5 flex items-center justify-center gap-1.5">
                      <MaviewLogo size={12} />
                      <span className="text-white/25 text-[10px]">maview.app</span>
                    </div>
                  </div>
                </div>

                {/* Copy link */}
                <button
                  onClick={copyLink}
                  className="w-full mt-4 flex items-center justify-center gap-2 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] text-maview-muted hover:text-white hover:border-white/[0.15] transition-all text-sm"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copied ? "Copiado!" : "Copiar meu link"}
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
