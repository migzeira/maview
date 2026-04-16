import { useEffect, useState, useRef } from "react";

/** Stagger entrance animation hook — returns array of visibility booleans */
export const useStagger = (count: number, baseDelay = 180, step = 70) => {
  const [vis, setVis] = useState<boolean[]>(() => Array(Math.max(count, 1)).fill(false));
  const prevCount = useRef(count);

  useEffect(() => {
    // If count increased, expand the array
    if (count > prevCount.current) {
      setVis(v => {
        const expanded = [...v];
        while (expanded.length < count) expanded.push(false);
        return expanded;
      });
    }
    prevCount.current = count;

    // Trigger stagger for all items
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < count; i++) {
      timers.push(
        setTimeout(() => setVis(v => {
          const n = [...v];
          if (i < n.length) n[i] = true;
          return n;
        }), baseDelay + i * step)
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [count, baseDelay, step]);

  return vis;
};
