/**
 * Subtle ambient glow for Dashboard background.
 * Two floating blobs that drift slowly — adds life without distraction.
 * Respects prefers-reduced-motion.
 */
export default function AmbientGlow() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Top-right purple glow */}
      <div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full animate-ambient-float opacity-[0.04] dark:opacity-[0.07]"
        style={{
          background: "radial-gradient(circle, hsl(263 90% 58%) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      {/* Bottom-left violet glow */}
      <div
        className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full animate-ambient-drift opacity-[0.03] dark:opacity-[0.06]"
        style={{
          background: "radial-gradient(circle, hsl(263 80% 65%) 0%, transparent 70%)",
          filter: "blur(80px)",
          animationDelay: "-4s",
        }}
      />
      {/* Center accent — very faint */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.02] dark:opacity-[0.04]"
        style={{
          background: "radial-gradient(ellipse, hsl(263 90% 58%) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />
    </div>
  );
}
