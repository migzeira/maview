import { useNavigate, useLocation } from "react-router-dom";

const FloatingAIButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/dashboard/ia") return null;

  return (
    <button
      onClick={() => navigate("/dashboard/ia")}
      className="fixed bottom-6 right-6 z-50 w-[68px] h-[68px] rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200 animate-[fadeInUp_0.4s_ease_both] group"
      aria-label="Abrir IA Maview"
      style={{
        background: "linear-gradient(135deg, #7C5CFC 0%, #6D8DFC 50%, #8B5CF6 100%)",
        boxShadow: "0 8px 28px rgba(109, 40, 217, 0.35), 0 2px 8px rgba(139, 92, 246, 0.2), inset 0 1px 1px rgba(255,255,255,0.3)",
      }}
    >
      {/* 3D-style robot face */}
      <svg width="42" height="42" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Bounce animation */}
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur="2.5s" repeatCount="indefinite" />

        {/* Shadow under head */}
        <ellipse cx="40" cy="68" rx="18" ry="4" fill="black" opacity="0.1">
          <animate attributeName="ry" values="4;3;4" dur="2.5s" repeatCount="indefinite" />
        </ellipse>

        {/* Ears */}
        <rect x="5" y="30" width="8" height="16" rx="4" fill="white" fillOpacity="0.35" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
        <rect x="67" y="30" width="8" height="16" rx="4" fill="white" fillOpacity="0.35" stroke="white" strokeWidth="1" strokeOpacity="0.4" />

        {/* Head - 3D rounded shape */}
        <rect x="14" y="14" width="52" height="48" rx="22" fill="white" fillOpacity="0.3" stroke="white" strokeWidth="2" strokeOpacity="0.6">
          <animate attributeName="fill-opacity" values="0.3;0.38;0.3" dur="3s" repeatCount="indefinite" />
        </rect>

        {/* Inner highlight - top shine for 3D effect */}
        <rect x="20" y="17" width="40" height="20" rx="14" fill="white" fillOpacity="0.15" />

        {/* Left eye - round with shine */}
        <circle cx="30" cy="36" r="6" fill="white" fillOpacity="0.95">
          <animate attributeName="r" values="6;5.5;6" dur="4s" repeatCount="indefinite" keyTimes="0;0.08;1" />
        </circle>
        <circle cx="31" cy="35" r="2.5" fill="#6D28D9">
          <animate attributeName="cy" values="35;34;35" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="32.5" cy="33.5" r="1" fill="white" fillOpacity="0.9" />

        {/* Right eye - round with shine */}
        <circle cx="50" cy="36" r="6" fill="white" fillOpacity="0.95">
          <animate attributeName="r" values="6;5.5;6" dur="4s" repeatCount="indefinite" keyTimes="0;0.08;1" />
        </circle>
        <circle cx="51" cy="35" r="2.5" fill="#6D28D9">
          <animate attributeName="cy" values="35;34;35" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="52.5" cy="33.5" r="1" fill="white" fillOpacity="0.9" />

        {/* Blush cheeks */}
        <circle cx="22" cy="43" r="4" fill="#FF9EC6" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="58" cy="43" r="4" fill="#FF9EC6" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2.5s" repeatCount="indefinite" />
        </circle>

        {/* Happy smile */}
        <path d="M32 47 Q40 56 48 47" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <animate attributeName="d" values="M32 47 Q40 56 48 47;M32 48 Q40 58 48 48;M32 47 Q40 56 48 47" dur="2.5s" repeatCount="indefinite" />
        </path>

        {/* Antenna */}
        <line x1="40" y1="14" x2="40" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7">
          <animate attributeName="y2" values="6;4;6" dur="2.5s" repeatCount="indefinite" />
        </line>
        <circle cx="40" cy="4" r="3.5" fill="white" fillOpacity="0.9">
          <animate attributeName="r" values="3.5;4.5;3.5" dur="2s" repeatCount="indefinite" />
          <animate attributeName="fill-opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    </button>
  );
};

export default FloatingAIButton;
