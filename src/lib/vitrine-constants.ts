import type {
  ThemeId, DesignConfig, VitrineConfig, VitrineBlock,
  ProductItem, LinkItem, TestimonialItem,
} from "@/types/vitrine";

// ── Theme definitions ──────────────────────────────────────────────────────

export const THEMES: { id: ThemeId; label: string; bg: string; accent: string; accent2: string }[] = [
  // Classic dark
  { id: "dark-purple", label: "Roxo Escuro",  bg: "#080612", accent: "#a855f7", accent2: "#ec4899" },
  { id: "midnight",    label: "Meia Noite",   bg: "#05080f", accent: "#60a5fa", accent2: "#818cf8" },
  { id: "forest",      label: "Floresta",     bg: "#050f05", accent: "#4ade80", accent2: "#34d399" },
  { id: "rose",        label: "Rosa",         bg: "#100509", accent: "#f43f5e", accent2: "#fb7185" },
  { id: "amber",       label: "Âmbar",        bg: "#0f0a00", accent: "#f59e0b", accent2: "#fcd34d" },
  { id: "ocean",       label: "Oceano",       bg: "#020c14", accent: "#06b6d4", accent2: "#22d3ee" },
  // Vibrant
  { id: "neon-pink",   label: "Neon Pink",    bg: "#0a0010", accent: "#ff2d95", accent2: "#ff6ec7" },
  { id: "sunset",      label: "Pôr do Sol",   bg: "#0f0805", accent: "#f97316", accent2: "#ef4444" },
  { id: "lavender",    label: "Lavanda",      bg: "#0c0a14", accent: "#c084fc", accent2: "#a78bfa" },
  { id: "emerald",     label: "Esmeralda",    bg: "#021a0f", accent: "#10b981", accent2: "#6ee7b7" },
  { id: "crimson",     label: "Carmesim",     bg: "#120508", accent: "#dc2626", accent2: "#f87171" },
  { id: "arctic",      label: "Ártico",       bg: "#050a10", accent: "#38bdf8", accent2: "#7dd3fc" },
  // Premium
  { id: "gold",        label: "Ouro",         bg: "#0c0a04", accent: "#eab308", accent2: "#d97706" },
  { id: "sage",        label: "Sálvia",       bg: "#080c08", accent: "#84cc16", accent2: "#a3e635" },
  { id: "coral",       label: "Coral",        bg: "#0f0808", accent: "#fb923c", accent2: "#f472b6" },
  { id: "indigo",      label: "Índigo",       bg: "#06050f", accent: "#6366f1", accent2: "#a78bfa" },
  { id: "slate",       label: "Grafite",      bg: "#0c0e12", accent: "#94a3b8", accent2: "#cbd5e1" },
  { id: "wine",        label: "Vinho",        bg: "#100408", accent: "#be185d", accent2: "#e11d48" },
  // Light themes
  { id: "white",       label: "Branco",       bg: "#f8f9fa", accent: "#6366f1", accent2: "#8b5cf6" },
  { id: "cream",       label: "Creme",        bg: "#faf7f2", accent: "#d97706", accent2: "#b45309" },
  // Bold themes
  { id: "pure-black",  label: "Preto Puro",   bg: "#000000", accent: "#ffffff", accent2: "#a0a0a0" },
  { id: "bold-red",    label: "Vermelho",     bg: "#0a0000", accent: "#ff3333", accent2: "#ff6666" },
  // Custom
  { id: "custom",      label: "Personalizado", bg: "#080612", accent: "#a855f7", accent2: "#ec4899" },
];

export const DEFAULT_DESIGN: DesignConfig = {
  bgType: "solid", bgColor: "", bgGradient: ["#080612", "#1a0a2e"],
  bgGradientDir: "to-b", bgImageUrl: "", bgVideoUrl: "",
  bgPattern: "", bgOverlay: 40, bgBlur: 0, bgEffect: "",
  bgImageZoom: 100, bgImagePosX: 50, bgImagePosY: 50,
  textColor: "", subtextColor: "",
  nameColor: "", productTitleColor: "", priceColor: "",
  originalPriceColor: "", descriptionColor: "",
  urgencyBadgeBg: "", urgencyBadgeText: "",
  socialIconStyle: "brand", socialIconCustomColor: "",
  cardBg: "", cardBorder: "",
  accentColor: "", accentColor2: "",
  fontHeading: "Inter", fontBody: "Inter",
  buttonShape: "rounded", buttonFill: "solid", buttonShadow: "none", buttonRadius: 12,
  coverImageUrl: "", coverOverlay: 0, coverZoom: 100, coverPosX: 50, coverPosY: 50,
  profileShape: "circle", profileBorder: true, profileBorderColor: "", profileGlow: true, profileGlowColor: "", profileSize: 88,
  textShadow: 0, hideWatermark: false,
};

export const BG_PATTERNS: { id: string; label: string; svg: string }[] = [
  { id: "dots", label: "Pontos", svg: `<svg width="20" height="20"><circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.06)"/></svg>` },
  { id: "grid", label: "Grade", svg: `<svg width="40" height="40"><path d="M0 0h40v40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/></svg>` },
  { id: "diagonal", label: "Diagonal", svg: `<svg width="16" height="16"><path d="M0 16L16 0" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></svg>` },
  { id: "waves", label: "Ondas", svg: `<svg width="100" height="20"><path d="M0 10 Q25 0 50 10 Q75 20 100 10" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1.5"/></svg>` },
  { id: "cross", label: "Cruz", svg: `<svg width="24" height="24"><path d="M12 0v24M0 12h24" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/></svg>` },
  { id: "hexagon", label: "Hexágono", svg: `<svg width="28" height="49"><path d="M14 0L28 12.25L28 36.75L14 49L0 36.75L0 12.25Z" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/></svg>` },
  { id: "noise", label: "Textura", svg: "" },
];

export const GOOGLE_FONTS = [
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
  { name: "Playfair Display", category: "serif" },
  { name: "Lora", category: "serif" },
  { name: "Merriweather", category: "serif" },
  { name: "DM Serif Display", category: "serif" },
  { name: "Cormorant Garamond", category: "serif" },
  { name: "Bebas Neue", category: "display" },
  { name: "Righteous", category: "display" },
  { name: "Pacifico", category: "handwriting" },
  { name: "Satisfy", category: "handwriting" },
  { name: "Dancing Script", category: "handwriting" },
  { name: "JetBrains Mono", category: "mono" },
  { name: "Fira Code", category: "mono" },
];

export const DEFAULT_CONFIG: VitrineConfig = {
  displayName: "", username: "", bio: "", avatarUrl: "", whatsapp: "",
  theme: "dark-purple", products: [], links: [], testimonials: [], blocks: [],
  onboardingDone: false,
};

export const LS_KEY = "maview_vitrine_config";

export const BOOKING_DAYS_ALL = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
export const BOOKING_DAYS_LABELS: Record<string, string> = { seg: "S", ter: "T", qua: "Q", qui: "Q", sex: "S", sab: "S", dom: "D" };
export const BOOKING_DURATIONS = [
  { min: 15,  label: "15min" },
  { min: 30,  label: "30min" },
  { min: 45,  label: "45min" },
  { min: 60,  label: "1h" },
  { min: 90,  label: "1h30" },
  { min: 120, label: "2h" },
];

export interface EmojiCategory {
  name: string;
  icon: string;
  emojis: string[];
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
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

export interface HealthItem {
  key: string;
  label: string;
  tip: string;
  points: number;
  check: (cfg: VitrineConfig) => boolean;
}

export const HEALTH_ITEMS: HealthItem[] = [
  { key: "avatar",       label: "Foto de perfil",       tip: "Perfis com foto recebem 80% mais cliques",          points: 15, check: cfg => !!cfg.avatarUrl },
  { key: "name-bio",     label: "Nome e bio",           tip: "Complete seu perfil para gerar confiança",           points: 10, check: cfg => !!(cfg.displayName && cfg.bio) },
  { key: "theme",        label: "Tema escolhido",       tip: "Um visual consistente reforça sua marca",            points: 10, check: cfg => !!cfg.theme },
  { key: "products",     label: "Pelo menos 1 produto", tip: "Produtos ativos geram receita direta",              points: 20, check: cfg => cfg.products.filter(p => p.active).length > 0 },
  { key: "links",        label: "Links adicionados",    tip: "Conecte suas redes para ampliar seu alcance",        points: 15, check: cfg => cfg.links.length > 0 },
  { key: "testimonials", label: "Depoimentos",          tip: "Prova social aumenta conversão em até 72%",          points: 15, check: cfg => cfg.testimonials.length > 0 },
  { key: "whatsapp",     label: "WhatsApp conectado",   tip: "Contato direto converte 3x mais que formulários",    points: 15, check: cfg => !!cfg.whatsapp },
];

// ── Utility functions ─────────────────────────────────────────────────────

export function calcHealth(cfg: VitrineConfig): number {
  return HEALTH_ITEMS.reduce((s, item) => s + (item.check(cfg) ? item.points : 0), 0);
}

export function isValidUrl(url: string): boolean {
  if (!url) return false;
  try { new URL(url); return true; } catch { return false; }
}

export function isScheduledActive(item: { startsAt?: string; endsAt?: string }): boolean {
  const now = new Date();
  if (item.startsAt && new Date(item.startsAt) > now) return false;
  if (item.endsAt && new Date(item.endsAt) < now) return false;
  return true;
}

export function getDynamicSubtitle(cfg: VitrineConfig): { text: string; complete: boolean } {
  if (!cfg.avatarUrl) return { text: "Adicione uma foto de perfil para personalizar sua vitrine", complete: false };
  if (cfg.products.length === 0) return { text: "Crie seu primeiro produto e comece a vender", complete: false };
  if (cfg.links.length === 0) return { text: "Adicione seus links e conecte suas redes sociais", complete: false };
  if (cfg.testimonials.length === 0) return { text: "Depoimentos aumentam conversão em 72% — adicione um", complete: false };
  return { text: "Sua vitrine está completa e no ar!", complete: true };
}

export function autoCompleteUrl(icon: string, raw: string): string {
  const handle = raw.replace(/^@/, "").trim();
  if (!handle || raw.startsWith("http")) return raw;
  const map: Record<string, string> = {
    instagram: `https://instagram.com/${handle}`,
    youtube: `https://youtube.com/@${handle}`,
    twitter: `https://x.com/${handle}`,
  };
  return map[icon] || raw;
}

export function generateBlocks(cfg: VitrineConfig): VitrineBlock[] {
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

export function emptyProduct(): ProductItem {
  return {
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
  };
}

export function emptyLink(isSocial: boolean): LinkItem {
  return {
    id: Date.now().toString(),
    title: "", url: "",
    icon: isSocial ? "instagram" : "globe",
    active: true, isSocial, type: "normal",
  };
}

export function emptyTestimonial(): TestimonialItem {
  return {
    id: Date.now().toString(),
    name: "", role: "", text: "", stars: 5, avatar: "", screenshotUrl: "",
  };
}
