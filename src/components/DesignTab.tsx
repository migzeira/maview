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
      }, 150); /* Debounce — espera scroll parar */
    };
    carousel.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      carousel.removeEventListener("scroll", onScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, [activePackIdx, filteredPacks, applyPack]);

  /* Auto-detecta template central durante scroll (estilo Stan)
     Quando user arrasta com mouse/touch, o template mais próximo do centro vira ativo */
  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;
    let scrollTimeout: ReturnType<typeof setTimeout>;

    const detectCenter = () => {
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;
      let closestIdx = 0;
      let closestDistance = Infinity;
      Array.from(container.children).forEach((child, idx) => {
        const childRect = (child as HTMLElement).getBoundingClientRect();
        const childCenter = childRect.left + childRect.width / 2;
        const distance = Math.abs(containerCenter - childCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIdx = idx;
        }
      });
      if (closestIdx !== activePackIdx) {
        setActivePackIdx(closestIdx);
        applyPack(filteredPacks[closestIdx]);
      }
    };

    const onScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(detectCenter, 150);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      clearTimeout(scrollTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePackIdx, filteredPacks.length]);

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
    <div className="space-y-6 pb-24">
      {/* ═══ BANNER DE STATUS DA VITRINE ─── */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
        dirty
          ? "bg-amber-500/10 border-amber-500/30"
          : saveSuccess
            ? "bg-emerald-500/10 border-emerald-500/30"
            : "bg-emerald-500/5 border-emerald-500/20"
      }`}>
        <div className={`w-2 h-2 rounded-full ${dirty ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
        <div className="flex-1">
          <p className={`text-[13px] font-semibold ${dirty ? "text-amber-600" : "text-emerald-600"}`}>
            {dirty ? "Alterações não salvas" : saveSuccess ? "Alterações salvas com sucesso" : "Sua vitrine está LIVE"}
          </p>
          <p className="text-[11px] text-[hsl(var(--dash-text-subtle))] mt-0.5">
            {dirty
              ? "Clique em \"Salvar\" no rodapé para publicar as mudanças"
              : "Todas as alterações já aparecem na sua página pública"}
          </p>
        </div>
      </div>

      {/* ═══ HEADER ─── */}
      <div>
        <h2 className="text-[hsl(var(--dash-text))] font-bold text-[24px] tracking-tight">Escolha seu estilo</h2>
        <p className="text-[hsl(var(--dash-text-subtle))] text-[13px] mt-1">
          8 templates premium prontos · 1 clique aplica tudo (cor + fonte + layout)
        </p>
      </div>

      {/* ═══ 1) CAROUSEL DE TEMPLATES PREMIUM — perspective + snap + dots ─── */}
      <div className="relative rounded-3xl bg-[hsl(var(--dash-surface))]/40 border border-[hsl(var(--dash-border-subtle))] overflow-hidden">
        {/* Header minimalista */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div>
            <h3 className="text-[hsl(var(--dash-text))] font-bold text-[16px] flex items-center gap-2 tracking-tight">
              <Sparkles size={15} className="text-primary" /> 8 Templates Premium
            </h3>
            <p className="text-[11px] text-[hsl(var(--dash-text-subtle))] mt-0.5">
              {filteredPacks[activePackIdx]?.label} · {activePackIdx + 1}/{filteredPacks.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const nextIdx = (activePackIdx - 1 + filteredPacks.length) % filteredPacks.length;
                setActivePackIdx(nextIdx);
                applyPack(filteredPacks[nextIdx]);
                /* Scroll suave pra ancorar */
                const card = carouselRef.current?.children[nextIdx] as HTMLElement;
                if (card) card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
              }}
              className="w-10 h-10 rounded-full bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border))] hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center shadow-sm hover:shadow-lg hover:shadow-primary/20"
              aria-label="Voltar"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => {
                const nextIdx = (activePackIdx + 1) % filteredPacks.length;
                setActivePackIdx(nextIdx);
                applyPack(filteredPacks[nextIdx]);
                const card = carouselRef.current?.children[nextIdx] as HTMLElement;
                if (card) card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
              }}
              className="w-10 h-10 rounded-full bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border))] hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center shadow-sm hover:shadow-lg hover:shadow-primary/20"
              aria-label="Avançar"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Template cards — perspective scroll com snap center */}
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto pb-4 pt-6 scrollbar-none snap-x snap-mandatory px-[15%]"
          style={{ perspective: "1200px" }}
        >
          {filteredPacks.map((pack, idx) => {
            const isActive = idx === activePackIdx;
            const isJustApplied = justApplied === pack.id;
            return (
              <div
                key={pack.id}
                className="flex-shrink-0 snap-center transition-all duration-500 ease-out"
                style={{
                  transform: isActive ? "scale(1) translateZ(0)" : "scale(0.85) translateZ(-50px)",
                  opacity: isActive ? 1 : 0.45,
                  filter: isActive ? "blur(0px)" : "blur(1px)",
                }}
              >
                <div className={`relative transition-all duration-300 ${isJustApplied ? "animate-in zoom-in-95" : ""}`}>
                  <PhoneMockup
                    pack={pack}
                    isActive={isActive}
                    onClick={() => {
                      setActivePackIdx(idx);
                      applyPack(pack);
                      const card = carouselRef.current?.children[idx] as HTMLElement;
                      if (card) card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                    }}
                    liveDesign={isActive ? d : undefined}
                  />
                  {/* Badge "Aplicado!" destacado em verde */}
                  {isJustApplied && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white rounded-full px-3 py-1.5 text-[11px] font-bold flex items-center gap-1 animate-in fade-in zoom-in-50 duration-200 shadow-xl">
                      <Check size={12} /> Aplicado!
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dots de paginação — premium */}
        <div className="flex items-center justify-center gap-2 pb-5">
          {filteredPacks.map((p, idx) => {
            const isActive = idx === activePackIdx;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setActivePackIdx(idx);
                  applyPack(p);
                  const card = carouselRef.current?.children[idx] as HTMLElement;
                  if (card) card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                }}
                className={`transition-all duration-300 rounded-full ${
                  isActive
                    ? "w-8 h-2 bg-primary shadow-md shadow-primary/40"
                    : "w-2 h-2 bg-[hsl(var(--dash-border))] hover:bg-[hsl(var(--dash-text-muted))]"
                }`}
                aria-label={`Ver template ${p.label}`}
              />
            );
          })}
        </div>

        {/* Nome + descrição do ATIVO — animado */}
        <div className="text-center pb-6 px-6">
          <p className="text-[16px] font-bold text-[hsl(var(--dash-text))] transition-all duration-300" key={`name-${activePackIdx}`}
             style={{ animation: "fadeSlideUp 0.3s ease both" }}>
            {filteredPacks[activePackIdx]?.label}
          </p>
          <p className="text-[12px] text-[hsl(var(--dash-text-subtle))] mt-0.5" key={`desc-${activePackIdx}`}
             style={{ animation: "fadeSlideUp 0.3s ease 0.05s both" }}>
            {filteredPacks[activePackIdx]?.desc}
          </p>
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

      {/* ═══ 3) FONTE — dropdown customizado com cada fonte na sua própria tipografia ─── */}
      <div className="rounded-3xl bg-[hsl(var(--dash-surface))]/60 border border-[hsl(var(--dash-border-subtle))] p-5">
        <h3 className="text-[hsl(var(--dash-text))] font-semibold text-[14px] mb-3">Fonte</h3>
        <FontPicker
          value={d.fontHeading || "Inter"}
          onChange={(font) => {
            loadFont(font);
            setDesign("fontHeading", font);
            setDesign("fontBody", font);
          }}
        />
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
          <div className="border-t border-[hsl(var(--dash-border-subtle))] p-4 animate-in slide-in-from-top-4 duration-300 bg-[hsl(var(--dash-bg))]/30">
            <AdvancedEditor
              design={d}
              setDesign={setDesign}
              onOpenProMode={() => setProModeOpen(true)}
            />
          </div>
        )}
      </div>

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

      {/* ═══ RODAPÉ FIXO CANCEL/SAVE (estilo Stan Store) ═══ */}
      <div className="fixed bottom-0 left-0 right-0 md:left-[260px] z-40 bg-[hsl(var(--dash-surface))]/95 backdrop-blur-xl border-t border-[hsl(var(--dash-border))] px-6 py-3.5 flex items-center justify-between gap-3 shadow-2xl">
        <p className="text-[11px] text-[hsl(var(--dash-text-subtle))] flex items-center gap-2">
          {dirty ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Você tem alterações não salvas
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Tudo sincronizado
            </>
          )}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            disabled={!dirty}
            className={`px-5 py-2.5 rounded-xl font-semibold text-[13px] transition-all ${
              dirty
                ? "bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text))] hover:bg-[hsl(var(--dash-accent))] active:scale-95"
                : "bg-transparent text-[hsl(var(--dash-text-subtle))] cursor-not-allowed opacity-50"
            }`}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-[13px] transition-all shadow-lg ${
              saveSuccess
                ? "bg-emerald-500 text-white"
                : "bg-primary text-primary-foreground hover:scale-105 active:scale-95 hover:shadow-primary/30"
            }`}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : saveSuccess ? <Check size={14} /> : <Save size={14} />}
            {saving ? "Salvando..." : saveSuccess ? "Salvo!" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
