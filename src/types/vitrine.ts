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
  buttonRadius: number;

  // Profile photo
  profileShape: ProfileShape;
  profileBorder: boolean;
  profileBorderColor: string;
  profileSize: number;

  // Layout
  layout?: "stack" | "cards" | "grid" | "bento" | "magazine" | "minimal";

  // Effects
  hideWatermark: boolean;
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

export interface VitrineBlock {
  id: string;
  type: "product" | "link" | "testimonial" | "header";
  refId?: string;
  title?: string;
  separatorStyle?: SeparatorStyle;
  separatorIcon?: string;
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
