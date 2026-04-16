// ── Vitrine Types ─────────────────────────────────────────────────────────

export type ThemeId = "dark-purple" | "midnight" | "forest" | "rose" | "amber" | "ocean"
  | "neon-pink" | "sunset" | "lavender" | "emerald" | "crimson" | "arctic"
  | "gold" | "sage" | "coral" | "indigo" | "slate" | "wine"
  | "white" | "cream" | "pure-black" | "bold-red"
  | "custom";

export type BgType = "solid" | "gradient" | "image" | "video" | "pattern" | "effect";
export type GradientDir = "to-b" | "to-t" | "to-r" | "to-l" | "to-br" | "to-bl" | "to-tr" | "to-tl" | "radial";
export type ButtonShape = "rounded" | "pill" | "square" | "soft";
export type ButtonFill = "solid" | "outline" | "glass" | "ghost";
export type ButtonShadow = "none" | "sm" | "md" | "glow";
export type ProfileShape = "circle" | "rounded" | "square" | "hexagon";
export type FontFamily = string;
export type HeroLayout = "classic" | "hero-banner" | "side-by-side" | "minimal-top" | "full-cover";
export type ProductDisplayStyle = "callout" | "compact" | "expanded";

export interface DesignConfig {
  // Background
  bgType: BgType;
  bgColor: string;
  bgGradient: [string, string];
  bgGradientDir: GradientDir;
  bgImageUrl: string;
  bgVideoUrl: string;
  bgPattern: string;
  bgOverlay: number;
  bgBlur: number;
  bgEffect: string;
  bgImageZoom: number;    // 100 = normal, 150 = 1.5x zoom, etc.
  bgImagePosX: number;    // 0-100 (percentual, 50 = centro)
  bgImagePosY: number;    // 0-100 (percentual, 50 = centro)

  // Colors
  textColor: string;
  subtextColor: string;
  nameColor: string;           // display name color (independent from product titles)
  productTitleColor: string;   // product title color
  urgencyBadgeBg: string;      // urgency countdown badge background
  urgencyBadgeText: string;    // urgency countdown badge text
  priceColor: string;          // product price color
  originalPriceColor: string;  // strikethrough price color
  descriptionColor: string;    // product description color
  socialIconStyle: "brand" | "theme" | "custom"; // social icon coloring mode
  socialIconCustomColor: string; // custom social icon color (when style=custom)
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
  buttonRadius: number;

  // Cover image (banner at top of profile)
  coverImageUrl: string;         // cover/banner image URL
  coverOverlay: number;          // darken overlay 0-90
  coverZoom: number;             // zoom 100-300%
  coverPosX: number;             // horizontal position 0-100%
  coverPosY: number;             // vertical position 0-100%

  // Profile photo
  profileShape: ProfileShape;
  profileBorder: boolean;
  profileBorderColor: string;
  profileGlow: boolean;          // glow/shadow behind profile photo
  profileGlowColor: string;     // color of the glow (empty = same as borderColor)
  profileSize: number;

  // Layout
  layout?: "stack" | "cards" | "grid" | "bento" | "magazine" | "minimal";
  heroLayout?: HeroLayout;
  productDisplayStyle?: ProductDisplayStyle;

  // Text readability
  textShadow: number;         // 0=off, 1-10 intensity of text shadow for readability

  // Effects
  hideWatermark: boolean;

  // Payment / integrations (stored in design JSONB)
  mercadoPagoToken?: string;
  pixKey?: string;
  webhookUrl?: string;
  gaId?: string;
  metaPixelId?: string;
}

export interface ProductItem {
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
  bookingDuration?: number;
  bookingDays?: string[];
  bookingStart?: string;
  bookingEnd?: string;
  bookingChannel?: "whatsapp" | "google" | "calendly" | "external";
  bookingUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  /* Coupon/discount */
  couponCode?: string;
  couponDiscount?: number; // percentage (0-100) or fixed cents
  couponType?: "percent" | "fixed";
  /* Product card enhancements */
  rating?: number;        // 1-5 with decimals (e.g. 4.8)
  subtitle?: string;      // Short line visible on card
  stockCount?: number;    // Quantity in stock (e.g. 5)
}

export interface LinkItem {
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

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  text: string;
  stars: number;
  avatar: string;
  screenshotUrl?: string;
}

export type SeparatorStyle = "line" | "dots" | "gradient" | "stars" | "zigzag" | "diamond" | "wave" | "fade";

export type EmbedPlatform = "youtube" | "spotify" | "tiktok" | "soundcloud" | "custom";

export interface VitrineBlock {
  id: string;
  type: "product" | "link" | "testimonial" | "header" | "embed";
  refId?: string;
  title?: string;
  separatorStyle?: SeparatorStyle;
  separatorIcon?: string;
  /* Embed-specific fields */
  embedUrl?: string;
  embedPlatform?: EmbedPlatform;
}

export interface VitrineConfig {
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

export type TabId = "vitrine" | "perfil" | "design";

export type HealthAction = "avatar" | "name-bio" | "theme" | "products" | "links" | "testimonials" | "whatsapp";

/* ── Lead (from Supabase leads table) ── */
export interface Lead {
  id: string;
  vitrine_id: string;
  email: string;
  name: string | null;
  source: string | null;
  created_at: string;
}

/* ── Order (from Supabase orders table) ── */
export interface Order {
  id: string;
  vitrine_id: string;
  product_title: string;
  amount: number;
  buyer_email: string | null;
  buyer_name: string | null;
  payment_status: string;
  payment_method: string | null;
  mp_payment_id: string | null;
  created_at: string;
  metadata?: Record<string, unknown>;
}

/* ── Automation ── */
export type TriggerType = "compra" | "lead" | "visualizacao";
export type ActionType = "email" | "liberar" | "redirecionar";

export interface Automation {
  id: string;
  vitrine_id: string;
  name: string;
  trigger_type: TriggerType;
  action_type: ActionType;
  active: boolean;
  description: string;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/* ── Notification Preferences (stored in design JSONB) ── */
export interface NotificationPrefs {
  email: boolean;
  push: boolean;
  sales: boolean;
}

/* ── Achievement ── */
export interface Achievement {
  id: string;
  label: string;
  desc: string;
  icon: string;
  unlockedAt?: string;
}

/* ── Email Queue Item ── */
export interface EmailQueueItem {
  id: string;
  user_id: string | null;
  email: string;
  template: string;
  template_data: Record<string, unknown>;
  send_at: string;
  sent: boolean;
  sent_at: string | null;
  created_at: string;
}

/* ── Theme definition ── */
export interface ThemeDef {
  bg: string; accent: string; accent2: string;
  card: string; text: string; sub: string; border: string;
}

/* ── Embed item (used in Profile public page) ── */
export interface EmbedItem {
  id: string;
  url: string;
  platform: "youtube" | "spotify" | "tiktok" | "soundcloud" | "custom";
  title?: string;
}

/* ── Profile data (public page) ── */
export interface ProfileData {
  username: string;
  displayName: string;
  bio: string;
  avatar?: string;
  theme: ThemeId;
  design?: Partial<DesignConfig>;
  whatsapp?: string;
  links: LinkItem[];
  products: ProductItem[];
  testimonials?: TestimonialItem[];
  stats?: { label: string; value: string }[];
  embeds?: EmbedItem[];
  blocks?: VitrineBlock[];
}

/* ── Extended DesignConfig with new fields ── */
export interface DesignConfigExtended extends DesignConfig {
  notificationPrefs?: NotificationPrefs;
  domainWaitlist?: boolean;
  achievements?: string[];
  onboardingDone?: boolean;
  integrations?: Record<string, unknown>;
}
