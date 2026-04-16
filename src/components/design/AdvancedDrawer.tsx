import { useRef, useState, useMemo } from "react";
import {
  Layers, Square, Circle, Palette, Upload, X, Play, Type, Eye, Loader2,
  User, Sparkles, Sun,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ColorPicker, Section, getContrastColors } from "./utils";
import EffectThumbnailGrid from "./EffectThumbnailGrid";
import { uploadImage } from "@/lib/vitrine-sync";
import {
  type DesignConfig, type BgType, type ButtonShape, type ButtonFill,
  type ProfileShape, type ThemeDef,
  BG_PATTERNS, SOLID_COLORS, GRADIENT_PRESETS,
} from "./constants";

interface AdvancedDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  design: DesignConfig;
  currentTheme: ThemeDef;
  accent: string;
  avatarUrl?: string;
  displayName?: string;
  setDesign: (key: keyof DesignConfig, value: any) => void;
  onBgColorChange: (color: string) => void;
}

/* ─── Live mini-preview ──────────────────────────────────────── */
function MiniPreview({ design: d, currentTheme, accent, avatarUrl, displayName }: {
  design: DesignConfig; currentTheme: ThemeDef; accent: string; avatarUrl?: string; displayName?: string;
}) {
  const bg = d.bgColor || currentTheme.bg;
  const textC = d.textColor || currentTheme.text || "#fff";
  const subC = d.subtextColor || currentTheme.sub || "rgba(255,255,255,0.6)";
  const borderColor = d.profileBorderColor || accent;
  const glowColor = d.profileGlowColor || borderColor;
  const isLight = bg.startsWith("#f") || bg.startsWith("#e") || bg === "#ffffff";
  const cardBg = d.cardBg || currentTheme.card || (isLight ? "#ffffff" : "#13102a");
  const cardBorder = d.cardBorder || currentTheme.border || "rgba(255,255,255,0.1)";

  const profileRadius = d.profileShape === "circle" ? "9999px"
    : d.profileShape === "rounded" ? "20%" : d.profileShape === "square" ? "8px" : "0px";
  const profileClip = d.profileShape === "hexagon"
    ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" : undefined;

  const btnR = d.buttonShape === "pill" ? "999px" : d.buttonShape === "square" ? "4px"
    : d.buttonShape === "soft" ? "12px" : `${d.buttonRadius ?? 12}px`;

  return (
    <div className="rounded-2xl overflow-hidden border border-[hsl(var(--dash-border-subtle))] shadow-xl" style={{ height: 220 }}>
      <div className="relative w-full h-full flex flex-col items-center justify-center"
        style={{
          background: d.bgType === "gradient"
            ? `linear-gradient(to bottom, ${d.bgGradient?.[0] || bg}, ${d.bgGradient?.[1] || bg})`
            : bg,
        }}>
        {/* Bg image */}
        {d.bgType === "image" && d.bgImageUrl && (
          <>
            <div className="absolute inset-0" style={{
              backgroundImage: `url(${d.bgImageUrl})`,
              backgroundSize: `${d.bgImageZoom ?? 100}%`,
              backgroundPosition: `${d.bgImagePosX ?? 50}% ${d.bgImagePosY ?? 50}%`,
              backgroundRepeat: "no-repeat",
            }} />
            <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${(d.bgOverlay ?? 40) / 100})` }} />
          </>
        )}

        {/* Cover image */}
        {d.coverImageUrl && (
          <div className="absolute top-0 left-0 right-0 h-[45%] overflow-hidden">
            <img src={d.coverImageUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 30%, ${bg}DD)` }} />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center px-4" style={{ paddingTop: d.coverImageUrl ? 40 : 0 }}>
          {/* Avatar with glow + border */}
          <div className="relative mb-2">
            {d.profileGlow !== false && (
              <div className="absolute inset-[-3px] opacity-40 blur-[8px]"
                style={{ background: glowColor, borderRadius: profileRadius, clipPath: profileClip }} />
            )}
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="relative z-10 object-cover"
                style={{
                  width: 52, height: 52, borderRadius: profileRadius, clipPath: profileClip,
                  border: d.profileBorder ? `2px solid ${borderColor}70` : "none",
                }} />
            ) : (
              <div className="relative z-10 flex items-center justify-center text-lg font-bold text-white"
                style={{ width: 52, height: 52, borderRadius: profileRadius, clipPath: profileClip, background: accent }}>
                {(displayName || "?")[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <p className="text-[13px] font-bold mb-0.5" style={{ color: d.nameColor || textC, fontFamily: `"${d.fontHeading || "Inter"}", sans-serif` }}>
            {displayName || "Seu Nome"}
          </p>
          <p className="text-[9px] mb-2.5" style={{ color: subC }}>Sua bio aparece aqui</p>
          {/* Social dots */}
          <div className="flex gap-1 mb-2.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-4 h-4 rounded-full" style={{ background: `${accent}30`, border: `0.5px solid ${accent}40` }} />
            ))}
          </div>
          {/* Card preview */}
          <div className="flex gap-2 w-full max-w-[240px]">
            {[1, 2].map(i => (
              <div key={i} className="flex-1 rounded-lg overflow-hidden" style={{
                background: d.buttonFill === "glass" ? `${cardBg}aa` : d.buttonFill === "outline" ? "transparent" : cardBg,
                border: `0.5px solid ${d.buttonFill === "outline" ? accent + "50" : cardBorder}`,
                backdropFilter: d.buttonFill === "glass" ? "blur(8px)" : undefined,
              }}>
                <div className="h-[22px]" style={{ background: `${i === 1 ? accent : (d.accentColor2 || accent)}12` }} />
                <div className="p-1.5">
                  <div className="h-1 w-3/4 rounded-full mb-1" style={{ background: textC + "30" }} />
                  <div className="h-1 w-1/2 rounded-full" style={{ background: accent + "40" }} />
                </div>
              </div>
            ))}
          </div>
          {/* CTA button */}
          <div className="mt-2 px-6 py-1 text-[8px] font-semibold" style={{
            borderRadius: btnR, background: accent, color: "#fff",
            boxShadow: d.buttonShadow === "glow" ? `0 2px 10px ${accent}40` : "none",
          }}>Comprar</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Toggle switch helper ──────────────────────────────────── */
function Toggle({ on, onToggle, label, desc }: { on: boolean; onToggle: () => void; label: string; desc?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[11px] font-medium text-[hsl(var(--dash-text))]">{label}</p>
        {desc && <p className="text-[8px] text-[hsl(var(--dash-text-subtle))]">{desc}</p>}
      </div>
      <button onClick={onToggle}
        className={`relative w-9 h-5 rounded-full transition-colors ${on ? "bg-primary" : "bg-[hsl(var(--dash-border))]"}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${on ? "left-[18px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

/* ─── Main content ──────────────────────────────────────────── */
function AdvancedContent({ design: d, currentTheme, accent, avatarUrl, displayName, setDesign, onBgColorChange }: Omit<AdvancedDrawerProps, "open" | "onOpenChange">) {
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const bgVideoInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const [bgUploading, setBgUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  return (
    <div className="space-y-4 px-1">

      {/* ── Preview ao vivo ── */}
      <MiniPreview design={d} currentTheme={currentTheme} accent={accent} avatarUrl={avatarUrl} displayName={displayName} />

      {/* ══════════════════════════════════════════════════════════
          FOTO DE PERFIL — primeiro, é o que o usuário mais quer ajustar
          ══════════════════════════════════════════════════════════ */}
      <Section title="Foto de perfil" icon={<User size={14} />} defaultOpen>
        <div className="space-y-3 pt-2">
          <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] leading-relaxed">
            Formato, borda e efeito de brilho ao redor da sua foto.
          </p>

          {/* Hero layout selector */}
          <div>
            <p className="text-[10px] font-medium text-[hsl(var(--dash-text-muted))] mb-1.5">Layout do perfil</p>
            <div className="grid grid-cols-5 gap-2">
              {([
                { value: "classic", icon: "\ud83d\udcf1", label: "Classico" },
                { value: "hero-banner", icon: "\ud83d\uddbc\ufe0f", label: "Banner" },
                { value: "side-by-side", icon: "\u2194\ufe0f", label: "Lado a lado" },
                { value: "minimal-top", icon: "\ud83d\udd39", label: "Compact" },
                { value: "full-cover", icon: "\ud83c\udfde\ufe0f", label: "Cover" },
              ] as const).map(opt => (
                <button key={opt.value} onClick={() => setDesign("heroLayout", opt.value)}
                  className={`px-2 py-2 rounded-lg text-center text-[11px] font-medium cursor-pointer transition-all ${
                    (d.heroLayout || "classic") === opt.value
                      ? "bg-primary/15 text-primary ring-2 ring-primary/40"
                      : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))]"
                  }`}>
                  <span className="block text-base leading-none mb-0.5">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Shape selector */}
          <div>
            <p className="text-[10px] font-medium text-[hsl(var(--dash-text-muted))] mb-1.5">Formato</p>
            <div className="grid grid-cols-4 gap-1.5">
              {(["circle", "rounded", "square", "hexagon"] as ProfileShape[]).map(shape => (
                <button key={shape} onClick={() => setDesign("profileShape", shape)}
                  className={`py-2.5 rounded-xl text-[10px] font-medium transition-all ${d.profileShape === shape ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent"}`}>
                  {shape === "circle" ? "Circulo" : shape === "rounded" ? "Arredondado" : shape === "square" ? "Quadrado" : "Hexagono"}
                </button>
              ))}
            </div>
          </div>

          {/* Borda */}
          <div className="space-y-2 pt-1 border-t border-[hsl(var(--dash-border-subtle))]/40">
            <Toggle on={d.profileBorder} onToggle={() => setDesign("profileBorder", !d.profileBorder)}
              label="Borda ao redor da foto" desc="Contorno colorido na sua foto de perfil" />
            {d.profileBorder && (
              <ColorPicker value={d.profileBorderColor || accent} onChange={v => setDesign("profileBorderColor", v)} label="Cor da borda" />
            )}
          </div>

          {/* Brilho / Glow */}
          <div className="space-y-2 pt-1 border-t border-[hsl(var(--dash-border-subtle))]/40">
            <Toggle on={d.profileGlow !== false}
              onToggle={() => setDesign("profileGlow", d.profileGlow === false ? true : false)}
              label="Brilho (glow) atras da foto" desc="Sombra luminosa colorida por tras do perfil" />
            {d.profileGlow !== false && (
              <ColorPicker value={d.profileGlowColor || d.profileBorderColor || accent} onChange={v => setDesign("profileGlowColor", v)} label="Cor do brilho" />
            )}
          </div>

          {/* Info auto-color */}
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/10">
            <Sparkles size={12} className="text-primary flex-shrink-0 mt-0.5" />
            <p className="text-[9px] text-[hsl(var(--dash-text-subtle))] leading-relaxed">
              Ao enviar uma <strong className="text-[hsl(var(--dash-text-muted))]">imagem de fundo</strong>, a cor da borda e do brilho se ajustam automaticamente.
            </p>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════
          CAPA / BANNER
          ══════════════════════════════════════════════════════════ */}
      <Section title="Imagem de capa" icon={<Layers size={14} />}>
        <div className="space-y-3 pt-2">
          <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] leading-relaxed">
            Banner no topo do perfil, acima da foto. A cor de fundo aparece abaixo.
          </p>
          {d.coverImageUrl ? (
            <div className="relative rounded-xl overflow-hidden h-24">
              <img src={d.coverImageUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 40%, ${d.bgColor || currentTheme.bg}DD)` }} />
              <button onClick={() => setDesign("coverImageUrl", "")}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                <X size={12} />
              </button>
              <button onClick={() => coverImageInputRef.current?.click()}
                className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 text-[10px] font-semibold text-gray-800 hover:bg-white transition-all shadow-md">
                <Upload size={10} /> Trocar
              </button>
            </div>
          ) : (
            <button onClick={() => coverImageInputRef.current?.click()}
              className="w-full h-20 rounded-xl border-2 border-dashed border-[hsl(var(--dash-border))] flex flex-col items-center justify-center gap-1 text-[hsl(var(--dash-text-subtle))] hover:border-primary/40 hover:text-primary transition-all">
              <Upload size={16} /><span className="text-[10px]">Enviar imagem de capa</span>
            </button>
          )}
          <input type="file" ref={coverImageInputRef} accept="image/*" className="hidden" onChange={async e => {
            const f = e.target.files?.[0]; if (!f) return; e.target.value = "";
            const r = new FileReader(); r.onload = () => setDesign("coverImageUrl", r.result as string); r.readAsDataURL(f);
            setCoverUploading(true);
            const publicUrl = await uploadImage(f, "backgrounds");
            setCoverUploading(false);
            if (publicUrl) setDesign("coverImageUrl", publicUrl);
          }} />
          {coverUploading && (
            <div className="flex items-center gap-1.5 text-[10px] text-primary font-medium">
              <Loader2 size={10} className="animate-spin" /> Enviando...
            </div>
          )}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════
          FUNDO
          ══════════════════════════════════════════════════════════ */}
      <Section title="Fundo da pagina" icon={<Layers size={14} />}>
        <div className="space-y-3 pt-2">
          <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] leading-relaxed">
            Cor, imagem ou efeito animado no fundo da sua vitrine.
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {(["solid", "gradient", "image", "video", "pattern", "effect"] as BgType[]).map(type => (
              <button key={type} onClick={() => setDesign("bgType", type)}
                className={`flex-1 min-w-[50px] py-2 rounded-xl text-[10px] font-medium transition-all ${
                  d.bgType === type ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent"
                }`}>
                {type === "solid" ? "Cor" : type === "gradient" ? "Degrade" : type === "image" ? "Imagem" : type === "video" ? "Video" : type === "pattern" ? "Padrao" : "Efeito"}
              </button>
            ))}
          </div>

          {d.bgType === "solid" && (
            <div className="space-y-3">
              <ColorPicker value={d.bgColor || currentTheme.bg} onChange={v => onBgColorChange(v)} label="Cor de fundo" />
              <div className="grid grid-cols-6 gap-2">
                {SOLID_COLORS.map(c => (
                  <button key={c} onClick={() => onBgColorChange(c)}
                    className={`w-8 h-8 rounded-lg ring-1 transition-all hover:scale-110 ${(d.bgColor || currentTheme.bg) === c ? "ring-2 ring-primary" : "ring-white/10"}`} style={{ background: c }} />
                ))}
              </div>
            </div>
          )}

          {d.bgType === "gradient" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <ColorPicker value={d.bgGradient[0]} onChange={v => { setDesign("bgGradient", [v, d.bgGradient[1]]); }} label="Cor 1" />
                <ColorPicker value={d.bgGradient[1]} onChange={v => { setDesign("bgGradient", [d.bgGradient[0], v]); }} label="Cor 2" />
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {GRADIENT_PRESETS.map(([c1, c2], i) => (
                  <button key={i} onClick={() => { setDesign("bgGradient", [c1, c2]); }}
                    className="h-7 rounded-lg ring-1 ring-white/10 hover:scale-105 transition-all" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }} />
                ))}
              </div>
            </div>
          )}

          {d.bgType === "image" && (
            <div className="space-y-3">
              {d.bgImageUrl ? (
                <div className="relative rounded-xl overflow-hidden h-28">
                  <img src={d.bgImageUrl} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setDesign("bgImageUrl", "")} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-500 transition-colors"><X size={12} /></button>
                </div>
              ) : (
                <button onClick={() => bgImageInputRef.current?.click()} className="w-full h-24 rounded-xl border-2 border-dashed border-[hsl(var(--dash-border))] flex flex-col items-center justify-center gap-1 text-[hsl(var(--dash-text-subtle))] hover:border-primary/40 transition-all">
                  <Upload size={18} /><span className="text-[10px]">Enviar imagem</span>
                </button>
              )}
              <input type="file" ref={bgImageInputRef} accept="image/*" className="hidden" onChange={async e => {
                const f = e.target.files?.[0]; if (!f) return; e.target.value = "";
                const r = new FileReader(); r.onload = () => setDesign("bgImageUrl", r.result as string); r.readAsDataURL(f);
                setBgUploading(true);
                const publicUrl = await uploadImage(f, "backgrounds");
                setBgUploading(false);
                if (publicUrl) {
                  setDesign("bgImageUrl", publicUrl);
                  try {
                    const { extractColorsFromImage } = await import("./utils");
                    const colors = await extractColorsFromImage(publicUrl);
                    if (colors?.dominant) {
                      setDesign("profileBorderColor", colors.dominant);
                      setDesign("profileGlowColor", colors.dominant);
                    }
                  } catch { /* best-effort */ }
                }
              }} />
              {bgUploading && (
                <div className="flex items-center gap-1.5 text-[10px] text-primary font-medium">
                  <Loader2 size={10} className="animate-spin" /> Enviando imagem...
                </div>
              )}
              <input type="url" className="w-full rounded-xl border border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text))] text-sm px-3.5 py-2.5 placeholder:text-[hsl(var(--dash-text-subtle))] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                placeholder="Ou cole URL..." value={d.bgImageUrl.startsWith("data:") ? "" : d.bgImageUrl} onChange={e => setDesign("bgImageUrl", e.target.value)} />
            </div>
          )}

          {d.bgType === "video" && (
            <div className="space-y-3">
              {d.bgVideoUrl ? (
                <div className="relative rounded-xl overflow-hidden h-28">
                  <video src={d.bgVideoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  <button onClick={() => setDesign("bgVideoUrl", "")} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-500 transition-colors"><X size={12} /></button>
                </div>
              ) : (
                <button onClick={() => bgVideoInputRef.current?.click()} className="w-full h-24 rounded-xl border-2 border-dashed border-[hsl(var(--dash-border))] flex flex-col items-center justify-center gap-1 text-[hsl(var(--dash-text-subtle))] hover:border-primary/40 transition-all">
                  <Play size={18} /><span className="text-[10px]">Enviar video (max 10MB)</span>
                </button>
              )}
              <input type="file" ref={bgVideoInputRef} accept="video/mp4,video/webm" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (!f || f.size > 10485760) return; const r = new FileReader(); r.onload = () => setDesign("bgVideoUrl", r.result as string); r.readAsDataURL(f); e.target.value = ""; }} />
            </div>
          )}

          {d.bgType === "pattern" && (
            <div className="space-y-3">
              <ColorPicker value={d.bgColor || currentTheme.bg} onChange={v => onBgColorChange(v)} label="Cor base" />
              <div className="grid grid-cols-4 gap-1.5">
                {BG_PATTERNS.map(p => (
                  <button key={p.id} onClick={() => setDesign("bgPattern", p.id)}
                    className={`py-2.5 rounded-xl text-[10px] font-medium transition-all ${d.bgPattern === p.id ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent"}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {d.bgType === "effect" && (
            <EffectThumbnailGrid
              currentEffect={d.bgEffect}
              accentColor={accent}
              bgColor={d.bgColor || currentTheme.bg}
              onSelectEffect={id => { setDesign("bgEffect", id); }}
            />
          )}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════
          CORES DE DESTAQUE
          ══════════════════════════════════════════════════════════ */}
      <Section title="Cores de destaque" icon={<Palette size={14} />}>
        <div className="space-y-3 pt-2">
          <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] leading-relaxed">
            {d.bgType === "effect"
              ? "Cor dos botoes, precos, @username, icones sociais e da animacao de fundo."
              : "Cor dos botoes, precos, @username e icones sociais."}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <ColorPicker value={d.accentColor || accent} onChange={v => setDesign("accentColor", v)} label={d.bgType === "effect" ? "Cor principal / Animacao" : "Cor principal"} />
              <p className="text-[8px] text-[hsl(var(--dash-text-subtle))] mt-0.5">Botoes, precos, username</p>
            </div>
            <div>
              <ColorPicker value={d.accentColor2 || accent} onChange={v => setDesign("accentColor2", v)} label="Cor secundaria" />
              <p className="text-[8px] text-[hsl(var(--dash-text-subtle))] mt-0.5">Gradientes, detalhes</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════
          TEXTOS
          ══════════════════════════════════════════════════════════ */}
      <Section title="Cores dos textos" icon={<Type size={14} />}>
        <div className="space-y-3 pt-2">
          <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] leading-relaxed">
            Cada texto tem cor independente. Nenhum afeta o outro.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <ColorPicker value={d.nameColor || d.textColor || currentTheme.text || "#ffffff"} onChange={v => setDesign("nameColor", v)} label="Seu nome" />
              <p className="text-[8px] text-[hsl(var(--dash-text-subtle))] mt-0.5">Nome no topo do perfil</p>
            </div>
            <div>
              <ColorPicker value={d.accentColor || currentTheme.accent} onChange={v => setDesign("accentColor", v)} label="@usuario" />
              <p className="text-[8px] text-[hsl(var(--dash-text-subtle))] mt-0.5">Cor do @arroba</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <ColorPicker value={d.subtextColor || currentTheme.sub || "#999999"} onChange={v => setDesign("subtextColor", v)} label="Bio" />
              <p className="text-[8px] text-[hsl(var(--dash-text-subtle))] mt-0.5">Texto da sua bio</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <ColorPicker value={d.productTitleColor || d.textColor || currentTheme.text || "#ffffff"} onChange={v => setDesign("productTitleColor", v)} label="Nome do produto" />
              <p className="text-[8px] text-[hsl(var(--dash-text-subtle))] mt-0.5">Ex: iPhone 15 Pro</p>
            </div>
            <div>
              <ColorPicker value={d.descriptionColor || d.subtextColor || currentTheme.sub || "#999999"} onChange={v => setDesign("descriptionColor", v)} label="Descricao do produto" />
              <p className="text-[8px] text-[hsl(var(--dash-text-subtle))] mt-0.5">Texto abaixo do nome</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <ColorPicker value={d.priceColor || d.textColor || currentTheme.text || "#ffffff"} onChange={v => setDesign("priceColor", v)} label="Preco atual" />
              <p className="text-[8px] text-[hsl(var(--dash-text-subtle))] mt-0.5">Valor do produto</p>
            </div>
            <div>
              <ColorPicker value={d.originalPriceColor || "rgba(156,163,175,0.7)"} onChange={v => setDesign("originalPriceColor", v)} label="Preco riscado" />
              <p className="text-[8px] text-[hsl(var(--dash-text-subtle))] mt-0.5">Valor anterior (riscado)</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <ColorPicker value={d.textColor || currentTheme.text || "#ffffff"} onChange={v => setDesign("textColor", v)} label="Outros textos" />
              <p className="text-[8px] text-[hsl(var(--dash-text-subtle))] mt-0.5">Badges, links, stats</p>
            </div>
          </div>
          {/* Quick buttons */}
          <div className="flex gap-2">
            <button onClick={() => { setDesign("textColor", "#ffffff"); setDesign("subtextColor", "rgba(255,255,255,0.80)"); setDesign("nameColor", "#ffffff"); setDesign("productTitleColor", "#ffffff"); setDesign("priceColor", "#ffffff"); setDesign("descriptionColor", "rgba(255,255,255,0.70)"); setDesign("originalPriceColor", "rgba(255,255,255,0.50)"); }}
              className="flex-1 py-2 rounded-xl text-[10px] font-medium bg-gray-900 text-white border border-gray-700 hover:border-primary/40 transition-all">
              <Eye size={10} className="inline mr-1" /> Texto claro
            </button>
            <button onClick={() => { setDesign("textColor", "#111827"); setDesign("subtextColor", "#374151"); setDesign("nameColor", "#111827"); setDesign("productTitleColor", "#111827"); setDesign("priceColor", "#111827"); setDesign("descriptionColor", "#6b7280"); setDesign("originalPriceColor", "#9ca3af"); }}
              className="flex-1 py-2 rounded-xl text-[10px] font-medium bg-white text-gray-900 border border-gray-300 hover:border-primary/40 transition-all">
              <Eye size={10} className="inline mr-1" /> Texto escuro
            </button>
          </div>
          {/* Text shadow */}
          <div className="space-y-2 pt-1 border-t border-[hsl(var(--dash-border-subtle))]/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-[hsl(var(--dash-text))]">Sombra nos textos</p>
                <p className="text-[8px] text-[hsl(var(--dash-text-subtle))]">Destaca o texto sobre fotos (como Canva)</p>
              </div>
              <span className="text-[10px] font-mono text-[hsl(var(--dash-text-muted))]">
                {(typeof d.textShadow === "number" ? d.textShadow : (d.textShadow ? 5 : 0)) > 0
                  ? `${typeof d.textShadow === "number" ? d.textShadow : 5}`
                  : "Off"}
              </span>
            </div>
            <input type="range" min={0} max={10} step={1}
              value={typeof d.textShadow === "number" ? d.textShadow : (d.textShadow ? 5 : 0)}
              onChange={e => setDesign("textShadow", Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-primary bg-[hsl(var(--dash-border))]" />
            <div className="flex justify-between text-[8px] text-[hsl(var(--dash-text-subtle))]">
              <span>Sem sombra</span><span>Sutil</span><span>Forte</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════
          CARDS DOS PRODUTOS
          ══════════════════════════════════════════════════════════ */}
      <Section title="Cards dos produtos" icon={<Square size={14} />}>
        <div className="space-y-3 pt-2">
          <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] leading-relaxed">
            Fundo e borda dos cards de produtos, links e depoimentos.
          </p>
          {/* Product display style selector */}
          <div>
            <p className="text-[10px] font-medium text-[hsl(var(--dash-text-muted))] mb-1.5">Estilo de exibicao</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: "callout", icon: "\ud83d\udccb", label: "Card" },
                { value: "compact", icon: "\ud83d\udccf", label: "Linha" },
                { value: "expanded", icon: "\ud83d\udcd0", label: "Grande" },
              ] as const).map(opt => (
                <button key={opt.value} onClick={() => setDesign("productDisplayStyle", opt.value)}
                  className={`px-2 py-2 rounded-lg text-center text-[11px] font-medium cursor-pointer transition-all ${
                    (d.productDisplayStyle || "callout") === opt.value
                      ? "bg-primary/15 text-primary ring-2 ring-primary/40"
                      : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))]"
                  }`}>
                  <span className="block text-base leading-none mb-0.5">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <ColorPicker value={d.cardBg || currentTheme.card || "#13102a"} onChange={v => setDesign("cardBg", v)} label="Fundo do card" />
              <p className="text-[8px] text-[hsl(var(--dash-text-subtle))] mt-0.5">Fundo dos produtos e links</p>
            </div>
            <div>
              <ColorPicker value={d.cardBorder || currentTheme.border || "rgba(255,255,255,0.1)"} onChange={v => setDesign("cardBorder", v)} label="Borda do card" />
              <p className="text-[8px] text-[hsl(var(--dash-text-subtle))] mt-0.5">Contorno dos cards</p>
            </div>
          </div>
          <button onClick={() => { setDesign("cardBg", "transparent"); setDesign("cardBorder", "transparent"); }}
            className={`w-full py-2 rounded-xl text-[10px] font-medium transition-all ${
              d.cardBg === "transparent" ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent"
            }`}>
            Cards transparentes
          </button>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════
          FORMATO DOS BOTOES
          ══════════════════════════════════════════════════════════ */}
      <Section title="Formato dos botoes" icon={<Square size={14} />}>
        <div className="space-y-3 pt-2">
          <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] leading-relaxed">
            Formato e estilo dos botoes de links e produtos.
          </p>
          <div>
            <p className="text-[10px] font-medium text-[hsl(var(--dash-text-muted))] mb-1.5">Formato</p>
            <div className="grid grid-cols-4 gap-1.5">
              {(["rounded", "pill", "square", "soft"] as ButtonShape[]).map(shape => (
                <button key={shape} onClick={() => setDesign("buttonShape", shape)}
                  className={`py-2.5 rounded-xl text-[10px] font-medium transition-all ${d.buttonShape === shape ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent"}`}>
                  {shape === "rounded" ? "Arredondado" : shape === "pill" ? "Pilula" : shape === "square" ? "Quadrado" : "Suave"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-medium text-[hsl(var(--dash-text-muted))] mb-1.5">Estilo</p>
            <div className="grid grid-cols-4 gap-1.5">
              {(["solid", "outline", "glass", "ghost"] as ButtonFill[]).map(fill => (
                <button key={fill} onClick={() => setDesign("buttonFill", fill)}
                  className={`py-2.5 rounded-xl text-[10px] font-medium transition-all ${d.buttonFill === fill ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent"}`}>
                  {fill === "solid" ? "Solido" : fill === "outline" ? "Contorno" : fill === "glass" ? "Vidro" : "Fantasma"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════
          BADGE DE URGENCIA
          ══════════════════════════════════════════════════════════ */}
      <Section title="Badge de urgencia" icon={<Eye size={14} />}>
        <div className="space-y-3 pt-2">
          <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] leading-relaxed">
            Cor do contador regressivo nos produtos com urgencia ativa.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <ColorPicker value={d.urgencyBadgeBg || "rgba(239,68,68,0.25)"} onChange={v => setDesign("urgencyBadgeBg", v)} label="Fundo do badge" />
            </div>
            <div>
              <ColorPicker value={d.urgencyBadgeText || "#f87171"} onChange={v => setDesign("urgencyBadgeText", v)} label="Texto do badge" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setDesign("urgencyBadgeBg", "rgba(239,68,68,0.25)"); setDesign("urgencyBadgeText", "#f87171"); }}
              className="flex-1 py-2 rounded-xl text-[10px] font-medium bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent hover:border-primary/40 transition-all">
              Vermelho
            </button>
            <button onClick={() => { setDesign("urgencyBadgeBg", "rgba(245,158,11,0.25)"); setDesign("urgencyBadgeText", "#fbbf24"); }}
              className="flex-1 py-2 rounded-xl text-[10px] font-medium bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent hover:border-primary/40 transition-all">
              Amarelo
            </button>
            <button onClick={() => { setDesign("urgencyBadgeBg", `${accent}20`); setDesign("urgencyBadgeText", accent); }}
              className="flex-1 py-2 rounded-xl text-[10px] font-medium bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent hover:border-primary/40 transition-all">
              Cor do tema
            </button>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════
          ICONES SOCIAIS
          ══════════════════════════════════════════════════════════ */}
      <Section title="Icones das redes sociais" icon={<Circle size={14} />}>
        <div className="space-y-3 pt-2">
          <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] leading-relaxed">
            Escolha como os icones das redes sociais aparecem na sua vitrine.
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {(["brand", "theme", "custom"] as const).map(style => (
              <button key={style} onClick={() => setDesign("socialIconStyle", style)}
                className={`py-2.5 rounded-xl text-[10px] font-medium transition-all ${
                  (d.socialIconStyle || "brand") === style ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent"
                }`}>
                {style === "brand" ? "Cor oficial" : style === "theme" ? "Cor do tema" : "Personalizada"}
              </button>
            ))}
          </div>
          {(d.socialIconStyle || "brand") === "custom" && (
            <ColorPicker value={d.socialIconCustomColor || accent} onChange={v => setDesign("socialIconCustomColor", v)} label="Cor dos icones" />
          )}
          <div className="flex items-center gap-2 bg-[hsl(var(--dash-accent))] rounded-xl p-2.5">
            <div className="flex gap-1">
              <div className="w-5 h-5 rounded-full bg-[#E4405F]/15 flex items-center justify-center"><span className="text-[8px]" style={{ color: "#E4405F" }}>IG</span></div>
              <div className="w-5 h-5 rounded-full bg-[#25D366]/15 flex items-center justify-center"><span className="text-[8px]" style={{ color: "#25D366" }}>WA</span></div>
              <div className="w-5 h-5 rounded-full bg-[#FF0000]/15 flex items-center justify-center"><span className="text-[8px]" style={{ color: "#FF0000" }}>YT</span></div>
            </div>
            <p className="text-[8px] text-[hsl(var(--dash-text-subtle))]">
              {(d.socialIconStyle || "brand") === "brand" ? "Cada rede usa sua cor oficial" : (d.socialIconStyle || "brand") === "theme" ? "Todos usam a cor do tema" : "Todos usam a cor personalizada"}
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}

export default function AdvancedDrawer(props: AdvancedDrawerProps) {
  const { open, onOpenChange, ...contentProps } = props;
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[460px] max-w-[90vw] overflow-y-auto bg-[hsl(var(--dash-bg))] border-[hsl(var(--dash-border-subtle))]">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-[hsl(var(--dash-text))] text-[15px]">Personalizar</SheetTitle>
            <SheetDescription className="text-[hsl(var(--dash-text-subtle))] text-[11px]">Todas as alteracoes aparecem no preview ao vivo</SheetDescription>
          </SheetHeader>
          <AdvancedContent {...contentProps} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[88vh] bg-[hsl(var(--dash-bg))] border-[hsl(var(--dash-border-subtle))]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-[hsl(var(--dash-text))] text-[15px]">Personalizar</DrawerTitle>
          <DrawerDescription className="text-[hsl(var(--dash-text-subtle))] text-[11px]">Todas as alteracoes aparecem no preview ao vivo</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-6">
          <AdvancedContent {...contentProps} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
