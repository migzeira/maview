import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Globe, Instagram, Youtube, Twitter, ShoppingBag,
  Link2, Share2, Check, ShoppingCart, Star,
  ArrowRight, Sparkles, MessageCircle, Quote,
  Clock, Flame, Calendar, Play, ChevronLeft, ChevronRight, X,
} from "lucide-react";

import logoSrc from "@/assets/maview-logo.png";
import { fetchByUsername, trackEvent, submitLead } from "@/lib/vitrine-sync";
import { Mail } from "lucide-react";
import PixCheckoutModal from "@/components/PixCheckoutModal";
import MercadoPagoCheckout from "@/components/MercadoPagoCheckout";
import SEO from "@/components/SEO";

/* Extracted modules */
import type { ProductItem, LinkItem, TestimonialItem, EmbedItem, ProfileData, DesignConfig } from "@/types/vitrine";
import {
  THEMES, BG_PATTERNS, resolveDesign, bgCss, profileClip, profileBorderRadius,
  buttonStyles, buttonBorderRadius, sanitizeUrl, loadGoogleFont,
} from "@/lib/profile-theme";
import EffectLayer from "@/components/profile/EffectLayer";
import BookingModal from "@/components/profile/BookingModal";
import MiniVideoPlayer from "@/components/profile/MiniVideoPlayer";
import SocialProofToast from "@/components/profile/SocialProofToast";
import { getIcon, WhatsAppIcon, BRAND_COLORS, BRAND_GRADIENTS, hasBrandGradient } from "@/components/profile/ProfileIcons";
import { useStagger } from "@/hooks/useStagger";

/* ──────────────────────────────────────────────────────────────── */
/*  Demo / mock data                                                */
/* ──────────────────────────────────────────────────────────────── */
const MOCK_PROFILES: Record<string, ProfileData> = {
  demo: {
    username: "demo",
    displayName: "Ana Beatriz",
    bio: "Criadora de conteúdo ✨ | Cursos de design e marketing digital | Ajudo criadores a monetizar",
    avatar: "https://i.pravatar.cc/200?img=47",
    theme: "dark-purple",
    whatsapp: "5511999999999",
    stats: [
      { label: "Seguidores", value: "18k" },
      { label: "Produtos",   value: "4"   },
      { label: "Avaliação",  value: "5.0" },
    ],
    products: [
      {
        id: "p1",
        title: "Curso de Design para Criadores",
        description: "Do zero ao profissional em 30 dias",
        price: "R$ 97",
        originalPrice: "R$ 197",
        emoji: "🎨",
        url: "https://exemplo.com",
        badge: "Mais vendido",
        urgency: true,
      },
      {
        id: "p2",
        title: "Ebook: Guia do Criador",
        description: "100 páginas com estratégias reais",
        price: "R$ 29",
        emoji: "📘",
        url: "https://exemplo.com",
      },
      {
        id: "p3",
        title: "Mentoria 1:1",
        description: "1 hora para transformar seu negócio",
        price: "R$ 350",
        emoji: "🎯",
        url: "https://exemplo.com",
        badge: "Só 2 vagas",
        urgency: false,
      },
    ],
    testimonials: [
      {
        name: "Mariana Costa",
        role: "Designer Freelancer",
        text: "O curso mudou minha carreira. Em 3 semanas já estava cobrando o dobro pelos meus projetos.",
        stars: 5,
        avatar: "https://i.pravatar.cc/60?img=12",
      },
      {
        name: "Rafael Souza",
        role: "Criador de Conteúdo",
        text: "Melhor investimento que fiz esse ano. O conteúdo é prático e os resultados vieram rápido.",
        stars: 5,
        avatar: "https://i.pravatar.cc/60?img=33",
      },
      {
        name: "Camila Rocha",
        role: "Empreendedora Digital",
        text: "A mentoria valeu cada centavo. Saí com um plano claro de ação para o meu negócio.",
        stars: 5,
        avatar: "https://i.pravatar.cc/60?img=9",
      },
    ],
    links: [
      { id: "l1", title: "Instagram",   url: "https://instagram.com", icon: "instagram", active: true,  isSocial: true  },
      { id: "l2", title: "YouTube",     url: "https://youtube.com",   icon: "youtube",   active: true,  isSocial: true  },
      { id: "l3", title: "Twitter / X", url: "https://twitter.com",   icon: "twitter",   active: true,  isSocial: true  },
      { id: "l4", title: "Meu Website", url: "https://exemplo.com",   icon: "globe",     active: true,  isSocial: false },
      { id: "l5", title: "Newsletter",  url: "https://exemplo.com",   icon: "link",      active: true,  isSocial: false },
    ],
  },
};

/* ──────────────────────────────────────────────────────────────── */
/*  ⏱️ COUNTDOWN de urgência                                        */
/* ──────────────────────────────────────────────────────────────── */
const useCountdown = (initialSeconds: number) => {
  const [secs, setSecs] = useState(initialSeconds);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const countdownSeed = 5400 + Math.floor((Date.now() / 86400000) % 1 * 3600); // fixed per day session

const CountdownBadge = ({ accent, badgeBg, badgeText }: { accent: string; badgeBg?: string; badgeText?: string }) => {
  const time = useCountdown(countdownSeed);
  const bg = badgeBg || "rgba(239,68,68,0.25)";
  const fg = badgeText || "#f87171";
  return (
    <span
      className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
      style={{ background: bg, color: fg, border: `1px solid ${fg}40` }}
    >
      <Clock size={11} /> {time}
    </span>
  );
};

/* ViewersBadge removed — fake counters look unprofessional */

/* ──────────────────────────────────────────────────────────────── */
/*  Main ProfilePage                                                */
/* ──────────────────────────────────────────────────────────────── */
const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile]   = useState<ProfileData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied]     = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [copyToastVisible, setCopyToastVisible] = useState(false);
  const [heroVis, setHeroVis]   = useState(false);
  const [bookingProduct, setBookingProduct] = useState<ProductItem | null>(null);
  const [pixCheckoutProduct, setPixCheckoutProduct] = useState<ProductItem | null>(null);
  const [detailProduct, setDetailProduct] = useState<ProductItem | null>(null);
  const [detailImgIdx, setDetailImgIdx] = useState(0);

  /* Email capture (legacy — kept for state cleanup) */
  const [captureEmail, setCaptureEmail] = useState("");
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  const productStagger     = useStagger(10, 220, 80);
  const linkStagger        = useStagger(10, 380, 55);
  const testimonialStagger = useStagger(10, 520, 90);

  useEffect(() => {
    (async () => {
      const slug = (username?.toLowerCase() || "").replace(/^@/, "");

      // 1️⃣ Try Supabase first (real persistent data)
      const remote = await fetchByUsername(slug);
      if (remote) {
        const migratedProducts = ((remote.products as any[]) || []).map((p: any) => {
          if (!p.images && p.imageUrl) return { ...p, images: [p.imageUrl] };
          if (!p.images) return { ...p, images: [] };
          return p;
        });
        // Extract embeds from blocks
        const remoteBlocks = ((remote as any).blocks as any[]) || [];
        const embeds: EmbedItem[] = remoteBlocks
          .filter((b: any) => b.type === "embed" && b.embedUrl)
          .map((b: any) => ({ id: b.id, url: b.embedUrl, platform: b.embedPlatform || "custom", title: b.title }));

        const dbProfile: ProfileData = {
          username: (remote.username || slug).replace(/^@/, ""),
          displayName: remote.displayName || slug,
          bio: remote.bio || "",
          avatar: remote.avatarUrl || undefined,
          theme: remote.theme || "dark-purple",
          design: (remote.design as Partial<DesignConfig>) || undefined,
          whatsapp: remote.whatsapp || undefined,
          products: migratedProducts.filter((p: any) => p.active),
          links: ((remote.links as any[]) || []).filter((l: any) => l.active),
          testimonials: (remote.testimonials as any[]) || [],
          embeds,
          stats: undefined,
        };
        setProfile(dbProfile);
        setTimeout(() => setHeroVis(true), 80);
        setLoading(false);
        // Track view event
        trackEvent(slug, "view");
        return;
      }

      // 2️⃣ Fallback: localStorage (for local dev / own profile)
      try {
        const stored = localStorage.getItem("maview_vitrine_config");
        if (stored) {
          const cfg = JSON.parse(stored);
          const cfgSlug = (cfg.username || "").toLowerCase().replace(/^@/, "");
          if (cfgSlug && (cfgSlug === slug || slug === "demo")) {
            const migratedProducts = (cfg.products || []).map((p: any) => {
              if (!p.images && p.imageUrl) return { ...p, images: [p.imageUrl] };
              if (!p.images) return { ...p, images: [] };
              return p;
            });
            const lsProfile: ProfileData = {
              username: cfg.username?.replace(/^@/, "") || cfg.username,
              displayName: cfg.displayName || cfg.username,
              bio: cfg.bio || "",
              avatar: cfg.avatarUrl || undefined,
              theme: cfg.theme || "dark-purple",
              design: cfg.design || undefined,
              whatsapp: cfg.whatsapp || undefined,
              products: migratedProducts.filter((p: any) => p.active),
              links: (cfg.links || []).filter((l: any) => l.active),
              testimonials: cfg.testimonials || [],
              stats: undefined,
            };
            setProfile(lsProfile);
            setTimeout(() => setHeroVis(true), 80);
            setLoading(false);
            return;
          }
        }
      } catch { /* fallback to mock */ }

      // 3️⃣ Fallback: mock profiles (demo page)
      const found = MOCK_PROFILES[slug];
      if (found) {
        setProfile(found);
        setTimeout(() => setHeroVis(true), 80);
      } else {
        const minimalProfile: ProfileData = {
          username: slug, displayName: slug, bio: "", theme: "dark-purple",
          links: [], products: [], testimonials: [],
        };
        setProfile(minimalProfile);
        setTimeout(() => setHeroVis(true), 80);
      }
      setLoading(false);
    })();
  }, [username]);

  /* Resolve design early (before returns) so hooks are stable */
  const baseTheme = useMemo(() => profile ? (THEMES[profile.theme] || THEMES["dark-purple"]) : THEMES["dark-purple"], [profile?.theme]);
  const rd = useMemo(() => resolveDesign(baseTheme, profile?.design), [baseTheme, profile?.design]);

  /* Text shadow for readability on image backgrounds — intensity 0-10 */
  const tShadow = rd.textShadow > 0
    ? `0 1px ${rd.textShadow * 1.5}px rgba(0,0,0,${Math.min(0.3 + rd.textShadow * 0.08, 0.95)}), 0 0 ${rd.textShadow * 3}px rgba(0,0,0,${Math.min(0.15 + rd.textShadow * 0.06, 0.7)})`
    : undefined;

  /* Load Google Fonts — must be before early returns */
  useEffect(() => {
    loadGoogleFont(rd.fontHeading);
    loadGoogleFont(rd.fontBody);
  }, [rd.fontHeading, rd.fontBody]);

  /* Dynamic SEO meta tags — updates browser tab + OG tags */
  useEffect(() => {
    if (!profile) return;
    const name = profile.displayName || profile.username;
    const desc = profile.bio || `Vitrine digital de ${name}`;
    document.title = `${name} | Maview`;
    const setMeta = (selector: string, attr: string, value: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };
    setMeta('meta[property="og:title"]', "content", `${name} | Maview`);
    setMeta('meta[property="og:description"]', "content", desc);
    setMeta('meta[name="twitter:title"]', "content", `${name} | Maview`);
    setMeta('meta[name="twitter:description"]', "content", desc);
    if (profile.avatar) {
      setMeta('meta[property="og:image"]', "content", profile.avatar);
      setMeta('meta[name="twitter:image"]', "content", profile.avatar);
    }
    return () => { document.title = "Maview — Sua vitrine digital"; };
  }, [profile]);

  /* ── Inject GA + Meta Pixel tracking scripts ── */
  useEffect(() => {
    if (!profile?.design) return;
    const d = profile.design;
    // Google Analytics
    const gaId = d.gaId;
    if (gaId && typeof gaId === "string" && gaId.startsWith("G-")) {
      const existing = document.querySelector(`script[src*="gtag/js?id=${gaId}"]`);
      if (!existing) {
        const s = document.createElement("script");
        s.async = true;
        s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(s);
        const s2 = document.createElement("script");
        s2.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`;
        document.head.appendChild(s2);
      }
    }
    // Meta Pixel
    const metaPixelId = d.metaPixelId;
    if (metaPixelId && typeof metaPixelId === "string") {
      const existing = document.querySelector('script[data-meta-pixel]');
      if (!existing) {
        const s = document.createElement("script");
        s.setAttribute("data-meta-pixel", "true");
        s.textContent = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`;
        document.head.appendChild(s);
      }
    }
  }, [profile?.design]);

  /* ── Dynamic JSON-LD structured data ── */
  useEffect(() => {
    if (!profile) return;
    const existing = document.querySelector('script[data-maview-jsonld]');
    if (existing) existing.remove();

    const personSchema: any = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": profile.displayName || profile.username,
      "url": `https://maview.lovable.app/${profile.username}`,
      "description": profile.bio || "",
    };
    if (profile.avatar) personSchema.image = profile.avatar;

    const schemas: any[] = [personSchema];

    if (profile.products && profile.products.length > 0) {
      profile.products.forEach((p: any) => {
        if (!p.price) return;
        const priceNum = String(p.price).replace(/[^\d.,]/g, "").replace(",", ".");
        schemas.push({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": p.title,
          "description": p.description || p.title,
          "image": p.images?.[0] || p.imageUrl || "",
          "offers": {
            "@type": "Offer",
            "price": priceNum,
            "priceCurrency": "BRL",
            "availability": "https://schema.org/InStock",
            "seller": { "@type": "Person", "name": profile.displayName || profile.username },
          },
        });
      });
    }

    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.setAttribute("data-maview-jsonld", "true");
    s.textContent = JSON.stringify(schemas);
    document.head.appendChild(s);

    return () => { s.remove(); };
  }, [profile]);

  /* ── Email capture handler ── */
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captureEmail || !profile?.username) return;
    setEmailSubmitting(true);
    const ok = await submitLead(profile.username, captureEmail);
    setEmailSubmitting(false);
    if (ok) {
      setEmailCaptured(true);
      trackEvent(profile.username, "lead_capture", { email: captureEmail });
    }
  };

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title: profile?.displayName, url }); }
      else { await navigator.clipboard.writeText(url); setCopied(true); setCopyToastVisible(true); setTimeout(() => { setCopied(false); setCopyToastVisible(false); }, 2500); }
    } catch { /* user cancelled or clipboard failed */ }
  }, [profile?.displayName]);

  /* Loading */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#080612" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-white/10 border-t-violet-400 rounded-full animate-spin" />
        <p className="text-white/30 text-xs font-medium">Carregando vitrine…</p>
      </div>
    </div>
  );

  /* Not found */
  if (notFound || !profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: "#080612" }}>
      <div className="absolute inset-x-0 top-0 h-64 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(168,85,247,0.15) 0%, transparent 70%)" }} />
      <img src={logoSrc} alt="Maview" className="w-12 h-12 object-contain mb-5 opacity-80" />
      <h1 className="text-white text-2xl font-bold mb-2">Perfil não encontrado</h1>
      <p className="text-white/40 text-sm mb-8">O link <span className="text-violet-400 font-mono">/{username}</span> não existe ainda.</p>
      <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white text-sm font-bold transition-all hover:brightness-110" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
        <Sparkles size={14} /> Criar minha vitrine grátis
      </Link>
    </div>
  );

  // `rd` and `baseTheme` already computed above early returns
  const t = { bg: rd.bg, accent: rd.accent, accent2: rd.accent2, card: rd.card, text: rd.text, sub: rd.sub, border: rd.border };

  /* ── Independent color layer — each text gets its own final color ── */
  const c = {
    name: rd.nameColor || rd.text,                    // display name
    bio: rd.sub,                                       // bio only
    productTitle: rd.productTitleColor || rd.text,     // product name
    productDesc: rd.descriptionColor || rd.sub,        // product description
    price: rd.priceColor || rd.text,                   // current price
    originalPrice: rd.originalPriceColor || "rgba(156,163,175,0.7)", // strikethrough price
    secondary: rd.sub,                                 // @username, stats labels, testimonial roles
  };
  const socialLinks  = profile.links.filter(l => l.active && l.isSocial);
  const regularLinks = profile.links.filter(l => l.active && !l.isSocial);

  /* Empty vitrine detection — show elegant empty state */
  const isVitrineEmpty = !profile.bio && profile.products.length === 0 && profile.links.length === 0 && profile.testimonials.length === 0 && !profile.avatar;
  if (isVitrineEmpty) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative" style={{ background: "linear-gradient(160deg, #0d0a1e 0%, #080612 50%, #0a0520 100%)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(168,85,247,0.08) 0%, transparent 60%)" }} />
      <div className="relative z-10 max-w-sm mx-auto">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl font-bold text-violet-400/60">{(profile.displayName || profile.username || "?")[0]?.toUpperCase()}</span>
        </div>
        <h1 className="text-white text-xl font-bold mb-2">@{profile.username.replace(/^@+/, "")}</h1>
        <p className="text-white/40 text-sm mb-2">Esta vitrine está sendo preparada.</p>
        <p className="text-white/25 text-xs mb-8">Em breve terá conteúdo incrível por aqui.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white text-sm font-bold transition-all hover:brightness-110 hover:shadow-xl hover:shadow-violet-500/20" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
          <Sparkles size={14} /> Crie sua própria vitrine grátis
        </Link>
        <p className="text-white/20 text-xs mt-6">maview.app</p>
      </div>
    </div>
  );

  /* Hover helpers */
  const onHoverIn  = (el: HTMLElement) => { el.style.borderColor = `${t.accent}55`; el.style.boxShadow = `0 8px 32px ${t.accent}18`; };
  const onHoverOut = (el: HTMLElement) => { el.style.borderColor = t.border; el.style.boxShadow = "none"; };

  return (
    <>
      <SEO
        title={profile.displayName || profile.username}
        description={profile.bio || `Vitrine digital de ${profile.displayName || profile.username} no Maview`}
        image={profile.avatar}
        username={profile.username}
        type="profile"
      />
    <div className="min-h-screen flex flex-col relative" style={{ ...bgCss(rd), fontFamily: `'${rd.fontBody}', sans-serif` }}>

      {/* ── BG layers: video / image / pattern / overlay ── */}
      {rd.bgType === "video" && rd.bgVideoUrl && (
        <video autoPlay loop muted playsInline className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
          style={{ filter: rd.bgBlur ? `blur(${rd.bgBlur}px)` : undefined }} src={rd.bgVideoUrl} />
      )}
      {rd.bgType === "image" && rd.bgImageUrl && (
        <div className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url(${rd.bgImageUrl})`,
            backgroundSize: rd.bgImageZoom > 100 ? `${rd.bgImageZoom}%` : "cover",
            backgroundPosition: `${rd.bgImagePosX ?? 50}% ${rd.bgImagePosY ?? 50}%`,
            backgroundRepeat: "no-repeat",
            filter: rd.bgBlur ? `blur(${rd.bgBlur}px)` : undefined,
          }} />
      )}
      {rd.bgType === "pattern" && rd.bgPattern && BG_PATTERNS[rd.bgPattern] && (
        <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: BG_PATTERNS[rd.bgPattern], backgroundRepeat: "repeat" }} />
      )}
      {/* Effect layer (21st.dev animated backgrounds) */}
      {rd.bgType === "effect" && rd.bgEffect && (
        <EffectLayer effectId={rd.bgEffect} accent={rd.accent} accent2={rd.accent2} />
      )}
      {/* Overlay (for image/video/pattern/effect) */}
      {(rd.bgType === "image" || rd.bgType === "video" || rd.bgType === "pattern" || rd.bgType === "effect") && rd.bgOverlay > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[1]" style={{ background: `rgba(0,0,0,${rd.bgOverlay / 100})` }} />
      )}

      {/* Ambient glow removed — too distracting */}

      {/* Social Proof Toast — disabled (too intrusive) */}

      {/* Copy toast */}
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg transition-all duration-300 pointer-events-none ${copyToastVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}`}
        style={{ background: t.accent, color: "#fff" }}>
        <Check size={14} />
        <span className="text-[13px] font-semibold">Link copiado!</span>
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col items-center px-4 pb-28 relative z-10" style={{ paddingTop: rd.coverImageUrl ? 0 : 48 }}>
        {/* Cover image banner */}
        {rd.coverImageUrl && (
          <div className="w-full max-w-[440px] relative mb-[-36px] rounded-b-2xl overflow-hidden" style={{ height: 140 }}>
            <div className="absolute inset-0" style={{
              backgroundImage: `url(${rd.coverImageUrl})`,
              backgroundSize: `${rd.coverZoom ?? 100}%`,
              backgroundPosition: `${rd.coverPosX ?? 50}% ${rd.coverPosY ?? 50}%`,
              backgroundRepeat: "no-repeat",
              backgroundColor: "#111",
            }} />
            {(rd.coverOverlay ?? 0) > 0 && (
              <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${(rd.coverOverlay || 0) / 100})` }} />
            )}
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 30%, ${t.bg}DD)` }} />
          </div>
        )}
        <div className="w-full max-w-[400px]">

          {/* ── HERO ── */}
          <div className="flex flex-col items-center mb-7 transition-all duration-500" style={{ opacity: heroVis ? 1 : 0, transform: heroVis ? "translateY(0)" : "translateY(12px)" }}>
            {/* Avatar */}
            {(() => {
              const glowC = rd.profileGlowColor || rd.profileBorderColor || t.accent;
              // Parse hex to rgba for reliable cross-browser glow
              const hexToRgba = (hex: string, a: number) => {
                const h = hex.replace("#", "");
                const r = parseInt(h.slice(0, 2), 16) || 0;
                const g = parseInt(h.slice(2, 4), 16) || 0;
                const b = parseInt(h.slice(4, 6), 16) || 0;
                return `rgba(${r},${g},${b},${a})`;
              };
              const showGlow = rd.profileGlow !== false;
              return (
                <div className="relative mb-4"
                  style={{
                    width: rd.profileSize, height: rd.profileSize,
                    borderRadius: profileBorderRadius(rd.profileShape),
                    boxShadow: showGlow
                      ? `0 0 28px 10px ${hexToRgba(glowC, 0.35)}, 0 0 56px 20px ${hexToRgba(glowC, 0.15)}`
                      : "none",
                  }}>
                  {profile.avatar
                    ? <img src={profile.avatar} alt={profile.displayName}
                        className="relative object-cover z-10" loading="eager" decoding="async" fetchPriority="high"
                        style={{
                          width: rd.profileSize, height: rd.profileSize,
                          borderRadius: profileBorderRadius(rd.profileShape),
                          clipPath: profileClip(rd.profileShape),
                          border: rd.profileBorder ? `2.5px solid ${hexToRgba(glowC, 0.5)}` : "none",
                        }} />
                    : <div className="relative z-10 flex items-center justify-center text-2xl font-bold text-white"
                        style={{
                          width: rd.profileSize, height: rd.profileSize,
                          borderRadius: profileBorderRadius(rd.profileShape),
                          clipPath: profileClip(rd.profileShape),
                          background: t.accent,
                        }}>{(profile.displayName || "?")[0]}</div>
                  }
                </div>
              );
            })()}

            <h1 className="text-[22px] font-extrabold mb-1 text-center tracking-tight" style={{ color: c.name, fontFamily: `'${rd.fontHeading}', sans-serif`, textShadow: tShadow }}>{profile.displayName}</h1>
            <p className="text-[13px] font-semibold mb-2" style={{ color: t.accent, textShadow: tShadow }}>@{profile.username.replace(/^@+/, "")}</p>
            {profile.bio && (
              <div className="max-w-[300px] mb-3 text-center">
                <p className={`text-[14px] leading-relaxed ${bioExpanded ? "" : "line-clamp-3"}`} style={{ color: c.bio, fontFamily: `'${rd.fontBody}', sans-serif`, textShadow: tShadow }}>{profile.bio}</p>
                {profile.bio.length > 120 && !bioExpanded && (
                  <button onClick={() => setBioExpanded(true)} className="text-[12px] font-medium mt-1 transition-colors hover:opacity-80" style={{ color: t.accent }}>
                    ver mais
                  </button>
                )}
              </div>
            )}

            {/* Viewer badge removed — unprofessional */}

            {/* Stats */}
            {profile.stats && (
              <div className="flex items-center gap-5 mb-4">
                {profile.stats.map(({ label, value }) => (
                  <div key={label} className="flex flex-col items-center">
                    <span className="text-base font-bold" style={{ color: t.text }}>{value}</span>
                    <span className="text-[11px] font-medium mt-0.5" style={{ color: t.sub }}>{label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Social + Share */}
            <div className="flex items-center gap-3">
              {socialLinks.map(link => {
                const Icon = getIcon(link.icon);
                const brandColor = BRAND_COLORS[link.icon];
                const hasGrad = hasBrandGradient(link.icon);
                const useBrand = rd.socialIconStyle !== "custom" && rd.socialIconStyle !== "theme";
                const iconColor = rd.socialIconStyle === "custom" && rd.socialIconCustomColor
                  ? rd.socialIconCustomColor
                  : rd.socialIconStyle === "theme" ? t.text
                  : (brandColor || t.text);
                const iconBg = rd.socialIconStyle === "custom" && rd.socialIconCustomColor
                  ? `${rd.socialIconCustomColor}15`
                  : rd.socialIconStyle === "theme" ? `${t.accent}15`
                  : (hasGrad && useBrand) ? BRAND_GRADIENTS[link.icon]
                  : (brandColor ? `${brandColor}18` : `${t.accent}15`);
                const iconBorder = rd.socialIconStyle === "custom" && rd.socialIconCustomColor
                  ? `1.5px solid ${rd.socialIconCustomColor}25`
                  : rd.socialIconStyle === "theme" ? `1.5px solid ${t.accent}22`
                  : (brandColor ? `1.5px solid ${brandColor}25` : `1.5px solid ${t.accent}22`);
                // For Instagram gradient bg, icon should be white
                const finalIconColor = (hasGrad && useBrand) ? "#ffffff" : iconColor;
                return (
                  <a key={link.id} href={sanitizeUrl(link.url)} target="_blank" rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95"
                    style={{ background: iconBg, border: iconBorder }} title={link.title}
                    aria-label={link.title || "Social link"}>
                    <Icon size={18} style={{ color: finalIconColor }} />
                  </a>
                );
              })}
              {/* WhatsApp as social icon */}
              {profile.whatsapp && (() => {
                const waColor = rd.socialIconStyle === "custom" && rd.socialIconCustomColor
                  ? rd.socialIconCustomColor : rd.socialIconStyle === "theme" ? t.text : "#25d366";
                const waBg = rd.socialIconStyle === "custom" && rd.socialIconCustomColor
                  ? `${rd.socialIconCustomColor}15` : rd.socialIconStyle === "theme" ? `${t.accent}15` : "rgba(37,211,102,0.15)";
                const waBorder = rd.socialIconStyle === "custom" && rd.socialIconCustomColor
                  ? `1.5px solid ${rd.socialIconCustomColor}25` : rd.socialIconStyle === "theme" ? `1.5px solid ${t.accent}22` : "1.5px solid rgba(37,211,102,0.25)";
                return (
                  <a href={`https://wa.me/${profile.whatsapp!.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95"
                    style={{ background: waBg, border: waBorder }}
                    aria-label="WhatsApp">
                    <WhatsAppIcon size={18} style={{ color: waColor }} />
                  </a>
                );
              })()}
              <button onClick={handleShare} aria-label="Compartilhar perfil"
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95"
                style={{ background: `${t.accent}15`, border: `1.5px solid ${t.accent}22` }}>
                {copied ? <Check size={17} style={{ color: "#22c55e" }} /> : <Share2 size={17} style={{ color: t.text }} />}
              </button>
            </div>
          </div>

          {/* ── DEPOIMENTOS (before products = social proof first) ── */}
          {profile.testimonials && profile.testimonials.length > 0 && (
            <section className="mb-7" aria-label="Depoimentos">
              <div className="flex items-center gap-2 mb-3">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span className="text-[13px] font-bold tracking-wide uppercase" style={{ color: t.text, opacity: 0.7 }}>Depoimentos</span>
              </div>
              <div className="space-y-2.5">
                {profile.testimonials.map((item, i) => (
                  <div key={i}
                    className="px-4 py-4"
                    style={{
                      ...buttonStyles(rd),
                      opacity: testimonialStagger[i] ? 1 : 0,
                      transform: testimonialStagger[i] ? "translateY(0)" : "translateY(8px)",
                      transition: "opacity 0.3s ease, transform 0.3s ease",
                    }}
                  >
                    <div className="flex items-center gap-0.5 mb-2">
                      {Array.from({ length: item.stars }).map((_, s) => (
                        <Star key={s} size={11} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-[14px] leading-relaxed mb-3 italic" style={{ color: t.sub }}>
                      "{item.text}"
                    </p>
                    {item.screenshotUrl && (
                      <img src={item.screenshotUrl} alt={`Captura de depoimento de ${item.name}`}
                        className="w-full rounded-lg mb-3 object-contain max-h-48 border border-white/10" loading="lazy" />
                    )}
                    <div className="flex items-center gap-2.5">
                      {item.avatar ? (
                        <img src={item.avatar} alt={item.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" loading="lazy" decoding="async" />
                      ) : (
                        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                          style={{ background: t.accent }}>
                          {item.name[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-[14px] font-bold leading-none" style={{ color: t.text }}>{item.name}</p>
                        {item.role && <p className="text-[11px] mt-0.5" style={{ color: t.sub }}>{item.role}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── PRODUTOS ── */}
          {profile.products.length > 0 && (
            <section className="mb-7" aria-label="Produtos">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag size={14} style={{ color: t.text, opacity: 0.7 }} />
                <span className="text-[13px] font-bold tracking-wide uppercase" style={{ color: t.text, opacity: 0.7 }}>Produtos</span>
              </div>
              <div className="space-y-3">
                {profile.products.map((product, i) => {
                  const isWhatsApp = product.linkType === "whatsapp";
                  const isBooking = product.linkType === "booking";
                  const isNone = product.linkType === "none";
                  const productHref = isWhatsApp && product.url
                    ? `https://wa.me/${(product.url || "").replace(/\D/g, "")}${product.whatsappMsg ? `?text=${encodeURIComponent(product.whatsappMsg)}` : ""}`
                    : (isNone || isBooking) ? undefined : sanitizeUrl(product.url);
                  const ctaLabel = product.ctaText || (isBooking ? "Agendar" : isWhatsApp ? "WhatsApp" : product.price ? "Comprar" : "Ver mais");
                  const coverImg = product.images?.[0] || product.imageUrl;
                  const hasVideo = !!product.video;

                  // Booking: calendly/external → direct link; whatsapp/google → modal
                  const bookingChannel = product.bookingChannel || "whatsapp";
                  const bookingUsesModal = isBooking && (bookingChannel === "whatsapp" || bookingChannel === "google");
                  const bookingDirectUrl = isBooking && (bookingChannel === "calendly" || bookingChannel === "external") ? sanitizeUrl(product.bookingUrl) : undefined;

                  // Payment checkout: MP token (real payments) or PIX key (QR fallback)
                  const hasMpToken = !!(profile.design?.mercadoPagoToken);
                  const hasPixKey = !!(profile.design?.pixKey);
                  const isPixEligible = !isBooking && !isNone && (hasMpToken || hasPixKey) && product.price;

                  // Always open the product detail modal first (except booking with modal)
                  const handleClick = (e: React.MouseEvent) => {
                    e.preventDefault();
                    trackEvent(profile.username, "click_product", { productId: product.id, title: product.title });
                    if (isPixEligible) { setPixCheckoutProduct(product); return; }
                    if (bookingUsesModal) { setBookingProduct(product); return; }
                    // Open product detail modal
                    setDetailImgIdx(0);
                    setDetailProduct(product);
                  };

                  const Wrapper = "button" as const;
                  const wrapperProps = { onClick: handleClick };

                  return (
                    <div key={product.id}
                      className="overflow-hidden"
                      style={{
                        ...buttonStyles(rd),
                        opacity: productStagger[i] ? 1 : 0,
                        transform: productStagger[i] ? "translateY(0)" : "translateY(8px)",
                        transition: "opacity 0.3s ease, transform 0.3s ease",
                      }}
                      onMouseEnter={(e: React.MouseEvent) => onHoverIn(e.currentTarget as HTMLElement)}
                      onMouseLeave={(e: React.MouseEvent) => onHoverOut(e.currentTarget as HTMLElement)}
                    >
                      {/* Mini video (if product has video) */}
                      {hasVideo && (
                        <div className="px-3 pt-3">
                          <MiniVideoPlayer src={product.video!} accent={t.accent} />
                        </div>
                      )}

                      {/* Card body */}
                      <Wrapper {...(wrapperProps as any)}
                        className={`group flex items-center gap-4 w-full px-4 py-4 transition-all duration-200 active:scale-[0.97] ${isBooking ? "cursor-pointer text-left" : ""}`}
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${t.accent}08`, border: `1px solid ${t.accent}10` }}>
                          {coverImg
                            ? <img src={coverImg} alt={product.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                            : product.emoji
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <p className="text-[15px] font-bold leading-snug line-clamp-2" style={{ color: c.productTitle, fontFamily: `'${rd.fontHeading}', sans-serif` }}>{product.title}</p>
                            {/* Auto "Mais vendido" badge on first product */}
                            {i === 0 && profile.products.length > 1 && !product.badge && (
                              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 flex items-center gap-0.5"
                                style={{ background: `${t.accent}15`, color: t.text, opacity: 0.85, border: `1px solid ${t.accent}20` }}>
                                <Flame size={9} /> Mais vendido
                              </span>
                            )}
                            {product.badge && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${t.accent}15`, color: t.text, opacity: 0.85, border: `1px solid ${t.accent}20` }}>
                                {product.badge}
                              </span>
                            )}
                            {isBooking && (
                              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                                style={{ background: "rgba(34,197,94,0.20)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.35)" }}>
                                Agenda online
                              </span>
                            )}
                            {product.urgency && <CountdownBadge accent={t.accent} badgeBg={rd.urgencyBadgeBg} badgeText={rd.urgencyBadgeText} />}
                          </div>
                          {product.description && <p className="text-[12px] line-clamp-2" style={{ color: c.productDesc }}>{product.description}</p>}
                          {product.price && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[13px] font-bold" style={{ color: c.price }}>{product.price}</span>
                              {product.originalPrice && <span className="text-[11px] line-through" style={{ color: c.originalPrice }}>{product.originalPrice}</span>}
                            </div>
                          )}
                          {isBooking && (
                            <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: t.sub }}>
                              <Clock size={10} /> {(product.bookingDuration || 60) >= 60 ? `${Math.floor((product.bookingDuration || 60) / 60)}h${(product.bookingDuration || 60) % 60 || ""}` : `${product.bookingDuration}min`}
                              {" · "}
                              {(product.bookingDays || []).length} dias/semana
                            </p>
                          )}
                        </div>
                        {!isNone && (
                          <div className="flex-shrink-0 flex items-center gap-1.5 px-4 py-3 min-h-[44px] text-[13px] font-semibold rounded-lg transition-colors duration-150"
                            style={{
                              borderRadius: buttonBorderRadius(rd.buttonShape, rd.buttonRadius),
                              background: isWhatsApp ? "rgba(37,211,102,0.18)" : `${t.accent}18`,
                              border: isWhatsApp ? "1px solid rgba(37,211,102,0.30)" : `1px solid ${t.accent}30`,
                              color: isWhatsApp ? "#25d366" : t.accent,
                            }}>
                            {isBooking ? <Calendar size={11} /> : isWhatsApp ? <WhatsAppIcon size={13} style={{ color: "#25d366" }} /> : <ShoppingCart size={11} />} {ctaLabel}
                          </div>
                        )}
                      </Wrapper>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── EMBEDS (YouTube, Spotify, TikTok, SoundCloud) ── */}
          {profile.embeds && profile.embeds.length > 0 && (
            <section className="space-y-3">
              {profile.embeds.map(embed => {
                const getEmbedSrc = (url: string, platform: string) => {
                  if (platform === "youtube") {
                    const m = url.match(/(?:youtu\.be\/|v=)([\w-]+)/);
                    return m ? `https://www.youtube.com/embed/${m[1]}` : null;
                  }
                  if (platform === "spotify") return url.replace("open.spotify.com/", "open.spotify.com/embed/");
                  if (platform === "tiktok") {
                    const m = url.match(/video\/(\d+)/);
                    return m ? `https://www.tiktok.com/embed/v2/${m[1]}` : null;
                  }
                  if (platform === "soundcloud") return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=false&visual=true`;
                  return null;
                };
                const src = getEmbedSrc(embed.url, embed.platform);
                if (!src) return null;
                const h = embed.platform === "youtube" ? "215" : embed.platform === "tiktok" ? "500" : embed.url?.includes("/track/") ? "80" : "152";
                return (
                  <div key={embed.id} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${t.border}` }}>
                    <iframe src={src} width="100%" height={h} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ border: "none" }} title={embed.title || embed.platform} />
                  </div>
                );
              })}
            </section>
          )}

          {/* ── LINKS ── */}
          {regularLinks.length > 0 && (
            <section aria-label="Links">
              <div className="flex items-center gap-2 mb-3">
                <Link2 size={14} style={{ color: t.text, opacity: 0.7 }} />
                <span className="text-[13px] font-bold tracking-wide uppercase" style={{ color: t.text, opacity: 0.7 }}>Links</span>
              </div>
              <div className="space-y-2">
                {regularLinks.map((link, i) => {
                  const Icon = getIcon(link.icon);
                  return (
                    <a key={link.id} href={sanitizeUrl(link.url)} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-3.5 w-full px-4 py-4 font-semibold text-[14px] active:scale-[0.98]"
                      style={{
                        ...buttonStyles(rd), color: t.text,
                        opacity: linkStagger[i] ? 1 : 0,
                        transform: linkStagger[i] ? "translateY(0)" : "translateY(6px)",
                        transition: "opacity 0.3s ease, transform 0.3s ease",
                      }}
                      onMouseEnter={e => onHoverIn(e.currentTarget as HTMLElement)}
                      onMouseLeave={e => onHoverOut(e.currentTarget as HTMLElement)}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${t.accent}12` }}>
                        <Icon size={15} style={{ color: t.text, opacity: 0.8 }} />
                      </div>
                      <span className="flex-1 truncate">{link.title}</span>
                      <ArrowRight size={14} style={{ color: t.sub, opacity: 0.75 }} className="group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                    </a>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* 💬 WhatsApp sticky — ícone redondo limpo */}
      {profile.whatsapp && (
        <a
          href={`https://wa.me/${profile.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="fixed bottom-6 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ background: "#25d366" }}
        >
          <WhatsAppIcon size={24} style={{ color: "#fff" }} />
        </a>
      )}

      {/* 📅 Booking Modal */}
      {bookingProduct && profile.whatsapp && (
        <BookingModal
          product={bookingProduct}
          whatsapp={profile.whatsapp}
          accent={t.accent}
          accent2={t.accent2}
          bg={t.bg}
          card={t.card}
          text={t.text}
          sub={t.sub}
          border={t.border}
          onClose={() => setBookingProduct(null)}
        />
      )}
      {/* Booking fallback: no whatsapp set — use product.url as whatsapp */}
      {bookingProduct && !profile.whatsapp && bookingProduct.url && (
        <BookingModal
          product={bookingProduct}
          whatsapp={bookingProduct.url}
          accent={t.accent}
          accent2={t.accent2}
          bg={t.bg}
          card={t.card}
          text={t.text}
          sub={t.sub}
          border={t.border}
          onClose={() => setBookingProduct(null)}
        />
      )}

      {/* Email capture removed — only watermark footer */}

      {/* ── Payment Checkout Modal ── */}
      {pixCheckoutProduct && profile.design?.mercadoPagoToken ? (
        <MercadoPagoCheckout
          product={pixCheckoutProduct}
          sellerAccessToken={profile.design.mercadoPagoToken}
          sellerUsername={profile.username}
          accent={t.accent}
          accent2={t.accent2}
          bg={t.bg}
          card={t.card}
          text={t.text}
          sub={t.sub}
          border={t.border}
          onClose={() => setPixCheckoutProduct(null)}
        />
      ) : pixCheckoutProduct && profile.design?.pixKey ? (
        <PixCheckoutModal
          product={pixCheckoutProduct}
          pixKey={profile.design.pixKey}
          sellerName={profile.displayName || profile.username}
          accent={t.accent}
          accent2={t.accent2}
          bg={t.bg}
          card={t.card}
          text={t.text}
          sub={t.sub}
          border={t.border}
          onClose={() => setPixCheckoutProduct(null)}
        />
      ) : null}

      {/* ── Product Detail Modal ── */}
      {detailProduct && profile && (() => {
        const dp = detailProduct;
        const isWhatsApp = dp.linkType === "whatsapp";
        const isBooking = dp.linkType === "booking";
        const dpHref = isWhatsApp && dp.url
          ? `https://wa.me/${(dp.url || "").replace(/\D/g, "")}${dp.whatsappMsg ? `?text=${encodeURIComponent(dp.whatsappMsg)}` : ""}`
          : sanitizeUrl(dp.url);
        const dpCta = dp.ctaText || (isBooking ? "Agendar agora" : isWhatsApp ? "Chamar no WhatsApp" : dp.price ? "Comprar agora" : "Ver mais");
        const allImages = (dp.images?.length ? dp.images : dp.imageUrl ? [dp.imageUrl] : []) as string[];
        const dpImg = allImages[0];
        const hasDiscount = dp.originalPrice && dp.price;

        return (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) setDetailProduct(null); }}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative w-full max-w-[460px] max-h-[94vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl animate-in slide-in-from-bottom-4 duration-300"
              style={{ background: t.bg, border: `1px solid ${t.border}` }}>

              {/* Close button */}
              <button onClick={() => setDetailProduct(null)}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: `${t.card}dd`, border: `1px solid ${t.border}`, backdropFilter: "blur(8px)" }}>
                <X size={16} style={{ color: t.text }} />
              </button>

              {/* Product images — carousel */}
              {allImages.length > 0 ? (
                <div className="relative w-full overflow-hidden rounded-t-3xl sm:rounded-t-3xl">
                  {/* Image carousel */}
                  <div className="relative" style={{ aspectRatio: "4/3" }}>
                    <img src={allImages[detailImgIdx] || allImages[0]} alt={`${dp.title} ${detailImgIdx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 50%, ${t.bg})` }} />

                    {/* Nav arrows */}
                    {allImages.length > 1 && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); setDetailImgIdx(i => i > 0 ? i - 1 : allImages.length - 1); }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                          style={{ background: `${t.bg}aa`, backdropFilter: "blur(8px)" }}>
                          <ChevronLeft size={16} style={{ color: t.text }} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setDetailImgIdx(i => i < allImages.length - 1 ? i + 1 : 0); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                          style={{ background: `${t.bg}aa`, backdropFilter: "blur(8px)" }}>
                          <ChevronRight size={16} style={{ color: t.text }} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Dots indicator */}
                  {allImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                      {allImages.map((_, idx) => (
                        <button key={idx} onClick={(e) => { e.stopPropagation(); setDetailImgIdx(idx); }}
                          className="w-2 h-2 rounded-full transition-all duration-200"
                          style={{
                            background: idx === detailImgIdx ? t.accent : `${t.text}40`,
                            transform: idx === detailImgIdx ? "scale(1.3)" : "scale(1)",
                          }} />
                      ))}
                    </div>
                  )}

                  {/* Image counter */}
                  {allImages.length > 1 && (
                    <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full text-[11px] font-semibold z-10"
                      style={{ background: `${t.bg}cc`, color: t.text, backdropFilter: "blur(8px)" }}>
                      {detailImgIdx + 1}/{allImages.length}
                    </div>
                  )}

                  {/* Discount badge */}
                  {hasDiscount && (
                    <div className="absolute top-4 right-14 px-3 py-1.5 rounded-full text-[12px] font-bold z-10"
                      style={{ background: t.accent, color: "#fff" }}>
                      {(() => {
                        const orig = parseFloat((dp.originalPrice || "").replace(/[^\d.,]/g, "").replace(",", "."));
                        const curr = parseFloat((dp.price || "").replace(/[^\d.,]/g, "").replace(",", "."));
                        if (orig && curr && orig > curr) return `-${Math.round(((orig - curr) / orig) * 100)}%`;
                        return "Oferta";
                      })()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full flex items-center justify-center text-6xl pt-10 pb-6">
                  {dp.emoji || "📦"}
                </div>
              )}

              {/* Content */}
              <div className="px-6 pb-6" style={{ marginTop: dpImg ? "-20px" : "0" }}>
                <div className="relative z-10">
                  {/* Title */}
                  <h2 className="text-[22px] font-extrabold leading-tight mb-2"
                    style={{ color: c.productTitle, fontFamily: `'${rd.fontHeading}', sans-serif` }}>
                    {dp.title}
                  </h2>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    {dp.badge && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: `${t.accent}15`, color: t.accent, border: `1px solid ${t.accent}25` }}>
                        {dp.badge}
                      </span>
                    )}
                    {dp.urgency && <CountdownBadge accent={t.accent} badgeBg={rd.urgencyBadgeBg} badgeText={rd.urgencyBadgeText} />}
                    {isBooking && (
                      <span className="text-[11px] font-bold px-2 py-1 rounded-full"
                        style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)" }}>
                        <Calendar size={10} className="inline mr-1" /> Agenda online
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {dp.description && (
                    <p className="text-[14px] leading-relaxed mb-5"
                      style={{ color: c.productDesc, fontFamily: `'${rd.fontBody}', sans-serif` }}>
                      {dp.description}
                    </p>
                  )}

                  {/* Booking info */}
                  {isBooking && (
                    <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl"
                      style={{ background: `${t.accent}08`, border: `1px solid ${t.accent}15` }}>
                      <Clock size={14} style={{ color: t.accent }} />
                      <span className="text-[13px]" style={{ color: t.sub }}>
                        {(dp.bookingDuration || 60) >= 60 ? `${Math.floor((dp.bookingDuration || 60) / 60)}h${(dp.bookingDuration || 60) % 60 || ""}` : `${dp.bookingDuration}min`}
                        {" · "}{(dp.bookingDays || []).length} dias/semana
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  {dp.price && (
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-[24px] font-extrabold" style={{ color: c.price }}>{dp.price}</span>
                      {dp.originalPrice && (
                        <span className="text-[15px] line-through" style={{ color: c.originalPrice }}>{dp.originalPrice}</span>
                      )}
                    </div>
                  )}

                  {/* CTA Button */}
                  {dp.linkType !== "none" && (
                    <a href={dpHref || "#"} target="_blank" rel="noopener noreferrer"
                      onClick={() => { trackEvent(profile.username, "click_cta", { productId: dp.id, title: dp.title }); }}
                      className="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl font-bold text-[15px] transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: isWhatsApp ? "rgba(37,211,102,0.15)" : `${t.accent}15`,
                        border: isWhatsApp ? "1.5px solid rgba(37,211,102,0.40)" : `1.5px solid ${t.accent}40`,
                        color: isWhatsApp ? "#25d366" : t.accent,
                        borderRadius: buttonBorderRadius(rd.buttonShape, rd.buttonRadius),
                      }}>
                      {isBooking ? <Calendar size={16} /> : isWhatsApp ? <WhatsAppIcon size={16} style={{ color: "#25d366" }} /> : <ShoppingCart size={16} />}
                      {dpCta}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Footer ── */}
      {!rd.hideWatermark && (
        <footer className="relative z-10 flex justify-center pb-10 pt-6">
          <Link to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-150 hover:opacity-80 hover:scale-[1.02]"
            style={{ background: t.card, border: `1px solid ${t.border}` }}
          >
            <img src={logoSrc} alt="Maview" className="w-4 h-4 object-contain" />
            <span className="text-[11px] font-semibold" style={{ color: t.sub }}>
              criado por maview.app
            </span>
          </Link>
        </footer>
      )}
    </div>
    </>
  );
};

export default ProfilePage;
