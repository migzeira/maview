import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Palette, Package, Link2, Star, Plus, Trash2, Pencil,
  Check, ToggleLeft, ToggleRight, Instagram, Youtube, Twitter, Globe,
  MessageCircle, Clock, ChevronDown, ChevronUp, Eye, X, Copy, ExternalLink,
  Sparkles, Calendar, Settings, Layout, GripVertical, AlertCircle,
  TrendingUp, Zap, ArrowRight, CheckCircle2, Circle, Image, Type, Video,
  Play, Smile, Search, Camera, MoreHorizontal,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DesignTab from "@/components/DesignTab";

// ── Types ──────────────────────────────────────────────────────────────────

type ThemeId = "dark-purple" | "midnight" | "forest" | "rose" | "amber" | "ocean"
  | "neon-pink" | "sunset" | "lavender" | "emerald" | "crimson" | "arctic"
  | "gold" | "sage" | "coral" | "indigo" | "slate" | "wine"
  | "custom";

type BgType = "solid" | "gradient" | "image" | "video" | "pattern" | "effect";
type GradientDir = "to-b" | "to-t" | "to-r" | "to-l" | "to-br" | "to-bl" | "to-tr" | "to-tl" | "radial";
type ButtonShape = "rounded" | "pill" | "square" | "soft";
type ButtonFill = "solid" | "outline" | "glass" | "ghost";
type ButtonShadow = "none" | "sm" | "md" | "glow";
type ProfileShape = "circle" | "rounded" | "square" | "hexagon";
type FontFamily = string;

interface DesignConfig {
  // Background
  bgType: BgType;
  bgColor: string;
  bgGradient: [string, string];
  bgGradientDir: GradientDir;
  bgImageUrl: string;
  bgVideoUrl: string;
  bgPattern: string;
  bgOverlay: number;       // 0-100 overlay darkness
  bgBlur: number;          // 0-20 px blur
  bgEffect: string;        // 21st.dev effect id

  // Colors
  textColor: string;
  subtextColor: string;
  cardBg: string;
  cardBorder: string;
  accentColor: string;
  accentColor2: string;

  // Fonts
  fontHeading: FontFamily;
  fontBody: FontFamily;

  // Buttons
  buttonShape: ButtonShape;
  buttonFill: ButtonFill;
  buttonShadow: ButtonShadow;
  buttonRadius: number;    // 0-24 px

  // Profile photo
  profileShape: ProfileShape;
  profileBorder: boolean;
  profileBorderColor: string;
  profileSize: number;     // 64-120 px

  // Effects
  hideWatermark: boolean;
}

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
  screenshotUrl?: string; // foto do depoimento real (print)
}

type SeparatorStyle = "line" | "dots" | "gradient" | "stars" | "zigzag" | "diamond" | "wave" | "fade";

interface VitrineBlock {
  id: string;
  type: "product" | "link" | "testimonial" | "header";
  refId?: string;
  title?: string;
  separatorStyle?: SeparatorStyle;
  separatorIcon?: string;
}

interface VitrineConfig {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
  whatsapp: string;
  theme: ThemeId;
  design?: Partial<DesignConfig>;
  products: ProductItem[];
  links: LinkItem[];
  testimonials: TestimonialItem[];
  blocks?: VitrineBlock[];
  onboardingDone?: boolean;
}

// ── Theme definitions ──────────────────────────────────────────────────────

const THEMES: { id: ThemeId; label: string; bg: string; accent: string; accent2: string }[] = [
  // ── Classic dark ──
  { id: "dark-purple", label: "Roxo Escuro",  bg: "#080612", accent: "#a855f7", accent2: "#ec4899" },
  { id: "midnight",    label: "Meia Noite",   bg: "#05080f", accent: "#60a5fa", accent2: "#818cf8" },
  { id: "forest",      label: "Floresta",     bg: "#050f05", accent: "#4ade80", accent2: "#34d399" },
  { id: "rose",        label: "Rosa",         bg: "#100509", accent: "#f43f5e", accent2: "#fb7185" },
  { id: "amber",       label: "Âmbar",        bg: "#0f0a00", accent: "#f59e0b", accent2: "#fcd34d" },
  { id: "ocean",       label: "Oceano",       bg: "#020c14", accent: "#06b6d4", accent2: "#22d3ee" },
  // ── Vibrant ──
  { id: "neon-pink",   label: "Neon Pink",    bg: "#0a0010", accent: "#ff2d95", accent2: "#ff6ec7" },
  { id: "sunset",      label: "Pôr do Sol",   bg: "#0f0805", accent: "#f97316", accent2: "#ef4444" },
  { id: "lavender",    label: "Lavanda",      bg: "#0c0a14", accent: "#c084fc", accent2: "#a78bfa" },
  { id: "emerald",     label: "Esmeralda",    bg: "#021a0f", accent: "#10b981", accent2: "#6ee7b7" },
  { id: "crimson",     label: "Carmesim",     bg: "#120508", accent: "#dc2626", accent2: "#f87171" },
  { id: "arctic",      label: "Ártico",       bg: "#050a10", accent: "#38bdf8", accent2: "#7dd3fc" },
  // ── Premium ──
  { id: "gold",        label: "Ouro",         bg: "#0c0a04", accent: "#eab308", accent2: "#d97706" },
  { id: "sage",        label: "Sálvia",       bg: "#080c08", accent: "#84cc16", accent2: "#a3e635" },
  { id: "coral",       label: "Coral",        bg: "#0f0808", accent: "#fb923c", accent2: "#f472b6" },
  { id: "indigo",      label: "Índigo",       bg: "#06050f", accent: "#6366f1", accent2: "#a78bfa" },
  { id: "slate",       label: "Grafite",      bg: "#0c0e12", accent: "#94a3b8", accent2: "#cbd5e1" },
  { id: "wine",        label: "Vinho",        bg: "#100408", accent: "#be185d", accent2: "#e11d48" },
  // ── Custom (user-defined colors) ──
  { id: "custom",      label: "Personalizado", bg: "#080612", accent: "#a855f7", accent2: "#ec4899" },
];

const DEFAULT_DESIGN: DesignConfig = {
  bgType: "solid", bgColor: "", bgGradient: ["#080612", "#1a0a2e"],
  bgGradientDir: "to-b", bgImageUrl: "", bgVideoUrl: "",
  bgPattern: "", bgOverlay: 40, bgBlur: 0, bgEffect: "",
  textColor: "", subtextColor: "", cardBg: "", cardBorder: "",
  accentColor: "", accentColor2: "",
  fontHeading: "Inter", fontBody: "Inter",
  buttonShape: "rounded", buttonFill: "solid", buttonShadow: "none", buttonRadius: 12,
  profileShape: "circle", profileBorder: true, profileBorderColor: "", profileSize: 88,
  hideWatermark: false,
};

const BG_PATTERNS: { id: string; label: string; svg: string }[] = [
  { id: "dots", label: "Pontos", svg: `<svg width="20" height="20"><circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.06)"/></svg>` },
  { id: "grid", label: "Grade", svg: `<svg width="40" height="40"><path d="M0 0h40v40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/></svg>` },
  { id: "diagonal", label: "Diagonal", svg: `<svg width="16" height="16"><path d="M0 16L16 0" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></svg>` },
  { id: "waves", label: "Ondas", svg: `<svg width="100" height="20"><path d="M0 10 Q25 0 50 10 Q75 20 100 10" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1.5"/></svg>` },
  { id: "cross", label: "Cruz", svg: `<svg width="24" height="24"><path d="M12 0v24M0 12h24" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/></svg>` },
  { id: "hexagon", label: "Hexágono", svg: `<svg width="28" height="49"><path d="M14 0L28 12.25L28 36.75L14 49L0 36.75L0 12.25Z" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/></svg>` },
  { id: "noise", label: "Textura", svg: "" },
];

const GOOGLE_FONTS = [
  // Sans-serif
  { name: "Inter", category: "sans" },
  { name: "Poppins", category: "sans" },
  { name: "Montserrat", category: "sans" },
  { name: "Outfit", category: "sans" },
  { name: "DM Sans", category: "sans" },
  { name: "Space Grotesk", category: "sans" },
  { name: "Nunito", category: "sans" },
  { name: "Rubik", category: "sans" },
  { name: "Manrope", category: "sans" },
  { name: "Plus Jakarta Sans", category: "sans" },
  { name: "Urbanist", category: "sans" },
  { name: "Sora", category: "sans" },
  // Serif
  { name: "Playfair Display", category: "serif" },
  { name: "Lora", category: "serif" },
  { name: "Merriweather", category: "serif" },
  { name: "DM Serif Display", category: "serif" },
  { name: "Cormorant Garamond", category: "serif" },
  // Display
  { name: "Bebas Neue", category: "display" },
  { name: "Righteous", category: "display" },
  { name: "Pacifico", category: "handwriting" },
  { name: "Satisfy", category: "handwriting" },
  { name: "Dancing Script", category: "handwriting" },
  // Mono
  { name: "JetBrains Mono", category: "mono" },
  { name: "Fira Code", category: "mono" },
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
  name: "", role: "", text: "", stars: 5, avatar: "", screenshotUrl: "",
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
    icon: <User size={24} className="text-primary" />,
    tab: "perfil" as TabId,
  },
  {
    title: "Primeiro produto",
    description: "Crie seu primeiro produto e comece a faturar",
    icon: <Package size={24} className="text-primary" />,
    tab: "vitrine" as TabId,
    action: "product",
  },
  {
    title: "Seus links",
    description: "Conecte Instagram, YouTube e outras redes",
    icon: <Link2 size={24} className="text-primary" />,
    tab: "vitrine" as TabId,
    action: "link",
  },
  {
    title: "Prova social",
    description: "Depoimentos aumentam conversão em até 72%",
    icon: <Star size={24} className="text-primary" />,
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
  onCopyToast?: (text?: string) => void;
}

const ProfileHeroCard = ({ config, onUpdate, onEditProfile, onHealthAction, onCopyToast }: ProfileHeroCardProps) => {
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

  const profileUrl = config.username ? `${window.location.origin}/${config.username.replace(/^@/, "")}` : null;
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
    navigator.clipboard.writeText(profileUrl).catch(() => {});
    setCopied(true);
    onCopyToast?.("Link copiado com sucesso!");
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
              <a href={profileUrl} target="_blank" rel="noopener noreferrer"
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
  const [copyToastVisible, setCopyToastVisible] = useState(false);
  const [copyToastText, setCopyToastText] = useState("URL copiada!");
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const copyToastTimerRef = useRef<ReturnType<typeof setTimeout>>();

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

  // Header/separator form
  const [headerTitle, setHeaderTitle] = useState("");
  const [headerSepStyle, setHeaderSepStyle] = useState<SeparatorStyle>("line");
  const [headerSepIcon, setHeaderSepIcon] = useState("");
  const [editingHeaderBlockId, setEditingHeaderBlockId] = useState<string | null>(null);

  // File input refs for testimonial
  const testimonialAvatarRef = useRef<HTMLInputElement>(null);
  const testimonialScreenshotRef = useRef<HTMLInputElement>(null);

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

  // Avatar upload (perfil tab)
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Copy link (perfil tab)
  const [copied, setCopied] = useState(false);
  const profileUrl = config.username ? `${window.location.origin}/${config.username.replace(/^@/, "")}` : null;
  const copyLink = () => {
    if (!profileUrl) return;
    navigator.clipboard.writeText(profileUrl).catch(() => {});
    setCopied(true);
    showCopyToast("Link copiado com sucesso!");
    setTimeout(() => setCopied(false), 2000);
  };

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

  const showCopyToast = useCallback((text = "URL copiada!") => {
    setCopyToastText(text);
    setCopyToastVisible(true);
    clearTimeout(copyToastTimerRef.current);
    copyToastTimerRef.current = setTimeout(() => setCopyToastVisible(false), 2500);
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
    setHeaderSepStyle("line");
    setHeaderSepIcon("");
  };

  const openEditHeader = (block: VitrineBlock) => {
    closeAllForms();
    setActiveForm("header");
    setEditingHeaderBlockId(block.id);
    setHeaderTitle(block.title || "");
    setHeaderSepStyle(block.separatorStyle || "line");
    setHeaderSepIcon(block.separatorIcon || "");
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
    const sepData = { title: headerTitle.trim(), separatorStyle: headerSepStyle, separatorIcon: headerSepIcon || undefined };
    setConfigAndSave(prev => {
      const next = { ...prev };
      if (editingHeaderBlockId) {
        next.blocks = (prev.blocks || []).map(b => b.id === editingHeaderBlockId ? { ...b, ...sepData } : b);
      } else {
        next.blocks = [...(prev.blocks || []), { id: Date.now().toString(), type: "header" as const, ...sepData }];
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

    // Smart local bio generator — professional templates based on user context
    const name = config.displayName?.trim() || "Seu negócio";
    const hasProducts = config.products?.length > 0;
    const productNames = config.products?.slice(0, 3).map(p => p.title).filter(Boolean) || [];
    const hasSocials = config.links?.some(l => l.isSocial && l.url);

    const templates = [
      `🚀 ${name} • Produtos selecionados com qualidade garantida. Confira e surpreenda-se!`,
      `✨ ${name} | Os melhores produtos, entrega rápida para todo Brasil 🇧🇷`,
      `🔥 ${name} — Curadoria premium. Qualidade + preço justo = satisfação total`,
      `💎 ${name} • Sua loja de confiança. Parcele em até 12x sem juros!`,
      `⚡ ${name} | Produtos originais com garantia. Entrega expressa 📦`,
      `🏆 ${name} — Qualidade que você merece, preço que cabe no bolso`,
      `🎯 ${name} • Novidades toda semana! Siga e fique por dentro 🛍️`,
      `💼 ${name} | Referência em qualidade. Compre com segurança ✅`,
    ];

    if (hasProducts && productNames.length > 0) {
      templates.push(
        `🛒 ${name} • ${productNames[0]} e muito mais! Confira nossa vitrine`,
        `📱 Especialista em ${productNames[0]}. Originais com garantia | ${name}`,
      );
    }

    // Pick a random template different from current bio
    await new Promise(r => setTimeout(r, 600)); // Simulates brief loading
    const filtered = templates.filter(t => t !== config.bio && t !== aiSuggestion);
    const pick = filtered[Math.floor(Math.random() * filtered.length)] || templates[0];
    setAiSuggestion(pick.slice(0, 120));
    setAiLoading(false);
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

  /* ─── Resolved design for preview ─── */
  const d = { ...DEFAULT_DESIGN, ...config.design };
  const pAccent = d.accentColor || currentTheme.accent;
  const pAccent2 = d.accentColor2 || currentTheme.accent2;
  const pBg = d.bgColor || currentTheme.bg;
  const pText = d.textColor || "#f8f5ff";
  const pSub = d.subtextColor || "rgba(220,220,220,0.8)";
  const pCard = d.cardBg || currentTheme.accent + "0a";
  const pBorder = d.cardBorder || currentTheme.accent + "30";
  const pFontH = d.fontHeading || "Inter";
  const pFontB = d.fontBody || "Inter";
  const pBtnRadius = d.buttonShape === "pill" ? "999px" : d.buttonShape === "square" ? "4px" : d.buttonShape === "soft" ? "12px" : `${d.buttonRadius}px`;
  const pBtnShadow = d.buttonShadow === "glow" ? `0 0 12px ${pAccent}40` : d.buttonShadow === "md" ? "0 3px 8px rgba(0,0,0,0.3)" : d.buttonShadow === "sm" ? "0 1px 4px rgba(0,0,0,0.2)" : "none";
  const pBtnStyle: React.CSSProperties = d.buttonFill === "outline"
    ? { background: "transparent", border: `1.5px solid ${pBorder}`, borderRadius: pBtnRadius, boxShadow: pBtnShadow }
    : d.buttonFill === "glass"
    ? { background: `${pCard}aa`, backdropFilter: "blur(8px)", border: `1px solid ${pBorder}`, borderRadius: pBtnRadius, boxShadow: pBtnShadow }
    : d.buttonFill === "ghost"
    ? { background: "transparent", borderRadius: pBtnRadius, boxShadow: pBtnShadow }
    : { background: pCard, border: `1px solid ${pBorder}`, borderRadius: pBtnRadius, boxShadow: pBtnShadow };
  const pProfileRadius = d.profileShape === "circle" ? "9999px" : d.profileShape === "rounded" ? "20%" : d.profileShape === "square" ? "6px" : "0";
  const pProfileClip = d.profileShape === "hexagon" ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" : undefined;
  const pSize = Math.round((d.profileSize || 88) * 0.7); // scale down for mini preview

  /* Background CSS for preview */
  const previewBgStyle: React.CSSProperties = (() => {
    switch (d.bgType) {
      case "gradient": {
        const dir = d.bgGradientDir === "radial" ? "" : (
          { "to-b": "to bottom", "to-t": "to top", "to-r": "to right", "to-l": "to left", "to-br": "to bottom right", "to-bl": "to bottom left", "to-tr": "to top right", "to-tl": "to top left" } as any
        )[d.bgGradientDir] || "to bottom";
        return d.bgGradientDir === "radial"
          ? { background: `radial-gradient(circle, ${d.bgGradient[0]}, ${d.bgGradient[1]})` }
          : { background: `linear-gradient(${dir}, ${d.bgGradient[0]}, ${d.bgGradient[1]})` };
      }
      case "image": return d.bgImageUrl ? { backgroundImage: `url(${d.bgImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: pBg };
      case "effect": return { background: pBg };
      default: return { background: pBg };
    }
  })();

  /* Effect overlay for phone preview — CSS-based mini effect */
  const previewEffectOverlay: React.CSSProperties | null = (() => {
    if (d.bgType !== "effect" || !d.bgEffect) return null;
    const a = pAccent;
    switch (d.bgEffect) {
      case "aurora": return { background: `linear-gradient(135deg, ${a}30, transparent 40%, ${a}20 70%, transparent)` };
      case "aurora-waves": return { background: `linear-gradient(180deg, transparent 10%, ${a}25 40%, transparent 60%, ${a}15 80%, transparent)` };
      case "ambient-glow": return { background: `radial-gradient(circle at center, ${a}30, transparent 70%)` };
      case "spotlight": return { background: `radial-gradient(ellipse at 50% 30%, ${a}35, transparent 60%)` };
      case "radial-glow": return { background: `radial-gradient(circle, ${a}25, transparent 65%)` };
      case "gradient-flow": return { background: `linear-gradient(45deg, ${a}30, #ec489920, ${a}30)` };
      case "gradient-mesh": return { background: `radial-gradient(at 20% 30%, ${a}25 0%, transparent 50%), radial-gradient(at 80% 70%, #ec489920 0%, transparent 50%)` };
      case "gradient-shift": return { background: `linear-gradient(90deg, ${a}20, #60a5fa20, ${a}20)` };
      case "starfield": return { background: `radial-gradient(1px 1px at 20% 30%, white 50%, transparent), radial-gradient(1px 1px at 70% 60%, white 50%, transparent), radial-gradient(1px 1px at 40% 80%, white 50%, transparent)` };
      case "floating-dots": return { background: `radial-gradient(2px 2px at 25% 25%, ${a}40, transparent), radial-gradient(2px 2px at 75% 45%, ${a}30, transparent), radial-gradient(2px 2px at 50% 75%, ${a}20, transparent)` };
      case "sparkles": return { background: `radial-gradient(1px 1px at 30% 20%, ${a} 50%, transparent), radial-gradient(1px 1px at 60% 50%, #fcd34d 50%, transparent), radial-gradient(1px 1px at 80% 80%, ${a} 50%, transparent)` };
      case "wave-layers": return { background: `linear-gradient(180deg, transparent 30%, ${a}15 50%, ${a}08 70%, transparent)` };
      case "flow-field": return { background: `linear-gradient(135deg, transparent 20%, ${a}10 40%, transparent 60%, ${a}08 80%)` };
      case "liquid": return { background: `radial-gradient(ellipse at 30% 50%, ${a}20 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, #ec489915 0%, transparent 60%)` };
      case "matrix-grid": return { backgroundImage: `linear-gradient(${a}15 1px, transparent 1px), linear-gradient(90deg, ${a}15 1px, transparent 1px)`, backgroundSize: "8px 8px" };
      case "pulse-grid": return { backgroundImage: `radial-gradient(${a}30 1px, transparent 1px)`, backgroundSize: "10px 10px" };
      case "scan-lines": return { backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 2px, ${a}08 2px, ${a}08 4px)` };
      case "fog": return { background: `linear-gradient(135deg, transparent, rgba(255,255,255,0.04) 40%, transparent 70%)` };
      case "smoke": return { background: `radial-gradient(ellipse at 40% 60%, rgba(255,255,255,0.05), transparent 60%)` };
      case "clouds": return { background: `radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(255,255,255,0.04) 0%, transparent 50%)` };
      default: return null;
    }
  })();

  const phonePreview = (
    <div className="relative mx-auto" style={{ width: 310 }}>
      <div className="rounded-[2.8rem] border-[3px] border-[hsl(var(--dash-text))] overflow-hidden shadow-2xl flex flex-col"
        style={{ aspectRatio: "9/16" }}>
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-1 flex-shrink-0" style={{ background: pBg }}>
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
        <div className="flex justify-center pb-3 flex-shrink-0" style={{ background: pBg }}>
          <div className="w-[88px] h-[26px] rounded-full bg-black" />
        </div>

        {/* Scrollable screen content */}
        <div className="flex-1 overflow-y-auto relative" style={{ ...previewBgStyle, fontFamily: `'${pFontB}', sans-serif` }}>
          {/* Effect overlay */}
          {previewEffectOverlay && <div className="absolute inset-0 pointer-events-none z-[1]" style={previewEffectOverlay} />}
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] pointer-events-none" style={{ background: `radial-gradient(ellipse, ${pAccent}20, transparent 70%)` }} />
          <div className="p-5 relative z-10">
            {/* Profile */}
            <div className="flex flex-col items-center mb-5">
              <div className="mb-2.5 overflow-hidden"
                style={{
                  width: pSize, height: pSize,
                  borderRadius: pProfileRadius,
                  clipPath: pProfileClip,
                  boxShadow: d.profileBorder ? `0 0 0 2px ${d.profileBorderColor || pAccent}50` : "none",
                }}>
                {config.avatarUrl ? (
                  <img src={config.avatarUrl} alt="avatar" className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"
                    style={{ background: pAccent }}>
                    <span className="text-white text-xl font-bold">
                      {config.displayName ? config.displayName[0].toUpperCase() : "?"}
                    </span>
                  </div>
                )}
              </div>
              <p className="font-bold text-sm" style={{ color: pText, fontFamily: `'${pFontH}', sans-serif` }}>{config.displayName || "Seu Nome"}</p>
              {config.username && <p className="text-xs mt-0.5" style={{ color: pAccent }}>@{config.username}</p>}
              {config.bio && <p className="text-xs text-center mt-1.5 px-2 line-clamp-2" style={{ color: pSub }}>{config.bio}</p>}
              {config.whatsapp && (
                <div className="flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full" style={{ background: "#25d36618" }}>
                  <MessageCircle size={10} style={{ color: "#25d366" }} />
                  <span className="text-[10px]" style={{ color: "#25d366" }}>WhatsApp</span>
                </div>
              )}

              {/* Social icons row */}
              {(() => {
                const socialLinks = config.links.filter(l => l.isSocial && l.active);
                const hasSocials = socialLinks.length > 0;
                const PLACEHOLDER_SOCIALS = [
                  { icon: <Instagram size={12} />, key: "instagram" },
                  { icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, key: "x" },
                  { icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.44a8.16 8.16 0 004.77 1.53V7.52a4.85 4.85 0 01-1.01-.83z"/></svg>, key: "tiktok" },
                ];
                return (
                  <div className="flex items-center gap-1.5 mt-2.5">
                    {hasSocials
                      ? socialLinks.slice(0, 4).map(link => (
                          <div key={link.id} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${pAccent}15`, border: `1px solid ${pAccent}18` }}>
                            <span style={{ color: pAccent }}>{LINK_ICON_MAP[link.icon] || <Globe size={10} />}</span>
                          </div>
                        ))
                      : PLACEHOLDER_SOCIALS.map(s => (
                          <div key={s.key} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${pAccent}08`, border: `1px solid ${pAccent}10`, color: `${pAccent}40` }}>
                            {s.icon}
                          </div>
                        ))
                    }
                  </div>
                );
              })()}
            </div>

            {/* Blocks in order */}
            {blocks.map(block => {
              if (block.type === "product") {
                const p = config.products.find(pr => pr.id === block.refId);
                if (!p || !p.active || !isScheduledActive(p)) return null;
                return (
                  <div key={block.id} className="flex items-center gap-2.5 p-2.5 mb-2 transition-all hover:scale-[1.01]"
                    style={{ ...pBtnStyle }}>
                    {(p.images?.length > 0) ? (
                      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <span className="text-base flex-shrink-0">{p.emoji}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: pText, fontFamily: `'${pFontH}', sans-serif` }}>{p.title}</p>
                      <div className="flex items-center gap-2">
                        {p.originalPrice && (
                          <span className="text-[9px] line-through" style={{ color: pSub }}>{p.originalPrice}</span>
                        )}
                        {p.price && <p className="text-[10px] font-bold" style={{ color: pAccent }}>{p.price}</p>}
                      </div>
                    </div>
                    {p.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: pAccent + "25", color: pAccent }}>
                        {p.badge}
                      </span>
                    )}
                    {p.urgency && <Clock size={10} style={{ color: pAccent2 }} />}
                  </div>
                );
              }
              if (block.type === "link") {
                const l = config.links.find(lk => lk.id === block.refId);
                if (!l || !l.active || !isScheduledActive(l)) return null;
                if (l.type === "header") return (
                  <div key={block.id} className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-px" style={{ background: pAccent + "30" }} />
                    <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: pAccent + "80" }}>{l.title}</span>
                    <div className="flex-1 h-px" style={{ background: pAccent + "30" }} />
                  </div>
                );
                if (l.type === "spotlight") return (
                  <div key={block.id} className="p-2.5 mb-2 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                    style={{ background: `${pAccent}20`, border: `1px solid ${pAccent}35`, borderRadius: pBtnRadius }}>
                    <span style={{ color: pAccent }}>{LINK_ICON_MAP[l.icon]}</span>
                    <span className="text-xs font-bold" style={{ color: pAccent }}>{l.title || l.url}</span>
                  </div>
                );
                return (
                  <div key={block.id} className="flex items-center gap-2 p-2.5 mb-2 transition-all hover:scale-[1.01]"
                    style={{ ...pBtnStyle }}>
                    <span style={{ color: pAccent }}>{LINK_ICON_MAP[l.icon]}</span>
                    <span className="text-xs truncate" style={{ color: pSub }}>{l.title || l.url}</span>
                  </div>
                );
              }
              if (block.type === "testimonial") {
                const t = config.testimonials.find(te => te.id === block.refId);
                if (!t) return null;
                return (
                  <div key={block.id} className="p-2.5 mb-2"
                    style={{ ...pBtnStyle }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      {t.avatar ? (
                        <img src={t.avatar} alt={t.name} className="w-5 h-5 rounded-full object-cover" />
                      ) : (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                          style={{ background: pAccent }}>
                          {t.name[0]?.toUpperCase()}
                        </div>
                      )}
                      <p className="text-[9px] font-semibold" style={{ color: pAccent }}>
                        {t.name} {t.role && <span style={{ color: pSub }}>· {t.role}</span>}
                      </p>
                    </div>
                    <div className="text-[10px] mb-1">{"⭐".repeat(t.stars)}</div>
                    <p className="text-[9px] line-clamp-2 italic" style={{ color: pSub }}>"{t.text}"</p>
                    {t.screenshotUrl && (
                      <img src={t.screenshotUrl} alt="Print" className="w-full mt-1.5 rounded-md object-contain max-h-12 opacity-90" />
                    )}
                  </div>
                );
              }
              if (block.type === "header") {
                const ss = block.separatorStyle || "line";
                const sepDeco = (() => {
                  switch (ss) {
                    case "dots": return <div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-1 h-1 rounded-full" style={{ background: pAccent + "50" }} />)}</div>;
                    case "stars": return <span className="text-[9px]" style={{ color: pAccent + "70" }}>✦ ✦ ✦</span>;
                    case "diamond": return <div className="w-1.5 h-1.5 rotate-45" style={{ background: pAccent + "50" }} />;
                    case "wave": return <span className="text-[9px]" style={{ color: pAccent + "60" }}>∿∿∿</span>;
                    case "zigzag": return <span className="text-[8px]" style={{ color: pAccent + "60" }}>⌇⌇⌇⌇</span>;
                    default: return null;
                  }
                })();
                const gradLine = ss === "gradient" || ss === "fade";
                const lineS = gradLine ? { background: `linear-gradient(90deg, transparent, ${pAccent}30, transparent)` } : { background: pAccent + "25" };
                return (
                  <div key={block.id} className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-px" style={lineS} />
                    {sepDeco}
                    {block.title && <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: pAccent + "85" }}>{block.title}</span>}
                    {(sepDeco || block.title) && <div className="flex-1 h-px" style={lineS} />}
                  </div>
                );
              }
              return null;
            })}

            {/* Empty state */}
            {blocks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${pAccent}12`, border: `1px dashed ${pAccent}25` }}>
                  <Package size={16} style={{ color: `${pAccent}50` }} />
                </div>
                <p className="text-[10px] font-medium" style={{ color: pSub }}>Adicione produtos</p>
                <p className="text-[9px]" style={{ color: pSub }}>Adicione itens à sua vitrine</p>
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 pb-2 text-center">
              <p className="text-[9px]" style={{ color: "#555" }}>Criado com maview.app</p>
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

      {/* Purple copy toast */}
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg transition-all duration-300 pointer-events-none ${copyToastVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}`}
        style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(270 60% 55%))", color: "#fff" }}>
        <Check size={14} />
        <span className="text-[13px] font-semibold">{copyToastText}</span>
      </div>

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
      <ProfileHeroCard config={config} onUpdate={updateConfig} onEditProfile={() => setActiveTab("perfil")} onHealthAction={handleHealthAction} onCopyToast={showCopyToast} />

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
                          { type: "product" as const, icon: <Package size={15} className="text-primary" />, label: "Produto", desc: "Venda produtos ou serviços" },
                          { type: "booking" as const, icon: <Calendar size={15} className="text-primary" />, label: "Agendamento", desc: "Receba marcações online" },
                          { type: "link" as const, icon: <Link2 size={15} className="text-primary" />, label: "Link", desc: "Direcione para qualquer URL" },
                          { type: "testimonial" as const, icon: <Star size={15} className="text-primary" />, label: "Depoimento", desc: "Prova social" },
                          { type: "header" as const, icon: <Type size={15} className="text-[hsl(var(--dash-text-subtle))]" />, label: "Separador", desc: "Organize seções" },
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
                      <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => productImageInputRef.current?.click()}
                          className="rounded-xl border border-dashed border-[hsl(var(--dash-border))] hover:border-primary/50 bg-[hsl(var(--dash-surface))] hover:bg-primary/5 transition-all py-3 flex flex-col items-center gap-1.5 cursor-pointer group/btn">
                          <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center group-hover/btn:bg-primary/15 transition-colors">
                            <Image size={15} className="text-primary" />
                          </div>
                          <p className="text-[10px] font-semibold text-[hsl(var(--dash-text))]">Fotos</p>
                          <p className="text-[9px] text-[hsl(var(--dash-text-muted))] leading-tight">JPG, PNG, WebP</p>
                        </button>
                        <button onClick={() => productVideoInputRef.current?.click()}
                          className={`rounded-xl border border-dashed border-[hsl(var(--dash-border))] hover:border-blue-400/50 bg-[hsl(var(--dash-surface))] hover:bg-blue-500/5 transition-all py-3 flex flex-col items-center gap-1.5 cursor-pointer group/btn ${productForm.video ? "opacity-40 pointer-events-none" : ""}`}>
                          <div className="w-8 h-8 rounded-lg bg-blue-500/8 flex items-center justify-center group-hover/btn:bg-blue-500/15 transition-colors">
                            <Video size={15} className="text-blue-500" />
                          </div>
                          <p className="text-[10px] font-semibold text-[hsl(var(--dash-text))]">Vídeo</p>
                          <p className="text-[9px] text-[hsl(var(--dash-text-muted))] leading-tight">Até 20s · 10MB</p>
                        </button>
                        <button onClick={() => productGifInputRef.current?.click()}
                          className="rounded-xl border border-dashed border-[hsl(var(--dash-border))] hover:border-fuchsia-400/50 bg-[hsl(var(--dash-surface))] hover:bg-fuchsia-500/5 transition-all py-3 flex flex-col items-center gap-1.5 cursor-pointer group/btn">
                          <div className="w-8 h-8 rounded-lg bg-fuchsia-500/8 flex items-center justify-center group-hover/btn:bg-fuchsia-500/15 transition-colors">
                            <Sparkles size={15} className="text-fuchsia-500" />
                          </div>
                          <p className="text-[10px] font-semibold text-[hsl(var(--dash-text))]">GIF</p>
                          <p className="text-[9px] text-[hsl(var(--dash-text-muted))] leading-tight">Animação · 5MB</p>
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
                      <label className={labelCls}>Estilo</label>
                      <div className="flex gap-2">
                        {([
                          { v: "normal" as const, label: "Normal", tip: "Link discreto na lista" },
                          { v: "spotlight" as const, label: "Destaque", tip: "Link com mais visibilidade" },
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

                    {/* Avatar upload */}
                    <div>
                      <label className={labelCls}>Foto do cliente</label>
                      <div className="flex items-center gap-3">
                        {testimonialForm.avatar ? (
                          <div className="relative group">
                            <img src={testimonialForm.avatar} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/30" />
                            <button onClick={() => setTestimonialForm(f => ({ ...f, avatar: "" }))}
                              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <X size={10} />
                            </button>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[hsl(var(--dash-accent))] border-2 border-dashed border-[hsl(var(--dash-border))] flex items-center justify-center text-[hsl(var(--dash-text-subtle))]">
                            <Camera size={16} />
                          </div>
                        )}
                        <button onClick={() => testimonialAvatarRef.current?.click()}
                          className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors">
                          {testimonialForm.avatar ? "Trocar foto" : "Enviar foto"}
                        </button>
                        <input type="file" ref={testimonialAvatarRef} accept="image/*" className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => setTestimonialForm(f => ({ ...f, avatar: reader.result as string }));
                            reader.readAsDataURL(file);
                            e.target.value = "";
                          }} />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Nome</label>
                      <input type="text" className={inputCls} placeholder="João Silva" maxLength={50} required
                        value={testimonialForm.name}
                        onChange={e => setTestimonialForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Cargo / Função <span className="text-[hsl(var(--dash-text-subtle))] font-normal">(opcional)</span></label>
                      <input type="text" className={inputCls} placeholder="Designer, Cliente, Empresário..."
                        value={testimonialForm.role}
                        onChange={e => setTestimonialForm(f => ({ ...f, role: e.target.value }))} />
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

                    {/* Screenshot de depoimento real */}
                    <div className="pt-1 border-t border-[hsl(var(--dash-border-subtle))]">
                      <label className={labelCls}>Print do depoimento real <span className="text-[hsl(var(--dash-text-subtle))] font-normal">(opcional)</span></label>
                      <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mb-2 -mt-0.5">
                        Envie um print do WhatsApp, Instagram ou avaliação real para dar mais credibilidade
                      </p>
                      {testimonialForm.screenshotUrl ? (
                        <div className="relative rounded-xl overflow-hidden border border-[hsl(var(--dash-border-subtle))]">
                          <img src={testimonialForm.screenshotUrl} alt="Print do depoimento" className="w-full max-h-40 object-contain bg-black/5" />
                          <button onClick={() => setTestimonialForm(f => ({ ...f, screenshotUrl: "" }))}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors">
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => testimonialScreenshotRef.current?.click()}
                          className="w-full py-4 rounded-xl border-2 border-dashed border-[hsl(var(--dash-border))] flex flex-col items-center gap-1.5 text-[hsl(var(--dash-text-subtle))] hover:border-primary/40 hover:text-primary transition-all">
                          <Image size={18} />
                          <span className="text-[11px] font-medium">Enviar print do depoimento</span>
                          <span className="text-[9px]">JPG, PNG ou WebP</span>
                        </button>
                      )}
                      <input type="file" ref={testimonialScreenshotRef} accept="image/*" className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => setTestimonialForm(f => ({ ...f, screenshotUrl: reader.result as string }));
                          reader.readAsDataURL(file);
                          e.target.value = "";
                        }} />
                    </div>

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
                      <label className={labelCls}>Título da seção <span className="text-[hsl(var(--dash-text-subtle))] font-normal">(opcional)</span></label>
                      <input type="text" className={inputCls} placeholder="Ex: Meus Cursos, Depoimentos..."
                        value={headerTitle}
                        onChange={e => setHeaderTitle(e.target.value)} />
                    </div>

                    {/* Separator style selector */}
                    <div>
                      <label className={labelCls}>Estilo do separador</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {([
                          { id: "line" as SeparatorStyle, label: "Linha", preview: <div className="w-10 h-[1px] bg-current mx-auto" /> },
                          { id: "dots" as SeparatorStyle, label: "Pontos", preview: <div className="flex gap-1.5 justify-center">{[0,1,2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-current" />)}</div> },
                          { id: "gradient" as SeparatorStyle, label: "Degradê", preview: <div className="w-10 h-[2px] mx-auto rounded-full" style={{ background: "linear-gradient(90deg, transparent, currentColor, transparent)" }} /> },
                          { id: "stars" as SeparatorStyle, label: "Estrelas", preview: <div className="text-[9px] text-center">✦ ✦ ✦</div> },
                          { id: "diamond" as SeparatorStyle, label: "Losango", preview: <div className="flex gap-2 justify-center items-center"><div className="w-8 h-[1px] bg-current" /><div className="w-1.5 h-1.5 rotate-45 bg-current" /><div className="w-8 h-[1px] bg-current" /></div> },
                          { id: "wave" as SeparatorStyle, label: "Onda", preview: <div className="text-[9px] text-center tracking-widest">∿∿∿∿∿</div> },
                          { id: "zigzag" as SeparatorStyle, label: "Zigzag", preview: <div className="text-[8px] text-center tracking-tighter">⌇⌇⌇⌇⌇⌇</div> },
                          { id: "fade" as SeparatorStyle, label: "Fade", preview: <div className="w-12 h-[1px] mx-auto" style={{ background: "linear-gradient(90deg, transparent 10%, currentColor 50%, transparent 90%)", opacity: 0.5 }} /> },
                        ]).map(({ id, label, preview }) => (
                          <button key={id} onClick={() => setHeaderSepStyle(id)}
                            className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-[9px] font-medium transition-all ${
                              headerSepStyle === id
                                ? "bg-primary/15 text-primary border border-primary/30"
                                : "bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text-muted))] border border-transparent hover:border-primary/20"
                            }`}>
                            <div className="h-3 flex items-center">{preview}</div>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="p-3 rounded-xl bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))]">
                      <p className="text-[9px] text-[hsl(var(--dash-text-subtle))] mb-2">Preview</p>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const lineStyle = { background: "hsl(var(--dash-text-subtle))", opacity: 0.3 };
                          const sepEl = (() => {
                            switch (headerSepStyle) {
                              case "dots": return <div className="flex gap-1.5">{[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--dash-text-subtle))", opacity: 0.4 }} />)}</div>;
                              case "stars": return <span className="text-[10px]" style={{ color: "hsl(var(--dash-text-subtle))", opacity: 0.5 }}>✦ ✦ ✦</span>;
                              case "diamond": return <div className="w-2 h-2 rotate-45" style={{ background: "hsl(var(--dash-text-subtle))", opacity: 0.4 }} />;
                              case "wave": return <span className="text-[10px] tracking-widest" style={{ color: "hsl(var(--dash-text-subtle))", opacity: 0.5 }}>∿∿∿</span>;
                              case "zigzag": return <span className="text-[9px]" style={{ color: "hsl(var(--dash-text-subtle))", opacity: 0.5 }}>⌇⌇⌇⌇</span>;
                              case "gradient": return null;
                              case "fade": return null;
                              default: return null;
                            }
                          })();
                          const gradientLine = headerSepStyle === "gradient" || headerSepStyle === "fade";
                          return (
                            <>
                              <div className="flex-1 h-[1px]" style={gradientLine ? { background: "linear-gradient(90deg, transparent, hsl(var(--dash-text-subtle)) 30%, hsl(var(--dash-text-subtle)) 70%, transparent)", opacity: 0.3 } : lineStyle} />
                              {sepEl}
                              {headerTitle && <span className="text-[10px] font-bold uppercase px-1" style={{ color: "hsl(var(--dash-text-muted))" }}>{headerTitle}</span>}
                              {sepEl && <div className="flex-1 h-[1px]" style={lineStyle} />}
                              {!sepEl && !headerTitle && <div className="flex-1 h-[1px]" style={gradientLine ? { background: "linear-gradient(90deg, hsl(var(--dash-text-subtle)) 30%, transparent)", opacity: 0.3 } : lineStyle} />}
                            </>
                          );
                        })()}
                      </div>
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
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-primary/5 flex items-center justify-center">
                      <Layout size={32} className="text-primary/40" />
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
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-dashed border-[hsl(var(--dash-border))] hover:border-primary/40 hover:bg-primary/5 transition-all group">
                        <Package size={20} className="text-[hsl(var(--dash-text-muted))] group-hover:text-primary transition-colors" />
                        <span className="text-[12px] font-medium text-[hsl(var(--dash-text-secondary))]">Produto</span>
                      </button>
                      <button onClick={openAddLink}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-dashed border-[hsl(var(--dash-border))] hover:border-primary/40 hover:bg-primary/5 transition-all group">
                        <Link2 size={20} className="text-[hsl(var(--dash-text-muted))] group-hover:text-primary transition-colors" />
                        <span className="text-[12px] font-medium text-[hsl(var(--dash-text-secondary))]">Link</span>
                      </button>
                      <button onClick={openAddTestimonial}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-dashed border-[hsl(var(--dash-border))] hover:border-primary/40 hover:bg-primary/5 transition-all group">
                        <Star size={20} className="text-[hsl(var(--dash-text-muted))] group-hover:text-primary transition-colors" />
                        <span className="text-[12px] font-medium text-[hsl(var(--dash-text-secondary))]">Depoimento</span>
                      </button>
                      <button onClick={openAddHeader}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-dashed border-[hsl(var(--dash-border))] hover:border-primary/40 hover:bg-primary/5 transition-all group">
                        <Type size={20} className="text-[hsl(var(--dash-text-muted))] group-hover:text-primary transition-colors" />
                        <span className="text-[12px] font-medium text-[hsl(var(--dash-text-secondary))]">Separador</span>
                      </button>
                    </div>

                    <p className="text-[hsl(var(--dash-text-subtle))] text-xs text-center pt-2">
                      Vitrines com 3+ itens convertem <span className="font-semibold text-primary">4x mais</span>
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
              <div className="space-y-5 pb-24">

                {/* ── CARD 1: Identidade (foto + nome + username + link) ── */}
                <div className="rounded-2xl border border-[hsl(var(--dash-border-subtle))] bg-[hsl(var(--dash-surface-2))]/60 overflow-hidden shadow-sm">
                  {/* Mini preview ao vivo */}
                  <div className="relative flex items-center gap-4 p-5 pb-4" style={{ background: `linear-gradient(135deg, ${currentTheme.bg}, ${currentTheme.accent}15)` }}>
                    <div className="absolute top-0 right-0 w-[140px] h-[70px] rounded-full blur-[50px] opacity-15" style={{ background: currentTheme.accent }} />
                    <div className="absolute bottom-0 left-0 w-[80px] h-[40px] rounded-full blur-[30px] opacity-10" style={{ background: currentTheme.accent2 }} />
                    {/* Avatar */}
                    <div className="relative flex-shrink-0 z-10">
                      <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden cursor-pointer group ring-2 ring-white/10 hover:ring-white/25 transition-all" style={{ boxShadow: `0 4px 20px ${currentTheme.accent}30` }}
                        onClick={() => avatarFileInputRef.current?.click()}>
                        {config.avatarUrl
                          ? <img src={config.avatarUrl} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white" style={{ background: `linear-gradient(135deg, ${currentTheme.accent}, ${currentTheme.accent2})` }}>
                              {config.displayName?.[0]?.toUpperCase() || "?"}
                            </div>
                        }
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center rounded-2xl backdrop-blur-[2px]">
                          <Image size={18} className="text-white drop-shadow-sm" />
                        </div>
                      </div>
                      <input type="file" accept="image/*" ref={avatarFileInputRef} className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            const img = new window.Image();
                            img.onload = () => {
                              const canvas = document.createElement("canvas");
                              const size = Math.min(img.width, img.height, 400);
                              canvas.width = size; canvas.height = size;
                              const ctx = canvas.getContext("2d")!;
                              const sx = (img.width - size) / 2, sy = (img.height - size) / 2;
                              ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
                              updateConfig("avatarUrl", canvas.toDataURL("image/jpeg", 0.82));
                            };
                            img.src = reader.result as string;
                          };
                          reader.readAsDataURL(file);
                          e.target.value = "";
                        }} />
                    </div>
                    {/* Name + username preview */}
                    <div className="flex-1 min-w-0 z-10">
                      <p className="text-[16px] font-bold truncate tracking-tight" style={{ color: "#f8f5ff" }}>
                        {config.displayName || "Seu nome"}
                      </p>
                      <p className="text-[12px] font-semibold mt-0.5" style={{ color: currentTheme.accent }}>
                        @{config.username || "username"}
                      </p>
                      {config.bio && <p className="text-[10px] mt-1 truncate leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{config.bio}</p>}
                    </div>
                  </div>

                  {/* Editable fields */}
                  <div className="p-5 pt-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Nome de exibição</label>
                        <input type="text" className={inputCls} placeholder="Seu nome ou marca"
                          value={config.displayName}
                          onChange={e => updateConfig("displayName", e.target.value)} />
                      </div>
                      <div>
                        <label className={labelCls}>Username</label>
                        <div className="flex items-center">
                          <span className="flex-shrink-0 rounded-l-xl border border-r-0 border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] text-sm px-3 py-2.5 select-none font-mono">@</span>
                          <input type="text" className={`${inputCls} rounded-l-none`} placeholder="seunome"
                            value={config.username} maxLength={30}
                            onChange={e => updateConfig("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} />
                        </div>
                      </div>
                    </div>

                    {/* Link copiável */}
                    {config.username && (
                      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/15">
                        <Link2 size={12} className="text-primary flex-shrink-0" />
                        <a href={`${window.location.origin}/${config.username.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer"
                          className="text-[12px] font-mono text-primary hover:underline truncate font-medium">
                          maview.app/{config.username.replace(/^@/, "")}
                        </a>
                        <button onClick={copyLink} className="ml-auto flex-shrink-0 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all text-[10px] font-semibold flex items-center gap-1">
                          {copied ? <><Check size={10} className="text-emerald-500" /> Copiado!</> : <><Copy size={10} /> Copiar</>}
                        </button>
                      </div>
                    )}

                    {/* Foto actions */}
                    <div className="flex items-center gap-3 pt-1">
                      <button onClick={() => avatarFileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-semibold text-primary border border-primary/25 hover:bg-primary/5 hover:border-primary/40 transition-all">
                        <Image size={12} /> {config.avatarUrl ? "Trocar foto" : "Enviar foto"}
                      </button>
                      {config.avatarUrl && (
                        <button onClick={() => updateConfig("avatarUrl", "")}
                          className="text-[11px] text-[hsl(var(--dash-text-subtle))] hover:text-red-400 transition-colors font-medium">
                          Remover
                        </button>
                      )}
                      <p className="text-[9px] text-[hsl(var(--dash-text-subtle))] ml-auto italic">Clique na foto para trocar</p>
                    </div>
                  </div>
                </div>

                {/* ── CARD 2: Bio ── */}
                <div className="rounded-2xl border border-[hsl(var(--dash-border-subtle))] bg-[hsl(var(--dash-surface-2))]/60 p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-[hsl(var(--dash-text-secondary))] text-xs font-semibold flex items-center gap-1.5">
                      <Pencil size={12} className="text-primary" /> Bio
                    </label>
                    <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-md ${
                      config.bio.length > 110
                        ? "text-amber-500 bg-amber-500/10"
                        : config.bio.length > 0
                          ? "text-emerald-500 bg-emerald-500/10"
                          : "text-[hsl(var(--dash-text-subtle))] bg-[hsl(var(--dash-accent))]"
                    }`}>
                      {config.bio.length}/120
                    </span>
                  </div>
                  <textarea className={`${inputCls} resize-none h-[76px]`}
                    placeholder="Ex: Loja oficial de iPhones | Entrega para todo Brasil | Parcele em 12x"
                    maxLength={120}
                    value={config.bio}
                    onChange={e => updateConfig("bio", e.target.value)} />

                  <div className="flex items-center gap-3 flex-wrap">
                    <button onClick={suggestBio} disabled={aiLoading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500/10 to-violet-500/10 border border-fuchsia-300/25 text-fuchsia-500 text-[11px] font-semibold hover:from-fuchsia-500/15 hover:to-violet-500/15 hover:border-fuchsia-300/40 transition-all disabled:opacity-50">
                      <Sparkles size={12} className={aiLoading ? "animate-spin" : ""} />
                      {aiLoading ? "Gerando..." : "Sugerir bio"}
                    </button>
                    <p className="text-[hsl(var(--dash-text-subtle))] text-[10px] flex items-center gap-1">
                      <TrendingUp size={9} /> Bios com emojis recebem mais cliques
                    </p>
                  </div>

                  {aiSuggestion && (
                    <div className="rounded-xl border border-fuchsia-300/30 bg-gradient-to-r from-fuchsia-500/5 to-violet-500/5 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                      <p className="text-fuchsia-500 text-[12px] font-bold flex items-center gap-1.5">
                        <Sparkles size={11} /> Sugestão:
                      </p>
                      <p className="text-[hsl(var(--dash-text))] text-[13px] leading-relaxed bg-[hsl(var(--dash-surface))]/50 rounded-lg p-3 border border-[hsl(var(--dash-border-subtle))]">
                        {aiSuggestion}
                      </p>
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => { updateConfig("bio", aiSuggestion.slice(0, 120)); setAiSuggestion(null); }}
                          className="text-[11px] px-4 py-2 rounded-xl btn-primary-gradient font-bold tracking-wide">Aplicar</button>
                        <button onClick={suggestBio} disabled={aiLoading}
                          className="text-[11px] px-4 py-2 rounded-xl border border-fuchsia-300/25 text-fuchsia-500 font-semibold hover:bg-fuchsia-500/5 transition-all">
                          <Sparkles size={10} className="inline mr-1" />Outra
                        </button>
                        <button onClick={() => setAiSuggestion(null)}
                          className="text-[11px] px-3 py-2 rounded-xl text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-all ml-auto">Fechar</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── CARD 3: WhatsApp (contato principal) ── */}
                <div className={`rounded-2xl border bg-[hsl(var(--dash-surface-2))]/60 p-5 space-y-3 shadow-sm transition-all duration-300 ${
                  highlightField === "whatsapp"
                    ? "border-emerald-400/50 shadow-[0_0_20px_rgba(34,197,94,0.12)]"
                    : "border-[hsl(var(--dash-border-subtle))]"
                }`}>
                  <div className="flex items-center justify-between">
                    <label className="text-[hsl(var(--dash-text-secondary))] text-xs font-semibold flex items-center gap-1.5">
                      <MessageCircle size={12} className="text-emerald-500" /> WhatsApp
                      {highlightField === "whatsapp" && (
                        <span className="ml-1 text-[10px] font-bold text-emerald-500 animate-pulse">essencial</span>
                      )}
                    </label>
                    {config.whatsapp && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                        <CheckCircle2 size={10} /> Ativo
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="flex-shrink-0 rounded-l-xl border border-r-0 border-[hsl(var(--dash-border))] bg-emerald-500/10 text-emerald-600 text-sm font-semibold px-3 py-2.5 select-none">+55</span>
                    <input ref={whatsappInputRef} type="tel" className={`${inputCls} rounded-l-none`} placeholder="11999999999"
                      value={config.whatsapp} maxLength={11}
                      onChange={e => updateConfig("whatsapp", e.target.value.replace(/\D/g, ""))} />
                  </div>
                  <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] leading-relaxed">
                    {config.whatsapp
                      ? <span className="text-emerald-600 font-medium flex items-center gap-1"><Zap size={10} /> Botão flutuante ativo na sua vitrine — clientes entram em contato direto</span>
                      : <span className="flex items-center gap-1"><AlertCircle size={10} className="text-amber-500" /> Adicione para exibir botão flutuante na vitrine — 73% dos clientes preferem WhatsApp</span>
                    }
                  </p>
                </div>

                {/* ── CARD 4: Redes sociais (top 5 + expandir) ── */}
                {(() => {
                  const ALL_SOCIALS = [
                    { icon: <Instagram size={15} className="text-pink-500" />, placeholder: "@seuinstagram", label: "Instagram", key: "instagram", baseUrl: "instagram.com/", color: "", primary: true },
                    { icon: <Youtube size={15} className="text-red-500" />, placeholder: "@seucanal", label: "YouTube", key: "youtube", baseUrl: "youtube.com/@", color: "", primary: true },
                    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"/></svg>, placeholder: "@seutiktok", label: "TikTok", key: "tiktok", baseUrl: "tiktok.com/@", color: "text-[hsl(var(--dash-text))]", primary: true },
                    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>, placeholder: "seufacebook", label: "Facebook", key: "facebook", baseUrl: "facebook.com/", color: "text-[#1877F2]", primary: true },
                    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, placeholder: "@seuX", label: "X (Twitter)", key: "twitter", baseUrl: "x.com/", color: "text-[hsl(var(--dash-text))]", primary: true },
                    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.282-1.592-1.663a8.928 8.928 0 0 1-.108 2.661c-.27 1.28-.862 2.287-1.768 2.992-.89.693-2.04 1.046-3.419 1.046h-.036c-1.66-.014-3.015-.68-3.918-1.928l1.673-1.14c.603.886 1.494 1.07 2.253 1.07h.021c.924-.006 1.633-.301 2.106-.878.367-.448.603-1.065.698-1.834-1.024.187-2.07.204-3.063.034-2.828-.483-4.392-2.334-4.267-5.065.077-1.674.764-3.104 1.934-4.026 1.078-.85 2.467-1.296 4.02-1.293 1.665.01 3.003.591 3.974 1.73.878 1.027 1.37 2.455 1.462 4.243 1.076.525 1.899 1.318 2.397 2.335.716 1.46.829 3.9-.955 5.67-1.836 1.822-4.106 2.632-7.343 2.654z"/></svg>, placeholder: "@seuthreads", label: "Threads", key: "threads", baseUrl: "threads.net/@", color: "text-[hsl(var(--dash-text))]", primary: false },
                    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>, placeholder: "seulinkedin", label: "LinkedIn", key: "linkedin", baseUrl: "linkedin.com/in/", color: "text-[#0A66C2]", primary: false },
                    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.054 5.56-5.023c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.828.941z"/></svg>, placeholder: "@seutelegram", label: "Telegram", key: "telegram", baseUrl: "t.me/", color: "text-[#26A5E4]", primary: false },
                    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.11 13.11 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.12-.098.246-.198.373-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03z"/></svg>, placeholder: "seudiscord", label: "Discord", key: "discord", baseUrl: "discord.gg/", color: "text-[#5865F2]", primary: false },
                    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.425 1.808-2.425.853 0 1.265.64 1.265 1.408 0 .858-.546 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.331 1.781.745 2.281a.3.3 0 0 1 .069.288l-.278 1.133c-.044.183-.145.222-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.525-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>, placeholder: "seupinterest", label: "Pinterest", key: "pinterest", baseUrl: "pinterest.com/", color: "text-[#E60023]", primary: false },
                    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>, placeholder: "@seutwitch", label: "Twitch", key: "twitch", baseUrl: "twitch.tv/", color: "text-[#9146FF]", primary: false },
                    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.337-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg>, placeholder: "seugithub", label: "GitHub", key: "github", baseUrl: "github.com/", color: "text-[hsl(var(--dash-text))]", primary: false },
                    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.37.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>, placeholder: "@seukwai", label: "Kwai", key: "kwai", baseUrl: "kwai.com/@", color: "text-[#FF4906]", primary: false },
                    { icon: <Globe size={15} className="text-[hsl(var(--dash-text-muted))]" />, placeholder: "https://seusite.com", label: "Site / Blog", key: "website", baseUrl: "", color: "", primary: false },
                  ];
                  const filledCount = ALL_SOCIALS.filter(s => config.links.some(l => l.icon === s.key && l.isSocial)).length;
                  const renderSocialRow = (social: typeof ALL_SOCIALS[0]) => {
                    const existing = config.links.find(l => l.icon === social.key && l.isSocial);
                    const val = existing?.url || existing?.title || "";
                    return (
                      <div key={social.key} className="flex items-center gap-3 group/row">
                        <div className={`w-9 h-9 rounded-xl bg-[hsl(var(--dash-accent))] flex items-center justify-center flex-shrink-0 ${social.color} group-hover/row:scale-105 transition-transform`}>
                          {social.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <input type="text" className={`${inputCls} text-[12px]`}
                            placeholder={social.placeholder}
                            value={val}
                            onChange={e => {
                              const newVal = e.target.value;
                              const links = [...config.links];
                              const idx = links.findIndex(l => l.icon === social.key && l.isSocial);
                              const buildUrl = (v: string) => {
                                if (v.startsWith("http")) return v;
                                if (social.key === "website") return v.includes(".") ? `https://${v}` : v;
                                return `https://${social.baseUrl}${v.replace(/^@/, "")}`;
                              };
                              if (idx >= 0) {
                                links[idx] = { ...links[idx], url: buildUrl(newVal), title: social.label, active: !!newVal };
                              } else if (newVal) {
                                links.push({ id: Date.now().toString(), title: social.label, url: buildUrl(newVal), icon: social.key, active: true, isSocial: true, type: "normal" });
                              }
                              updateConfig("links", links);
                            }}
                          />
                        </div>
                        {val && <Check size={14} className="text-emerald-500 flex-shrink-0" />}
                      </div>
                    );
                  };
                  return (
                    <div className="rounded-2xl border border-[hsl(var(--dash-border-subtle))] bg-[hsl(var(--dash-surface-2))]/60 p-5 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <label className="text-[hsl(var(--dash-text-secondary))] text-xs font-semibold flex items-center gap-1.5">
                          <Globe size={12} className="text-primary" /> Redes sociais
                        </label>
                        {filledCount > 0 && (
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 size={9} /> {filledCount} conectada{filledCount > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] -mt-2 leading-relaxed flex items-center gap-1">
                        <Zap size={9} className="text-amber-500" /> Aparecem como ícones no topo da sua vitrine
                      </p>

                      {/* Top 5 always visible */}
                      <div className="space-y-3">
                        {ALL_SOCIALS.filter(s => s.primary).map(renderSocialRow)}
                      </div>

                      {/* Expandable: more networks */}
                      <details className="group">
                        <summary className="flex items-center gap-2 cursor-pointer text-[11px] text-primary font-semibold hover:text-primary/80 transition-colors pt-1 pb-1">
                          <Plus size={12} className="group-open:rotate-45 transition-transform" /> Mais redes
                          <span className="text-[hsl(var(--dash-text-subtle))] font-normal text-[10px]">
                            — Threads, LinkedIn, Telegram, Discord...
                          </span>
                          <ChevronDown size={11} className="ml-auto group-open:rotate-180 transition-transform text-[hsl(var(--dash-text-subtle))]" />
                        </summary>
                        <div className="space-y-3 pt-3 mt-2 border-t border-[hsl(var(--dash-border-subtle))]">
                          {ALL_SOCIALS.filter(s => !s.primary).map(renderSocialRow)}
                        </div>
                      </details>
                    </div>
                  );
                })()}

                {/* ── CARD 5: Preview de compartilhamento (SEO) ── */}
                <div className="rounded-2xl border border-[hsl(var(--dash-border-subtle))] bg-[hsl(var(--dash-surface-2))]/60 overflow-hidden shadow-sm">
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[hsl(var(--dash-text-secondary))] text-xs font-semibold flex items-center gap-1.5">
                        <Eye size={12} className="text-amber-500" /> Preview de compartilhamento
                      </label>
                      <span className="text-[9px] font-medium text-[hsl(var(--dash-text-subtle))] bg-[hsl(var(--dash-accent))] px-2 py-0.5 rounded-full">SEO</span>
                    </div>
                    <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] leading-relaxed -mt-2">
                      Este card mostra como seu link aparece quando alguem compartilha no <strong className="text-[hsl(var(--dash-text-muted))]">WhatsApp</strong>, <strong className="text-[hsl(var(--dash-text-muted))]">Instagram</strong>, <strong className="text-[hsl(var(--dash-text-muted))]">Facebook</strong> e outras redes. Preencha nome e bio para um resultado profissional.
                    </p>

                    {/* Preview card simulando WhatsApp/redes */}
                    <div className="rounded-xl border border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-surface))] overflow-hidden">
                      <div className="p-3.5 flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[hsl(var(--dash-accent))] flex items-center justify-center flex-shrink-0 overflow-hidden ring-1 ring-[hsl(var(--dash-border-subtle))]">
                          {config.avatarUrl
                            ? <img src={config.avatarUrl} alt="" className="w-full h-full object-cover" />
                            : <span className="text-primary text-base font-bold">{config.displayName?.[0] || "M"}</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <p className="text-[13px] font-bold text-[hsl(var(--dash-text))] truncate">{config.displayName || "Seu Nome"} | Maview</p>
                          <p className="text-[11px] text-[hsl(var(--dash-text-muted))] truncate leading-relaxed">{config.bio || "Confira minha vitrine digital"}</p>
                          <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mt-1 font-mono flex items-center gap-1">
                            <Link2 size={9} /> maview.app/{config.username || "username"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 px-1">
                      <AlertCircle size={10} className="text-amber-500/70 flex-shrink-0" />
                      <p className="text-[9px] text-[hsl(var(--dash-text-subtle))] leading-relaxed">
                        Gerado automaticamente do seu nome e bio. Quanto mais completo, mais profissional o resultado.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ═══════════════ TAB: DESIGN ═══════════════ */}
            {activeTab === "design" && (
              <div>
                {/* Fixed mini preview — visible on mobile while scrolling Design tab */}
                <div className="lg:hidden fixed top-0 left-0 right-0 z-40 px-4 py-3 border-b border-[hsl(var(--dash-border-subtle))]"
                  style={{ background: "hsl(var(--dash-surface) / 0.97)", backdropFilter: "blur(16px)" }}>
                  <div className="flex items-center gap-3">
                    {/* Mini phone mockup */}
                    <div className="flex-shrink-0 w-[140px] rounded-2xl overflow-hidden border-2 border-[hsl(var(--dash-text))]/30 shadow-lg">
                      <div className="overflow-hidden relative" style={{ ...previewBgStyle, height: 180, fontFamily: `'${pFontB}', sans-serif` }}>
                        {previewEffectOverlay && <div className="absolute inset-0 pointer-events-none z-[1]" style={previewEffectOverlay} />}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[80px] pointer-events-none" style={{ background: `radial-gradient(ellipse, ${pAccent}20, transparent 70%)` }} />
                        <div className="p-2.5 relative z-10">
                          <div className="flex flex-col items-center mb-2">
                            <div className="mb-1 overflow-hidden"
                              style={{
                                width: 28, height: 28,
                                borderRadius: pProfileRadius,
                                clipPath: pProfileClip,
                                boxShadow: d.profileBorder ? `0 0 0 1px ${d.profileBorderColor || pAccent}50` : "none",
                              }}>
                              {config.avatarUrl ? (
                                <img src={config.avatarUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-white"
                                  style={{ background: pAccent }}>
                                  {(config.displayName || "?")[0]}
                                </div>
                              )}
                            </div>
                            <p className="text-[8px] font-bold" style={{ color: pText, fontFamily: `'${pFontH}', sans-serif` }}>{config.displayName || "Nome"}</p>
                          </div>
                          {/* Mini product/link placeholders */}
                          {blocks.slice(0, 3).map(block => (
                            <div key={block.id} className="h-[16px] mb-1 flex items-center gap-1 px-1.5"
                              style={{ ...pBtnStyle, padding: "2px 4px" }}>
                              <div className="w-2.5 h-2.5 rounded flex-shrink-0" style={{ background: pAccent + "30" }} />
                              <div className="flex-1 h-1 rounded" style={{ background: pText + "30" }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[hsl(var(--dash-text))] text-xs font-semibold">Preview ao vivo</p>
                      <p className="text-[hsl(var(--dash-text-subtle))] text-[10px] mt-0.5">As mudanças aparecem aqui em tempo real</p>
                      <button onClick={() => setShowMobilePreview(true)}
                        className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-all">
                        <Eye size={10} /> Ver tela cheia
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:pt-0 pt-[140px]">
                  <DesignTab
                    config={config}
                    themes={THEMES}
                    defaultDesign={DEFAULT_DESIGN}
                    updateConfig={updateConfig}
                    highlightField={highlightField}
                    themeGridRef={themeGridRef}
                  />
                </div>
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
              <p className="text-[hsl(var(--dash-text-subtle))] text-xs font-medium tracking-wide">
                Preview ao vivo
              </p>
              {config.username && (
                <a href={`${window.location.origin}/${config.username.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer"
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
                {phonePreview}
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
