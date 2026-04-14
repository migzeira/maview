import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { GOOGLE_FONTS, PRIMARY_FONTS, FONT_CATEGORY_LABELS, type FontDef } from "./constants";
import { loadFont } from "./utils";

interface FontSelectorProps {
  currentFont: string;
  bodyFont: string;
  displayName: string;
  onSelectFont: (name: string) => void;
}

export default function FontSelector({ currentFont, bodyFont, displayName, onSelectFont }: FontSelectorProps) {
  const [showAll, setShowAll] = useState(false);

  const handleSelect = (name: string) => {
    loadFont(name);
    onSelectFont(name);
  };

  const primaryFonts = GOOGLE_FONTS.filter(f => PRIMARY_FONTS.includes(f.name));
  const groupedFonts = GOOGLE_FONTS.reduce<Record<string, FontDef[]>>((acc, f) => {
    (acc[f.category] ??= []).push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      <h3 className="text-[hsl(var(--dash-text))] font-bold text-[14px]">Fonte</h3>

      {/* Primary 9 fonts */}
      <div className="grid grid-cols-3 gap-1.5">
        {primaryFonts.map(f => {
          const isActive = currentFont === f.name;
          return (
            <button key={f.name} onClick={() => handleSelect(f.name)}
              className={`px-2 py-2.5 rounded-xl text-[11px] font-medium transition-all text-center ${
                isActive
                  ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                  : "bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] hover:bg-[hsl(var(--dash-surface-2))]/80"
              }`}
              style={{ fontFamily: `"${f.name}", sans-serif` }}>
              {f.name.split(" ")[0]}
            </button>
          );
        })}
      </div>

      {/* Expand/collapse */}
      <button onClick={() => setShowAll(!showAll)}
        className="flex items-center gap-1.5 mx-auto text-[11px] text-[hsl(var(--dash-text-subtle))] hover:text-primary transition-colors">
        {showAll ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {showAll ? "Menos fontes" : "Ver mais fontes"}
      </button>

      {/* All fonts grouped by category */}
      {showAll && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {Object.entries(groupedFonts).map(([cat, fonts]) => (
            <div key={cat}>
              <p className="text-[10px] font-semibold text-[hsl(var(--dash-text-subtle))] uppercase tracking-wider mb-1.5">
                {FONT_CATEGORY_LABELS[cat] || cat}
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {fonts.map(f => {
                  const isActive = currentFont === f.name;
                  return (
                    <button key={f.name} onClick={() => handleSelect(f.name)}
                      className={`px-2 py-2 rounded-xl text-[11px] font-medium transition-all text-center ${
                        isActive
                          ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                          : "bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))]"
                      }`}
                      style={{ fontFamily: `"${f.name}", sans-serif` }}>
                      {f.name.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live preview */}
      <div className="p-3 rounded-xl bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))]">
        <p className="text-[14px] font-bold text-[hsl(var(--dash-text))]" style={{ fontFamily: `"${currentFont}", sans-serif` }}>
          {displayName || "Seu Nome"}
        </p>
        <p className="text-[11px] text-[hsl(var(--dash-text-muted))] mt-0.5" style={{ fontFamily: `"${bodyFont}", sans-serif` }}>
          Preview da fonte &middot; {currentFont} + {bodyFont}
        </p>
      </div>
    </div>
  );
}
