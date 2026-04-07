import { useState } from "react";
import { useLocation } from "react-router-dom";
import robotImg from "@/assets/maview-robot-transparent.png";
import FloatingAIChat from "./FloatingAIChat";

const FloatingAIButton = () => {
  const location  = useLocation();
  const [open, setOpen] = useState(false);

  // Hide on the full IA page
  if (location.pathname === "/dashboard/ia") return null;

  return (
    <>
      {/* Chat widget */}
      {open && <FloatingAIChat onClose={() => setOpen(false)} />}

      {/* Floating button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className={`
          fixed bottom-5 right-5 z-[99] w-16 h-16 rounded-full
          bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6]
          shadow-[0_4px_20px_rgba(109,40,217,0.4)]
          hover:shadow-[0_6px_28px_rgba(109,40,217,0.55)]
          hover:scale-[1.08] transition-all duration-200 ease-in-out
          flex items-center justify-center p-1.5
          ${open ? "rotate-[10deg]" : ""}
        `}
        aria-label="Abrir IA Maview"
      >
        <img
          src={robotImg}
          alt="Maview AI"
          className="w-full h-full object-contain"
          style={{ animation: open ? "none" : "gentleBlink 3s ease-in-out infinite" }}
        />
      </button>
    </>
  );
};

export default FloatingAIButton;
