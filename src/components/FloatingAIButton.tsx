import { useNavigate, useLocation } from "react-router-dom";
import MaviewLogo from "./MaviewLogo";

const FloatingAIButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on the AI page itself
  if (location.pathname === "/dashboard/ia") return null;

  return (
    <button
      onClick={() => navigate("/dashboard/ia")}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full btn-primary-gradient flex items-center justify-center hover:scale-105 transition-all duration-200 animate-[fadeInUp_0.4s_ease_both]"
      aria-label="Abrir IA Maview"
    >
      <MaviewLogo size={28} />
    </button>
  );
};

export default FloatingAIButton;
