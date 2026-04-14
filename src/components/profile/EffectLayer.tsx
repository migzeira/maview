import { useEffect } from "react";

/* ─── Effect CSS keyframes (injected once) ───────────────────── */
function injectEffectStyles() {
  if (document.getElementById("maview-effect-styles")) return;
  const style = document.createElement("style");
  style.id = "maview-effect-styles";
  style.textContent = `
    @keyframes mv-aurora { 0%,100% { transform: translateX(-20%) rotate(0deg); } 50% { transform: translateX(20%) rotate(3deg); } }
    @keyframes mv-pulse { 0%,100% { opacity: 0.15; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.1); } }
    @keyframes mv-float { 0%,100% { transform: translateY(0) translateX(0); } 33% { transform: translateY(-15px) translateX(8px); } 66% { transform: translateY(8px) translateX(-5px); } }
    @keyframes mv-drift { 0% { transform: translate(0,0) scale(1); } 25% { transform: translate(10%,5%) scale(1.05); } 50% { transform: translate(-5%,10%) scale(0.95); } 75% { transform: translate(-10%,-5%) scale(1.02); } 100% { transform: translate(0,0) scale(1); } }
    @keyframes mv-scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
    @keyframes mv-shimmer { 0% { opacity: 0; } 50% { opacity: 0.6; } 100% { opacity: 0; } }
    @keyframes mv-gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    @keyframes mv-wave { 0% { transform: translateX(0) scaleY(1); } 50% { transform: translateX(-25%) scaleY(1.2); } 100% { transform: translateX(-50%) scaleY(1); } }
    @keyframes mv-fog { 0%,100% { transform: translateX(-10%) scale(1.1); opacity: 0.04; } 50% { transform: translateX(10%) scale(1); opacity: 0.07; } }
    @keyframes mv-orbit { 0% { transform: rotate(0deg) translateX(var(--orbit-r)) rotate(0deg); } 100% { transform: rotate(360deg) translateX(var(--orbit-r)) rotate(-360deg); } }
    @keyframes mv-ripple { 0% { transform: scale(0.3); opacity: 0.5; } 100% { transform: scale(2.5); opacity: 0; } }
    @keyframes mv-sway { 0%,100% { transform: translateX(0) scaleX(1); } 25% { transform: translateX(8%) scaleX(1.04); } 75% { transform: translateX(-8%) scaleX(0.96); } }
    @keyframes mv-wave-ud { 0%,100% { transform: translateY(0) scaleY(1); } 30% { transform: translateY(-30px) scaleY(1.2); } 60% { transform: translateY(15px) scaleY(0.85); } 85% { transform: translateY(-10px) scaleY(1.08); } }
    @keyframes mv-neon-scan { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
    @keyframes mv-morph { 0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: scale(1); } 25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; transform: scale(1.06); } 50% { border-radius: 50% 60% 30% 60% / 30% 50% 70% 50%; transform: scale(0.94); } 75% { border-radius: 40% 60% 70% 30% / 60% 40% 30% 70%; transform: scale(1.04); } }
    @keyframes mv-wave-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    @keyframes mv-globe-spin { from { transform: rotateY(0deg); } to { transform: rotateY(360deg); } }
    @keyframes mv-vortex-pro { 0% { transform: translate(-50%,-50%) rotate(0deg) scale(1); } 50% { transform: translate(-50%,-50%) rotate(180deg) scale(1.08); } 100% { transform: translate(-50%,-50%) rotate(360deg) scale(1); } }
    @keyframes mv-dash-chase { to { stroke-dashoffset: -320; } }
    @keyframes mv-beam-fall { from { transform: translateY(-100%); } to { transform: translateY(100%); } }
    @keyframes mv-wave-rotate { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }
    @keyframes mv-orbit-ring { 0% { transform: translate(-50%,-50%) rotate(0deg); } 100% { transform: translate(-50%,-50%) rotate(360deg); } }
    .mv-aurora { animation: mv-aurora 12s ease-in-out infinite; }
    .mv-pulse { animation: mv-pulse 4s ease-in-out infinite; }
    .mv-float { animation: mv-float 8s ease-in-out infinite; }
    .mv-drift { animation: mv-drift 20s ease-in-out infinite; }
    .mv-scan { animation: mv-scan 6s linear infinite; }
    .mv-shimmer { animation: mv-shimmer 3s ease-in-out infinite; }
    .mv-gradient-anim { background-size: 200% 200%; animation: mv-gradient 8s ease infinite; }
    .mv-wave { animation: mv-wave 12s linear infinite; }
    .mv-fog { animation: mv-fog 15s ease-in-out infinite; }
    .mv-orbit { animation: mv-orbit var(--orbit-dur, 10s) linear infinite; }
    .mv-ripple { animation: mv-ripple 4s ease-out infinite; }
    .mv-sway { animation: mv-sway 8s ease-in-out infinite; }
    .mv-wave-ud { animation: mv-wave-ud var(--wave-dur, 4s) ease-in-out infinite; }
    .mv-morph { animation: mv-morph 10s ease-in-out infinite; }
    .mv-orbit-ring { animation: mv-orbit-ring var(--ring-dur, 20s) linear infinite; }
    @keyframes mv-hue { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
    @keyframes mv-sweep { 0% { transform: translateX(-100%) skewX(-15deg); } 100% { transform: translateX(200%) skewX(-15deg); } }
    @keyframes mv-breathe { 0%,100% { transform: scale(1); opacity: 0.25; } 50% { transform: scale(1.2); opacity: 0.55; } }
    @keyframes mv-spin-slow { 0% { transform: translate(-50%,-50%) rotate(0deg); } 100% { transform: translate(-50%,-50%) rotate(360deg); } }
    @keyframes mv-rise { 0% { transform: translateY(100vh) scale(0.5); opacity: 0; } 20% { opacity: 0.7; } 70% { opacity: 0.5; } 100% { transform: translateY(-20vh) scale(1); opacity: 0; } }
    @keyframes mv-flicker { 0%,100% { opacity: 0.03; } 10% { opacity: 0.06; } 20% { opacity: 0.02; } 30% { opacity: 0.07; } 50% { opacity: 0.04; } 70% { opacity: 0.06; } 90% { opacity: 0.03; } }
    @keyframes mv-slide-diag { 0% { background-position: 0% 0%; } 100% { background-position: 100% 100%; } }
    .mv-hue { animation: mv-hue 20s linear infinite; }
    .mv-sweep { animation: mv-sweep 5s ease-in-out infinite; }
    .mv-breathe { animation: mv-breathe 6s ease-in-out infinite; }
    .mv-spin-slow { animation: mv-spin-slow var(--spin-dur, 30s) linear infinite; }
    .mv-rise { animation: mv-rise var(--rise-dur, 8s) ease-in-out infinite; }
    .mv-flicker { animation: mv-flicker 4s steps(1) infinite; }
    .mv-slide-diag { animation: mv-slide-diag 15s linear infinite; background-size: 200% 200%; }
  `;
  document.head.appendChild(style);
}

/* ─── Render bg effect layers ────────────────────────────────── */
function EffectLayer({ effectId, accent, accent2 }: { effectId: string; accent: string; accent2: string }) {
  useEffect(() => { injectEffectStyles(); }, []);

  switch (effectId) {
    case "aurora":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute w-[200%] h-[60%] top-[-10%] left-[-50%] mv-aurora" style={{ background: `linear-gradient(135deg, ${accent}25, transparent 40%, ${accent2}20, transparent 70%, ${accent}15)`, filter: "blur(60px)" }} />
        </div>
      );
    case "aurora-waves":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute w-[200%] h-[40%] bottom-0 left-[-50%] mv-wave" style={{ background: `linear-gradient(90deg, transparent, ${accent}20, ${accent2}15, transparent)`, filter: "blur(40px)" }} />
          <div className="absolute w-[200%] h-[30%] bottom-[10%] left-[-30%] mv-wave" style={{ background: `linear-gradient(90deg, transparent, ${accent2}15, ${accent}10, transparent)`, filter: "blur(50px)", animationDelay: "-4s" }} />
        </div>
      );
    case "ambient-glow":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full mv-pulse" style={{ background: `radial-gradient(circle, ${accent}20, transparent 60%)` }} />
        </div>
      );
    case "spotlight":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] mv-pulse" style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent}30, transparent 70%)` }} />
        </div>
      );
    case "radial-glow":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <div className="absolute inset-0 mv-pulse" style={{ background: `radial-gradient(circle at 50% 50%, ${accent}18, transparent 60%)` }} />
        </div>
      );
    case "gradient-flow":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <div className="absolute inset-0 mv-gradient-anim" style={{ background: `linear-gradient(45deg, ${accent}20, ${accent2}15, ${accent}20, ${accent2}15)`, backgroundSize: "200% 200%" }} />
        </div>
      );
    case "gradient-mesh":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <div className="absolute w-[50%] h-[50%] top-[10%] left-[10%] rounded-full mv-drift" style={{ background: `radial-gradient(circle, ${accent}20, transparent 60%)`, filter: "blur(40px)" }} />
          <div className="absolute w-[50%] h-[50%] bottom-[10%] right-[10%] rounded-full mv-drift" style={{ background: `radial-gradient(circle, ${accent2}18, transparent 60%)`, filter: "blur(40px)", animationDelay: "-10s" }} />
        </div>
      );
    case "gradient-shift":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <div className="absolute inset-0 mv-gradient-anim" style={{ background: `linear-gradient(90deg, ${accent}15, ${accent2}15, #60a5fa15, ${accent}15)`, backgroundSize: "200% 200%" }} />
        </div>
      );
    case "starfield": {
      // Stable positions using index-based seeding
      const stars = Array.from({ length: 20 }, (_, i) => ({
        w: i % 2 === 0 ? 2 : 1, left: ((i * 47 + 13) % 100), top: ((i * 71 + 7) % 100),
        delay: (i * 0.25) % 5, dur: 2 + (i * 0.2) % 4,
      }));
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          {stars.map((s, i) => (
            <div key={i} className="absolute rounded-full mv-shimmer" style={{
              width: s.w, height: s.w, left: `${s.left}%`, top: `${s.top}%`,
              background: "white", animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s`,
            }} />
          ))}
        </div>
      );
    }
    case "floating-dots": {
      const dots = Array.from({ length: 8 }, (_, i) => ({
        size: 4 + (i * 3) % 5, left: 10 + ((i * 61 + 11) % 80), top: 10 + ((i * 43 + 17) % 80),
        opacity: 0.15 + (i * 0.02), delay: i * 1, dur: 6 + (i % 3) * 2,
      }));
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          {dots.map((d, i) => (
            <div key={i} className="absolute rounded-full mv-float" style={{
              width: d.size, height: d.size, left: `${d.left}%`, top: `${d.top}%`,
              background: accent, opacity: d.opacity, animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s`,
            }} />
          ))}
        </div>
      );
    }
    case "sparkles": {
      const sparks = Array.from({ length: 12 }, (_, i) => ({
        left: ((i * 53 + 19) % 100), top: ((i * 37 + 23) % 100),
        delay: (i * 0.33) % 4, dur: 1.5 + (i * 0.25) % 3,
      }));
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          {sparks.map((s, i) => (
            <div key={i} className="absolute rounded-full mv-shimmer" style={{
              width: 3, height: 3, left: `${s.left}%`, top: `${s.top}%`,
              background: i % 3 === 0 ? "#fcd34d" : accent, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s`,
            }} />
          ))}
        </div>
      );
    }
    case "wave-layers":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute w-[200%] h-[200px] bottom-0 left-0 mv-wave" style={{ background: `linear-gradient(180deg, transparent, ${accent}10)`, borderRadius: "40% 40% 0 0" }} />
          <div className="absolute w-[200%] h-[150px] bottom-0 left-0 mv-wave" style={{ background: `linear-gradient(180deg, transparent, ${accent}06)`, borderRadius: "45% 45% 0 0", animationDelay: "-3s" }} />
        </div>
      );
    case "flow-field":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="absolute h-px mv-drift" style={{
              width: "60%", left: `${-10 + i * 25}%`, top: `${15 + i * 18}%`,
              background: `linear-gradient(90deg, transparent, ${accent}15, transparent)`,
              animationDelay: `${i * -4}s`,
            }} />
          ))}
        </div>
      );
    case "liquid":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute w-[60%] h-[60%] top-[20%] left-[10%] rounded-full mv-drift" style={{ background: `radial-gradient(ellipse, ${accent}15, transparent 60%)`, filter: "blur(50px)" }} />
          <div className="absolute w-[50%] h-[50%] bottom-[15%] right-[5%] rounded-full mv-drift" style={{ background: `radial-gradient(ellipse, ${accent2}12, transparent 60%)`, filter: "blur(50px)", animationDelay: "-8s" }} />
        </div>
      );
    case "matrix-grid":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]" style={{ backgroundImage: `linear-gradient(${accent}08 1px, transparent 1px), linear-gradient(90deg, ${accent}08 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
      );
    case "pulse-grid":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <div className="absolute inset-0 mv-pulse" style={{ backgroundImage: `radial-gradient(${accent}15 1px, transparent 1px)`, backgroundSize: "30px 30px" }} />
        </div>
      );
    case "scan-lines":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]" style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 2px, ${accent}05 2px, ${accent}05 4px)` }}>
          <div className="absolute w-full h-[2px] mv-scan" style={{ background: `linear-gradient(90deg, transparent, ${accent}20, transparent)` }} />
        </div>
      );
    case "fog":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute w-[150%] h-[50%] top-[20%] left-[-25%] mv-fog" style={{ background: `radial-gradient(ellipse, rgba(255,255,255,0.04), transparent 60%)`, filter: "blur(30px)" }} />
          <div className="absolute w-[150%] h-[40%] bottom-[10%] left-[-10%] mv-fog" style={{ background: `radial-gradient(ellipse, rgba(255,255,255,0.03), transparent 60%)`, filter: "blur(30px)", animationDelay: "-7s" }} />
        </div>
      );
    case "smoke":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute w-[80%] h-[60%] top-[20%] left-[10%] mv-drift" style={{ background: `radial-gradient(ellipse, rgba(255,255,255,0.04), transparent 50%)`, filter: "blur(40px)" }} />
        </div>
      );
    case "clouds":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute w-[120%] h-[30%] top-[10%] left-[-10%] mv-drift" style={{ background: `radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.05), transparent 50%), radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.04), transparent 50%)`, filter: "blur(20px)" }} />
          <div className="absolute w-[100%] h-[25%] top-[50%] left-0 mv-drift" style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.03), transparent 50%)`, filter: "blur(25px)", animationDelay: "-12s" }} />
        </div>
      );
    /* ── NEW: Animated motion effects ── */
    case "ocean-waves": {
      /* Multi-frequency realistic sine waves — 5 layers with different curves */
      const wavePaths = [
        "M0,160L40,154C80,148,160,136,240,141C320,146,400,168,480,181C560,194,640,198,720,186C800,174,880,146,960,138C1040,130,1120,142,1200,157C1280,172,1360,190,1400,199L1440,208L1440,320L0,320Z",
        "M0,200L48,190C96,180,192,160,288,165C384,170,480,200,576,215C672,230,768,230,864,218C960,206,1056,182,1152,175C1248,168,1344,178,1392,183L1440,188L1440,320L0,320Z",
        "M0,224L60,218C120,212,240,200,360,208C480,216,600,244,720,252C840,260,960,248,1080,234C1200,220,1320,204,1380,196L1440,188L1440,320L0,320Z",
        "M0,240L36,234C72,228,144,216,216,222C288,228,360,252,432,262C504,272,576,268,648,256C720,244,792,224,864,218C936,212,1008,220,1080,232C1152,244,1224,260,1296,264C1368,268,1404,260,1422,256L1440,252L1440,320L0,320Z",
        "M0,260L48,256C96,252,192,244,288,250C384,256,480,276,576,282C672,288,768,280,864,270C960,260,1056,248,1152,250C1248,252,1344,268,1392,276L1440,284L1440,320L0,320Z",
      ];
      const waveSvg = (color: string, opacity: number, pathIdx: number) =>
        `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="${color}" fill-opacity="${opacity}" d="${wavePaths[pathIdx]}"/></svg>`)}`;
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          {[0, 1, 2, 3, 4].map(i => {
            const c = i % 2 === 0 ? accent : accent2;
            const op = [0.38, 0.28, 0.22, 0.18, 0.12][i];
            const hVh = [50, 42, 36, 30, 25][i];
            const speed = [10, 13, 16, 20, 25][i];
            const dir = i % 2 === 0 ? "normal" : "reverse";
            return (
              <div key={i} className="absolute bottom-0 left-0" style={{
                width: "200%", height: `${hVh}vh`,
                backgroundImage: `url("${waveSvg(c, op, i)}")`,
                backgroundSize: "50% 100%", backgroundRepeat: "repeat-x",
                animation: `mv-wave-scroll ${speed}s linear infinite`,
                animationDirection: dir,
                animationDelay: `${i * -1.8}s`,
                bottom: `${i * -6}px`,
              }} />
            );
          })}
        </div>
      );
    }
    case "orbit-circles": {
      const orbs = [
        { r: 80, size: 12, dur: 8, color: accent, opacity: 0.6 },
        { r: 130, size: 9, dur: 12, color: accent2, opacity: 0.5 },
        { r: 60, size: 7, dur: 6, color: accent, opacity: 0.45 },
        { r: 160, size: 10, dur: 16, color: accent2, opacity: 0.4 },
        { r: 100, size: 8, dur: 10, color: accent, opacity: 0.55 },
      ];
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          {orbs.map((o, i) => (
            <div key={i} className="absolute top-1/2 left-1/2 mv-orbit" style={{
              width: o.size, height: o.size, borderRadius: "50%",
              background: o.color, opacity: o.opacity,
              "--orbit-r": `${o.r}px`, "--orbit-dur": `${o.dur}s`,
              animationDelay: `${i * -1.5}s`,
            } as React.CSSProperties} />
          ))}
        </div>
      );
    }
    case "ripple-rings": {
      const rings = [0, 1, 2, 3];
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          {rings.map(i => (
            <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full mv-ripple" style={{
              width: 120, height: 120,
              border: `2px solid ${accent}55`,
              animationDelay: `${i * 1}s`,
              animationDuration: "4s",
            }} />
          ))}
        </div>
      );
    }
    case "morph-blobs":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute w-[350px] h-[350px] top-[5%] left-[0%] mv-morph" style={{
            background: `radial-gradient(circle, ${accent}45, transparent 65%)`, filter: "blur(20px)",
          }} />
          <div className="absolute w-[300px] h-[300px] bottom-[10%] right-[0%] mv-morph" style={{
            background: `radial-gradient(circle, ${accent2}40, transparent 65%)`, filter: "blur(20px)",
            animationDelay: "-3s",
          }} />
          <div className="absolute w-[250px] h-[250px] top-[40%] left-[25%] mv-morph" style={{
            background: `radial-gradient(circle, ${accent}30, transparent 65%)`, filter: "blur(25px)",
            animationDelay: "-7s",
          }} />
        </div>
      );
    case "orbit-rings": {
      const ringData = [
        { size: 250, dur: 18, border: accent, opacity: 0.2 },
        { size: 380, dur: 25, border: accent2, opacity: 0.15 },
        { size: 500, dur: 35, border: accent, opacity: 0.1 },
      ];
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          {ringData.map((r, i) => (
            <div key={i} className="absolute top-1/2 left-1/2 rounded-full mv-orbit-ring" style={{
              width: r.size, height: r.size,
              border: `1px solid ${r.border}`,
              opacity: r.opacity,
              "--ring-dur": `${r.dur}s`,
              animationDirection: i % 2 === 0 ? "normal" : "reverse",
            } as React.CSSProperties}>
              <div className="absolute rounded-full" style={{
                width: 6, height: 6, top: -3, left: "50%", marginLeft: -3,
                background: r.border, opacity: 0.5,
              }} />
            </div>
          ))}
        </div>
      );
    }
    case "neon-lines": {
      const lines = Array.from({ length: 6 }, (_, i) => ({
        top: 8 + i * 16,
        delay: i * -0.8,
        dur: 3 + (i % 3) * 0.8,
        color: i % 2 === 0 ? accent : accent2,
      }));
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          {lines.map((l, i) => (
            <div key={i} className="absolute h-[2px] overflow-hidden" style={{
              width: "100%", left: 0, top: `${l.top}%`,
            }}>
              <div className="absolute h-full" style={{
                width: "40%",
                background: `linear-gradient(90deg, transparent, ${l.color}80, ${l.color}, ${l.color}80, transparent)`,
                boxShadow: `0 0 15px ${l.color}60, 0 0 30px ${l.color}30`,
                animation: `mv-neon-scan ${l.dur}s ease-in-out infinite`,
                animationDelay: `${l.delay}s`,
              }} />
            </div>
          ))}
        </div>
      );
    }
    case "gradient-shift-hue":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] mv-hue">
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}30, ${accent2}20, ${accent}15)` }} />
        </div>
      );
    case "light-sweep":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute inset-0 mv-sweep" style={{ background: `linear-gradient(90deg, transparent 30%, ${accent}12 50%, transparent 70%)`, width: "50%" }} />
        </div>
      );
    case "breathing-glow":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full mv-breathe" style={{ background: `radial-gradient(circle, ${accent}45, transparent 65%)`, filter: "blur(30px)" }} />
          <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full mv-breathe" style={{ background: `radial-gradient(circle, ${accent2}35, transparent 65%)`, filter: "blur(25px)", animationDelay: "-3s" }} />
        </div>
      );
    case "conic-spotlight": {
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] mv-spin-slow" style={{ background: `conic-gradient(from 0deg, transparent 0%, ${accent}15 10%, transparent 20%, transparent 100%)`, filter: "blur(30px)", "--spin-dur": "12s" } as React.CSSProperties} />
        </div>
      );
    }
    case "rising-particles": {
      const particles = Array.from({ length: 15 }, (_, i) => ({
        left: ((i * 67 + 11) % 100), size: 4 + (i % 4) * 3, dur: 6 + (i * 1.3) % 6, delay: (i * 0.8) % 8,
        color: i % 3 === 0 ? accent2 : accent,
      }));
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          {particles.map((p, i) => (
            <div key={i} className="absolute rounded-full mv-rise" style={{
              width: p.size, height: p.size, left: `${p.left}%`, bottom: 0,
              background: p.color, opacity: 0.5,
              "--rise-dur": `${p.dur}s`, animationDelay: `${p.delay}s`,
            } as React.CSSProperties} />
          ))}
        </div>
      );
    }
    case "noise-flicker":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <div className="absolute inset-0 mv-flicker" style={{ backgroundImage: `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)" opacity="0.08"/></svg>')}")`, backgroundRepeat: "repeat" }} />
        </div>
      );
    case "diagonal-shimmer":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute inset-0 mv-slide-diag" style={{ background: `repeating-linear-gradient(45deg, transparent 0px, transparent 40px, ${accent}06 40px, ${accent}06 80px)`, backgroundSize: "200% 200%" }} />
        </div>
      );
    case "floating-orbs":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute w-[350px] h-[350px] top-[5%] left-[10%] rounded-full mv-drift" style={{ background: `radial-gradient(circle, ${accent}45, transparent 60%)`, filter: "blur(50px)" }} />
          <div className="absolute w-[280px] h-[280px] top-[40%] right-[5%] rounded-full mv-drift" style={{ background: `radial-gradient(circle, ${accent2}40, transparent 60%)`, filter: "blur(45px)", animationDelay: "-8s" }} />
          <div className="absolute w-[220px] h-[220px] bottom-[10%] left-[25%] rounded-full mv-drift" style={{ background: `radial-gradient(circle, ${accent}35, transparent 60%)`, filter: "blur(55px)", animationDelay: "-15s" }} />
        </div>
      );
    case "layered-waves": {
      const wavePaths = [
        "M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,165.3C840,171,960,213,1080,218.7C1200,224,1320,192,1380,176L1440,160L1440,320L0,320Z",
        "M0,224L60,213.3C120,203,240,181,360,186.7C480,192,600,224,720,234.7C840,245,960,235,1080,218.7C1200,203,1320,181,1380,170.7L1440,160L1440,320L0,320Z",
        "M0,256L60,250.7C120,245,240,235,360,229.3C480,224,600,224,720,213.3C840,203,960,181,1080,186.7C1200,192,1320,224,1380,240L1440,256L1440,320L0,320Z",
      ];
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          {wavePaths.map((d, i) => {
            const c = i % 2 === 0 ? accent : accent2;
            const op = [0.3, 0.2, 0.15][i];
            const svg = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="${c}" fill-opacity="${op}" d="${d}"/></svg>`)}`;
            return (
              <div key={i} className="absolute bottom-0 left-0" style={{
                width: "200%", height: `${50 - i * 8}vh`,
                backgroundImage: `url("${svg}")`,
                backgroundSize: "50% 100%", backgroundRepeat: "repeat-x",
                animation: `mv-wave-scroll ${10 + i * 4}s linear infinite`,
                animationDirection: i % 2 === 0 ? "normal" : "reverse",
                bottom: `${i * -5}px`,
              }} />
            );
          })}
        </div>
      );
    }
    case "pulse-circles": {
      const circles = [
        { size: 100, delay: 0, dur: 5 },
        { size: 160, delay: 1.2, dur: 5 },
        { size: 220, delay: 2.4, dur: 5 },
        { size: 280, delay: 3.6, dur: 5 },
      ];
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          {circles.map((c, i) => (
            <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full mv-ripple" style={{
              width: c.size, height: c.size,
              border: `1px solid ${accent}20`,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.dur}s`,
            }} />
          ))}
        </div>
      );
    }
    case "gradient-aurora-mesh":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute w-[120%] h-[60%] top-[-10%] left-[-10%] mv-aurora" style={{ background: `linear-gradient(120deg, ${accent}18, transparent 30%, ${accent2}15, transparent 60%, ${accent}10)`, filter: "blur(50px)" }} />
          <div className="absolute w-[100%] h-[40%] bottom-[0%] left-0 mv-wave" style={{ background: `linear-gradient(90deg, transparent, ${accent2}10, ${accent}08, transparent)`, filter: "blur(40px)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] rounded-full mv-breathe" style={{ background: `radial-gradient(circle, ${accent}12, transparent 60%)`, filter: "blur(60px)" }} />
        </div>
      );
    case "stripe-gradient":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <div className="absolute inset-0 mv-gradient-anim" style={{ background: `linear-gradient(-45deg, ${accent}15, ${accent2}12, #60a5fa10, ${accent}15, #ec489910, ${accent2}12)`, backgroundSize: "400% 400%" }} />
        </div>
      );
    case "vortex-spin":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          {/* Outer ring */}
          <div className="absolute left-1/2 top-1/2" style={{
            width: 700, height: 700,
            background: `conic-gradient(from 0deg, ${accent}30, transparent 15%, transparent 35%, ${accent2}25, transparent 50%, transparent 70%, ${accent}20, transparent 85%)`,
            borderRadius: "50%", filter: "blur(25px)",
            animation: "mv-vortex-pro 12s ease-in-out infinite",
          }} />
          {/* Inner ring - counter rotate */}
          <div className="absolute left-1/2 top-1/2" style={{
            width: 400, height: 400,
            background: `conic-gradient(from 90deg, ${accent2}35, transparent 20%, transparent 45%, ${accent}30, transparent 60%, transparent 80%, ${accent2}25)`,
            borderRadius: "50%", filter: "blur(15px)",
            animation: "mv-vortex-pro 8s ease-in-out infinite reverse",
          }} />
          {/* Core glow */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{
            width: 200, height: 200,
            background: `radial-gradient(circle, ${accent}40, transparent 70%)`,
            borderRadius: "50%", filter: "blur(20px)",
            animation: "mv-breathe 4s ease-in-out infinite",
          }} />
        </div>
      );
    case "wireframe-globe": {
      /* SVG globe with stroke-dasharray — lines chase but never close */
      const gSize = 350;
      const gR = gSize / 2 - 10;
      const meridians = [0, 30, 60, 90, 120, 150];
      const latitudes = [-60, -30, 0, 30, 60];
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] flex items-center justify-center">
          <div style={{ animation: "mv-globe-spin 22s linear infinite", transformStyle: "preserve-3d" as const }}>
            <svg width={gSize} height={gSize} viewBox={`0 0 ${gSize} ${gSize}`} fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Outer ring */}
              <circle cx={gSize/2} cy={gSize/2} r={gR} stroke={accent} strokeWidth="1" opacity="0.25"
                strokeDasharray="22 8" style={{ animation: "mv-dash-chase 6s linear infinite" }} />
              {/* Meridians — ellipses that try to close but never do */}
              {meridians.map((deg, i) => {
                const scaleX = Math.abs(Math.cos((deg * Math.PI) / 180));
                const col = i % 2 === 0 ? accent : accent2;
                return (
                  <ellipse key={`m${i}`} cx={gSize/2} cy={gSize/2} rx={gR * Math.max(scaleX, 0.05)} ry={gR}
                    stroke={col} strokeWidth="0.8" opacity="0.3"
                    strokeDasharray="28 12"
                    style={{ animation: `mv-dash-chase ${5 + i * 0.8}s linear infinite`, animationDirection: i % 2 === 0 ? "normal" : "reverse" }} />
                );
              })}
              {/* Latitude lines — horizontal ellipses */}
              {latitudes.map((lat, i) => {
                const latRad = (lat * Math.PI) / 180;
                const latR = gR * Math.cos(latRad);
                const yOff = gR * Math.sin(latRad);
                return (
                  <ellipse key={`l${i}`} cx={gSize/2} cy={gSize/2 - yOff} rx={latR} ry={latR * 0.25}
                    stroke={accent} strokeWidth="0.7" opacity="0.2"
                    strokeDasharray="18 10"
                    style={{ animation: `mv-dash-chase ${7 + i * 0.6}s linear infinite` }} />
                );
              })}
              {/* Center glow */}
              <circle cx={gSize/2} cy={gSize/2} r={gR * 0.6} fill={`${accent}08`} filter="url(#globe-glow)" />
              <defs>
                <filter id="globe-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="20" />
                </filter>
              </defs>
            </svg>
          </div>
        </div>
      );
    }
    case "liquid-glass":
      return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute w-[300px] h-[300px] top-[15%] left-[10%] mv-morph mv-drift" style={{
            background: `radial-gradient(circle, ${accent}18, transparent 60%)`,
            filter: "blur(50px)",
          }} />
          <div className="absolute w-[250px] h-[250px] bottom-[20%] right-[10%] mv-morph" style={{
            background: `radial-gradient(circle, ${accent2}15, transparent 60%)`,
            filter: "blur(45px)", animationDelay: "-6s",
          }} />
        </div>
      );
    default:
      return null;
  }
}

export default EffectLayer;
