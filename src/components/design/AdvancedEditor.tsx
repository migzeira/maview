import { useState } from "react";
import { ChevronDown, Palette, Square, User as UserIcon, Type, Layers, Settings2, Circle, Hexagon } from "lucide-react";
import type { DesignConfig, BgType, ProfileShape, ButtonShape, ButtonFill, ButtonShadow, GradientDir } from "./constants";
import { SOLID_COLORS, BG_PATTERNS } from "./constants";
import { ColorPicker } from "./utils";

/* ═══════════════════════════════════════════════════════════════════════════
   AdvancedEditor — Reorganização estilo Beacons + presets inteligentes

   Antes: 50+ controles empilhados verticalmente
   Agora: 4 categorias colapsáveis com presets visuais:
     🎨 Fundo            (6 presets: Sólido | Gradient | Imagem | Efeito | Padrão | Vídeo)
     🔲 Cards & Botões  (3 presets: Clean | Glass | Bold + 2 sliders essenciais)
     📸 Foto de Perfil  (4 shapes + glow toggle + size slider)
     ✍️ Tipografia      (5 font pairs + 3 cores essenciais)

   Cada preset é "bundled decision" (muda múltiplas props ao mesmo tempo).
   Botão "Modo Pro" no rodapé abre o AdvancedContent original (poder total).
   ═══════════════════════════════════════════════════════════════════════════ */

interface Props {
  design: DesignConfig;
  setDesign: (key: keyof DesignConfig, value: unknown) => void;
  onOpenProMode: () => void;
}

/* ─── Collapsible Section ─── */
function Accordion({ icon, title, desc, children, defaultOpen = false }: {
  icon: React.ReactNode; title: string; desc: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))] overflow-hidden transition-all">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[hsl(var(--dash-accent))]/40 transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[hsl(var(--dash-text))]">{title}</p>
          <p className="text-[11px] text-[hsl(var(--dash-text-subtle))] mt-0.5 truncate">{desc}</p>
        </div>
        <ChevronDown
          size={16}
          className="text-[hsl(var(--dash-text-subtle))] transition-transform flex-shrink-0"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {open && (
        <div className="border-t border-[hsl(var(--dash-border-subtle))] p-4 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── PresetCard: thumbnail clicável com preview visual ─── */
function PresetCard({ active, onClick, preview, label }: {
  active: boolean; onClick: () => void; preview: React.ReactNode; label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative rounded-xl overflow-hidden transition-all active:scale-95 ${
        active
          ? "ring-2 ring-primary shadow-lg shadow-primary/20"
          : "ring-1 ring-[hsl(var(--dash-border))] hover:ring-primary/50"
      }`}
    >
      <div className="aspect-[4/3] overflow-hidden">{preview}</div>
      <p className={`text-[10px] font-semibold py-1.5 text-center ${
        active ? "text-primary bg-primary/10" : "text-[hsl(var(--dash-text-muted))] bg-[hsl(var(--dash-bg))]"
      }`}>
        {label}
      </p>
    </button>
  );
}

/* ══════════════════════════════════════════════
   SEÇÃO 1 — FUNDO
   ══════════════════════════════════════════════ */
function FundoSection({ design: d, setDesign }: { design: DesignConfig; setDesign: Props["setDesign"] }) {
  const bgTypes: { id: BgType; label: string; icon: React.ReactNode }[] = [
    { id: "solid", label: "Sólido", icon: <div className="w-full h-full" style={{ background: "#6366f1" }} /> },
    { id: "gradient", label: "Gradient", icon: <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #f093fb, #f5576c)" }} /> },
    { id: "pattern", label: "Padrão", icon: <div className="w-full h-full bg-slate-800" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)", backgroundSize: "8px 8px" }} /> },
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-medium text-[hsl(var(--dash-text-subtle))] mb-2">Tipo de fundo</p>
        <div className="grid grid-cols-3 gap-2">
          {bgTypes.map(t => (
            <PresetCard
              key={t.id}
              active={d.bgType === t.id}
              onClick={() => setDesign("bgType", t.id)}
              preview={t.icon}
              label={t.label}
            />
          ))}
        </div>
      </div>

      {/* Controles contextuais baseados no tipo escolhido */}
      {d.bgType === "solid" && (
        <div className="space-y-2">
          <ColorPicker value={d.bgColor || "#0a0a0a"} onChange={v => setDesign("bgColor", v)} label="Cor de fundo" />
          <div className="grid grid-cols-8 gap-1.5">
            {SOLID_COLORS.map(c => (
              <button key={c} onClick={() => setDesign("bgColor", c)}
                className={`w-full aspect-square rounded-lg transition-all hover:scale-110 ${d.bgColor === c ? "ring-2 ring-primary" : "ring-1 ring-[hsl(var(--dash-border))]"}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>
      )}

      {d.bgType === "gradient" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <ColorPicker value={d.bgGradient?.[0] || "#667eea"} onChange={v => setDesign("bgGradient", [v, d.bgGradient?.[1] || "#764ba2"])} label="Cor 1" />
            <ColorPicker value={d.bgGradient?.[1] || "#764ba2"} onChange={v => setDesign("bgGradient", [d.bgGradient?.[0] || "#667eea", v])} label="Cor 2" />
          </div>
          <p className="text-[10px] font-medium text-[hsl(var(--dash-text-subtle))]">Presets curados</p>
          {/* Gradient presets NOMEADOS — Stan-like memorável */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: "Royal", c1: "#667eea", c2: "#764ba2" },
              { name: "Sunset", c1: "#f093fb", c2: "#f5576c" },
              { name: "Ocean", c1: "#4facfe", c2: "#00f2fe" },
              { name: "Mint", c1: "#43e97b", c2: "#38f9d7" },
              { name: "Peach", c1: "#fa709a", c2: "#fee140" },
              { name: "Lavender", c1: "#a18cd1", c2: "#fbc2eb" },
              { name: "Honey", c1: "#f6d365", c2: "#fda085" },
              { name: "Aurora", c1: "#c471f5", c2: "#fa71cd" },
              { name: "Neon", c1: "#7f00ff", c2: "#e100ff" },
              { name: "Midnight", c1: "#0f0c29", c2: "#302b63" },
              { name: "Crimson", c1: "#200122", c2: "#6f0000" },
              { name: "Forest", c1: "#11998e", c2: "#38ef7d" },
            ].map(g => {
              const isActive = d.bgGradient?.[0] === g.c1 && d.bgGradient?.[1] === g.c2;
              return (
                <button key={g.name}
                  onClick={() => setDesign("bgGradient", [g.c1, g.c2])}
                  className="relative group">
                  <div className={`w-full aspect-square rounded-lg transition-all hover:scale-105 ${isActive ? "ring-2 ring-primary shadow-lg" : "ring-1 ring-[hsl(var(--dash-border))]"}`}
                    style={{ background: `linear-gradient(135deg, ${g.c1}, ${g.c2})` }} />
                  <p className={`text-[9px] font-bold mt-1 text-center transition-colors ${isActive ? "text-primary" : "text-[hsl(var(--dash-text-muted))]"}`}>
                    {g.name}
                  </p>
                </button>
              );
            })}
          </div>
          <div>
            <p className="text-[10px] font-medium text-[hsl(var(--dash-text-subtle))] mb-1.5">Direção</p>
            <div className="grid grid-cols-4 gap-1.5">
              {(["to-b", "to-br", "to-r", "radial"] as GradientDir[]).map(dir => (
                <button key={dir} onClick={() => setDesign("bgGradientDir", dir)}
                  className={`py-1.5 rounded-lg text-[10px] font-medium ${d.bgGradientDir === dir ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] hover:ring-1 hover:ring-primary/20"}`}>
                  {dir === "to-b" ? "↓ Vertical" : dir === "to-br" ? "↘ Diagonal" : dir === "to-r" ? "→ Horizontal" : "◎ Radial"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {d.bgType === "pattern" && (
        <div>
          <p className="text-[10px] font-medium text-[hsl(var(--dash-text-subtle))] mb-2">Padrão</p>
          <div className="grid grid-cols-4 gap-2">
            {BG_PATTERNS.map(p => (
              <button key={p.id} onClick={() => setDesign("bgPattern", p.id)}
                className={`px-2 py-3 rounded-lg text-[10px] font-medium transition-all ${
                  d.bgPattern === p.id ? "bg-primary/15 text-primary ring-1 ring-primary" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))] hover:ring-1 hover:ring-primary/30"
                }`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

/* ══════════════════════════════════════════════
   SEÇÃO 2 — CARDS & BOTÕES
   ══════════════════════════════════════════════ */
function CardsSection({ design: d, setDesign }: { design: DesignConfig; setDesign: Props["setDesign"] }) {
  const presets = [
    {
      id: "clean",
      label: "Clean",
      desc: "Fundo sólido, borda sutil, cantos suaves",
      apply: () => {
        setDesign("cardBg", "#13102a");
        setDesign("cardBorder", "rgba(255,255,255,0.10)");
        setDesign("buttonFill", "solid" as ButtonFill);
        setDesign("buttonShape", "soft" as ButtonShape);
        setDesign("buttonRadius", 12);
        setDesign("buttonShadow", "sm" as ButtonShadow);
      },
      preview: <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <div className="w-[80%] h-8 rounded-lg bg-slate-800 border border-white/10" />
      </div>,
    },
    {
      id: "glass",
      label: "Glass",
      desc: "Translúcido com backdrop blur, moderno e premium",
      apply: () => {
        setDesign("cardBg", "rgba(255,255,255,0.14)");
        setDesign("cardBorder", "rgba(255,255,255,0.22)");
        setDesign("buttonFill", "glass" as ButtonFill);
        setDesign("buttonShape", "pill" as ButtonShape);
        setDesign("buttonRadius", 999);
        setDesign("buttonShadow", "md" as ButtonShadow);
      },
      preview: <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
        <div className="w-[80%] h-8 rounded-full bg-white/20 backdrop-blur border border-white/40" />
      </div>,
    },
    {
      id: "bold",
      label: "Bold",
      desc: "Borda grossa, cantos grandes, alto contraste",
      apply: () => {
        setDesign("cardBg", "#ffffff");
        setDesign("cardBorder", "#000000");
        setDesign("buttonFill", "solid" as ButtonFill);
        setDesign("buttonShape", "rounded" as ButtonShape);
        setDesign("buttonRadius", 20);
        setDesign("buttonShadow", "glow" as ButtonShadow);
      },
      preview: <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="w-[80%] h-8 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0_black]" />
      </div>,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-medium text-[hsl(var(--dash-text-subtle))] mb-2">Estilo dos cards e botões</p>
        <div className="grid grid-cols-3 gap-2">
          {presets.map(p => (
            <PresetCard
              key={p.id}
              active={false /* hard to detect which preset is active from individual fields */}
              onClick={p.apply}
              preview={p.preview}
              label={p.label}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ColorPicker value={d.cardBg || "#13102a"} onChange={v => setDesign("cardBg", v)} label="Fundo do card" />
        <ColorPicker value={d.cardBorder || "rgba(255,255,255,0.1)"} onChange={v => setDesign("cardBorder", v)} label="Borda do card" />
      </div>

      <div>
        <p className="text-[10px] font-medium text-[hsl(var(--dash-text-subtle))] mb-1.5">Formato dos botões</p>
        <div className="grid grid-cols-4 gap-1.5">
          {(["rounded", "pill", "square", "soft"] as ButtonShape[]).map(s => (
            <button key={s} onClick={() => setDesign("buttonShape", s)}
              className={`py-2 rounded-lg text-[10px] font-medium ${d.buttonShape === s ? "bg-primary/15 text-primary ring-1 ring-primary" : "bg-[hsl(var(--dash-accent))] text-[hsl(var(--dash-text-muted))]"}`}>
              {s === "rounded" ? "Arredondado" : s === "pill" ? "Pílula" : s === "square" ? "Quadrado" : "Suave"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SEÇÃO 3 — FOTO DE PERFIL
   ══════════════════════════════════════════════ */
function PerfilSection({ design: d, setDesign }: { design: DesignConfig; setDesign: Props["setDesign"] }) {
  const shapes: { id: ProfileShape; label: string; icon: React.ReactNode }[] = [
    { id: "circle", label: "Círculo", icon: <Circle size={24} className="text-primary" /> },
    { id: "rounded", label: "Arredondado", icon: <div className="w-6 h-6 rounded-[8px] bg-primary" /> },
    { id: "square", label: "Quadrado", icon: <div className="w-6 h-6 rounded-sm bg-primary" /> },
    { id: "hexagon", label: "Hexágono", icon: <Hexagon size={24} className="text-primary" /> },
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-medium text-[hsl(var(--dash-text-subtle))] mb-2">Formato da foto</p>
        <div className="grid grid-cols-4 gap-2">
          {shapes.map(s => (
            <button key={s.id} onClick={() => setDesign("profileShape", s.id)}
              className={`px-2 py-3 rounded-xl transition-all flex flex-col items-center gap-1.5 ${
                d.profileShape === s.id ? "bg-primary/10 ring-2 ring-primary" : "bg-[hsl(var(--dash-accent))] ring-1 ring-[hsl(var(--dash-border))] hover:ring-primary/40"
              }`}>
              {s.icon}
              <span className="text-[10px] font-medium text-[hsl(var(--dash-text-muted))]">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Toggle Glow */}
      <label className="flex items-center justify-between cursor-pointer py-2">
        <div>
          <p className="text-[12px] font-medium text-[hsl(var(--dash-text))]">Brilho atrás da foto</p>
          <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mt-0.5">Halo luminoso ao redor do avatar</p>
        </div>
        <div
          onClick={() => setDesign("profileGlow", !d.profileGlow)}
          className={`relative w-11 h-6 rounded-full transition-colors ${d.profileGlow !== false ? "bg-primary" : "bg-[hsl(var(--dash-border))]"}`}
        >
          <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow-sm"
            style={{ left: d.profileGlow !== false ? "calc(100% - 22px)" : "2px" }} />
        </div>
      </label>

      {/* Size slider */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-medium text-[hsl(var(--dash-text-subtle))]">Tamanho</p>
          <span className="text-[10px] font-mono text-primary">{d.profileSize || 88}px</span>
        </div>
        <input
          type="range" min={60} max={140} step={4}
          value={d.profileSize || 88}
          onChange={e => setDesign("profileSize", parseInt(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      {/* Border toggle + color */}
      <label className="flex items-center justify-between cursor-pointer py-2">
        <p className="text-[12px] font-medium text-[hsl(var(--dash-text))]">Borda colorida</p>
        <div
          onClick={() => setDesign("profileBorder", !d.profileBorder)}
          className={`relative w-11 h-6 rounded-full transition-colors ${d.profileBorder !== false ? "bg-primary" : "bg-[hsl(var(--dash-border))]"}`}
        >
          <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow-sm"
            style={{ left: d.profileBorder !== false ? "calc(100% - 22px)" : "2px" }} />
        </div>
      </label>
      {d.profileBorder !== false && (
        <ColorPicker value={d.profileBorderColor || d.accentColor || "#a855f7"} onChange={v => setDesign("profileBorderColor", v)} label="Cor da borda" />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SEÇÃO 4 — TIPOGRAFIA & CORES
   ══════════════════════════════════════════════ */
function TipografiaSection({ design: d, setDesign }: { design: DesignConfig; setDesign: Props["setDesign"] }) {
  const fontPairPresets = [
    { id: "clean", label: "Clean", heading: "Inter", body: "Inter", desc: "Sans-serif limpo" },
    { id: "premium", label: "Premium", heading: "Playfair Display", body: "Inter", desc: "Serifa editorial" },
    { id: "bold", label: "Bold", heading: "Bebas Neue", body: "Poppins", desc: "Impacto forte" },
    { id: "luxury", label: "Luxury", heading: "DM Serif Display", body: "Manrope", desc: "Elegância séria" },
    { id: "modern", label: "Modern", heading: "Space Grotesk", body: "DM Sans", desc: "Tech minimalista" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-medium text-[hsl(var(--dash-text-subtle))] mb-2">Par de fontes (título + corpo)</p>
        <div className="grid grid-cols-1 gap-1.5">
          {fontPairPresets.map(p => {
            const active = d.fontHeading === p.heading && d.fontBody === p.body;
            return (
              <button key={p.id}
                onClick={() => { setDesign("fontHeading", p.heading); setDesign("fontBody", p.body); }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                  active ? "bg-primary/10 ring-2 ring-primary" : "bg-[hsl(var(--dash-accent))] ring-1 ring-[hsl(var(--dash-border))] hover:ring-primary/40"
                }`}>
                <div>
                  <p style={{ fontFamily: `'${p.heading}', sans-serif` }} className="text-[14px] font-bold text-[hsl(var(--dash-text))]">{p.label}</p>
                  <p style={{ fontFamily: `'${p.body}', sans-serif` }} className="text-[10px] text-[hsl(var(--dash-text-subtle))] mt-0.5">{p.heading} + {p.body}</p>
                </div>
                <span className="text-[9px] text-[hsl(var(--dash-text-subtle))]">{p.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-medium text-[hsl(var(--dash-text-subtle))] mb-2">Cores essenciais</p>
        <div className="grid grid-cols-3 gap-3">
          <ColorPicker value={d.accentColor || "#a855f7"} onChange={v => setDesign("accentColor", v)} label="Principal" />
          <ColorPicker value={d.textColor || "#ffffff"} onChange={v => setDesign("textColor", v)} label="Texto" />
          <ColorPicker value={d.subtextColor || "rgba(255,255,255,0.7)"} onChange={v => setDesign("subtextColor", v)} label="Bio" />
        </div>
        <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mt-2">14+ cores detalhadas (nome, preço, badge) no Modo Pro.</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN EDITOR
   ══════════════════════════════════════════════ */
export default function AdvancedEditor({ design, setDesign, onOpenProMode }: Props) {
  return (
    <div className="space-y-3">
      <Accordion icon={<Palette size={16} />} title="Fundo" desc="Sólido, gradient ou padrão">
        <FundoSection design={design} setDesign={setDesign} />
      </Accordion>

      <Accordion icon={<Square size={16} />} title="Cards & Botões" desc="Estilo dos cards de produto">
        <CardsSection design={design} setDesign={setDesign} />
      </Accordion>

      <Accordion icon={<UserIcon size={16} />} title="Foto de Perfil" desc="Formato, brilho e tamanho">
        <PerfilSection design={design} setDesign={setDesign} />
      </Accordion>

      <Accordion icon={<Type size={16} />} title="Tipografia & Cores" desc="Pares de fonte prontos + cores principais">
        <TipografiaSection design={design} setDesign={setDesign} />
      </Accordion>

      {/* Modo Pro — abre o AdvancedContent antigo para power users */}
      <button
        onClick={onOpenProMode}
        className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:from-primary/15 hover:to-primary/10 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <Settings2 size={16} />
          </div>
          <div className="text-left">
            <p className="text-[13px] font-semibold text-[hsl(var(--dash-text))]">Modo Pro</p>
            <p className="text-[11px] text-[hsl(var(--dash-text-subtle))]">50+ controles detalhados · para quem quer ajustar pixel por pixel</p>
          </div>
        </div>
        <Layers size={16} className="text-primary group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}
