import { useState, useEffect, useCallback } from "react";
import {
  User, Palette, Package, Link2, Star, Plus, Trash2, Pencil,
  Check, ToggleLeft, ToggleRight, Instagram, Youtube, Twitter, Globe,
  MessageCircle, Clock, ChevronDown, ChevronUp, Save,
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

// ── Default config ─────────────────────────────────────────────────────────

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

// ── Icon map ───────────────────────────────────────────────────────────────

const LINK_ICON_MAP: Record<LinkItem["icon"], React.ReactNode> = {
  instagram: <Instagram size={14} />,
  youtube:   <Youtube size={14} />,
  twitter:   <Twitter size={14} />,
  globe:     <Globe size={14} />,
  link:      <Link2 size={14} />,
};

const PRODUCT_EMOJIS = ["🎯", "📚", "🎨", "💡", "🚀", "🎤", "💎", "🔑", "⚡", "🛒"];

// ── Tab types ──────────────────────────────────────────────────────────────

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
  title: "",
  description: "",
  price: "",
  originalPrice: "",
  emoji: "🎯",
  url: "",
  badge: "",
  urgency: false,
  active: true,
});

const emptyLink = (isSocial: boolean): LinkItem => ({
  id: Date.now().toString(),
  title: "",
  url: "",
  icon: isSocial ? "instagram" : "globe",
  active: true,
  isSocial,
});

const emptyTestimonial = (): TestimonialItem => ({
  id: Date.now().toString(),
  name: "",
  role: "",
  text: "",
  stars: 5,
  avatar: "",
});

// ── Main component ─────────────────────────────────────────────────────────

const DashboardPagina = () => {
  const [config, setConfig] = useState<VitrineConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<TabId>("perfil");
  const [saved, setSaved] = useState(false);

  // Product form state
  const [productForm, setProductForm] = useState<ProductItem | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Link form state
  const [showLinkForm, setShowLinkForm] = useState<"social" | "other" | null>(null);
  const [linkForm, setLinkForm] = useState<LinkItem | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  // Testimonial form state
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState<TestimonialItem>(emptyTestimonial());

  // ── Load on mount ──────────────────────────────────────────────────────

  useEffect(() => {
    const loadConfig = async () => {
      // Load saved config from localStorage
      const stored = localStorage.getItem(LS_KEY);
      const base: VitrineConfig = stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : { ...DEFAULT_CONFIG };

      // Hydrate username/displayName from Supabase session
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const user = data.session.user;
          if (!base.displayName) base.displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "";
          if (!base.username) base.username = user.user_metadata?.username || user.email?.split("@")[0] || "";
        }
      } catch {
        // session unavailable — keep localStorage values
      }

      setConfig(base);
    };

    loadConfig();
  }, []);

  // ── Auto-save to localStorage ──────────────────────────────────────────

  const updateConfig = useCallback(<K extends keyof VitrineConfig>(key: K, value: VitrineConfig[K]) => {
    setConfig(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateConfigBulk = useCallback((partial: Partial<VitrineConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // ── Save button ────────────────────────────────────────────────────────

  const handleSave = () => {
    localStorage.setItem(LS_KEY, JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ── Product helpers ────────────────────────────────────────────────────

  const openAddProduct = () => {
    setEditingProductId(null);
    setProductForm(emptyProduct());
  };

  const openEditProduct = (p: ProductItem) => {
    setEditingProductId(p.id);
    setProductForm({ ...p });
  };

  const cancelProductForm = () => {
    setProductForm(null);
    setEditingProductId(null);
  };

  const saveProduct = () => {
    if (!productForm) return;
    if (editingProductId) {
      updateConfig("products", config.products.map(p => p.id === editingProductId ? { ...productForm, id: editingProductId } : p));
    } else {
      updateConfig("products", [...config.products, productForm]);
    }
    cancelProductForm();
  };

  const deleteProduct = (id: string) => updateConfig("products", config.products.filter(p => p.id !== id));
  const toggleProduct = (id: string) => updateConfig("products", config.products.map(p => p.id === id ? { ...p, active: !p.active } : p));

  // ── Link helpers ───────────────────────────────────────────────────────

  const openAddLink = (isSocial: boolean) => {
    setEditingLinkId(null);
    const lf = emptyLink(isSocial);
    setLinkForm(lf);
    setShowLinkForm(isSocial ? "social" : "other");
  };

  const openEditLink = (l: LinkItem) => {
    setEditingLinkId(l.id);
    setLinkForm({ ...l });
    setShowLinkForm(l.isSocial ? "social" : "other");
  };

  const cancelLinkForm = () => {
    setLinkForm(null);
    setEditingLinkId(null);
    setShowLinkForm(null);
  };

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

  // ── Testimonial helpers ────────────────────────────────────────────────

  const saveTestimonial = () => {
    if (!testimonialForm.name.trim()) return;
    updateConfig("testimonials", [...config.testimonials, { ...testimonialForm, id: Date.now().toString() }]);
    setTestimonialForm(emptyTestimonial());
    setShowTestimonialForm(false);
  };

  const deleteTestimonial = (id: string) => updateConfig("testimonials", config.testimonials.filter(t => t.id !== id));

  // ── Derived theme data ─────────────────────────────────────────────────

  const currentTheme = THEMES.find(t => t.id === config.theme) ?? THEMES[0];

  // ── Shared input styles ────────────────────────────────────────────────

  const inputCls = "w-full rounded-xl border border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text))] text-sm px-3.5 py-2.5 placeholder:text-[hsl(var(--dash-text-subtle))] focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all";
  const labelCls = "block text-[hsl(var(--dash-text-secondary))] text-xs font-medium mb-1.5";

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">Minha Vitrine</h1>
          <p className="text-[hsl(var(--dash-text-muted))] text-[15px]">Construa sua vitrine digital com blocos</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 btn-primary-gradient text-[13px] px-4 py-2.5 rounded-xl active:scale-[0.98] flex-shrink-0"
        >
          {saved ? <><Check size={14} /> Salvo!</> : <><Save size={14} /> Salvar</>}
        </button>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

        {/* ── LEFT PANEL ── */}
        <div className="min-w-0">

          {/* Tab bar */}
          <div className="flex gap-1 p-1 glass-card rounded-2xl mb-5 overflow-x-auto scrollbar-none">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-primary/90 to-secondary/90 text-white shadow-sm"
                    : "text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] hover:bg-[hsl(var(--dash-surface-2))]"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="glass-card rounded-2xl p-5 md:p-6">

            {/* ── PERFIL ── */}
            {activeTab === "perfil" && (
              <div className="space-y-5">
                <h2 className="text-[hsl(var(--dash-text))] font-semibold text-base">Informações do Perfil</h2>

                {/* Avatar */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl flex-shrink-0 overflow-hidden ring-2 ring-[hsl(var(--dash-border))]">
                    {config.avatarUrl ? (
                      <img src={config.avatarUrl} alt="avatar" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
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
                    <input
                      type="url"
                      className={inputCls}
                      placeholder="https://exemplo.com/foto.jpg"
                      value={config.avatarUrl}
                      onChange={e => updateConfig("avatarUrl", e.target.value)}
                    />
                  </div>
                </div>

                {/* Display name */}
                <div>
                  <label className={labelCls}>Nome de Exibição</label>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="Seu nome"
                    value={config.displayName}
                    onChange={e => updateConfig("displayName", e.target.value)}
                  />
                </div>

                {/* Username */}
                <div>
                  <label className={labelCls}>Username</label>
                  <div className="flex items-center gap-0">
                    <span className="flex-shrink-0 rounded-l-xl border border-r-0 border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] text-sm px-3 py-2.5">@</span>
                    <input
                      type="text"
                      className={`${inputCls} rounded-l-none`}
                      placeholder="seunome"
                      value={config.username}
                      onChange={e => updateConfig("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`${labelCls} mb-0`}>Bio</label>
                    <span className={`text-xs ${config.bio.length > 110 ? "text-amber-500" : "text-[hsl(var(--dash-text-subtle))]"}`}>
                      {config.bio.length}/120
                    </span>
                  </div>
                  <textarea
                    className={`${inputCls} resize-none h-20`}
                    placeholder="Fale sobre você em poucas palavras..."
                    maxLength={120}
                    value={config.bio}
                    onChange={e => updateConfig("bio", e.target.value)}
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className={labelCls}>WhatsApp <span className="text-[hsl(var(--dash-text-subtle))] font-normal">(opcional)</span></label>
                  <div className="flex items-center gap-0">
                    <span className="flex-shrink-0 rounded-l-xl border border-r-0 border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] text-sm px-3 py-2.5 select-none">🇧🇷</span>
                    <input
                      type="tel"
                      className={`${inputCls} rounded-l-none`}
                      placeholder="11999999999"
                      value={config.whatsapp}
                      onChange={e => updateConfig("whatsapp", e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                  <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-1.5">Apenas números, com DDD. Ex: 11999999999</p>
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
                      <button
                        key={theme.id}
                        onClick={() => updateConfig("theme", theme.id)}
                        className={`relative rounded-2xl border p-4 text-left transition-all ${
                          isSelected
                            ? "border-violet-500 ring-2 ring-violet-500/30"
                            : "border-[hsl(var(--dash-border-subtle))] hover:border-[hsl(var(--dash-border))]"
                        }`}
                        style={{ background: theme.bg }}
                      >
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: theme.accent }}>
                            <Check size={11} className="text-white" />
                          </div>
                        )}
                        {/* Color swatches */}
                        <div className="flex gap-1.5 mb-3">
                          <div className="w-5 h-5 rounded-full ring-1 ring-white/10" style={{ background: theme.bg }} />
                          <div className="w-5 h-5 rounded-full ring-1 ring-white/10" style={{ background: theme.accent }} />
                          <div className="w-5 h-5 rounded-full ring-1 ring-white/10" style={{ background: theme.accent2 }} />
                        </div>
                        {/* Mini preview strip */}
                        <div className="w-full h-1 rounded-full mb-2.5 opacity-70" style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})` }} />
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
                <div className="flex items-center justify-between">
                  <h2 className="text-[hsl(var(--dash-text))] font-semibold text-base">Produtos</h2>
                  {!productForm && (
                    <button onClick={openAddProduct} className="flex items-center gap-1.5 btn-primary-gradient text-xs px-3 py-2 rounded-xl">
                      <Plus size={13} /> Adicionar Produto
                    </button>
                  )}
                </div>

                {/* Product form */}
                {productForm && (
                  <div className="rounded-2xl border border-primary/20 bg-[hsl(var(--dash-accent))]/30 p-4 space-y-3">
                    <h3 className="text-[hsl(var(--dash-text))] text-sm font-semibold">
                      {editingProductId ? "Editar Produto" : "Novo Produto"}
                    </h3>

                    {/* Emoji picker */}
                    <div>
                      <label className={labelCls}>Emoji</label>
                      <div className="flex gap-2 flex-wrap">
                        {PRODUCT_EMOJIS.map(em => (
                          <button
                            key={em}
                            onClick={() => setProductForm(f => f ? { ...f, emoji: em } : f)}
                            className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all ${
                              productForm.emoji === em
                                ? "border-primary/50 bg-[hsl(var(--dash-accent))] ring-1 ring-primary/20"
                                : "border-[hsl(var(--dash-border-subtle))] hover:border-primary/20"
                            }`}
                          >
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
                      <button onClick={cancelProductForm} className="flex-1 text-xs py-2 rounded-xl border border-[hsl(var(--dash-border))] text-[hsl(var(--dash-text-muted))] hover:bg-[hsl(var(--dash-surface-2))] transition-all">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Product list */}
                {config.products.length === 0 && !productForm ? (
                  <div className="text-center py-12 text-[hsl(var(--dash-text-subtle))]">
                    <Package size={36} className="mx-auto mb-2 opacity-25" />
                    <p className="text-sm">Nenhum produto ainda</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {config.products.map(p => (
                      <div
                        key={p.id}
                        className={`flex items-center gap-3 rounded-xl border p-3.5 transition-all ${!p.active ? "opacity-50" : ""} glass-card-hover`}
                      >
                        <span className="text-xl flex-shrink-0">{p.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium truncate">{p.title || "Sem título"}</p>
                          <p className="text-[hsl(var(--dash-text-subtle))] text-xs truncate">{p.price}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditProduct(p)} className="p-1.5 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-primary hover:bg-[hsl(var(--dash-accent))] transition-all">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => deleteProduct(p.id)} className="p-1.5 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-red-500 hover:bg-red-50 transition-all">
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
                  </div>
                )}
              </div>
            )}

            {/* ── LINKS ── */}
            {activeTab === "links" && (
              <div className="space-y-6">
                <h2 className="text-[hsl(var(--dash-text))] font-semibold text-base">Links</h2>

                {/* Link form */}
                {linkForm && (
                  <div className="rounded-2xl border border-primary/20 bg-[hsl(var(--dash-accent))]/30 p-4 space-y-3">
                    <h3 className="text-[hsl(var(--dash-text))] text-sm font-semibold">
                      {editingLinkId ? "Editar Link" : showLinkForm === "social" ? "Nova Rede Social" : "Novo Link"}
                    </h3>
                    <div>
                      <label className={labelCls}>Ícone</label>
                      <div className="flex gap-2">
                        {(["instagram", "youtube", "twitter", "globe", "link"] as LinkItem["icon"][]).map(ic => (
                          <button
                            key={ic}
                            onClick={() => setLinkForm(f => f ? { ...f, icon: ic } : f)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                              linkForm.icon === ic
                                ? "border-primary/50 bg-[hsl(var(--dash-accent))] text-primary ring-1 ring-primary/20"
                                : "border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text-muted))] hover:border-primary/20"
                            }`}
                          >
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
                      <button onClick={cancelLinkForm} className="flex-1 text-xs py-2 rounded-xl border border-[hsl(var(--dash-border))] text-[hsl(var(--dash-text-muted))] hover:bg-[hsl(var(--dash-surface-2))] transition-all">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Social links section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[hsl(var(--dash-text-secondary))] text-sm font-medium">Redes Sociais</p>
                    {!linkForm && (
                      <button onClick={() => openAddLink(true)} className="flex items-center gap-1 text-xs text-primary hover:opacity-75 transition-opacity">
                        <Plus size={12} /> Adicionar
                      </button>
                    )}
                  </div>
                  {config.links.filter(l => l.isSocial).length === 0 ? (
                    <p className="text-[hsl(var(--dash-text-subtle))] text-xs py-3 text-center">Nenhuma rede social adicionada</p>
                  ) : (
                    <div className="space-y-2">
                      {config.links.filter(l => l.isSocial).map(l => (
                        <LinkRow key={l.id} link={l} onEdit={openEditLink} onDelete={deleteLink} onToggle={toggleLink} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="dash-divider" />

                {/* Other links section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[hsl(var(--dash-text-secondary))] text-sm font-medium">Outros Links</p>
                    {!linkForm && (
                      <button onClick={() => openAddLink(false)} className="flex items-center gap-1 text-xs text-primary hover:opacity-75 transition-opacity">
                        <Plus size={12} /> Adicionar
                      </button>
                    )}
                  </div>
                  {config.links.filter(l => !l.isSocial).length === 0 ? (
                    <p className="text-[hsl(var(--dash-text-subtle))] text-xs py-3 text-center">Nenhum link adicionado</p>
                  ) : (
                    <div className="space-y-2">
                      {config.links.filter(l => !l.isSocial).map(l => (
                        <LinkRow key={l.id} link={l} onEdit={openEditLink} onDelete={deleteLink} onToggle={toggleLink} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── DEPOIMENTOS ── */}
            {activeTab === "depoimentos" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[hsl(var(--dash-text))] font-semibold text-base">Depoimentos</h2>
                  {!showTestimonialForm && (
                    <button onClick={() => setShowTestimonialForm(true)} className="flex items-center gap-1.5 btn-primary-gradient text-xs px-3 py-2 rounded-xl">
                      <Plus size={13} /> Adicionar
                    </button>
                  )}
                </div>

                {/* Testimonial form */}
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
                      <textarea
                        className={`${inputCls} resize-none h-20`}
                        placeholder="O que o cliente disse..."
                        maxLength={200}
                        value={testimonialForm.text}
                        onChange={e => setTestimonialForm(f => ({ ...f, text: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Avaliação</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button
                            key={n}
                            onClick={() => setTestimonialForm(f => ({ ...f, stars: n }))}
                            className={`text-xl transition-all ${n <= testimonialForm.stars ? "opacity-100" : "opacity-25"}`}
                          >
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
                      <button onClick={() => { setShowTestimonialForm(false); setTestimonialForm(emptyTestimonial()); }} className="flex-1 text-xs py-2 rounded-xl border border-[hsl(var(--dash-border))] text-[hsl(var(--dash-text-muted))] hover:bg-[hsl(var(--dash-surface-2))] transition-all">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Testimonials list */}
                {config.testimonials.length === 0 && !showTestimonialForm ? (
                  <div className="text-center py-12 text-[hsl(var(--dash-text-subtle))]">
                    <Star size={36} className="mx-auto mb-2 opacity-25" />
                    <p className="text-sm">Adicione depoimentos dos seus clientes</p>
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
                        <button onClick={() => deleteTestimonial(t.id)} className="p-1.5 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* ── RIGHT PANEL: Phone preview ── */}
        <div className="hidden lg:block">
          <div className="sticky top-8">
            <p className="text-[hsl(var(--dash-text-subtle))] text-xs font-medium mb-3 uppercase tracking-wider">Pré-visualização ao vivo</p>
            <div className="relative">
              {/* Phone shell */}
              <div className="rounded-[2.8rem] border-[3px] border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-surface))] p-3 shadow-2xl">
                {/* Notch */}
                <div className="flex justify-center mb-2">
                  <div className="w-20 h-5 rounded-full bg-[hsl(var(--dash-surface-2))]" />
                </div>
                {/* Screen */}
                <div
                  className="rounded-[2rem] min-h-[520px] p-5 overflow-hidden"
                  style={{ background: `linear-gradient(160deg, ${currentTheme.bg} 60%, ${currentTheme.accent}18)` }}
                >
                  {/* Profile section */}
                  <div className="flex flex-col items-center mb-5">
                    <div className="w-16 h-16 rounded-full mb-2.5 overflow-hidden" style={{ boxShadow: `0 0 0 2px ${currentTheme.accent}40` }}>
                      {config.avatarUrl ? (
                        <img src={config.avatarUrl} alt="avatar" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${currentTheme.accent}, ${currentTheme.accent2})` }}>
                          <span className="text-white text-xl font-bold">
                            {config.displayName ? config.displayName[0].toUpperCase() : "?"}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="font-bold text-sm" style={{ color: "#fff" }}>
                      {config.displayName || "Seu Nome"}
                    </p>
                    {config.username && (
                      <p className="text-xs mt-0.5" style={{ color: currentTheme.accent }}>@{config.username}</p>
                    )}
                    {config.bio && (
                      <p className="text-xs text-center mt-1.5 px-2 opacity-70 line-clamp-2" style={{ color: "#ccc" }}>{config.bio}</p>
                    )}
                    {/* WhatsApp indicator */}
                    {config.whatsapp && (
                      <div className="flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full" style={{ background: "#25d36620" }}>
                        <MessageCircle size={10} style={{ color: "#25d366" }} />
                        <span className="text-[10px]" style={{ color: "#25d366" }}>WhatsApp</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#25d366]" />
                      </div>
                    )}
                  </div>

                  {/* Products preview */}
                  {config.products.filter(p => p.active).slice(0, 2).map(p => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2.5 rounded-xl border p-2.5 mb-2"
                      style={{ borderColor: currentTheme.accent + "30", background: currentTheme.accent + "0a" }}
                    >
                      <span className="text-base flex-shrink-0">{p.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: "#fff" }}>{p.title}</p>
                        {p.price && <p className="text-[10px]" style={{ color: currentTheme.accent }}>{p.price}</p>}
                      </div>
                      {p.urgency && <Clock size={10} style={{ color: currentTheme.accent2 }} />}
                    </div>
                  ))}

                  {/* Links preview */}
                  {config.links.filter(l => l.active).slice(0, 2).map(l => (
                    <div
                      key={l.id}
                      className="flex items-center gap-2 rounded-xl border p-2.5 mb-2"
                      style={{ borderColor: currentTheme.accent + "25", background: currentTheme.accent + "08" }}
                    >
                      <span style={{ color: currentTheme.accent }}>{LINK_ICON_MAP[l.icon]}</span>
                      <span className="text-xs truncate" style={{ color: "#ccc" }}>{l.title || l.url}</span>
                    </div>
                  ))}

                  {/* Empty state */}
                  {config.products.filter(p => p.active).length === 0 && config.links.filter(l => l.active).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 opacity-30">
                      <p className="text-xs" style={{ color: "#aaa" }}>Adicione produtos e links</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Theme label */}
            <div className="mt-3 text-center">
              <span className="text-[hsl(var(--dash-text-subtle))] text-[11px]">Tema: {currentTheme.label}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// ── LinkRow subcomponent ───────────────────────────────────────────────────

interface LinkRowProps {
  link: LinkItem;
  onEdit: (l: LinkItem) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

const LinkRow = ({ link, onEdit, onDelete, onToggle }: LinkRowProps) => (
  <div className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${!link.active ? "opacity-50" : ""} glass-card-hover`}>
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

export default DashboardPagina;
