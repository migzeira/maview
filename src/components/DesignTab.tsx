import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Check, Loader2, Save, ChevronDown } from "lucide-react";

import {
  type DesignConfig, type DesignTabProps,
  DESIGN_PACKS,
} from "./design/constants";
import { loadFont } from "./design/utils";
import AdvancedDrawer from "./design/AdvancedDrawer";
import AdvancedEditor from "./design/AdvancedEditor";
import FontPicker from "./design/FontPicker";
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

/* ─── Recent colors persistidas em localStorage (estilo Stan) ─── */
const RECENT_COLORS_KEY = "maview_recent_colors";
function getRecentColors(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_COLORS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function pushRecentColor(color: string) {
  try {
    const current = getRecentColors().filter(c => c !== color);
    const next = [color, ...current].slice(0, 6);
    localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
}

/* ─── ColorChip: chip clicável com popover color picker + recent colors ─── */
function ColorChip({ value, onChange, label, swatches }: {
  value: string; onChange: (v: string) => void; label: string; swatches: string[];
}) {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState(value);
  const [recents, setRecents] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setHex(value); }, [value]);
  useEffect(() => { if (open) setRecents(getRecentColors()); }, [open]);

  /* Wrapper que salva no histórico ao trocar cor */
  const applyColor = (c: string) => {
    setHex(c);
    onChange(c);
    pushRecentColor(c);
  };

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
                  if (/^#[0-9A-Fa-f]{6}$/.test(v)) { onChange(v); pushRecentColor(v); }
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
              onChange={e => applyColor(e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer border border-[hsl(var(--dash-border))]"
            />
          </div>

          {/* Recent colors (estilo Stan) — só mostra se tiver alguma */}
          {recents.length > 0 && (
            <div className="mb-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--dash-text-subtle))] mb-1.5">Recentes</p>
              <div className="flex gap-1.5 flex-wrap">
                {recents.map(c => (
                  <button
                    key={`recent-${c}`}
                    onClick={() => applyColor(c)}
                    className="w-7 h-7 rounded-lg transition-all hover:scale-110 active:scale-95"
                    style={{
                      background: c,
                      boxShadow: value === c ? `0 0 0 2px hsl(var(--primary))` : `0 1px 3px rgba(0,0,0,0.15)`,
                    }}
                    aria-label={`Cor recente ${c}`}
                    title={c}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Swatches premium curados */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--dash-text-subtle))] mb-1.5">Paleta</p>
            <div className="grid grid-cols-6 gap-2">
              {swatches.map(c => (
                <button
                  key={c}
                  onClick={() => applyColor(c)}
                  className="w-full aspect-square rounded-lg transition-all hover:scale-110 active:scale-95"
                  style={{
                    background: c,
                    boxShadow: value === c ? `0 0 0 2px hsl(var(--primary))` : `0 1px 3px rgba(0,0,0,0.15)`,
                  }}
                  aria-label={`Cor ${c}`}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── BRAND_SWATCHES: 12 cores premium curadas (estilo Stan) ───
   Organizadas em ordem de uso: vibrantes mais usadas → neutras */
const BRAND_SWATCHES = [
  /* Roxos/rosas (premium creator) */
  "#a855f7", "#ec4899", "#d946ef",
  /* Azuis (tech/trust) */
  "#6366f1", "#3b82f6", "#0ea5e9",
  /* Verdes/turquesa (saúde/wellness) */
  "#10b981", "#14b8a6", "#06b6d4",
  /* Quentes (energia/marketing) */
  "#f59e0b", "#ef4444",
  /* Neutro (pro/luxo) */
  "#0a0a0a",
];

/* ─── Main DesignTab v2 ─── */
export default function DesignTab({ config, themes, defaultDesign, updateConfig, onForceSave, highlightField }: DesignTabProps) {
  const d: DesignConfig = { ...defaultDesign, ...config.design } as DesignConfig;
  const currentTheme = themes.find(t => t.id === config.theme) ?? themes[0];

  const [activePackIdx, setActivePackIdx] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [proModeOpen, setProModeOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [initialDesign] = useState(() => JSON.stringify(config.design || {}));
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
    setDirty(JSON.stringify(latest) !== initialDesign);
  }, [updateConfig, initialDesign]);

  const handleCancel = useCallback(() => {
    try {
      const parsed = JSON.parse(initialDesign);
      designRef.current = parsed;
      updateConfig("design", parsed);
      setDirty(false);
    } catch (e) {
      console.error("Cancel failed:", e);
    }
  }, [initialDesign, updateConfig]);

  useEffect(() => {
    if (d.fontHeading && d.fontHeading !== "Inter") loadFont(d.fontHeading);
    if (d.fontBody && d.fontBody !== "Inter") loadFont(d.fontBody);
  }, [d.fontHeading, d.fontBody]);

  /* Foco 100% nos 8 templates premium (showcase) — sem categorias, sem distração */
  const filteredPacks = DESIGN_PACKS.filter(p => p.category === "showcase");

  /* Pre-load TODAS as fontes dos templates pra preview ficar fiel imediatamente */
  useEffect(() => {
    const fonts = new Set<string>();
    filteredPacks.forEach(p => {
      if (p.config.design.fontHeading) fonts.add(p.config.design.fontHeading);
      if (p.config.design.fontBody) fonts.add(p.config.design.fontBody);
    });
    fonts.forEach(f => { if (f !== "Inter") loadFont(f); });
  }, [filteredPacks]);

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
    /* Cores de profile/glow só preservadas para non-showcase (showcase tem identidade visual completa) */
    if (prev.profileBorderColor && !isShowcase) preserved.profileBorderColor = prev.profileBorderColor;
    if (prev.profileGlowColor && !isShowcase) preserved.profileGlowColor = prev.profileGlowColor;
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
  }, [updateConfig]);

  /* Wrapper com feedback visual — usado SÓ no click direto (não no scroll) */
  const applyPackWithFeedback = useCallback((pack: DesignPack) => {
    applyPack(pack);
    setJustApplied(pack.id);
    setTimeout(() => setJustApplied(null), 1600);
  }, [applyPack]);

  /* ─── Auto-detect central card on scroll (estilo Stan natural) ─── */
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        if (!carousel) return;
        const center = carousel.scrollLeft + carousel.clientWidth / 2;
        let closestIdx = 0;
        let closestDist = Infinity;
        Array.from(carousel.children).forEach((child, idx) => {
          const el = child as HTMLElement;
          const cardCenter = el.offsetLeft + el.offsetWidth / 2;
          const dist = Math.abs(cardCenter - center);
          if (dist < closestDist) { closestDist = dist; closestIdx = idx; }
        });
        if (closestIdx !== activePackIdx && filteredPacks[closestIdx]) {
          setActivePackIdx(closestIdx);
          applyPack(filteredPacks[closestIdx]);
        }
      }, 150);
    };
    carousel.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      carousel.removeEventListener("scroll", onScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, [activePackIdx, filteredPacks, applyPack]);

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
      setDirty(false);
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
    <div className="space-y-5">
      {/* ═══ CAROUSEL TEMPLATES — estilo Stan exato: múltiplos phones, centro destacado ─── */}
      <div className="relative -mx-3 md:-mx-6">
        {/* Stage flutuante Stan-style — overflow visível, sombras suaves */}
        <div className="relative" style={{ height: 620, overflow: "visible" }}>
          <div ref={carouselRef} className="absolute inset-0 flex items-center justify-center">
            {filteredPacks.map((pack, idx) => {
              const offset = idx - activePackIdx;
              const absOffset = Math.abs(offset);
              const visible = absOffset <= 2;
              /* Espalhamento adequado ao espaço (com preview à direita ocupando 400px) */
              const translateX = offset * 220;
              const scale = absOffset === 0 ? 1 : (absOffset === 1 ? 0.92 : 0.84);
              const isJustApplied = justApplied === pack.id;
              return (
                <div
                  key={pack.id}
                  onClick={() => {
                    if (offset === 0) return;
                    setActivePackIdx(idx);
                    applyPackWithFeedback(pack);
                  }}
                  className={`absolute transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${offset !== 0 ? "cursor-pointer" : ""}`}
                  style={{
                    transform: `translateX(${translateX}px) scale(${scale})`,
                    opacity: visible ? 1 : 0,
                    zIndex: 10 - absOffset,
                    pointerEvents: visible ? "auto" : "none",
                    /* Floating shadow embaixo de cada phone — sensação Stan */
                    filter: offset === 0
                      ? "drop-shadow(0 30px 40px rgba(0,0,0,0.15)) drop-shadow(0 12px 20px rgba(0,0,0,0.10))"
                      : "drop-shadow(0 20px 30px rgba(0,0,0,0.10)) drop-shadow(0 8px 14px rgba(0,0,0,0.06))",
                  }}
                >
                  <PhoneMockup
                    pack={pack}
                    isActive={offset === 0}
                    onClick={() => applyPackWithFeedback(pack)}
                    liveDesign={offset === 0 ? d : undefined}
                  />
                  {isJustApplied && offset === 0 && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white rounded-full px-3 py-1.5 text-[11px] font-bold flex items-center gap-1 animate-in fade-in zoom-in-50 duration-200 shadow-xl">
                      <Check size={12} /> Aplicado!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Navegação inferior estilo Stan — chevron + nome + chevron */}
        <div className="flex items-center justify-center gap-5 pt-2 pb-2">
          <button
            onClick={() => {
              const nextIdx = (activePackIdx - 1 + filteredPacks.length) % filteredPacks.length;
              setActivePackIdx(nextIdx);
              applyPackWithFeedback(filteredPacks[nextIdx]);
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] hover:bg-[hsl(var(--dash-surface-2))] transition-all"
            aria-label="Template anterior"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="text-center min-w-[140px]" key={`name-${activePackIdx}`} style={{ animation: "fadeSlideUp 0.3s ease both" }}>
            <p className="text-[20px] font-extrabold text-[hsl(var(--dash-text))] tracking-tight leading-none">
              {filteredPacks[activePackIdx]?.label}
            </p>
            <p className="text-[11px] text-[hsl(var(--dash-text-subtle))] mt-1 leading-tight">
              {filteredPacks[activePackIdx]?.desc}
            </p>
          </div>

          <button
            onClick={() => {
              const nextIdx = (activePackIdx + 1) % filteredPacks.length;
              setActivePackIdx(nextIdx);
              applyPackWithFeedback(filteredPacks[nextIdx]);
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] hover:bg-[hsl(var(--dash-surface-2))] transition-all"
            aria-label="Próximo template"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Dots paginação minimalista (Stan-style) */}
        <div className="flex items-center justify-center gap-1.5 pb-1">
          {filteredPacks.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => {
                setActivePackIdx(idx);
                applyPackWithFeedback(p);
              }}
              className={`transition-all rounded-full ${
                idx === activePackIdx
                  ? "w-6 h-1.5 bg-[hsl(var(--dash-text))]"
                  : "w-1.5 h-1.5 bg-[hsl(var(--dash-border))] hover:bg-[hsl(var(--dash-text-muted))]"
              }`}
              aria-label={`Ver template ${p.label}`}
            />
          ))}
        </div>
      </div>

      {/* ═══ 2) CORES + FONTE — numa única linha (estilo Stan) ─── */}
      <div className="rounded-3xl bg-[hsl(var(--dash-surface))]/60 border border-[hsl(var(--dash-border-subtle))] p-5">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5 items-end">
          {/* Cores — 2 chips à esquerda */}
          <div>
            <p className="text-[11px] font-semibold text-[hsl(var(--dash-text-muted))] mb-2 uppercase tracking-wider">Cores</p>
            <div className="flex items-center gap-3">
              <ColorChip label="" value={accent} onChange={v => setDesign("accentColor", v)} swatches={BRAND_SWATCHES} />
              <ColorChip label="" value={accent2} onChange={v => setDesign("accentColor2", v)} swatches={BRAND_SWATCHES} />
            </div>
          </div>
          {/* Fonte — dropdown à direita ocupa espaço restante */}
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[hsl(var(--dash-text-muted))] mb-2 uppercase tracking-wider">Fonte</p>
            <FontPicker
              value={d.fontHeading || "Inter"}
              onChange={(font) => {
                loadFont(font);
                setDesign("fontHeading", font);
                setDesign("fontBody", font);
              }}
            />
          </div>
        </div>
      </div>

      {/* ═══ Personalizar avançado — link discreto (estilo Stan) ─── */}
      <div className="flex items-center justify-center pt-2">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-[12px] font-medium text-[hsl(var(--dash-text-muted))] hover:text-primary transition-colors group"
        >
          <span>⚙️ Personalizar mais</span>
          <ChevronDown
            size={12}
            className="transition-transform group-hover:translate-y-0.5"
            style={{ transform: showAdvanced ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>
      </div>

      {showAdvanced && (
        <div className="rounded-2xl bg-[hsl(var(--dash-bg))]/40 border border-[hsl(var(--dash-border-subtle))] p-4 animate-in slide-in-from-top-2 fade-in duration-300">
          <AdvancedEditor
            design={d}
            setDesign={setDesign}
            onOpenProMode={() => setProModeOpen(true)}
          />
        </div>
      )}

      {/* Modo Pro: Drawer/Sheet com TODO o poder do AdvancedContent original (50+ controles) */}
      <AdvancedDrawer
        open={proModeOpen}
        onOpenChange={setProModeOpen}
        design={d}
        currentTheme={currentTheme}
        accent={accent}
        setDesign={setDesign}
        avatarUrl={config.avatarUrl}
        displayName={config.displayName}
        onBgColorChange={(color) => setDesign("bgColor", color)}
      />

      {/* ═══ Footer hint ─── */}
      <div className="text-center py-4">
        <p className="text-[10px] text-[hsl(var(--dash-text-subtle))]">
          Preview ao vivo na direita · mudanças aplicam instantaneamente
        </p>
      </div>

      {/* ═══ Cancel/Save BOTTOM-RIGHT discreto (idêntico Stan) — só aparece quando dirty ═══ */}
      {dirty && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-[hsl(var(--dash-surface))]/95 backdrop-blur-xl border border-[hsl(var(--dash-border))] rounded-2xl px-3 py-2 shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-xl font-semibold text-[12px] text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] hover:bg-[hsl(var(--dash-surface-2))] active:scale-95 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl font-semibold text-[12px] transition-all shadow-md ${
              saveSuccess
                ? "bg-emerald-500 text-white"
                : "bg-primary text-primary-foreground hover:scale-105 active:scale-95"
            }`}
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : saveSuccess ? <Check size={12} /> : <Save size={12} />}
            {saving ? "Salvando..." : saveSuccess ? "Salvo!" : "Salvar"}
          </button>
        </div>
      )}
    </div>
  );
}
