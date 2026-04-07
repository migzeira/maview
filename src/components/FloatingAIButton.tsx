import { useNavigate, useLocation } from "react-router-dom";

const FloatingAIButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/dashboard/ia") return null;

  return (
    <button
      onClick={() => navigate("/dashboard/ia")}
      className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#6D8DFC] flex items-center justify-center hover:scale-110 transition-all duration-200 animate-[fadeInUp_0.4s_ease_both] shadow-lg shadow-[#7C5CFC]/30 group"
      aria-label="Abrir IA Maview"
    >
      <svg width="38" height="38" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Head - rounded friendly shape */}
        <rect x="10" y="12" width="44" height="40" rx="18" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="2" strokeOpacity="0.5">
          <animate attributeName="fill-opacity" values="0.25;0.35;0.25" dur="3s" repeatCount="indefinite" />
        </rect>

        {/* Left eye - happy closed arc */}
        <path d="M22 28 Q25 23 28 28" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none">
          <animate attributeName="d" values="M22 28 Q25 23 28 28;M22 27 Q25 32 28 27;M22 28 Q25 23 28 28" dur="4s" repeatCount="indefinite" keyTimes="0;0.1;1" />
        </path>

        {/* Right eye - happy closed arc */}
        <path d="M36 28 Q39 23 42 28" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none">
          <animate attributeName="d" values="M36 28 Q39 23 42 28;M36 27 Q39 32 42 27;M36 28 Q39 23 42 28" dur="4s" repeatCount="indefinite" keyTimes="0;0.1;1" />
        </path>

        {/* Big happy smile */}
        <path d="M23 35 Q32 46 41 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="white" fillOpacity="0.3">
          <animate attributeName="d" values="M23 35 Q32 46 41 35;M23 36 Q32 48 41 36;M23 35 Q32 46 41 35" dur="2.5s" repeatCount="indefinite" />
        </path>

        {/* Floating bounce animation on the whole SVG */}
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur="2s" repeatCount="indefinite" />
      </svg>
    </button>
  );
};

export default FloatingAIButton;
