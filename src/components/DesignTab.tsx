import { useState, useRef, useCallback, useEffect } from "react";
import {
  Check, ChevronLeft, ChevronRight, Sparkles, Wand2, Save, Loader2,
} from "lucide-react";

import {
  type DesignConfig, type DesignTabProps, type ThemeDef,
  DESIGN_PACKS, PACK_CATEGORIES, REFERENCE_PROFILES,
  ACCENT_COLORS, GOOGLE_FONTS, FONT_PAIRS,
} from "./design/constants";
import { generateHarmony, extractColorsFromImage, loadFont, getContrastColors } from "./design/utils";
import FontSelector from "./design/FontSelector";
import AdvancedDrawer from "./design/AdvancedDrawer";
import DesignWizardProgress from "./design/DesignWizardProgress";
import { getEffectPreviewElements } from "./design/EffectThumbnailGrid";

import type { DesignPack } from "./design/constants";

/* ═══════════════════════════════════════════════════════════════════
   Rich Phone Mockup — shows a reference profile with real content
   ═══════════════════════════════════════════════════════════════════ */
function PhoneMockup({ pack, isActive, onClick }: { pack: DesignPack; isActive: boolean; onClick: () => void }) {
  const { bg, accent, accent2 } = pack.preview;
  const dd = pack.config.design;
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
            <img src={dd.bgImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" loading="lazy" />
          )}
          {dd.bgType === "image" && dd.bgOverlay && (
            <div className="absolute inset-0" style={{ background: `${bg}`, opacity: (dd.bgOverlay || 0) / 100 }} />
          )}
          {dd.bgEffect && <div className="absolute inset-0 opacity-70 overflow-hidden">{getEffectPreviewElements(dd.bgEffect, accent)}</div>}
        </div>

        <div className="relative flex flex-col items-center h-full" style={{ fontFamily: `"${dd.fontHeading || "Inter"}", sans-serif` }}>
          {/* Cover image */}
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
            <div className="pt-8 w-14 h-14 mb-1.5 flex-shrink-0 overflow-hidden" style={{ borderRadius: pR, border: dd.profileBorder ? `2px solid ${dd.profileBorderColor || accent}` : "1px solid rgba(255,255,255,0.1)" }}>
              <img src={ref.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
            </div>
          )}

          <p className="text-[11px] font-bold leading-tight text-center mb-0.5 px-3" style={{ color: textC }}>{ref.name}</p>
          <p className="text-[7px] leading-tight text-center mb-2 px-3 line-clamp-2" style={{ color: subC }}>{ref.bio}</p>
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
  const carouselRef = useRef<HTMLDivElement>(null);

  const setDesign = useCallback((key: keyof DesignConfig, value: any) => {
    updateConfig("design", { ...(config.design || {}), [key]: value });
  }, [config.design, updateConfig]);

  useEffect(() => {
    if (d.fontHeading && d.fontHeading !== "Inter") loadFont(d.fontHeading);
    if (d.fontBody && d.fontBody !== "Inter") loadFont(d.fontBody);
  }, [d.fontHeading, d.fontBody]);

  const accent = d.accentColor || currentTheme.accent;

  const applyPack = useCallback((pack: DesignPack) => {
    updateConfig("theme", pack.config.theme);
    updateConfig("design", { ...pack.config.design });
    if (pack.config.design.fontHeading) loadFont(pack.config.design.fontHeading);
    if (pack.config.design.fontBody) loadFont(pack.config.design.fontBody);
    setInteracted(prev => new Set(prev).add(1));
  }, [config.design, updateConfig]);

  const applyFontPair = useCallback((headingFont: string) => {
    loadFont(headingFont);
    const paired = FONT_PAIRS[headingFont];
    if (paired) loadFont(paired);
    updateConfig("design", { ...(config.design || {}), fontHeading: headingFont, ...(paired ? { fontBody: paired } : {}) });
    setInteracted(prev => new Set(prev).add(3));
  }, [config.design, updateConfig]);

  const applyAutoHarmony = useCallback((accentHex: string) => {
    const harmony = generateHarmony(accentHex);
    updateConfig("design", { ...(config.design || {}), accentColor: accentHex, accentColor2: harmony.accent2,
      bgColor: harmony.bgColor, cardBg: harmony.cardBg, cardBorder: harmony.cardBorder,
      textColor: harmony.textColor, subtextColor: harmony.subtextColor });
    setInteracted(prev => new Set(prev).add(2));
  }, [config.design, updateConfig]);

  const handleBgColorChange = useCallback((color: string) => {
    const contrast = getContrastColors(color);
    updateConfig("design", { ...(config.design || {}), bgColor: color, textColor: contrast.textColor, subtextColor: contrast.subtextColor });
  }, [config.design, updateConfig]);

  const autoThemeFromAvatar = useCallback(async () => {
    if (!config.avatarUrl) return;
    const colors = await extractColorsFromImage(config.avatarUrl);
    const darken = (hex: string) => {
      const r = Math.max(0, parseInt(hex.slice(1, 3), 16) * 0.15) | 0;
      const g = Math.max(0, parseInt(hex.slice(3, 5), 16) * 0.15) | 0;
      const b = Math.max(0, parseInt(hex.slice(5, 7), 16) * 0.15) | 0;
      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    };
    updateConfig("design", { ...(config.design || {}), bgColor: darken(colors.dominant), accentColor: colors.dominant, accentColor2: colors.accent });
  }, [config.avatarUrl, config.design, updateConfig]);

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
                <PhoneMockup pack={pack} isActive={isPackActive(pack)} onClick={() => applyPack(pack)} />
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

    </div>
  );
}
