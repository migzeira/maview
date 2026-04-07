import { useState, useEffect } from "react";
import { Palette, Type, Layout, Sun, Moon, Check } from "lucide-react";

const COLORS = [
  { name: "Roxo", value: "#6D28D9" },
  { name: "Azul", value: "#2563EB" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Verde", value: "#059669" },
  { name: "Laranja", value: "#EA580C" },
  { name: "Vermelho", value: "#DC2626" },
];

const FONTS = [
  { name: "Inter", sample: "Aa Bb Cc" },
  { name: "Poppins", sample: "Aa Bb Cc" },
  { name: "DM Sans", sample: "Aa Bb Cc" },
  { name: "Space Grotesk", sample: "Aa Bb Cc" },
];

const LAYOUTS = [
  { name: "Centralizado", desc: "Conteúdo alinhado ao centro" },
  { name: "Cards", desc: "Blocos em formato de cards" },
  { name: "Lista", desc: "Blocos em lista simples" },
];

const THEMES = [
  {
    id: "dark-purple" as const,
    name: "Roxo Escuro",
    accent: "#a855f7",
    bg: "#1a0a2e",
    surface: "#2d1a4a",
    swatches: ["#a855f7", "#c084fc", "#7c3aed"],
  },
  {
    id: "midnight" as const,
    name: "Meia Noite",
    accent: "#60a5fa",
    bg: "#0a0f1e",
    surface: "#1a2340",
    swatches: ["#60a5fa", "#93c5fd", "#3b82f6"],
  },
  {
    id: "forest" as const,
    name: "Floresta",
    accent: "#4ade80",
    bg: "#071a0f",
    surface: "#0f2d1a",
    swatches: ["#4ade80", "#86efac", "#16a34a"],
  },
  {
    id: "rose" as const,
    name: "Rosa",
    accent: "#f43f5e",
    bg: "#1a0610",
    surface: "#2d0f1e",
    swatches: ["#f43f5e", "#fb7185", "#e11d48"],
  },
  {
    id: "amber" as const,
    name: "Âmbar",
    accent: "#f59e0b",
    bg: "#1a1000",
    surface: "#2d1f00",
    swatches: ["#f59e0b", "#fbbf24", "#d97706"],
  },
  {
    id: "ocean" as const,
    name: "Oceano",
    accent: "#06b6d4",
    bg: "#001a1f",
    surface: "#002d35",
    swatches: ["#06b6d4", "#22d3ee", "#0891b2"],
  },
] as const;

type ThemeId = typeof THEMES[number]["id"];

const LS_KEY = "maview_vitrine_config";

const readThemeFromLS = (): ThemeId => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const valid = THEMES.find(t => t.id === parsed.theme);
      if (valid) return valid.id;
    }
  } catch {
    // ignore
  }
  return "dark-purple";
};

const saveThemeToLS = (theme: ThemeId) => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const config = raw ? JSON.parse(raw) : {};
    config.theme = theme;
    localStorage.setItem(LS_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
};

const DashboardAparencia = () => {
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("dark-purple");
  const [savedToast, setSavedToast] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#6D28D9");
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [selectedLayout, setSelectedLayout] = useState("Centralizado");
  const [darkMode, setDarkMode] = useState(false);

  // On mount: read stored theme
  useEffect(() => {
    setSelectedTheme(readThemeFromLS());
  }, []);

  const handleSelectTheme = (themeId: ThemeId) => {
    setSelectedTheme(themeId);
    saveThemeToLS(themeId);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const activeTheme = THEMES.find(t => t.id === selectedTheme) ?? THEMES[0];

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8">
      {/* Toast */}
      {savedToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg animate-fade-in">
          <Check size={15} />
          Tema salvo!
        </div>
      )}

      <div className="space-y-1.5">
        <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">Aparência</h1>
        <p className="text-[hsl(var(--dash-text-muted))] text-[15px]">Personalize o visual da sua página</p>
      </div>

      {/* ── Tema da Vitrine ── */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center">
            <Palette size={15} className="text-primary" />
          </div>
          <div>
            <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[15px]">Tema da Vitrine</h2>
            <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-0.5">Aparência escura aplicada na sua página pública</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(theme => {
            const isSelected = selectedTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                className={`relative rounded-xl p-3 text-left transition-all duration-200 border-2 ${
                  isSelected
                    ? "border-violet-500 ring-2 ring-violet-500/30 scale-[1.02]"
                    : "border-transparent hover:border-white/10 hover:scale-[1.01]"
                }`}
                style={{ backgroundColor: theme.bg }}
              >
                {isSelected && (
                  <div
                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: theme.accent }}
                  >
                    <Check size={11} className="text-white" />
                  </div>
                )}
                {/* Mini preview bar */}
                <div
                  className="w-full h-1.5 rounded-full mb-2.5 opacity-80"
                  style={{ backgroundColor: theme.accent }}
                />
                {/* Swatches */}
                <div className="flex gap-1 mb-2.5">
                  {theme.swatches.map((s, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: s }}
                    />
                  ))}
                </div>
                <p
                  className="text-[11px] font-semibold"
                  style={{ color: theme.accent }}
                >
                  {theme.name}
                </p>
                {/* Mini card preview */}
                <div
                  className="mt-2 rounded-lg p-1.5 border border-white/5"
                  style={{ backgroundColor: theme.surface }}
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: theme.accent }}
                    />
                    <div className="flex-1 h-1 rounded-full bg-white/20" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="space-y-6">
          {/* Colors */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center">
                <Palette size={15} className="text-primary" />
              </div>
              <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[15px]">Cor principal</h2>
            </div>
            <div className="flex gap-3 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setSelectedColor(c.value)}
                  className={`w-12 h-12 rounded-xl transition-all duration-200 flex items-center justify-center ${
                    selectedColor === c.value ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                >
                  {selectedColor === c.value && <Check size={16} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center">
                <Type size={15} className="text-primary" />
              </div>
              <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[15px]">Tipografia</h2>
            </div>
            <div className="space-y-2">
              {FONTS.map(f => (
                <button
                  key={f.name}
                  onClick={() => setSelectedFont(f.name)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                    selectedFont === f.name
                      ? "border-primary/30 bg-[hsl(var(--dash-accent))]/50 ring-1 ring-primary/10"
                      : "border-[hsl(var(--dash-border-subtle))] hover:border-[hsl(var(--dash-border))]"
                  }`}
                >
                  <span className="text-[hsl(var(--dash-text))] text-[13px] font-medium">{f.name}</span>
                  <span className="text-[hsl(var(--dash-text-subtle))] text-sm">{f.sample}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Layout */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center">
                <Layout size={15} className="text-primary" />
              </div>
              <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[15px]">Layout da página</h2>
            </div>
            <div className="space-y-2">
              {LAYOUTS.map(l => (
                <button
                  key={l.name}
                  onClick={() => setSelectedLayout(l.name)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                    selectedLayout === l.name
                      ? "border-primary/30 bg-[hsl(var(--dash-accent))]/50 ring-1 ring-primary/10"
                      : "border-[hsl(var(--dash-border-subtle))] hover:border-[hsl(var(--dash-border))]"
                  }`}
                >
                  <div>
                    <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium">{l.name}</p>
                    <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-0.5">{l.desc}</p>
                  </div>
                  {selectedLayout === l.name && <Check size={16} className="text-primary flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Dark mode */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center">
                  {darkMode ? <Moon size={15} className="text-primary" /> : <Sun size={15} className="text-primary" />}
                </div>
                <div>
                  <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[15px]">Modo da página</h2>
                  <p className="text-[hsl(var(--dash-text-subtle))] text-xs">{darkMode ? "Dark mode ativado" : "Light mode ativado"}</p>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative w-12 h-7 rounded-full transition-colors ${darkMode ? "bg-primary" : "bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border))]"}`}
              >
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${darkMode ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div className="hidden lg:block">
          <div className="sticky top-8">
            <p className="text-[hsl(var(--dash-text-subtle))] text-xs font-medium mb-3 uppercase tracking-wider">Pré-visualização</p>
            <div className="rounded-[2.5rem] border-[3px] border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-surface))] p-3 shadow-xl">
              <div className="flex justify-center mb-2">
                <div className="w-20 h-5 rounded-full bg-[hsl(var(--dash-surface-2))]" />
              </div>
              <div
                className="rounded-[1.8rem] min-h-[500px] p-5 space-y-4 overflow-hidden transition-colors duration-300"
                style={{ backgroundColor: darkMode ? "#1a1a2e" : "#fafafa" }}
              >
                <div className="flex flex-col items-center mb-6">
                  <div
                    className="w-16 h-16 rounded-full mb-2.5 ring-2"
                    style={{ background: `linear-gradient(135deg, ${selectedColor}, ${selectedColor}cc)`, boxShadow: `0 0 0 2px ${selectedColor}20` }}
                  />
                  <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`} style={{ fontFamily: selectedFont }}>@usuario</p>
                  <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Minha vitrine digital</p>
                </div>
                {["Meu Instagram", "Ebook Premium", "Canal YouTube"].map(text => (
                  <div
                    key={text}
                    className="flex items-center gap-3 rounded-xl border p-3.5 transition-all"
                    style={{
                      backgroundColor: darkMode ? "#2a2a3e" : "#ffffff",
                      borderColor: darkMode ? "#3a3a4e" : "#e5e5e5",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${selectedColor}15` }}
                    >
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: selectedColor }} />
                    </div>
                    <span className={`text-xs font-medium ${darkMode ? "text-white" : "text-gray-800"}`} style={{ fontFamily: selectedFont }}>
                      {text}
                    </span>
                  </div>
                ))}
                <button
                  className="w-full py-3 rounded-xl text-white text-xs font-semibold transition-all"
                  style={{ background: `linear-gradient(135deg, ${selectedColor}, ${selectedColor}cc)` }}
                >
                  Comprar agora
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAparencia;
