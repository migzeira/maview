import { useNavigate, useLocation } from "react-router-dom";
import robotImg from "@/assets/maview-robot.png";

const FloatingAIButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/dashboard/ia") return null;

  return (
    <button
      onClick={() => navigate("/dashboard/ia")}
      className="fixed bottom-6 right-6 z-50 w-20 h-20 rounded-full animate-slowPulse hover:scale-110 transition-transform duration-200 flex items-center justify-center"
      aria-label="Abrir IA Maview"
    >
      <img
        src={robotImg}
        alt="Maview AI"
        className="w-[90%] h-[90%] object-contain drop-shadow-lg"
      />
    </button>
  );
};

export default FloatingAIButton;
