import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Globe, Instagram, Youtube, Twitter, ShoppingBag,
  Link2, Share2, Check, ExternalLink,
} from "lucide-react";

/* ─── Logo ────────────────────────────────────────────────────── */

const MaviewLogo = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pFront" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
        <stop offset="0%" stopColor="#8B5CF6"/><stop offset="100%" stopColor="#4C1D95"/>
      </linearGradient>
      <linearGradient id="pBack" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
        <stop offset="0%" stopColor="#5B21B6"/><stop offset="100%" stopColor="#1A0A35"/>
      </linearGradient>
      <clipPath id="pClip"><rect width="100" height="100"/></clipPath>
    </defs>
    <g clipPath="url(#pClip)">
      <polygon points="18,92 38,8 63,46 88,8 108,92" fill="url(#pBack)" opacity="0.68"/>
      <polygon points="4,92 26,12 50,52 74,12 96,92" fill="url(#pFront)"/>
    </g>
  </svg>
);

/* ─── Types ───────────────────────────────────────────────────── */

interface ProfileData {
  username: string;
  displayName: string;
  bio: string;
  avatar?: string;
  theme: ThemeId;
  links: LinkItem[];
}

type ThemeId = "dark-purple" | "midnight" | "forest" | "rose" | "amber" | "cyan";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  active: boolean;
}

const THEMES: Record<ThemeId, { bg: string; accent: string; card: string; text: string; sub: string }> = {
  "dark-purple": { bg: "#0F0B1F", accent: "#8B5CF6", card: "#1A1333", text: "#FFFFFF",   sub: "rgba(255,255,255,0.55)" },
  "midnight":    { bg: "#0a0a0f", accent: "#60A5FA", card: "#111827", text: "#FFFFFF",   sub: "rgba(255,255,255,0.55)" },
  "forest":      { bg: "#0d1f0d", accent: "#4ADE80", card: "#0f2a0f", text: "#FFFFFF",   sub: "rgba(255,255,255,0.55)" },
  "rose":        { bg: "#1a0d12", accent: "#FB7185", card: "#2a1018", text: "#FFFFFF",   sub: "rgba(255,255,255,0.55)" },
  "amber":       { bg: "#1a1200", accent: "#FCD34D", card: "#2a1e00", text: "#FFFFFF",   sub: "rgba(255,255,255,0.55)" },
  "cyan":        { bg: "#031220", accent: "#22D3EE", card: "#081f35", text: "#FFFFFF",   sub: "rgba(255,255,255,0.55)" },
};

const ICON_MAP: Record<string, any> = {
  globe: Globe, instagram: Instagram, youtube: Youtube,
  twitter: Twitter, shop: ShoppingBag, link: Link2,
};

const getIcon = (val: string) => ICON_MAP[val] || Link2;

/* ─── Mock data (substituir por Supabase depois) ──────────────── */

const MOCK_PROFILES: Record<string, ProfileData> = {
  demo: {
    username: "demo",
    displayName: "Ana Beatriz",
    bio: "Criadora de conteúdo 🎨 | Cursos digitais | Lifestyle",
    avatar: "https://i.pravatar.cc/200?img=47",
    theme: "dark-purple",
    links: [
      { id: "1", title: "Meu Instagram",     url: "https://instagram.com",    icon: "instagram", active: true },
      { id: "2", title: "Canal do YouTube",   url: "https://youtube.com",      icon: "youtube",   active: true },
      { id: "3", title: "Curso de Design",    url: "https://exemplo.com",      icon: "shop",      active: true },
      { id: "4", title: "Meu Website",        url: "https://exemplo.com",      icon: "globe",     active: true },
      { id: "5", title: "Twitter / X",        url: "https://twitter.com",      icon: "twitter",   active: true },
    ],
  },
};

/* ─── Profile Page ────────────────────────────────────────────── */

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [clickedLinks, setClickedLinks] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Simula busca no banco (depois conectar ao Supabase)
    setTimeout(() => {
      const found = MOCK_PROFILES[username?.toLowerCase() || ""];
      if (found) setProfile(found);
      else setNotFound(true);
      setLoading(false);
    }, 400);
  }, [username]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: profile?.displayName, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLinkClick = (id: string) => {
    setClickedLinks((prev) => new Set(prev).add(id));
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: THEMES["dark-purple"].bg }}>
        <div className="w-8 h-8 border-2 border-white/10 border-t-violet-400 rounded-full animate-spin" />
      </div>
    );
  }

  /* ── Not found ── */
  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: THEMES["dark-purple"].bg }}>
        <MaviewLogo size={48} />
        <h1 className="text-white text-2xl font-bold mt-6 mb-2">Perfil não encontrado</h1>
        <p className="text-white/50 text-sm mb-8">O link <span className="text-violet-400 font-mono">/{username}</span> não existe ainda.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:brightness-110 transition-all"
        >
          Criar minha vitrine grátis
        </Link>
      </div>
    );
  }

  const theme = THEMES[profile.theme] || THEMES["dark-purple"];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: theme.bg }}>

      {/* ── Subtle top gradient ── */}
      <div
        className="absolute inset-x-0 top-0 h-64 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% -20%, ${theme.accent}22 0%, transparent 70%)` }}
      />

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col items-center px-4 pt-14 pb-20 relative z-10">
        <div className="w-full max-w-sm">

          {/* ── Avatar ── */}
          <div className="flex flex-col items-center mb-8">
            {profile.avatar ? (
              <div className="relative mb-4">
                <img
                  src={profile.avatar}
                  alt={profile.displayName}
                  className="w-24 h-24 rounded-full object-cover"
                  style={{ border: `3px solid ${theme.accent}50`, boxShadow: `0 0 24px ${theme.accent}30` }}
                />
                <div
                  className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2"
                  style={{ background: theme.accent, borderColor: theme.bg }}
                />
              </div>
            ) : (
              <div
                className="w-24 h-24 rounded-full mb-4 flex items-center justify-center text-3xl font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}88)`, boxShadow: `0 0 24px ${theme.accent}30` }}
              >
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
            )}

            <h1 className="text-xl font-bold mb-1" style={{ color: theme.text }}>{profile.displayName}</h1>
            <p className="text-sm font-medium mb-2" style={{ color: theme.accent }}>@{profile.username}</p>
            {profile.bio && (
              <p className="text-sm text-center leading-relaxed max-w-[280px]" style={{ color: theme.sub }}>{profile.bio}</p>
            )}

            {/* Share button */}
            <button
              onClick={handleShare}
              className="mt-4 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95"
              style={{ background: `${theme.accent}18`, color: theme.accent, border: `1px solid ${theme.accent}30` }}
            >
              {copied ? <Check size={12} /> : <Share2 size={12} />}
              {copied ? "Link copiado!" : "Compartilhar"}
            </button>
          </div>

          {/* ── Links ── */}
          <div className="space-y-3 w-full">
            {profile.links.filter((l) => l.active).map((link) => {
              const Icon = getIcon(link.icon);
              const wasClicked = clickedLinks.has(link.id);
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleLinkClick(link.id)}
                  className="group flex items-center gap-3.5 w-full px-5 py-4 rounded-2xl font-semibold text-sm transition-all duration-200 active:scale-[0.97]"
                  style={{
                    background: wasClicked ? `${theme.accent}25` : theme.card,
                    border: `1px solid ${wasClicked ? theme.accent + "60" : theme.accent + "20"}`,
                    color: theme.text,
                    boxShadow: wasClicked ? `0 4px 20px ${theme.accent}20` : "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${theme.accent}20`;
                    e.currentTarget.style.borderColor = `${theme.accent}50`;
                    e.currentTarget.style.boxShadow = `0 4px 20px ${theme.accent}20`;
                  }}
                  onMouseLeave={(e) => {
                    if (!wasClicked) {
                      e.currentTarget.style.background = theme.card;
                      e.currentTarget.style.borderColor = `${theme.accent}20`;
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${theme.accent}20` }}
                  >
                    <Icon size={16} style={{ color: theme.accent }} />
                  </div>
                  <span className="flex-1 truncate">{link.title}</span>
                  <ExternalLink size={13} style={{ color: theme.sub, opacity: 0.6 }} className="group-hover:opacity-100 transition-opacity" />
                </a>
              );
            })}
          </div>

          {/* ── Empty state ── */}
          {profile.links.filter((l) => l.active).length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm" style={{ color: theme.sub }}>Nenhum link adicionado ainda.</p>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer — Powered by Maview ── */}
      <footer className="relative z-10 flex justify-center pb-8">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
          style={{ background: `${theme.card}`, border: `1px solid ${theme.accent}15` }}
        >
          <MaviewLogo size={14} />
          <span className="text-[11px] font-semibold tracking-wide" style={{ color: theme.sub }}>
            Crie o seu em <span style={{ color: theme.accent }}>maview.app</span>
          </span>
        </Link>
      </footer>

    </div>
  );
};

export default ProfilePage;
