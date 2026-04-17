/* ═══════════════════════════════════════════════════════════════════
   Design Tab — Shared Types & Constants
   ═══════════════════════════════════════════════════════════════════ */

export type ThemeId = string;
export type BgType = "solid" | "gradient" | "image" | "video" | "pattern" | "effect";
export type GradientDir = "to-b" | "to-t" | "to-r" | "to-l" | "to-br" | "to-bl" | "to-tr" | "to-tl" | "radial";
export type ButtonShape = "rounded" | "pill" | "square" | "soft";
export type ButtonFill = "solid" | "outline" | "glass" | "ghost";
export type ButtonShadow = "none" | "sm" | "md" | "glow";
export type ProfileShape = "circle" | "rounded" | "square" | "hexagon";

export interface DesignConfig {
  bgType: BgType; bgColor: string; bgGradient: [string, string]; bgGradientDir: GradientDir;
  bgImageUrl: string; bgVideoUrl: string; bgPattern: string; bgOverlay: number; bgBlur: number; bgEffect: string;
  bgImageZoom: number; bgImagePosX: number; bgImagePosY: number;
  textColor: string; subtextColor: string;
  nameColor: string; productTitleColor: string; priceColor: string;
  originalPriceColor: string; descriptionColor: string;
  urgencyBadgeBg: string; urgencyBadgeText: string;
  socialIconStyle: "brand" | "theme" | "custom"; socialIconCustomColor: string;
  cardBg: string; cardBorder: string;
  accentColor: string; accentColor2: string; fontHeading: string; fontBody: string;
  buttonShape: ButtonShape; buttonFill: ButtonFill; buttonShadow: ButtonShadow; buttonRadius: number;
  coverImageUrl: string; coverOverlay: number; coverZoom: number; coverPosX: number; coverPosY: number;
  profileShape: ProfileShape; profileBorder: boolean; profileBorderColor: string; profileGlow: boolean; profileGlowColor: string; profileSize: number;
  textShadow: number; hideWatermark: boolean; layout?: string;
  heroLayout?: "classic" | "hero-banner" | "side-by-side" | "minimal-top" | "full-cover";
  productDisplayStyle?: "callout" | "compact" | "expanded";
  /** Maximalist template header layout — propagates from applied pack for live preview sync */
  headerLayoutType?: "big-circle" | "edge-to-edge" | "floating-square" | "split-editorial" | "organic-overlap";
  /** CTA glow style — matches pack's ctaGlow for button visual effects */
  ctaGlow?: "accent" | "blue" | "none";
  /** Glass cards effect — backdrop blur on product cards for gradient templates */
  glassCards?: boolean;
  /** Social icon style in mockup: brand colors or monochrome */
  showcaseSocialStyle?: "brand" | "mono";
}

export interface ThemeDef { id: ThemeId; label: string; bg: string; accent: string; accent2: string; text?: string; sub?: string; card?: string; border?: string; }

export interface DesignTabProps {
  config: { theme: ThemeId; design?: Partial<DesignConfig>; avatarUrl: string; displayName: string; username?: string; products?: any[]; links?: any[]; blocks?: any[] };
  themes: ThemeDef[];
  defaultDesign: DesignConfig;
  updateConfig: (key: string, value: any) => void;
  onForceSave?: () => Promise<boolean>;
  highlightField?: string | null;
  themeGridRef?: React.RefObject<HTMLDivElement>;
}

/* ── Reference profiles for phone mockups ─────────── */

export interface ReferenceProfile {
  name: string; username: string; bio: string; avatar: string;
  coverImage?: string;
  verified?: boolean;
  socials: string[]; links: string[];
  products: {
    title: string;
    price: string;
    originalPrice?: string;
    discount?: string;
    cta?: string;
    image?: string;
  }[];
  stats?: { value: string; label: string }[];
}

const U = (id: string, w = 200, h = 200, crop = "center") =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&crop=${crop}&q=80`;

export const REFERENCE_PROFILES: ReferenceProfile[] = [
  /* 0 — Designer */ { name: "Ana Beatriz", username: "@anabeatriz", bio: "Transformo marcas em experiencias inesqueciveis 🎨",
    avatar: U("photo-1580489944761-15a19d654956", 300, 300, "face"),
    socials: ["ig", "tt", "yt"], links: ["Ver portfolio completo →", "Agendar mentoria gratuita →", "Baixar ebook gratis →"],
    products: [
      { title: "Ebook Design Systems", price: "R$ 47", image: U("photo-1558655146-9f40138edfeb", 200, 150, "center") },
      { title: "Mentoria Criativa 1:1", price: "R$ 197", image: U("photo-1561070791-2526d30994b5", 200, 150, "center") },
      { title: "Pack UI Kit Premium", price: "R$ 89", image: U("photo-1542744094-3a31f272c490", 200, 150, "center") },
    ],
    stats: [{ value: "12.4k", label: "alunos" }, { value: "4.9", label: "⭐" }, { value: "320+", label: "projetos" }] },
  /* 1 — Fitness */ { name: "Lucas Santos", username: "@lucassantos", bio: "Transformo corpos e mentes em 12 semanas 💪",
    avatar: U("photo-1568602471122-7832951cc4c5", 300, 300, "face"),
    socials: ["ig", "yt", "wa"], links: ["Falar no WhatsApp →", "Baixar treino gratis →", "Agendar avaliacao →"],
    products: [
      { title: "Plano de Treino 12 Semanas", price: "R$ 97", image: U("photo-1534438327276-14e5300c3a48", 200, 150, "center") },
      { title: "Consultoria Nutricional", price: "R$ 67", image: U("photo-1571019613454-1cb2f99b2d8b", 200, 150, "center") },
      { title: "Desafio 21 Dias", price: "R$ 29", image: U("photo-1583454110551-21f2fa2afe61", 200, 150, "center") },
    ],
    stats: [{ value: "+3.2k", label: "alunos" }, { value: "4.9", label: "⭐" }, { value: "8 anos", label: "exp." }] },
  /* 2 — Fotografa */ { name: "Camila Rocha", username: "@camilarocha", bio: "Transformando momentos em arte desde 2016 📸",
    avatar: U("photo-1573496359142-b8d87734a5a2", 300, 300, "face"),
    socials: ["ig", "tt", "pin"], links: ["Agendar ensaio →", "Ver portfolio completo →", "Baixar presets gratis →"],
    products: [
      { title: "Pack 80 Presets Pro", price: "R$ 49", image: U("photo-1452587925148-ce544e77e70d", 200, 150, "center") },
      { title: "Curso Fotografia Completo", price: "R$ 197", image: U("photo-1542038784456-1ea8e935640e", 200, 150, "center") },
      { title: "Ensaio Fotografico", price: "R$ 350", image: U("photo-1471341971476-ae15ff5dd4ea", 200, 150, "center") },
    ],
    stats: [{ value: "+500", label: "ensaios" }, { value: "5.0", label: "⭐" }, { value: "10", label: "premios" }] },
  /* 3 — Dev */ { name: "Pedro Mendes", username: "@pedromendes", bio: "Criando SaaS que faturam enquanto durmo 🚀",
    avatar: U("photo-1519085360753-af0119f7cbe7", 300, 300, "face"),
    socials: ["gh", "tw", "li"], links: ["Baixar template gratis →", "Agendar mentoria →", "Newsletter semanal →"],
    products: [
      { title: "Template SaaS Next.js", price: "R$ 129", image: U("photo-1555066931-4365d14bab8c", 200, 150, "center") },
      { title: "Mentoria Dev Pro", price: "R$ 297", image: U("photo-1517694712202-14dd9538aa97", 200, 150, "center") },
      { title: "Curso API & Backend", price: "R$ 197", image: U("photo-1461749280684-dccba630e2f6", 200, 150, "center") },
    ],
    stats: [{ value: "10.8k", label: "devs" }, { value: "4.9", label: "⭐" }, { value: "5", label: "SaaS" }] },
  /* 4 — Artista */ { name: "Julia Lima", username: "@julialima", bio: "Cada traco conta uma historia ✨",
    avatar: U("photo-1487412720507-e7ab37603c6f", 300, 300, "face"),
    socials: ["ig", "be", "tt"], links: ["Encomendar arte →", "Ver galeria completa →", "Baixar wallpapers →"],
    products: [
      { title: "Print Pack Exclusivo", price: "R$ 39", image: U("photo-1513364776144-60967b0f800f", 200, 150, "center") },
      { title: "Ilustracao Custom", price: "R$ 450", image: U("photo-1460661419201-fd4cecdf8a8b", 200, 150, "center") },
      { title: "Curso Ilustracao Digital", price: "R$ 149", image: U("photo-1579762715118-a6f1d789a37e", 200, 150, "center") },
    ],
    stats: [{ value: "+2.1k", label: "comissoes" }, { value: "5.0", label: "⭐" }, { value: "4.2M", label: "views" }] },

  /* ── Vitrines Prontas (Showcase Premium) — referência Stan Store ── */

  /* 5 — Finanças (Mateus) */ { name: "Mateus Cavalcanti", username: "@mateus.financas",
    bio: "Estratégia e liberdade financeira 💰", verified: true,
    avatar: U("photo-1472099645785-5658abf4ff4e", 400, 500, "face"),
    socials: ["yt", "li", "ig"],
    links: ["Consultoria VIP →", "Baixar guia grátis →"],
    products: [
      { title: "Consultoria VIP", price: "R$ 497", cta: "Quero agora",
        image: U("photo-1563013544-824ae1b704d3", 600, 400, "center") },
      { title: "Guia de Investimentos", price: "R$ 60", originalPrice: "R$ 120", discount: "50% OFF",
        cta: "Quero agora",
        image: U("photo-1579621970588-a35d0e7ab9b6", 300, 200, "center") },
    ],
    stats: [{ value: "R$12M", label: "Faturados" }, { value: "4.9", label: "⭐" }, { value: "2.1k", label: "Alunos" }] },

  /* 6 — DJ (Léo) */ { name: "Léo Dantas", username: "@leodantas.dj",
    bio: "Transformando eventos em experiências 🎧", verified: true,
    avatar: U("photo-1539571696357-5a69c17a67c6", 400, 500, "face"),
    socials: ["tt", "ig", "yt", "li"],
    links: ["Kit de Beats", "Mentoria para DJs"],
    products: [
      { title: "Kit de Beats Premium", price: "R$ 297", cta: "Baixar Pack",
        image: U("photo-1516280440614-37939bbacd81", 600, 400, "center") },
      { title: "Mentoria para DJs", price: "R$ 497", cta: "Agendar",
        image: U("photo-1493225457124-a3eb161ffa5f", 300, 200, "center") },
    ],
    stats: [{ value: "500+", label: "Shows" }, { value: "4.9", label: "⭐" }, { value: "3 anos", label: "exp" }] },

  /* 7 — Beleza (Beatriz) — CENTRAL */ { name: "Beatriz Lins", username: "@beatrizlins.glow",
    bio: "Especialista em beleza natural e autocuidado.", verified: true,
    avatar: U("photo-1494790108377-be9c29b29330", 500, 600, "face"),
    coverImage: U("photo-1522337360788-8b13dee7a37e", 600, 400, "center"),
    socials: ["pin", "ig", "tt", "li"],
    links: ["Natural Glow Guide", "Rotina de Skincare"],
    products: [
      { title: "Natural Glow Guide", price: "R$ 80/mês", cta: "Inscrever-se",
        image: U("photo-1556228453-efd6c1ff04f6", 600, 400, "center") },
      { title: "Rotina de Skincare", price: "R$ 80", originalPrice: "R$ 120", discount: "5% OFF",
        cta: "Quero agora",
        image: U("photo-1570172619644-dfd03ed5d881", 300, 200, "center") },
    ],
    stats: [{ value: "+18k", label: "Seguidores" }, { value: "4.9", label: "⭐" }, { value: "R$450k", label: "Faturados" }] },

  /* 8 — Branding (Isabela) */ { name: "Isabela Rios", username: "@isabelarios.brand",
    bio: "Branding e posicionamento premium ✨", verified: true,
    avatar: U("photo-1573496359142-b8d87734a5a2", 400, 500, "face"),
    socials: ["ig", "pin", "tt", "li"],
    links: ["The Brand Blueprint", "Sessão de Estratégia"],
    products: [
      { title: "The Brand Blueprint", price: "R$ 10", originalPrice: "R$ 20",
        cta: "Agendar",
        image: U("photo-1586282391129-76a6df230234", 600, 400, "center") },
      { title: "Sessão de Estratégia", price: "R$ 497", cta: "Agendar",
        image: U("photo-1561070791-2526d30994b5", 300, 200, "center") },
    ],
    stats: [{ value: "+120k", label: "Seguidores" }, { value: "5.0", label: "⭐" }, { value: "8 anos", label: "exp" }] },

  /* 9 — Growth (Vitor) */ { name: "Vitor Meireles", username: "@vitor.growth",
    bio: "Escalando negócios no digital 🚀", verified: true,
    avatar: U("photo-1531427186611-ecfd6d936c79", 500, 600, "face"),
    coverImage: U("photo-1531427186611-ecfd6d936c79", 600, 400, "center"),
    socials: ["yt", "ig", "tt", "li"],
    links: ["Mentoria Growth", "Guia grátis"],
    products: [
      { title: "Mentoria Growth 1:1", price: "R$ 997", originalPrice: "R$ 1997",
        cta: "Mentoria VIP",
        image: U("photo-1590602847861-f357a9332bbc", 600, 400, "center") },
      { title: "Guia de Monetização", price: "Grátis", cta: "Baixar",
        image: U("photo-1533174072545-7a4b6ad7a6c3", 300, 200, "center") },
    ],
    stats: [{ value: "+850", label: "Negócios" }, { value: "4.8", label: "⭐" }, { value: "R$4M", label: "Faturados" }] },

  /* 10 — Moda (Julia) */ { name: "Julia Martins", username: "@julia.moda_premium",
    bio: "Estilista e consultora de imagem. Especialista em estilo autoral e tendências de luxo.",
    verified: true,
    avatar: U("photo-1488426862026-3ee34a7d66df", 500, 600, "face"),
    coverImage: U("photo-1529626455594-4ff0802cfb7e", 600, 400, "center"),
    socials: ["ig", "pin", "tt", "li"],
    links: ["Análise de Coloração", "Mentoria Online"],
    products: [
      { title: "Análise de Coloração Pessoal", price: "R$ 297", cta: "Comprar",
        image: U("photo-1522335789203-aabd1fc54bc9", 600, 400, "center") },
      { title: "Mentoria de Imagem Online", price: "R$ 497", cta: "Agendar",
        image: U("photo-1490481651871-ab68de25d43d", 300, 200, "center") },
    ],
    stats: [{ value: "30k", label: "Seguidores" }, { value: "4.7", label: "⭐" }, { value: "55", label: "Clientes VIP" }] },

  /* 11 — Fotografia (Lucas) */ { name: "Lucas Pereira", username: "@lucas.perfil_critico",
    bio: "Fotógrafo de retrato e lifestyle. Capture a essência do seu momento com olhar autêntico.",
    verified: true,
    avatar: U("photo-1507003211169-0a1dd7228f2d", 500, 600, "face"),
    socials: ["ig", "pin", "tt", "li"],
    links: ["Ensaio Corporativo", "Guia de Luz Natural"],
    products: [
      { title: "Ensaio Corporativo", price: "R$ 497", cta: "Ver Portfolio",
        image: U("photo-1519085360753-af0119f7cbe7", 600, 400, "center") },
      { title: "Guia de Luz Natural", price: "R$ 97", cta: "Quero agora",
        image: U("photo-1513151233558-d860c5398176", 300, 200, "center") },
    ],
    stats: [{ value: "200+", label: "Ensaios" }, { value: "5.0", label: "⭐" }, { value: "15k", label: "Alcance" }] },

  /* 12 — Wellness (Clínica Serenity) */ { name: "Clínica Serenity", username: "@clinica.serenity_estetica",
    bio: "Medicina integrativa e estética regenerativa. Cuide do seu corpo e mente com excelência.",
    verified: true,
    avatar: U("photo-1559839734-2b71ea197ec2", 500, 600, "face"),
    socials: ["ig", "pin", "yt", "li"],
    links: ["Consulta Integrativa", "Tratamento Premium"],
    products: [
      { title: "Consulta Integrativa", price: "R$ 380", cta: "Falar com Especialista",
        image: U("photo-1544367567-0f2fcb009e0b", 600, 400, "center") },
      { title: "Tratamento Estético Premium", price: "R$ 890", cta: "Agendar",
        image: U("photo-1540555700478-4be289fbecef", 300, 200, "center") },
    ],
    stats: [{ value: "5k", label: "Atendimentos" }, { value: "4.8", label: "⭐" }, { value: "92%", label: "Satisfação" }] },
];

/* ── Design Packs ─────────────────────────────────── */

export interface SampleProduct { title: string; price?: string; emoji?: string; }
export interface SampleLink { title: string; type?: "link" | "spotlight"; icon?: string; }

export interface DesignPack {
  id: string; label: string; desc: string;
  category: "dark" | "light" | "animated" | "minimal" | "bold" | "showcase";
  preview: { bg: string; accent: string; accent2: string };
  config: { theme: string; design: Partial<DesignConfig> };
  refIdx: number;
  /** Social icon style — "brand" uses brand colors (IG pink, YT red), "mono" uses nameColor */
  socialIconStyle?: "brand" | "mono";
  /** Enable frosted glass (glassmorphism) on product cards — for gradient/colorful templates */
  glassCards?: boolean;
  /** Add blue tech glow behind CTAs — for "luxury tech" feel */
  ctaGlow?: "accent" | "blue" | "none";
  /** Header layout style for showcase v6.0 — determines profile hero architecture */
  headerLayoutType?: "big-circle" | "edge-to-edge" | "floating-square" | "split-editorial";
  /** Sample content for showcase packs — populated when user has no products */
  sampleProducts?: SampleProduct[];
  sampleLinks?: SampleLink[];
}

export const DESIGN_PACKS: DesignPack[] = [

  /* ── Vitrines Prontas (Showcase Premium) — 8 templates, ordem: Lucas, Mateus, Léo, Beatriz (centro), Isabela, Vitor, Julia, Serenity ── */

  /* 0 — Fotografia Edge-to-Edge (Lucas) */
  { id: "showcase-fotografia", label: "Fotografia", desc: "Crisp portfolio clean", category: "showcase", refIdx: 11,
    socialIconStyle: "mono", ctaGlow: "accent", headerLayoutType: "edge-to-edge",
    sampleProducts: [
      { title: "Ensaio Corporativo", price: "R$ 497", emoji: "📸" },
      { title: "Guia de Luz Natural", price: "R$ 97", emoji: "📖" },
    ],
    sampleLinks: [{ title: "Ensaio Corporativo", type: "spotlight" }, { title: "Guia de Luz Natural", type: "link" }],
    preview: { bg: "#ffffff", accent: "#1a1a1a", accent2: "#737373" },
    config: { theme: "white", design: {
      bgType: "solid", bgColor: "#ffffff",
      buttonShape: "rounded", buttonFill: "solid", buttonShadow: "sm", buttonRadius: 12,
      fontHeading: "Plus Jakarta Sans", fontBody: "Plus Jakarta Sans",
      profileShape: "circle", profileBorder: false, profileSize: 84,
      accentColor: "#1a1a1a", accentColor2: "#737373",
      textColor: "#0a0a0a", subtextColor: "#737373",
      nameColor: "#0a0a0a", productTitleColor: "#0a0a0a",
      priceColor: "#0a0a0a", originalPriceColor: "rgba(0,0,0,0.35)",
      descriptionColor: "#737373",
      cardBg: "#fafafa", cardBorder: "rgba(0,0,0,0.06)",
      heroLayout: "full-cover", productDisplayStyle: "expanded",
    }}
  },

  /* 1 — Finanças Royal Blue (Mateus) */
  { id: "showcase-financas", label: "Finanças", desc: "Wealth management tech", category: "showcase", refIdx: 5,
    socialIconStyle: "mono", ctaGlow: "accent", headerLayoutType: "big-circle",
    sampleProducts: [
      { title: "Consultoria VIP", price: "R$ 497", emoji: "📊" },
      { title: "Guia de Investimentos", price: "R$ 60", emoji: "📗" },
    ],
    sampleLinks: [{ title: "Consultoria VIP", type: "spotlight" }, { title: "Baixar guia grátis", type: "link" }],
    preview: { bg: "#ffffff", accent: "#1E5BFF", accent2: "#4A8DFF" },
    config: { theme: "white", design: {
      bgType: "solid", bgColor: "#ffffff",
      buttonShape: "rounded", buttonFill: "solid", buttonShadow: "md", buttonRadius: 12,
      fontHeading: "Plus Jakarta Sans", fontBody: "Plus Jakarta Sans",
      profileShape: "circle", profileBorder: true, profileBorderColor: "#1E5BFF", profileGlow: true, profileGlowColor: "#1E5BFF",
      profileSize: 96,
      accentColor: "#1E5BFF", accentColor2: "#4A8DFF",
      textColor: "#0f172a", subtextColor: "#64748b",
      nameColor: "#0f172a", productTitleColor: "#0f172a",
      priceColor: "#0f172a", originalPriceColor: "rgba(15,23,42,0.35)",
      descriptionColor: "#64748b",
      cardBg: "#fafbfc", cardBorder: "rgba(30,91,255,0.12)",
      heroLayout: "classic", productDisplayStyle: "expanded",
    }}
  },

  /* 2 — DJ Full-Bleed Header (Léo) */
  { id: "showcase-dj", label: "DJ", desc: "Full-bleed glass cyber", category: "showcase", refIdx: 6,
    socialIconStyle: "brand", glassCards: true, ctaGlow: "accent", headerLayoutType: "edge-to-edge",
    sampleProducts: [
      { title: "Kit de Beats Premium", price: "R$ 297", emoji: "🎵" },
      { title: "Mentoria para DJs", price: "R$ 497", emoji: "🎧" },
    ],
    sampleLinks: [{ title: "Meu kit de beats", type: "spotlight" }, { title: "Agendar sessão", type: "link" }],
    preview: { bg: "#ec4899", accent: "#ffffff", accent2: "#fbbf24" },
    config: { theme: "neon-pink", design: {
      bgType: "gradient", bgGradient: ["#ec4899", "#8b5cf6"], bgGradientDir: "to-br",
      buttonShape: "pill", buttonFill: "glass", buttonShadow: "md", buttonRadius: 999,
      fontHeading: "Plus Jakarta Sans", fontBody: "Plus Jakarta Sans",
      profileShape: "circle", profileBorder: true, profileBorderColor: "#ffffff",
      profileGlow: true, profileGlowColor: "#ffffff", profileSize: 80,
      accentColor: "#ffffff", accentColor2: "#fbbf24",
      textColor: "#ffffff", subtextColor: "rgba(255,255,255,0.88)",
      nameColor: "#ffffff", productTitleColor: "#ffffff",
      priceColor: "#ffffff", originalPriceColor: "rgba(255,255,255,0.55)",
      descriptionColor: "rgba(255,255,255,0.85)",
      cardBg: "rgba(255,255,255,0.14)", cardBorder: "rgba(255,255,255,0.22)",
      textShadow: 1,
      heroLayout: "full-cover", productDisplayStyle: "expanded",
    }}
  },

  /* 3 — Beleza Glass Luxury (Beatriz — CENTRAL) */
  { id: "showcase-beleza", label: "Beleza", desc: "Rosa pastel luxury", category: "showcase", refIdx: 7,
    socialIconStyle: "brand", glassCards: true, ctaGlow: "accent", headerLayoutType: "floating-square",
    sampleProducts: [
      { title: "Rotina de Skincare", price: "R$ 80", emoji: "🌸" },
      { title: "Guia do Brilho Natural", price: "R$ 80/mês", emoji: "✨" },
    ],
    sampleLinks: [{ title: "Rotina de Skincare", type: "spotlight" }, { title: "Guia do Brilho", type: "link" }],
    preview: { bg: "#fce7f3", accent: "#be185d", accent2: "#d4a373" },
    config: { theme: "rose", design: {
      bgType: "solid", bgColor: "#fce7f3",
      buttonShape: "soft", buttonFill: "solid", buttonShadow: "md", buttonRadius: 14,
      fontHeading: "Plus Jakarta Sans", fontBody: "Plus Jakarta Sans",
      profileShape: "circle", profileBorder: false, profileSize: 80,
      accentColor: "#be185d", accentColor2: "#d4a373",
      textColor: "#1a1a1a", subtextColor: "#78716c",
      nameColor: "#1a1a1a", productTitleColor: "#1a1a1a",
      priceColor: "#1a1a1a", originalPriceColor: "rgba(0,0,0,0.40)",
      descriptionColor: "#78716c",
      cardBg: "rgba(255,255,255,0.65)", cardBorder: "rgba(190,24,93,0.12)",
      heroLayout: "full-cover", productDisplayStyle: "expanded",
    }}
  },

  /* 4 — Branding Luxury Cream (Isabela) */
  { id: "showcase-branding", label: "Branding", desc: "Creme minimal premium", category: "showcase", refIdx: 8,
    socialIconStyle: "mono", ctaGlow: "accent", headerLayoutType: "split-editorial",
    sampleProducts: [
      { title: "O Mapa da Marca", price: "R$ 10", emoji: "🗺️" },
      { title: "Sessão de Estratégia", price: "R$ 497", emoji: "💼" },
    ],
    sampleLinks: [{ title: "O Mapa da Marca", type: "spotlight" }, { title: "Sessão de Estratégia", type: "link" }],
    preview: { bg: "#faf5ef", accent: "#1a1a1a", accent2: "#78350f" },
    config: { theme: "cream", design: {
      bgType: "solid", bgColor: "#faf5ef",
      buttonShape: "rounded", buttonFill: "solid", buttonShadow: "sm", buttonRadius: 10,
      fontHeading: "Cormorant Garamond", fontBody: "Plus Jakarta Sans",
      profileShape: "circle", profileBorder: false, profileSize: 84,
      accentColor: "#1a1a1a", accentColor2: "#78350f",
      textColor: "#1a1a1a", subtextColor: "#78716c",
      nameColor: "#1a1a1a", productTitleColor: "#1a1a1a",
      priceColor: "#1a1a1a", originalPriceColor: "rgba(0,0,0,0.40)",
      descriptionColor: "#78716c",
      cardBg: "#ffffff", cardBorder: "rgba(0,0,0,0.06)",
      heroLayout: "side-by-side", productDisplayStyle: "compact",
    }}
  },

  /* 5 — Growth Tech Maverick Dark (Vitor) */
  { id: "showcase-growth", label: "Growth", desc: "Dark tech maverick", category: "showcase", refIdx: 9,
    socialIconStyle: "mono", ctaGlow: "blue", headerLayoutType: "big-circle",
    sampleProducts: [
      { title: "Mentoria Growth 1:1", price: "R$ 997", emoji: "🚀" },
      { title: "Guia de Monetização", price: "Grátis", emoji: "📘" },
    ],
    sampleLinks: [{ title: "Mentoria 1:1", type: "spotlight" }, { title: "Guia grátis", type: "link" }],
    preview: { bg: "#050607", accent: "#ffffff", accent2: "#1E5BFF" },
    config: { theme: "pure-black", design: {
      bgType: "solid", bgColor: "#050607",
      buttonShape: "rounded", buttonFill: "solid", buttonShadow: "glow", buttonRadius: 12,
      fontHeading: "Plus Jakarta Sans", fontBody: "Plus Jakarta Sans",
      profileShape: "circle", profileBorder: false, profileSize: 80,
      accentColor: "#ffffff", accentColor2: "#1E5BFF",
      textColor: "#ffffff", subtextColor: "#C9CED6",
      nameColor: "#ffffff", productTitleColor: "#ffffff",
      priceColor: "#ffffff", originalPriceColor: "rgba(201,206,214,0.45)",
      descriptionColor: "#C9CED6",
      cardBg: "rgba(255,255,255,0.05)", cardBorder: "rgba(30,91,255,0.18)",
      heroLayout: "full-cover", productDisplayStyle: "expanded",
    }}
  },

  /* 6 — Moda Luxury Editorial (Julia) */
  { id: "showcase-moda", label: "Moda", desc: "Luxury editorial autoral", category: "showcase", refIdx: 10,
    socialIconStyle: "mono", ctaGlow: "accent", headerLayoutType: "split-editorial",
    sampleProducts: [
      { title: "Análise de Coloração Pessoal", price: "R$ 297", emoji: "🎨" },
      { title: "Mentoria de Imagem Online", price: "R$ 497", emoji: "👗" },
    ],
    sampleLinks: [{ title: "Análise de Coloração", type: "spotlight" }, { title: "Mentoria Online", type: "link" }],
    preview: { bg: "#fdf6ec", accent: "#1a1a1a", accent2: "#d4a574" },
    config: { theme: "cream", design: {
      bgType: "gradient", bgGradient: ["#fdf6ec", "#f5e9d4"], bgGradientDir: "to-br",
      bgColor: "#fdf6ec",
      buttonShape: "pill", buttonFill: "solid", buttonShadow: "sm", buttonRadius: 999,
      fontHeading: "Cormorant Garamond", fontBody: "Plus Jakarta Sans",
      profileShape: "circle", profileBorder: false, profileSize: 84,
      accentColor: "#1a1a1a", accentColor2: "#d4a574",
      textColor: "#1a1a1a", subtextColor: "#78716c",
      nameColor: "#1a1a1a", productTitleColor: "#1a1a1a",
      priceColor: "#1a1a1a", originalPriceColor: "rgba(0,0,0,0.40)",
      descriptionColor: "#78716c",
      cardBg: "#ffffff", cardBorder: "rgba(212,165,116,0.20)",
      heroLayout: "hero-banner", productDisplayStyle: "expanded",
    }}
  },

  /* 7 — Wellness Clínica Serenity */
  { id: "showcase-clinica", label: "Wellness", desc: "Integrative luxury clinic", category: "showcase", refIdx: 12,
    socialIconStyle: "mono", ctaGlow: "accent", headerLayoutType: "floating-square",
    sampleProducts: [
      { title: "Consulta Integrativa", price: "R$ 380", emoji: "🌿" },
      { title: "Tratamento Estético Premium", price: "R$ 890", emoji: "💆" },
    ],
    sampleLinks: [{ title: "Consulta Integrativa", type: "spotlight" }, { title: "Tratamento Premium", type: "link" }],
    preview: { bg: "#e8f0e4", accent: "#15803d", accent2: "#a7a381" },
    config: { theme: "forest", design: {
      bgType: "solid", bgColor: "#e8f0e4",
      buttonShape: "soft", buttonFill: "solid", buttonShadow: "sm", buttonRadius: 10,
      fontHeading: "Cormorant Garamond", fontBody: "Plus Jakarta Sans",
      profileShape: "circle", profileBorder: false, profileSize: 84,
      accentColor: "#15803d", accentColor2: "#a7a381",
      textColor: "#1a2e1a", subtextColor: "#52594a",
      nameColor: "#1a2e1a", productTitleColor: "#1a2e1a",
      priceColor: "#15803d", originalPriceColor: "rgba(26,46,26,0.40)",
      descriptionColor: "#52594a",
      cardBg: "#ffffff", cardBorder: "rgba(21,128,61,0.15)",
      heroLayout: "side-by-side", productDisplayStyle: "expanded",
    }}
  },
];

export const PACK_CATEGORIES = [
  { key: "all", label: "Templates Prontos" },
];

/* ── Background ───────────────────────────────────── */

export const BG_PATTERNS = [
  { id: "dots", label: "Pontos" }, { id: "grid", label: "Grade" }, { id: "diagonal", label: "Diagonal" },
  { id: "waves", label: "Ondas" }, { id: "cross", label: "Cruz" }, { id: "hexagon", label: "Hexagono" }, { id: "noise", label: "Textura" },
];

export const BG_EFFECTS: { id: string; label: string; category: string }[] = [
  { id: "aurora", label: "Aurora", category: "glow" }, { id: "aurora-waves", label: "Aurora Ondas", category: "glow" },
  { id: "ambient-glow", label: "Brilho Ambiente", category: "glow" }, { id: "spotlight", label: "Holofote", category: "glow" },
  { id: "radial-glow", label: "Brilho Radial", category: "glow" },
  { id: "gradient-flow", label: "Gradiente Fluido", category: "gradient" }, { id: "gradient-mesh", label: "Malha Gradiente", category: "gradient" },
  { id: "gradient-shift", label: "Gradiente Shift", category: "gradient" },
  { id: "starfield", label: "Campo Estelar", category: "particle" }, { id: "floating-dots", label: "Pontos Flutuantes", category: "particle" },
  { id: "sparkles", label: "Brilhos", category: "particle" },
  { id: "wave-layers", label: "Camadas de Onda", category: "wave" }, { id: "flow-field", label: "Campo de Fluxo", category: "wave" },
  { id: "liquid", label: "Liquido", category: "wave" },
  { id: "matrix-grid", label: "Grade Matrix", category: "tech" }, { id: "pulse-grid", label: "Grade Pulsante", category: "tech" },
  { id: "scan-lines", label: "Scan Lines", category: "tech" },
  { id: "fog", label: "Nevoa", category: "atmosphere" }, { id: "smoke", label: "Fumaca", category: "atmosphere" },
  { id: "clouds", label: "Nuvens", category: "atmosphere" },
  { id: "ocean-waves", label: "Ondas", category: "motion" }, { id: "orbit-circles", label: "Orbitas", category: "motion" },
  { id: "ripple-rings", label: "Ondulacoes", category: "motion" }, { id: "morph-blobs", label: "Blobs", category: "motion" },
  { id: "orbit-rings", label: "Aneis", category: "motion" }, { id: "neon-lines", label: "Linhas Neon", category: "motion" },
  { id: "gradient-shift-hue", label: "Arco-Iris", category: "gradient" }, { id: "light-sweep", label: "Varredura", category: "glow" },
  { id: "breathing-glow", label: "Respiracao", category: "glow" }, { id: "conic-spotlight", label: "Holofote Conico", category: "glow" },
  { id: "rising-particles", label: "Particulas", category: "particle" }, { id: "noise-flicker", label: "Ruido", category: "atmosphere" },
  { id: "diagonal-shimmer", label: "Diagonal", category: "wave" },
  { id: "floating-orbs", label: "Orbes", category: "glow" }, { id: "layered-waves", label: "Ondas Camadas", category: "motion" },
  { id: "pulse-circles", label: "Circulos Pulsantes", category: "motion" },
  { id: "gradient-aurora-mesh", label: "Aurora Mesh", category: "gradient" }, { id: "stripe-gradient", label: "Stripe", category: "gradient" },
  { id: "vortex-spin", label: "Vortex", category: "motion" }, { id: "liquid-glass", label: "Vidro Liquido", category: "motion" },
  { id: "wireframe-globe", label: "Globe", category: "motion" },
];

export const EFFECT_CATEGORIES = [
  { key: "all", label: "Todos" }, { key: "glow", label: "Brilho" }, { key: "gradient", label: "Gradiente" },
  { key: "particle", label: "Particulas" }, { key: "wave", label: "Ondas" }, { key: "tech", label: "Tech" },
  { key: "atmosphere", label: "Atmosfera" }, { key: "motion", label: "Movimento" },
];

/* ── Fonts ─────────────────────────────────────────── */

export interface FontDef { name: string; category: "sans" | "serif" | "display" | "handwriting" | "mono"; }

export const GOOGLE_FONTS: FontDef[] = [
  /* ── Sans-serif (top do mercado) ── */
  { name: "Inter", category: "sans" }, { name: "Poppins", category: "sans" }, { name: "Montserrat", category: "sans" },
  { name: "Roboto", category: "sans" }, { name: "Open Sans", category: "sans" }, { name: "Lato", category: "sans" },
  { name: "Raleway", category: "sans" }, { name: "Nunito", category: "sans" }, { name: "Quicksand", category: "sans" },
  { name: "Outfit", category: "sans" }, { name: "DM Sans", category: "sans" }, { name: "Space Grotesk", category: "sans" },
  { name: "Rubik", category: "sans" }, { name: "Manrope", category: "sans" }, { name: "Plus Jakarta Sans", category: "sans" },
  { name: "Urbanist", category: "sans" }, { name: "Sora", category: "sans" }, { name: "Lexend", category: "sans" },
  { name: "Work Sans", category: "sans" }, { name: "Figtree", category: "sans" }, { name: "Geologica", category: "sans" },
  /* ── Serif ── */
  { name: "Playfair Display", category: "serif" }, { name: "Lora", category: "serif" }, { name: "Merriweather", category: "serif" },
  { name: "DM Serif Display", category: "serif" }, { name: "Cormorant Garamond", category: "serif" },
  { name: "Libre Baskerville", category: "serif" }, { name: "Crimson Text", category: "serif" },
  /* ── Display ── */
  { name: "Bebas Neue", category: "display" }, { name: "Righteous", category: "display" },
  { name: "Oswald", category: "display" }, { name: "Anton", category: "display" }, { name: "Josefin Sans", category: "display" },
  /* ── Handwriting ── */
  { name: "Pacifico", category: "handwriting" }, { name: "Satisfy", category: "handwriting" }, { name: "Dancing Script", category: "handwriting" },
  { name: "Great Vibes", category: "handwriting" }, { name: "Caveat", category: "handwriting" },
  /* ── Mono ── */
  { name: "JetBrains Mono", category: "mono" }, { name: "Fira Code", category: "mono" },
];

/** Top 12 fontes mais populares do mercado — destaque no seletor */
export const PRIMARY_FONTS = [
  "Poppins", "Montserrat", "Inter", "Roboto", "Raleway", "Lato",
  "Playfair Display", "Nunito", "Quicksand", "Outfit", "Oswald", "Open Sans",
];

export const FONT_PAIRS: Record<string, string> = {
  "Inter": "DM Sans", "Poppins": "DM Sans", "Montserrat": "Urbanist", "Outfit": "Nunito",
  "Roboto": "Open Sans", "Open Sans": "Roboto", "Lato": "Merriweather", "Raleway": "Lora",
  "Quicksand": "Nunito", "Lexend": "Inter", "Work Sans": "DM Sans", "Figtree": "Inter",
  "Geologica": "DM Sans", "Libre Baskerville": "Raleway", "Crimson Text": "Lato",
  "Oswald": "Roboto", "Anton": "Poppins", "Josefin Sans": "Quicksand",
  "Great Vibes": "Montserrat", "Caveat": "Nunito",
  "DM Sans": "Inter", "Space Grotesk": "JetBrains Mono", "Nunito": "Outfit", "Rubik": "Manrope",
  "Manrope": "Rubik", "Plus Jakarta Sans": "DM Sans", "Urbanist": "Montserrat", "Sora": "Inter",
  "Playfair Display": "Lora", "Lora": "Playfair Display", "Merriweather": "DM Sans",
  "DM Serif Display": "Manrope", "Cormorant Garamond": "Montserrat", "Bebas Neue": "Space Grotesk",
  "Righteous": "Urbanist", "Pacifico": "Poppins", "Satisfy": "Outfit",
  "Dancing Script": "DM Sans", "JetBrains Mono": "Space Grotesk", "Fira Code": "Inter",
};

export const FONT_CATEGORY_LABELS: Record<string, string> = {
  sans: "Sans-serif",
  serif: "Serifadas",
  display: "Display",
  handwriting: "Manuscritas",
  mono: "Mono",
};

/* ── Colors ────────────────────────────────────────── */

export const ACCENT_COLORS = [
  // Row 1 — Roxos & Rosas
  "#a855f7", "#8b5cf6", "#7c3aed", "#6d28d9", "#c084fc", "#ec4899", "#f472b6", "#be185d",
  // Row 2 — Vermelhos & Laranjas
  "#f43f5e", "#ef4444", "#dc2626", "#f97316", "#fb923c", "#f59e0b", "#eab308", "#fbbf24",
  // Row 3 — Verdes
  "#4ade80", "#22c55e", "#16a34a", "#10b981", "#34d399", "#059669", "#84cc16", "#a3e635",
  // Row 4 — Azuis & Cyans
  "#06b6d4", "#22d3ee", "#0ea5e9", "#3b82f6", "#2563eb", "#1d4ed8", "#6366f1", "#818cf8",
  // Row 5 — Neutros & Especiais
  "#000000", "#171717", "#404040", "#737373", "#ffffff", "#f5f5f5", "#fafafa", "#94a3b8",
];

export const SOLID_COLORS = [
  "#000000", "#0a0a0a", "#111111", "#1a1a1a", "#080612", "#05080f",
  "#050f05", "#100509", "#020c14", "#0a0010", "#1a1a2e", "#0f3460",
  "#0d1b2a", "#1b263b", "#1e1b4b", "#312e81",
];

export const GRADIENT_PRESETS: [string, string][] = [
  // Clássicos
  ["#667eea", "#764ba2"], ["#f093fb", "#f5576c"], ["#4facfe", "#00f2fe"], ["#43e97b", "#38f9d7"],
  ["#fa709a", "#fee140"], ["#a18cd1", "#fbc2eb"], ["#f6d365", "#fda085"], ["#c471f5", "#fa71cd"],
  // Modernos
  ["#0f0c29", "#302b63"], ["#200122", "#6f0000"], ["#11998e", "#38ef7d"], ["#fc5c7d", "#6a82fb"],
  ["#2193b0", "#6dd5ed"], ["#ee0979", "#ff6a00"], ["#7f00ff", "#e100ff"], ["#00c6ff", "#0072ff"],
  // Sutis & Elegantes
  ["#141e30", "#243b55"], ["#0f2027", "#2c5364"], ["#1a2a6c", "#b21f1f"], ["#232526", "#414345"],
];
