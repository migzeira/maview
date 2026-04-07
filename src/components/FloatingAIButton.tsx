import { useNavigate, useLocation } from "react-router-dom";
import robotImg from "@/assets/maview-robot-transparent.png";

const FloatingAIButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/dashboard/ia") return null;

  return (
    <button
      onClick={() => navigate("/dashboard/ia")}
      className="fixed bottom-4 right-4 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] shadow-[0_4px_20px_rgba(109,40,217,0.35)] hover:shadow-[0_4px_24px_rgba(109,40,217,0.5)] hover:scale-[1.05] transition-all duration-200 ease-in-out animate-gentleFloat flex items-center justify-center p-1"
      aria-label="Abrir IA Maview"
    >
      <img
        src={robotImg}
        alt="Maview AI"
        className="w-full h-full object-contain"
      />
    </button>
  );
};

export default FloatingAIButton;
