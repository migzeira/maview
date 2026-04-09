import { useState, useEffect, useCallback, useRef } from "react";
import {
  User, Palette, Package, Link2, Star, Plus, Trash2, Pencil,
  Check, ToggleLeft, ToggleRight, Instagram, Youtube, Twitter, Globe,
  MessageCircle, Clock, ChevronDown, ChevronUp, Eye, X, Copy, ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// ── Types ──────────────────────────────────────────────────────────────────

type ThemeId = "dark-purple" | "midnight" | "forest" | "rose" | "amber" | "ocean";

interface ProductItem {
  id: string;
  title: string;
  description: string;
  price: string;
  originalPrice: string;
  emoji: string;
  url: string;
  badge: string;
  urgency: boolean;
  active: boolean;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: "instagram" | "youtube" | "twitter" | "globe" | "link";
  active: boolean;
  isSocial: boolean;
}

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  text: string;
  stars: number;
  avatar: string;
}

interface VitrineConfig {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
  whatsapp: string;
  theme: ThemeId;
  products: ProductItem[];
  links: LinkItem[];
  testimonials: TestimonialItem[];
}

// ── Theme definitions ──────────────────────────────────────────────────────

const THEMES: { id: ThemeId; label: string; bg: string; accent: string; accent2: string }[] = [
  { id: "dark-purple", label: "Roxo Escuro",  bg: "#080612", accent: "#a855f7", accent2: "#ec4899" },
  { id: "midnight",    label: "Meia Noite",   bg: "#05080f", accent: "#60a5fa", accent2: "#818cf8" },
  { id: "forest",      label: "Floresta",     bg: "#050f05", accent: "#4ade80", accent2: "#34d399" },
  { id: "rose",        label: "Rosa",         bg: "#100509", accent: "#f43f5e", accent2: "#fb7185" },
  { id: "amber",       label: "Âmbar",        bg: "#0f0a00", accent: "#f59e0b", accent2: "#fcd34d" },
  { id: "ocean",       label: "Oceano",       bg: "#020c14", accent: "#06b6d4", accent2: "#22d3ee" },
];

const DEFAULT_CONFIG: VitrineConfig = {
  displayName: "",
  username: "",
  bio: "",
  avatarUrl: "",
  whatsapp: "",
  theme: "dark-purple",
  products: [],
  links: [],
  testimonials: [],
};

const LS_KEY = "maview_vitrine_config";

const LINK_ICON_MAP: Record<LinkItem["icon"], React.ReactNode> = {
  instagram: <Instagram size={14} />,
  youtube:   <Youtube size={14} />,
  twitter:   <Twitter size={14} />,
  globe:     <Globe size={14} />,
  link:      <Link2 size={14} />,
};

const PRODUCT_EMOJIS = ["🎯", "📚", "🎨", "💡", "🚀", "🎤", "💎", "🔑", "⚡", "🛒"];

type TabId = "perfil" | "tema" | "produtos" | "links" | "depoimentos";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "perfil",      label: "Perfil",       icon: <User size={15} /> },
  { id: "tema",        label: "Tema",         icon: <Palette size={15} /> },
  { id: "produtos",    label: "Produtos",     icon: <Package size={15} /> },
  { id: "links",       label: "Links",        icon: <Link2 size={15} /> },
  { id: "depoimentos", label: "Depoimentos",  icon: <Star size={15} /> },
];

// ── Empty forms ────────────────────────────────────────────────────────────

const emptyProduct = (): ProductItem => ({
  id: Date.now().toString(),
  title: "", description: "", price: "", originalPrice: "",
  emoji: "🎯", url: "", badge: "", urgency: false, active: true,
});

const emptyLink = (isSocial: boolean): LinkItem => ({
  id: Date.now().toString(),
  title: "", url: "",
  icon: isSocial ? "instagram" : "globe",
  active: true, isSocial,
});

const emptyTestimonial = (): TestimonialItem => ({
  id: Date.now().toString(),
  name: "", role: "", text: "", stars: 5, avatar: "",
});

// ── Utilities ──────────────────────────────────────────────────────────────

function calcHealth(cfg: VitrineConfig): number {
  let s = 0;
  if (cfg.avatarUrl)  s += 15;
  if (cfg.displayName && cfg.bio) s += 10;
  if (cfg.theme)      s += 10;
  if (cfg.products.filter(p => p.active).length > 0) s += 20;
  if (cfg.links.length > 0)        s += 15;
  if (cfg.testimonials.length > 0) s += 15;
  if (cfg.whatsapp)   s += 15;
  return s;
}

function moveItem<T extends { id: string }>(arr: T[], id: string, dir: "up" | "down"): T[] {
  const idx = arr.findIndex(item => item.id === id);
  if (idx < 0) return arr;
  const to = dir === "up" ? idx - 1 : idx + 1;
  if (to < 0 || to >= arr.length) return arr;
  const copy = [...arr];
  [copy[idx], copy[to]] = [copy[to], copy[idx]];
  return copy;
}

function getDynamicSubtitle(cfg: VitrineConfig): { text: string; complete: boolean } {
  if (!cfg.avatarUrl)              return { text: "Adicione uma foto de perfil para personalizar sua vitrine", complete: false };
  if (cfg.products.length === 0)   return { text: "Crie seu primeiro produto e comece a vender", complete: false };
  if (cfg.links.length === 0)      return { text: "Adicione seus links e conecte suas redes sociais", complete: false };
  if (cfg.testimonials.length === 0) return { text: "Depoimentos aumentam conversão em 72% — adicione um", complete: false };
  return { text: "Sua vitrine está completa e no ar! 🚀", complete: true };
}

// ── Profile Hero Card ──────────────────────────────────────────────────────

interface ProfileHeroCardProps {
  config: VitrineConfig;
  onEditProfile: () => void;
}

const ProfileHeroCard = ({ config, onEditProfile }: ProfileHeroCardProps) => {
  const [copied, setCopied] = useState(false);
  const profileUrl = config.username ? `maview.app/@${config.username}` : null;
  const currentTheme = THEMES.find(t => t.id === config.theme) ?? THEMES[0];
  const health = calcHealth(config);
  const socialLinks = config.links.filter(l => l.isSocial && l.active);

  const initials = config.displayName
    ? config.displayName.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()
    : "?";

  const copyLink = () => {
    if (!profileUrl) return;
    navigator.clipboard.writeText(`https://${profileUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card rounded-2xl p-4 md:p-5 mb-5">
      <div className="flex items-start gap-4">
        {/* Avatar — click to edit profile */}
        <button onClick={onEditProfile} className="flex-shrink-0 relative group">
          <div
            className="w-[56px] h-[56px] rounded-2xl overflow-hidden"
            style={{ boxShadow: `0 0 0 3px ${currentTheme.accent}40` }}
          >
            {config.avatarUrl ? (
              <img src={config.avatarUrl} alt={config.displayName} className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold"
                style={{ background: `linear-gradient(135deg, ${currentTheme.accent}, ${currentTheme.accent2})` }}>
                {initials}
              </div>
            )}
          </div>
          <div className="absolute inset-0 rounded-2xl bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Pencil size={13} className="text-white" />
          </div>
        </button>

        {/* Name + bio + social */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <button onClick={onEditProfile}
              className="text-[hsl(var(--dash-text))] font-bold text-[17px] hover:text-primary transition-colors truncate text-left leading-tight">
              {config.displayName || "Seu nome"}
            </button>
            <button onClick={onEditProfile}
              className="p-1 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-primary hover:bg-[hsl(var(--dash-accent))] transition-all flex-shrink-0">
              <Pencil size={11} />
            </button>
          </div>

          {config.username && (
            <p className="text-[hsl(var(--dash-text-muted))] text-[12px] mb-1">@{config.username}</p>
          )}
          {config.bio && (
            <p className="text-[hsl(var(--dash-text-subtle))] text-[11.5px] line-clamp-1 mb-2">{config.bio}</p>
          )}

          {/* Social icons */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-1.5 mb-2.5">
              {socialLinks.map(l => (
                <a key={l.id} href={l.url || "#"} target="_blank" rel="noopener noreferrer"
                  className="w-6 h-6 rounded-full bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] flex items-center justify-center text-[hsl(var(--dash-text-muted))] hover:text-primary hover:border-primary/30 transition-all">
                  {LINK_ICON_MAP[l.icon]}
                </a>
              ))}
            </div>
          )}

          {/* Health score bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--dash-surface-2))] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${health}%`,
                  background: `linear-gradient(90deg, ${currentTheme.accent}, ${currentTheme.accent2})`
                }} />
            </div>
            <span className="text-[10px] font-bold text-[hsl(var(--dash-text-subtle))] flex-shrink-0 w-8">{health}%</span>
          </div>
        </div>

        {/* URL + action buttons */}
        {profileUrl && (
          <div className="hidden sm:flex flex-col items-end gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <button onClick={copyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 text-[12px] text-[hsl(var(--dash-text-secondary))] font-medium transition-all">
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copied ? "Copiado!" : "Copiar"}
              </button>
              <a href={`https://${profileUrl}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-primary-gradient text-[12px] font-medium">
                <ExternalLink size={12} /> Ver página
              </a>
            </div>
            <p className="text-[hsl(var(--dash-text-subtle))] text-[10px] font-mono">{profileUrl}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── LinkRow subcomponent ───────────────────────────────────────────────────

interface LinkRowProps {
  link: LinkItem;
  globalIndex: number;
  totalLinks: number;
  onEdit: (l: LinkItem) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onMove: (id: string, dir: "up" | "down") => void;
}

const LinkRow = ({ link, globalIndex, totalLinks, onEdit, onDelete, onToggle, onMove }: LinkRowProps) => (
  <div className={`flex items-center gap-2 rounded-xl border p-3 transition-all ${!link.active ? "opacity-50" : ""} glass-card-hover`}>
    {/* Up/down */}
    <div className="flex flex-col gap-0.5 flex-shrink-0">
      <button onClick={() => onMove(link.id, "up")} disabled={globalIndex === 0}
        className="p-0.5 rounded text-[hsl(var(--dash-text-subtle))] hover:text-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
        <ChevronUp size={12} />
      </button>
      <button onClick={() => onMove(link.id, "down")} disabled={globalIndex === totalLinks - 1}
        className="p-0.5 rounded text-[hsl(var(--dash-text-subtle))] hover:text-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
        <ChevronDown size={12} />
      </button>
    </div>

    <div className="w-8 h-8 rounded-lg bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
      {LINK_ICON_MAP[link.icon]}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium truncate">{link.title || link.url || "Sem título"}</p>
      {link.url && <p className="text-[hsl(var(--dash-text-subtle))] text-xs truncate">{link.url}</p>}
    </div>
    <div className="flex items-center gap-1">
      <button onClick={() => onEdit(link)} className="p-1.5 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-primary hover:bg-[hsl(var(--dash-accent))] transition-all">
        <Pencil size={13} />
      </button>
      <button onClick={() => onDelete(link.id)} className="p-1.5 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-red-500 hover:bg-red-50 transition-all">
        <Trash2 size={13} />
      </button>
      <button onClick={() => onToggle(link.id)}>
        {link.active
          ? <ToggleRight size={22} className="text-primary" />
          : <ToggleLeft size={22} className="text-[hsl(var(--dash-text-subtle))]" />}
      </button>
    </div>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────

const DashboardPagina = () => {
  const [config, setConfig] = useState<VitrineConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab]           = useState<TabId>("perfil");
  const [toastVisible, setToastVisible]     = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Product form
  const [productForm, setProductForm]         = useState<ProductItem | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Link form
  const [showLinkForm, setShowLinkForm]   = useState<"social" | "other" | null>(null);
  const [linkForm, setLinkForm]           = useState<LinkItem | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  // Testimonial form
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [testimonialForm, setTestimonialForm]         = useState<TestimonialItem>(emptyTestimonial());

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      const stored = localStorage.getItem(LS_KEY);
      const base: VitrineConfig = stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : { ...DEFAULT_CONFIG };
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const u = data.session.user;
          if (!base.displayName) base.displayName = u.user_metadata?.full_name || u.email?.split("@")[0] || "";
          if (!base.username)    base.username    = u.user_metadata?.username   || u.email?.split("@")[0] || "";
        }
      } catch { /* keep localStorage */ }
      setConfig(base);
    })();
  }, []);

  // ── Auto-save with toast ──────────────────────────────────────────────────

  const showSavedToast = useCallback(() => {
    setToastVisible(true);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 2000);
  }, []);

  const updateConfig = useCallback(<K extends keyof VitrineConfig>(key: K, value: VitrineConfig[K]) => {
    setConfig(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      return next;
    });
    showSavedToast();
  }, [showSavedToast]);

  // ── Product helpers ───────────────────────────────────────────────────────

  const openAddProduct  = () => { setEditingProductId(null); setProductForm(emptyProduct()); };
  const openEditProduct = (p: ProductItem) => { setEditingProductId(p.id); setProductForm({ ...p }); };
  const cancelProductForm = () => { setProductForm(null); setEditingProductId(null); };

  const saveProduct = () => {
    if (!productForm) return;
    if (editingProductId) {
      updateConfig("products", config.products.map(p => p.id === editingProductId ? { ...productForm, id: editingProductId } : p));
    } else {
      updateConfig("products", [...config.products, productForm]);
    }
    cancelProductForm();
  };

  const deleteProduct  = (id: string) => updateConfig("products", config.products.filter(p => p.id !== id));
  const toggleProduct  = (id: string) => updateConfig("products", config.products.map(p => p.id === id ? { ...p, active: !p.active } : p));
  const moveProduct    = (id: string, dir: "up" | "down") => updateConfig("products", moveItem(config.products, id, dir));

  // ── Link helpers ──────────────────────────────────────────────────────────

  const openAddLink = (isSocial: boolean) => {
    setEditingLinkId(null);
    setLinkForm(emptyLink(isSocial));
    setShowLinkForm(isSocial ? "social" : "other");
  };
  const openEditLink = (l: LinkItem) => {
    setEditingLinkId(l.id);
    setLinkForm({ ...l });
    setShowLinkForm(l.isSocial ? "social" : "other");
  };
  const cancelLinkForm = () => { setLinkForm(null); setEditingLinkId(null); setShowLinkForm(null); };

  const saveLink = () => {
    if (!linkForm) return;
    if (editingLinkId) {
      updateConfig("links", config.links.map(l => l.id === editingLinkId ? { ...linkForm, id: editingLinkId } : l));
    } else {
      updateConfig("links", [...config.links, linkForm]);
    }
    cancelLinkForm();
  };

  const deleteLink = (id: string) => updateConfig("links", config.links.filter(l => l.id !== id));
  const toggleLink = (id: string) => updateConfig("links", config.links.map(l => l.id === id ? { ...l, active: !l.active } : l));
  const moveLink   = (id: string, dir: "up" | "down") => updateConfig("links", moveItem(config.links, id, dir));

  // ── Testimonial helpers ───────────────────────────────────────────────────

  const saveTestimonial = () => {
    if (!testimonialForm.name.trim()) return;
    updateConfig("testimonials", [...config.testimonials, { ...testimonialForm, id: Date.now().toString() }]);
    setTestimonialForm(emptyTestimonial());
    setShowTestimonialForm(false);
  };
  const deleteTestimonial = (id: string) => updateConfig("testimonials", config.testimonials.filter(t => t.id !== id));

  // ── Derived ───────────────────────────────────────────────────────────────

  const currentTheme = THEMES.find(t => t.id === config.theme) ?? THEMES[0];
  const { text: subtitleText, complete: subtitleComplete } = getDynamicSubtitle(config);

  const tabCounts: Partial<Record<TabId, number>> = {
    produtos: config.products.length,
    links: config.links.length,
    depoimentos: config.testimonials.length,
  };

  const inputCls = "w-full rounded-xl border border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text))] text-sm px-3.5 py-2.5 placeholder:text-[hsl(var(--dash-text-subtle))] focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all";
  const labelCls = "block text-[hsl(var(--dash-text-secondary))] text-xs font-medium mb-1.5";

  // ── Phone preview (used in desktop panel + mobile sheet) ──────────────────

  const phonePreview = (
    <div className="relative">
      <div className="rounded-[2.8rem] border-[3px] border-[hsl(var(--dash-text))] overflow-hidden shadow-2xl">
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-1" style={{ background: currentTheme.bg }}>
          <span className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>9:41</span>
          <div className="flex items-center gap-1">
            <div className="flex gap-[2px] items-end">
              {[3, 4, 5, 6].map(h => (
                <div key={h} className="w-[3px] rounded-sm" style={{ height: h, background: "rgba(255,255,255,0.7)" }} />
              ))}
            </div>
            <div className="w-5 h-2.5 rounded-sm border ml-1 relative" style={{ borderColor: "rgba(255,255,255,0.5)" }}>
              <div className="absolute inset-[2px] rounded-[1px]" style={{ background: "rgba(255,255,255,0.75)" }} />
              <div className="absolute -right-[3px] top-[3px] w-[2px] h-[5px] rounded-r-sm" style={{ background: "rgba(255,255,255,0.5)" }} />
            </div>
          </div>
        </div>

        {/* Dynamic Island */}
        <div className="flex justify-center pb-3" style={{ background: currentTheme.bg }}>
          <div className="w-[88px] h-[26px] rounded-full bg-black" />
        </div>

        {/* Scrollable screen content */}
        <div className="overflow-y-auto" style={{ background: `linear-gradient(160deg,${currentTheme.bg} 60%,${currentTheme.accent}18)`, maxHeight: 500 }}>
          <div className="p-5">
            {/* Profile */}
            <div className="flex flex-col items-center mb-5">
              <div className="w-16 h-16 rounded-full mb-2.5 overflow-hidden"
                style={{ boxShadow: `0 0 0 2px ${currentTheme.accent}40` }}>
                {config.avatarUrl ? (
                  <img src={config.avatarUrl} alt="avatar" className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg,${currentTheme.accent},${currentTheme.accent2})` }}>
                    <span className="text-white text-xl font-bold">
                      {config.displayName ? config.displayName[0].toUpperCase() : "?"}
                    </span>
                  </div>
                )}
              </div>
              <p className="font-bold text-sm text-white">{config.displayName || "Seu Nome"}</p>
              {config.username && (
                <p className="text-xs mt-0.5" style={{ color: currentTheme.accent }}>@{config.username}</p>
              )}
              {config.bio && (
                <p className="text-xs text-center mt-1.5 px-2 line-clamp-2" style={{ color: "rgba(200,200,200,0.7)" }}>
                  {config.bio}
                </p>
              )}
              {config.whatsapp && (
                <div className="flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full" style={{ background: "#25d36618" }}>
                  <MessageCircle size={10} style={{ color: "#25d366" }} />
                  <span className="text-[10px]" style={{ color: "#25d366" }}>WhatsApp</span>
                </div>
              )}
            </div>

            {/* Products */}
            {config.products.filter(p => p.active).slice(0, 2).map(p => (
              <div key={p.id} className="flex items-center gap-2.5 rounded-xl border p-2.5 mb-2"
                style={{ borderColor: currentTheme.accent + "30", background: currentTheme.accent + "0a" }}>
                <span className="text-base flex-shrink-0">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate text-white">{p.title}</p>
                  {p.price && <p className="text-[10px]" style={{ color: currentTheme.accent }}>{p.price}</p>}
                </div>
                {p.urgency && <Clock size={10} style={{ color: currentTheme.accent2 }} />}
              </div>
            ))}

            {/* Links */}
            {config.links.filter(l => l.active).slice(0, 2).map(l => (
              <div key={l.id} className="flex items-center gap-2 rounded-xl border p-2.5 mb-2"
                style={{ borderColor: currentTheme.accent + "25", background: currentTheme.accent + "08" }}>
                <span style={{ color: currentTheme.accent }}>{LINK_ICON_MAP[l.icon]}</span>
                <span className="text-xs truncate" style={{ color: "rgba(200,200,200,0.8)" }}>{l.title || l.url}</span>
              </div>
            ))}

            {/* Testimonials */}
            {config.testimonials.slice(0, 1).map(t => (
              <div key={t.id} className="rounded-xl border p-2.5 mb-2"
                style={{ borderColor: currentTheme.accent + "20", background: currentTheme.accent + "08" }}>
                <div className="text-[10px] mb-1">{"⭐".repeat(t.stars)}</div>
                <p className="text-[9px] line-clamp-2 italic" style={{ color: "rgba(187,187,187,0.9)" }}>"{t.text}"</p>
                <p className="text-[8px] mt-1 font-semibold" style={{ color: currentTheme.accent }}>— {t.name}</p>
              </div>
            ))}

            {/* Empty state */}
            {config.products.filter(p => p.active).length === 0 &&
             config.links.filter(l => l.active).length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 opacity-30">
                <p className="text-xs" style={{ color: "#aaa" }}>Adicione produtos e links</p>
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 pb-2 text-center">
              <p className="text-[8px]" style={{ color: "#444" }}>✨ Criado com maview.app</p>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp floating button over phone */}
      {config.whatsapp && (
        <div className="absolute bottom-10 right-[-4px] w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: "#25d366" }}>
          <MessageCircle size={14} className="text-white" />
        </div>
      )}
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">

      {/* Header — dynamic subtitle, NO save button */}
      <div className="mb-5 space-y-1">
        <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">Minha Vitrine</h1>
        <p className="text-[hsl(var(--dash-text-muted))] text-[14px] flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${subtitleComplete ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-pulse"}`} />
          {subtitleText}
        </p>
      </div>

      {/* BLOCO 1 — Profile Hero Card */}
      <ProfileHeroCard config={config} onEditProfile={() => setActiveTab("perfil")} />

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

        {/* ── LEFT PANEL ── */}
        <div className="min-w-0">

          {/* BLOCO 4 — Tab bar premium with badges */}
          <div className="flex gap-1 p-1 glass-card rounded-2xl mb-5 overflow-x-auto scrollbar-none">
            {TABS.map(tab => {
              const count = tabCounts[tab.id] ?? 0;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? "bg-white text-[hsl(var(--dash-text))] shadow-sm border border-[hsl(var(--dash-border-subtle))]"
                      : "text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] hover:bg-[hsl(var(--dash-surface-2))]"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {count > 0 && (
                    <span className="ml-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary leading-none">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="glass-card rounded-2xl p-5 md:p-6 relative">

            {/* ── PERFIL ── */}
            {activeTab === "perfil" && (
              <div className="space-y-5">
                <h2 className="text-[hsl(var(--dash-text))] font-semibold text-base">Informações do Perfil</h2>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl flex-shrink-0 overflow-hidden ring-2 ring-[hsl(var(--dash-border))]">
                    {config.avatarUrl ? (
                      <img src={config.avatarUrl} alt="avatar" className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/80 to-secondary/80 flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                          {config.displayName ? config.displayName[0].toUpperCase() : "?"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className={labelCls}>URL do Avatar</label>
                    <input type="url" className={inputCls} placeholder="https://exemplo.com/foto.jpg"
                      value={config.avatarUrl}
                      onChange={e => updateConfig("avatarUrl", e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Nome de Exibição</label>
                  <input type="text" className={inputCls} placeholder="Seu nome"
                    value={config.displayName}
                    onChange={e => updateConfig("displayName", e.target.value)} />
                </div>

                <div>
                  <label className={labelCls}>Username</label>
                  <div className="flex items-center">
                    <span className="flex-shrink-0 rounded-l-xl border border-r-0 border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] text-sm px-3 py-2.5">@</span>
                    <input type="text" className={`${inputCls} rounded-l-none`} placeholder="seunome"
                      value={config.username}
                      onChange={e => updateConfig("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`${labelCls} mb-0`}>Bio</label>
                    <span className={`text-xs ${config.bio.length > 110 ? "text-amber-500" : "text-[hsl(var(--dash-text-subtle))]"}`}>
                      {config.bio.length}/120
                    </span>
                  </div>
                  <textarea className={`${inputCls} resize-none h-20`}
                    placeholder="Fale sobre você em poucas palavras..."
                    maxLength={120}
                    value={config.bio}
                    onChange={e => updateConfig("bio", e.target.value)} />
                  <p className="text-[hsl(var(--dash-text-subtle))] text-[11px] mt-1.5">
                    💡 Bios com emojis e palavras-chave recebem mais cliques
                  </p>
                </div>

                <div>
                  <label className={labelCls}>WhatsApp <span className="text-[hsl(var(--dash-text-subtle))] font-normal">(opcional)</span></label>
                  <div className="flex items-center">
                    <span className="flex-shrink-0 rounded-l-xl border border-r-0 border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] text-sm px-3 py-2.5 select-none">🇧🇷</span>
                    <input type="tel" className={`${inputCls} rounded-l-none`} placeholder="11999999999"
                      value={config.whatsapp}
                      onChange={e => updateConfig("whatsapp", e.target.value.replace(/\D/g, ""))} />
                  </div>
                  {config.whatsapp ? (
                    <p className="text-[hsl(var(--dash-text-subtle))] text-[11px] mt-1.5">Será aberto: wa.me/55{config.whatsapp}</p>
                  ) : (
                    <p className="text-[hsl(var(--dash-text-subtle))] text-[11px] mt-1.5">Apenas números, com DDD. Ex: 11999999999</p>
                  )}
                </div>
              </div>
            )}

            {/* ── TEMA ── */}
            {activeTab === "tema" && (
              <div className="space-y-5">
                <h2 className="text-[hsl(var(--dash-text))] font-semibold text-base">Escolha o Tema</h2>
                <div className="grid grid-cols-2 gap-3">
                  {THEMES.map(theme => {
                    const isSelected = config.theme === theme.id;
                    return (
                      <button key={theme.id} onClick={() => updateConfig("theme", theme.id)}
                        className={`relative rounded-2xl border p-4 text-left transition-all ${
                          isSelected ? "border-violet-500 ring-2 ring-violet-500/30" : "border-[hsl(var(--dash-border-subtle))] hover:border-[hsl(var(--dash-border))]"
                        }`}
                        style={{ background: theme.bg }}>
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: theme.accent }}>
                            <Check size={11} className="text-white" />
                          </div>
                        )}
                        <div className="flex gap-1.5 mb-3">
                          {[theme.bg, theme.accent, theme.accent2].map((c, i) => (
                            <div key={i} className="w-5 h-5 rounded-full ring-1 ring-white/10" style={{ background: c }} />
                          ))}
                        </div>
                        <div className="w-full h-1 rounded-full mb-2.5 opacity-70"
                          style={{ background: `linear-gradient(90deg,${theme.accent},${theme.accent2})` }} />
                        <p className="text-xs font-semibold" style={{ color: theme.accent }}>{theme.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── PRODUTOS ── */}
            {activeTab === "produtos" && (
              <div className="space-y-4">
                <h2 className="text-[hsl(var(--dash-text))] font-semibold text-base">Produtos</h2>

                {/* Product form */}
                {productForm && (
                  <div className="rounded-2xl border border-primary/20 bg-[hsl(var(--dash-accent))]/30 p-4 space-y-3">
                    <h3 className="text-[hsl(var(--dash-text))] text-sm font-semibold">
                      {editingProductId ? "Editar Produto" : "Novo Produto"}
                    </h3>
                    <div>
                      <label className={labelCls}>Emoji</label>
                      <div className="flex gap-2 flex-wrap">
                        {PRODUCT_EMOJIS.map(em => (
                          <button key={em} onClick={() => setProductForm(f => f ? { ...f, emoji: em } : f)}
                            className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all ${
                              productForm.emoji === em
                                ? "border-primary/50 bg-[hsl(var(--dash-accent))] ring-1 ring-primary/20"
                                : "border-[hsl(var(--dash-border-subtle))] hover:border-primary/20"
                            }`}>
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className={labelCls}>Título</label>
                        <input type="text" className={inputCls} placeholder="Nome do produto"
                          value={productForm.title}
                          onChange={e => setProductForm(f => f ? { ...f, title: e.target.value } : f)} />
                      </div>
                      <div className="col-span-2">
                        <label className={labelCls}>Descrição</label>
                        <input type="text" className={inputCls} placeholder="Breve descrição"
                          value={productForm.description}
                          onChange={e => setProductForm(f => f ? { ...f, description: e.target.value } : f)} />
                      </div>
                      <div>
                        <label className={labelCls}>Preço</label>
                        <input type="text" className={inputCls} placeholder="R$ 97,00"
                          value={productForm.price}
                          onChange={e => setProductForm(f => f ? { ...f, price: e.target.value } : f)} />
                      </div>
                      <div>
                        <label className={labelCls}>Preço original</label>
                        <input type="text" className={inputCls} placeholder="R$ 197,00"
                          value={productForm.originalPrice}
                          onChange={e => setProductForm(f => f ? { ...f, originalPrice: e.target.value } : f)} />
                      </div>
                      <div className="col-span-2">
                        <label className={labelCls}>URL de compra</label>
                        <input type="url" className={inputCls} placeholder="https://..."
                          value={productForm.url}
                          onChange={e => setProductForm(f => f ? { ...f, url: e.target.value } : f)} />
                      </div>
                      <div>
                        <label className={labelCls}>Badge <span className="font-normal text-[hsl(var(--dash-text-subtle))]">(ex: OFERTA)</span></label>
                        <input type="text" className={inputCls} placeholder="NOVO"
                          value={productForm.badge}
                          onChange={e => setProductForm(f => f ? { ...f, badge: e.target.value } : f)} />
                      </div>
                      <div className="flex items-end pb-0.5">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <button onClick={() => setProductForm(f => f ? { ...f, urgency: !f.urgency } : f)}>
                            {productForm.urgency
                              ? <ToggleRight size={24} className="text-primary" />
                              : <ToggleLeft size={24} className="text-[hsl(var(--dash-text-subtle))]" />}
                          </button>
                          <span className="text-[hsl(var(--dash-text-secondary))] text-xs font-medium flex items-center gap-1">
                            <Clock size={12} /> Urgência
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={saveProduct} className="flex-1 btn-primary-gradient text-xs py-2 rounded-xl">
                        <Check size={13} className="inline mr-1" /> Salvar
                      </button>
                      <button onClick={cancelProductForm}
                        className="flex-1 text-xs py-2 rounded-xl border border-[hsl(var(--dash-border))] text-[hsl(var(--dash-text-muted))] hover:bg-[hsl(var(--dash-surface-2))] transition-all">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* BLOCO 3 — empty state premium */}
                {config.products.length === 0 && !productForm ? (
                  <div className="text-center py-14 space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-50 flex items-center justify-center">
                      <Package size={28} className="text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-[hsl(var(--dash-text))] font-bold text-[17px]">Crie seu primeiro produto</h3>
                      <p className="text-[hsl(var(--dash-text-muted))] text-sm mt-1 max-w-[280px] mx-auto leading-relaxed">
                        Venda cursos, ebooks e mentorias com 0% de taxa
                      </p>
                    </div>
                    <button onClick={openAddProduct}
                      className="btn-primary-gradient text-sm px-8 py-3 rounded-xl font-semibold inline-flex items-center gap-2">
                      <Plus size={16} /> Adicionar Produto
                    </button>
                    <p className="text-[hsl(var(--dash-text-subtle))] text-xs">
                      💡 Criadores com pelo menos 1 produto vendem 3x mais
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* BLOCO 5 — reordering */}
                    {config.products.map((p, idx) => (
                      <div key={p.id}
                        className={`flex items-center gap-2 rounded-xl border p-3.5 transition-all ${!p.active ? "opacity-50" : ""} glass-card-hover`}>
                        <div className="flex flex-col gap-0.5 flex-shrink-0">
                          <button onClick={() => moveProduct(p.id, "up")} disabled={idx === 0}
                            className="p-0.5 rounded text-[hsl(var(--dash-text-subtle))] hover:text-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
                            <ChevronUp size={13} />
                          </button>
                          <button onClick={() => moveProduct(p.id, "down")} disabled={idx === config.products.length - 1}
                            className="p-0.5 rounded text-[hsl(var(--dash-text-subtle))] hover:text-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
                            <ChevronDown size={13} />
                          </button>
                        </div>
                        <span className="text-xl flex-shrink-0">{p.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium truncate">{p.title || "Sem título"}</p>
                          <p className="text-[hsl(var(--dash-text-subtle))] text-xs truncate">{p.price}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditProduct(p)}
                            className="p-1.5 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-primary hover:bg-[hsl(var(--dash-accent))] transition-all">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => deleteProduct(p.id)}
                            className="p-1.5 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-red-500 hover:bg-red-50 transition-all">
                            <Trash2 size={13} />
                          </button>
                          <button onClick={() => toggleProduct(p.id)}>
                            {p.active
                              ? <ToggleRight size={22} className="text-primary" />
                              : <ToggleLeft size={22} className="text-[hsl(var(--dash-text-subtle))]" />}
                          </button>
                        </div>
                      </div>
                    ))}
                    {!productForm && (
                      <button onClick={openAddProduct}
                        className="w-full border-2 border-dashed border-[hsl(var(--dash-border))] rounded-xl py-3 text-[hsl(var(--dash-text-muted))] text-sm font-medium hover:border-primary/40 hover:text-primary hover:bg-[hsl(var(--dash-accent))]/30 transition-all flex items-center justify-center gap-2">
                        <Plus size={15} /> Adicionar Produto
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── LINKS ── */}
            {activeTab === "links" && (
              <div className="space-y-6">
                <h2 className="text-[hsl(var(--dash-text))] font-semibold text-base">Links</h2>

                {linkForm && (
                  <div className="rounded-2xl border border-primary/20 bg-[hsl(var(--dash-accent))]/30 p-4 space-y-3">
                    <h3 className="text-[hsl(var(--dash-text))] text-sm font-semibold">
                      {editingLinkId ? "Editar Link" : showLinkForm === "social" ? "Nova Rede Social" : "Novo Link"}
                    </h3>
                    <div>
                      <label className={labelCls}>Ícone</label>
                      <div className="flex gap-2">
                        {(["instagram", "youtube", "twitter", "globe", "link"] as LinkItem["icon"][]).map(ic => (
                          <button key={ic} onClick={() => setLinkForm(f => f ? { ...f, icon: ic } : f)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                              linkForm.icon === ic
                                ? "border-primary/50 bg-[hsl(var(--dash-accent))] text-primary ring-1 ring-primary/20"
                                : "border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text-muted))] hover:border-primary/20"
                            }`}>
                            {LINK_ICON_MAP[ic]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Título</label>
                      <input type="text" className={inputCls} placeholder="Instagram"
                        value={linkForm.title}
                        onChange={e => setLinkForm(f => f ? { ...f, title: e.target.value } : f)} />
                    </div>
                    <div>
                      <label className={labelCls}>URL</label>
                      <input type="url" className={inputCls} placeholder="https://..."
                        value={linkForm.url}
                        onChange={e => setLinkForm(f => f ? { ...f, url: e.target.value } : f)} />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={saveLink} className="flex-1 btn-primary-gradient text-xs py-2 rounded-xl">
                        <Check size={13} className="inline mr-1" /> Salvar
                      </button>
                      <button onClick={cancelLinkForm}
                        className="flex-1 text-xs py-2 rounded-xl border border-[hsl(var(--dash-border))] text-[hsl(var(--dash-text-muted))] hover:bg-[hsl(var(--dash-surface-2))] transition-all">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* BLOCO 3 — links empty state */}
                {config.links.length === 0 && !linkForm ? (
                  <div className="text-center py-14 space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center">
                      <Link2 size={28} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-[hsl(var(--dash-text))] font-bold text-[17px]">Conecte suas redes</h3>
                      <p className="text-[hsl(var(--dash-text-muted))] text-sm mt-1 max-w-[280px] mx-auto leading-relaxed">
                        Páginas com links sociais têm 40% mais visitas
                      </p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => openAddLink(true)}
                        className="btn-primary-gradient text-sm px-5 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2">
                        <Plus size={15} /> Rede Social
                      </button>
                      <button onClick={() => openAddLink(false)}
                        className="text-sm px-5 py-2.5 rounded-xl font-semibold border border-[hsl(var(--dash-border))] text-[hsl(var(--dash-text-secondary))] hover:bg-[hsl(var(--dash-surface-2))] transition-all inline-flex items-center gap-2">
                        <Plus size={15} /> Outro Link
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Social links */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[hsl(var(--dash-text-secondary))] text-sm font-medium">Redes Sociais</p>
                        {!linkForm && (
                          <button onClick={() => openAddLink(true)}
                            className="flex items-center gap-1 text-xs text-primary hover:opacity-75 transition-opacity">
                            <Plus size={12} /> Adicionar
                          </button>
                        )}
                      </div>
                      {config.links.filter(l => l.isSocial).length === 0 ? (
                        <p className="text-[hsl(var(--dash-text-subtle))] text-xs py-3 text-center">Nenhuma rede social adicionada</p>
                      ) : (
                        <div className="space-y-2">
                          {config.links.filter(l => l.isSocial).map(l => {
                            const gi = config.links.findIndex(cl => cl.id === l.id);
                            return (
                              <LinkRow key={l.id} link={l} globalIndex={gi} totalLinks={config.links.length}
                                onEdit={openEditLink} onDelete={deleteLink} onToggle={toggleLink} onMove={moveLink} />
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="dash-divider" />

                    {/* Other links */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[hsl(var(--dash-text-secondary))] text-sm font-medium">Outros Links</p>
                        {!linkForm && (
                          <button onClick={() => openAddLink(false)}
                            className="flex items-center gap-1 text-xs text-primary hover:opacity-75 transition-opacity">
                            <Plus size={12} /> Adicionar
                          </button>
                        )}
                      </div>
                      {config.links.filter(l => !l.isSocial).length === 0 ? (
                        <p className="text-[hsl(var(--dash-text-subtle))] text-xs py-3 text-center">Nenhum link adicionado</p>
                      ) : (
                        <div className="space-y-2">
                          {config.links.filter(l => !l.isSocial).map(l => {
                            const gi = config.links.findIndex(cl => cl.id === l.id);
                            return (
                              <LinkRow key={l.id} link={l} globalIndex={gi} totalLinks={config.links.length}
                                onEdit={openEditLink} onDelete={deleteLink} onToggle={toggleLink} onMove={moveLink} />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── DEPOIMENTOS ── */}
            {activeTab === "depoimentos" && (
              <div className="space-y-4">
                <h2 className="text-[hsl(var(--dash-text))] font-semibold text-base">Depoimentos</h2>

                {showTestimonialForm && (
                  <div className="rounded-2xl border border-primary/20 bg-[hsl(var(--dash-accent))]/30 p-4 space-y-3">
                    <h3 className="text-[hsl(var(--dash-text))] text-sm font-semibold">Novo Depoimento</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Nome</label>
                        <input type="text" className={inputCls} placeholder="João Silva"
                          value={testimonialForm.name}
                          onChange={e => setTestimonialForm(f => ({ ...f, name: e.target.value }))} />
                      </div>
                      <div>
                        <label className={labelCls}>Cargo / Função</label>
                        <input type="text" className={inputCls} placeholder="Designer"
                          value={testimonialForm.role}
                          onChange={e => setTestimonialForm(f => ({ ...f, role: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={`${labelCls} mb-0`}>Depoimento</label>
                        <span className={`text-xs ${testimonialForm.text.length > 180 ? "text-amber-500" : "text-[hsl(var(--dash-text-subtle))]"}`}>
                          {testimonialForm.text.length}/200
                        </span>
                      </div>
                      <textarea className={`${inputCls} resize-none h-20`}
                        placeholder="O que o cliente disse..." maxLength={200}
                        value={testimonialForm.text}
                        onChange={e => setTestimonialForm(f => ({ ...f, text: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Avaliação</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button key={n} onClick={() => setTestimonialForm(f => ({ ...f, stars: n }))}
                            className={`text-xl transition-all ${n <= testimonialForm.stars ? "opacity-100" : "opacity-25"}`}>
                            ⭐
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>URL do Avatar <span className="font-normal text-[hsl(var(--dash-text-subtle))]">(opcional)</span></label>
                      <input type="url" className={inputCls} placeholder="https://..."
                        value={testimonialForm.avatar}
                        onChange={e => setTestimonialForm(f => ({ ...f, avatar: e.target.value }))} />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={saveTestimonial} className="flex-1 btn-primary-gradient text-xs py-2 rounded-xl">
                        <Check size={13} className="inline mr-1" /> Salvar
                      </button>
                      <button onClick={() => { setShowTestimonialForm(false); setTestimonialForm(emptyTestimonial()); }}
                        className="flex-1 text-xs py-2 rounded-xl border border-[hsl(var(--dash-border))] text-[hsl(var(--dash-text-muted))] hover:bg-[hsl(var(--dash-surface-2))] transition-all">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* BLOCO 3 — testimonials empty state */}
                {config.testimonials.length === 0 && !showTestimonialForm ? (
                  <div className="text-center py-14 space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center">
                      <Star size={28} className="text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-[hsl(var(--dash-text))] font-bold text-[17px]">Adicione depoimentos</h3>
                      <p className="text-[hsl(var(--dash-text-muted))] text-sm mt-1 max-w-[280px] mx-auto leading-relaxed">
                        Depoimentos aumentam a conversão em até 72%
                      </p>
                    </div>
                    <button onClick={() => setShowTestimonialForm(true)}
                      className="btn-primary-gradient text-sm px-8 py-3 rounded-xl font-semibold inline-flex items-center gap-2">
                      <Plus size={16} /> Adicionar Depoimento
                    </button>
                    <p className="text-[hsl(var(--dash-text-subtle))] text-xs">
                      💡 A voz do cliente é sua melhor propaganda
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {config.testimonials.map(t => (
                      <div key={t.id} className="flex items-start gap-3 rounded-xl border glass-card p-3.5">
                        <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden ring-1 ring-[hsl(var(--dash-border))]">
                          {t.avatar ? (
                            <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/60 to-secondary/60 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{t.name[0]?.toUpperCase()}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium">{t.name}</p>
                            {t.role && <span className="text-[hsl(var(--dash-text-subtle))] text-xs">· {t.role}</span>}
                          </div>
                          <div className="flex text-xs mb-0.5">{"⭐".repeat(t.stars)}</div>
                          <p className="text-[hsl(var(--dash-text-muted))] text-xs line-clamp-2">{t.text}</p>
                        </div>
                        <button onClick={() => deleteTestimonial(t.id)}
                          className="p-1.5 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    {!showTestimonialForm && (
                      <button onClick={() => setShowTestimonialForm(true)}
                        className="w-full border-2 border-dashed border-[hsl(var(--dash-border))] rounded-xl py-3 text-[hsl(var(--dash-text-muted))] text-sm font-medium hover:border-primary/40 hover:text-primary hover:bg-[hsl(var(--dash-accent))]/30 transition-all flex items-center justify-center gap-2">
                        <Plus size={15} /> Adicionar Depoimento
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* BLOCO 2 — Auto-save toast */}
            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[12px] font-medium shadow-sm transition-all duration-300 pointer-events-none whitespace-nowrap ${toastVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
              <Check size={13} className="text-emerald-500" />
              Alterações salvas
            </div>

          </div>
        </div>

        {/* ── RIGHT PANEL: Phone preview ── */}
        <div className="hidden lg:block">
          <div className="sticky top-8">
            <p className="text-[hsl(var(--dash-text-subtle))] text-xs font-medium mb-3 uppercase tracking-wider">
              Pré-visualização ao vivo
            </p>
            {phonePreview}
            <div className="mt-3 text-center">
              <span className="text-[hsl(var(--dash-text-subtle))] text-[11px]">Tema: {currentTheme.label}</span>
            </div>
          </div>
        </div>

      </div>

      {/* BLOCO 7 — Mobile preview button */}
      <button
        onClick={() => setShowMobilePreview(true)}
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 lg:hidden flex items-center gap-2 px-5 py-3 rounded-full btn-primary-gradient shadow-xl text-sm font-semibold"
      >
        <Eye size={16} /> Ver Preview
      </button>

      {/* BLOCO 7 — Mobile preview bottom sheet */}
      {showMobilePreview && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobilePreview(false)} />
          <div
            className="relative bg-[hsl(var(--dash-surface))] rounded-t-3xl max-h-[88vh] overflow-y-auto pb-8 shadow-2xl"
            style={{ animation: "slideUp 0.3s ease" }}
          >
            {/* Drag handle */}
            <div className="sticky top-0 bg-[hsl(var(--dash-surface))] pt-3 pb-2 flex justify-center z-10">
              <div className="w-10 h-1 rounded-full bg-[hsl(var(--dash-border))]" />
            </div>
            <button onClick={() => setShowMobilePreview(false)}
              className="absolute top-3 right-4 p-2 rounded-full text-[hsl(var(--dash-text-subtle))] hover:text-[hsl(var(--dash-text))] hover:bg-[hsl(var(--dash-surface-2))] transition-all">
              <X size={18} />
            </button>
            <div className="px-4 pb-4">
              <p className="text-[hsl(var(--dash-text))] font-semibold text-[15px] mb-4 text-center">Preview da Vitrine</p>
              <div className="flex justify-center">
                <div className="w-full max-w-[300px]">
                  {phonePreview}
                </div>
              </div>
              <p className="text-center text-[hsl(var(--dash-text-subtle))] text-[11px] mt-3">
                Tema: {currentTheme.label}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardPagina;
