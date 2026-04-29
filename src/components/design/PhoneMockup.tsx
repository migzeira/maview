/* ═══════════════════════════════════════════════════════════════════
   Premium Phone Mockup — realistic device with dense creator content
   ═══════════════════════════════════════════════════════════════════ */
import { useState, useEffect } from "react";
import type { ComponentType } from "react";
import { Instagram, Youtube, Globe, Link2 } from "lucide-react";
import {
  TikTokIcon, XIcon, GitHubIcon, TwitchIcon, FacebookIcon,
  LinkedInIcon, PinterestIcon, ThreadsIcon, KwaiIcon, WhatsAppIcon,
  TelegramIcon, DiscordIcon,
} from "@/components/profile/ProfileIcons";
import type { DesignConfig } from "@/types/vitrine";
import type { DesignPack } from "./constants";
import { REFERENCE_PROFILES } from "./constants";

/* Sync 100% com ProfileIcons (mesmo paths, mesmas cores) — preview = carousel idêntico */
type IconComp = ComponentType<{ size?: number; className?: string }>;
const SOCIAL_ICON: Record<string, { color: string; Comp: IconComp }> = {
  ig: { color: "#E1306C", Comp: Instagram },
  tt: { color: "#000000", Comp: TikTokIcon },
  yt: { color: "#FF0000", Comp: Youtube },
  wa: { color: "#25D366", Comp: WhatsAppIcon },
  li: { color: "#0A66C2", Comp: LinkedInIcon },
  gh: { color: "#181717", Comp: GitHubIcon },
  tw: { color: "#000000", Comp: XIcon },
  pin: { color: "#BD081C", Comp: PinterestIcon },
  sc: { color: "#FF7E29", Comp: KwaiIcon }, /* fallback */
  be: { color: "#1769FF", Comp: Globe }, /* fallback */
  fb: { color: "#1877F2", Comp: FacebookIcon },
  th: { color: "#000000", Comp: ThreadsIcon },
  tg: { color: "#26A5E4", Comp: TelegramIcon },
  dc: { color: "#5865F2", Comp: DiscordIcon },
  twitch: { color: "#9146FF", Comp: TwitchIcon },
};

export function PhoneMockup({ pack, isActive, onClick, liveDesign }: { pack: DesignPack; isActive: boolean; onClick: () => void; liveDesign?: DesignConfig }) {
  /* Anim one-shot: stats só fazem o "punch" UMA vez por mount, depois ficam quietas (fix do blink ao re-clicar) */
  const [statsAnimating, setStatsAnimating] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setStatsAnimating(false), 700);
    return () => clearTimeout(t);
  }, []);

  const { bg: packBg, accent: packAccent, accent2: packAccent2 } = pack.preview;
  const dd = (isActive && liveDesign) ? {
    ...liveDesign,
    bgImageUrl: pack.config.design.bgImageUrl,
    bgType: pack.config.design.bgType,
    bgOverlay: pack.config.design.bgOverlay ?? liveDesign.bgOverlay,
    coverImageUrl: pack.config.design.coverImageUrl,
  } : pack.config.design;
  const bg = dd.bgColor || packBg;
  const accent = dd.accentColor || packAccent;
  const accent2 = dd.accentColor2 || packAccent2;
  const ref = REFERENCE_PROFILES[pack.refIdx % REFERENCE_PROFILES.length];
  /* BUG FIX: Template mockups ALWAYS show the reference avatar — never the user's photo */
  const displayAvatar = ref.avatar;
  const hasCover = !!ref.coverImage;
  const isLight = bg.startsWith("#f") || bg.startsWith("#e") || bg === "#ffffff";
  const textC = dd.textColor || (isLight ? "#111" : "#fff");
  const subC = dd.subtextColor || (isLight ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.55)");
  const btnR = dd.buttonShape === "pill" ? "999px" : dd.buttonShape === "square" ? "3px" : "8px";
  const cardR = dd.buttonShape === "pill" ? "12px" : dd.buttonShape === "square" ? "4px" : "10px";
  /* Tipografia — fontHeading pra títulos, fontBody pro corpo (idêntico ao Profile.tsx) */
  const headingFF = `"${dd.fontHeading || "Inter"}", sans-serif`;
  const bodyFF = `"${dd.fontBody || dd.fontHeading || "Inter"}", sans-serif`;

  /* Luxury tokens */
  const MAVIEW_BLUE = "#1E5BFF";
  const ICON_INNER_GLOW = "#4A8DFF";
  const socialStyle = pack.socialIconStyle || "brand";
  const monoColor = dd.nameColor || textC;
  const isGlass = pack.glassCards === true;
  const ctaGlow = pack.ctaGlow || "none";
  const headerType = pack.headerLayoutType || null;

  /* Verified badge — Maview blue */
  const VerifiedBadge = () => ref.verified ? (
    <svg className="inline-block ml-[3px] flex-shrink-0" width="13" height="13" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill={MAVIEW_BLUE}/>
      <path d="M6 10.5l2.5 2.5L14 8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ) : null;

  /* Glass/clay social icons — premium physical button feel
     whiteGlass prop: força bolha branca opaca (edge-to-edge minimal sobre foto) */
  const SocialPills = ({ centered, size = "normal", whiteGlass }: { centered?: boolean; size?: "small" | "normal"; whiteGlass?: boolean }) => (
    <div className={`flex gap-[6px] ${centered ? "justify-center" : ""}`}>
      {ref.socials.slice(0, 4).map((s, i) => {
        const icon = SOCIAL_ICON[s] || { color: accent, Comp: Link2 };
        const iconColor = socialStyle === "mono" ? monoColor : icon.color;
        const sz = size === "small" ? 22 : 26;
        const iconSize = size === "small" ? 11 : 13;
        const Comp = icon.Comp;
        /* White glass mode — fundo branco sólido 92%, ícone em cor brand, para uso sobre foto */
        if (whiteGlass) {
          return (
            <div key={i} className="rounded-full flex items-center justify-center"
              style={{
                width: sz, height: sz,
                background: "rgba(255,255,255,0.92)",
                border: "1.5px solid rgba(255,255,255,0.95)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.15)",
                color: icon.color,
              }}>
              <Comp size={iconSize} />
            </div>
          );
        }
        return (
          <div key={i} className="rounded-full flex items-center justify-center"
            style={{
              width: sz, height: sz,
              background: socialStyle === "mono"
                ? (isLight ? "linear-gradient(145deg, rgba(15,23,42,0.04), rgba(15,23,42,0.10))" : "linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))")
                : `linear-gradient(145deg, ${iconColor}26, ${iconColor}10)`,
              boxShadow: `
                inset 0 1.2px 0 ${isLight ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.18)"},
                inset 0 -0.8px 0 ${isLight ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.22)"},
                inset 0 0 6px ${ICON_INNER_GLOW}22,
                0 2px 4px rgba(0,0,0,0.10)
              `,
              border: `0.5px solid ${isLight ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.12)"}`,
              color: iconColor,
            }}>
            <Comp size={iconSize} />
          </div>
        );
      })}
    </div>
  );

  /* Stats row — Stan-style com hairline separators + entrada animada (punch ONE-SHOT no mount) */
  const StatsRow = () => ref.stats && ref.stats.length > 0 ? (
    <div className="flex items-center justify-center px-3 mt-1.5">
      {ref.stats.map((s, i) => (
        <div key={i} className="flex items-center">
          {i > 0 && (
            <div className="w-px h-[18px] mx-3" style={{ background: `${textC}15`, animation: statsAnimating ? `fadeIn 0.4s ease ${0.15 + i * 0.08}s both` : undefined }} />
          )}
          <div className="flex flex-col items-center" style={{ animation: statsAnimating ? `statPunch 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.08}s both` : undefined }}>
            <span className="text-[11px] font-extrabold leading-none tabular-nums" style={{ color: textC, letterSpacing: "-0.025em" }}>{s.value}</span>
            <span className="text-[7px] leading-none mt-[3px] uppercase opacity-45" style={{ color: textC, letterSpacing: "0.05em", fontWeight: 600 }}>{s.label}</span>
          </div>
        </div>
      ))}
    </div>
  ) : null;

  /* CTA glow shadow based on pack config */
  const ctaGlowShadow =
    ctaGlow === "blue" ? `0 0 20px ${MAVIEW_BLUE}70, 0 4px 12px ${MAVIEW_BLUE}45` :
    ctaGlow === "accent" ? `0 0 18px ${accent}60, 0 4px 12px ${accent}40` :
    `0 3px 8px rgba(0,0,0,0.20)`;

  /* Product card style — glass or solid */
  const productCardStyle = isGlass ? {
    background: dd.cardBg || "rgba(255,255,255,0.14)",
    backdropFilter: "blur(14px) saturate(160%)",
    WebkitBackdropFilter: "blur(14px) saturate(160%)",
    border: `1px solid ${dd.cardBorder || "rgba(255,255,255,0.22)"}`,
  } : {
    background: dd.cardBg || `${accent}08`,
    border: `1px solid ${dd.cardBorder || `${accent}14`}`,
  };

  /* Multi-layer depth shadow — Stan/Apple style refinement */
  const cardDepthShadow = isLight
    ? "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.05), 0 12px 32px rgba(15,23,42,0.06)"
    : "0 1px 2px rgba(0,0,0,0.20), 0 4px 12px rgba(0,0,0,0.25), 0 12px 32px rgba(0,0,0,0.30)";

  /* Hero banner — primary product with full-bleed image + pill CTA */
  const heroProduct = ref.products[0];
  const secondaryProduct = ref.products[1];
  /* Links como pills clicáveis estilo Stan (thumbnail + título + seta), máx 2 */
  const linkPills = (ref.links || []).slice(0, 2);
  const renderLinkPills = () => linkPills.length > 0 ? (
    <div className="space-y-[5px]">
      {linkPills.map((linkRaw, i) => {
        const link = typeof linkRaw === "string" ? { title: linkRaw.replace(/\s*→\s*$/, ""), image: undefined } : linkRaw;
        const radius = dd.buttonShape === "pill" ? 999 : (dd.buttonShape === "square" ? 6 : 12);
        return (
          <div key={i} className="flex items-center gap-2 pr-2.5 pl-1 py-1 overflow-hidden" style={{
            ...productCardStyle,
            borderRadius: radius,
          }}>
            {link.image ? (
              <img src={link.image} alt="" className="w-[28px] h-[28px] flex-shrink-0 object-cover" style={{ borderRadius: Math.max(4, radius - 6) }} crossOrigin="anonymous" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />
            ) : (
              <div className="w-[28px] h-[28px] flex-shrink-0 flex items-center justify-center text-[11px]" style={{
                background: `${accent}20`,
                borderRadius: Math.max(4, radius - 6),
                color: accent,
              }}>
                {link.title.match(/^(\p{Emoji})/u)?.[1] || "→"}
              </div>
            )}
            <span className="text-[9px] truncate flex-1" style={{ color: textC, fontWeight: 700, letterSpacing: "-0.005em" }}>
              {link.title.replace(/^(\p{Emoji}\s*)/u, "")}
            </span>
            <span className="text-[10px] flex-shrink-0" style={{ color: accent, fontWeight: 800 }}>→</span>
          </div>
        );
      })}
    </div>
  ) : null;
  const renderHeroBanner = () => heroProduct ? (
    <div className="relative w-full overflow-hidden rounded-[14px]" style={{
      height: 135,
      boxShadow: cardDepthShadow,
      /* Sempre tem gradient fallback — img sobrepõe quando carrega */
      background: `linear-gradient(135deg, ${accent}, ${accent2 || accent})`,
    }}>
      {heroProduct.image && (
        <img src={heroProduct.image} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center 30%" }} crossOrigin="anonymous" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />
      )}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.50) 25%, rgba(0,0,0,0.15) 55%, transparent 80%)",
      }} />
      <div className="absolute inset-x-0 bottom-0 p-3 flex items-end justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11.5px] text-white leading-[1.15] line-clamp-2" style={{ fontFamily: headingFF, fontWeight: 800, letterSpacing: "-0.02em", textShadow: "0 2px 8px rgba(0,0,0,0.55)" }}>
            {heroProduct.title}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10.5px] font-extrabold text-white tabular-nums" style={{ letterSpacing: "-0.03em", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{heroProduct.price}</span>
            {heroProduct.originalPrice && <span className="text-[8.5px] line-through opacity-55 text-white font-medium tabular-nums">{heroProduct.originalPrice}</span>}
            {heroProduct.discount && <span className="text-[7.5px] font-extrabold px-1.5 py-[2px] rounded-[4px] tracking-wider" style={{ background: "rgba(255,255,255,0.22)", color: "#fff", backdropFilter: "blur(8px)" }}>{heroProduct.discount}</span>}
          </div>
        </div>
        {heroProduct.cta && (
          <div className="flex-shrink-0 px-2.5 py-[6px] rounded-full text-[9px] font-extrabold whitespace-nowrap" style={{
            background: ctaGlow === "blue" ? MAVIEW_BLUE : "rgba(255,255,255,0.95)",
            color: ctaGlow === "blue" ? "#fff" : "#0a0a0a",
            backdropFilter: "blur(10px)",
            letterSpacing: "-0.005em",
            boxShadow: ctaGlowShadow,
          }}>
            {heroProduct.cta}
          </div>
        )}
      </div>
    </div>
  ) : null;

  /* HERO XL — versão gigante para layout "single-hero" (portfolio/lookbook focus) */
  const renderHeroXL = () => heroProduct ? (
    <div className="relative w-full overflow-hidden rounded-[16px]" style={{
      height: 220,
      boxShadow: cardDepthShadow,
      background: `linear-gradient(135deg, ${accent}, ${accent2 || accent})`,
    }}>
      {heroProduct.image && (
        <img src={heroProduct.image} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center 25%" }} crossOrigin="anonymous" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />
      )}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.10) 65%, transparent 85%)",
      }} />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-[14px] text-white leading-[1.1] line-clamp-2 mb-1.5" style={{ fontFamily: headingFF, fontWeight: 800, letterSpacing: "-0.025em", textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>
          {heroProduct.title}
        </p>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-extrabold text-white tabular-nums" style={{ letterSpacing: "-0.03em", textShadow: "0 1px 4px rgba(0,0,0,0.55)" }}>{heroProduct.price}</span>
            {heroProduct.originalPrice && <span className="text-[10px] line-through opacity-55 text-white font-medium tabular-nums">{heroProduct.originalPrice}</span>}
          </div>
          {heroProduct.cta && (
            <div className="px-3.5 py-[7px] rounded-full text-[10px] font-extrabold whitespace-nowrap" style={{
              background: ctaGlow === "blue" ? MAVIEW_BLUE : "rgba(255,255,255,0.97)",
              color: ctaGlow === "blue" ? "#fff" : "#0a0a0a",
              backdropFilter: "blur(10px)",
              letterSpacing: "-0.005em",
              boxShadow: ctaGlowShadow,
            }}>
              {heroProduct.cta}
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;

  /* PRODUCT GRID 2x2 — para layout "grid-catalog" (catálogo de produtos) */
  const gridProducts = ref.products.slice(2, 6);
  const renderProductGrid = () => gridProducts.length > 0 ? (
    <div className="grid grid-cols-2 gap-1.5">
      {gridProducts.slice(0, 4).map((p, i) => (
        <div key={i} className="overflow-hidden" style={{ borderRadius: 10, ...productCardStyle, boxShadow: cardDepthShadow }}>
          {p.image ? (
            <img src={p.image} alt="" className="w-full h-[58px] object-cover" crossOrigin="anonymous" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />
          ) : (
            <div className="w-full h-[58px]" style={{ background: `${accent}20` }} />
          )}
          <div className="px-2 py-1.5">
            <p className="text-[8.5px] truncate leading-tight" style={{ color: textC, fontWeight: 700, letterSpacing: "-0.015em" }}>{p.title}</p>
            <p className="text-[8.5px] mt-[2px] tabular-nums" style={{ color: textC, fontWeight: 800, letterSpacing: "-0.025em" }}>{p.price}</p>
          </div>
        </div>
      ))}
    </div>
  ) : null;

  /* TESTIMONIAL CARD — depoimento de cliente real (Stan-style social proof) */
  const renderTestimonial = () => ref.testimonial ? (
    <div className="overflow-hidden p-3" style={{ borderRadius: 14, ...productCardStyle, boxShadow: cardDepthShadow }}>
      {/* Stars row */}
      <div className="flex items-center gap-[1px] mb-1.5">
        {Array.from({ length: ref.testimonial.rating || 5 }).map((_, i) => (
          <svg key={i} width="9" height="9" viewBox="0 0 24 24" fill="#fbbf24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"/></svg>
        ))}
      </div>
      {/* Quote */}
      <p className="text-[9.5px] leading-snug italic mb-2 line-clamp-3" style={{ color: textC, fontWeight: 500, letterSpacing: "-0.01em" }}>
        "{ref.testimonial.quote}"
      </p>
      {/* Author */}
      <div className="flex items-center gap-1.5">
        {ref.testimonial.avatar && (
          <img src={ref.testimonial.avatar} alt="" className="w-[20px] h-[20px] rounded-full object-cover flex-shrink-0" crossOrigin="anonymous" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />
        )}
        <div className="min-w-0">
          <p className="text-[8.5px] truncate" style={{ color: textC, fontWeight: 800, letterSpacing: "-0.01em" }}>{ref.testimonial.author}</p>
          {ref.testimonial.role && (
            <p className="text-[7.5px] truncate opacity-65" style={{ color: textC, fontWeight: 500 }}>{ref.testimonial.role}</p>
          )}
        </div>
      </div>
    </div>
  ) : null;

  /* VIDEO HERO — frame cinematográfico com chrome YouTube refinado */
  const renderVideoHero = () => ref.video ? (
    <div className="relative w-full overflow-hidden rounded-[14px]" style={{
      height: 175,
      boxShadow: cardDepthShadow,
      /* Fallback gradient se a img não carregar */
      background: `linear-gradient(135deg, ${accent}, ${accent2 || accent}, #000)`,
    }}>
      {/* Frame do vídeo */}
      <img src={ref.video.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover"
        crossOrigin="anonymous" loading="lazy"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />

      {/* Vignette cinematográfico — escurece bordas + topo + base pra texto sempre legível */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.10) 30%, rgba(0,0,0,0.10) 65%, rgba(0,0,0,0.85) 100%)",
      }} />

      {/* Live indicator com label "AO VIVO" — top-right premium */}
      {ref.video.views && (
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-1.5 py-[3px] rounded-[3px]" style={{
          background: "#FF0000", boxShadow: "0 2px 8px rgba(255,0,0,0.4)",
        }}>
          <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
          <span className="text-[7px] font-extrabold text-white tracking-wider" style={{ letterSpacing: "0.08em" }}>AO VIVO</span>
        </div>
      )}

      {/* Title — protagonista (centro vertical, bigger, dramatic) */}
      <div className="absolute top-2.5 left-2.5 right-16 z-10">
        <p className="text-[12px] text-white leading-[1.15] line-clamp-2" style={{ fontFamily: headingFF, fontWeight: 800, letterSpacing: "-0.025em", textShadow: "0 2px 10px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.7)" }}>
          {ref.video.title}
        </p>
        {ref.video.views && (
          <p className="text-[8.5px] text-white/85 mt-1 font-semibold tabular-nums" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>
            {ref.video.views} assistindo agora
          </p>
        )}
      </div>

      {/* YouTube player chrome — estilo real refinado */}
      <div className="absolute bottom-0 inset-x-0">
        {/* Progress bar — finíssima, com red bar + scrubber dot + buffered grey ahead */}
        <div className="relative w-full h-[2.5px] bg-white/20">
          <div className="absolute top-0 left-0 h-full bg-white/35" style={{ width: "55%" }} />
          <div className="absolute top-0 left-0 h-full" style={{ width: "38%", background: "#FF0000" }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full bg-[#FF0000]" style={{ left: "calc(38% - 3.5px)", boxShadow: "0 0 0 1.5px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.5)" }} />
        </div>
        {/* Chrome bottom — pause + tempo + volume + YT logo */}
        <div className="flex items-center justify-between px-2.5 py-1.5">
          <div className="flex items-center gap-2">
            {/* Pause icon (vídeo TOCANDO) */}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))" }}>
              <rect x="6" y="4" width="4" height="16" rx="0.5"/><rect x="14" y="4" width="4" height="16" rx="0.5"/>
            </svg>
            {/* Volume icon */}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))" }}>
              <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
            {/* Tempo */}
            <span className="text-[8px] text-white font-semibold tabular-nums" style={{ letterSpacing: "0.02em", textShadow: "0 1px 2px rgba(0,0,0,0.7)" }}>
              4:42 / {ref.video.duration || "12:34"}
            </span>
          </div>
          {/* Right: YT logo oficial */}
          <svg width="14" height="10" viewBox="0 0 24 17" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}>
            <path fill="#FF0000" d="M23.498 2.654a2.99 2.99 0 0 0-2.108-2.117C19.522.04 12 .04 12 .04s-7.522 0-9.39.497A2.99 2.99 0 0 0 .502 2.654C0 4.532 0 8.45 0 8.45s0 3.918.502 5.796a2.99 2.99 0 0 0 2.108 2.117C4.478 16.86 12 16.86 12 16.86s7.522 0 9.39-.497a2.99 2.99 0 0 0 2.108-2.117C24 12.368 24 8.45 24 8.45s0-3.918-.502-5.796z"/>
            <path fill="#fff" d="M9.5 12.18l6.5-3.73-6.5-3.73v7.46z"/>
          </svg>
        </div>
      </div>
    </div>
  ) : null;

  /* BOOKING WIDGET — calendário mini com slots de horário (Stan-style appointment) */
  const renderBookingWidget = () => ref.booking ? (
    <div className="overflow-hidden p-3" style={{ borderRadius: 14, ...productCardStyle, boxShadow: cardDepthShadow }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: accent, letterSpacing: "0.06em" }}>Agenda</p>
        </div>
        <span className="text-[7.5px] font-semibold opacity-60" style={{ color: textC }}>{ref.booking.title}</span>
      </div>
      {/* Date */}
      <p className="text-[11px] font-extrabold mb-1.5" style={{ color: textC, letterSpacing: "-0.02em" }}>{ref.booking.nextDate}</p>
      {/* Slots grid 4 cols */}
      <div className="grid grid-cols-4 gap-1 mb-2">
        {ref.booking.slots.map((slot, i) => (
          <div key={i} className="text-center py-1.5 rounded-md tabular-nums" style={{
            background: i === 0 ? accent : `${accent}10`,
            color: i === 0 ? (isLight ? "#fff" : bg) : textC,
            fontSize: 8.5, fontWeight: 700, letterSpacing: "-0.01em",
          }}>
            {slot}
          </div>
        ))}
      </div>
      {/* CTA */}
      <div className="text-center py-2 rounded-lg text-[10px] font-extrabold" style={{
        background: ctaGlow === "blue" ? MAVIEW_BLUE : accent,
        color: ctaGlow === "blue" ? "#fff" : (isLight ? "#fff" : bg),
        letterSpacing: "-0.01em",
        boxShadow: ctaGlowShadow,
      }}>
        {ref.booking.cta} →
      </div>
    </div>
  ) : null;

  /* PORTFOLIO GRID — 3-col grid de fotos signature do fotógrafo (Stan-style image gallery) */
  const renderPortfolioGrid = () => ref.portfolio ? (
    <div className="overflow-hidden p-2.5" style={{ borderRadius: 14, ...productCardStyle, boxShadow: cardDepthShadow }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: accent, letterSpacing: "0.06em" }}>
          {ref.portfolio.title || "Portfolio"}
        </p>
        <span className="text-[8px] font-semibold opacity-50" style={{ color: textC }}>{ref.portfolio.images.length} obras</span>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {ref.portfolio.images.slice(0, 6).map((img, i) => (
          <div key={i} className="relative overflow-hidden" style={{ aspectRatio: "1/1", borderRadius: 6, background: `linear-gradient(135deg, ${accent}30, ${accent2 || accent}40)` }}>
            <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />
          </div>
        ))}
      </div>
      {ref.portfolio.cta && (
        <div className="text-center mt-2 py-1.5 rounded-md text-[9px] font-extrabold" style={{
          background: ctaGlow === "blue" ? MAVIEW_BLUE : accent,
          color: ctaGlow === "blue" ? "#fff" : (isLight ? "#fff" : bg),
          letterSpacing: "-0.005em",
          boxShadow: ctaGlowShadow,
        }}>
          {ref.portfolio.cta} →
        </div>
      )}
    </div>
  ) : null;

  /* CHART CARD — mini line chart com KPI (Stan-style data viz) */
  const renderChartCard = () => ref.chart ? (() => {
    const c = ref.chart;
    const max = Math.max(...c.values);
    const min = Math.min(...c.values);
    const range = max - min || 1;
    const w = 200, h = 50;
    const step = w / (c.values.length - 1);
    const path = c.values.map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");
    const areaPath = `${path} L ${w} ${h} L 0 ${h} Z`;
    const trendColor = c.positive !== false ? "#10b981" : "#ef4444";
    return (
      <div className="overflow-hidden p-3" style={{ borderRadius: 14, ...productCardStyle, boxShadow: cardDepthShadow }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: accent, letterSpacing: "0.06em" }}>
            {c.title}
          </p>
          {c.period && <span className="text-[7.5px] font-semibold opacity-50" style={{ color: textC }}>{c.period}</span>}
        </div>
        {/* Big metric */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-[20px] font-extrabold tabular-nums leading-none" style={{ color: trendColor, letterSpacing: "-0.03em" }}>{c.metric}</span>
          <span className="text-[9px] font-semibold tabular-nums" style={{ color: textC, opacity: 0.7, letterSpacing: "-0.01em" }}>{c.change}</span>
        </div>
        {/* Mini chart */}
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 50 }} preserveAspectRatio="none">
          <defs>
            <linearGradient id={`chartGrad-${pack.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={trendColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#chartGrad-${pack.id})`} />
          <path d={path} stroke={trendColor} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* Last point dot */}
          <circle cx={w} cy={h - ((c.values[c.values.length - 1] - min) / range) * h} r="3" fill={trendColor} />
          <circle cx={w} cy={h - ((c.values[c.values.length - 1] - min) / range) * h} r="6" fill={trendColor} fillOpacity="0.25" />
        </svg>
      </div>
    );
  })() : null;

  /* LOOKBOOK SCROLL — fashion-style horizontal scroll de looks (Stan editorial) */
  const renderLookbookScroll = () => ref.lookbook ? (
    <div className="overflow-hidden">
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: accent, letterSpacing: "0.06em" }}>
          {ref.lookbook.title || "Lookbook"}
        </p>
        <span className="text-[8px] font-semibold opacity-50" style={{ color: textC }}>{ref.lookbook.images.length} looks</span>
      </div>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-3.5 px-3.5 pb-1">
        {ref.lookbook.images.map((look, i) => (
          <div key={i} className="relative flex-shrink-0 overflow-hidden" style={{
            width: 78, height: 116,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${accent}30, ${accent2 || accent}40)`,
            boxShadow: cardDepthShadow,
          }}>
            <img src={look.src} alt="" className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)" }} />
            {look.label && (
              <p className="absolute bottom-1.5 left-1.5 right-1.5 text-[8px] font-extrabold text-white leading-tight" style={{ letterSpacing: "-0.01em", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                {look.label}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  ) : null;

  /* Secondary product — large row card */
  const renderSecondaryCard = () => secondaryProduct ? (
    <div className="overflow-hidden" style={{ borderRadius: 14, ...productCardStyle, boxShadow: cardDepthShadow }}>
      <div className="flex items-center gap-2 p-2">
        {secondaryProduct.image ? (
          <img src={secondaryProduct.image} alt="" className="w-[44px] h-[44px] rounded-[9px] object-cover flex-shrink-0" crossOrigin="anonymous" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />
        ) : (
          <div className="w-[44px] h-[44px] rounded-[9px] flex-shrink-0" style={{ background: `${accent}15` }} />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] truncate leading-tight" style={{ fontFamily: headingFF, color: textC, fontWeight: 800, letterSpacing: "-0.018em" }}>{secondaryProduct.title}</p>
          <div className="flex items-center gap-1.5 mt-[3px]">
            <span className="text-[9.5px] font-extrabold tabular-nums" style={{ color: textC, letterSpacing: "-0.025em" }}>{secondaryProduct.price}</span>
            {secondaryProduct.originalPrice && <span className="text-[8px] line-through opacity-45 font-medium tabular-nums" style={{ color: textC }}>{secondaryProduct.originalPrice}</span>}
          </div>
        </div>
        {secondaryProduct.cta && (
          <div className="flex-shrink-0 px-2.5 py-[5px] rounded-full text-[8px] font-extrabold whitespace-nowrap" style={{
            background: ctaGlow === "blue" ? MAVIEW_BLUE : accent,
            color: ctaGlow === "blue" ? "#fff" : (isLight ? "#fff" : bg),
            letterSpacing: "-0.005em",
            boxShadow: ctaGlowShadow,
          }}>
            {secondaryProduct.cta}
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <button onClick={onClick} className="group flex-shrink-0 flex flex-col items-center gap-3 transition-all duration-500 ease-out" style={{ width: 290 }}>
      {/* Phone body — premium device frame (perspective-friendly) */}
      <div className="relative" style={{
        boxShadow: isActive
          ? `0 30px 80px rgba(124,58,237,0.25), 0 12px 40px rgba(0,0,0,0.30), 0 0 0 2px hsl(var(--primary))`
          : "0 15px 40px rgba(0,0,0,0.15), 0 6px 16px rgba(0,0,0,0.12)",
        borderRadius: 38,
        transition: "box-shadow 0.5s ease",
      }}>
        <div className={`relative w-[280px] rounded-[36px] overflow-hidden transition-all duration-500 ${isActive ? "ring-1 ring-primary ring-offset-2 ring-offset-[hsl(var(--dash-bg))]" : "ring-1 ring-white/[0.06]"}`}
          style={{ aspectRatio: "9/18", border: "2px solid #0f0f0f", boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)" }}>

          {/* ── Background ── */}
          <div className="absolute inset-0" style={{ background: dd.bgType === "gradient" ? `linear-gradient(to bottom, ${(dd.bgGradient as [string, string])?.[0] || bg}, ${(dd.bgGradient as [string, string])?.[1] || bg})` : bg }}>
            {dd.bgType === "image" && dd.bgImageUrl && (
              <div className="absolute inset-0" style={{
                backgroundImage: `url(${dd.bgImageUrl})`,
                backgroundSize: `${dd.bgImageZoom ?? 100}%`,
                backgroundPosition: `${dd.bgImagePosX ?? 50}% ${dd.bgImagePosY ?? 50}%`,
                backgroundRepeat: "no-repeat",
              }} />
            )}
            {dd.bgType === "image" && (dd.bgOverlay ?? 0) > 0 && (
              <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${(dd.bgOverlay || 0) / 100})` }} />
            )}
            {/* Efeitos animados removidos — foco 100% nos 8 templates premium */}
          </div>

          {/* ── Status bar (iOS) ── */}
          <div className="absolute top-0 inset-x-0 h-[22px] z-20 flex items-center justify-between px-4 pt-1">
            <span className="text-[8px] font-bold" style={{ color: `${textC}80` }}>9:41</span>
            <div className="flex items-center gap-[4px]">
              <svg width="11" height="8" viewBox="0 0 8 6" fill="none"><rect x="0" y="3" width="1.5" height="3" rx="0.5" fill={`${textC}50`}/><rect x="2.2" y="2" width="1.5" height="4" rx="0.5" fill={`${textC}50`}/><rect x="4.4" y="1" width="1.5" height="5" rx="0.5" fill={`${textC}50`}/><rect x="6.6" y="0" width="1.5" height="6" rx="0.5" fill={`${textC}50`}/></svg>
              <svg width="13" height="8" viewBox="0 0 10 6" fill="none"><rect x="0.5" y="0.5" width="8" height="5" rx="1" stroke={`${textC}40`} strokeWidth="0.6"/><rect x="1.2" y="1.2" width="5.5" height="3.6" rx="0.5" fill={`${textC}60`}/><rect x="8.5" y="1.8" width="1" height="2.4" rx="0.5" fill={`${textC}30`}/></svg>
            </div>
          </div>

          {/* ── Content — Maximalist UI v6.0 ── */}
          <div className="relative flex flex-col h-full pt-[22px] pb-3" style={{ fontFamily: bodyFF }}>

            {/* ═══ HEADER: Big_Circle_Master (Mateus, Vitor) ═══ */}
            {headerType === "big-circle" && (
              <div className="flex flex-col items-center px-3.5 pt-1.5">
                <div className="w-[84px] h-[84px] rounded-full overflow-hidden flex-shrink-0 relative" style={{
                  padding: 2.5,
                  background: `conic-gradient(from 180deg, ${accent}, ${accent2 || accent}, ${accent})`,
                  boxShadow: `0 6px 20px ${accent}40, 0 2px 6px rgba(0,0,0,0.15)`,
                }}>
                  <div className="w-full h-full rounded-full overflow-hidden" style={{ background: bg }}>
                    <img src={displayAvatar} alt="" className="w-full h-full object-cover" style={{ objectPosition: "center top" }} crossOrigin="anonymous" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />
                  </div>
                </div>
                <p className="text-[16px] leading-[1.05] mt-1.5 text-center" style={{ fontFamily: headingFF, color: textC, fontWeight: 800, letterSpacing: "-0.02em" }}>
                  {ref.name}<VerifiedBadge />
                </p>
                <p className="text-[9px] text-center mt-[1px]" style={{ color: accent, fontWeight: 600, letterSpacing: "0.02em" }}>{ref.username}</p>
                <p className="text-[8.5px] leading-[1.3] text-center mt-0.5 line-clamp-2 px-2" style={{ fontFamily: bodyFF, color: textC, fontWeight: 500, opacity: 0.88 }}>{ref.bio}</p>
                <div className="mt-1.5"><SocialPills size="small" centered /></div>
              </div>
            )}

            {/* ═══ HEADER: Edge_to_Edge_Header (Léo, Lucas) ═══ */}
            {headerType === "edge-to-edge" && (
              <div className="w-full flex-shrink-0 relative overflow-hidden" style={{ height: 180 }}>
                <img src={displayAvatar} alt="" className="w-full h-full object-cover" style={{ objectPosition: "center 15%" }} crossOrigin="anonymous" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />
                {/* Gradient — para light templates, fundo SÓLIDO atrás do texto pra garantir legibilidade */}
                <div className="absolute inset-0" style={{
                  background: pack.edgeGradientIntensity === "minimal"
                    /* MINIMAL: sombra escura mínima nos últimos 8-10% (só DJ) */
                    ? `linear-gradient(to top, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.18) 10%, rgba(0,0,0,0.05) 18%, transparent 28%)`
                    : isLight
                      /* LIGHT: bg SÓLIDO embaixo (40%) pra texto preto sempre legível */
                      ? `linear-gradient(to top, ${bg} 0%, ${bg} 38%, ${bg}EE 50%, ${bg}80 62%, ${bg}30 72%, transparent 80%)`
                      /* DARK: gradient equilibrado padrão */
                      : `linear-gradient(to top, ${bg} 0%, ${bg}E8 15%, ${bg}80 30%, ${bg}25 42%, transparent 52%)`,
                }} />
                <div className="absolute bottom-3 left-3.5 right-3.5 flex flex-col items-center text-center">
                  {(() => {
                    const isMinimalPack = pack.edgeGradientIntensity === "minimal";
                    const cleanShadow = "0 2px 10px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.40)";
                    return (<>
                      <p className="text-[17px] leading-[1.02]" style={{
                        fontFamily: headingFF,
                        color: isMinimalPack ? "#fff" : (isLight ? textC : "#fff"),
                        /* SEM text-shadow em light (cria blur invisível). Em dark, mantém pra legibilidade. */
                        textShadow: isMinimalPack ? cleanShadow : (isLight ? "none" : "0 2px 10px rgba(0,0,0,0.55)"),
                        fontWeight: 900, letterSpacing: "-0.025em",
                      }}>{ref.name}<VerifiedBadge /></p>
                      <p className="text-[10px] mt-0.5" style={{
                        color: isMinimalPack ? "#fff" : accent,
                        textShadow: isMinimalPack ? cleanShadow : (isLight ? "none" : "0 1px 3px rgba(0,0,0,0.35)"),
                        fontWeight: 800, letterSpacing: "0.02em"
                      }}>{ref.username}</p>
                      <p className="text-[9px] leading-[1.35] mt-1 line-clamp-2 px-1" style={{
                        fontFamily: bodyFF,
                        color: isMinimalPack ? "#fff" : (isLight ? textC : "rgba(255,255,255,0.95)"),
                        textShadow: isMinimalPack ? cleanShadow : (isLight ? "none" : "0 1px 3px rgba(0,0,0,0.45)"),
                        fontWeight: 600,
                        /* Light: 100% opaque pra contraste máximo. Dark: full visible. */
                        opacity: 1,
                      }}>{ref.bio}</p>
                      <div className="mt-1.5"><SocialPills size="small" centered whiteGlass={isMinimalPack} /></div>
                    </>);
                  })()}
                </div>
              </div>
            )}

            {/* ═══ HEADER: Floating_Square (Beatriz, Serenity) ═══ */}
            {headerType === "floating-square" && (
              <div className="flex flex-col items-center px-3.5 pt-1.5">
                <div className="w-[100px] h-[100px] overflow-hidden flex-shrink-0" style={{
                  borderRadius: 18,
                  boxShadow: `0 12px 24px rgba(0,0,0,0.20), 0 4px 8px rgba(0,0,0,0.10), 0 0 0 3px ${isLight ? "#fff" : "rgba(255,255,255,0.08)"}, 0 0 18px ${accent}28`,
                }}>
                  <img src={displayAvatar} alt="" className="w-full h-full object-cover" style={{ objectPosition: "center top" }} crossOrigin="anonymous" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />
                </div>
                <p className="text-[18px] leading-[1.02] mt-2 text-center" style={{ fontFamily: headingFF, color: textC, fontWeight: 600, letterSpacing: "-0.02em" }}>
                  {ref.name}<VerifiedBadge />
                </p>
                <p className="text-[9px] text-center mt-[1px]" style={{ color: accent, fontWeight: 600, letterSpacing: "0.02em" }}>{ref.username}</p>
                <p className="text-[8.5px] leading-[1.3] text-center mt-0.5 line-clamp-2 px-2" style={{ fontFamily: bodyFF, color: textC, fontWeight: 500, opacity: 0.88 }}>{ref.bio}</p>
                <div className="mt-1.5"><SocialPills size="small" centered /></div>
              </div>
            )}

            {/* ═══ HEADER: Split_Editorial (Isabela, Julia) ═══ */}
            {headerType === "split-editorial" && (
              <div className="w-full flex-shrink-0 flex" style={{ height: 155 }}>
                <div className="w-[45%] relative overflow-hidden">
                  <img src={displayAvatar} alt="" className="w-full h-full object-cover" style={{ objectPosition: "center center" }} crossOrigin="anonymous" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />
                </div>
                <div className="w-[55%] flex flex-col justify-center px-2.5">
                  <p className="text-[14px] leading-[1.05]" style={{ fontFamily: headingFF, color: textC, fontWeight: 700, letterSpacing: "-0.02em" }}>
                    {ref.name}<VerifiedBadge />
                  </p>
                  <p className="text-[8.5px] mt-0.5" style={{ color: accent, fontWeight: 600, letterSpacing: "0.02em" }}>{ref.username}</p>
                  <p className="text-[8.5px] leading-[1.3] mt-1 line-clamp-3" style={{ fontFamily: bodyFF, color: textC, fontWeight: 500, opacity: 0.88 }}>{ref.bio}</p>
                  <div className="mt-1.5"><SocialPills size="small" /></div>
                </div>
              </div>
            )}

            {/* ═══ FALLBACK: Classic layout (for any pack without headerLayoutType) ═══ */}
            {!headerType && (
              <>
                <div className="mt-4 w-[70px] h-[70px] mb-1 flex-shrink-0 overflow-hidden mx-auto rounded-full" style={{
                  border: dd.profileBorder ? `2.5px solid ${dd.profileBorderColor || accent}` : "none",
                  boxShadow: dd.profileGlow ? `0 0 22px ${dd.profileGlowColor || accent}40` : "0 2px 10px rgba(0,0,0,0.2)",
                }}>
                  <img src={displayAvatar} alt="" className="w-full h-full object-cover" style={{ objectPosition: "center top" }} crossOrigin="anonymous" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />
                </div>
                <p className="text-[15px] leading-tight text-center mb-1" style={{ fontFamily: headingFF, color: dd.nameColor || textC, fontWeight: 800, letterSpacing: "-0.02em" }}>
                  {ref.name}<VerifiedBadge />
                </p>
                <p className="text-[8px] text-center mb-1" style={{ color: accent, letterSpacing: "0.03em" }}>{ref.username}</p>
                <p className="text-[8.5px] leading-snug text-center mb-1.5 px-4 line-clamp-2" style={{ fontFamily: bodyFF, color: textC, fontWeight: 500, opacity: 0.88 }}>{ref.bio}</p>
                <div className="flex justify-center"><SocialPills size="small" /></div>
              </>
            )}

            {/* ═══ BODY LAYOUT VARIETY — composição muda por nicho (Stan-style) ═══ */}
            {(() => {
              const layout = pack.bodyLayout || "classic";

              /* SINGLE-HERO: portfolio focus — hero gigante + 2 link pills, sem secondary */
              if (layout === "single-hero") {
                return (
                  <>
                    <StatsRow />
                    <div className="px-3.5 mt-2">{renderHeroXL()}</div>
                    <div className="px-3.5 mt-auto pb-1">{renderLinkPills()}</div>
                  </>
                );
              }

              /* GRID-CATALOG: hero compacto + grid 2x2 de produtos + 1 link pill no fim */
              if (layout === "grid-catalog") {
                return (
                  <>
                    <StatsRow />
                    <div className="px-3.5 mt-1.5 mb-1.5">{renderHeroBanner()}</div>
                    <div className="px-3.5 mb-1.5">{renderProductGrid()}</div>
                    <div className="px-3.5 mt-auto">
                      {linkPills.length > 0 && (() => {
                        const link = typeof linkPills[0] === "string" ? { title: (linkPills[0] as string).replace(/\s*→\s*$/, ""), image: undefined } : (linkPills[0] as { title: string; image?: string });
                        const radius = dd.buttonShape === "pill" ? 999 : (dd.buttonShape === "square" ? 6 : 12);
                        return (
                          <div className="flex items-center gap-2 pr-2.5 pl-1 py-1 overflow-hidden" style={{ ...productCardStyle, borderRadius: radius }}>
                            {link.image ? (
                              <img src={link.image} alt="" className="w-[28px] h-[28px] flex-shrink-0 object-cover" style={{ borderRadius: Math.max(4, radius - 6) }} crossOrigin="anonymous" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />
                            ) : (
                              <div className="w-[28px] h-[28px] flex-shrink-0" style={{ background: `${accent}20`, borderRadius: Math.max(4, radius - 6) }} />
                            )}
                            <span className="text-[9px] truncate flex-1" style={{ color: textC, fontWeight: 700, letterSpacing: "-0.005em" }}>{link.title.replace(/^(\p{Emoji}\s*)/u, "")}</span>
                            <span className="text-[10px] flex-shrink-0" style={{ color: accent, fontWeight: 800 }}>→</span>
                          </div>
                        );
                      })()}
                    </div>
                  </>
                );
              }

              /* TESTIMONIAL: stats / hero / testimonial card / 1 link pill */
              if (layout === "testimonial") {
                return (
                  <>
                    <StatsRow />
                    <div className="px-3.5 mt-1.5 mb-1.5">{renderHeroBanner()}</div>
                    <div className="px-3.5 mb-1.5">{renderTestimonial()}</div>
                    <div className="px-3.5 mt-auto">{renderLinkPills()}</div>
                  </>
                );
              }

              /* VIDEO-HERO: stats / video preview com play / hero (produto) compacto / link pill */
              if (layout === "video-hero") {
                return (
                  <>
                    <StatsRow />
                    <div className="px-3.5 mt-1.5 mb-1.5">{renderVideoHero()}</div>
                    <div className="px-3.5 mb-1.5">{renderLinkPills()}</div>
                    <div className="px-3.5 mt-auto">{renderSecondaryCard()}</div>
                  </>
                );
              }

              /* BOOKING: stats / booking widget / hero (produto) / link pill */
              if (layout === "booking") {
                return (
                  <>
                    <StatsRow />
                    <div className="px-3.5 mt-1.5 mb-1.5">{renderBookingWidget()}</div>
                    <div className="px-3.5 mb-1.5">{renderLinkPills()}</div>
                    <div className="px-3.5 mt-auto">{renderSecondaryCard()}</div>
                  </>
                );
              }

              /* PORTFOLIO-GRID: stats / hero compacto / grid 3-col de fotos / link */
              if (layout === "portfolio-grid") {
                return (
                  <>
                    <StatsRow />
                    <div className="px-3.5 mt-1.5 mb-1.5">{renderHeroBanner()}</div>
                    <div className="px-3.5 mb-1.5">{renderPortfolioGrid()}</div>
                    <div className="px-3.5 mt-auto">{renderLinkPills()}</div>
                  </>
                );
              }

              /* METRICS-CHART: stats / chart com KPI + linha / hero / link */
              if (layout === "metrics-chart") {
                return (
                  <>
                    <StatsRow />
                    <div className="px-3.5 mt-1.5 mb-1.5">{renderChartCard()}</div>
                    <div className="px-3.5 mb-1.5">{renderHeroBanner()}</div>
                    <div className="px-3.5 mt-auto">{renderLinkPills()}</div>
                  </>
                );
              }

              /* LOOKBOOK-SCROLL: stats / hero / scroll horizontal de looks / secondary */
              if (layout === "lookbook-scroll") {
                return (
                  <>
                    <StatsRow />
                    <div className="px-3.5 mt-1.5 mb-1.5">{renderHeroBanner()}</div>
                    <div className="px-3.5 mb-1.5">{renderLookbookScroll()}</div>
                    <div className="px-3.5 mt-auto">{renderSecondaryCard()}</div>
                  </>
                );
              }

              /* CLASSIC (default): stats / hero / link pills / secondary */
              return (
                <>
                  <StatsRow />
                  <div className="px-3.5 mt-1.5 mb-1.5">{renderHeroBanner()}</div>
                  <div className="px-3.5 mb-1.5">{renderLinkPills()}</div>
                  <div className="px-3.5 mt-auto">{renderSecondaryCard()}</div>
                </>
              );
            })()}
          </div>

          {/* ── Home indicator (iOS) ── */}
          <div className="absolute bottom-[5px] left-1/2 -translate-x-1/2 w-[38%] h-[3px] rounded-full z-20" style={{ background: `${textC}20` }} />
        </div>
      </div>
      {/* Nome do pack renderizado externamente no DesignTab — evita duplicação */}
    </button>
  );
}
