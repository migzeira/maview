import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Globe, Instagram, Youtube, Twitter, ShoppingBag,
  Link2, Share2, Check, ExternalLink, Play,
  ShoppingCart, Star, ArrowRight, Sparkles,
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
  url: string;
  badge?: string;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  active: boolean;
  isSocial?: boolean;
}

interface ProfileData {
  username: string;
  displayName: string;
  bio: string;
  avatar?: string;
  coverColor?: string;
  theme: ThemeId;
  links: LinkItem[];
  products: ProductItem[];
  stats?: { label: string; value: string }[];
}

/* ─── Themes ──────────────────────────────────────────────────── */
const THEMES: Record<ThemeId, {
  bg: string; bg2: string; accent: string; accent2: string;
  card: string; text: string; sub: string; border: string;
}> = {
  "dark-purple": {
    bg: "#080612", bg2: "#0f0b1f",
    accent: "#a855f7", accent2: "#ec4899",
    card: "#13102a", text: "#f8f5ff", sub: "rgba(248,245,255,0.5)", border: "rgba(168,85,247,0.18)"
  },
  "midnight": {
    bg: "#05080f", bg2: "#0a1020",
    accent: "#60a5fa", accent2: "#818cf8",
    card: "#0d1524", text: "#f0f6ff", sub: "rgba(240,246,255,0.5)", border: "rgba(96,165,250,0.18)"
  },
  "forest": {
    bg: "#050f05", bg2: "#0a1a0a",
    accent: "#4ade80", accent2: "#34d399",
    card: "#0a1a0a", text: "#f0fff4", sub: "rgba(240,255,244,0.5)", border: "rgba(74,222,128,0.18)"
  },
  "rose": {
    bg: "#100509", bg2: "#1a0812",
    accent: "#f43f5e", accent2: "#fb7185",
    card: "#1e0912", text: "#fff0f3", sub: "rgba(255,240,243,0.5)", border: "rgba(244,63,94,0.18)"
  },
  "amber": {
    bg: "#0f0a00", bg2: "#1a1200",
    accent: "#f59e0b", accent2: "#fcd34d",
    card: "#1f1500", text: "#fffbeb", sub: "rgba(255,251,235,0.5)", border: "rgba(245,158,11,0.18)"
  },
  "ocean": {
    bg: "#020c14", bg2: "#041525",
    accent: "#06b6d4", accent2: "#22d3ee",
    card: "#051e30", text: "#ecfeff", sub: "rgba(236,254,255,0.5)", border: "rgba(6,182,212,0.18)"
  },
};

/* ─── Social icons ────────────────────────────────────────────── */
const ICON_MAP: Record<string, any> = {
  globe: Globe, instagram: Instagram, youtube: Youtube,
  twitter: Twitter, shop: ShoppingBag, link: Link2,
};
const getIcon = (val: string) => ICON_MAP[val] || Link2;

const SOCIAL_ICONS = ["instagram", "youtube", "twitter"];

/* ─── Mock data ───────────────────────────────────────────────── */
const MOCK_PROFILES: Record<string, ProfileData> = {
  demo: {
    username: "demo",
    displayName: "Ana Beatriz",
    bio: "Criadora de conteúdo ✨ | Cursos de design e marketing digital | Ajudo criadores a monetizar",
    avatar: "https://i.pravatar.cc/200?img=47",
    theme: "dark-purple",
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
        badge: "Limitado",
      },
    ],
    links: [
      { id: "l1", title: "Instagram",    url: "https://instagram.com", icon: "instagram", active: true,  isSocial: true  },
      { id: "l2", title: "YouTube",      url: "https://youtube.com",   icon: "youtube",   active: true,  isSocial: true  },
      { id: "l3", title: "Twitter / X",  url: "https://twitter.com",   icon: "twitter",   active: true,  isSocial: true  },
      { id: "l4", title: "Meu Website",  url: "https://exemplo.com",   icon: "globe",     active: true,  isSocial: false },
      { id: "l5", title: "Newsletter",   url: "https://exemplo.com",   icon: "link",      active: true,  isSocial: false },
    ],
  },
};

/* ─── Animated entrance hook ────────────────────────────────────── */
const useStagger = (count: number, delay = 60) => {
  const [visibles, setVisibles] = useState<boolean[]>(Array(count).fill(false));
  useEffect(() => {
    visibles.forEach((_, i) => {
      setTimeout(() => setVisibles(v => { const n = [...v]; n[i] = true; return n; }), 180 + i * delay);
    });
  }, []);
  return visibles;
};

/* ─── Main component ──────────────────────────────────────────── */
const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const productStagger = useStagger(3, 80);
  const linkStagger = useStagger(10, 55);

  useEffect(() => {
    setTimeout(() => {
      const found = MOCK_PROFILES[username?.toLowerCase() || ""];
      if (found) { setProfile(found); setTimeout(() => setHeroVisible(true), 80); }
      else setNotFound(true);
      setLoading(false);
    }, 350);
  }, [username]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: profile?.displayName, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080612" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/10 border-t-violet-400 rounded-full animate-spin" />
          <p className="text-white/30 text-xs font-medium">Carregando vitrine…</p>
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: "#080612" }}>
        <div
          className="absolute inset-x-0 top-0 h-64 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(168,85,247,0.15) 0%, transparent 70%)" }}
        />
        <img src={logoSrc} alt="Maview" className="w-12 h-12 object-contain mb-5 opacity-80" />
        <h1 className="text-white text-2xl font-bold mb-2">Perfil não encontrado</h1>
        <p className="text-white/40 text-sm mb-8">O link <span className="text-violet-400 font-mono">/{username}</span> não existe ainda.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white text-sm font-bold transition-all hover:brightness-110"
          style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
        >
          <Sparkles size={14} /> Criar minha vitrine grátis
        </Link>
      </div>
    );
  }

  const t = THEMES[profile.theme] || THEMES["dark-purple"];
  const socialLinks = profile.links.filter(l => l.active && l.isSocial);
  const regularLinks = profile.links.filter(l => l.active && !l.isSocial);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: t.bg }}>

      {/* ── Ambient background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {/* Top glow */}
        <div
          className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[100px] opacity-20"
          style={{ background: `radial-gradient(ellipse, ${t.accent}, transparent 70%)` }}
        />
        {/* Bottom glow */}
        <div
          className="absolute bottom-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full blur-[80px] opacity-10"
          style={{ background: t.accent2 }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(${t.accent} 1px, transparent 1px), linear-gradient(90deg, ${t.accent} 1px, transparent 1px)`,
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col items-center px-4 pt-12 pb-24 relative z-10">
        <div className="w-full max-w-[400px]">

          {/* ── HERO: Avatar + Name + Bio ── */}
          <div
            className="flex flex-col items-center mb-8 transition-all duration-700"
            style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(20px)" }}
          >
            {/* Avatar with glow ring */}
            <div className="relative mb-5">
              <div
                className="absolute inset-[-4px] rounded-full blur-[12px] opacity-50"
                style={{ background: `radial-gradient(circle, ${t.accent}, ${t.accent2})` }}
              />
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.displayName}
                  className="relative w-[92px] h-[92px] rounded-full object-cover z-10"
                  style={{ border: `2.5px solid ${t.accent}60`, boxShadow: `0 0 0 4px ${t.accent}18` }}
                />
              ) : (
                <div
                  className="relative w-[92px] h-[92px] rounded-full z-10 flex items-center justify-center text-3xl font-extrabold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
                    boxShadow: `0 0 0 4px ${t.accent}18`,
                  }}
                >
                  {profile.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Name */}
            <h1
              className="text-[22px] font-extrabold mb-1 text-center tracking-tight"
              style={{ color: t.text }}
            >
              {profile.displayName}
            </h1>

            {/* @username */}
            <p className="text-[13px] font-semibold mb-3 tracking-wide" style={{ color: t.accent }}>
              @{profile.username}
            </p>

            {/* Bio */}
            {profile.bio && (
              <p
                className="text-[13.5px] text-center leading-relaxed max-w-[300px] mb-4"
                style={{ color: t.sub }}
              >
                {profile.bio}
              </p>
            )}

            {/* Stats row */}
            {profile.stats && profile.stats.length > 0 && (
              <div className="flex items-center gap-5 mb-4">
                {profile.stats.map(({ label, value }) => (
                  <div key={label} className="flex flex-col items-center">
                    <span className="text-[17px] font-extrabold" style={{ color: t.text }}>{value}</span>
                    <span className="text-[10px] font-medium mt-0.5 uppercase tracking-wider" style={{ color: t.sub }}>{label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Social icons + Share */}
            <div className="flex items-center gap-2.5">
              {socialLinks.map(link => {
                const Icon = getIcon(link.icon);
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                    style={{ background: `${t.accent}18`, border: `1px solid ${t.accent}30` }}
                    title={link.title}
                  >
                    <Icon size={15} style={{ color: t.accent }} />
                  </a>
                );
              })}
              <button
                onClick={handleShare}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                style={{ background: `${t.accent}18`, border: `1px solid ${t.accent}30` }}
                title="Compartilhar"
              >
                {copied
                  ? <Check size={14} style={{ color: t.accent }} />
                  : <Share2 size={14} style={{ color: t.accent }} />
                }
              </button>
            </div>
          </div>

          {/* ── PRODUTOS ── */}
          {profile.products.length > 0 && (
            <section className="mb-7">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag size={13} style={{ color: t.accent }} />
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: t.sub }}>
                  Produtos
                </span>
              </div>
              <div className="space-y-2.5">
                {profile.products.map((product, i) => (
                  <a
                    key={product.id}
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl transition-all duration-250 active:scale-[0.97]"
                    style={{
                      background: t.card,
                      border: `1px solid ${t.border}`,
                      opacity: productStagger[i] ? 1 : 0,
                      transform: productStagger[i] ? "translateY(0)" : "translateY(14px)",
                      transition: "opacity 0.45s ease, transform 0.45s ease, box-shadow 0.2s, border-color 0.2s",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = `${t.accent}55`;
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${t.accent}18`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = t.border;
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    {/* Emoji icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: `${t.accent}12` }}
                    >
                      {product.emoji}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13.5px] font-bold leading-snug truncate" style={{ color: t.text }}>
                          {product.title}
                        </p>
                        {product.badge && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: `${t.accent}22`, color: t.accent, border: `1px solid ${t.accent}30` }}
                          >
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11.5px] mt-0.5 truncate" style={{ color: t.sub }}>{product.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[14px] font-extrabold" style={{ color: t.accent }}>{product.price}</span>
                        {product.originalPrice && (
                          <span className="text-[11px] line-through" style={{ color: `${t.sub}` }}>{product.originalPrice}</span>
                        )}
                      </div>
                    </div>

                    {/* Buy CTA */}
                    <div
                      className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11.5px] font-bold transition-all duration-200 group-hover:brightness-110"
                      style={{
                        background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
                        color: "#fff",
                        boxShadow: `0 4px 14px ${t.accent}40`,
                      }}
                    >
                      <ShoppingCart size={11} />
                      Comprar
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* ── LINKS ── */}
          {regularLinks.length > 0 && (
            <section className="mb-2">
              <div className="flex items-center gap-2 mb-3">
                <Link2 size={13} style={{ color: t.accent }} />
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: t.sub }}>
                  Links
                </span>
              </div>
              <div className="space-y-2">
                {regularLinks.map((link, i) => {
                  const Icon = getIcon(link.icon);
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3.5 w-full px-5 py-4 rounded-2xl font-semibold text-[13.5px] transition-all duration-200 active:scale-[0.97]"
                      style={{
                        background: t.card,
                        border: `1px solid ${t.border}`,
                        color: t.text,
                        opacity: linkStagger[i] ? 1 : 0,
                        transform: linkStagger[i] ? "translateY(0)" : "translateY(12px)",
                        transition: "opacity 0.45s ease, transform 0.45s ease, box-shadow 0.2s, border-color 0.2s",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = `${t.accent}55`;
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 28px ${t.accent}18`;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = t.border;
                        (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${t.accent}18` }}
                      >
                        <Icon size={15} style={{ color: t.accent }} />
                      </div>
                      <span className="flex-1 truncate">{link.title}</span>
                      <ArrowRight
                        size={14}
                        style={{ color: t.sub, opacity: 0.5 }}
                        className="group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200"
                      />
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Empty state ── */}
          {profile.products.length === 0 && regularLinks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm" style={{ color: t.sub }}>Nenhum conteúdo ainda.</p>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer: Powered by Maview ── */}
      <footer className="relative z-10 flex justify-center pb-8">
        <Link
          to="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-200 hover:brightness-125"
          style={{
            background: `${t.card}`,
            border: `1px solid ${t.border}`,
            boxShadow: `0 4px 20px ${t.accent}10`,
          }}
        >
          <img src={logoSrc} alt="Maview" className="w-4 h-4 object-contain" />
          <span className="text-[11px] font-semibold tracking-wide" style={{ color: t.sub }}>
            Crie o seu em{" "}
            <span style={{ color: t.accent }}>maview.app</span>
          </span>
        </Link>
      </footer>
    </div>
  );
};

export default ProfilePage;
