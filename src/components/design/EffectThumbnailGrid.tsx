import React, { useState, useRef, useEffect, memo } from "react";
import { Check } from "lucide-react";
import { BG_EFFECTS, EFFECT_CATEGORIES } from "./constants";

/* ── Effect preview renderer ──────────────────────── */
export function getEffectPreviewElements(effectId: string, a: string): React.ReactNode {
  a = a || "#a855f7";

  const effects: Record<string, () => React.ReactNode> = {
    "aurora": () => <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${a}40, transparent 40%, ${a}25 60%, transparent 80%, ${a}30)`, backgroundSize: "200% 200%", animation: "mv-prev-aurora 4s ease-in-out infinite" }} />,
    "aurora-waves": () => <><div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${a}35, transparent, ${a}20)`, backgroundSize: "200% 200%", animation: "mv-prev-aurora 5s ease-in-out infinite" }} /><div className="absolute bottom-0 left-0 w-[200%] h-[40%]" style={{ background: `linear-gradient(90deg, transparent, ${a}15, transparent)`, filter: "blur(8px)", animation: "mv-prev-wave 6s ease-in-out infinite" }} /></>,
    "ambient-glow": () => <div className="absolute inset-0 flex items-center justify-center"><div className="w-[70%] h-[70%] rounded-full" style={{ background: `radial-gradient(circle, ${a}40, transparent 70%)`, animation: "mv-prev-glow 4s ease-in-out infinite" }} /></div>,
    "spotlight": () => <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[120%]" style={{ background: `conic-gradient(from 180deg, transparent 40%, ${a}20 50%, transparent 60%)`, animation: "mv-prev-breathe 3s ease-in-out infinite" }} />,
    "radial-glow": () => <><div className="absolute top-[20%] left-[30%] w-[50%] h-[50%] rounded-full" style={{ background: `radial-gradient(circle, ${a}35, transparent 65%)`, animation: "mv-prev-pulse 3s ease-in-out infinite" }} /><div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] rounded-full" style={{ background: `radial-gradient(circle, ${a}25, transparent 65%)`, animation: "mv-prev-pulse 4s ease-in-out infinite 1s" }} /></>,
    "gradient-flow": () => <div className="absolute inset-0" style={{ background: `linear-gradient(45deg, ${a}30, #ec489920, ${a}30, #06b6d420)`, backgroundSize: "300% 300%", animation: "mv-prev-aurora 6s ease infinite" }} />,
    "gradient-mesh": () => <><div className="absolute top-[10%] left-[10%] w-[60%] h-[60%] rounded-full" style={{ background: `radial-gradient(circle, ${a}30, transparent 60%)`, animation: "mv-prev-drift 8s ease-in-out infinite" }} /><div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] rounded-full" style={{ background: `radial-gradient(circle, ${a}25, transparent 60%)`, animation: "mv-prev-drift 10s ease-in-out infinite reverse" }} /></>,
    "gradient-shift": () => <div className="absolute inset-0" style={{ background: `linear-gradient(120deg, ${a}25, transparent 50%, ${a}20)`, backgroundSize: "200% 200%", animation: "mv-prev-aurora 5s ease-in-out infinite" }} />,
    "starfield": () => <div className="absolute inset-0" style={{ background: `radial-gradient(1px 1px at 15% 25%, white 50%, transparent), radial-gradient(1px 1px at 45% 65%, white 40%, transparent), radial-gradient(1px 1px at 75% 15%, white 50%, transparent), radial-gradient(1px 1px at 85% 80%, white 30%, transparent), radial-gradient(1px 1px at 30% 90%, white 50%, transparent), radial-gradient(1px 1px at 55% 45%, white 40%, transparent)`, animation: "mv-prev-flicker 3s steps(1) infinite" }} />,
    "floating-dots": () => <>{[0,1,2,3,4].map(i => <div key={i} className="absolute rounded-full" style={{ width: 3, height: 3, background: a, left: `${15+i*18}%`, bottom: "80%", opacity: 0.5, animation: `mv-prev-rise ${3+i*0.5}s ease-in-out infinite ${i*0.6}s` }} />)}</>,
    "sparkles": () => <>{[0,1,2,3,4,5].map(i => <div key={i} className="absolute rounded-full" style={{ width: 2, height: 2, background: i%2 ? "#fcd34d" : a, left: `${10+i*15}%`, top: `${15+(i*37)%70}%`, animation: `mv-prev-pulse ${2+i*0.3}s ease-in-out infinite ${i*0.4}s` }} />)}</>,
    "wave-layers": () => <><div className="absolute bottom-0 left-0 w-[200%] h-[30%]" style={{ background: `linear-gradient(180deg, transparent, ${a}12)`, borderRadius: "45% 45% 0 0", animation: "mv-prev-wave 5s ease-in-out infinite" }} /><div className="absolute bottom-0 left-0 w-[200%] h-[25%]" style={{ background: `linear-gradient(180deg, transparent, ${a}08)`, borderRadius: "45% 45% 0 0", animation: "mv-prev-wave 7s ease-in-out infinite 1s" }} /></>,
    "flow-field": () => <><div className="absolute w-[150%] h-[20%] top-[30%] -left-[25%]" style={{ background: `linear-gradient(90deg, transparent, ${a}15, transparent)`, filter: "blur(6px)", animation: "mv-prev-wave 8s ease-in-out infinite" }} /><div className="absolute w-[150%] h-[15%] top-[60%] -left-[25%]" style={{ background: `linear-gradient(90deg, transparent, ${a}10, transparent)`, filter: "blur(8px)", animation: "mv-prev-wave 10s ease-in-out infinite reverse" }} /></>,
    "liquid": () => <div className="absolute inset-[10%] rounded-full" style={{ background: `radial-gradient(circle at 40% 40%, ${a}30, transparent 60%)`, animation: "mv-prev-morph 6s ease-in-out infinite" }} />,
    "matrix-grid": () => <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(${a}20 1px, transparent 1px), linear-gradient(90deg, ${a}20 1px, transparent 1px)`, backgroundSize: "8px 8px", animation: "mv-prev-grid-pulse 3s ease-in-out infinite" }} />,
    "pulse-grid": () => <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(${a}15 1px, transparent 1px), linear-gradient(90deg, ${a}15 1px, transparent 1px)`, backgroundSize: "10px 10px", animation: "mv-prev-grid-pulse 2s ease-in-out infinite" }} />,
    "scan-lines": () => <><div className="absolute inset-0" style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${a}06 2px, ${a}06 3px)` }} /><div className="absolute left-0 w-full h-[15%]" style={{ background: `linear-gradient(180deg, transparent, ${a}15, transparent)`, animation: "mv-prev-scan 3s linear infinite" }} /></>,
    "fog": () => <div className="absolute w-[120%] h-[60%] top-[20%] -left-[10%] rounded-full" style={{ background: `radial-gradient(ellipse, ${a}12, transparent 70%)`, filter: "blur(15px)", animation: "mv-prev-drift 12s ease-in-out infinite" }} />,
    "smoke": () => <div className="absolute w-[80%] h-[80%] bottom-0 left-[10%] rounded-full" style={{ background: `radial-gradient(ellipse, ${a}15, transparent 70%)`, filter: "blur(12px)", animation: "mv-prev-rise 8s ease-in-out infinite" }} />,
    "clouds": () => <><div className="absolute w-[80%] h-[30%] top-[15%] left-[10%] rounded-full" style={{ background: `radial-gradient(ellipse, ${a}10, transparent 70%)`, filter: "blur(10px)", animation: "mv-prev-drift 10s ease-in-out infinite" }} /><div className="absolute w-[60%] h-[25%] top-[50%] right-[5%] rounded-full" style={{ background: `radial-gradient(ellipse, ${a}08, transparent 70%)`, filter: "blur(12px)", animation: "mv-prev-drift 14s ease-in-out infinite reverse" }} /></>,
    "ocean-waves": () => <><div className="absolute bottom-0 left-0 w-[200%] h-[35%]" style={{ background: `linear-gradient(180deg, transparent, ${a}15)`, borderRadius: "40% 40% 0 0", animation: "mv-prev-wave 4s ease-in-out infinite" }} /><div className="absolute bottom-0 left-0 w-[200%] h-[25%]" style={{ background: `linear-gradient(180deg, transparent, ${a}10)`, borderRadius: "45% 45% 0 0", animation: "mv-prev-wave 6s ease-in-out infinite 1.5s" }} /></>,
    "orbit-circles": () => <>{[0,1,2].map(i => <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border" style={{ width: `${40+i*25}%`, height: `${40+i*25}%`, borderColor: `${a}${15+i*5}`, animation: `mv-prev-spin ${8+i*4}s linear infinite ${i%2 ? "reverse" : ""}` }} />)}</>,
    "ripple-rings": () => <>{[0,1,2].map(i => <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border" style={{ width: "20%", height: "20%", borderColor: `${a}30`, animation: `mv-prev-ripple 3s ease-out infinite ${i}s` }} />)}</>,
    "morph-blobs": () => <div className="absolute inset-[15%]" style={{ background: `radial-gradient(circle, ${a}30, transparent 65%)`, animation: "mv-prev-morph 8s ease-in-out infinite" }} />,
    "orbit-rings": () => <>{[0,1].map(i => <div key={i} className="absolute rounded-full" style={{ width: 5, height: 5, background: a, opacity: 0.6, animation: `mv-prev-orbit ${6+i*3}s linear infinite ${i}s`, top: "50%", left: "50%" }} />)}<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] rounded-full border" style={{ borderColor: `${a}15` }} /></>,
    "neon-lines": () => <>{[0,1,2].map(i => <div key={i} className="absolute h-[1px]" style={{ width: "60%", background: `linear-gradient(90deg, transparent, ${a}50, transparent)`, top: `${25+i*25}%`, left: "20%", animation: `mv-prev-sweep 4s ease-in-out infinite ${i*1.2}s` }} />)}</>,
    "floating-orbs": () => <><div className="absolute top-[20%] left-[20%] w-[35%] h-[35%] rounded-full" style={{ background: `radial-gradient(circle, ${a}35, transparent 65%)`, animation: "mv-prev-drift 6s ease-in-out infinite" }} /><div className="absolute bottom-[20%] right-[15%] w-[30%] h-[30%] rounded-full" style={{ background: `radial-gradient(circle, ${a}25, transparent 65%)`, animation: "mv-prev-drift 8s ease-in-out infinite reverse" }} /></>,
    "layered-waves": () => <>{[0,1,2].map(i => <div key={i} className="absolute bottom-0 left-0 w-[200%]" style={{ height: `${20+i*8}%`, background: `linear-gradient(180deg, transparent, ${a}${8+i*3})`, borderRadius: "45% 45% 0 0", animation: `mv-prev-wave ${5+i*2}s ease-in-out infinite ${i*0.8}s` }} />)}</>,
    "pulse-circles": () => <>{[0,1,2].map(i => <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ width: `${25+i*20}%`, height: `${25+i*20}%`, border: `1px solid ${a}25`, animation: `mv-prev-pulse 3s ease-in-out infinite ${i*0.5}s` }} />)}</>,
    "gradient-aurora-mesh": () => <><div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${a}25, transparent 40%, ${a}15 70%, transparent)`, backgroundSize: "200% 200%", animation: "mv-prev-aurora 6s ease-in-out infinite" }} /><div className="absolute top-[20%] right-[10%] w-[50%] h-[50%] rounded-full" style={{ background: `radial-gradient(circle, ${a}20, transparent 60%)`, animation: "mv-prev-drift 8s ease-in-out infinite" }} /></>,
    "stripe-gradient": () => <div className="absolute inset-0" style={{ background: `repeating-linear-gradient(135deg, ${a}08, ${a}08 10px, transparent 10px, transparent 20px)`, animation: "mv-prev-aurora 8s linear infinite", backgroundSize: "200% 200%" }} />,
    "vortex-spin": () => <div className="absolute inset-[5%]" style={{ background: `conic-gradient(from 0deg, transparent, ${a}15, transparent, ${a}10, transparent)`, animation: "mv-prev-spin 8s linear infinite" }} />,
    "liquid-glass": () => <div className="absolute inset-[10%] rounded-[40%]" style={{ background: `radial-gradient(circle at 30% 30%, ${a}20, transparent 60%)`, animation: "mv-prev-morph 8s ease-in-out infinite" }} />,
    "wireframe-globe": () => <><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full border" style={{ borderColor: `${a}20`, animation: "mv-prev-spin 12s linear infinite" }} /><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[40%] rounded-full border" style={{ borderColor: `${a}15`, animation: "mv-prev-spin 12s linear infinite" }} /><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35%] h-[60%] rounded-full border" style={{ borderColor: `${a}15`, animation: "mv-prev-spin 12s linear infinite reverse" }} /></>,
    "rising-particles": () => <>{[0,1,2,3,4,5].map(i => <div key={i} className="absolute rounded-full" style={{ width: 2+(i%3), height: 2+(i%3), background: i%2 ? a : "#fcd34d", left: `${8+i*16}%`, bottom: "-5%", opacity: 0.5, animation: `mv-prev-rise ${4+i*0.8}s ease-in-out infinite ${i*0.5}s` }} />)}</>,
    "noise-flicker": () => <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 50%, ${a}12, transparent 70%)`, animation: "mv-prev-flicker 2s steps(1) infinite" }} />,
    "diagonal-shimmer": () => <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, transparent 30%, ${a}15 50%, transparent 70%)`, backgroundSize: "200% 200%", animation: "mv-prev-aurora 3s linear infinite" }} />,
    "gradient-shift-hue": () => <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${a}30, #ec489920, #06b6d420, ${a}30)`, backgroundSize: "200% 200%", animation: "mv-prev-aurora 4s ease infinite, mv-prev-hue 10s linear infinite" }} />,
    "light-sweep": () => <div className="absolute top-0 -left-[50%] w-[30%] h-full" style={{ background: `linear-gradient(90deg, transparent, ${a}20, transparent)`, transform: "rotate(-45deg)", animation: "mv-prev-sweep 4s ease-in-out infinite" }} />,
    "breathing-glow": () => <div className="absolute inset-[15%] rounded-full" style={{ background: `radial-gradient(circle, ${a}30, transparent 70%)`, animation: "mv-prev-breathe 4s ease-in-out infinite" }} />,
    "conic-spotlight": () => <div className="absolute inset-0" style={{ background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${a}15 30deg, transparent 60deg)`, animation: "mv-prev-spin 6s linear infinite" }} />,
  };

  const renderer = effects[effectId];
  if (renderer) return renderer();
  return <div className="absolute inset-0" style={{ background: `radial-gradient(circle, ${a}20, transparent 70%)`, animation: "mv-prev-breathe 4s ease-in-out infinite" }} />;
}

/* ── Single effect thumbnail (memoized) ───────────── */
const EffectThumb = memo(function EffectThumb({ effectId, label, accentColor, bgColor, isActive, onSelect }: {
  effectId: string; label: string; accentColor: string; bgColor: string; isActive: boolean; onSelect: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <button ref={ref} onClick={onSelect}
      className={`effect-thumb relative rounded-xl overflow-hidden border transition-all ${
        isActive ? "border-primary/50 ring-2 ring-primary/30 scale-[1.03]" : "border-white/5 hover:border-white/15"
      }`}
      style={{ aspectRatio: "4/5" }}>
      <div className="absolute inset-0" style={{ background: bgColor || "#0a0a0f" }}>
        {visible && (
          <div className="absolute inset-0 overflow-hidden opacity-80">
            {getEffectPreviewElements(effectId, accentColor)}
          </div>
        )}
      </div>
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 pt-4">
        <span className="text-[9px] font-medium text-white/90 block text-center">{label}</span>
      </div>
      {isActive && (
        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
          <Check size={10} className="text-white" />
        </div>
      )}
    </button>
  );
});

/* ── Main grid ────────────────────────────────────── */
interface EffectThumbnailGridProps {
  currentEffect: string;
  accentColor: string;
  bgColor: string;
  onSelectEffect: (id: string) => void;
}

export default function EffectThumbnailGrid({ currentEffect, accentColor, bgColor, onSelectEffect }: EffectThumbnailGridProps) {
  const [filter, setFilter] = useState("all");
  const filtered = BG_EFFECTS.filter(e => filter === "all" || e.category === filter);

  return (
    <div className="space-y-3">
      {/* Category pills */}
      <div className="flex gap-1 flex-wrap">
        {EFFECT_CATEGORIES.map(cat => (
          <button key={cat.key} onClick={() => setFilter(cat.key)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
              filter === cat.key ? "bg-primary/15 text-primary" : "text-[hsl(var(--dash-text-subtle))] hover:text-[hsl(var(--dash-text-muted))]"
            }`}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Thumbnail grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[320px] overflow-y-auto pr-1">
        {filtered.map(effect => (
          <EffectThumb
            key={effect.id}
            effectId={effect.id}
            label={effect.label}
            accentColor={accentColor}
            bgColor={bgColor}
            isActive={currentEffect === effect.id}
            onSelect={() => onSelectEffect(effect.id)}
          />
        ))}
      </div>
    </div>
  );
}
