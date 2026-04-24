/* ═══════════════════════════════════════════════════════════════════
   Premium Phone Mockup — realistic device with dense creator content
   ═══════════════════════════════════════════════════════════════════ */
import type { DesignConfig } from "@/types/vitrine";
import type { DesignPack } from "./constants";
import { REFERENCE_PROFILES } from "./constants";

/* Real brand SVG icons for social platforms (12×12 viewBox) */
const SOCIAL_ICON: Record<string, { color: string; path: string }> = {
  ig: { color: "#E1306C", path: "M8 1.5H4A2.5 2.5 0 001.5 4v4A2.5 2.5 0 004 10.5h4A2.5 2.5 0 0010.5 8V4A2.5 2.5 0 008 1.5zM6 8.2a2.2 2.2 0 110-4.4 2.2 2.2 0 010 4.4zm2.6-4a.55.55 0 110-1.1.55.55 0 010 1.1zM6 4.6a1.4 1.4 0 100 2.8 1.4 1.4 0 000-2.8z" },
  tt: { color: "#00f2ea", path: "M9.5 3.5A2.5 2.5 0 017 1h-1.5v6.25a1.25 1.25 0 11-.88-1.19V4.5A2.75 2.75 0 107 7.25V4.3A4 4 0 009.5 5V3.5z" },
  yt: { color: "#FF0000", path: "M11 4.2s-.1-.8-.5-1.1c-.4-.4-.9-.4-.9-.4H2.4s-.5 0-.9.4C1.1 3.4 1 4.2 1 4.2S.9 5.1.9 6v.8c0 .9.1 1.8.1 1.8s.1.8.5 1.1c.4.4 1 .4 1.2.4H9.6c.5 0 .9-.4.9-.4s.4-.4.5-1.1c0 0 .1-.9.1-1.8V6c0-.9-.1-1.8-.1-1.8zM4.8 8V4.5L7.8 6.2 4.8 8z" },
  wa: { color: "#25D366", path: "M6 1a5 5 0 00-4.35 7.48L1 11l2.6-.68A5 5 0 106 1zm2.8 7.1c-.12.34-.7.65-1 .69-.25.04-.57.06-3.05-.95a7.4 7.4 0 01-2.5-2.2c-.38-.51-.8-1.35-.81-2.05 0-.7.36-1.04.5-1.19.13-.14.28-.17.38-.17h.27c.09 0 .2-.03.32.24.12.28.42.96.45 1.03.04.07.06.15.01.24-.05.09-.07.15-.14.23l-.22.25c-.07.07-.15.15-.06.3.08.15.38.63.82 1.02.56.5 1.04.66 1.19.73.14.08.23.07.32-.04.09-.1.38-.44.48-.6.1-.15.2-.12.34-.07.13.05.85.4.99.47.15.07.24.11.28.17.04.06.04.34-.08.68z" },
  li: { color: "#0A66C2", path: "M2.5 4.5h1.8v5.5H2.5zM3.4 2a1 1 0 110 2 1 1 0 010-2zM5.5 4.5h1.7v.75h.03c.24-.45.82-.92 1.68-.92C10.5 4.33 11 5.4 11 7v3H9.2V7.3c0-.57-.01-1.3-.8-1.3-.8 0-.92.62-.92 1.27V10H5.5z" },
  gh: { color: "#f0f0f0", path: "M6 1C3.24 1 1 3.24 1 6c0 2.21 1.44 4.08 3.43 4.75.25.05.34-.11.34-.24v-.86c-1.4.3-1.69-.67-1.69-.67-.23-.58-.56-.73-.56-.73-.46-.31.03-.31.03-.31.5.04.77.52.77.52.45.77 1.18.55 1.47.42.05-.33.18-.55.32-.67-1.11-.13-2.28-.56-2.28-2.48 0-.55.2-1 .52-1.35-.05-.13-.23-.64.05-1.33 0 0 .42-.14 1.39.52a4.8 4.8 0 012.52 0c.96-.65 1.38-.52 1.38-.52.28.69.1 1.2.05 1.33.33.35.52.8.52 1.35 0 1.93-1.17 2.35-2.29 2.48.18.16.34.46.34.93v1.37c0 .13.09.29.34.24A5 5 0 0011 6C11 3.24 8.76 1 6 1z" },
  tw: { color: "#1DA1F2", path: "M10.5 3.5c-.35.15-.72.26-1.1.3.4-.24.7-.6.85-1.05-.37.22-.78.38-1.22.47A1.93 1.93 0 007.6 2.5c-1.07 0-1.93.87-1.93 1.93 0 .15.02.3.05.44A5.48 5.48 0 011.7 2.8a1.93 1.93 0 00.6 2.58c-.32-.01-.62-.1-.88-.25v.03a1.93 1.93 0 001.55 1.89c-.16.04-.34.07-.52.07-.13 0-.25-.01-.37-.04.25.78.98 1.35 1.84 1.37a3.88 3.88 0 01-2.87.8A5.46 5.46 0 004 10c3.56 0 5.5-2.95 5.5-5.5v-.25c.38-.27.7-.61.96-1z" },
  pin: { color: "#E60023", path: "M6 1a5 5 0 00-1.82 9.66c-.01-.42.01-1.07.1-1.59l.78-3.3s-.2-.39-.2-.97c0-.91.53-1.59 1.18-1.59.56 0 .83.42.83.92 0 .56-.36 1.4-.54 2.18-.15.65.33 1.18.97 1.18 1.16 0 2.06-1.23 2.06-3 0-1.57-1.13-2.66-2.74-2.66A2.84 2.84 0 003.78 4.7c0 .55.21 1.14.48 1.46.05.06.06.12.04.18l-.18.73c-.03.12-.1.14-.22.09-.83-.39-1.35-1.59-1.35-2.56 0-2.09 1.52-4 4.38-4 2.3 0 4.09 1.64 4.09 3.83 0 2.29-1.44 4.13-3.44 4.13-.67 0-1.3-.35-1.52-.76l-.41 1.57c-.14.53-.5 1.13-.77 1.52A5 5 0 006 1z" },
  sc: { color: "#ff5500", path: "M1 7.5s0-3 2.5-4.5c1.5-.9 3-.8 3-.8V1L10 4.5 6.5 8V6.5S4 6 2.5 7.5c-.8.8-1 2-1 2V7.5z" },
  be: { color: "#1769FF", path: "M1 3h3.5a1.5 1.5 0 011.37 2.13A1.75 1.75 0 014.75 9H1V3zm1.2 2.3h2.1a.6.6 0 000-1.2H2.2v1.2zm0 2.5h2.55a.75.75 0 000-1.5H2.2v1.5zM7 3h4v1h-4zM7 5.5h3.5a1.5 1.5 0 011.5 1.5v.5A1.5 1.5 0 0110.5 9H7V5.5zm1.2 1.2v1.1h2.1a.55.55 0 000-1.1H8.2z" },
};

export function PhoneMockup({ pack, isActive, onClick, liveDesign }: { pack: DesignPack; isActive: boolean; onClick: () => void; liveDesign?: DesignConfig }) {
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
        const icon = SOCIAL_ICON[s] || { color: accent, path: "M6 2a4 4 0 100 8 4 4 0 000-8z" };
        const iconColor = socialStyle === "mono" ? monoColor : icon.color;
        const sz = size === "small" ? 22 : 26;
        /* White glass mode — fundo branco sólido 92%, ícone em cor brand, para uso sobre foto */
        if (whiteGlass) {
          return (
            <div key={i} className="rounded-full flex items-center justify-center"
              style={{
                width: sz, height: sz,
                background: "rgba(255,255,255,0.92)",
                border: "1.5px solid rgba(255,255,255,0.95)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.15)",
              }}>
              <svg width={sz - 10} height={sz - 10} viewBox="0 0 12 12" fill={icon.color}>
                <path d={icon.path} />
              </svg>
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
            }}>
            <svg width={sz - 11} height={sz - 11} viewBox="0 0 12 12" fill={iconColor}>
              <path d={icon.path} />
            </svg>
          </div>
        );
      })}
    </div>
  );

  /* Stats row */
  const StatsRow = () => ref.stats && ref.stats.length > 0 ? (
    <div className="flex justify-center gap-4 px-2 mt-1.5">
      {ref.stats.map((s, i) => (
        <div key={i} className="flex flex-col items-center">
          <span className="text-[11px] font-extrabold leading-none" style={{ color: textC, letterSpacing: "-0.02em" }}>{s.value}</span>
          <span className="text-[7px] leading-none mt-[2px] font-light opacity-55" style={{ color: textC, letterSpacing: "0.02em" }}>{s.label}</span>
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

  /* Hero banner — primary product with full-bleed image + pill CTA */
  const heroProduct = ref.products[0];
  const secondaryProduct = ref.products[1];
  const renderHeroBanner = () => heroProduct ? (
    <div className="relative w-full overflow-hidden rounded-[12px]" style={{ height: 135 }}>
      {heroProduct.image ? (
        <img src={heroProduct.image} alt="" className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" loading="lazy" />
      ) : (
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}40, ${accent2}50)` }} />
      )}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.50) 25%, rgba(0,0,0,0.15) 55%, transparent 80%)",
      }} />
      <div className="absolute inset-x-0 bottom-0 p-2.5 flex items-end justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-white leading-tight" style={{ fontWeight: 700, letterSpacing: "-0.01em", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
            {heroProduct.title}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[9.5px] font-bold text-white" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>{heroProduct.price}</span>
            {heroProduct.originalPrice && <span className="text-[8px] line-through opacity-60 text-white font-light">{heroProduct.originalPrice}</span>}
            {heroProduct.discount && <span className="text-[6.5px] font-extrabold px-1 py-[1px] rounded-[3px]" style={{ background: "rgba(255,255,255,0.25)", color: "#fff" }}>{heroProduct.discount}</span>}
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

  /* Secondary product — large row card */
  const renderSecondaryCard = () => secondaryProduct ? (
    <div className="overflow-hidden" style={{ borderRadius: 14, ...productCardStyle }}>
      <div className="flex items-center gap-2 p-2">
        {secondaryProduct.image ? (
          <img src={secondaryProduct.image} alt="" className="w-[44px] h-[44px] rounded-[9px] object-cover flex-shrink-0" crossOrigin="anonymous" loading="lazy" />
        ) : (
          <div className="w-[44px] h-[44px] rounded-[9px] flex-shrink-0" style={{ background: `${accent}15` }} />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[9.5px] truncate leading-tight" style={{ color: textC, fontWeight: 800, letterSpacing: "-0.01em" }}>{secondaryProduct.title}</p>
          <div className="flex items-center gap-1 mt-[2px]">
            <span className="text-[9px] font-extrabold" style={{ color: textC }}>{secondaryProduct.price}</span>
            {secondaryProduct.originalPrice && <span className="text-[7.5px] line-through opacity-45 font-light" style={{ color: textC }}>{secondaryProduct.originalPrice}</span>}
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
    <button onClick={onClick} className="group flex-shrink-0 flex flex-col items-center gap-3 transition-all duration-500 ease-out hover:-translate-y-1" style={{ width: 340, transform: isActive ? "scale(1.03)" : "scale(1)" }}>
      {/* Phone body — premium device frame LARGE (Stan-style chamativo) */}
      <div className="relative" style={{
        boxShadow: isActive
          ? `0 40px 100px rgba(124,58,237,0.30), 0 20px 60px rgba(0,0,0,0.45), 0 0 0 3px hsl(var(--primary))`
          : "0 25px 70px rgba(0,0,0,0.18), 0 10px 28px rgba(0,0,0,0.20)",
        borderRadius: 42,
        transition: "box-shadow 0.5s ease, transform 0.3s ease",
      }}>
        <div className={`relative w-[330px] rounded-[40px] overflow-hidden transition-all duration-500 ${isActive ? "ring-2 ring-primary ring-offset-4 ring-offset-[hsl(var(--dash-bg))]" : "ring-1 ring-white/[0.06] group-hover:ring-white/[0.14]"}`}
          style={{ aspectRatio: "9/18", border: "3px solid #0f0f0f", boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)" }}>

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
          <div className="relative flex flex-col h-full pt-[22px] pb-3" style={{ fontFamily: `"${dd.fontHeading || "Plus Jakarta Sans"}", sans-serif` }}>

            {/* ═══ HEADER: Big_Circle_Master (Mateus, Vitor) ═══ */}
            {headerType === "big-circle" && (
              <div className="flex flex-col items-center px-3.5 pt-1.5">
                <div className="w-[84px] h-[84px] rounded-full overflow-hidden flex-shrink-0 relative" style={{
                  padding: 2.5,
                  background: `conic-gradient(from 180deg, ${accent}, ${accent2 || accent}, ${accent})`,
                  boxShadow: `0 6px 20px ${accent}40, 0 2px 6px rgba(0,0,0,0.15)`,
                }}>
                  <div className="w-full h-full rounded-full overflow-hidden" style={{ background: bg }}>
                    <img src={displayAvatar} alt="" className="w-full h-full object-cover" style={{ objectPosition: "center top" }} crossOrigin="anonymous" loading="lazy" />
                  </div>
                </div>
                <p className="text-[16px] leading-[1.05] mt-1.5 text-center" style={{ color: textC, fontWeight: 800, letterSpacing: "-0.02em" }}>
                  {ref.name}<VerifiedBadge />
                </p>
                <p className="text-[9px] text-center mt-[1px]" style={{ color: accent, fontWeight: 600, letterSpacing: "0.02em" }}>{ref.username}</p>
                <p className="text-[8.5px] leading-[1.3] text-center mt-0.5 line-clamp-2 px-2" style={{ color: textC, fontWeight: 500, opacity: 0.88 }}>{ref.bio}</p>
                <div className="mt-1.5"><SocialPills size="small" centered /></div>
              </div>
            )}

            {/* ═══ HEADER: Edge_to_Edge_Header (Léo, Lucas) ═══ */}
            {headerType === "edge-to-edge" && (
              <div className="w-full flex-shrink-0 relative overflow-hidden" style={{ height: 180 }}>
                <img src={displayAvatar} alt="" className="w-full h-full object-cover" style={{ objectPosition: "center 15%" }} crossOrigin="anonymous" loading="lazy" />
                {/* Gradient com intensidade configurável por pack (minimal vs normal) */}
                <div className="absolute inset-0" style={{
                  background: pack.edgeGradientIntensity === "minimal"
                    /* MINIMAL: só uma sombra escura mínima nos últimos 8-10% para legibilidade do texto */
                    ? `linear-gradient(to top, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.18) 10%, rgba(0,0,0,0.05) 18%, transparent 28%)`
                    /* NORMAL: gradient equilibrado padrão */
                    : `linear-gradient(to top, ${bg} 0%, ${bg}E8 15%, ${bg}80 30%, ${bg}25 42%, transparent 52%)`,
                }} />
                <div className="absolute bottom-2.5 left-3.5 right-3.5 flex flex-col items-center text-center">
                  {(() => {
                    const isMinimalPack = pack.edgeGradientIntensity === "minimal";
                    /* Drop-shadow LIMPO profissional (sem outline amador) — sombra suave com profundidade */
                    const cleanShadow = "0 2px 10px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.40)";
                    return (<>
                      <p className="text-[17px] leading-[1.02]" style={{
                        color: isMinimalPack ? "#fff" : (isLight ? textC : "#fff"),
                        textShadow: isMinimalPack ? cleanShadow : (isLight ? "0 1px 2px rgba(255,255,255,0.4)" : "0 2px 10px rgba(0,0,0,0.55)"),
                        fontWeight: 900, letterSpacing: "-0.025em",
                      }}>{ref.name}<VerifiedBadge /></p>
                      <p className="text-[10px] mt-0.5" style={{
                        color: isMinimalPack ? "#fff" : accent,
                        textShadow: isMinimalPack ? cleanShadow : (isLight ? "0 1px 1px rgba(255,255,255,0.3)" : "0 1px 3px rgba(0,0,0,0.35)"),
                        fontWeight: 800, letterSpacing: "0.02em"
                      }}>{ref.username}</p>
                      <p className="text-[9px] leading-[1.35] mt-1 line-clamp-2 px-1" style={{
                        color: isMinimalPack ? "#fff" : (isLight ? textC : "rgba(255,255,255,0.95)"),
                        textShadow: isMinimalPack ? cleanShadow : (isLight ? "none" : "0 1px 3px rgba(0,0,0,0.45)"),
                        fontWeight: 700,
                        opacity: isMinimalPack ? 1 : (isLight ? 0.88 : 1)
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
                  <img src={displayAvatar} alt="" className="w-full h-full object-cover" style={{ objectPosition: "center top" }} crossOrigin="anonymous" loading="lazy" />
                </div>
                <p className="text-[18px] leading-[1.02] mt-2 text-center" style={{ color: textC, fontWeight: 600, letterSpacing: "-0.02em" }}>
                  {ref.name}<VerifiedBadge />
                </p>
                <p className="text-[9px] text-center mt-[1px]" style={{ color: accent, fontWeight: 600, letterSpacing: "0.02em" }}>{ref.username}</p>
                <p className="text-[8.5px] leading-[1.3] text-center mt-0.5 line-clamp-2 px-2" style={{ color: textC, fontWeight: 500, opacity: 0.88 }}>{ref.bio}</p>
                <div className="mt-1.5"><SocialPills size="small" centered /></div>
              </div>
            )}

            {/* ═══ HEADER: Split_Editorial (Isabela, Julia) ═══ */}
            {headerType === "split-editorial" && (
              <div className="w-full flex-shrink-0 flex" style={{ height: 155 }}>
                <div className="w-[45%] relative overflow-hidden">
                  <img src={displayAvatar} alt="" className="w-full h-full object-cover" style={{ objectPosition: "center center" }} crossOrigin="anonymous" loading="lazy" />
                </div>
                <div className="w-[55%] flex flex-col justify-center px-2.5">
                  <p className="text-[14px] leading-[1.05]" style={{ color: textC, fontWeight: 700, letterSpacing: "-0.02em" }}>
                    {ref.name}<VerifiedBadge />
                  </p>
                  <p className="text-[8.5px] mt-0.5" style={{ color: accent, fontWeight: 600, letterSpacing: "0.02em" }}>{ref.username}</p>
                  <p className="text-[8.5px] leading-[1.3] mt-1 line-clamp-3" style={{ color: textC, fontWeight: 500, opacity: 0.88 }}>{ref.bio}</p>
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
                  <img src={displayAvatar} alt="" className="w-full h-full object-cover" style={{ objectPosition: "center top" }} crossOrigin="anonymous" loading="lazy" />
                </div>
                <p className="text-[15px] leading-tight text-center mb-1" style={{ color: dd.nameColor || textC, fontWeight: 800, letterSpacing: "-0.02em" }}>
                  {ref.name}<VerifiedBadge />
                </p>
                <p className="text-[8px] text-center mb-1" style={{ color: accent, letterSpacing: "0.03em" }}>{ref.username}</p>
                <p className="text-[8.5px] leading-snug text-center mb-1.5 px-4 line-clamp-2" style={{ color: textC, fontWeight: 500, opacity: 0.88 }}>{ref.bio}</p>
                <div className="flex justify-center"><SocialPills size="small" /></div>
              </>
            )}

            {/* ═══ STATS — snug below header ═══ */}
            <StatsRow />

            {/* ═══ HERO BANNER — primary product ═══ */}
            <div className="px-3.5 mt-1.5 mb-1.5">
              {renderHeroBanner()}
            </div>

            {/* ═══ SECONDARY — large row card ═══ */}
            <div className="px-3.5 mt-auto">
              {renderSecondaryCard()}
            </div>
          </div>

          {/* ── Home indicator (iOS) ── */}
          <div className="absolute bottom-[5px] left-1/2 -translate-x-1/2 w-[38%] h-[3px] rounded-full z-20" style={{ background: `${textC}20` }} />
        </div>
      </div>

      {/* Pack label */}
      <div className="text-center">
        <p className={`text-[13px] font-bold transition-colors duration-300 ${isActive ? "text-primary" : "text-[hsl(var(--dash-text))] group-hover:text-[hsl(var(--dash-text))]"}`}
          style={{ fontFamily: `"${dd.fontHeading || "Inter"}", sans-serif` }}>
          {pack.label}
        </p>
        <p className={`text-[10px] transition-colors duration-300 ${isActive ? "text-primary/60" : "text-[hsl(var(--dash-text-subtle))]"}`}>
          {pack.desc}
        </p>
      </div>
    </button>
  );
}
