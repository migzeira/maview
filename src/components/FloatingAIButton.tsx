import { useNavigate, useLocation } from "react-router-dom";
import robotImg from "@/assets/ai-robot.png";

const FloatingAIButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/dashboard/ia") return null;

  return (
    <button
      onClick={() => navigate("/dashboard/ia")}
      className="fixed bottom-5 right-5 z-50 w-[72px] h-[72px] rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200 animate-[fadeInUp_0.4s_ease_both] group"
      aria-label="Abrir IA Maview"
      style={{
        background: "linear-gradient(135deg, #7C5CFC 0%, #8B5CF6 50%, #6D28D9 100%)",
        boxShadow: "0 8px 28px rgba(109, 40, 217, 0.4), 0 2px 8px rgba(139, 92, 246, 0.25)",
      }}
    >
      <img
        src={robotImg}
        alt="Assistente IA Maview"
        className="w-14 h-14 object-contain drop-shadow-lg animate-[bounce_3s_ease-in-out_infinite]"
        style={{ animationDuration: "3s", animationTimingFunction: "ease-in-out" }}
      />
    </button>
  );
};

export default FloatingAIButton;
