import { useNavigate, useLocation } from "react-router-dom";

const FloatingAIButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/dashboard/ia") return null;

  return (
    <button
      onClick={() => navigate("/dashboard/ia")}
      className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full btn-primary-gradient flex items-center justify-center hover:scale-110 transition-all duration-200 animate-[fadeInUp_0.4s_ease_both] shadow-lg shadow-primary/30 group"
      aria-label="Abrir IA Maview"
    >
      <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Antenna */}
        <line x1="32" y1="8" x2="32" y2="16" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.7">
          <animate attributeName="y1" values="8;6;8" dur="2s" repeatCount="indefinite" />
        </line>
        <circle cx="32" cy="6" r="3" fill="white" opacity="0.9">
          <animate attributeName="r" values="3;4;3" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="cy" values="6;4;6" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;1;0.9" dur="1.5s" repeatCount="indefinite" />
        </circle>

        {/* Head */}
        <rect x="12" y="16" width="40" height="32" rx="12" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="2" strokeOpacity="0.5" />

        {/* Left eye - happy arc */}
        <path d="M22 28 Q25 24 28 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <animate attributeName="d" values="M22 28 Q25 24 28 28;M22 30 Q25 26 28 30;M22 28 Q25 24 28 28" dur="3s" repeatCount="indefinite" />
        </path>

        {/* Right eye - happy arc */}
        <path d="M36 28 Q39 24 42 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <animate attributeName="d" values="M36 28 Q39 24 42 28;M36 30 Q39 26 42 30;M36 28 Q39 24 42 28" dur="3s" repeatCount="indefinite" />
        </path>

        {/* Big smile */}
        <path d="M24 36 Q32 44 40 36" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <animate attributeName="d" values="M24 36 Q32 44 40 36;M24 37 Q32 46 40 37;M24 36 Q32 44 40 36" dur="2s" repeatCount="indefinite" />
        </path>

        {/* Cheeks - blush */}
        <circle cx="20" cy="35" r="3" fill="white" opacity="0.25">
          <animate attributeName="opacity" values="0.25;0.4;0.25" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="44" cy="35" r="3" fill="white" opacity="0.25">
          <animate attributeName="opacity" values="0.25;0.4;0.25" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Waving hand */}
        <g>
          <animateTransform attributeName="transform" type="rotate" values="0 54 54;-15 54 54;15 54 54;0 54 54" dur="1.5s" repeatCount="indefinite" />
          <text x="48" y="58" fontSize="14" fill="white">👋</text>
        </g>
      </svg>
    </button>
  );
};

export default FloatingAIButton;
