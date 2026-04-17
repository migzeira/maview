import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  Check, ChevronLeft, ChevronRight, Sparkles, Wand2, Save, Loader2, Upload, ImageIcon, X as XIcon,
  ZoomIn, Move,
} from "lucide-react";

import {
  type DesignConfig, type DesignTabProps, type ThemeDef, type SampleProduct, type SampleLink,
  DESIGN_PACKS, PACK_CATEGORIES, REFERENCE_PROFILES,
  ACCENT_COLORS, GOOGLE_FONTS, FONT_PAIRS,
} from "./design/constants";
import { generateHarmony, extractColorsFromImage, loadFont, getContrastColors } from "./design/utils";
import FontSelector from "./design/FontSelector";
import AdvancedDrawer from "./design/AdvancedDrawer";
import DesignWizardProgress from "./design/DesignWizardProgress";
import { getEffectPreviewElements } from "./design/EffectThumbnailGrid";
import { uploadImage } from "@/lib/vitrine-sync";

import type { DesignPack } from "./design/constants";

/* ═══════════════════════════════════════════════════════════════════
   Premium Phone Mockup — realistic device with dense creator content
   ═══════════════════════════════════════════════════════════════════ */

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

function PhoneMockup({ pack, isActive, onClick, liveDesign }: { pack: DesignPack; isActive: boolean; onClick: () => void; liveDesign?: DesignConfig }) {
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

  /* Glass/clay social icons — premium physical button feel */
  const SocialPills = ({ centered, size = "normal" }: { centered?: boolean; size?: "small" | "normal" }) => (
    <div className={`flex gap-[6px] ${centered ? "justify-center" : ""}`}>
      {ref.socials.slice(0, 4).map((s, i) => {
        const icon = SOCIAL_ICON[s] || { color: accent, path: "M6 2a4 4 0 100 8 4 4 0 000-8z" };
        const iconColor = socialStyle === "mono" ? monoColor : icon.color;
        const sz = size === "small" ? 22 : 26;
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
    <button onClick={onClick} className="group flex-shrink-0 flex flex-col items-center gap-2.5 transition-all duration-500 ease-out" style={{ width: 280 }}>
      {/* Phone body — premium device frame */}
      <div className="relative" style={{
        boxShadow: isActive
          ? `0 30px 80px rgba(124,58,237,0.18), 0 20px 60px rgba(0,0,0,0.35)`
          : "0 20px 60px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.15)",
        borderRadius: 36,
        transition: "box-shadow 0.5s ease",
      }}>
        <div className={`relative w-[270px] rounded-[34px] overflow-hidden transition-all duration-500 ${isActive ? "ring-[2.5px] ring-primary ring-offset-2 ring-offset-[hsl(var(--dash-bg))]" : "ring-1 ring-white/[0.05] group-hover:ring-white/[0.10]"}`}
          style={{ aspectRatio: "9/17", border: "2px solid #1a1a1a", boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)" }}>

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
            {dd.bgEffect && <div className="absolute inset-0 opacity-60 overflow-hidden">{getEffectPreviewElements(dd.bgEffect, accent)}</div>}
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
                <p className="text-[9px] text-center mt-[1px]" style={{ color: accent, fontWeight: 400, letterSpacing: "0.03em" }}>{ref.username}</p>
                <p className="text-[8.5px] leading-[1.3] text-center mt-0.5 line-clamp-2 px-2" style={{ color: subC, fontWeight: 300 }}>{ref.bio}</p>
                <div className="mt-1.5"><SocialPills size="small" centered /></div>
              </div>
            )}

            {/* ═══ HEADER: Edge_to_Edge_Header (Léo, Lucas) ═══ */}
            {headerType === "edge-to-edge" && (
              <div className="w-full flex-shrink-0 relative overflow-hidden" style={{ height: 180 }}>
                <img src={displayAvatar} alt="" className="w-full h-full object-cover" style={{ objectPosition: "center 15%" }} crossOrigin="anonymous" loading="lazy" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${bg} 0%, ${bg}F0 12%, ${bg}90 30%, ${bg}30 55%, transparent 80%)` }} />
                <div className="absolute bottom-2.5 left-3.5 right-3.5">
                  <p className="text-[17px] leading-[1.02]" style={{
                    color: isLight ? textC : "#fff",
                    textShadow: isLight ? "none" : "0 2px 10px rgba(0,0,0,0.50)",
                    fontWeight: 800, letterSpacing: "-0.025em",
                  }}>{ref.name}<VerifiedBadge /></p>
                  <p className="text-[9px] mt-0.5" style={{ color: isLight ? accent : `${accent}DD`, textShadow: isLight ? "none" : "0 1px 3px rgba(0,0,0,0.3)", fontWeight: 400, letterSpacing: "0.03em" }}>{ref.username}</p>
                  <p className="text-[8.5px] leading-[1.3] mt-0.5 line-clamp-2" style={{ color: isLight ? subC : "rgba(255,255,255,0.9)", textShadow: isLight ? "none" : "0 1px 3px rgba(0,0,0,0.4)", fontWeight: 300 }}>{ref.bio}</p>
                  <div className="mt-1.5"><SocialPills size="small" /></div>
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
                <p className="text-[9px] text-center mt-[1px]" style={{ color: accent, fontWeight: 400, letterSpacing: "0.03em" }}>{ref.username}</p>
                <p className="text-[8.5px] leading-[1.3] text-center mt-0.5 line-clamp-2 px-2" style={{ color: subC, fontWeight: 300 }}>{ref.bio}</p>
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
                  <p className="text-[8.5px] mt-0.5" style={{ color: accent, fontWeight: 400, letterSpacing: "0.03em" }}>{ref.username}</p>
                  <p className="text-[8.5px] leading-[1.3] mt-1 line-clamp-3" style={{ color: subC, fontWeight: 300 }}>{ref.bio}</p>
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
                <p className="text-[8.5px] leading-snug text-center mb-1.5 px-4 line-clamp-2" style={{ color: subC, fontWeight: 300 }}>{ref.bio}</p>
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

/* ═══════════════════════════════════════════════════════════════════
   Main DesignTab — 3-step wizard + advanced drawer
   ═══════════════════════════════════════════════════════════════════ */
export default function DesignTab({ config, themes, defaultDesign, updateConfig, onForceSave }: DesignTabProps) {
  const d: DesignConfig = { ...defaultDesign, ...config.design } as DesignConfig;
  const currentTheme = themes.find(t => t.id === config.theme) ?? themes[0];
  const [activeTemplateIdx, setActiveTemplateIdx] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [interacted, setInteracted] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [bgUploading, setBgUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [pendingContent, setPendingContent] = useState<{ products: SampleProduct[]; links: SampleLink[] } | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const designRef = useRef(config.design);
  designRef.current = config.design;

  const setDesign = useCallback((key: keyof DesignConfig, value: any) => {
    const latest = { ...(designRef.current || {}), [key]: value };
    designRef.current = latest;
    updateConfig("design", latest);
  }, [updateConfig]);

  useEffect(() => {
    if (d.fontHeading && d.fontHeading !== "Inter") loadFont(d.fontHeading);
    if (d.fontBody && d.fontBody !== "Inter") loadFont(d.fontBody);
  }, [d.fontHeading, d.fontBody]);



  const accent = d.accentColor || currentTheme.accent;

  const applyPack = useCallback((pack: DesignPack) => {
    updateConfig("theme", pack.config.theme);
    // Preserve ONLY user-uploaded images (not template Unsplash images) and profile colors
    const prev = designRef.current || {};
    const preserved: Record<string, unknown> = {};
    const isUserUpload = (url: string | undefined) => url && !url.includes("images.unsplash.com");
    const newPackUsesBgImage = pack.config.design.bgType === "image";
    const isShowcase = pack.category === "showcase";
    // Don't preserve user bg image for showcase packs — they have their own curated images
    if (prev.bgImageUrl && isUserUpload(prev.bgImageUrl as string) && newPackUsesBgImage && !isShowcase) {
      preserved.bgImageUrl = prev.bgImageUrl;
      preserved.bgType = "image";
      if (prev.bgOverlay) preserved.bgOverlay = prev.bgOverlay;
      if (prev.bgImageZoom) preserved.bgImageZoom = prev.bgImageZoom;
      if (prev.bgImagePosX !== undefined) preserved.bgImagePosX = prev.bgImagePosX;
      if (prev.bgImagePosY !== undefined) preserved.bgImagePosY = prev.bgImagePosY;
    }
    if (prev.coverImageUrl && isUserUpload(prev.coverImageUrl as string) && !isShowcase) preserved.coverImageUrl = prev.coverImageUrl;
    if (prev.profileBorderColor) preserved.profileBorderColor = prev.profileBorderColor;
    if (prev.profileGlowColor) preserved.profileGlowColor = prev.profileGlowColor;
    const latest = { profileGlow: true, ...pack.config.design, ...preserved };
    designRef.current = latest;
    updateConfig("design", latest);
    if (pack.config.design.fontHeading) loadFont(pack.config.design.fontHeading);
    if (pack.config.design.fontBody) loadFont(pack.config.design.fontBody);
    setInteracted(prev => new Set(prev).add(1));

    // Populate sample content for showcase packs when user has no products
    const userProducts = config.products || [];
    const hasUserProducts = userProducts.some((p: any) => p.title && p.title !== "");
    if (pack.sampleProducts && pack.sampleProducts.length > 0 && !hasUserProducts) {
      setPendingContent({ products: [...pack.sampleProducts], links: pack.sampleLinks || [] });
      setShowContentModal(true);
    }
  }, [updateConfig, config.products]);

  const applyFontPair = useCallback((headingFont: string) => {
    loadFont(headingFont);
    const paired = FONT_PAIRS[headingFont];
    if (paired) loadFont(paired);
    const latest = { ...(designRef.current || {}), fontHeading: headingFont, ...(paired ? { fontBody: paired } : {}) };
    designRef.current = latest;
    updateConfig("design", latest);
    setInteracted(prev => new Set(prev).add(3));
  }, [updateConfig]);

  const confirmSampleContent = useCallback(() => {
    if (!pendingContent) return;
    const genId = () => Math.random().toString(36).slice(2, 9);
    // Create products from sample data
    const newProducts = pendingContent.products.map(sp => ({
      id: genId(), title: sp.title, description: "", price: sp.price || "", originalPrice: "",
      emoji: sp.emoji || "📦", images: [] as string[], url: "", linkType: "whatsapp" as const,
      whatsappMsg: "", ctaText: "", badge: "", urgency: false, active: true,
    }));
    // Create links from sample data
    const newLinks = pendingContent.links.map(sl => ({
      id: genId(), title: sl.title, url: "", icon: sl.icon || "link",
      type: sl.type || "link", isSocial: false, active: true,
    }));
    // Create blocks for ordering
    const newBlocks = [
      ...newProducts.map(p => ({ id: genId(), type: "product" as const, refId: p.id })),
      ...newLinks.map(l => ({ id: genId(), type: "link" as const, refId: l.id })),
    ];
    updateConfig("products", newProducts);
    updateConfig("links", newLinks);
    updateConfig("blocks", newBlocks);
    setShowContentModal(false);
    setPendingContent(null);
  }, [pendingContent, updateConfig]);

  const applyAutoHarmony = useCallback((accentHex: string) => {
    const harmony = generateHarmony(accentHex);
    const latest = { ...(designRef.current || {}), accentColor: accentHex, accentColor2: harmony.accent2,
      bgColor: harmony.bgColor, cardBg: harmony.cardBg, cardBorder: harmony.cardBorder,
      textColor: harmony.textColor, subtextColor: harmony.subtextColor };
    designRef.current = latest;
    updateConfig("design", latest);
    setInteracted(prev => new Set(prev).add(2));
  }, [updateConfig]);

  const handleBgColorChange = useCallback((color: string) => {
    const contrast = getContrastColors(color);
    const latest = { ...(designRef.current || {}), bgColor: color, textColor: contrast.textColor, subtextColor: contrast.subtextColor };
    designRef.current = latest;
    updateConfig("design", latest);
  }, [updateConfig]);

  const autoThemeFromAvatar = useCallback(async () => {
    if (!config.avatarUrl) return;
    const colors = await extractColorsFromImage(config.avatarUrl);
    const darken = (hex: string) => {
      const r = Math.max(0, parseInt(hex.slice(1, 3), 16) * 0.15) | 0;
      const g = Math.max(0, parseInt(hex.slice(3, 5), 16) * 0.15) | 0;
      const b = Math.max(0, parseInt(hex.slice(5, 7), 16) * 0.15) | 0;
      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    };
    const latest = { ...(designRef.current || {}), bgColor: darken(colors.dominant), accentColor: colors.dominant, accentColor2: colors.accent };
    designRef.current = latest;
    updateConfig("design", latest);
  }, [config.avatarUrl, updateConfig]);

  /* All 8 showcase templates */
  const showcasePacks = DESIGN_PACKS;

  /* Sync activeTemplateIdx with current applied theme */
  useEffect(() => {
    const matched = showcasePacks.findIndex(p =>
      config.theme === p.config.theme
      && d.fontHeading === (p.config.design.fontHeading || "Inter")
      && d.bgEffect === (p.config.design.bgEffect || "")
    );
    if (matched >= 0 && matched !== activeTemplateIdx) setActiveTemplateIdx(matched);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.theme]);

  const isPackActive = (pack: DesignPack) => config.theme === pack.config.theme
    && d.fontHeading === (pack.config.design.fontHeading || "Inter")
    && d.bgEffect === (pack.config.design.bgEffect || "");

  /* Arc carousel arrangement — based on distance from activeTemplateIdx */
  const getArcArrangement = (packIdx: number) => {
    const dist = packIdx - activeTemplateIdx;
    const presets: Record<number, { rotation: number; offsetY: number; scale: number; zIndex: number; translateX: number }> = {
      [-3]: { rotation: 18, offsetY: 50, scale: 0.76, zIndex: 1, translateX: -540 },
      [-2]: { rotation: 12, offsetY: 30, scale: 0.82, zIndex: 2, translateX: -380 },
      [-1]: { rotation: 6, offsetY: 12, scale: 0.90, zIndex: 4, translateX: -210 },
      [0]:  { rotation: 0, offsetY: -18, scale: 1.05, zIndex: 10, translateX: 0 },
      [1]:  { rotation: -6, offsetY: 12, scale: 0.90, zIndex: 4, translateX: 210 },
      [2]:  { rotation: -12, offsetY: 30, scale: 0.82, zIndex: 2, translateX: 380 },
      [3]:  { rotation: -18, offsetY: 50, scale: 0.76, zIndex: 1, translateX: 540 },
    };
    return presets[dist] || { rotation: 0, offsetY: 0, scale: 0.7, zIndex: 0, translateX: dist > 0 ? 700 : -700 };
  };

  const goToTemplate = (idx: number) => {
    const clamped = Math.max(0, Math.min(showcasePacks.length - 1, idx));
    setActiveTemplateIdx(clamped);
    applyPack(showcasePacks[clamped]);
  };

  const handleCopyLink = useCallback(() => {
    const username = config.username || config.displayName?.toLowerCase().replace(/\s+/g, "");
    if (username) navigator.clipboard.writeText(`${window.location.origin}/${username}`);
  }, [config.username, config.displayName]);

  return (
    <div className="space-y-6 pb-28">

      {/* ═══════ WIZARD PROGRESS ═══════ */}
      <DesignWizardProgress
        completedSteps={interacted}
        username={config.username || config.displayName}
        onCopyLink={handleCopyLink}
      />

      {/* ═══════ 1. TEMPLATE CAROUSEL — Premium Showcase ═══════ */}
      <div className="space-y-4 relative">
        {/* Premium section background glow */}
        <div className="absolute -inset-x-8 -top-8 -bottom-4 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[600px] h-[400px] rounded-full opacity-[0.04]"
            style={{ background: `radial-gradient(ellipse, ${accent} 0%, transparent 70%)`, filter: "blur(80px)" }} />
        </div>

        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-[hsl(var(--dash-text))] font-bold text-[18px] tracking-tight">Escolha seu estilo</h2>
            <p className="text-[11px] text-[hsl(var(--dash-text-subtle))] mt-0.5">Clique em qualquer template para aplicar · 1 clique = design completo</p>
          </div>
          {config.avatarUrl && (
            <button onClick={autoThemeFromAvatar}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-semibold text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/20 hover:bg-fuchsia-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <Wand2 size={12} /> Auto tema
            </button>
          )}
        </div>

        {/* ═══ ARC CAROUSEL — click-to-focus premium showcase ═══ */}
        <div className="relative flex items-end justify-center" style={{
          perspective: "2000px",
          perspectiveOrigin: "50% 50%",
          minHeight: 620,
          paddingTop: 40,
        }}>
          <div ref={carouselRef} className="relative" style={{ width: 0, height: 560 }}>
            {showcasePacks.map((pack, i) => {
              const arr = getArcArrangement(i);
              const isVisible = Math.abs(i - activeTemplateIdx) <= 3;
              const isCenter = i === activeTemplateIdx;
              return (
                <div
                  key={pack.id}
                  className="absolute top-0 left-0"
                  style={{
                    transform: `translateX(calc(-50% + ${arr.translateX}px)) translateY(${arr.offsetY}px) scale(${arr.scale}) rotateY(${arr.rotation}deg)`,
                    transformOrigin: "center bottom",
                    transformStyle: "preserve-3d",
                    zIndex: arr.zIndex,
                    opacity: isVisible ? 1 : 0,
                    pointerEvents: isVisible ? "auto" : "none",
                    transition: "transform 700ms cubic-bezier(0.34, 1.4, 0.64, 1), opacity 400ms ease",
                    filter: isCenter ? "none" : "brightness(0.85)",
                  }}
                >
                  <PhoneMockup
                    pack={pack}
                    isActive={isPackActive(pack)}
                    onClick={() => goToTemplate(i)}
                    liveDesign={isPackActive(pack) ? d : undefined}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ Active Template Name + Desc ═══ */}
        <div className="relative text-center -mt-2">
          <p className="text-[20px] font-extrabold text-[hsl(var(--dash-text))] leading-tight tracking-tight transition-all duration-500" style={{ letterSpacing: "-0.02em" }}>
            {showcasePacks[activeTemplateIdx]?.label}
          </p>
          <p className="text-[12px] text-[hsl(var(--dash-text-subtle))] font-light mt-0.5 transition-all duration-500">
            {showcasePacks[activeTemplateIdx]?.desc}
          </p>
        </div>

        {/* ═══ NAVIGATION: Dots + Arrows ═══ */}
        <div className="relative flex items-center justify-center gap-4 pt-2">
          <button
            onClick={() => goToTemplate(activeTemplateIdx - 1)}
            disabled={activeTemplateIdx === 0}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: "hsl(var(--dash-surface-2))",
              border: "1px solid hsl(var(--dash-border-subtle))",
              color: "hsl(var(--dash-text-muted))",
              backdropFilter: "blur(10px)",
            }}
            aria-label="Template anterior"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-1.5">
            {showcasePacks.map((p, i) => (
              <button
                key={p.id}
                onClick={() => goToTemplate(i)}
                className="transition-all duration-500"
                style={{
                  width: activeTemplateIdx === i ? 28 : 8,
                  height: 8,
                  borderRadius: 999,
                  background: activeTemplateIdx === i ? "hsl(var(--primary))" : "hsl(var(--dash-border))",
                  boxShadow: activeTemplateIdx === i ? "0 0 10px hsl(var(--primary) / 0.5)" : "none",
                  cursor: "pointer",
                }}
                aria-label={`Ver template ${p.label}`}
              />
            ))}
          </div>

          <button
            onClick={() => goToTemplate(activeTemplateIdx + 1)}
            disabled={activeTemplateIdx === showcasePacks.length - 1}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: "hsl(var(--dash-surface-2))",
              border: "1px solid hsl(var(--dash-border-subtle))",
              color: "hsl(var(--dash-text-muted))",
              backdropFilter: "blur(10px)",
            }}
            aria-label="Próximo template"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Active Template indicator */}
        {isPackActive(showcasePacks[activeTemplateIdx]) && (
          <div className="flex items-center justify-center gap-2 text-[12px] pt-1">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "hsl(var(--primary) / 0.12)", border: "1px solid hsl(var(--primary) / 0.30)" }}>
              <Check size={11} className="text-primary" />
              <span className="font-bold text-primary">Template aplicado</span>
            </div>
          </div>
        )}

        {/* ── Background image customization (available for ALL templates) ── */}
        <div className="space-y-3 p-4 rounded-2xl bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon size={14} className="text-primary" />
              <span className="text-[13px] font-bold text-[hsl(var(--dash-text))]">Imagem de fundo</span>
            </div>
            {d.bgImageUrl && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">Ativa</span>
            )}
          </div>

          {/* Preview da imagem com controles */}
          {d.bgImageUrl ? (
            <div className="relative rounded-xl overflow-hidden h-28">
              <div className="absolute inset-0" style={{
                backgroundImage: `url(${d.bgImageUrl})`,
                backgroundSize: `${d.bgImageZoom ?? 100}%`,
                backgroundPosition: `${d.bgImagePosX ?? 50}% ${d.bgImagePosY ?? 50}%`,
                backgroundRepeat: "no-repeat",
                backgroundColor: "#111",
              }} />
              <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${(d.bgOverlay ?? 40) / 100})` }} />
              <button onClick={() => {
                setDesign("bgImageUrl", "");
                // Restore previous bgType if it was not image
                if (d.bgEffect) setDesign("bgType", "effect");
                else setDesign("bgType", "solid");
              }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                <XIcon size={12} />
              </button>
              <button onClick={() => bgImageInputRef.current?.click()}
                className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 text-[11px] font-semibold text-gray-800 hover:bg-white transition-all shadow-md">
                <Upload size={11} /> Trocar foto
              </button>
              {bgUploading && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 text-[10px] font-medium text-white">
                  <Loader2 size={10} className="animate-spin" /> Salvando...
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => bgImageInputRef.current?.click()}
              className="w-full h-20 rounded-xl border-2 border-dashed border-[hsl(var(--dash-border))] flex flex-col items-center justify-center gap-1.5 text-[hsl(var(--dash-text-subtle))] hover:border-primary/40 hover:text-primary transition-all">
              <Upload size={16} />
              <span className="text-[11px] font-medium">Adicionar imagem de fundo</span>
            </button>
          )}
          <input type="file" ref={bgImageInputRef} accept="image/*" className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              e.target.value = "";
              // Show base64 preview immediately while uploading
              const reader = new FileReader();
              reader.onload = () => {
                setDesign("bgImageUrl", reader.result as string);
                setDesign("bgType", "image");
                if (!d.bgOverlay || d.bgOverlay < 20) setDesign("bgOverlay", 40);
              };
              reader.readAsDataURL(f);
              // Upload to Supabase Storage in background
              setBgUploading(true);
              const publicUrl = await uploadImage(f, "backgrounds");
              setBgUploading(false);
              if (publicUrl) {
                setDesign("bgImageUrl", publicUrl);
                // Auto-extract dominant color and apply to profile border + glow
                try {
                  const colors = await extractColorsFromImage(publicUrl);
                  if (colors?.dominant) {
                    setDesign("profileBorderColor", colors.dominant);
                    setDesign("profileGlowColor", colors.dominant);
                  }
                } catch { /* color extraction is best-effort */ }
              }
            }}
          />

          {/* Sliders de ajuste */}
          {d.bgImageUrl && (
            <div className="space-y-2.5">
              {/* Escurecimento / Opacidade */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[hsl(var(--dash-text-muted))] whitespace-nowrap w-24">Escurecimento</span>
                <input type="range" min="0" max="90" step="5" value={d.bgOverlay ?? 40}
                  onChange={(e) => setDesign("bgOverlay", Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-full accent-primary" />
                <span className="text-[11px] font-semibold text-[hsl(var(--dash-text))] w-8 text-right">{d.bgOverlay ?? 40}%</span>
              </div>

              {/* Zoom */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[hsl(var(--dash-text-muted))] whitespace-nowrap w-24 flex items-center gap-1">
                  <ZoomIn size={10} /> Zoom
                </span>
                <input type="range" min="100" max="300" step="5" value={d.bgImageZoom ?? 100}
                  onChange={(e) => setDesign("bgImageZoom", Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-full accent-primary" />
                <span className="text-[11px] font-semibold text-[hsl(var(--dash-text))] w-8 text-right">{d.bgImageZoom ?? 100}%</span>
              </div>

              {/* Posicao Horizontal */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[hsl(var(--dash-text-muted))] whitespace-nowrap w-24 flex items-center gap-1">
                  <Move size={10} /> Horizontal
                </span>
                <input type="range" min="0" max="100" step="1" value={d.bgImagePosX ?? 50}
                  onChange={(e) => setDesign("bgImagePosX", Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-full accent-primary" />
                <span className="text-[11px] font-semibold text-[hsl(var(--dash-text))] w-8 text-right">{d.bgImagePosX ?? 50}%</span>
              </div>

              {/* Posicao Vertical */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[hsl(var(--dash-text-muted))] whitespace-nowrap w-24 flex items-center gap-1">
                  <Move size={10} /> Vertical
                </span>
                <input type="range" min="0" max="100" step="1" value={d.bgImagePosY ?? 50}
                  onChange={(e) => setDesign("bgImagePosY", Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-full accent-primary" />
                <span className="text-[11px] font-semibold text-[hsl(var(--dash-text))] w-8 text-right">{d.bgImagePosY ?? 50}%</span>
              </div>

              {/* Reset button */}
              <button onClick={() => {
                const latest = { ...(designRef.current || {}), bgImageZoom: 100, bgImagePosX: 50, bgImagePosY: 50, bgOverlay: 40 };
                designRef.current = latest;
                updateConfig("design", latest);
              }}
                className="w-full py-1.5 rounded-lg text-[11px] font-medium text-[hsl(var(--dash-text-subtle))] hover:text-primary border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 transition-all">
                Resetar ajustes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Cover image (banner no topo do perfil) ── */}
        <div className="space-y-3 p-4 rounded-2xl bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon size={14} className="text-primary" />
              <span className="text-[13px] font-bold text-[hsl(var(--dash-text))]">Imagem de capa</span>
            </div>
            {d.coverImageUrl && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">Ativa</span>
            )}
          </div>
          <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] -mt-1">Foto no topo do perfil (banner). A cor do tema fica abaixo.</p>

          {d.coverImageUrl ? (
            <div className="relative rounded-xl overflow-hidden h-24">
              <div className="absolute inset-0" style={{
                backgroundImage: `url(${d.coverImageUrl})`,
                backgroundSize: `${d.coverZoom ?? 100}%`,
                backgroundPosition: `${d.coverPosX ?? 50}% ${d.coverPosY ?? 50}%`,
                backgroundRepeat: "no-repeat",
                backgroundColor: "#111",
              }} />
              <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${(d.coverOverlay ?? 0) / 100})` }} />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 30%, ${d.bgColor || "#000"}DD)` }} />
              <button onClick={() => setDesign("coverImageUrl", "")}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                <XIcon size={12} />
              </button>
              <button onClick={() => coverImageInputRef.current?.click()}
                className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 text-[11px] font-semibold text-gray-800 hover:bg-white transition-all shadow-md">
                <Upload size={11} /> Trocar foto
              </button>
              {coverUploading && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 text-[10px] font-medium text-white">
                  <Loader2 size={10} className="animate-spin" /> Salvando...
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => coverImageInputRef.current?.click()}
              className="w-full h-16 rounded-xl border-2 border-dashed border-[hsl(var(--dash-border))] flex flex-col items-center justify-center gap-1.5 text-[hsl(var(--dash-text-subtle))] hover:border-primary/40 hover:text-primary transition-all">
              <Upload size={16} />
              <span className="text-[11px] font-medium">Adicionar imagem de capa</span>
            </button>
          )}
          <input type="file" ref={coverImageInputRef} accept="image/*" className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              e.target.value = "";
              const reader = new FileReader();
              reader.onload = () => setDesign("coverImageUrl", reader.result as string);
              reader.readAsDataURL(f);
              setCoverUploading(true);
              const publicUrl = await uploadImage(f, "backgrounds");
              setCoverUploading(false);
              if (publicUrl) setDesign("coverImageUrl", publicUrl);
            }}
          />

          {/* Sliders de ajuste da capa */}
          {d.coverImageUrl && (
            <div className="space-y-2.5">
              {/* Escurecimento */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[hsl(var(--dash-text-muted))] whitespace-nowrap w-24">Escurecimento</span>
                <input type="range" min="0" max="90" step="5" value={d.coverOverlay ?? 0}
                  onChange={(e) => setDesign("coverOverlay", Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-full accent-primary" />
                <span className="text-[11px] font-semibold text-[hsl(var(--dash-text))] w-8 text-right">{d.coverOverlay ?? 0}%</span>
              </div>

              {/* Zoom */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[hsl(var(--dash-text-muted))] whitespace-nowrap w-24 flex items-center gap-1">
                  <ZoomIn size={10} /> Zoom
                </span>
                <input type="range" min="100" max="300" step="5" value={d.coverZoom ?? 100}
                  onChange={(e) => setDesign("coverZoom", Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-full accent-primary" />
                <span className="text-[11px] font-semibold text-[hsl(var(--dash-text))] w-8 text-right">{d.coverZoom ?? 100}%</span>
              </div>

              {/* Horizontal */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[hsl(var(--dash-text-muted))] whitespace-nowrap w-24 flex items-center gap-1">
                  <Move size={10} /> Horizontal
                </span>
                <input type="range" min="0" max="100" step="1" value={d.coverPosX ?? 50}
                  onChange={(e) => setDesign("coverPosX", Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-full accent-primary" />
                <span className="text-[11px] font-semibold text-[hsl(var(--dash-text))] w-8 text-right">{d.coverPosX ?? 50}%</span>
              </div>

              {/* Vertical */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[hsl(var(--dash-text-muted))] whitespace-nowrap w-24 flex items-center gap-1">
                  <Move size={10} /> Vertical
                </span>
                <input type="range" min="0" max="100" step="1" value={d.coverPosY ?? 50}
                  onChange={(e) => setDesign("coverPosY", Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-full accent-primary" />
                <span className="text-[11px] font-semibold text-[hsl(var(--dash-text))] w-8 text-right">{d.coverPosY ?? 50}%</span>
              </div>

              {/* Reset */}
              <button onClick={() => {
                const latest = { ...(designRef.current || {}), coverZoom: 100, coverPosX: 50, coverPosY: 50, coverOverlay: 0 };
                designRef.current = latest;
                updateConfig("design", latest);
              }}
                className="w-full py-1.5 rounded-lg text-[11px] font-medium text-[hsl(var(--dash-text-subtle))] hover:text-primary border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 transition-all">
                Resetar ajustes
              </button>
            </div>
          )}
        </div>

      {/* ═══════ 2. COLORS — simplified ═══════ */}
      <div className="space-y-3">
        <h3 className="text-[hsl(var(--dash-text))] font-bold text-[14px]">Cor</h3>
        <div className="grid grid-cols-8 gap-2">
          {ACCENT_COLORS.map(c => (
            <button key={c} onClick={() => applyAutoHarmony(c)} title={c}
              className={`w-full aspect-square rounded-xl transition-all hover:scale-110 ${(d.accentColor || currentTheme.accent) === c ? "ring-2 ring-white scale-110 shadow-lg" : "ring-1 ring-white/10"}`}
              style={{ background: c }} />
          ))}
        </div>
        <button onClick={() => {
          const input = document.createElement("input");
          input.type = "color";
          input.value = d.accentColor || currentTheme.accent;
          input.addEventListener("input", (e) => applyAutoHarmony((e.target as HTMLInputElement).value));
          input.click();
        }}
          className="text-[11px] text-[hsl(var(--dash-text-subtle))] hover:text-primary transition-colors">
          Cor personalizada...
        </button>
      </div>

      {/* ═══════ 2.5. TEXT COLORS — quick access ═══════ */}
      <div className="space-y-3">
        <h3 className="text-[hsl(var(--dash-text))] font-bold text-[14px]">Cor dos textos</h3>
        <p className="text-[11px] text-[hsl(var(--dash-text-subtle))] -mt-1">Cada texto tem cor independente. Mais opcoes em "Personalizar mais"</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold text-[hsl(var(--dash-text-muted))] mb-1 block">Seu nome</label>
            <div className="flex items-center gap-2">
              <input type="color" value={d.nameColor || d.textColor || currentTheme.text || "#ffffff"}
                onChange={(e) => setDesign("nameColor", e.target.value)}
                className="w-8 h-8 rounded-lg border border-[hsl(var(--dash-border))] cursor-pointer" />
              <span className="text-[11px] font-mono text-[hsl(var(--dash-text-muted))]">{d.nameColor || d.textColor || currentTheme.text || "#ffffff"}</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-[hsl(var(--dash-text-muted))] mb-1 block">Bio e descricoes</label>
            <div className="flex items-center gap-2">
              <input type="color" value={(() => { const v = d.subtextColor || currentTheme.sub || "#999999"; return v.startsWith("rgba") ? "#999999" : v; })()}
                onChange={(e) => setDesign("subtextColor", e.target.value)}
                className="w-8 h-8 rounded-lg border border-[hsl(var(--dash-border))] cursor-pointer" />
              <span className="text-[11px] font-mono text-[hsl(var(--dash-text-muted))] truncate">{d.subtextColor || currentTheme.sub || "#999999"}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setDesign("textColor", "#ffffff"); setDesign("subtextColor", "rgba(255,255,255,0.80)"); setDesign("nameColor", "#ffffff"); setDesign("productTitleColor", "#ffffff"); setDesign("priceColor", "#ffffff"); setDesign("descriptionColor", "rgba(255,255,255,0.70)"); setDesign("originalPriceColor", "rgba(255,255,255,0.50)"); }}
            className="flex-1 py-2 rounded-xl text-[11px] font-semibold bg-gray-900 text-white border border-gray-700 hover:border-primary/40 transition-all">
            Texto claro
          </button>
          <button onClick={() => { setDesign("textColor", "#111827"); setDesign("subtextColor", "#374151"); setDesign("nameColor", "#111827"); setDesign("productTitleColor", "#111827"); setDesign("priceColor", "#111827"); setDesign("descriptionColor", "#6b7280"); setDesign("originalPriceColor", "#9ca3af"); }}
            className="flex-1 py-2 rounded-xl text-[11px] font-semibold bg-white text-gray-900 border border-gray-300 hover:border-primary/40 transition-all">
            Texto escuro
          </button>
        </div>
      </div>

      {/* ═══════ 3. FONT — simplified ═══════ */}
      <FontSelector
        currentFont={d.fontHeading}
        bodyFont={d.fontBody}
        displayName={config.displayName}
        onSelectFont={applyFontPair}
      />

      {/* ═══════ CUSTOMIZE MORE BUTTON ═══════ */}
      <button onClick={() => setDrawerOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[13px] font-semibold text-primary bg-primary/8 border border-primary/15 hover:bg-primary/15 hover:border-primary/25 transition-all">
        <Sparkles size={15} />
        Personalizar mais
      </button>

      {/* ═══════ ADVANCED DRAWER ═══════ */}
      <AdvancedDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        design={d}
        currentTheme={currentTheme}
        accent={accent}
        avatarUrl={config.avatarUrl}
        displayName={config.displayName}
        setDesign={setDesign}
        onBgColorChange={handleBgColorChange}
      />

      {/* ═══════ SAVE BUTTON — fixed at bottom ═══════ */}
      {onForceSave && (
        <div className="fixed bottom-6 right-4 z-50 sm:right-6 lg:right-[380px]">
          <button
            onClick={async () => {
              setSaving(true);
              setSaveSuccess(false);
              const ok = await onForceSave();
              setSaving(false);
              if (ok) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
              }
            }}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[13px] font-bold shadow-xl transition-all duration-300 ${
              saveSuccess
                ? "bg-emerald-500 text-white shadow-emerald-500/30"
                : saving
                  ? "bg-primary/80 text-white/80 cursor-wait"
                  : "bg-primary text-white hover:bg-primary/90 shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02]"
            }`}>
            {saving ? (
              <><Loader2 size={15} className="animate-spin" /> Salvando...</>
            ) : saveSuccess ? (
              <><Check size={15} /> Salvo!</>
            ) : (
              <><Save size={15} /> Salvar vitrine</>
            )}
          </button>
        </div>
      )}

      {/* ═══════ CONTENT MODAL — Showcase template content ═══════ */}
      {showContentModal && pendingContent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setShowContentModal(false); setPendingContent(null); }}>
          <div className="relative w-full max-w-[400px] mx-4 rounded-2xl overflow-hidden shadow-2xl" style={{ background: "hsl(var(--dash-card))", border: "1px solid hsl(var(--dash-border))" }} onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={18} className="text-primary" />
                <h3 className="text-[16px] font-bold text-[hsl(var(--dash-text))]">Vitrine pronta!</h3>
              </div>
              <p className="text-[13px] text-[hsl(var(--dash-text-subtle))]">Edite os nomes e precos dos seus produtos. Voce pode alterar depois.</p>
            </div>
            <div className="px-6 space-y-3">
              {pendingContent.products.map((sp, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "hsl(var(--dash-bg))", border: "1px solid hsl(var(--dash-border-subtle))" }}>
                  <span className="text-xl flex-shrink-0">{sp.emoji || "📦"}</span>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <input type="text" value={sp.title} onChange={e => {
                      const updated = [...pendingContent.products];
                      updated[i] = { ...updated[i], title: e.target.value };
                      setPendingContent({ ...pendingContent, products: updated });
                    }} className="w-full bg-transparent text-[14px] font-semibold text-[hsl(var(--dash-text))] outline-none border-b border-[hsl(var(--dash-border-subtle))] focus:border-primary pb-0.5 transition-colors" placeholder="Nome do produto" />
                    <input type="text" value={sp.price || ""} onChange={e => {
                      const updated = [...pendingContent.products];
                      updated[i] = { ...updated[i], price: e.target.value };
                      setPendingContent({ ...pendingContent, products: updated });
                    }} className="w-full bg-transparent text-[12px] text-primary outline-none border-b border-[hsl(var(--dash-border-subtle))] focus:border-primary pb-0.5 transition-colors" placeholder="R$ 0,00" />
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-5 flex gap-3">
              <button onClick={() => { setShowContentModal(false); setPendingContent(null); }}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-[hsl(var(--dash-text-subtle))] border border-[hsl(var(--dash-border))] hover:bg-[hsl(var(--dash-bg))] transition-all">
                Pular
              </button>
              <button onClick={confirmSampleContent}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white bg-primary hover:opacity-90 transition-all shadow-sm">
                Adicionar produtos
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
