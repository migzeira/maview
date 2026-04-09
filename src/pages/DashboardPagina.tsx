import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Palette, Package, Link2, Star, Plus, Trash2, Pencil,
  Check, ToggleLeft, ToggleRight, Instagram, Youtube, Twitter, Globe,
  MessageCircle, Clock, ChevronDown, ChevronUp, Eye, X, Copy, ExternalLink,
  Sparkles, Calendar, Settings, Layout, GripVertical, AlertCircle,
  TrendingUp, Zap, ArrowRight, CheckCircle2, Circle, Image, Type, Video,
  Play, Smile, Search,
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
  images: string[];
  video?: string;
  url: string;
  linkType?: "url" | "whatsapp" | "none" | "booking";
  whatsappMsg?: string;
  ctaText?: string;
  badge: string;
  urgency: boolean;
  active: boolean;
  startsAt?: string;
  endsAt?: string;
  // booking fields
  bookingDuration?: number;       // minutes: 15, 30, 45, 60, 90, 120
  bookingDays?: string[];         // ["seg","ter","qua","qui","sex","sab","dom"]
  bookingStart?: string;          // "09:00"
  bookingEnd?: string;            // "18:00"
  bookingChannel?: "whatsapp" | "google" | "calendly" | "external"; // integration
  bookingUrl?: string;            // Calendly/Cal.com/custom URL
  // migration compat
  imageUrl?: string;
  videoUrl?: string;
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
  onboardingDone?: boolean;
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
  onboardingDone: false,
};

const LS_KEY = "maview_vitrine_config";

const LINK_ICON_MAP: Record<LinkItem["icon"], React.ReactNode> = {
  instagram: <Instagram size={14} />,
  youtube:   <Youtube size={14} />,
  twitter:   <Twitter size={14} />,
  globe:     <Globe size={14} />,
  link:      <Link2 size={14} />,
};

// ── Full emoji picker data ─────────────────────────────────────────────────

interface EmojiCategory {
  name: string;
  icon: string;
  emojis: string[];
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  { name: "Populares", icon: "⭐", emojis: [
    "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","😉","😊","😇","🥰","😍","🤩","😘","😗","😚","😋","😛",
    "😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","😐","😏","😒","🙄","😬","😌","😴","🤤","😷","🤒","🤕","🤢",
    "🤮","🥵","🥶","😱","😨","😰","😥","😢","😭","😤","😡","🤬","😈","👿","💀","☠️","💩","🤡","👹","👺",
  ]},
  { name: "Negócios", icon: "💼", emojis: [
    "💼","📊","📈","📉","💰","💵","💴","💶","💷","💳","🧾","📋","📌","📍","🗂","📁","📂","💡","🔑","🏆",
    "🎯","✅","❌","⭐","🌟","💫","🔥","✨","💎","👑","🎖","🏅","🥇","🥈","🥉","📣","📢","🔔","🔒","🔓",
  ]},
  { name: "Produtos", icon: "🛒", emojis: [
    "🛒","🛍","🎁","📦","🏷","💻","📱","⌚","📷","🎥","🎧","🎮","🕹","📚","📘","📕","📗","📙","📔","📒",
    "🎨","🖌","✏️","📐","📏","🔧","🔨","⚙️","🔩","💊","🧴","👗","👠","👟","🧢","👜","💍","🕶","🧳","🎒",
  ]},
  { name: "Comida", icon: "🍔", emojis: [
    "☕","🍵","🧋","🍰","🎂","🍫","🍬","🍭","🍿","🍩","🍪","🧁","🍕","🍔","🌮","🌯","🥗","🍜","🍝","🍣",
    "🍱","🥘","🍲","🥩","🍗","🥐","🍞","🧀","🥚","🥞","🍎","🍊","🍋","🍇","🍓","🫐","🥑","🥕","🌽","🍺",
  ]},
  { name: "Natureza", icon: "🌿", emojis: [
    "🌺","🌸","🌹","🌷","💐","🌻","🌼","🍀","☘","🌿","🍃","🍂","🍁","🌾","🌵","🎄","🌲","🌳","🌴","🪴",
    "🌱","🌊","💧","🔥","⛈","🌈","☀️","🌤","⭐","🌙","🦋","🐝","🌎","🌍","🌏","❄️","⛄","🍄","🐚","🪨",
  ]},
  { name: "Coração", icon: "❤️", emojis: [
    "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","♥️","💟",
    "🫶","🤝","🙏","✌️","🤞","🤟","🤘","👊","✊","👏","🙌","👐","🤲","💪","🦾","👍","👎","☝️","👆","👇",
  ]},
  { name: "Viagem", icon: "✈️", emojis: [
    "✈️","🛫","🛬","🚀","🛸","🚁","⛵","🚤","🛳","🚂","🚃","🚄","🚅","🏎","🚗","🚕","🚙","🚌","🏍","🛵",
    "🚲","🛴","🏠","🏡","🏢","🏖","🏔","⛰","🗻","🗼","🗽","🎡","🎢","🎠","⛲","🌉","🏰","🛕","⛩","🕌",
  ]},
  { name: "Atividades", icon: "⚽", emojis: [
    "⚽","🏀","🏈","⚾","🎾","🏐","🏉","🎱","🏓","🏸","🥊","🥋","🎽","🛹","⛸","🎿","🏋️","🤸","🧘","🚴",
    "🎵","🎶","🎤","🎸","🥁","🎺","🎷","🎹","🎻","🎼","🎬","🎭","🎪","🎨","🎲","♟","🧩","🎰","🪄","🎩",
  ]},
  { name: "Animais", icon: "🐶", emojis: [
    "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐔","🐧",
    "🐦","🐤","🦆","🦅","🦉","🦇","🐺","🦄","🐴","🐝","🦋","🐛","🐞","🐢","🐍","🦎","🦖","🐙","🐬","🐳",
  ]},
  { name: "Símbolos", icon: "💯", emojis: [
    "💯","💢","💥","💫","💦","💨","🕳","💬","💭","🗯","♨️","🔰","⚠️","🚫","❗","❓","‼️","⁉️","🔅","🔆",
    "♻️","🔱","📛","🔰","⭕","✳️","❇️","✴️","💠","🔷","🔶","🔵","🔴","🟡","🟢","🟣","⚪","⚫","🟤","🔲",
  ]},
];

type TabId = "vitrine" | "perfil" | "design";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "vitrine", label: "Vitrine",  icon: <Package size={15} /> },
  { id: "perfil",  label: "Perfil",   icon: <User size={15} /> },
  { id: "design",  label: "Design",   icon: <Palette size={15} /> },
];

// ── Empty forms ────────────────────────────────────────────────────────────

const BOOKING_DAYS_ALL = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
const BOOKING_DAYS_LABELS: Record<string, string> = { seg: "S", ter: "T", qua: "Q", qui: "Q", sex: "S", sab: "S", dom: "D" };
const BOOKING_DURATIONS = [
  { min: 15,  label: "15min" },
  { min: 30,  label: "30min" },
  { min: 45,  label: "45min" },
  { min: 60,  label: "1h" },
  { min: 90,  label: "1h30" },
  { min: 120, label: "2h" },
];

const emptyProduct = (): ProductItem => ({
  id: Date.now().toString(),
  title: "", description: "", price: "", originalPrice: "",
  emoji: "🎯", images: [], url: "", linkType: "url", whatsappMsg: "", ctaText: "",
  badge: "", urgency: false, active: true,
  bookingDuration: 60,
  bookingDays: ["seg", "ter", "qua", "qui", "sex"],
  bookingStart: "09:00",
  bookingEnd: "18:00",
  bookingChannel: "whatsapp",
  bookingUrl: "",
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

// ── Health checklist ──────────────────────────────────────────────────────

interface HealthItem {
  key: string;
  label: string;
  tip: string;
  points: number;
  check: (cfg: VitrineConfig) => boolean;
}

const HEALTH_ITEMS: HealthItem[] = [
  { key: "avatar",       label: "Foto de perfil",       tip: "Perfis com foto recebem 80% mais cliques",          points: 15, check: cfg => !!cfg.avatarUrl },
  { key: "name-bio",     label: "Nome e bio",           tip: "Complete seu perfil para gerar confiança",           points: 10, check: cfg => !!(cfg.displayName && cfg.bio) },
  { key: "theme",        label: "Tema escolhido",       tip: "Um visual consistente reforça sua marca",            points: 10, check: cfg => !!cfg.theme },
  { key: "products",     label: "Pelo menos 1 produto", tip: "Produtos ativos geram receita direta",              points: 20, check: cfg => cfg.products.filter(p => p.active).length > 0 },
  { key: "links",        label: "Links adicionados",    tip: "Conecte suas redes para ampliar seu alcance",        points: 15, check: cfg => cfg.links.length > 0 },
  { key: "testimonials", label: "Depoimentos",          tip: "Prova social aumenta conversão em até 72%",          points: 15, check: cfg => cfg.testimonials.length > 0 },
  { key: "whatsapp",     label: "WhatsApp conectado",   tip: "Contato direto converte 3x mais que formulários",    points: 15, check: cfg => !!cfg.whatsapp },
];

function calcHealth(cfg: VitrineConfig): number {
  return HEALTH_ITEMS.reduce((s, item) => s + (item.check(cfg) ? item.points : 0), 0);
}

// ── Utilities ──────────────────────────────────────────────────────────────

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
  return { text: "Sua vitrine está completa e no ar!", complete: true };
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

// ── Onboarding Steps ──────────────────────────────────────────────────────

const ONBOARDING_STEPS = [
  {
    title: "Seu perfil",
    description: "Adicione foto, nome e bio para que visitantes te conheçam",
    icon: <User size={24} className="text-violet-500" />,
    tab: "perfil" as TabId,
  },
  {
    title: "Primeiro produto",
    description: "Crie seu primeiro produto e comece a faturar",
    icon: <Package size={24} className="text-emerald-500" />,
    tab: "vitrine" as TabId,
    action: "product",
  },
  {
    title: "Seus links",
    description: "Conecte Instagram, YouTube e outras redes",
    icon: <Link2 size={24} className="text-blue-500" />,
    tab: "vitrine" as TabId,
    action: "link",
  },
  {
    title: "Prova social",
    description: "Depoimentos aumentam conversão em até 72%",
    icon: <Star size={24} className="text-amber-500" />,
    tab: "vitrine" as TabId,
    action: "testimonial",
  },
];

// ── Profile Hero Card ──────────────────────────────────────────────────────

type HealthAction = "avatar" | "name-bio" | "theme" | "products" | "links" | "testimonials" | "whatsapp";

interface ProfileHeroCardProps {
  config: VitrineConfig;
  onUpdate: (key: keyof VitrineConfig, value: string) => void;
  onEditProfile: () => void;
  onHealthAction: (action: HealthAction) => void;
}

const ProfileHeroCard = ({ config, onUpdate, onEditProfile, onHealthAction }: ProfileHeroCardProps) => {
  const [copied, setCopied] = useState(false);
  const [showHealthDetail, setShowHealthDetail] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [avatarTab, setAvatarTab] = useState<"upload" | "url">("upload");
  const [nameVal, setNameVal] = useState(config.displayName);
  const [avatarVal, setAvatarVal] = useState(config.avatarUrl);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const avatarUrlInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileUrl = config.username ? `maview.app/@${config.username}` : null;
  const currentTheme = THEMES.find(t => t.id === config.theme) ?? THEMES[0];
  const health = calcHealth(config);
  const socialLinks = config.links.filter(l => l.isSocial && l.active);
  const initials = config.displayName
    ? config.displayName.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()
    : "?";

  useEffect(() => { setNameVal(config.displayName); }, [config.displayName]);
  useEffect(() => { setAvatarVal(config.avatarUrl); }, [config.avatarUrl]);
  useEffect(() => { if (editingName) nameInputRef.current?.focus(); }, [editingName]);

  const saveName = () => {
    if (nameVal.trim()) onUpdate("displayName", nameVal.trim());
    setEditingName(false);
  };

  const saveAvatarUrl = () => {
    onUpdate("avatarUrl", avatarVal.trim());
    setEditingAvatar(false);
    setAvatarPreview(null);
  };

  // Compress & convert file to base64 via canvas
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const MAX = 400;
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        setAvatarPreview(dataUrl);
        onUpdate("avatarUrl", dataUrl);
        setEditingAvatar(false);
        setUploading(false);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    // reset so same file can be re-selected
    e.target.value = "";
  };

  const copyLink = () => {
    if (!profileUrl) return;
    navigator.clipboard.writeText(`https://${profileUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const healthColor = health >= 80 ? "text-emerald-500" : health >= 50 ? "text-amber-500" : "text-red-400";

  return (
    <div className="glass-card rounded-2xl p-4 md:p-5 mb-5">
      <div className="flex items-start gap-4">

        {/* Avatar — click to edit inline */}
        <div className="flex-shrink-0 relative">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <button onClick={() => { setEditingAvatar(v => !v); setEditingName(false); }}
            className="relative group">
            <div className="w-[56px] h-[56px] rounded-2xl overflow-hidden transition-transform group-hover:scale-105"
              style={{ boxShadow: `0 0 0 3px ${currentTheme.accent}40` }}>
              {(avatarPreview || config.avatarUrl) ? (
                <img src={avatarPreview || config.avatarUrl} alt={config.displayName} className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold"
                  style={{ background: `linear-gradient(135deg, ${currentTheme.accent}, ${currentTheme.accent2})` }}>
                  {initials}
                </div>
              )}
            </div>
            <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploading
                ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Pencil size={13} className="text-white" />
              }
            </div>
          </button>

          {/* Avatar inline editor popover */}
          {editingAvatar && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setEditingAvatar(false)} />
              <div className="absolute left-0 z-20 mt-2 w-[280px] rounded-xl bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border))] shadow-xl p-3 animate-in slide-in-from-top-2 duration-150">
                <p className="text-[12px] font-semibold text-[hsl(var(--dash-text))] mb-3">Foto de perfil</p>

                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-lg bg-[hsl(var(--dash-surface-2))] mb-3">
                  {(["upload", "url"] as const).map(tab => (
                    <button key={tab} onClick={() => setAvatarTab(tab)}
                      className={`flex-1 text-[11px] font-medium py-1.5 rounded-md transition-all ${
                        avatarTab === tab
                          ? "bg-[hsl(var(--dash-surface))] text-[hsl(var(--dash-text))] shadow-sm"
                          : "text-[hsl(var(--dash-text-subtle))] hover:text-[hsl(var(--dash-text))]"
                      }`}>
                      {tab === "upload" ? "📷 Arquivo" : "🔗 URL"}
                    </button>
                  ))}
                </div>

                {avatarTab === "upload" ? (
                  <div>
                    {/* Upload area */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full rounded-xl border-2 border-dashed border-[hsl(var(--dash-border))] hover:border-primary/40 bg-[hsl(var(--dash-surface-2))] hover:bg-primary/5 transition-all p-5 flex flex-col items-center gap-2 cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Image size={18} className="text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-[12px] font-semibold text-[hsl(var(--dash-text))]">
                          Escolher foto
                        </p>
                        <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mt-0.5">
                          Câmera ou galeria · JPG, PNG, WEBP
                        </p>
                      </div>
                    </button>
                    <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] text-center mt-2">
                      Comprimida automaticamente para carregar rápido
                    </p>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={avatarUrlInputRef}
                      type="url"
                      className="w-full rounded-lg border border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text))] text-[12px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/25 mb-2"
                      placeholder="https://..."
                      value={avatarVal}
                      onChange={e => setAvatarVal(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") saveAvatarUrl(); if (e.key === "Escape") setEditingAvatar(false); }}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button onClick={saveAvatarUrl} className="flex-1 btn-primary-gradient text-[11px] py-1.5 rounded-lg font-semibold">
                        <Check size={11} className="inline mr-1" />Salvar
                      </button>
                      <button onClick={() => setEditingAvatar(false)} className="flex-1 text-[11px] py-1.5 rounded-lg border border-[hsl(var(--dash-border))] text-[hsl(var(--dash-text-muted))] hover:bg-[hsl(var(--dash-surface-2))] transition-all">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name — click to edit inline */}
          <div className="flex items-center gap-1.5 mb-0.5">
            {editingName ? (
              <input
                ref={nameInputRef}
                type="text"
                className="flex-1 bg-transparent border-b-2 border-primary text-[hsl(var(--dash-text))] font-bold text-[17px] leading-tight focus:outline-none py-0.5 min-w-0"
                value={nameVal}
                onChange={e => setNameVal(e.target.value)}
                onBlur={saveName}
                onKeyDown={e => { if (e.key === "Enter") saveName(); if (e.key === "Escape") { setNameVal(config.displayName); setEditingName(false); } }}
              />
            ) : (
              <button
                onClick={() => { setEditingName(true); setEditingAvatar(false); }}
                className="text-[hsl(var(--dash-text))] font-bold text-[17px] hover:text-primary transition-colors truncate text-left leading-tight group/name flex items-center gap-1.5">
                {config.displayName || "Seu nome"}
                <Pencil size={11} className="text-[hsl(var(--dash-text-subtle))] opacity-0 group-hover/name:opacity-100 transition-opacity flex-shrink-0" />
              </button>
            )}
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

          {/* Interactive health bar */}
          <button
            onClick={() => setShowHealthDetail(!showHealthDetail)}
            className="w-full group/health"
          >
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--dash-surface-2))] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${health}%`, background: `linear-gradient(90deg, ${currentTheme.accent}, ${currentTheme.accent2})` }} />
              </div>
              <span className={`text-[10px] font-bold flex-shrink-0 w-8 ${healthColor}`}>{health}%</span>
              <ChevronDown size={10} className={`text-[hsl(var(--dash-text-subtle))] transition-transform ${showHealthDetail ? "rotate-180" : ""}`} />
            </div>
            {health < 100 && (
              <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mt-0.5 text-left group-hover/health:text-primary transition-colors">
                {health < 50 ? "Clique para ver o que falta" : `Faltam ${100 - health} pontos para 100%`}
              </p>
            )}
          </button>
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
                <ExternalLink size={12} /> Ver
              </a>
            </div>
            <p className="text-[hsl(var(--dash-text-subtle))] text-[10px] font-mono">{profileUrl}</p>
          </div>
        )}
      </div>

      {/* Health detail checklist */}
      {showHealthDetail && (
        <div className="mt-4 pt-4 border-t border-[hsl(var(--dash-border-subtle))] space-y-1.5 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[hsl(var(--dash-text))] text-xs font-semibold flex items-center gap-1.5">
              <TrendingUp size={13} className="text-primary" /> Score da Vitrine
            </p>
            <span className={`text-xs font-bold ${healthColor}`}>{health}/100</span>
          </div>
          {HEALTH_ITEMS.map(item => {
            const done = item.check(config);

            const handleClick = () => {
              if (done) return;
              if (item.key === "avatar") {
                setEditingName(false);
                setEditingAvatar(true);
              } else if (item.key === "name-bio") {
                setEditingAvatar(false);
                setEditingName(true);
                setShowHealthDetail(false);
              } else {
                onHealthAction(item.key as HealthAction);
                setShowHealthDetail(false);
              }
            };

            if (done) {
              return (
                <div key={item.key}
                  className="flex items-center gap-2.5 rounded-xl p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                  <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                  <p className="flex-1 text-[12px] font-medium text-emerald-700 dark:text-emerald-400 line-through">{item.label}</p>
                  <span className="text-[10px] font-bold text-emerald-500">+{item.points}pts</span>
                </div>
              );
            }

            return (
              <button key={item.key} onClick={handleClick}
                className="w-full flex items-center gap-2.5 rounded-xl p-2.5 bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 hover:bg-primary/5 transition-all group/item text-left">
                <Circle size={15} className="text-[hsl(var(--dash-text-subtle))] group-hover/item:text-primary/50 flex-shrink-0 transition-colors" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[hsl(var(--dash-text))]">{item.label}</p>
                  <p className="text-[10px] text-[hsl(var(--dash-text-subtle))]">{item.tip}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10px] font-bold text-[hsl(var(--dash-text-subtle))]">+{item.points}pts</span>
                  <span className="text-[10px] font-semibold text-primary opacity-0 group-hover/item:opacity-100 transition-opacity whitespace-nowrap">
                    Fazer →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
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

  // Drag & drop
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Onboarding
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // AI
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  // Health action highlight
  const [highlightField, setHighlightField] = useState<HealthAction | null>(null);
  const whatsappInputRef = useRef<HTMLInputElement>(null);
  const themeGridRef = useRef<HTMLDivElement>(null);

  // Product form extras
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState("");
  const [activeEmojiCat, setActiveEmojiCat] = useState(0);
  const productImageInputRef = useRef<HTMLInputElement>(null);
  const productVideoInputRef = useRef<HTMLInputElement>(null);
  const productGifInputRef = useRef<HTMLInputElement>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      const stored = localStorage.getItem(LS_KEY);
      const base: VitrineConfig = stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : { ...DEFAULT_CONFIG };
      // Migrate: imageUrl → images array
      let migrated = false;
      base.products = base.products.map(p => {
        if (!p.images) p.images = [];
        if ((p as ProductItem).imageUrl && p.images.length === 0) {
          p.images = [(p as ProductItem).imageUrl!];
          delete (p as ProductItem).imageUrl;
          migrated = true;
        }
        return p;
      });
      if (migrated) localStorage.setItem(LS_KEY, JSON.stringify(base));
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
      // Show onboarding for first-time users
      if (!base.onboardingDone && (base.blocks || []).length === 0 && !base.products.length && !base.links.length) {
        setShowOnboarding(true);
      }
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

  // ── Drag & Drop ──────────────────────────────────────────────────────────

  const handleDragStart = (blockId: string) => {
    setDragId(blockId);
  };

  const handleDragOver = (e: React.DragEvent, blockId: string) => {
    e.preventDefault();
    if (blockId !== dragId) setDragOverId(blockId);
  };

  const handleDrop = (targetBlockId: string) => {
    if (!dragId || dragId === targetBlockId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }
    const blocks = [...(config.blocks || [])];
    const fromIdx = blocks.findIndex(b => b.id === dragId);
    const toIdx = blocks.findIndex(b => b.id === targetBlockId);
    if (fromIdx < 0 || toIdx < 0) return;
    const [moved] = blocks.splice(fromIdx, 1);
    blocks.splice(toIdx, 0, moved);
    updateConfig("blocks", blocks);
    setDragId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDragId(null);
    setDragOverId(null);
  };

  // ── Form open/close helpers ───────────────────────────────────────────────

  // ── Product image upload (multiple) ──────────────────────────────────────

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new window.Image();
        img.onload = () => {
          const MAX = 500;
          const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * ratio);
          canvas.height = Math.round(img.height * ratio);
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
          setProductForm(f => f ? { ...f, images: [...(f.images || []), dataUrl] } : f);
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeProductImage = (index: number) => {
    setProductForm(f => f ? { ...f, images: (f.images || []).filter((_, i) => i !== index) } : f);
  };

  // ── Product video upload ────────────────────────────────────────────────

  const handleProductVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoError(null);

    // Check size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setVideoError("Vídeo muito grande (máx 10MB). Tente um vídeo mais curto ou de menor qualidade.");
      e.target.value = "";
      return;
    }

    // Check duration
    const url = URL.createObjectURL(file);
    const videoEl = document.createElement("video");
    videoEl.preload = "metadata";
    videoEl.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      if (videoEl.duration > 20) {
        setVideoError(`Vídeo tem ${Math.round(videoEl.duration)}s (máx 20s). Grave um vídeo mais curto.`);
        e.target.value = "";
        return;
      }
      // Read as base64
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProductForm(f => f ? { ...f, video: ev.target?.result as string } : f);
        setVideoError(null);
      };
      reader.readAsDataURL(file);
    };
    videoEl.onerror = () => {
      URL.revokeObjectURL(url);
      setVideoError("Formato de vídeo não suportado.");
    };
    videoEl.src = url;
    e.target.value = "";
  };

  // ── GIF upload (no compression — preserves animation) ─────────────────────

  const handleProductGifUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setVideoError("GIF muito grande (máx 5MB). Tente um GIF menor.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setProductForm(f => f ? { ...f, images: [...(f.images || []), dataUrl] } : f);
      setVideoError(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const closeAllForms = () => {
    setActiveForm(null);
    setProductForm(null);
    setEditingProductId(null);
    setLinkForm(null);
    setEditingLinkId(null);
    setShowEmojiPicker(false);
    setEmojiSearch("");
    setVideoError(null);
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

  const openAddBooking = () => {
    closeAllForms();
    setActiveForm("product");
    setProductForm({ ...emptyProduct(), linkType: "booking" });
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

  // ── Onboarding ───────────────────────────────────────────────────────────

  const completeOnboarding = () => {
    setShowOnboarding(false);
    setConfigAndSave(prev => ({ ...prev, onboardingDone: true }));
  };

  const handleOnboardingAction = (step: typeof ONBOARDING_STEPS[0]) => {
    setActiveTab(step.tab);
    if (step.action === "product") openAddProduct();
    else if (step.action === "link") openAddLink();
    else if (step.action === "testimonial") openAddTestimonial();
    completeOnboarding();
  };

  const leftPanelRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    setTimeout(() => {
      leftPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  // Auto-clear highlight after 3.5s
  useEffect(() => {
    if (!highlightField) return;
    const t = setTimeout(() => setHighlightField(null), 3500);
    return () => clearTimeout(t);
  }, [highlightField]);

  const handleHealthAction = (action: HealthAction) => {
    setHighlightField(action);
    switch (action) {
      case "theme":
        setActiveTab("design");
        setTimeout(() => {
          themeGridRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 120);
        break;
      case "products":
        setActiveTab("vitrine");
        openAddProduct();
        scrollToForm();
        break;
      case "links":
        setActiveTab("vitrine");
        openAddLink();
        scrollToForm();
        break;
      case "testimonials":
        setActiveTab("vitrine");
        openAddTestimonial();
        scrollToForm();
        break;
      case "whatsapp":
        setActiveTab("perfil");
        setTimeout(() => {
          whatsappInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          whatsappInputRef.current?.focus();
        }, 120);
        break;
    }
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
  const health = calcHealth(config);

  const tabCounts: Partial<Record<TabId, number>> = {
    vitrine: blocks.length,
  };

  const inputCls = "w-full rounded-xl border border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text))] text-sm px-3.5 py-2.5 placeholder:text-[hsl(var(--dash-text-subtle))] focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all";
  const labelCls = "block text-[hsl(var(--dash-text-secondary))] text-xs font-medium mb-1.5";

  // ── Block type label ─────────────────────────────────────────────────────

  const BLOCK_TYPE_LABELS: Record<string, string> = {
    product: "Produto",
    link: "Link",
    testimonial: "Depoimento",
    header: "Separador",
  };

  // ── Block info helper ─────────────────────────────────────────────────────

  const getBlockDisplay = (block: VitrineBlock) => {
    if (block.type === "product") {
      const p = config.products.find(pr => pr.id === block.refId);
      if (!p) return null;
      const productIcon = (p.images?.length > 0)
        ? <div className="w-6 h-6 rounded-md overflow-hidden"><img src={p.images[0]} alt="" className="w-full h-full object-cover" /></div>
        : <span className="text-base">{p.emoji}</span>;
      const typeLabel = p.linkType === "booking" ? "Agendamento" : "Produto";
      return { icon: productIcon, title: p.title || "Sem título", subtitle: p.price, active: p.active, hasToggle: true, typeLabel };
    }
    if (block.type === "link") {
      const l = config.links.find(lk => lk.id === block.refId);
      if (!l) return null;
      const badge = l.type === "spotlight" ? "DESTAQUE" : l.type === "header" ? "SEPARADOR" : null;
      return { icon: <span className="text-primary">{LINK_ICON_MAP[l.icon]}</span>, title: l.title || l.url || "Sem título", subtitle: l.url?.replace(/^https?:\/\//, ""), active: l.active, hasToggle: true, badge, typeLabel: "Link" };
    }
    if (block.type === "testimonial") {
      const t = config.testimonials.find(te => te.id === block.refId);
      if (!t) return null;
      return { icon: <Star size={14} className="text-amber-400" />, title: t.name, subtitle: `"${t.text.slice(0, 40)}${t.text.length > 40 ? "..." : ""}"`, active: true, hasToggle: false, typeLabel: "Depoimento" };
    }
    if (block.type === "header") {
      return { icon: <Type size={14} className="text-[hsl(var(--dash-text-subtle))]" />, title: block.title || "Separador", subtitle: null, active: true, hasToggle: false, typeLabel: "Separador" };
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
                  <div key={block.id} className="flex items-center gap-2.5 rounded-xl border p-2.5 mb-2 transition-all hover:scale-[1.01]"
                    style={{ borderColor: currentTheme.accent + "30", background: currentTheme.accent + "0a" }}>
                    {(p.images?.length > 0) ? (
                      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <span className="text-base flex-shrink-0">{p.emoji}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate text-white">{p.title}</p>
                      <div className="flex items-center gap-2">
                        {p.originalPrice && (
                          <span className="text-[9px] line-through" style={{ color: "rgba(200,200,200,0.4)" }}>{p.originalPrice}</span>
                        )}
                        {p.price && <p className="text-[10px] font-bold" style={{ color: currentTheme.accent }}>{p.price}</p>}
                      </div>
                    </div>
                    {p.badge && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: currentTheme.accent + "25", color: currentTheme.accent }}>
                        {p.badge}
                      </span>
                    )}
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
                  <div key={block.id} className="rounded-xl p-2.5 mb-2 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                    style={{ background: `linear-gradient(135deg,${currentTheme.accent}25,${currentTheme.accent2}18)`, border: `1px solid ${currentTheme.accent}40` }}>
                    <span style={{ color: currentTheme.accent }}>{LINK_ICON_MAP[l.icon]}</span>
                    <span className="text-xs font-bold" style={{ color: currentTheme.accent }}>{l.title || l.url}</span>
                  </div>
                );
                return (
                  <div key={block.id} className="flex items-center gap-2 rounded-xl border p-2.5 mb-2 transition-all hover:scale-[1.01]"
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
                    <div className="flex items-center gap-2 mb-1.5">
                      {t.avatar ? (
                        <img src={t.avatar} alt={t.name} className="w-5 h-5 rounded-full object-cover" />
                      ) : (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                          style={{ background: `linear-gradient(135deg,${currentTheme.accent},${currentTheme.accent2})` }}>
                          {t.name[0]?.toUpperCase()}
                        </div>
                      )}
                      <p className="text-[9px] font-semibold" style={{ color: currentTheme.accent }}>
                        {t.name} {t.role && <span style={{ color: "rgba(200,200,200,0.5)" }}>· {t.role}</span>}
                      </p>
                    </div>
                    <div className="text-[10px] mb-1">{"⭐".repeat(t.stars)}</div>
                    <p className="text-[9px] line-clamp-2 italic" style={{ color: "rgba(187,187,187,0.9)" }}>"{t.text}"</p>
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
              <p className="text-[8px]" style={{ color: "#444" }}>Criado com maview.app</p>
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

      {/* ═══════════════ ONBOARDING WIZARD ═══════════════ */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={completeOnboarding} />
          <div className="relative glass-card rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <button onClick={completeOnboarding}
              className="absolute top-4 right-4 p-2 rounded-full text-[hsl(var(--dash-text-subtle))] hover:text-[hsl(var(--dash-text))] hover:bg-[hsl(var(--dash-surface-2))] transition-all">
              <X size={18} />
            </button>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {ONBOARDING_STEPS.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === onboardingStep ? "w-8 bg-primary" : i < onboardingStep ? "w-4 bg-primary/50" : "w-4 bg-[hsl(var(--dash-border))]"
                }`} />
              ))}
            </div>

            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                {ONBOARDING_STEPS[onboardingStep].icon}
              </div>
              <h2 className="text-[hsl(var(--dash-text))] text-xl font-bold mb-2">
                {onboardingStep === 0 ? "Bem-vindo ao Maview!" : ONBOARDING_STEPS[onboardingStep].title}
              </h2>
              <p className="text-[hsl(var(--dash-text-muted))] text-sm">
                {onboardingStep === 0
                  ? "Vamos montar sua vitrine em 4 passos simples"
                  : ONBOARDING_STEPS[onboardingStep].description
                }
              </p>
            </div>

            {/* Steps overview */}
            {onboardingStep === 0 && (
              <div className="space-y-2 mb-6">
                {ONBOARDING_STEPS.map((step, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl p-3 bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))]">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {step.icon}
                    </div>
                    <div>
                      <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium">{step.title}</p>
                      <p className="text-[hsl(var(--dash-text-subtle))] text-[11px]">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              {onboardingStep > 0 && (
                <button onClick={() => setOnboardingStep(s => s - 1)}
                  className="flex-1 text-sm py-3 rounded-xl border border-[hsl(var(--dash-border))] text-[hsl(var(--dash-text-muted))] hover:bg-[hsl(var(--dash-surface-2))] transition-all font-medium">
                  Voltar
                </button>
              )}
              {onboardingStep < ONBOARDING_STEPS.length - 1 ? (
                <button onClick={() => setOnboardingStep(s => s + 1)}
                  className="flex-1 btn-primary-gradient text-sm py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                  {onboardingStep === 0 ? "Começar" : "Próximo"} <ArrowRight size={14} />
                </button>
              ) : (
                <button onClick={() => handleOnboardingAction(ONBOARDING_STEPS[onboardingStep])}
                  className="flex-1 btn-primary-gradient text-sm py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                  Vamos lá! <Zap size={14} />
                </button>
              )}
            </div>

            <button onClick={completeOnboarding}
              className="w-full text-center text-[hsl(var(--dash-text-subtle))] text-[11px] mt-4 hover:text-primary transition-colors">
              Pular e montar sozinho
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-5 space-y-1">
        <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">Minha Vitrine</h1>
        <p className="text-[hsl(var(--dash-text-muted))] text-[14px] flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${subtitleComplete ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-pulse"}`} />
          {subtitleText}
        </p>
      </div>

      {/* Profile Hero Card */}
      <ProfileHeroCard config={config} onUpdate={updateConfig} onEditProfile={() => setActiveTab("perfil")} onHealthAction={handleHealthAction} />

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">

        {/* ── LEFT PANEL ── */}
        <div className="min-w-0" ref={leftPanelRef}>

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
                    className="w-full btn-primary-gradient text-sm font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                  >
                    <Plus size={18} /> Adicionar à Vitrine
                  </button>

                  {showAddMenu && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowAddMenu(false)} />
                      <div className="absolute top-full left-0 right-0 mt-2 z-40 glass-card rounded-xl shadow-xl border border-[hsl(var(--dash-border-subtle))] p-1.5 animate-in slide-in-from-top-2 duration-200">
                        {[
                          { type: "product" as const, icon: <Package size={16} className="text-violet-500" />, label: "Produto", desc: "Venda produtos ou serviços" },
                          { type: "booking" as const, icon: <Calendar size={16} className="text-emerald-500" />, label: "Agendamento", desc: "Receba marcações online" },
                          { type: "link" as const, icon: <Link2 size={16} className="text-blue-500" />, label: "Link", desc: "Direcione para qualquer URL" },
                          { type: "testimonial" as const, icon: <Star size={16} className="text-amber-500" />, label: "Depoimento", desc: "Prova social" },
                          { type: "header" as const, icon: <Type size={16} className="text-slate-400" />, label: "Separador", desc: "Organize seções" },
                        ].map(opt => (
                          <button key={opt.type}
                            onClick={() => {
                              setShowAddMenu(false);
                              if (opt.type === "product") openAddProduct();
                              else if (opt.type === "booking") openAddBooking();
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
                  <div className={`rounded-2xl border bg-[hsl(var(--dash-accent))]/30 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200 transition-all ${
                    highlightField === "products"
                      ? "border-primary/70 shadow-[0_0_22px_rgba(139,92,246,0.4)]"
                      : "border-primary/20"
                  }`}>
                    <h3 className="text-[hsl(var(--dash-text))] text-sm font-semibold flex items-center gap-2">
                      {editingProductId
                        ? (productForm.linkType === "booking" ? "Editar Agendamento" : "Editar Produto")
                        : (productForm.linkType === "booking" ? "Novo Agendamento" : "Novo Produto")
                      }
                      {highlightField === "products" && !editingProductId && (
                        <span className="text-[10px] font-bold text-primary animate-bounce">← preencha e salve</span>
                      )}
                      {productForm.linkType === "booking" && !editingProductId && (
                        <span className="text-[9px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Agenda online</span>
                      )}
                    </h3>

                    {/* Marketing tip */}
                    {!editingProductId && (
                      <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/15">
                        <TrendingUp size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-[10px] text-[hsl(var(--dash-text-muted))] leading-relaxed">
                          <span className="font-semibold text-amber-600">Dica de conversão:</span>{" "}
                          {productForm.linkType === "booking"
                            ? "Agendamentos com foto do espaço ou profissional convertem 2x mais. Adicione mídia!"
                            : "Produtos com foto vendem 73% mais. Adicione uma imagem e um preço com desconto para criar urgência."
                          }
                        </p>
                      </div>
                    )}

                    {/* ═══ MEDIA: photos + video + gif ═══ */}
                    <input ref={productImageInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleProductImageUpload} />
                    <input ref={productVideoInputRef} type="file" accept="video/*" className="hidden" onChange={handleProductVideoUpload} />
                    <input ref={productGifInputRef} type="file" accept="image/gif" className="hidden" onChange={handleProductGifUpload} />

                    <div className="rounded-xl border border-[hsl(var(--dash-border-subtle))] bg-[hsl(var(--dash-surface-2))]/50 p-3.5">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-[hsl(var(--dash-text-secondary))] text-xs font-semibold flex items-center gap-1.5">
                          <Image size={12} className="text-primary" /> Mídia
                        </label>
                        {(productForm.images?.length > 0 || productForm.video) && (
                          <span className="text-[9px] text-[hsl(var(--dash-text-subtle))] font-medium">
                            {(productForm.images?.length || 0)} foto{(productForm.images?.length || 0) !== 1 ? "s" : ""}{productForm.video ? " · 1 vídeo" : ""}
                          </span>
                        )}
                      </div>

                      {/* Unified media gallery */}
                      {(productForm.images?.length > 0 || productForm.video) && (
                        <div className="flex gap-2 flex-wrap mb-3">
                          {(productForm.images || []).map((img, i) => {
                            const isGif = img.startsWith("data:image/gif");
                            return (
                              <div key={i} className="relative w-[76px] h-[76px] rounded-xl overflow-hidden border border-[hsl(var(--dash-border-subtle))] group/img shadow-sm hover:shadow-md transition-shadow">
                                <img src={img} alt="" className="w-full h-full object-cover" />
                                <button onClick={() => removeProductImage(i)}
                                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-red-500">
                                  <X size={9} />
                                </button>
                                {i === 0 && !isGif && (
                                  <span className="absolute bottom-1 left-1 text-[7px] font-bold px-1.5 py-0.5 rounded-md bg-primary/80 text-white uppercase tracking-wider">Capa</span>
                                )}
                                {isGif && (
                                  <span className="absolute bottom-1 left-1 text-[7px] font-bold px-1.5 py-0.5 rounded-md bg-fuchsia-500/80 text-white uppercase tracking-wider">GIF</span>
                                )}
                              </div>
                            );
                          })}
                          {productForm.video && (
                            <div className="relative w-[76px] h-[76px] rounded-xl overflow-hidden border border-[hsl(var(--dash-border-subtle))] group/vid shadow-sm">
                              <video src={productForm.video} className="w-full h-full object-cover" muted />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                  <Play size={12} className="text-white ml-0.5" />
                                </div>
                              </div>
                              <button onClick={() => setProductForm(f => f ? { ...f, video: undefined } : f)}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover/vid:opacity-100 transition-opacity hover:bg-red-500">
                                <X size={9} />
                              </button>
                              <span className="absolute bottom-1 left-1 text-[7px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/80 text-white uppercase tracking-wider">Vídeo</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Add media buttons — always visible */}
                      <div className={`grid ${(!productForm.images || productForm.images.length === 0) && !productForm.video ? "grid-cols-3" : "grid-cols-3"} gap-2`}>
                        <button onClick={() => productImageInputRef.current?.click()}
                          className="rounded-xl border border-dashed border-[hsl(var(--dash-border))] hover:border-primary/50 bg-[hsl(var(--dash-surface))] hover:bg-primary/5 transition-all py-3 flex flex-col items-center gap-1.5 cursor-pointer group/btn">
                          <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center group-hover/btn:bg-primary/15 transition-colors">
                            <Image size={15} className="text-primary" />
                          </div>
                          <p className="text-[10px] font-semibold text-[hsl(var(--dash-text))]">Fotos</p>
                          <p className="text-[8px] text-[hsl(var(--dash-text-subtle))] leading-tight">JPG, PNG, WebP</p>
                        </button>
                        <button onClick={() => productVideoInputRef.current?.click()}
                          className={`rounded-xl border border-dashed border-[hsl(var(--dash-border))] hover:border-blue-400/50 bg-[hsl(var(--dash-surface))] hover:bg-blue-500/5 transition-all py-3 flex flex-col items-center gap-1.5 cursor-pointer group/btn ${productForm.video ? "opacity-40 pointer-events-none" : ""}`}>
                          <div className="w-8 h-8 rounded-lg bg-blue-500/8 flex items-center justify-center group-hover/btn:bg-blue-500/15 transition-colors">
                            <Video size={15} className="text-blue-500" />
                          </div>
                          <p className="text-[10px] font-semibold text-[hsl(var(--dash-text))]">Vídeo</p>
                          <p className="text-[8px] text-[hsl(var(--dash-text-subtle))] leading-tight">Até 20s · 10MB</p>
                        </button>
                        <button onClick={() => productGifInputRef.current?.click()}
                          className="rounded-xl border border-dashed border-[hsl(var(--dash-border))] hover:border-fuchsia-400/50 bg-[hsl(var(--dash-surface))] hover:bg-fuchsia-500/5 transition-all py-3 flex flex-col items-center gap-1.5 cursor-pointer group/btn">
                          <div className="w-8 h-8 rounded-lg bg-fuchsia-500/8 flex items-center justify-center group-hover/btn:bg-fuchsia-500/15 transition-colors">
                            <Sparkles size={15} className="text-fuchsia-500" />
                          </div>
                          <p className="text-[10px] font-semibold text-[hsl(var(--dash-text))]">GIF</p>
                          <p className="text-[8px] text-[hsl(var(--dash-text-subtle))] leading-tight">Animação · 5MB</p>
                        </button>
                      </div>

                      {videoError && (
                        <p className="text-[11px] text-red-400 flex items-center gap-1 mt-2">
                          <AlertCircle size={11} /> {videoError}
                        </p>
                      )}
                    </div>

                    {/* ═══ EMOJI (when no images) ═══ */}
                    {(!productForm.images || productForm.images.length === 0) && (
                      <div>
                        <div className="flex items-center gap-2.5 mb-2">
                          <span className="text-2xl">{productForm.emoji}</span>
                          <button onClick={() => { setShowEmojiPicker(!showEmojiPicker); setEmojiSearch(""); }}
                            className="flex items-center gap-1.5 text-[11px] text-[hsl(var(--dash-text-muted))] hover:text-primary transition-colors font-medium">
                            <Smile size={12} /> Trocar emoji
                          </button>
                          <span className="text-[9px] text-[hsl(var(--dash-text-subtle))]">ou sem foto, aparece o emoji</span>
                        </div>
                        {showEmojiPicker && (
                          <div className="rounded-xl border border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-surface))] shadow-lg p-3 animate-in slide-in-from-top-2 duration-150">
                            {/* Search */}
                            <div className="relative mb-2.5">
                              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[hsl(var(--dash-text-subtle))]" />
                              <input type="text" className={`${inputCls} pl-8 text-[12px]`} placeholder="Buscar ou digitar emoji..."
                                value={emojiSearch} onChange={e => setEmojiSearch(e.target.value)}
                                autoFocus />
                            </div>
                            {/* Category tabs */}
                            <div className="flex gap-0.5 mb-2.5 overflow-x-auto scrollbar-none pb-1">
                              {EMOJI_CATEGORIES.map((cat, i) => (
                                <button key={cat.name} onClick={() => { setActiveEmojiCat(i); setEmojiSearch(""); }}
                                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all ${
                                    activeEmojiCat === i && !emojiSearch ? "bg-primary/15 ring-1 ring-primary/30" : "hover:bg-[hsl(var(--dash-surface-2))]"
                                  }`} title={cat.name}>
                                  {cat.icon}
                                </button>
                              ))}
                            </div>
                            {/* Emoji grid */}
                            <div className="max-h-[200px] overflow-y-auto scrollbar-none">
                              <div className="flex flex-wrap gap-0.5">
                                {(() => {
                                  const emojis = emojiSearch
                                    ? EMOJI_CATEGORIES.flatMap(c => c.emojis).filter(e => e.includes(emojiSearch))
                                    : EMOJI_CATEGORIES[activeEmojiCat].emojis;
                                  if (emojis.length === 0 && emojiSearch) {
                                    return (
                                      <div className="w-full py-4 text-center">
                                        <p className="text-[11px] text-[hsl(var(--dash-text-subtle))]">
                                          Nenhum emoji encontrado. Cole ou digite diretamente:
                                        </p>
                                        <input type="text" className={`${inputCls} w-20 text-center text-xl mx-auto mt-2`}
                                          placeholder="😀" maxLength={4}
                                          onChange={e => { if (e.target.value) { setProductForm(f => f ? { ...f, emoji: e.target.value } : f); setShowEmojiPicker(false); } }} />
                                      </div>
                                    );
                                  }
                                  return emojis.map(em => (
                                    <button key={em} onClick={() => { setProductForm(f => f ? { ...f, emoji: em } : f); setShowEmojiPicker(false); }}
                                      className={`w-8 h-8 rounded-md text-lg flex items-center justify-center transition-all hover:bg-primary/10 hover:scale-110 ${
                                        productForm.emoji === em ? "bg-primary/15 ring-1 ring-primary/30" : ""
                                      }`}>{em}</button>
                                  ));
                                })()}
                              </div>
                            </div>
                            {/* Custom input */}
                            <div className="mt-2 pt-2 border-t border-[hsl(var(--dash-border-subtle))] flex items-center gap-2">
                              <input type="text" className={`${inputCls} w-14 text-center text-lg`} placeholder="🎯" maxLength={4}
                                value={productForm.emoji}
                                onChange={e => setProductForm(f => f ? { ...f, emoji: e.target.value } : f)} />
                              <span className="text-[9px] text-[hsl(var(--dash-text-subtle))] flex-1">
                                Cole qualquer emoji ou use o teclado (Win + . no Windows)
                              </span>
                              <button onClick={() => setShowEmojiPicker(false)}
                                className="text-[10px] text-primary font-medium hover:underline">Fechar</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ═══ TITLE ═══ */}
                    <div>
                      <label className={labelCls}>Título</label>
                      <input type="text" className={inputCls} placeholder="Ex: Curso de Design Digital"
                        value={productForm.title}
                        onChange={e => setProductForm(f => f ? { ...f, title: e.target.value } : f)} />
                    </div>

                    {/* ═══ DESCRIPTION ═══ */}
                    <div>
                      <label className={labelCls}>Descrição <span className="text-[hsl(var(--dash-text-subtle))] font-normal">(opcional)</span></label>
                      <input type="text" className={inputCls} placeholder="Uma frase sobre o que é"
                        value={productForm.description}
                        onChange={e => setProductForm(f => f ? { ...f, description: e.target.value } : f)} />
                    </div>

                    {/* ═══ PRICE (optional) ═══ */}
                    <div>
                      <label className={labelCls}>
                        Preço
                        <span className="text-[hsl(var(--dash-text-subtle))] font-normal"> — deixe vazio se não é pra venda</span>
                      </label>
                      <div className="flex items-center">
                        <span className="flex-shrink-0 rounded-l-xl border border-r-0 border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] text-sm px-3 py-2.5 select-none font-medium">R$</span>
                        <input type="text" className={`${inputCls} rounded-l-none`}
                          placeholder="97,00"
                          value={productForm.price.replace(/^R\$\s?/, "")}
                          onChange={e => {
                            const raw = e.target.value.replace(/[^0-9,.]/g, "");
                            setProductForm(f => f ? { ...f, price: raw ? `R$ ${raw}` : "" } : f);
                          }} />
                      </div>
                    </div>

                    {/* ═══ LINK / ACTION ═══ */}
                    <div>
                      <label className={labelCls}>
                        <Zap size={10} className="inline mr-1 text-amber-500" />
                        Ação do botão
                      </label>
                      <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mb-2 -mt-1">O que acontece quando o cliente clica</p>
                      <div className="grid grid-cols-4 gap-1.5 mb-3">
                        {([
                          { key: "url" as const, icon: <Link2 size={14} />, label: "Link", desc: "Hotmart, site..." },
                          { key: "whatsapp" as const, icon: <MessageCircle size={14} />, label: "WhatsApp", desc: "Conversa direta" },
                          { key: "booking" as const, icon: <Calendar size={14} />, label: "Agendar", desc: "Data e hora" },
                          { key: "none" as const, icon: <Eye size={14} />, label: "Exibir", desc: "Sem ação" },
                        ]).map(opt => (
                          <button key={opt.key} onClick={() => setProductForm(f => f ? { ...f, linkType: opt.key } : f)}
                            className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-center transition-all ${
                              (productForm.linkType || "url") === opt.key
                                ? "border-primary/50 bg-primary/8 text-primary shadow-sm"
                                : "border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text-muted))] hover:border-primary/25 hover:bg-[hsl(var(--dash-surface-2))]"
                            }`}>
                            {opt.icon}
                            <span className="text-[11px] font-semibold">{opt.label}</span>
                            <span className="text-[8px] opacity-60 leading-tight">{opt.desc}</span>
                          </button>
                        ))}
                      </div>

                      {(productForm.linkType || "url") === "url" && (
                        <div className="space-y-2">
                          <div className="relative">
                            <input type="url" className={inputCls} placeholder="https://hotmart.com/produto..."
                              value={productForm.url}
                              onChange={e => setProductForm(f => f ? { ...f, url: e.target.value } : f)} />
                            {productForm.url && (
                              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold ${isValidUrl(productForm.url) ? "text-emerald-500" : "text-red-400"}`}>
                                {isValidUrl(productForm.url) ? "✓" : "URL inválida"}
                              </span>
                            )}
                          </div>
                          <input type="text" className={inputCls} placeholder="Texto do botão (ex: Comprar, Ver mais, Acessar)"
                            value={productForm.ctaText || ""}
                            onChange={e => setProductForm(f => f ? { ...f, ctaText: e.target.value } : f)} />
                        </div>
                      )}

                      {productForm.linkType === "whatsapp" && (
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <span className="flex-shrink-0 rounded-l-xl border border-r-0 border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] text-sm px-3 py-2.5 select-none">+55</span>
                            <input type="tel" className={`${inputCls} rounded-l-none`} placeholder="11999999999"
                              value={productForm.url}
                              onChange={e => setProductForm(f => f ? { ...f, url: e.target.value.replace(/\D/g, "") } : f)} />
                          </div>
                          <input type="text" className={inputCls} placeholder="Mensagem pronta: Olá! Tenho interesse no..."
                            value={productForm.whatsappMsg || ""}
                            onChange={e => setProductForm(f => f ? { ...f, whatsappMsg: e.target.value } : f)} />
                          {productForm.url && (
                            <p className="text-[10px] text-emerald-500 flex items-center gap-1">
                              <MessageCircle size={9} /> wa.me/55{productForm.url}
                            </p>
                          )}
                        </div>
                      )}

                      {productForm.linkType === "booking" && (
                        <div className="space-y-3 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] p-3.5 animate-in slide-in-from-top-1 duration-150">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar size={13} className="text-primary" />
                            <span className="text-[12px] font-semibold text-[hsl(var(--dash-text))]">Configurar agendamento</span>
                          </div>
                          <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] -mt-1">
                            Seus clientes escolhem data e horário direto na sua vitrine.
                          </p>

                          {/* Duration */}
                          <div>
                            <label className={labelCls}>Duração do atendimento</label>
                            <div className="flex gap-1.5 flex-wrap">
                              {BOOKING_DURATIONS.map(d => (
                                <button key={d.min}
                                  onClick={() => setProductForm(f => f ? { ...f, bookingDuration: d.min } : f)}
                                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                                    (productForm.bookingDuration || 60) === d.min
                                      ? "border-primary/50 bg-primary/10 text-primary"
                                      : "border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text-muted))] hover:border-primary/30"
                                  }`}>
                                  {d.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Available days */}
                          <div>
                            <label className={labelCls}>Dias disponíveis</label>
                            <div className="flex gap-1">
                              {BOOKING_DAYS_ALL.map(day => {
                                const isOn = (productForm.bookingDays || []).includes(day);
                                return (
                                  <button key={day}
                                    onClick={() => setProductForm(f => {
                                      if (!f) return f;
                                      const days = f.bookingDays || [];
                                      return { ...f, bookingDays: isOn ? days.filter(d => d !== day) : [...days, day] };
                                    })}
                                    className={`w-9 h-9 rounded-lg text-[11px] font-bold border transition-all ${
                                      isOn
                                        ? "border-primary/50 bg-primary/10 text-primary"
                                        : "border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text-subtle))] hover:border-primary/30"
                                    }`}>
                                    {BOOKING_DAYS_LABELS[day]}
                                  </button>
                                );
                              })}
                            </div>
                            <p className="text-[9px] text-[hsl(var(--dash-text-subtle))] mt-1">
                              {BOOKING_DAYS_ALL.filter(d => (productForm.bookingDays || []).includes(d)).join(", ") || "Nenhum dia selecionado"}
                            </p>
                          </div>

                          {/* Hours */}
                          <div>
                            <label className={labelCls}>Horário de atendimento</label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mb-1">Das</p>
                                <input type="time" className={`${inputCls} text-xs`}
                                  value={productForm.bookingStart || "09:00"}
                                  onChange={e => setProductForm(f => f ? { ...f, bookingStart: e.target.value } : f)} />
                              </div>
                              <div>
                                <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mb-1">Até</p>
                                <input type="time" className={`${inputCls} text-xs`}
                                  value={productForm.bookingEnd || "18:00"}
                                  onChange={e => setProductForm(f => f ? { ...f, bookingEnd: e.target.value } : f)} />
                              </div>
                            </div>
                          </div>

                          {/* ═══ Integration channel ═══ */}
                          <div>
                            <label className={labelCls}>Onde receber os agendamentos</label>
                            <div className="grid grid-cols-2 gap-1.5">
                              {([
                                { key: "whatsapp" as const, icon: <MessageCircle size={13} />, label: "WhatsApp", color: "text-green-500" },
                                { key: "google" as const, icon: <Calendar size={13} />, label: "Google Calendar", color: "text-blue-500" },
                                { key: "calendly" as const, icon: <ExternalLink size={13} />, label: "Calendly / Cal.com", color: "text-violet-500" },
                                { key: "external" as const, icon: <Link2 size={13} />, label: "Link externo / CRM", color: "text-amber-500" },
                              ]).map(ch => (
                                <button key={ch.key}
                                  onClick={() => setProductForm(f => f ? { ...f, bookingChannel: ch.key } : f)}
                                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[11px] font-medium transition-all text-left ${
                                    (productForm.bookingChannel || "whatsapp") === ch.key
                                      ? "border-primary/50 bg-primary/10 text-[hsl(var(--dash-text))]"
                                      : "border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text-muted))] hover:border-primary/30"
                                  }`}>
                                  <span className={ch.color}>{ch.icon}</span>
                                  {ch.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Channel-specific config */}
                          {(productForm.bookingChannel || "whatsapp") === "whatsapp" && (
                            <div>
                              <label className={labelCls}>Número do WhatsApp</label>
                              <div className="flex items-center">
                                <span className="flex-shrink-0 rounded-l-xl border border-r-0 border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] text-sm px-3 py-2.5 select-none">+55</span>
                                <input type="tel" className={`${inputCls} rounded-l-none`} placeholder="11999999999"
                                  value={productForm.url}
                                  onChange={e => setProductForm(f => f ? { ...f, url: e.target.value.replace(/\D/g, "") } : f)} />
                              </div>
                              {productForm.url && (
                                <p className="text-[10px] text-emerald-500 flex items-center gap-1 mt-1">
                                  <Check size={9} /> Cliente escolhe data/hora e a mensagem chega no seu WhatsApp
                                </p>
                              )}
                            </div>
                          )}

                          {(productForm.bookingChannel || "whatsapp") === "google" && (
                            <div>
                              <label className={labelCls}>Número do WhatsApp <span className="text-[hsl(var(--dash-text-subtle))] font-normal">para confirmação</span></label>
                              <div className="flex items-center">
                                <span className="flex-shrink-0 rounded-l-xl border border-r-0 border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] text-sm px-3 py-2.5 select-none">+55</span>
                                <input type="tel" className={`${inputCls} rounded-l-none`} placeholder="11999999999"
                                  value={productForm.url}
                                  onChange={e => setProductForm(f => f ? { ...f, url: e.target.value.replace(/\D/g, "") } : f)} />
                              </div>
                              <p className="text-[10px] text-blue-400 flex items-center gap-1 mt-1">
                                <Calendar size={9} /> O evento é criado no Google Calendar do cliente + você recebe no WhatsApp
                              </p>
                            </div>
                          )}

                          {(productForm.bookingChannel || "whatsapp") === "calendly" && (
                            <div>
                              <label className={labelCls}>Link do Calendly / Cal.com</label>
                              <input type="url" className={inputCls} placeholder="https://calendly.com/seu-nome/30min"
                                value={productForm.bookingUrl || ""}
                                onChange={e => setProductForm(f => f ? { ...f, bookingUrl: e.target.value } : f)} />
                              <p className="text-[10px] text-violet-400 flex items-center gap-1 mt-1">
                                <ExternalLink size={9} /> O cliente é redirecionado para sua página de agendamento
                              </p>
                            </div>
                          )}

                          {(productForm.bookingChannel || "whatsapp") === "external" && (
                            <div>
                              <label className={labelCls}>URL do seu sistema de agendamento</label>
                              <input type="url" className={inputCls} placeholder="https://seu-crm.com/agendar"
                                value={productForm.bookingUrl || ""}
                                onChange={e => setProductForm(f => f ? { ...f, bookingUrl: e.target.value } : f)} />
                              <p className="text-[10px] text-amber-400 flex items-center gap-1 mt-1">
                                <Link2 size={9} /> Funciona com qualquer CRM: Kommo, RD Station, HubSpot, etc.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {productForm.linkType === "none" && (
                        <p className="text-[10px] text-[hsl(var(--dash-text-subtle))]">
                          O produto será exibido sem botão de ação — ideal para portfólio ou catálogo.
                        </p>
                      )}
                    </div>

                    {/* ═══ MAIS OPÇÕES ═══ */}
                    <button onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-1.5 text-[hsl(var(--dash-text-subtle))] text-[11px] font-medium hover:text-primary transition-colors">
                      <Settings size={11} /> Mais opções
                      {showAdvanced ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </button>
                    {showAdvanced && (
                      <div className="space-y-3 pt-1 border-t border-[hsl(var(--dash-border-subtle))] animate-in slide-in-from-top-1 duration-150">
                        {/* Preço original */}
                        <div>
                          <label className={labelCls}>
                            Preço original
                            <span className="text-[hsl(var(--dash-text-subtle))] font-normal"> — aparece riscado, cria sensação de desconto (ex: "De R$ 197 por R$ 97")</span>
                          </label>
                          <div className="flex items-center">
                            <span className="flex-shrink-0 rounded-l-xl border border-r-0 border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] text-sm px-3 py-2.5 select-none font-medium">R$</span>
                            <input type="text" className={`${inputCls} rounded-l-none`} placeholder="197,00"
                              value={productForm.originalPrice.replace(/^R\$\s?/, "")}
                              onChange={e => {
                                const raw = e.target.value.replace(/[^0-9,.]/g, "");
                                setProductForm(f => f ? { ...f, originalPrice: raw ? `R$ ${raw}` : "" } : f);
                              }} />
                          </div>
                        </div>

                        {/* Badge */}
                        <div>
                          <label className={labelCls}>
                            Badge
                            <span className="text-[hsl(var(--dash-text-subtle))] font-normal"> — etiqueta colorida no produto (ex: OFERTA, Mais vendido, Últimas vagas)</span>
                          </label>
                          <input type="text" className={inputCls} placeholder="OFERTA"
                            value={productForm.badge}
                            onChange={e => setProductForm(f => f ? { ...f, badge: e.target.value } : f)} />
                        </div>

                        {/* Urgência */}
                        <div className="rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] p-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <button onClick={() => setProductForm(f => f ? { ...f, urgency: !f.urgency } : f)}>
                              {productForm.urgency ? <ToggleRight size={24} className="text-primary" /> : <ToggleLeft size={24} className="text-[hsl(var(--dash-text-subtle))]" />}
                            </button>
                            <span className="text-[hsl(var(--dash-text))] text-xs font-semibold flex items-center gap-1">
                              <Clock size={12} className="text-amber-500" /> Urgência
                            </span>
                          </div>
                          <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] pl-8">
                            Exibe um contador regressivo ao vivo no produto — cria senso de escassez e aumenta a conversão. Ideal para promoções por tempo limitado.
                          </p>
                        </div>
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

                    {/* ═══ SAVE / CANCEL ═══ */}
                    <div className="flex gap-2 pt-1">
                      <button onClick={saveProduct} className="flex-1 btn-primary-gradient text-xs py-2.5 rounded-xl transition-transform active:scale-[0.97] font-semibold">
                        <Check size={13} className="inline mr-1" /> Salvar
                      </button>
                      <button onClick={closeAllForms}
                        className="flex-1 text-xs py-2.5 rounded-xl border border-[hsl(var(--dash-border))] text-[hsl(var(--dash-text-muted))] hover:bg-[hsl(var(--dash-surface-2))] transition-all">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Link form */}
                {activeForm === "link" && linkForm && (
                  <div className={`rounded-2xl border bg-[hsl(var(--dash-accent))]/30 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200 transition-all ${
                    highlightField === "links"
                      ? "border-primary/70 shadow-[0_0_22px_rgba(139,92,246,0.4)]"
                      : "border-primary/20"
                  }`}>
                    <h3 className="text-[hsl(var(--dash-text))] text-sm font-semibold flex items-center gap-2">
                      {editingLinkId ? "Editar Link" : "Novo Link"}
                      {highlightField === "links" && !editingLinkId && (
                        <span className="text-[10px] font-bold text-primary animate-bounce">← preencha e salve</span>
                      )}
                    </h3>
                    <div>
                      <label className={labelCls}>Ícone</label>
                      <div className="flex gap-2">
                        {(["instagram", "youtube", "twitter", "globe", "link"] as LinkItem["icon"][]).map(ic => (
                          <button key={ic} onClick={() => setLinkForm(f => f ? { ...f, icon: ic, isSocial: ["instagram", "youtube", "twitter"].includes(ic) } : f)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                              linkForm.icon === ic
                                ? "border-primary/50 bg-[hsl(var(--dash-accent))] text-primary ring-1 ring-primary/20 scale-110"
                                : "border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text-muted))] hover:border-primary/20 hover:scale-105"
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
                      <button onClick={saveLink} className="flex-1 btn-primary-gradient text-xs py-2 rounded-xl transition-transform active:scale-[0.97]">
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
                  <div className={`rounded-2xl border bg-[hsl(var(--dash-accent))]/30 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200 transition-all ${
                    highlightField === "testimonials"
                      ? "border-primary/70 shadow-[0_0_22px_rgba(139,92,246,0.4)]"
                      : "border-primary/20"
                  }`}>
                    <h3 className="text-[hsl(var(--dash-text))] text-sm font-semibold flex items-center gap-2">
                      {editingTestimonialId ? "Editar Depoimento" : "Novo Depoimento"}
                      {highlightField === "testimonials" && !editingTestimonialId && (
                        <span className="text-[10px] font-bold text-primary animate-bounce">← preencha e salve</span>
                      )}
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
                            className={`text-xl transition-all hover:scale-125 ${n <= testimonialForm.stars ? "opacity-100" : "opacity-25"}`}>
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
                      <div className="space-y-3 pt-1 border-t border-[hsl(var(--dash-border-subtle))] animate-in slide-in-from-top-1 duration-150">
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
                      <button onClick={saveTestimonial} className="flex-1 btn-primary-gradient text-xs py-2 rounded-xl transition-transform active:scale-[0.97]">
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
                  <div className="rounded-2xl border border-primary/20 bg-[hsl(var(--dash-accent))]/30 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
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
                      <button onClick={saveHeader} className="flex-1 btn-primary-gradient text-xs py-2 rounded-xl transition-transform active:scale-[0.97]">
                        <Check size={13} className="inline mr-1" /> Salvar
                      </button>
                      <button onClick={closeAllForms}
                        className="flex-1 text-xs py-2 rounded-xl border border-[hsl(var(--dash-border))] text-[hsl(var(--dash-text-muted))] hover:bg-[hsl(var(--dash-surface-2))] transition-all">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Block list with drag & drop ── */}
                {blocks.length === 0 && !activeForm ? (
                  <div className="text-center py-14 space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-violet-50 to-fuchsia-50 flex items-center justify-center">
                      <Layout size={32} className="text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-[hsl(var(--dash-text))] font-bold text-[17px]">Monte sua vitrine</h3>
                      <p className="text-[hsl(var(--dash-text-muted))] text-sm mt-1 max-w-[320px] mx-auto leading-relaxed">
                        Adicione produtos, links e depoimentos para criar sua página de vendas
                      </p>
                    </div>

                    {/* Quick-start cards */}
                    <div className="grid grid-cols-2 gap-2 max-w-[340px] mx-auto">
                      <button onClick={openAddProduct}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 hover:bg-violet-50 hover:border-violet-300 transition-all group">
                        <Package size={20} className="text-violet-400 group-hover:text-violet-600 transition-colors" />
                        <span className="text-[12px] font-medium text-violet-600">Produto</span>
                      </button>
                      <button onClick={openAddLink}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300 transition-all group">
                        <Link2 size={20} className="text-blue-400 group-hover:text-blue-600 transition-colors" />
                        <span className="text-[12px] font-medium text-blue-600">Link</span>
                      </button>
                      <button onClick={openAddTestimonial}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-300 transition-all group">
                        <Star size={20} className="text-amber-400 group-hover:text-amber-600 transition-colors" />
                        <span className="text-[12px] font-medium text-amber-600">Depoimento</span>
                      </button>
                      <button onClick={openAddHeader}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all group">
                        <Type size={20} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                        <span className="text-[12px] font-medium text-slate-600">Separador</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-2">
                      <Zap size={12} className="text-amber-500" />
                      <p className="text-[hsl(var(--dash-text-subtle))] text-xs">
                        Vitrines com 3+ itens convertem <span className="font-bold text-primary">4x mais</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {blocks.map((block, idx) => {
                      const display = getBlockDisplay(block);
                      if (!display) return null;

                      // Delete confirmation state
                      if (confirmDeleteId === block.id) {
                        return (
                          <div key={block.id} className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 transition-all animate-in shake duration-200">
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

                      const isDragging = dragId === block.id;
                      const isDragOver = dragOverId === block.id;

                      return (
                        <div key={block.id}
                          draggable
                          onDragStart={() => handleDragStart(block.id)}
                          onDragOver={e => handleDragOver(e, block.id)}
                          onDrop={() => handleDrop(block.id)}
                          onDragEnd={handleDragEnd}
                          className={`flex items-center gap-2 rounded-xl border p-3 transition-all glass-card-hover cursor-grab active:cursor-grabbing ${
                            !display.active ? "opacity-50" : ""
                          } ${isDragging ? "opacity-40 scale-95" : ""} ${isDragOver ? "border-primary/50 bg-primary/5 scale-[1.01]" : ""}`}>
                          {/* Drag handle */}
                          <div className="flex-shrink-0 text-[hsl(var(--dash-text-subtle))] hover:text-primary transition-colors">
                            <GripVertical size={14} />
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
                            <div className="flex items-center gap-2">
                              {display.subtitle && (
                                <p className="text-[hsl(var(--dash-text-subtle))] text-xs truncate">{display.subtitle}</p>
                              )}
                              <span className="text-[9px] text-[hsl(var(--dash-text-muted))] flex-shrink-0 hidden sm:inline">
                                {display.typeLabel}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            {/* Reorder buttons for non-drag environments */}
                            <div className="flex flex-col gap-0.5 flex-shrink-0 sm:hidden">
                              <button onClick={() => moveBlock(block.id, "up")} disabled={idx === 0}
                                className="p-0.5 rounded text-[hsl(var(--dash-text-subtle))] hover:text-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
                                <ChevronUp size={12} />
                              </button>
                              <button onClick={() => moveBlock(block.id, "down")} disabled={idx === blocks.length - 1}
                                className="p-0.5 rounded text-[hsl(var(--dash-text-subtle))] hover:text-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
                                <ChevronDown size={12} />
                              </button>
                            </div>
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
                              <button onClick={() => toggleBlockItem(block.id)} className="transition-transform hover:scale-110">
                                {display.active
                                  ? <ToggleRight size={22} className="text-primary" />
                                  : <ToggleLeft size={22} className="text-[hsl(var(--dash-text-subtle))]" />}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Block summary */}
                    {blocks.length > 0 && (
                      <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--dash-border-subtle))]">
                        <p className="text-[hsl(var(--dash-text-subtle))] text-[11px]">
                          {blocks.length} {blocks.length === 1 ? "bloco" : "blocos"} na vitrine
                        </p>
                        <p className="text-[hsl(var(--dash-text-subtle))] text-[11px] flex items-center gap-1">
                          <GripVertical size={10} /> Arraste para reordenar
                        </p>
                      </div>
                    )}
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
                    <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mt-1">
                      Dica: Use uma foto quadrada, mínimo 200x200px
                    </p>
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
                  {config.username && (
                    <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mt-1">
                      Sua página: <span className="font-mono text-primary">maview.app/@{config.username}</span>
                    </p>
                  )}
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
                    <div className="mt-2 rounded-xl border border-fuchsia-200 bg-fuchsia-50 p-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
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
                  <label className={labelCls}>
                    WhatsApp <span className="text-[hsl(var(--dash-text-subtle))] font-normal">(opcional)</span>
                    {highlightField === "whatsapp" && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold text-primary animate-bounce">
                        ← adicione aqui
                      </span>
                    )}
                  </label>
                  <div className={`flex items-center rounded-xl transition-all duration-300 ${
                    highlightField === "whatsapp"
                      ? "ring-2 ring-primary shadow-[0_0_18px_rgba(139,92,246,0.45)]"
                      : ""
                  }`}>
                    <span className="flex-shrink-0 rounded-l-xl border border-r-0 border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] text-sm px-3 py-2.5 select-none">+55</span>
                    <input ref={whatsappInputRef} type="tel" className={`${inputCls} rounded-l-none`} placeholder="11999999999"
                      value={config.whatsapp}
                      onChange={e => updateConfig("whatsapp", e.target.value.replace(/\D/g, ""))} />
                  </div>
                  {config.whatsapp ? (
                    <p className="text-[11px] mt-1.5 flex items-center gap-1.5">
                      <MessageCircle size={10} className="text-emerald-500" />
                      <span className="text-[hsl(var(--dash-text-subtle))]">wa.me/55{config.whatsapp}</span>
                    </p>
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

                {/* Theme selector grid */}
                <div>
                  <label className={labelCls}>
                    Tema
                    {highlightField === "theme" && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold text-primary animate-bounce">
                        ← escolha um tema
                      </span>
                    )}
                  </label>
                  <div ref={themeGridRef} className={`grid grid-cols-3 gap-2 rounded-xl transition-all duration-300 ${
                    highlightField === "theme" ? "ring-2 ring-primary p-1 shadow-[0_0_18px_rgba(139,92,246,0.45)]" : ""
                  }`}>
                    {THEMES.map(theme => {
                      const isActive = config.theme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => updateConfig("theme", theme.id)}
                          className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                            isActive ? "border-primary shadow-lg scale-[1.02]" : "border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 hover:scale-[1.01]"
                          }`}
                        >
                          {/* Mini theme preview */}
                          <div className="h-[80px] p-3 flex flex-col items-center justify-center gap-1.5"
                            style={{ background: `linear-gradient(160deg, ${theme.bg} 60%, ${theme.accent}20)` }}>
                            <div className="w-6 h-6 rounded-full" style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})` }} />
                            <div className="w-14 h-1.5 rounded" style={{ background: theme.accent + "30" }} />
                            <div className="w-10 h-1 rounded" style={{ background: theme.accent + "20" }} />
                          </div>
                          <div className={`px-2 py-1.5 text-center ${isActive ? "bg-primary/10" : "bg-[hsl(var(--dash-surface-2))]"}`}>
                            <p className={`text-[10px] font-medium ${isActive ? "text-primary" : "text-[hsl(var(--dash-text-secondary))]"}`}>
                              {theme.label}
                            </p>
                          </div>
                          {isActive && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check size={10} className="text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color swatches */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))]">
                  <div className="flex gap-1.5">
                    {[currentTheme.bg, currentTheme.accent, currentTheme.accent2].map((c, i) => (
                      <div key={i} className="w-6 h-6 rounded-full ring-1 ring-white/10" style={{ background: c }} />
                    ))}
                  </div>
                  <div>
                    <p className="text-[hsl(var(--dash-text))] text-xs font-medium">Tema: {currentTheme.label}</p>
                    <p className="text-[hsl(var(--dash-text-subtle))] text-[10px]">3 cores aplicadas</p>
                  </div>
                </div>

                {/* Advanced design CTA */}
                <button onClick={() => navigate("/dashboard/aparencia")}
                  className="w-full btn-primary-gradient text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98]">
                  <Palette size={16} /> Personalizar Fontes, Layout e Mais
                  <ArrowRight size={14} />
                </button>
                <p className="text-center text-[hsl(var(--dash-text-subtle))] text-[10px]">
                  Cores, fontes, layout, dark mode e mais opções avançadas
                </p>
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
            <div className="flex items-center justify-between mb-3">
              <p className="text-[hsl(var(--dash-text-subtle))] text-xs font-medium uppercase tracking-wider">
                Preview ao vivo
              </p>
              {config.username && (
                <a href={`https://maview.app/@${config.username}`} target="_blank" rel="noopener noreferrer"
                  className="text-[10px] text-primary font-medium flex items-center gap-1 hover:underline">
                  Abrir página <ExternalLink size={9} />
                </a>
              )}
            </div>
            {phonePreview}
            <div className="mt-3 flex items-center justify-center gap-3">
              <span className="text-[hsl(var(--dash-text-subtle))] text-[11px]">Tema: {currentTheme.label}</span>
              {health < 100 && (
                <span className="text-[11px] text-amber-500 flex items-center gap-1">
                  <AlertCircle size={10} /> {100 - health}pts restantes
                </span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Mobile preview button */}
      <button
        onClick={() => setShowMobilePreview(true)}
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 lg:hidden flex items-center gap-2 px-5 py-3 rounded-full btn-primary-gradient shadow-xl text-sm font-semibold transition-transform active:scale-95"
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
