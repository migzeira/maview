import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Globe, Instagram, Youtube, Twitter, ShoppingBag,
  Link2, Share2, Check, ShoppingCart, Star,
  ArrowRight, Sparkles, MessageCircle, Quote,
  Clock, Flame,
} from "lucide-react";

import logoSrc from "@/assets/maview-logo.png";

/* ─── Types ───────────────────────────────────────────────────── */
type ThemeId = "dark-purple" | "midnight" | "forest" | "rose" | "amber" | "ocean";

interface ProductItem {
  id: string;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  emoji: string;
  imageUrl?: string;
  videoUrl?: string;
  url: string;
  linkType?: "url" | "whatsapp";
  whatsappMsg?: string;
  badge?: string;
  /** se true, mostra countdown de urgência */
  urgency?: boolean;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  active: boolean;
  isSocial?: boolean;
}

interface TestimonialItem {
  name: string;
  role: string;
  text: string;
  stars: number;
  avatar: string;
}

interface ProfileData {
  username: string;
  displayName: string;
  bio: string;
  avatar?: string;
  theme: ThemeId;
  whatsapp?: string;
  links: LinkItem[];
  products: ProductItem[];
  testimonials?: TestimonialItem[];
  stats?: { label: string; value: string }[];
}

/* ─── Themes ──────────────────────────────────────────────────── */
const THEMES: Record<ThemeId, {
  bg: string; accent: string; accent2: string;
  card: string; text: string; sub: string; border: string;
}> = {
  "dark-purple": { bg: "#080612", accent: "#a855f7", accent2: "#ec4899", card: "#13102a", text: "#f8f5ff", sub: "rgba(248,245,255,0.5)", border: "rgba(168,85,247,0.18)" },
  "midnight":    { bg: "#05080f", accent: "#60a5fa", accent2: "#818cf8", card: "#0d1524", text: "#f0f6ff", sub: "rgba(240,246,255,0.5)", border: "rgba(96,165,250,0.18)"   },
  "forest":      { bg: "#050f05", accent: "#4ade80", accent2: "#34d399", card: "#0a1a0a", text: "#f0fff4", sub: "rgba(240,255,244,0.5)", border: "rgba(74,222,128,0.18)"   },
  "rose":        { bg: "#100509", accent: "#f43f5e", accent2: "#fb7185", card: "#1e0912", text: "#fff0f3", sub: "rgba(255,240,243,0.5)", border: "rgba(244,63,94,0.18)"    },
  "amber":       { bg: "#0f0a00", accent: "#f59e0b", accent2: "#fcd34d", card: "#1f1500", text: "#fffbeb", sub: "rgba(255,251,235,0.5)", border: "rgba(245,158,11,0.18)"   },
  "ocean":       { bg: "#020c14", accent: "#06b6d4", accent2: "#22d3ee", card: "#051e30", text: "#ecfeff", sub: "rgba(236,254,255,0.5)", border: "rgba(6,182,212,0.18)"    },
};

const ICON_MAP: Record<string, any> = {
  globe: Globe, instagram: Instagram, youtube: Youtube,
  twitter: Twitter, shop: ShoppingBag, link: Link2,
};
const getIcon = (val: string) => ICON_MAP[val] || Link2;

/* ─── Mock data ─────────────────────────────────────────────────── */
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
/*  🔥 SOCIAL PROOF TOAST — nenhum concorrente tem nativo          */
/* ──────────────────────────────────────────────────────────────── */
const PROOF_EVENTS = [
  { name: "Juliana S.",  city: "São Paulo",       product: "Curso de Design",  time: "2 min" },
  { name: "Pedro M.",    city: "Rio de Janeiro",  product: "Mentoria 1:1",     time: "5 min" },
  { name: "Camila R.",   city: "Belo Horizonte",  product: "Ebook Guia",       time: "8 min" },
  { name: "Lucas T.",    city: "Curitiba",         product: "Curso de Design",  time: "12 min" },
  { name: "Aline F.",   city: "Recife",           product: "Mentoria 1:1",     time: "17 min" },
  { name: "Rodrigo B.", city: "Porto Alegre",     product: "Ebook Guia",       time: "21 min" },
];

const SocialProofToast = ({ accent }: { accent: string }) => {
  const [current, setCurrent] = useState<typeof PROOF_EVENTS[0] | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let idx = 0;
    const show = () => {
      setCurrent(PROOF_EVENTS[idx % PROOF_EVENTS.length]);
      setVisible(true);
      idx++;
      setTimeout(() => setVisible(false), 4000);
    };
    const timer = setTimeout(() => {
      show();
      const interval = setInterval(show, 9000);
      return () => clearInterval(interval);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  if (!current) return null;

  return (
    <div
      className="fixed bottom-20 left-4 z-50 max-w-[260px] pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.95)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
        style={{
          background: "rgba(10,7,20,0.92)",
          border: `1px solid ${accent}30`,
          backdropFilter: "blur(16px)",
          boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${accent}15`,
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
          style={{ background: `${accent}20`, border: `1px solid ${accent}30` }}
        >
          🛍️
        </div>
        <div>
          <p className="text-white text-[11.5px] font-semibold leading-snug">
            {current.name} de {current.city}
          </p>
          <p className="text-[11px] leading-snug mt-0.5" style={{ color: `${accent}` }}>
            comprou {current.product}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            há {current.time}
          </p>
        </div>
      </div>
    </div>
  );
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

const CountdownBadge = ({ accent }: { accent: string }) => {
  const time = useCountdown(5400 + Math.floor(Math.random() * 3600)); // 1.5–2.5h
  return (
    <span
      className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
      style={{ background: "rgba(239,68,68,0.18)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}
    >
      <Clock size={9} /> {time}
    </span>
  );
};

/* ──────────────────────────────────────────────────────────────── */
/*  Stagger entrance hook                                           */
/* ──────────────────────────────────────────────────────────────── */
const useStagger = (count: number, baseDelay = 180, step = 70) => {
  const [vis, setVis] = useState<boolean[]>(Array(count).fill(false));
  useEffect(() => {
    Array.from({ length: count }).forEach((_, i) => {
      setTimeout(() => setVis(v => { const n = [...v]; n[i] = true; return n; }), baseDelay + i * step);
    });
  }, []);
  return vis;
};

/* ──────────────────────────────────────────────────────────────── */
/*  Main ProfilePage                                                */
/* ──────────────────────────────────────────────────────────────── */
const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile]   = useState<ProfileData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied]     = useState(false);
  const [heroVis, setHeroVis]   = useState(false);

  const productStagger     = useStagger(10, 220, 80);
  const linkStagger        = useStagger(10, 380, 55);
  const testimonialStagger = useStagger(10, 520, 90);

  useEffect(() => {
    setTimeout(() => {
      const slug = username?.toLowerCase() || "";

      // 1️⃣ Try localStorage config saved by DashboardPagina
      try {
        const stored = localStorage.getItem("maview_vitrine_config");
        if (stored) {
          const cfg = JSON.parse(stored);
          // match by username OR show owner's own profile
          if (cfg.username && (cfg.username.toLowerCase() === slug || slug === "demo")) {
            const lsProfile: ProfileData = {
              username: cfg.username,
              displayName: cfg.displayName || cfg.username,
              bio: cfg.bio || "",
              avatar: cfg.avatarUrl || undefined,
              theme: cfg.theme || "dark-purple",
              whatsapp: cfg.whatsapp || undefined,
              products: (cfg.products || []).filter((p: any) => p.active),
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
      } catch {
        // fallback to mock
      }

      // 2️⃣ Fallback: mock profiles (demo page)
      const found = MOCK_PROFILES[slug];
      if (found) { setProfile(found); setTimeout(() => setHeroVis(true), 80); }
      else setNotFound(true);
      setLoading(false);
    }, 320);
  }, [username]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) { await navigator.share({ title: profile?.displayName, url }); }
    else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2200); }
  };

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

  const t = THEMES[profile.theme] || THEMES["dark-purple"];
  const socialLinks  = profile.links.filter(l => l.active && l.isSocial);
  const regularLinks = profile.links.filter(l => l.active && !l.isSocial);

  /* Hover helpers */
  const onHoverIn  = (el: HTMLElement) => { el.style.borderColor = `${t.accent}55`; el.style.boxShadow = `0 8px 32px ${t.accent}18`; };
  const onHoverOut = (el: HTMLElement) => { el.style.borderColor = t.border; el.style.boxShadow = "none"; };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: t.bg }}>

      {/* ── Ambient BG ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[100px] opacity-20" style={{ background: `radial-gradient(ellipse, ${t.accent}, transparent 70%)` }} />
        <div className="absolute bottom-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full blur-[80px] opacity-10" style={{ background: t.accent2 }} />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: `linear-gradient(${t.accent} 1px, transparent 1px), linear-gradient(90deg, ${t.accent} 1px, transparent 1px)`, backgroundSize: "44px 44px" }} />
      </div>

      {/* 🔥 Social Proof Toast */}
      <SocialProofToast accent={t.accent} />

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col items-center px-4 pt-12 pb-28 relative z-10">
        <div className="w-full max-w-[400px]">

          {/* ── HERO ── */}
          <div className="flex flex-col items-center mb-8 transition-all duration-700" style={{ opacity: heroVis ? 1 : 0, transform: heroVis ? "translateY(0)" : "translateY(20px)" }}>
            {/* Avatar */}
            <div className="relative mb-5">
              <div className="absolute inset-[-4px] rounded-full blur-[14px] opacity-50" style={{ background: `radial-gradient(circle, ${t.accent}, ${t.accent2})` }} />
              {profile.avatar
                ? <img src={profile.avatar} alt={profile.displayName} className="relative w-[92px] h-[92px] rounded-full object-cover z-10" style={{ border: `2.5px solid ${t.accent}60`, boxShadow: `0 0 0 4px ${t.accent}18` }} />
                : <div className="relative w-[92px] h-[92px] rounded-full z-10 flex items-center justify-center text-3xl font-extrabold text-white" style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})` }}>{profile.displayName[0]}</div>
              }
            </div>

            <h1 className="text-[22px] font-extrabold mb-1 text-center tracking-tight" style={{ color: t.text }}>{profile.displayName}</h1>
            <p className="text-[13px] font-semibold mb-3 tracking-wide" style={{ color: t.accent }}>@{profile.username}</p>
            {profile.bio && <p className="text-[13.5px] text-center leading-relaxed max-w-[300px] mb-4" style={{ color: t.sub }}>{profile.bio}</p>}

            {/* Stats */}
            {profile.stats && (
              <div className="flex items-center gap-5 mb-4">
                {profile.stats.map(({ label, value }) => (
                  <div key={label} className="flex flex-col items-center">
                    <span className="text-[17px] font-extrabold" style={{ color: t.text }}>{value}</span>
                    <span className="text-[10px] font-medium mt-0.5 uppercase tracking-wider" style={{ color: t.sub }}>{label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Social + Share */}
            <div className="flex items-center gap-2.5">
              {socialLinks.map(link => {
                const Icon = getIcon(link.icon);
                return (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                    style={{ background: `${t.accent}18`, border: `1px solid ${t.accent}30` }} title={link.title}>
                    <Icon size={15} style={{ color: t.accent }} />
                  </a>
                );
              })}
              <button onClick={handleShare}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                style={{ background: `${t.accent}18`, border: `1px solid ${t.accent}30` }}>
                {copied ? <Check size={14} style={{ color: t.accent }} /> : <Share2 size={14} style={{ color: t.accent }} />}
              </button>
            </div>
          </div>

          {/* ── PRODUTOS ── */}
          {profile.products.length > 0 && (
            <section className="mb-7">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag size={13} style={{ color: t.accent }} />
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: t.sub }}>Produtos</span>
              </div>
              <div className="space-y-2.5">
                {profile.products.map((product, i) => {
                  const productHref = product.linkType === "whatsapp" && product.url
                    ? `https://wa.me/55${product.url}${product.whatsappMsg ? `?text=${encodeURIComponent(product.whatsappMsg)}` : ""}`
                    : product.url;
                  const isWhatsApp = product.linkType === "whatsapp";
                  return (
                  <a key={product.id} href={productHref} target="_blank" rel="noopener noreferrer"
                    className="group flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl transition-all duration-200 active:scale-[0.97]"
                    style={{
                      background: t.card, border: `1px solid ${t.border}`,
                      opacity: productStagger[i] ? 1 : 0,
                      transform: productStagger[i] ? "translateY(0)" : "translateY(14px)",
                      transition: "opacity 0.45s ease, transform 0.45s ease, box-shadow 0.2s, border-color 0.2s",
                    }}
                    onMouseEnter={e => onHoverIn(e.currentTarget as HTMLElement)}
                    onMouseLeave={e => onHoverOut(e.currentTarget as HTMLElement)}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${t.accent}12` }}>
                      {product.imageUrl
                        ? <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                        : product.emoji
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-[13.5px] font-bold leading-snug" style={{ color: t.text }}>{product.title}</p>
                        {product.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${t.accent}22`, color: t.accent, border: `1px solid ${t.accent}30` }}>
                            {product.badge}
                          </span>
                        )}
                        {product.urgency && <CountdownBadge accent={t.accent} />}
                      </div>
                      <p className="text-[11.5px] truncate" style={{ color: t.sub }}>{product.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[14px] font-extrabold" style={{ color: t.accent }}>{product.price}</span>
                        {product.originalPrice && <span className="text-[11px] line-through" style={{ color: t.sub }}>{product.originalPrice}</span>}
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11.5px] font-bold transition-all duration-200 group-hover:brightness-110"
                      style={{ background: isWhatsApp ? "linear-gradient(135deg, #25d366, #128C7E)" : `linear-gradient(135deg, ${t.accent}, ${t.accent2})`, color: "#fff", boxShadow: isWhatsApp ? "0 4px 14px #25d36640" : `0 4px 14px ${t.accent}40` }}>
                      {isWhatsApp ? <><MessageCircle size={11} /> WhatsApp</> : <><ShoppingCart size={11} /> Comprar</>}
                    </div>
                  </a>
                  );
                })}
              </div>
            </section>
          )}

          {/* ⭐ DEPOIMENTOS — prova social diretamente na vitrine */}
          {profile.testimonials && profile.testimonials.length > 0 && (
            <section className="mb-7">
              <div className="flex items-center gap-2 mb-3">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: t.sub }}>O que dizem</span>
              </div>
              <div className="space-y-2.5">
                {profile.testimonials.map((item, i) => (
                  <div key={i}
                    className="px-4 py-4 rounded-2xl"
                    style={{
                      background: t.card, border: `1px solid ${t.border}`,
                      opacity: testimonialStagger[i] ? 1 : 0,
                      transform: testimonialStagger[i] ? "translateY(0)" : "translateY(12px)",
                      transition: "opacity 0.45s ease, transform 0.45s ease",
                    }}
                  >
                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mb-2">
                      {Array.from({ length: item.stars }).map((_, s) => (
                        <Star key={s} size={11} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    {/* Quote */}
                    <p className="text-[12.5px] leading-relaxed mb-3 italic" style={{ color: t.sub }}>
                      "{item.text}"
                    </p>
                    {/* Author */}
                    <div className="flex items-center gap-2.5">
                      <img src={item.avatar} alt={item.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                      <div>
                        <p className="text-[12px] font-bold leading-none" style={{ color: t.text }}>{item.name}</p>
                        <p className="text-[10.5px] mt-0.5" style={{ color: t.sub }}>{item.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── LINKS ── */}
          {regularLinks.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Link2 size={13} style={{ color: t.accent }} />
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: t.sub }}>Links</span>
              </div>
              <div className="space-y-2">
                {regularLinks.map((link, i) => {
                  const Icon = getIcon(link.icon);
                  return (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-3.5 w-full px-5 py-4 rounded-2xl font-semibold text-[13.5px] transition-all duration-200 active:scale-[0.97]"
                      style={{
                        background: t.card, border: `1px solid ${t.border}`, color: t.text,
                        opacity: linkStagger[i] ? 1 : 0,
                        transform: linkStagger[i] ? "translateY(0)" : "translateY(12px)",
                        transition: "opacity 0.45s ease, transform 0.45s ease, box-shadow 0.2s, border-color 0.2s",
                      }}
                      onMouseEnter={e => onHoverIn(e.currentTarget as HTMLElement)}
                      onMouseLeave={e => onHoverOut(e.currentTarget as HTMLElement)}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${t.accent}18` }}>
                        <Icon size={15} style={{ color: t.accent }} />
                      </div>
                      <span className="flex-1 truncate">{link.title}</span>
                      <ArrowRight size={14} style={{ color: t.sub, opacity: 0.5 }} className="group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                    </a>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* 💬 WhatsApp sticky button — enorme no Brasil */}
      {profile.whatsapp && (
        <a
          href={`https://wa.me/${profile.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-[72px] right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #16a34a, #22c55e)",
            boxShadow: "0 8px 32px rgba(34,197,94,0.4)",
            color: "#fff",
          }}
        >
          <MessageCircle size={17} className="fill-white" />
          <span className="text-[12.5px] font-bold">Falar comigo</span>
        </a>
      )}

      {/* ── Footer ── */}
      <footer className="relative z-10 flex justify-center pb-6">
        <Link to="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-200 hover:brightness-125"
          style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: `0 4px 20px ${t.accent}10` }}
        >
          <img src={logoSrc} alt="Maview" className="w-4 h-4 object-contain" />
          <span className="text-[11px] font-semibold tracking-wide" style={{ color: t.sub }}>
            Crie o seu em <span style={{ color: t.accent }}>maview.app</span>
          </span>
        </Link>
      </footer>
    </div>
  );
};

export default ProfilePage;
