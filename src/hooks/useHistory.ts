import { useState, useCallback, useRef, useEffect } from "react";

const MAX_HISTORY = 50;

export function useHistory<T>(initial: T) {
  const [state, setState] = useState(initial);
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const skipRecord = useRef(false);

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setState(prev => {
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      if (!skipRecord.current) {
        past.current = [...past.current.slice(-(MAX_HISTORY - 1)), prev];
        future.current = [];
      }
      skipRecord.current = false;
      return resolved;
    });
  }, []);

  const undo = useCallback(() => {
    setState(prev => {
      if (past.current.length === 0) return prev;
      const previous = past.current[past.current.length - 1];
      past.current = past.current.slice(0, -1);
      future.current = [...future.current, prev];
      skipRecord.current = true;
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (future.current.length === 0) return prev;
      const next = future.current[future.current.length - 1];
      future.current = future.current.slice(0, -1);
      past.current = [...past.current, prev];
      skipRecord.current = true;
      return next;
    });
  }, []);

  const canUndo = past.current.length > 0;
  const canRedo = future.current.length > 0;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.key === "z" && e.shiftKey) || e.key === "y") { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  return { state, set, undo, redo, canUndo, canRedo };
}
