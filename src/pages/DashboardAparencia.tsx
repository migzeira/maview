import { useState } from "react";
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

const DashboardAparencia = () => {
  const [selectedColor, setSelectedColor] = useState("#6D28D9");
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [selectedLayout, setSelectedLayout] = useState("Centralizado");
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8">
      <div className="space-y-1.5">
        <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">Aparência</h1>
        <p className="text-[hsl(var(--dash-text-muted))] text-[15px]">Personalize o visual da sua página</p>
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
