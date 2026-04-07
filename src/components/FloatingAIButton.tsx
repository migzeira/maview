import { useNavigate, useLocation } from "react-router-dom";
import robotImg from "@/assets/maview-robot.png";

const FloatingAIButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/dashboard/ia") return null;

  return (
    <button
      onClick={() => navigate("/dashboard/ia")}
      className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] shadow-lg shadow-primary/30 hover:scale-110 transition-transform duration-200 animate-[slowBounce_2.5s_ease-in-out_infinite] flex items-center justify-center p-1.5"
      aria-label="Abrir IA Maview"
    >
      <img
        src={robotImg}
        alt="Maview AI"
        className="w-full h-full object-contain drop-shadow-md"
      />
    </button>
  );
};

export default FloatingAIButton;
