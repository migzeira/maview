import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Check, Loader2, Save, ChevronDown } from "lucide-react";

import {
  type DesignConfig, type DesignTabProps, type SampleProduct, type SampleLink,
  DESIGN_PACKS, REFERENCE_PROFILES, GOOGLE_FONTS,
} from "./design/constants";
import { loadFont } from "./design/utils";
import { AdvancedContent } from "./design/AdvancedDrawer";
import { PhoneMockup } from "./design/PhoneMockup";
import type { DesignPack } from "./design/constants";

/* ═══════════════════════════════════════════════════════════════════════════
   DesignTab v2 — Stan-style editor: SIMPLES no default, PODEROSO no avançado

   Filosofia:
   1. Template carousel (horizontal) — 1 clique aplica identidade completa
   2. Cor primária + Cor secundária — 2 chips com color picker popover
   3. Fonte — 1 dropdown
   4. Accordion "Personalizar avançado" — TODO o poder do AdvancedDrawer atual
      escondido por padrão, acessível em 1 clique.

   Nada de sliders/toggles expostos. Nada de 3 etapas numeradas.
   Parece Stan Store + Beacons, com o poder do Maview escondido.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── ColorChip: chip clicável com popover color picker ─── */
function ColorChip({ value, onChange, label, swatches }: {
  value: string; onChange: (v: string) => void; label: string; swatches: string[];
}) {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setHex(value); }, [value]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="group flex items-center gap-2 transition-transform active:scale-95"
        aria-label={`Escolher ${label}`}
      >
        <div
          className="w-9 h-9 rounded-xl shadow-lg ring-2 ring-white/40 transition-all group-hover:scale-110 group-hover:ring-white/70"
          style={{
            background: value,
            boxShadow: `0 4px 16px ${value}55, 0 0 0 1px rgba(0,0,0,0.06)`,
          }}
        />
        <span className="text-[11px] font-medium text-[hsl(var(--dash-text-muted))] group-hover:text-[hsl(var(--dash-text))] transition-colors">{label}</span>
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 rounded-2xl bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border))] shadow-2xl p-4 w-[280px] animate-in fade-in-0 slide-in-from-top-2 duration-150">
          {/* Hex input + preview */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-12 h-12 rounded-xl ring-2 ring-white/40 flex-shrink-0" style={{ background: hex }} />
            <div className="flex-1">
              <label className="block text-[10px] font-medium text-[hsl(var(--dash-text-subtle))] mb-1">HEX</label>
              <input
                type="text"
                value={hex}
                onChange={e => {
                  const v = e.target.value;
                  setHex(v);
                  if (/^#[0-9A-Fa-f]{6}$/.test(v)) onChange(v);
                }}
                className="w-full px-2 py-1.5 rounded-lg bg-[hsl(var(--dash-bg))] border border-[hsl(var(--dash-border))] text-[12px] font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="#FF66B2"
              />
            </div>
          </div>

          {/* Native color input (canvas picker) */}
          <div className="mb-3">
            <input
              type="color"
              value={value}
              onChange={e => { setHex(e.target.value); onChange(e.target.value); }}
              className="w-full h-10 rounded-lg cursor-pointer border border-[hsl(var(--dash-border))]"
            />
          </div>

          {/* Swatches rápidos */}
          <div className="grid grid-cols-6 gap-2">
            {swatches.map(c => (
              <button
                key={c}
                onClick={() => { setHex(c); onChange(c); }}
                className="w-full aspect-square rounded-lg transition-all hover:scale-110 active:scale-95"
                style={{
                  background: c,
                  boxShadow: value === c ? `0 0 0 2px hsl(var(--primary))` : `0 1px 3px rgba(0,0,0,0.15)`,
                }}
                aria-label={`Cor ${c}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── SwatchRecommended: paletas sugeridas baseadas em vibes ─── */
const BRAND_SWATCHES = [
  "#ec4899", "#8b5cf6", "#6366f1", "#3b82f6", "#06b6d4", "#10b981",
  "#f59e0b", "#ef4444", "#14b8a6", "#a855f7", "#d946ef", "#0a0a0a",
];

/* ─── Main DesignTab v2 ─── */
export default function DesignTab({ config, themes, defaultDesign, updateConfig, onForceSave, highlightField }: DesignTabProps) {
  const d: DesignConfig = { ...defaultDesign, ...config.design } as DesignConfig;
  const currentTheme = themes.find(t => t.id === config.theme) ?? themes[0];

  const [activePackIdx, setActivePackIdx] = useState(0);
  const [categoryIdx, setCategoryIdx] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [justApplied, setJustApplied] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const designRef = useRef(config.design);
  designRef.current = config.design;

  const setDesign = useCallback((key: keyof DesignConfig, value: unknown) => {
    const latest = { ...(designRef.current || {}), [key]: value };
    designRef.current = latest;
    updateConfig("design", latest);
  }, [updateConfig]);

  useEffect(() => {
    if (d.fontHeading && d.fontHeading !== "Inter") loadFont(d.fontHeading);
    if (d.fontBody && d.fontBody !== "Inter") loadFont(d.fontBody);
  }, [d.fontHeading, d.fontBody]);

  /* ── Categorias de templates (estilo "Mínimas" do Stan) ── */
  const CATEGORIES = [
    { id: "showcase", label: "Premium", emoji: "✨" },
    { id: "bold", label: "Bold", emoji: "🔥" },
    { id: "light", label: "Clean", emoji: "⚪" },
    { id: "dark", label: "Dark", emoji: "🌑" },
    { id: "animated", label: "Animated", emoji: "🎨" },
  ];
  const currentCategory = CATEGORIES[categoryIdx];
  const filteredPacks = DESIGN_PACKS.filter(p => p.category === currentCategory.id);

  /* ── Aplicar pack (mesma lógica do OLD, zero perda) ── */
  const applyPack = useCallback((pack: DesignPack) => {
    updateConfig("theme", pack.config.theme);
    const prev = designRef.current || {};
    const preserved: Record<string, unknown> = {};
    const isUserUpload = (url: string | undefined) => url && !url.includes("images.unsplash.com");
    const newPackUsesBgImage = pack.config.design.bgType === "image";
    const isShowcase = pack.category === "showcase";
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
    const packMeta: Record<string, unknown> = {};
    if (pack.headerLayoutType) packMeta.headerLayoutType = pack.headerLayoutType;
    if (pack.ctaGlow) packMeta.ctaGlow = pack.ctaGlow;
    if (pack.glassCards) packMeta.glassCards = pack.glassCards;
    if (pack.socialIconStyle) packMeta.showcaseSocialStyle = pack.socialIconStyle;
    if ((pack as unknown as { edgeGradientIntensity?: string }).edgeGradientIntensity) {
      packMeta.edgeGradientIntensity = (pack as unknown as { edgeGradientIntensity?: string }).edgeGradientIntensity;
    }
    const latest = { profileGlow: true, ...pack.config.design, ...packMeta, ...preserved };
    designRef.current = latest;
    updateConfig("design", latest);
    if (pack.config.design.fontHeading) loadFont(pack.config.design.fontHeading);
    if (pack.config.design.fontBody) loadFont(pack.config.design.fontBody);
    /* Dopamina: feedback visual de "aplicado" */
    setJustApplied(pack.id);
    setTimeout(() => setJustApplied(null), 1600);
  }, [updateConfig]);

  /* ── Navegação do carousel ── */
  const scrollCarousel = (dir: "left" | "right") => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  /* ── Save explícito ── */
  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (onForceSave) await onForceSave();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      console.error("Save failed:", e);
    } finally {
      setSaving(false);
    }
  };

  const accent = d.accentColor || currentTheme.accent;
  const accent2 = d.accentColor2 || currentTheme.accent2 || "#ffffff";

  return (
    <div className="space-y-6">
      {/* ═══ HEADER: título + Save ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[hsl(var(--dash-text))] font-bold text-[20px] tracking-tight">Escolha seu estilo</h2>
          <p className="text-[hsl(var(--dash-text-subtle))] text-[12px] mt-0.5">
            1 clique aplica tudo · cor + fonte + layout otimizados
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[13px] transition-all ${
            saveSuccess
              ? "bg-emerald-500 text-white"
              : "bg-primary text-primary-foreground hover:scale-105 active:scale-95"
          }`}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : saveSuccess ? <Check size={14} /> : <Save size={14} />}
          {saving ? "Salvando..." : saveSuccess ? "Salvo!" : "Salvar"}
        </button>
      </div>

      {/* ═══ 1) CAROUSEL DE TEMPLATES ─── */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[hsl(var(--dash-surface))] to-[hsl(var(--dash-accent))]/30 border border-[hsl(var(--dash-border-subtle))] p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[hsl(var(--dash-text))] font-semibold text-[14px] flex items-center gap-2">
            <Sparkles size={14} className="text-primary" /> Templates
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollCarousel("left")}
              className="w-8 h-8 rounded-full bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border))] hover:scale-110 active:scale-90 transition-all flex items-center justify-center"
              aria-label="Voltar"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => scrollCarousel("right")}
              className="w-8 h-8 rounded-full bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border))] hover:scale-110 active:scale-90 transition-all flex items-center justify-center"
              aria-label="Avançar"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Template cards — horizontal scroll */}
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory"
          style={{ scrollPaddingLeft: 16 }}
        >
          {filteredPacks.map((pack, idx) => {
            const isActive = idx === activePackIdx;
            const isJustApplied = justApplied === pack.id;
            return (
              <div key={pack.id} className="flex-shrink-0 snap-start">
                <div
                  className={`relative transition-all duration-300 ${isJustApplied ? "animate-in zoom-in-95" : ""}`}
                  style={{
                    transform: isJustApplied ? "scale(1.04)" : "scale(1)",
                  }}
                >
                  <PhoneMockup
                    pack={pack}
                    isActive={isActive}
                    onClick={() => {
                      setActivePackIdx(idx);
                      applyPack(pack);
                    }}
                    liveDesign={isActive ? d : undefined}
                  />
                  {isJustApplied && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full px-2 py-1 text-[10px] font-bold flex items-center gap-1 animate-in fade-in zoom-in-50 duration-200 shadow-lg">
                      <Check size={10} /> Aplicado!
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Categoria selector — estilo "Mínimas" do Stan */}
        <div className="flex items-center justify-center gap-3 mt-3">
          <button
            onClick={() => setCategoryIdx((categoryIdx - 1 + CATEGORIES.length) % CATEGORIES.length)}
            className="w-7 h-7 rounded-full bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border))] hover:scale-110 transition-all flex items-center justify-center"
          >
            <ChevronLeft size={12} />
          </button>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border))]">
            <span className="text-base leading-none">{currentCategory.emoji}</span>
            <span className="text-[12px] font-semibold text-[hsl(var(--dash-text))]">{currentCategory.label}</span>
          </div>
          <button
            onClick={() => setCategoryIdx((categoryIdx + 1) % CATEGORIES.length)}
            className="w-7 h-7 rounded-full bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border))] hover:scale-110 transition-all flex items-center justify-center"
          >
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* ═══ 2) CORES — 2 chips com popover ─── */}
      <div className="rounded-3xl bg-[hsl(var(--dash-surface))]/60 border border-[hsl(var(--dash-border-subtle))] p-5">
        <h3 className="text-[hsl(var(--dash-text))] font-semibold text-[14px] mb-3">Cores</h3>
        <div className="flex items-center gap-5">
          <ColorChip
            label="Cor principal"
            value={accent}
            onChange={v => setDesign("accentColor", v)}
            swatches={BRAND_SWATCHES}
          />
          <ColorChip
            label="Cor secundária"
            value={accent2}
            onChange={v => setDesign("accentColor2", v)}
            swatches={BRAND_SWATCHES}
          />
        </div>
      </div>

      {/* ═══ 3) FONTE — 1 dropdown ─── */}
      <div className="rounded-3xl bg-[hsl(var(--dash-surface))]/60 border border-[hsl(var(--dash-border-subtle))] p-5">
        <h3 className="text-[hsl(var(--dash-text))] font-semibold text-[14px] mb-3">Fonte</h3>
        <select
          value={d.fontHeading || "Inter"}
          onChange={e => {
            const font = e.target.value;
            loadFont(font);
            setDesign("fontHeading", font);
            setDesign("fontBody", font);
          }}
          className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--dash-bg))] border border-[hsl(var(--dash-border))] text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
          style={{ fontFamily: `'${d.fontHeading || "Inter"}', sans-serif` }}
        >
          {GOOGLE_FONTS.map(f => (
            <option key={f} value={f} style={{ fontFamily: `'${f}', sans-serif` }}>{f}</option>
          ))}
        </select>
      </div>

      {/* ═══ 4) ACCORDION AVANÇADO — todo o poder escondido ─── */}
      <div className="rounded-3xl bg-[hsl(var(--dash-surface))]/60 border border-[hsl(var(--dash-border-subtle))] overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-[hsl(var(--dash-accent))]/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              ⚙️
            </div>
            <div className="text-left">
              <p className="text-[hsl(var(--dash-text))] font-semibold text-[13px]">Personalizar avançado</p>
              <p className="text-[hsl(var(--dash-text-subtle))] text-[11px] mt-0.5">
                Background, efeitos, formas, sombras, tipografia dupla, cores detalhadas...
              </p>
            </div>
          </div>
          <ChevronDown
            size={18}
            className="text-[hsl(var(--dash-text-subtle))] transition-transform"
            style={{ transform: showAdvanced ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>

        {showAdvanced && (
          <div className="border-t border-[hsl(var(--dash-border-subtle))] p-4 animate-in slide-in-from-top-4 duration-300">
            <AdvancedContent
              design={d}
              currentTheme={currentTheme}
              accent={accent}
              setDesign={setDesign}
              avatarUrl={config.avatarUrl}
              displayName={config.displayName}
              onBgColorChange={(color) => setDesign("bgColor", color)}
            />
          </div>
        )}
      </div>

      {/* ═══ Footer hint ─── */}
      <div className="text-center py-4">
        <p className="text-[10px] text-[hsl(var(--dash-text-subtle))]">
          Preview ao vivo na direita · mudanças aplicam instantaneamente
        </p>
      </div>
    </div>
  );
}
