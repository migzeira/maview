import robotImg from "@/assets/maview-robot-transparent.png";

/* ═══════════════════════════════════════════════════════════════════════════
   StanleyAvatar — mascot da IA Stanley do Maview

   Inspirado no Stanley do Stan Store, mas com personalidade Maview própria.
   Reutilizado em:
   - Sidebar (badge IA Stanley)
   - DashboardHome (welcome card)
   - DashboardIA (header)
   - FloatingAIButton (botão flutuante)

   Variantes:
   - size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' (16/24/32/48/64px)
   - variant: 'plain' | 'glow' | 'card' (sem efeito | glow primary | card 3D)
   - animated: boolean — gentle blink continuous
   ═══════════════════════════════════════════════════════════════════════════ */

interface StanleyAvatarProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "plain" | "glow" | "card";
  animated?: boolean;
  className?: string;
}

const SIZE_MAP = { xs: 16, sm: 24, md: 32, lg: 48, xl: 64 };

export default function StanleyAvatar({
  size = "md",
  variant = "plain",
  animated = false,
  className = "",
}: StanleyAvatarProps) {
  const px = SIZE_MAP[size];

  if (variant === "card") {
    return (
      <div
        className={`relative rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-violet-600 p-2 shadow-lg shadow-fuchsia-500/30 ${className}`}
        style={{ width: px + 16, height: px + 16 }}
      >
        <img
          src={robotImg}
          alt="Stanley AI"
          className="w-full h-full object-contain drop-shadow-md"
          style={{ animation: animated ? "gentleBlink 3s ease-in-out infinite" : "none" }}
        />
      </div>
    );
  }

  if (variant === "glow") {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: px, height: px }}>
        {/* Glow halo behind */}
        <div
          className="absolute inset-0 rounded-full opacity-50 blur-xl"
          style={{ background: "radial-gradient(circle, #d946ef 0%, transparent 70%)" }}
        />
        <img
          src={robotImg}
          alt="Stanley AI"
          className="relative w-full h-full object-contain"
          style={{ animation: animated ? "gentleBlink 3s ease-in-out infinite" : "none" }}
        />
      </div>
    );
  }

  return (
    <img
      src={robotImg}
      alt="Stanley AI"
      className={`object-contain ${className}`}
      style={{
        width: px,
        height: px,
        animation: animated ? "gentleBlink 3s ease-in-out infinite" : "none",
      }}
    />
  );
}
