import { useEffect, useRef } from "react";

/**
 * Interactive mesh gradient background — Maview purple palette.
 * Mouse-reactive blobs that create a premium, living background.
 * Respects prefers-reduced-motion.
 */
export default function MeshGradientBg({ dark = false }: { dark?: boolean }) {
  const interactiveRef = useRef<HTMLDivElement>(null);
  const curX = useRef(0);
  const curY = useRef(0);
  const tgX = useRef(0);
  const tgY = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    function animate() {
      if (!interactiveRef.current) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }
      curX.current += (tgX.current - curX.current) / 20;
      curY.current += (tgY.current - curY.current) / 20;
      interactiveRef.current.style.transform = `translate(${Math.round(curX.current)}px, ${Math.round(curY.current)}px)`;
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactiveRef.current) return;
    const rect = interactiveRef.current.getBoundingClientRect();
    tgX.current = e.clientX - rect.left;
    tgY.current = e.clientY - rect.top;
  };

  // Purple palette for Maview
  const colors = dark
    ? { bg: "#0a0618", c1: "109, 40, 217", c2: "139, 92, 246", c3: "76, 29, 149", c4: "167, 139, 250", pointer: "124, 58, 237" }
    : { bg: "#f5f0ff", c1: "124, 58, 237", c2: "167, 139, 250", c3: "196, 181, 253", c4: "237, 233, 254", pointer: "109, 40, 217" };

  const blobBase = "absolute rounded-full will-change-transform";
  const size = "w-[60%] h-[60%]";
  const blend = dark ? "mix-blend-screen" : "mix-blend-multiply";

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-auto z-0"
      onMouseMove={handleMouseMove}
      style={{ background: colors.bg }}
      aria-hidden="true"
    >
      {/* SVG filter for gooey effect */}
      <svg className="hidden" aria-hidden="true">
        <defs>
          <filter id="meshBlur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Blobs container */}
      <div className="absolute inset-0 blur-[60px] opacity-70" style={{ filter: "url(#meshBlur) blur(60px)" }}>
        {/* Blob 1 — main purple */}
        <div
          className={`${blobBase} ${size} ${blend} top-[15%] left-[20%] animate-mesh-first`}
          style={{ background: `radial-gradient(circle, rgba(${colors.c1}, 0.8) 0%, rgba(${colors.c1}, 0) 70%)` }}
        />
        {/* Blob 2 — violet accent */}
        <div
          className={`${blobBase} ${size} ${blend} top-[30%] right-[10%] animate-mesh-second`}
          style={{ background: `radial-gradient(circle, rgba(${colors.c2}, 0.7) 0%, rgba(${colors.c2}, 0) 70%)` }}
        />
        {/* Blob 3 — deep purple */}
        <div
          className={`${blobBase} ${size} ${blend} bottom-[10%] left-[30%] animate-mesh-third`}
          style={{ background: `radial-gradient(circle, rgba(${colors.c3}, 0.6) 0%, rgba(${colors.c3}, 0) 70%)` }}
        />
        {/* Blob 4 — lavender accent */}
        <div
          className={`${blobBase} w-[50%] h-[50%] ${blend} top-[50%] left-[10%] animate-mesh-second`}
          style={{ background: `radial-gradient(circle, rgba(${colors.c4}, 0.5) 0%, rgba(${colors.c4}, 0) 70%)`, animationDelay: "-5s" }}
        />

        {/* Interactive blob — follows mouse */}
        <div
          ref={interactiveRef}
          className={`absolute w-full h-full -top-1/2 -left-1/2 ${blend} opacity-60`}
          style={{ background: `radial-gradient(circle, rgba(${colors.pointer}, 0.6) 0%, rgba(${colors.pointer}, 0) 50%)` }}
        />
      </div>
    </div>
  );
}
