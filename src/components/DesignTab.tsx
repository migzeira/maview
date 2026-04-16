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
   Rich Phone Mockup — shows a reference profile with real content
   ═══════════════════════════════════════════════════════════════════ */
function PhoneMockup({ pack, isActive, onClick, liveDesign }: { pack: DesignPack; isActive: boolean; onClick: () => void; liveDesign?: DesignConfig }) {
  const { bg: packBg, accent: packAccent, accent2: packAccent2 } = pack.preview;
  // If this is the active pack, use the LIVE design state so edits reflect in real-time
  // BUT never leak the user's uploaded bg image into the pack preview — always show the pack's own bg
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
  const hasCover = !!ref.coverImage;
  const isLight = bg.startsWith("#f") || bg.startsWith("#e") || bg === "#ffffff";
  const textC = dd.textColor || (isLight ? "#111" : "#fff");
  const subC = dd.subtextColor || (isLight ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.55)");
  const btnR = dd.buttonShape === "pill" ? "999px" : dd.buttonShape === "square" ? "3px" : "8px";
  const pR = "9999px"; // Always circle for previews

  return (
    <button onClick={onClick} className={`flex-shrink-0 flex flex-col items-center gap-2 transition-all duration-300 ${isActive ? "scale-[1.04] z-10" : "opacity-80 hover:opacity-100 hover:scale-[1.02]"}`} style={{ width: 195 }}>
      <div className={`relative w-[185px] rounded-[24px] overflow-hidden shadow-2xl transition-all duration-300 ${isActive ? "ring-[3px] ring-primary ring-offset-2 ring-offset-[hsl(var(--dash-bg))] shadow-primary/25" : "ring-1 ring-white/10 hover:ring-white/20"}`}
        style={{ aspectRatio: "9/16" }}>
        {/* Background layer */}
        <div className="absolute inset-0" style={{ background: dd.bgType === "gradient" ? `linear-gradient(to bottom, ${(dd.bgGradient as [string, string])?.[0] || bg}, ${(dd.bgGradient as [string, string])?.[1] || bg})` : bg }}>
          {dd.bgType === "image" && dd.bgImageUrl && (
            <div className="absolute inset-0" style={{
              backgroundImage: `url(${dd.bgImageUrl})`,
              backgroundSize: `${(dd as any).bgImageZoom ?? 100}%`,
              backgroundPosition: `${(dd as any).bgImagePosX ?? 50}% ${(dd as any).bgImagePosY ?? 50}%`,
              backgroundRepeat: "no-repeat",
            }} />
          )}
          {dd.bgType === "image" && (dd.bgOverlay ?? 0) > 0 && (
            <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${(dd.bgOverlay || 0) / 100})` }} />
          )}
          {dd.bgEffect && <div className="absolute inset-0 opacity-70 overflow-hidden">{getEffectPreviewElements(dd.bgEffect, accent)}</div>}
        </div>

        <div className="relative flex flex-col items-center h-full" style={{ fontFamily: `"${dd.fontHeading || "Inter"}", sans-serif` }}>
          {/* Hero section — varies by heroLayout */}
          {dd.heroLayout === "hero-banner" ? (
            <>
              <div className="w-full h-[30px] rounded-t-lg flex-shrink-0 relative overflow-hidden" style={{ background: `url(${ref.avatar}) center/cover no-repeat, ${accent}` }}>
                <div className="absolute bottom-0 left-0 right-0 px-2 pb-0.5">
                  <p className="text-[10px] font-bold leading-tight truncate" style={{ color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>{ref.name}</p>
                </div>
              </div>
              <p className="text-[7px] leading-tight text-center mb-2 px-3 mt-1 line-clamp-2" style={{ color: subC }}>{ref.bio}</p>
            </>
          ) : dd.heroLayout === "side-by-side" ? (
            <>
              <div className="flex flex-row items-center gap-2 w-full px-3 mt-6 mb-2">
                <div className="w-[24px] h-[24px] flex-shrink-0 overflow-hidden" style={{ borderRadius: pR, border: dd.profileBorder ? `2px solid ${dd.profileBorderColor || accent}` : "1px solid rgba(255,255,255,0.1)" }}>
                  <img src={ref.avatar} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-[10px] font-bold leading-tight truncate" style={{ color: textC }}>{ref.name}</p>
                  <div className="h-[4px] w-[40px] rounded-full mt-0.5" style={{ background: `${subC}40` }} />
                  <div className="h-[4px] w-[28px] rounded-full mt-0.5" style={{ background: `${subC}25` }} />
                </div>
              </div>
            </>
          ) : dd.heroLayout === "minimal-top" ? (
            <>
              <div className="flex flex-row items-center gap-1.5 mt-6 mb-1.5 px-3">
                <div className="w-[16px] h-[16px] flex-shrink-0 overflow-hidden" style={{ borderRadius: pR, border: dd.profileBorder ? `1.5px solid ${dd.profileBorderColor || accent}` : "1px solid rgba(255,255,255,0.1)" }}>
                  <img src={ref.avatar} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <p className="text-[10px] font-bold leading-tight truncate" style={{ color: textC }}>{ref.name}</p>
              </div>
              <div className="h-[4px] w-[36px] rounded-full mb-2" style={{ background: `${subC}30` }} />
            </>
          ) : dd.heroLayout === "full-cover" ? (
            <>
              <div className="w-full h-[40px] rounded-t-lg flex-shrink-0 relative overflow-hidden" style={{ background: `url(${ref.avatar}) center/cover no-repeat` }}>
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.65))" }} />
                <div className="absolute bottom-0 left-0 right-0 px-2 pb-1">
                  <p className="text-[11px] font-bold leading-tight truncate" style={{ color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>{ref.name}</p>
                </div>
              </div>
              <p className="text-[7px] leading-tight text-center mb-2 px-3 mt-1 line-clamp-2" style={{ color: subC }}>{ref.bio}</p>
            </>
          ) : (
            /* classic (default) */
            <>
              {hasCover ? (
                <>
                  <div className="w-full h-[70px] flex-shrink-0 relative overflow-hidden">
                    <img src={ref.coverImage} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" loading="lazy" />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 30%, ${bg}DD)` }} />
                  </div>
                  <div className="-mt-6 w-14 h-14 mb-1 flex-shrink-0 overflow-hidden z-10 ring-2" style={{ borderRadius: pR, border: dd.profileBorder ? `2px solid ${dd.profileBorderColor || accent}` : "none", ringColor: bg }}>
                    <img src={ref.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                  </div>
                </>
              ) : (
                <div className="mt-8 w-14 h-14 mb-1.5 flex-shrink-0 overflow-hidden" style={{ borderRadius: pR, border: dd.profileBorder ? `2px solid ${dd.profileBorderColor || accent}` : "1px solid rgba(255,255,255,0.1)" }}>
                  <img src={ref.avatar} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}
              <p className="text-[11px] font-bold leading-tight text-center mb-0.5 px-3" style={{ color: textC }}>{ref.name}</p>
              <p className="text-[7px] leading-tight text-center mb-2 px-3 line-clamp-2" style={{ color: subC }}>{ref.bio}</p>
            </>
          )}
          <div className="flex gap-1.5 mb-2.5">
            {ref.socials.map((_, i) => (
              <div key={i} className="w-4 h-4 rounded-full" style={{ background: `${accent}35`, border: `0.5px solid ${accent}50` }} />
            ))}
          </div>
          <div className="w-full space-y-1.5 mb-2 px-3">
            {ref.links.slice(0, 2).map((link, i) => (
              <div key={i} className="h-[20px] w-full flex items-center justify-center" style={{
                borderRadius: btnR,
                background: dd.buttonFill === "outline" ? "transparent" : dd.buttonFill === "glass" ? `${accent}12` : `${accent}18`,
                border: dd.buttonFill === "outline" ? `0.8px solid ${accent}50` : dd.buttonFill === "glass" ? `0.5px solid ${accent}25` : "none",
                boxShadow: dd.buttonShadow === "glow" ? `0 0 6px ${accent}25` : "none",
              }}>
                <span className="text-[7px] font-medium" style={{ color: dd.buttonFill === "outline" ? accent : textC }}>{link}</span>
              </div>
            ))}
          </div>
          {/* Product cards — varies by productDisplayStyle */}
          {dd.productDisplayStyle === "compact" ? (
            <div className="flex flex-col gap-1 w-full mt-auto pb-3 px-2.5">
              {ref.products.map((prod, i) => (
                <div key={i} className="flex flex-row items-center gap-1 h-[16px] rounded" style={{
                  background: dd.cardBg || `${i === 0 ? accent : accent2}10`,
                  border: `0.5px solid ${dd.cardBorder || `${i === 0 ? accent : accent2}20`}`,
                  padding: "0 4px",
                }}>
                  {prod.image ? (
                    <img src={prod.image} alt="" className="w-[14px] h-[14px] rounded object-cover flex-shrink-0" crossOrigin="anonymous" loading="lazy" />
                  ) : (
                    <div className="w-[14px] h-[14px] rounded flex-shrink-0" style={{ background: `${i === 0 ? accent : accent2}18` }} />
                  )}
                  <p className="text-[6px] font-semibold truncate flex-1 min-w-0" style={{ color: textC }}>{prod.title}</p>
                  <p className="text-[6px] font-bold flex-shrink-0" style={{ color: accent }}>{prod.price}</p>
                </div>
              ))}
            </div>
          ) : dd.productDisplayStyle === "expanded" ? (
            <div className="flex gap-1.5 w-full mt-auto pb-3 px-2.5">
              {ref.products.map((prod, i) => (
                <div key={i} className="flex-1 rounded-lg overflow-hidden" style={{
                  background: dd.cardBg || `${i === 0 ? accent : accent2}10`,
                  border: `0.5px solid ${dd.cardBorder || `${i === 0 ? accent : accent2}20`}`,
                }}>
                  {prod.image ? (
                    <img src={prod.image} alt="" className="w-full h-[36px] object-cover" crossOrigin="anonymous" loading="lazy" />
                  ) : (
                    <div className="w-full h-[28px]" style={{ background: `${i === 0 ? accent : accent2}12` }} />
                  )}
                  <div className="p-1 px-1.5">
                    <p className="text-[7px] font-semibold truncate" style={{ color: textC }}>{prod.title}</p>
                    <div className="h-[3px] w-[70%] rounded-full mt-0.5 mb-0.5" style={{ background: `${subC}25` }} />
                    <p className="text-[7.5px] font-bold" style={{ color: accent }}>{prod.price}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* callout (default) */
            <div className="flex gap-1.5 w-full mt-auto pb-3 px-2.5">
              {ref.products.map((prod, i) => (
                <div key={i} className="flex-1 rounded-lg overflow-hidden" style={{
                  background: dd.cardBg || `${i === 0 ? accent : accent2}10`,
                  border: `0.5px solid ${dd.cardBorder || `${i === 0 ? accent : accent2}20`}`,
                }}>
                  {prod.image ? (
                    <img src={prod.image} alt="" className="w-full h-[28px] object-cover" crossOrigin="anonymous" loading="lazy" />
                  ) : (
                    <div className="w-full h-[20px]" style={{ background: `${i === 0 ? accent : accent2}12` }} />
                  )}
                  <div className="p-1 px-1.5">
                    <p className="text-[6px] font-semibold truncate" style={{ color: textC }}>{prod.title}</p>
                    <p className="text-[6.5px] font-bold" style={{ color: accent }}>{prod.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="text-center mt-1">
        <p className={`text-[13px] font-bold transition-colors ${isActive ? "text-primary" : "text-[hsl(var(--dash-text))]"}`}
          style={{ fontFamily: `"${dd.fontHeading || "Inter"}", sans-serif` }}>
          {pack.label}
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
  const [packFilter, setPackFilter] = useState("all");
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

  const scrollCarousel = (dir: "left" | "right") => {
    carouselRef.current?.scrollBy({ left: dir === "left" ? -420 : 420, behavior: "smooth" });
  };

  const filteredPacks = DESIGN_PACKS.filter(p => packFilter === "all" ? p.category !== "animated" : p.category === packFilter);

  const isPackActive = (pack: DesignPack) => config.theme === pack.config.theme
    && d.fontHeading === (pack.config.design.fontHeading || "Inter")
    && d.bgEffect === (pack.config.design.bgEffect || "");

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

      {/* ═══════ 1. TEMPLATE CAROUSEL ═══════ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[hsl(var(--dash-text))] font-bold text-[17px] tracking-tight">Escolha seu estilo</h2>
            <p className="text-[11px] text-[hsl(var(--dash-text-subtle))] mt-0.5">1 clique = design completo</p>
          </div>
          {config.avatarUrl && (
            <button onClick={autoThemeFromAvatar}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/20 hover:bg-fuchsia-500/20 transition-all">
              <Wand2 size={12} /> Auto
            </button>
          )}
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {PACK_CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setPackFilter(cat.key)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                packFilter === cat.key ? "bg-primary text-white shadow-lg shadow-primary/25" : "text-[hsl(var(--dash-text-muted))] bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))]"
              }`}>
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <button onClick={() => scrollCarousel("left")}
            className="absolute -left-2 top-[45%] -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[hsl(var(--dash-surface))]/90 border border-[hsl(var(--dash-border-subtle))] shadow-lg flex items-center justify-center text-[hsl(var(--dash-text-muted))] hover:text-primary transition-all backdrop-blur-sm">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scrollCarousel("right")}
            className="absolute -right-2 top-[45%] -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[hsl(var(--dash-surface))]/90 border border-[hsl(var(--dash-border-subtle))] shadow-lg flex items-center justify-center text-[hsl(var(--dash-text-muted))] hover:text-primary transition-all backdrop-blur-sm">
            <ChevronRight size={16} />
          </button>

          <div ref={carouselRef} className="flex gap-4 overflow-x-auto pb-3 pt-1 px-2 scroll-smooth snap-x" style={{ scrollbarWidth: "none" }}>
            {filteredPacks.map(pack => (
              <div key={pack.id} className="snap-center">
                <PhoneMockup pack={pack} isActive={isPackActive(pack)} onClick={() => applyPack(pack)} liveDesign={isPackActive(pack) ? d : undefined} />
              </div>
            ))}
          </div>
        </div>

        {(() => {
          const active = filteredPacks.find(p => isPackActive(p));
          return active ? (
            <div className="flex items-center justify-center gap-2 text-[12px]">
              <Check size={12} className="text-primary" />
              <span className="text-[hsl(var(--dash-text-muted))]">Ativo:</span>
              <span className="font-bold text-primary">{active.label}</span>
              <span className="text-[hsl(var(--dash-text-subtle))]">&middot; {active.config.design.fontHeading}</span>
            </div>
          ) : null;
        })()}

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
