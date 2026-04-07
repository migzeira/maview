import { useNavigate, useLocation } from "react-router-dom";
import MaviewLogo from "./MaviewLogo";

const FloatingAIButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/dashboard/ia") return null;

  return (
    <button
      onClick={() => navigate("/dashboard/ia")}
      className="fixed bottom-6 right-6 z-50 hover:scale-110 transition-all duration-200 animate-[fadeInUp_0.4s_ease_both] drop-shadow-lg"
      aria-label="Abrir IA Maview"
    >
      <MaviewLogo size={44} />
    </button>
  );
};

export default FloatingAIButton;
