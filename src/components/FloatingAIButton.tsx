import { useNavigate, useLocation } from "react-router-dom";
import { Bot } from "lucide-react";

const FloatingAIButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/dashboard/ia") return null;

  return (
    <button
      onClick={() => navigate("/dashboard/ia")}
      className="fixed bottom-6 right-6 z-50 w-[60px] h-[60px] rounded-full btn-primary-gradient flex items-center justify-center hover:scale-110 transition-all duration-200 animate-[fadeInUp_0.4s_ease_both] shadow-lg shadow-primary/30 group"
      aria-label="Abrir IA Maview"
    >
      {/* Robot face */}
      <div className="relative w-8 h-8">
        {/* Head */}
        <div className="absolute inset-0 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30" />
        {/* Eyes */}
        <div className="absolute top-2 left-1.5 w-2 h-2 rounded-full bg-white animate-pulse" />
        <div className="absolute top-2 right-1.5 w-2 h-2 rounded-full bg-white animate-pulse [animation-delay:150ms]" />
        {/* Mouth */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-white/70" />
        {/* Antenna */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-white/60" />
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/80 animate-pulse [animation-delay:300ms]" />
      </div>
    </button>
  );
};

export default FloatingAIButton;
