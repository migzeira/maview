import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { ProductItem } from "@/types/vitrine";

const PROOF_NAMES = [
  { name: "Juliana S.",  city: "São Paulo" },
  { name: "Pedro M.",    city: "Rio de Janeiro" },
  { name: "Camila R.",   city: "Belo Horizonte" },
  { name: "Lucas T.",    city: "Curitiba" },
  { name: "Aline F.",    city: "Recife" },
  { name: "Rodrigo B.",  city: "Porto Alegre" },
];
const PROOF_TIMES = ["2 min", "5 min", "8 min", "12 min", "17 min", "21 min"];

interface SocialProofToastProps {
  accent: string;
  products?: ProductItem[];
}

const SocialProofToast = ({ accent, products }: SocialProofToastProps) => {
  const [current, setCurrent] = useState<{ name: string; city: string; product: string; time: string } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const productNames = products && products.length > 0
      ? products.map(p => p.title)
      : ["este produto"];

    let idx = 0;
    let intervalId: ReturnType<typeof setInterval>;
    const show = () => {
      const person = PROOF_NAMES[idx % PROOF_NAMES.length];
      setCurrent({
        ...person,
        product: productNames[idx % productNames.length],
        time: PROOF_TIMES[idx % PROOF_TIMES.length],
      });
      setVisible(true);
      idx++;
      setTimeout(() => setVisible(false), 4000);
    };
    const timer = setTimeout(() => {
      show();
      intervalId = setInterval(show, 9000);
    }, 3500);
    return () => { clearTimeout(timer); clearInterval(intervalId); };
  }, [products]);

  if (!current) return null;

  return (
    <div
      className="fixed bottom-20 left-4 z-50 max-w-[280px] pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.88)",
        transition: "opacity 0.28s ease-out, transform 0.28s ease-out",
      }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl backdrop-blur-md"
        style={{
          background: "rgba(8,5,18,0.95)",
          border: `1px solid ${accent}35`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
      >
        <div className="relative flex-shrink-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: `${accent}30`, color: accent }}
          >
            {current.name[0]}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#080512] flex items-center justify-center">
            <Check size={7} className="text-white" />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-white text-[12px] font-bold leading-snug truncate">
            {current.name}
          </p>
          <p className="text-[11.5px] font-medium leading-snug mt-0.5 truncate" style={{ color: accent }}>
            comprou {current.product}
          </p>
          <p className="text-[11px] mt-0.5 font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
            {current.city} · há {current.time}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SocialProofToast;
