import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { GOOGLE_FONTS, FONT_CATEGORY_LABELS } from "./constants";
import { loadFont } from "./utils";

/* ═══════════════════════════════════════════════════════════════════════════
   FontPicker — dropdown customizado com preview de CADA fonte na fonte real

   Problema: <select><option> nativo NÃO renderiza CSS custom nas options
   Solução: dropdown custom com <button> pra cada opção, cada uma stylizada
            com a própria fontFamily. Fontes carregadas dinamicamente.
   ═══════════════════════════════════════════════════════════════════════════ */

interface Props {
  value: string;
  onChange: (fontName: string) => void;
  className?: string;
}

export default function FontPicker({ value, onChange, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState<Set<string>>(new Set([value]));
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  /* Fechar ao clicar fora */
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  /* Focus search ao abrir */
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  /* Carregar fontes visíveis sob demanda (scroll-triggered) */
  useEffect(() => {
    if (!open) return;
    /* Carrega TODAS as fontes ao abrir — permite ver cada uma na própria */
    const toLoad = GOOGLE_FONTS.filter(f => !loaded.has(f.name));
    if (toLoad.length === 0) return;
    toLoad.forEach(f => loadFont(f.name));
    setLoaded(prev => {
      const next = new Set(prev);
      toLoad.forEach(f => next.add(f.name));
      return next;
    });
  }, [open, loaded]);

  /* Sempre carrega a fonte selecionada */
  useEffect(() => {
    if (value && value !== "Inter") loadFont(value);
  }, [value]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return GOOGLE_FONTS;
    return GOOGLE_FONTS.filter(f => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q));
  }, [search]);

  /* Agrupa por categoria para exibir mais organizado */
  const grouped = useMemo(() => {
    const groups: Record<string, typeof GOOGLE_FONTS> = {};
    for (const f of filtered) {
      (groups[f.category] ??= []).push(f);
    }
    return groups;
  }, [filtered]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Botão principal — mostra a fonte atual NA fonte atual */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[hsl(var(--dash-bg))] border border-[hsl(var(--dash-border))] hover:border-primary/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <span
          className="text-[14px] font-medium text-[hsl(var(--dash-text))]"
          style={{ fontFamily: `'${value || "Inter"}', sans-serif` }}
        >
          {value || "Inter"}
        </span>
        <ChevronDown
          size={16}
          className="text-[hsl(var(--dash-text-subtle))] transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-2 left-0 right-0 rounded-2xl bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border))] shadow-2xl overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-150">
          {/* Search */}
          <div className="p-2 border-b border-[hsl(var(--dash-border-subtle))] bg-[hsl(var(--dash-bg))]/50">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--dash-text-subtle))]" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar fonte..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))] text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* Font list */}
          <div className="max-h-[360px] overflow-y-auto scrollbar-none py-1">
            {Object.keys(grouped).length === 0 ? (
              <p className="text-[12px] text-center text-[hsl(var(--dash-text-subtle))] py-6">
                Nenhuma fonte encontrada para "{search}"
              </p>
            ) : (
              Object.entries(grouped).map(([cat, fonts]) => (
                <div key={cat}>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--dash-text-subtle))] px-4 pt-2.5 pb-1">
                    {FONT_CATEGORY_LABELS[cat] || cat}
                  </p>
                  {fonts.map(f => {
                    const isActive = f.name === value;
                    return (
                      <button
                        key={f.name}
                        type="button"
                        onClick={() => {
                          onChange(f.name);
                          setOpen(false);
                          setSearch("");
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 transition-colors text-left ${
                          isActive
                            ? "bg-primary/10"
                            : "hover:bg-[hsl(var(--dash-accent))]/40"
                        }`}
                      >
                        <span
                          className={`text-[15px] ${isActive ? "text-primary font-semibold" : "text-[hsl(var(--dash-text))]"}`}
                          style={{ fontFamily: `'${f.name}', sans-serif` }}
                        >
                          {f.name}
                        </span>
                        {isActive && <Check size={14} className="text-primary flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-[hsl(var(--dash-border-subtle))] bg-[hsl(var(--dash-bg))]/50">
            <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] text-center">
              {GOOGLE_FONTS.length} fontes Google · cada uma renderizada na sua tipografia
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
