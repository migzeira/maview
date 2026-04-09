import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Palette, Package, Link2, Star, Plus, Trash2, Pencil,
  Check, ToggleLeft, ToggleRight, Instagram, Youtube, Twitter, Globe,
  MessageCircle, Clock, ChevronDown, ChevronUp, Eye, X, Copy, ExternalLink,
  Sparkles, Calendar, Settings, Layout,
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
  startsAt?: string;
  endsAt?: string;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: "instagram" | "youtube" | "twitter" | "globe" | "link";
  active: boolean;
  isSocial: boolean;
  type?: "normal" | "spotlight" | "header";
  startsAt?: string;
  endsAt?: string;
}

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  text: string;
  stars: number;
  avatar: string;
}

interface VitrineBlock {
  id: string;
  type: "product" | "link" | "testimonial" | "header";
  refId?: string;
  title?: string;
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
  blocks?: VitrineBlock[];
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
  displayName: "", username: "", bio: "", avatarUrl: "", whatsapp: "",
  theme: "dark-purple", products: [], links: [], testimonials: [], blocks: [],
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

type TabId = "vitrine" | "perfil" | "design";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "vitrine", label: "Vitrine",  icon: <Package size={15} /> },
  { id: "perfil",  label: "Perfil",   icon: <User size={15} /> },
  { id: "design",  label: "Design",   icon: <Palette size={15} /> },
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
  active: true, isSocial, type: "normal",
});

const emptyTestimonial = (): TestimonialItem => ({
  id: Date.now().toString(),
  name: "", role: "", text: "", stars: 5, avatar: "",
});

// ── Utilities ──────────────────────────────────────────────────────────────

function calcHealth(cfg: VitrineConfig): number {
  let s = 0;
  if (cfg.avatarUrl) s += 15;
  if (cfg.displayName && cfg.bio) s += 10;
  if (cfg.theme) s += 10;
  if (cfg.products.filter(p => p.active).length > 0) s += 20;
  if (cfg.links.length > 0) s += 15;
  if (cfg.testimonials.length > 0) s += 15;
  if (cfg.whatsapp) s += 15;
  return s;
}

function isValidUrl(url: string): boolean {
  if (!url) return false;
  try { new URL(url); return true; } catch { return false; }
}

function isScheduledActive(item: { startsAt?: string; endsAt?: string }): boolean {
  const now = new Date();
  if (item.startsAt && new Date(item.startsAt) > now) return false;
  if (item.endsAt && new Date(item.endsAt) < now) return false;
  return true;
}

function getDynamicSubtitle(cfg: VitrineConfig): { text: string; complete: boolean } {
  if (!cfg.avatarUrl) return { text: "Adicione uma foto de perfil para personalizar sua vitrine", complete: false };
  if (cfg.products.length === 0) return { text: "Crie seu primeiro produto e comece a vender", complete: false };
  if (cfg.links.length === 0) return { text: "Adicione seus links e conecte suas redes sociais", complete: false };
  if (cfg.testimonials.length === 0) return { text: "Depoimentos aumentam conversão em 72% — adicione um", complete: false };
  return { text: "Sua vitrine está completa e no ar! 🚀", complete: true };
}

function autoCompleteUrl(icon: string, raw: string): string {
  const handle = raw.replace(/^@/, "").trim();
  if (!handle || raw.startsWith("http")) return raw;
  const map: Record<string, string> = {
    instagram: `https://instagram.com/${handle}`,
    youtube: `https://youtube.com/@${handle}`,
    twitter: `https://x.com/${handle}`,
  };
  return map[icon] || raw;
}

function generateBlocks(cfg: VitrineConfig): VitrineBlock[] {
  const blocks: VitrineBlock[] = [];
  cfg.products.forEach(p => blocks.push({ id: `b-${p.id}`, type: "product", refId: p.id }));
  cfg.links.forEach(l => {
    if (l.type === "header") {
      blocks.push({ id: `b-${l.id}`, type: "header", title: l.title, refId: l.id });
    } else {
      blocks.push({ id: `b-${l.id}`, type: "link", refId: l.id });
    }
  });
  cfg.testimonials.forEach(t => blocks.push({ id: `b-${t.id}`, type: "testimonial", refId: t.id }));
  return blocks;
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
        <button onClick={onEditProfile} className="flex-shrink-0 relative group">
          <div className="w-[56px] h-[56px] rounded-2xl overflow-hidden"
            style={{ boxShadow: `0 0 0 3px ${currentTheme.accent}40` }}>
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
          {config.username && <p className="text-[hsl(var(--dash-text-muted))] text-[12px] mb-1">@{config.username}</p>}
          {config.bio && <p className="text-[hsl(var(--dash-text-subtle))] text-[11.5px] line-clamp-1 mb-2">{config.bio}</p>}
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
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--dash-surface-2))] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${health}%`, background: `linear-gradient(90deg, ${currentTheme.accent}, ${currentTheme.accent2})` }} />
            </div>
            <span className="text-[10px] font-bold text-[hsl(var(--dash-text-subtle))] flex-shrink-0 w-8">{health}%</span>
          </div>
        </div>

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

// ── Main component ─────────────────────────────────────────────────────────

const DashboardPagina = () => {
  const navigate = useNavigate();

  const [config, setConfig] = useState<VitrineConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<TabId>("vitrine");
  const [toastVisible, setToastVisible] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Add menu
  const [showAddMenu, setShowAddMenu] = useState(false);
  // Active form type
  const [activeForm, setActiveForm] = useState<"product" | "link" | "testimonial" | "header" | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Product form
  const [productForm, setProductForm] = useState<ProductItem | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Link form
  const [linkForm, setLinkForm] = useState<LinkItem | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  // Testimonial form
  const [testimonialForm, setTestimonialForm] = useState<TestimonialItem>(emptyTestimonial());
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);

  // Header form
  const [headerTitle, setHeaderTitle] = useState("");
  const [editingHeaderBlockId, setEditingHeaderBlockId] = useState<string | null>(null);

  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // AI
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      const stored = localStorage.getItem(LS_KEY);
      const base: VitrineConfig = stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : { ...DEFAULT_CONFIG };
      // Migrate: generate blocks from existing data if missing
      if (!base.blocks || base.blocks.length === 0) {
        const hasData = base.products.length > 0 || base.links.length > 0 || base.testimonials.length > 0;
        if (hasData) {
          base.blocks = generateBlocks(base);
          localStorage.setItem(LS_KEY, JSON.stringify(base));
        } else {
          base.blocks = [];
        }
      }
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const u = data.session.user;
          if (!base.displayName) base.displayName = u.user_metadata?.full_name || u.email?.split("@")[0] || "";
          if (!base.username) base.username = u.user_metadata?.username || u.email?.split("@")[0] || "";
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

  const setConfigAndSave = useCallback((updater: (prev: VitrineConfig) => VitrineConfig) => {
    setConfig(prev => {
      const next = updater(prev);
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      return next;
    });
    showSavedToast();
  }, [showSavedToast]);

  // ── Block helpers ─────────────────────────────────────────────────────────

  const moveBlock = (blockId: string, dir: "up" | "down") => {
    const blocks = [...(config.blocks || [])];
    const idx = blocks.findIndex(b => b.id === blockId);
    if (idx < 0) return;
    const to = dir === "up" ? idx - 1 : idx + 1;
    if (to < 0 || to >= blocks.length) return;
    [blocks[idx], blocks[to]] = [blocks[to], blocks[idx]];
    updateConfig("blocks", blocks);
  };

  const removeBlock = (blockId: string) => {
    setConfigAndSave(prev => {
      const block = (prev.blocks || []).find(b => b.id === blockId);
      const next = { ...prev, blocks: (prev.blocks || []).filter(b => b.id !== blockId) };
      if (block?.type === "product" && block.refId) next.products = prev.products.filter(p => p.id !== block.refId);
      else if (block?.type === "link" && block.refId) next.links = prev.links.filter(l => l.id !== block.refId);
      else if (block?.type === "testimonial" && block.refId) next.testimonials = prev.testimonials.filter(t => t.id !== block.refId);
      return next;
    });
    setConfirmDeleteId(null);
  };

  const toggleBlockItem = (blockId: string) => {
    const block = (config.blocks || []).find(b => b.id === blockId);
    if (!block?.refId) return;
    if (block.type === "product") {
      updateConfig("products", config.products.map(p => p.id === block.refId ? { ...p, active: !p.active } : p));
    } else if (block.type === "link") {
      updateConfig("links", config.links.map(l => l.id === block.refId ? { ...l, active: !l.active } : l));
    }
  };

  // ── Form open/close helpers ───────────────────────────────────────────────

  const closeAllForms = () => {
    setActiveForm(null);
    setProductForm(null);
    setEditingProductId(null);
    setLinkForm(null);
    setEditingLinkId(null);
    setTestimonialForm(emptyTestimonial());
    setEditingTestimonialId(null);
    setHeaderTitle("");
    setEditingHeaderBlockId(null);
    setShowAdvanced(false);
  };

  const openAddProduct = () => {
    closeAllForms();
    setActiveForm("product");
    setProductForm(emptyProduct());
  };

  const openEditProduct = (p: ProductItem) => {
    closeAllForms();
    setActiveForm("product");
    setEditingProductId(p.id);
    setProductForm({ ...p });
  };

  const openAddLink = () => {
    closeAllForms();
    setActiveForm("link");
    setLinkForm(emptyLink(false));
  };

  const openEditLink = (l: LinkItem) => {
    closeAllForms();
    setActiveForm("link");
    setEditingLinkId(l.id);
    setLinkForm({ ...l });
  };

  const openAddTestimonial = () => {
    closeAllForms();
    setActiveForm("testimonial");
    setTestimonialForm(emptyTestimonial());
  };

  const openEditTestimonial = (t: TestimonialItem) => {
    closeAllForms();
    setActiveForm("testimonial");
    setEditingTestimonialId(t.id);
    setTestimonialForm({ ...t });
  };

  const openAddHeader = () => {
    closeAllForms();
    setActiveForm("header");
    setHeaderTitle("");
  };

  const openEditHeader = (block: VitrineBlock) => {
    closeAllForms();
    setActiveForm("header");
    setEditingHeaderBlockId(block.id);
    setHeaderTitle(block.title || "");
  };

  // ── Save helpers ──────────────────────────────────────────────────────────

  const saveProduct = () => {
    if (!productForm) return;
    setConfigAndSave(prev => {
      const next = { ...prev };
      if (editingProductId) {
        next.products = prev.products.map(p => p.id === editingProductId ? { ...productForm, id: editingProductId } : p);
      } else {
        next.products = [...prev.products, productForm];
        next.blocks = [...(prev.blocks || []), { id: `b-${productForm.id}`, type: "product" as const, refId: productForm.id }];
      }
      return next;
    });
    closeAllForms();
  };

  const saveLink = () => {
    if (!linkForm) return;
    const finalLink = { ...linkForm, url: autoCompleteUrl(linkForm.icon, linkForm.url) };
    setConfigAndSave(prev => {
      const next = { ...prev };
      if (editingLinkId) {
        next.links = prev.links.map(l => l.id === editingLinkId ? { ...finalLink, id: editingLinkId } : l);
      } else {
        next.links = [...prev.links, finalLink];
        next.blocks = [...(prev.blocks || []), { id: `b-${finalLink.id}`, type: "link" as const, refId: finalLink.id }];
      }
      return next;
    });
    closeAllForms();
  };

  const saveTestimonial = () => {
    if (!testimonialForm.name.trim()) return;
    setConfigAndSave(prev => {
      const next = { ...prev };
      if (editingTestimonialId) {
        next.testimonials = prev.testimonials.map(t => t.id === editingTestimonialId ? { ...testimonialForm, id: editingTestimonialId } : t);
      } else {
        const t = { ...testimonialForm, id: Date.now().toString() };
        next.testimonials = [...prev.testimonials, t];
        next.blocks = [...(prev.blocks || []), { id: `b-${t.id}`, type: "testimonial" as const, refId: t.id }];
      }
      return next;
    });
    closeAllForms();
  };

  const saveHeader = () => {
    if (!headerTitle.trim()) return;
    setConfigAndSave(prev => {
      const next = { ...prev };
      if (editingHeaderBlockId) {
        next.blocks = (prev.blocks || []).map(b => b.id === editingHeaderBlockId ? { ...b, title: headerTitle.trim() } : b);
      } else {
        next.blocks = [...(prev.blocks || []), { id: Date.now().toString(), type: "header" as const, title: headerTitle.trim() }];
      }
      return next;
    });
    closeAllForms();
  };

  // ── Delete confirmation auto-cancel ───────────────────────────────────────

  useEffect(() => {
    if (!confirmDeleteId) return;
    const timer = setTimeout(() => setConfirmDeleteId(null), 5000);
    return () => clearTimeout(timer);
  }, [confirmDeleteId]);

  // ── AI bio suggestion ─────────────────────────────────────────────────────

  const suggestBio = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const { data, error } = await supabase.functions.invoke("maview-ai", {
        body: {
          message: `Crie uma bio profissional e atraente para um criador de conteúdo chamado "${config.displayName || "criador"}". Bio atual: "${config.bio || "(vazia)"}". Retorne APENAS a bio sugerida, máximo 120 caracteres, com emojis relevantes.`,
          history: [],
        },
      });
      if (error) throw error;
      setAiSuggestion(data?.text?.trim() ?? null);
    } catch {
      setAiSuggestion("IA indisponível no momento. Tente novamente mais tarde.");
    } finally {
      setAiLoading(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const currentTheme = THEMES.find(t => t.id === config.theme) ?? THEMES[0];
  const { text: subtitleText, complete: subtitleComplete } = getDynamicSubtitle(config);
  const blocks = config.blocks || [];

  const tabCounts: Partial<Record<TabId, number>> = {
    vitrine: blocks.length,
  };

  const inputCls = "w-full rounded-xl border border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text))] text-sm px-3.5 py-2.5 placeholder:text-[hsl(var(--dash-text-subtle))] focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all";
  const labelCls = "block text-[hsl(var(--dash-text-secondary))] text-xs font-medium mb-1.5";

  // ── Block info helper ─────────────────────────────────────────────────────

  const getBlockDisplay = (block: VitrineBlock) => {
    if (block.type === "product") {
      const p = config.products.find(pr => pr.id === block.refId);
      if (!p) return null;
      return { icon: <span className="text-base">{p.emoji}</span>, title: p.title || "Sem título", subtitle: p.price, active: p.active, hasToggle: true };
    }
    if (block.type === "link") {
      const l = config.links.find(lk => lk.id === block.refId);
      if (!l) return null;
      const badge = l.type === "spotlight" ? "DESTAQUE" : l.type === "header" ? "SEPARADOR" : null;
      return { icon: <span className="text-primary">{LINK_ICON_MAP[l.icon]}</span>, title: l.title || l.url || "Sem título", subtitle: l.url?.replace(/^https?:\/\//, ""), active: l.active, hasToggle: true, badge };
    }
    if (block.type === "testimonial") {
      const t = config.testimonials.find(te => te.id === block.refId);
      if (!t) return null;
      return { icon: <Star size={14} className="text-amber-400" />, title: t.name, subtitle: `"${t.text.slice(0, 40)}..."`, active: true, hasToggle: false };
    }
    if (block.type === "header") {
      return { icon: <span className="text-[hsl(var(--dash-text-subtle))]">───</span>, title: block.title || "Separador", subtitle: null, active: true, hasToggle: false };
    }
    return null;
  };

  // ── Phone preview ─────────────────────────────────────────────────────────

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
            </div>
          </div>
        </div>

        {/* Dynamic Island */}
        <div className="flex justify-center pb-3" style={{ background: currentTheme.bg }}>
          <div className="w-[88px] h-[26px] rounded-full bg-black" />
        </div>

        {/* Scrollable screen content — renders blocks in order */}
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
              {config.username && <p className="text-xs mt-0.5" style={{ color: currentTheme.accent }}>@{config.username}</p>}
              {config.bio && <p className="text-xs text-center mt-1.5 px-2 line-clamp-2" style={{ color: "rgba(200,200,200,0.7)" }}>{config.bio}</p>}
              {config.whatsapp && (
                <div className="flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full" style={{ background: "#25d36618" }}>
                  <MessageCircle size={10} style={{ color: "#25d366" }} />
                  <span className="text-[10px]" style={{ color: "#25d366" }}>WhatsApp</span>
                </div>
              )}
            </div>

            {/* Blocks in order */}
            {blocks.map(block => {
              if (block.type === "product") {
                const p = config.products.find(pr => pr.id === block.refId);
                if (!p || !p.active || !isScheduledActive(p)) return null;
                return (
                  <div key={block.id} className="flex items-center gap-2.5 rounded-xl border p-2.5 mb-2"
                    style={{ borderColor: currentTheme.accent + "30", background: currentTheme.accent + "0a" }}>
                    <span className="text-base flex-shrink-0">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate text-white">{p.title}</p>
                      {p.price && <p className="text-[10px]" style={{ color: currentTheme.accent }}>{p.price}</p>}
                    </div>
                    {p.urgency && <Clock size={10} style={{ color: currentTheme.accent2 }} />}
                  </div>
                );
              }
              if (block.type === "link") {
                const l = config.links.find(lk => lk.id === block.refId);
                if (!l || !l.active || !isScheduledActive(l)) return null;
                if (l.type === "header") return (
                  <div key={block.id} className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-px" style={{ background: currentTheme.accent + "30" }} />
                    <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: currentTheme.accent + "80" }}>{l.title}</span>
                    <div className="flex-1 h-px" style={{ background: currentTheme.accent + "30" }} />
                  </div>
                );
                if (l.type === "spotlight") return (
                  <div key={block.id} className="rounded-xl p-2.5 mb-2 flex items-center justify-center gap-2"
                    style={{ background: `linear-gradient(135deg,${currentTheme.accent}25,${currentTheme.accent2}18)`, border: `1px solid ${currentTheme.accent}40` }}>
                    <span style={{ color: currentTheme.accent }}>{LINK_ICON_MAP[l.icon]}</span>
                    <span className="text-xs font-bold" style={{ color: currentTheme.accent }}>{l.title || l.url}</span>
                  </div>
                );
                return (
                  <div key={block.id} className="flex items-center gap-2 rounded-xl border p-2.5 mb-2"
                    style={{ borderColor: currentTheme.accent + "25", background: currentTheme.accent + "08" }}>
                    <span style={{ color: currentTheme.accent }}>{LINK_ICON_MAP[l.icon]}</span>
                    <span className="text-xs truncate" style={{ color: "rgba(200,200,200,0.8)" }}>{l.title || l.url}</span>
                  </div>
                );
              }
              if (block.type === "testimonial") {
                const t = config.testimonials.find(te => te.id === block.refId);
                if (!t) return null;
                return (
                  <div key={block.id} className="rounded-xl border p-2.5 mb-2"
                    style={{ borderColor: currentTheme.accent + "20", background: currentTheme.accent + "08" }}>
                    <div className="text-[10px] mb-1">{"⭐".repeat(t.stars)}</div>
                    <p className="text-[9px] line-clamp-2 italic" style={{ color: "rgba(187,187,187,0.9)" }}>"{t.text}"</p>
                    <p className="text-[8px] mt-1 font-semibold" style={{ color: currentTheme.accent }}>— {t.name}</p>
                  </div>
                );
              }
              if (block.type === "header") {
                return (
                  <div key={block.id} className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-px" style={{ background: currentTheme.accent + "30" }} />
                    <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: currentTheme.accent + "80" }}>{block.title}</span>
                    <div className="flex-1 h-px" style={{ background: currentTheme.accent + "30" }} />
                  </div>
                );
              }
              return null;
            })}

            {/* Empty state */}
            {blocks.length === 0 && (
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

      {/* WhatsApp floating button */}
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

      {/* Header */}
      <div className="mb-5 space-y-1">
        <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">Minha Vitrine</h1>
        <p className="text-[hsl(var(--dash-text-muted))] text-[14px] flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${subtitleComplete ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-pulse"}`} />
          {subtitleText}
        </p>
      </div>

      {/* Profile Hero Card */}
      <ProfileHeroCard config={config} onEditProfile={() => setActiveTab("perfil")} />

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">

        {/* ── LEFT PANEL ── */}
        <div className="min-w-0">

          {/* 3-tab bar */}
          <div className="flex gap-1 p-1 glass-card rounded-2xl mb-5 overflow-x-auto scrollbar-none">
            {TABS.map(tab => {
              const count = tabCounts[tab.id] ?? 0;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? "bg-white text-[hsl(var(--dash-text))] shadow-sm border border-[hsl(var(--dash-border-subtle))]"
                      : "text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] hover:bg-[hsl(var(--dash-surface-2))]"
                  }`}>
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

            {/* ═══════════════ TAB: VITRINE ═══════════════ */}
            {activeTab === "vitrine" && (
              <div className="space-y-4">

                {/* CTA dominante + dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    className="w-full btn-primary-gradient text-sm font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Adicionar à Vitrine
                  </button>

                  {showAddMenu && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowAddMenu(false)} />
                      <div className="absolute top-full left-0 right-0 mt-2 z-40 glass-card rounded-xl shadow-xl border border-[hsl(var(--dash-border-subtle))] p-1.5">
                        {[
                          { type: "product" as const, icon: <Package size={16} className="text-violet-500" />, label: "Produto", desc: "Venda algo" },
                          { type: "link" as const, icon: <Link2 size={16} className="text-blue-500" />, label: "Link", desc: "Direcione para qualquer URL" },
                          { type: "testimonial" as const, icon: <Star size={16} className="text-amber-500" />, label: "Depoimento", desc: "Prova social" },
                          { type: "header" as const, icon: <Layout size={16} className="text-slate-400" />, label: "Separador", desc: "Organize seções" },
                        ].map(opt => (
                          <button key={opt.type}
                            onClick={() => {
                              setShowAddMenu(false);
                              if (opt.type === "product") openAddProduct();
                              else if (opt.type === "link") openAddLink();
                              else if (opt.type === "testimonial") openAddTestimonial();
                              else openAddHeader();
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-[hsl(var(--dash-surface-2))] transition-all"
                          >
                            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--dash-accent))] flex items-center justify-center flex-shrink-0">
                              {opt.icon}
                            </div>
                            <div>
                              <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium">{opt.label}</p>
                              <p className="text-[hsl(var(--dash-text-subtle))] text-[11px]">{opt.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* ── Active form (inline at top) ── */}

                {/* Product form */}
                {activeForm === "product" && productForm && (
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
                            }`}>{em}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Título</label>
                      <input type="text" className={inputCls} placeholder="Nome do produto"
                        value={productForm.title}
                        onChange={e => setProductForm(f => f ? { ...f, title: e.target.value } : f)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Preço</label>
                        <input type="text" className={inputCls} placeholder="R$ 97,00"
                          value={productForm.price}
                          onChange={e => setProductForm(f => f ? { ...f, price: e.target.value } : f)} />
                      </div>
                      <div>
                        <label className={labelCls}>URL de compra</label>
                        <div className="relative">
                          <input type="url" className={inputCls} placeholder="https://..."
                            value={productForm.url}
                            onChange={e => setProductForm(f => f ? { ...f, url: e.target.value } : f)} />
                          {productForm.url && (
                            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold ${isValidUrl(productForm.url) ? "text-emerald-500" : "text-red-400"}`}>
                              {isValidUrl(productForm.url) ? "✓" : "URL inválida"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Mais opções */}
                    <button onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-1.5 text-[hsl(var(--dash-text-subtle))] text-[11px] font-medium hover:text-primary transition-colors">
                      <Settings size={11} /> Mais opções
                      {showAdvanced ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </button>
                    {showAdvanced && (
                      <div className="space-y-3 pt-1 border-t border-[hsl(var(--dash-border-subtle))]">
                        <div>
                          <label className={labelCls}>Descrição</label>
                          <input type="text" className={inputCls} placeholder="Breve descrição"
                            value={productForm.description}
                            onChange={e => setProductForm(f => f ? { ...f, description: e.target.value } : f)} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelCls}>Preço original</label>
                            <input type="text" className={inputCls} placeholder="R$ 197,00"
                              value={productForm.originalPrice}
                              onChange={e => setProductForm(f => f ? { ...f, originalPrice: e.target.value } : f)} />
                          </div>
                          <div>
                            <label className={labelCls}>Badge</label>
                            <input type="text" className={inputCls} placeholder="OFERTA"
                              value={productForm.badge}
                              onChange={e => setProductForm(f => f ? { ...f, badge: e.target.value } : f)} />
                          </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <button onClick={() => setProductForm(f => f ? { ...f, urgency: !f.urgency } : f)}>
                            {productForm.urgency ? <ToggleRight size={24} className="text-primary" /> : <ToggleLeft size={24} className="text-[hsl(var(--dash-text-subtle))]" />}
                          </button>
                          <span className="text-[hsl(var(--dash-text-secondary))] text-xs font-medium flex items-center gap-1">
                            <Clock size={12} /> Urgência
                          </span>
                        </label>
                        <div>
                          <label className={labelCls}><Calendar size={11} className="inline mr-1" />Agendamento</label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mb-1">Exibir a partir de</p>
                              <input type="date" className={`${inputCls} text-xs`}
                                value={productForm.startsAt ?? ""}
                                onChange={e => setProductForm(f => f ? { ...f, startsAt: e.target.value || undefined } : f)} />
                            </div>
                            <div>
                              <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mb-1">Exibir até</p>
                              <input type="date" className={`${inputCls} text-xs`}
                                value={productForm.endsAt ?? ""}
                                onChange={e => setProductForm(f => f ? { ...f, endsAt: e.target.value || undefined } : f)} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button onClick={saveProduct} className="flex-1 btn-primary-gradient text-xs py-2 rounded-xl">
                        <Check size={13} className="inline mr-1" /> Salvar
                      </button>
                      <button onClick={closeAllForms}
                        className="flex-1 text-xs py-2 rounded-xl border border-[hsl(var(--dash-border))] text-[hsl(var(--dash-text-muted))] hover:bg-[hsl(var(--dash-surface-2))] transition-all">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Link form */}
                {activeForm === "link" && linkForm && (
                  <div className="rounded-2xl border border-primary/20 bg-[hsl(var(--dash-accent))]/30 p-4 space-y-3">
                    <h3 className="text-[hsl(var(--dash-text))] text-sm font-semibold">
                      {editingLinkId ? "Editar Link" : "Novo Link"}
                    </h3>
                    <div>
                      <label className={labelCls}>Ícone</label>
                      <div className="flex gap-2">
                        {(["instagram", "youtube", "twitter", "globe", "link"] as LinkItem["icon"][]).map(ic => (
                          <button key={ic} onClick={() => setLinkForm(f => f ? { ...f, icon: ic, isSocial: ["instagram", "youtube", "twitter"].includes(ic) } : f)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                              linkForm.icon === ic
                                ? "border-primary/50 bg-[hsl(var(--dash-accent))] text-primary ring-1 ring-primary/20"
                                : "border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text-muted))] hover:border-primary/20"
                            }`}>{LINK_ICON_MAP[ic]}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Tipo</label>
                      <div className="flex gap-2">
                        {([
                          { v: "normal" as const, label: "Normal" },
                          { v: "spotlight" as const, label: "Destaque" },
                          { v: "header" as const, label: "Separador" },
                        ]).map(({ v, label }) => (
                          <button key={v} onClick={() => setLinkForm(f => f ? { ...f, type: v } : f)}
                            className={`flex-1 text-[11px] font-medium py-2 rounded-xl border transition-all ${
                              (linkForm.type ?? "normal") === v
                                ? "border-primary/50 bg-[hsl(var(--dash-accent))] text-primary"
                                : "border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text-muted))] hover:border-primary/20"
                            }`}>{label}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Título</label>
                      <input type="text" className={inputCls}
                        placeholder={(linkForm.type ?? "normal") === "header" ? "Ex: Meus Cursos" : "Instagram"}
                        value={linkForm.title}
                        onChange={e => setLinkForm(f => f ? { ...f, title: e.target.value } : f)} />
                    </div>
                    {(linkForm.type ?? "normal") !== "header" && (
                      <div>
                        <label className={labelCls}>URL</label>
                        <div className="relative">
                          <input type="url" className={inputCls}
                            placeholder={["instagram", "youtube", "twitter"].includes(linkForm.icon) ? "@seuhandle ou https://..." : "https://..."}
                            value={linkForm.url}
                            onChange={e => setLinkForm(f => f ? { ...f, url: e.target.value } : f)} />
                          {linkForm.url && !linkForm.url.startsWith("http") && ["instagram", "youtube", "twitter"].includes(linkForm.icon) && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-500">
                              ✓ detectado
                            </span>
                          )}
                          {linkForm.url && linkForm.url.startsWith("http") && (
                            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold ${isValidUrl(linkForm.url) ? "text-emerald-500" : "text-red-400"}`}>
                              {isValidUrl(linkForm.url) ? "✓" : "URL inválida"}
                            </span>
                          )}
                        </div>
                        {linkForm.url && !linkForm.url.startsWith("http") && ["instagram", "youtube", "twitter"].includes(linkForm.icon) && (
                          <p className="text-[11px] text-emerald-600 mt-1">
                            → {autoCompleteUrl(linkForm.icon, linkForm.url).replace("https://", "")}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button onClick={saveLink} className="flex-1 btn-primary-gradient text-xs py-2 rounded-xl">
                        <Check size={13} className="inline mr-1" /> Salvar
                      </button>
                      <button onClick={closeAllForms}
                        className="flex-1 text-xs py-2 rounded-xl border border-[hsl(var(--dash-border))] text-[hsl(var(--dash-text-muted))] hover:bg-[hsl(var(--dash-surface-2))] transition-all">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Testimonial form */}
                {activeForm === "testimonial" && (
                  <div className="rounded-2xl border border-primary/20 bg-[hsl(var(--dash-accent))]/30 p-4 space-y-3">
                    <h3 className="text-[hsl(var(--dash-text))] text-sm font-semibold">
                      {editingTestimonialId ? "Editar Depoimento" : "Novo Depoimento"}
                    </h3>
                    <div>
                      <label className={labelCls}>Nome</label>
                      <input type="text" className={inputCls} placeholder="João Silva"
                        value={testimonialForm.name}
                        onChange={e => setTestimonialForm(f => ({ ...f, name: e.target.value }))} />
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
                    {/* Mais opções */}
                    <button onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-1.5 text-[hsl(var(--dash-text-subtle))] text-[11px] font-medium hover:text-primary transition-colors">
                      <Settings size={11} /> Mais opções
                      {showAdvanced ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </button>
                    {showAdvanced && (
                      <div className="space-y-3 pt-1 border-t border-[hsl(var(--dash-border-subtle))]">
                        <div>
                          <label className={labelCls}>Cargo / Função</label>
                          <input type="text" className={inputCls} placeholder="Designer"
                            value={testimonialForm.role}
                            onChange={e => setTestimonialForm(f => ({ ...f, role: e.target.value }))} />
                        </div>
                        <div>
                          <label className={labelCls}>URL do Avatar</label>
                          <input type="url" className={inputCls} placeholder="https://..."
                            value={testimonialForm.avatar}
                            onChange={e => setTestimonialForm(f => ({ ...f, avatar: e.target.value }))} />
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button onClick={saveTestimonial} className="flex-1 btn-primary-gradient text-xs py-2 rounded-xl">
                        <Check size={13} className="inline mr-1" /> Salvar
                      </button>
                      <button onClick={closeAllForms}
                        className="flex-1 text-xs py-2 rounded-xl border border-[hsl(var(--dash-border))] text-[hsl(var(--dash-text-muted))] hover:bg-[hsl(var(--dash-surface-2))] transition-all">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Header/separator form */}
                {activeForm === "header" && (
                  <div className="rounded-2xl border border-primary/20 bg-[hsl(var(--dash-accent))]/30 p-4 space-y-3">
                    <h3 className="text-[hsl(var(--dash-text))] text-sm font-semibold">
                      {editingHeaderBlockId ? "Editar Separador" : "Novo Separador"}
                    </h3>
                    <div>
                      <label className={labelCls}>Título da seção</label>
                      <input type="text" className={inputCls} placeholder="Ex: Meus Cursos"
                        value={headerTitle}
                        onChange={e => setHeaderTitle(e.target.value)} />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={saveHeader} className="flex-1 btn-primary-gradient text-xs py-2 rounded-xl">
                        <Check size={13} className="inline mr-1" /> Salvar
                      </button>
                      <button onClick={closeAllForms}
                        className="flex-1 text-xs py-2 rounded-xl border border-[hsl(var(--dash-border))] text-[hsl(var(--dash-text-muted))] hover:bg-[hsl(var(--dash-surface-2))] transition-all">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Block list ── */}
                {blocks.length === 0 && !activeForm ? (
                  <div className="text-center py-14 space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-50 flex items-center justify-center">
                      <Layout size={28} className="text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-[hsl(var(--dash-text))] font-bold text-[17px]">Monte sua vitrine</h3>
                      <p className="text-[hsl(var(--dash-text-muted))] text-sm mt-1 max-w-[280px] mx-auto leading-relaxed">
                        Adicione produtos, links e depoimentos
                      </p>
                    </div>
                    <button onClick={() => setShowAddMenu(true)}
                      className="btn-primary-gradient text-sm px-8 py-3 rounded-xl font-semibold inline-flex items-center gap-2">
                      <Plus size={16} /> Adicionar à Vitrine
                    </button>
                    <p className="text-[hsl(var(--dash-text-subtle))] text-xs">
                      Vitrines com 3+ itens convertem 4x mais
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {blocks.map((block, idx) => {
                      const display = getBlockDisplay(block);
                      if (!display) return null;

                      // Delete confirmation state
                      if (confirmDeleteId === block.id) {
                        return (
                          <div key={block.id} className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 transition-all">
                            <span className="text-red-600 text-[13px] font-medium flex-1 truncate">
                              Excluir "{display.title}"?
                            </span>
                            <button onClick={() => removeBlock(block.id)}
                              className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors">
                              Excluir
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)}
                              className="px-3 py-1 rounded-lg border border-[hsl(var(--dash-border))] text-[hsl(var(--dash-text-muted))] text-xs hover:bg-[hsl(var(--dash-surface-2))] transition-all">
                              Cancelar
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div key={block.id}
                          className={`flex items-center gap-2 rounded-xl border p-3 transition-all glass-card-hover ${!display.active ? "opacity-50" : ""}`}>
                          {/* Reorder */}
                          <div className="flex flex-col gap-0.5 flex-shrink-0">
                            <button onClick={() => moveBlock(block.id, "up")} disabled={idx === 0}
                              className="p-0.5 rounded text-[hsl(var(--dash-text-subtle))] hover:text-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
                              <ChevronUp size={12} />
                            </button>
                            <button onClick={() => moveBlock(block.id, "down")} disabled={idx === blocks.length - 1}
                              className="p-0.5 rounded text-[hsl(var(--dash-text-subtle))] hover:text-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
                              <ChevronDown size={12} />
                            </button>
                          </div>

                          {/* Icon */}
                          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center flex-shrink-0">
                            {display.icon}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium truncate">{display.title}</p>
                              {display.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">
                                  {display.badge}
                                </span>
                              )}
                            </div>
                            {display.subtitle && (
                              <p className="text-[hsl(var(--dash-text-subtle))] text-xs truncate">{display.subtitle}</p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <button onClick={() => {
                              if (block.type === "product") {
                                const p = config.products.find(pr => pr.id === block.refId);
                                if (p) openEditProduct(p);
                              } else if (block.type === "link") {
                                const l = config.links.find(lk => lk.id === block.refId);
                                if (l) openEditLink(l);
                              } else if (block.type === "testimonial") {
                                const t = config.testimonials.find(te => te.id === block.refId);
                                if (t) openEditTestimonial(t);
                              } else if (block.type === "header") {
                                openEditHeader(block);
                              }
                            }}
                              className="p-1.5 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-primary hover:bg-[hsl(var(--dash-accent))] transition-all">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => setConfirmDeleteId(block.id)}
                              className="p-1.5 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-red-500 hover:bg-red-50 transition-all">
                              <Trash2 size={13} />
                            </button>
                            {display.hasToggle && (
                              <button onClick={() => toggleBlockItem(block.id)}>
                                {display.active
                                  ? <ToggleRight size={22} className="text-primary" />
                                  : <ToggleLeft size={22} className="text-[hsl(var(--dash-text-subtle))]" />}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ═══════════════ TAB: PERFIL ═══════════════ */}
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
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={suggestBio} disabled={aiLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-fuchsia-50 border border-fuchsia-200 text-fuchsia-700 text-[11px] font-medium hover:bg-fuchsia-100 transition-all disabled:opacity-50">
                      <Sparkles size={11} className={aiLoading ? "animate-spin" : ""} />
                      {aiLoading ? "Gerando..." : "Sugerir com IA"}
                    </button>
                    <p className="text-[hsl(var(--dash-text-subtle))] text-[11px]">
                      Bios com emojis recebem mais cliques
                    </p>
                  </div>
                  {aiSuggestion && (
                    <div className="mt-2 rounded-xl border border-fuchsia-200 bg-fuchsia-50 p-3 space-y-2">
                      <p className="text-fuchsia-800 text-[12px] font-medium">Sugestão da IA:</p>
                      <p className="text-fuchsia-900 text-[13px]">{aiSuggestion}</p>
                      <div className="flex gap-2">
                        <button onClick={() => { updateConfig("bio", aiSuggestion.slice(0, 120)); setAiSuggestion(null); }}
                          className="text-[11px] px-3 py-1 rounded-lg btn-primary-gradient font-medium">
                          Aplicar
                        </button>
                        <button onClick={() => setAiSuggestion(null)}
                          className="text-[11px] px-3 py-1 rounded-lg border border-[hsl(var(--dash-border))] text-[hsl(var(--dash-text-muted))] hover:bg-[hsl(var(--dash-surface-2))] transition-all">
                          Descartar
                        </button>
                      </div>
                    </div>
                  )}
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

            {/* ═══════════════ TAB: DESIGN ═══════════════ */}
            {activeTab === "design" && (
              <div className="space-y-5">
                <h2 className="text-[hsl(var(--dash-text))] font-semibold text-base">Visual da Vitrine</h2>

                {/* Mini preview */}
                <div className="rounded-2xl border border-[hsl(var(--dash-border-subtle))] overflow-hidden">
                  <div className="h-[200px] overflow-hidden flex items-start justify-center pt-4"
                    style={{ background: `linear-gradient(160deg,${currentTheme.bg} 60%,${currentTheme.accent}18)` }}>
                    <div className="transform scale-[0.45] origin-top">
                      <div className="w-[280px]">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 rounded-full mb-2" style={{ background: `linear-gradient(135deg,${currentTheme.accent},${currentTheme.accent2})` }} />
                          <div className="w-24 h-3 rounded bg-white/30 mb-1" />
                          <div className="w-32 h-2 rounded bg-white/15 mb-3" />
                          <div className="w-full h-8 rounded-xl mb-2" style={{ background: currentTheme.accent + "20", border: `1px solid ${currentTheme.accent}30` }} />
                          <div className="w-full h-8 rounded-xl" style={{ background: currentTheme.accent + "10", border: `1px solid ${currentTheme.accent}20` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Theme info */}
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {[currentTheme.bg, currentTheme.accent, currentTheme.accent2].map((c, i) => (
                      <div key={i} className="w-6 h-6 rounded-full ring-1 ring-white/10" style={{ background: c }} />
                    ))}
                  </div>
                  <div>
                    <p className="text-[hsl(var(--dash-text))] text-sm font-medium">Tema: {currentTheme.label}</p>
                    <p className="text-[hsl(var(--dash-text-subtle))] text-xs">Cores, fontes e layout</p>
                  </div>
                </div>

                {/* CTA to Aparência page */}
                <button onClick={() => navigate("/dashboard/aparencia")}
                  className="w-full btn-primary-gradient text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
                  <Palette size={16} /> Personalizar Design
                  <ExternalLink size={12} />
                </button>
              </div>
            )}

            {/* Auto-save toast */}
            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[12px] font-medium shadow-sm transition-all duration-300 pointer-events-none whitespace-nowrap ${toastVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
              <Check size={13} className="text-emerald-500" />
              Alterações salvas
            </div>

          </div>
        </div>

        {/* ── RIGHT PANEL: Phone preview (400px) ── */}
        <div className="hidden lg:block">
          <div className="sticky top-8">
            <p className="text-[hsl(var(--dash-text-subtle))] text-xs font-medium mb-3 uppercase tracking-wider">
              Pré-visualização ao vivo
            </p>
            {phonePreview}
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-[hsl(var(--dash-text-subtle))] text-[11px]">Tema: {currentTheme.label}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Mobile preview button */}
      <button
        onClick={() => setShowMobilePreview(true)}
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 lg:hidden flex items-center gap-2 px-5 py-3 rounded-full btn-primary-gradient shadow-xl text-sm font-semibold"
      >
        <Eye size={16} /> Ver Preview
      </button>

      {/* Mobile preview bottom sheet */}
      {showMobilePreview && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobilePreview(false)} />
          <div className="relative bg-[hsl(var(--dash-surface))] rounded-t-3xl max-h-[88vh] overflow-y-auto pb-8 shadow-2xl"
            style={{ animation: "slideUp 0.3s ease" }}>
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
