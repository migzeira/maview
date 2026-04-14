import { useEffect, useState } from "react";

/** Stagger entrance animation hook — returns array of visibility booleans */
export const useStagger = (count: number, baseDelay = 180, step = 70) => {
  const [vis, setVis] = useState<boolean[]>(Array(count).fill(false));
  useEffect(() => {
    Array.from({ length: count }).forEach((_, i) => {
      setTimeout(() => setVis(v => { const n = [...v]; n[i] = true; return n; }), baseDelay + i * step);
    });
  }, []);
  return vis;
};
