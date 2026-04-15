import { useRef, useState } from "react";
import {
  Layers, Square, Circle, Palette, Upload, X, Play, Type, Eye, Loader2,
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
  setDesign: (key: keyof DesignConfig, value: any) => void;
  onBgColorChange: (color: string) => void;
}

function AdvancedContent({ design: d, currentTheme, accent, setDesign, onBgColorChange }: Omit<AdvancedDrawerProps, "open" | "onOpenChange">) {
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const bgVideoInputRef = useRef<HTMLInputElement>(null);
  const [bgUploading, setBgUploading] = useState(false);
  const inputCls = "w-full rounded-xl border border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text))] text-sm px-3.5 py-2.5 placeholder:text-[hsl(var(--dash-text-subtle))] focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all";

  return (
    <div className="space-y-4 px-1">
      {/* ── Fundo ── */}
      <Section title="Fundo" icon={<Layers size={14} />} defaultOpen>
        <div className="flex gap-1.5 pt-2 flex-wrap">
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
              // Preview immediately with base64
              const r = new FileReader(); r.onload = () => setDesign("bgImageUrl", r.result as string); r.readAsDataURL(f);
              // Upload to storage in background
              setBgUploading(true);
              const publicUrl = await uploadImage(f, "backgrounds");
              setBgUploading(false);
              if (publicUrl) {
                setDesign("bgImageUrl", publicUrl);
                // Auto-extract dominant color and apply to profile border + glow
                try {
                  const { extractColorsFromImage } = await import("./utils");
                  const colors = await extractColorsFromImage(publicUrl);
                  if (colors?.dominant) {
                    setDesign("profileBorderColor", colors.dominant);
                    setDesign("profileGlowColor" as any, colors.dominant);
                  }
                } catch { /* best-effort */ }
              }
            }} />
            {bgUploading && (
              <div className="flex items-center gap-1.5 text-[10px] text-primary font-medium">
                <Loader2 size={10} className="animate-spin" /> Enviando imagem...
              </div>
            )}
            <input type="url" className={inputCls} placeholder="Ou cole URL..." value={d.bgImageUrl.startsWith("data:") ? "" : d.bgImageUrl} onChange={e => setDesign("bgImageUrl", e.target.value)} />
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
      </Section>

      {/* ── Textos (PRIMEIRO — mais importante para legibilidade) ── */}
      <Section title="Cores dos textos" icon={<Type size={14} />} defaultOpen>
        <div className="space-y-3 pt-2">
          <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] leading-relaxed">
            Cada texto tem cor 100% independente. Nenhum afeta o outro.
          </p>
          {/* Row 1: Name + Bio */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <ColorPicker value={d.nameColor || d.textColor || currentTheme.text} onChange={v => setDesign("nameColor", v)} label="Seu nome" />
              <p className="text-[8px] text-[hsl(var(--dash-text-subtle))] mt-0.5">Nome no topo do perfil</p>
            </div>
            <div>
              <ColorPicker value={d.subtextColor || currentTheme.sub} onChange={v => setDesign("subtextColor", v)} label="Bio" />
              <p className="text-[8px] text-[hsl(var(--dash-text-subtle))] mt-0.5">Texto da sua bio</p>
            </div>
          </div>
          {/* Row 2: Product title + Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <ColorPicker value={d.productTitleColor || d.textColor || currentTheme.text} onChange={v => setDesign("productTitleColor", v)} label="Titulo produtos" />
              <p className="text-[8px] text-[hsl(var(--dash-text-subtle))] mt-0.5">Nome do produto (ex: iPhone 15)</p>
            </div>
            <div>
              <ColorPicker value={d.descriptionColor || d.subtextColor || currentTheme.sub} onChange={v => setDesign("descriptionColor", v)} label="Descricao produto" />
              <p className="text-[8px] text-[hsl(var(--dash-text-subtle))] mt-0.5">Texto abaixo do titulo</p>
            </div>
          </div>
          {/* Row 3: Price + Strikethrough price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <ColorPicker value={d.priceColor || d.textColor || currentTheme.text} onChange={v => setDesign("priceColor", v)} label="Preco atual" />
              <p className="text-[8px] text-[hsl(var(--dash-text-subtle))] mt-0.5">Valor do produto</p>
            </div>
            <div>
              <ColorPicker value={d.originalPriceColor || "rgba(156,163,175,0.7)"} onChange={v => setDesign("originalPriceColor", v)} label="Preco riscado" />
              <p className="text-[8px] text-[hsl(var(--dash-text-subtle))] mt-0.5">Valor anterior (riscado)</p>
            </div>
          </div>
          {/* Row 4: Others */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <ColorPicker value={d.textColor || currentTheme.text} onChange={v => setDesign("textColor", v)} label="Outros textos" />
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
          {/* Text shadow — slider */}
          <div className="space-y-2 pt-1">
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
              <span>Sem sombra</span>
              <span>Sutil</span>
              <span>Forte</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Badge de urgencia ── */}
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

      {/* ── Icones sociais ── */}
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
                {style === "brand" ? "Cor oficial" : style === "theme" ? "Cor do tema" : "Cor personalizada"}
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

      {/* ── Cores de destaque ── */}
      <Section title="Cores de destaque" icon={<Palette size={14} />}>
        <div className="space-y-3 pt-2">
          <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] leading-relaxed">
            {d.bgType === "effect"
              ? "Cor principal dos botoes, precos, @username, icones sociais e da animacao de fundo."
              : "Cor principal dos botoes, precos, @username e icones sociais."}
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

      {/* ── Cards / Produto ── */}
      <Section title="Cards dos produtos" icon={<Square size={14} />}>
        <div className="space-y-3 pt-2">
          <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] leading-relaxed">
            Fundo e borda dos cards de produtos, links e depoimentos.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <ColorPicker value={d.cardBg || currentTheme.card} onChange={v => setDesign("cardBg", v)} label="Fundo do card" />
              <p className="text-[8px] text-[hsl(var(--dash-text-subtle))] mt-0.5">Fundo dos produtos e links</p>
            </div>
            <div>
              <ColorPicker value={d.cardBorder || currentTheme.border} onChange={v => setDesign("cardBorder", v)} label="Borda do card" />
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

      {/* ── Botoes ── */}
      <Section title="Formato dos botoes" icon={<Square size={14} />}>
        <div className="space-y-3 pt-2">
          <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] leading-relaxed">
            Formato e estilo dos botoes de links e produtos.
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {(["rounded", "pill", "square", "soft"] as ButtonShape[]).map(shape => (
              <button key={shape} onClick={() => setDesign("buttonShape", shape)}
                className={`py-2.5 rounded-xl text-[10px] font-medium transition-all ${d.buttonShape === shape ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent"}`}>
                {shape === "rounded" ? "Arredondado" : shape === "pill" ? "Pilula" : shape === "square" ? "Quadrado" : "Suave"}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {(["solid", "outline", "glass", "ghost"] as ButtonFill[]).map(fill => (
              <button key={fill} onClick={() => setDesign("buttonFill", fill)}
                className={`py-2.5 rounded-xl text-[10px] font-medium transition-all ${d.buttonFill === fill ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent"}`}>
                {fill === "solid" ? "Solido" : fill === "outline" ? "Contorno" : fill === "glass" ? "Vidro" : "Fantasma"}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Foto de perfil ── */}
      <Section title="Foto de perfil" icon={<Circle size={14} />}>
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-4 gap-1.5">
            {(["circle", "rounded", "square", "hexagon"] as ProfileShape[]).map(shape => (
              <button key={shape} onClick={() => setDesign("profileShape", shape)}
                className={`py-2.5 rounded-xl text-[9px] font-medium transition-all ${d.profileShape === shape ? "bg-primary/15 text-primary border border-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] border border-transparent"}`}>
                {shape === "circle" ? "Circulo" : shape === "rounded" ? "Arredondado" : shape === "square" ? "Quadrado" : "Hexagono"}
              </button>
            ))}
          </div>
          {/* Borda colorida */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-[hsl(var(--dash-text-subtle))]">Borda colorida</p>
            <button onClick={() => setDesign("profileBorder", !d.profileBorder)}
              className={`relative w-9 h-5 rounded-full transition-colors ${d.profileBorder ? "bg-primary" : "bg-[hsl(var(--dash-border))]"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${d.profileBorder ? "left-[18px]" : "left-0.5"}`} />
            </button>
          </div>
          {d.profileBorder && (
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-[hsl(var(--dash-text-subtle))]">Cor da borda</p>
              <ColorPicker color={d.profileBorderColor || accent} onChange={c => setDesign("profileBorderColor", c)} />
            </div>
          )}

          {/* Brilho / Glow */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-[hsl(var(--dash-text-subtle))]">Brilho (glow)</p>
            <button onClick={() => setDesign("profileGlow", !(d as any).profileGlow)}
              className={`relative w-9 h-5 rounded-full transition-colors ${(d as any).profileGlow ? "bg-primary" : "bg-[hsl(var(--dash-border))]"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${(d as any).profileGlow ? "left-[18px]" : "left-0.5"}`} />
            </button>
          </div>
          {(d as any).profileGlow && (
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-[hsl(var(--dash-text-subtle))]">Cor do brilho</p>
              <ColorPicker color={(d as any).profileGlowColor || d.profileBorderColor || accent} onChange={c => setDesign("profileGlowColor" as any, c)} />
            </div>
          )}
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
        <SheetContent side="right" className="w-[420px] max-w-[90vw] overflow-y-auto bg-[hsl(var(--dash-bg))] border-[hsl(var(--dash-border-subtle))]">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-[hsl(var(--dash-text))] text-[15px]">Personalizar mais</SheetTitle>
            <SheetDescription className="text-[hsl(var(--dash-text-subtle))] text-[11px]">Fundo, textos, cores, botoes, cards e foto de perfil</SheetDescription>
          </SheetHeader>
          <AdvancedContent {...contentProps} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] bg-[hsl(var(--dash-bg))] border-[hsl(var(--dash-border-subtle))]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-[hsl(var(--dash-text))] text-[15px]">Personalizar mais</DrawerTitle>
          <DrawerDescription className="text-[hsl(var(--dash-text-subtle))] text-[11px]">Fundo, textos, cores, botoes, cards e foto de perfil</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-6">
          <AdvancedContent {...contentProps} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
