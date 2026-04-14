import { useState, useEffect, useCallback, useRef } from "react";
import { Check, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { initialLoad, saveWithSync, forceSaveNow, onSyncStatus, retryPendingSync, type VitrineConfig as SyncVitrineConfig } from "@/lib/vitrine-sync";
import DesignTab from "@/components/DesignTab";

import type { VitrineConfig, DesignConfig } from "@/types/vitrine";
import { THEMES, DEFAULT_DESIGN, DEFAULT_CONFIG, LS_KEY } from "@/lib/vitrine-constants";

export default function DashboardAparencia() {
  const [config, setConfig] = useState<VitrineConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // ── Load config from Supabase ──
  useEffect(() => {
    const unsub = onSyncStatus(setSyncStatus);
    (async () => {
      await retryPendingSync();
      const remote = await initialLoad();
      const base: VitrineConfig = {
        ...DEFAULT_CONFIG,
        ...remote,
        displayName: remote?.displayName ?? DEFAULT_CONFIG.displayName,
        username: remote?.username ?? DEFAULT_CONFIG.username,
        bio: remote?.bio ?? DEFAULT_CONFIG.bio,
        avatarUrl: remote?.avatarUrl ?? DEFAULT_CONFIG.avatarUrl,
        whatsapp: remote?.whatsapp ?? DEFAULT_CONFIG.whatsapp,
        products: remote?.products ?? DEFAULT_CONFIG.products,
        links: remote?.links ?? DEFAULT_CONFIG.links,
        testimonials: remote?.testimonials ?? DEFAULT_CONFIG.testimonials,
        blocks: remote?.blocks ?? DEFAULT_CONFIG.blocks,
      };
      setConfig(base);
      setLoading(false);
    })();
    return unsub;
  }, []);

  // ── Save helpers ──
  const showSavedToast = useCallback(() => {
    setToastVisible(true);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 2000);
  }, []);

  const updateConfig = useCallback(<K extends keyof VitrineConfig>(key: K, value: VitrineConfig[K]) => {
    setConfig(prev => {
      const next = { ...prev, [key]: value };
      saveWithSync(next as unknown as SyncVitrineConfig);
      return next;
    });
    showSavedToast();
  }, [showSavedToast]);

  const handleForceSave = useCallback(async () => {
    const ok = await forceSaveNow(config as unknown as SyncVitrineConfig);
    return ok;
  }, [config]);

  // ── Derived ──
  const currentTheme = THEMES.find(t => t.id === config.theme) ?? THEMES[0];
  const d: DesignConfig = { ...DEFAULT_DESIGN, ...config.design } as DesignConfig;

  // ── Phone preview helpers ──
  const pBg = d.bgColor || currentTheme.bg;
  const pAccent = d.accentColor || currentTheme.accent;
  const pAccent2 = d.accentColor2 || currentTheme.accent2;
  const pFontH = d.fontHeading || "Inter";
  const pFontB = d.fontBody || "Inter";
  const pText = d.textColor || currentTheme.text;
  const pSub = d.subtextColor || currentTheme.sub;
  const pCard = d.cardBg || currentTheme.card;
  const pBorder = d.cardBorder || currentTheme.border;
  const pBtnR = d.buttonShape === "pill" ? 999 : d.buttonShape === "square" ? 4 : d.buttonShape === "soft" ? 16 : 12;
  const pProfileR = d.profileShape === "circle" ? "9999px" : d.profileShape === "rounded" ? "20%" : d.profileShape === "square" ? "8px" : "0";
  const pProfileClip = d.profileShape === "hexagon" ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" : undefined;
  const pSize = d.profileSize || 88;

  const previewBgStyle: React.CSSProperties = (() => {
    switch (d.bgType) {
      case "gradient": return { background: `linear-gradient(${d.bgGradientDir === "radial" ? "circle" : d.bgGradientDir?.replace("-", " ") || "to bottom"}, ${d.bgGradient?.[0] || pBg}, ${d.bgGradient?.[1] || pBg})` };
      case "image": return d.bgImageUrl ? { backgroundImage: `url(${d.bgImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: pBg };
      case "effect": return { background: pBg };
      default: return { background: pBg };
    }
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-10">
      <div className="space-y-1.5 mb-8">
        <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">Aparência</h1>
        <p className="text-[hsl(var(--dash-text-muted))] text-[15px]">Personalize o visual da sua página</p>
      </div>

      <div className="flex gap-8">
        {/* ── LEFT: Design editor ── */}
        <div className="flex-1 min-w-0">
          <DesignTab
            config={config}
            themes={THEMES}
            defaultDesign={DEFAULT_DESIGN}
            updateConfig={updateConfig}
            onForceSave={handleForceSave}
          />
        </div>

        {/* ── RIGHT: Live phone preview ── */}
        <div className="hidden lg:block w-[340px] flex-shrink-0">
          <div className="sticky top-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[hsl(var(--dash-text-subtle))] text-xs font-medium uppercase tracking-wider">Preview ao vivo</p>
              <a href={`/${config.username}`} target="_blank" rel="noopener noreferrer"
                className="text-[10px] text-primary hover:underline">
                Abrir página
              </a>
            </div>

            {/* Phone frame */}
            <div className="rounded-[2.5rem] border-[3px] border-[hsl(var(--dash-border))] bg-black p-1.5 shadow-2xl">
              {/* Status bar */}
              <div className="flex items-center justify-between px-6 py-1.5 text-white/70 text-[10px]">
                <span>9:41</span>
                <div className="w-20 h-5 rounded-full bg-black" />
                <span>●●●● ▐█</span>
              </div>

              {/* Screen */}
              <div className="rounded-[2rem] overflow-hidden" style={{ height: 520 }}>
                <div className="h-full overflow-y-auto relative" style={{ ...previewBgStyle, fontFamily: `'${pFontB}', sans-serif` }}>
                  {/* Ambient glow */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] pointer-events-none" style={{ background: `radial-gradient(ellipse, ${pAccent}20, transparent 70%)` }} />

                  <div className="p-5 relative z-10">
                    {/* Profile */}
                    <div className="flex flex-col items-center mb-5">
                      <div className="mb-2.5 overflow-hidden"
                        style={{
                          width: pSize, height: pSize, borderRadius: pProfileR, clipPath: pProfileClip,
                          border: d.profileBorder ? `3px solid ${d.profileBorderColor || pAccent}` : "2px solid rgba(255,255,255,0.1)",
                        }}>
                        {config.avatarUrl ? (
                          <img src={config.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${pAccent}40, ${pAccent2}40)` }} />
                        )}
                      </div>
                      <p className="text-[15px] font-bold text-center" style={{ color: pText, fontFamily: `'${pFontH}', sans-serif` }}>
                        {config.displayName || "Seu Nome"}
                      </p>
                      <p className="text-[11px] mt-0.5 text-center" style={{ color: pSub }}>
                        @{config.username || "usuario"}
                      </p>
                      {config.bio && (
                        <p className="text-[10px] mt-1.5 text-center max-w-[200px] leading-relaxed" style={{ color: pSub }}>
                          {config.bio}
                        </p>
                      )}
                    </div>

                    {/* Links */}
                    {config.links?.filter(l => l.active).slice(0, 3).map((link, i) => (
                      <div key={link.id || i} className="mb-2 p-3 rounded-xl text-center text-[11px] font-medium transition-all"
                        style={{
                          borderRadius: pBtnR,
                          background: d.buttonFill === "outline" ? "transparent" : d.buttonFill === "glass" ? `${pAccent}12` : `${pAccent}18`,
                          border: d.buttonFill === "outline" ? `1px solid ${pAccent}50` : d.buttonFill === "glass" ? `1px solid ${pAccent}20` : "1px solid transparent",
                          color: d.buttonFill === "outline" ? pAccent : pText,
                          boxShadow: d.buttonShadow === "glow" ? `0 0 12px ${pAccent}25` : d.buttonShadow === "md" ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
                        }}>
                        {link.title || link.url || "Link"}
                      </div>
                    ))}

                    {/* Products */}
                    {config.products?.filter(p => p.active).slice(0, 2).map((prod, i) => (
                      <div key={prod.id || i} className="mb-2 p-3 rounded-xl flex items-center gap-3"
                        style={{ background: pCard, border: `1px solid ${pBorder}`, borderRadius: pBtnR }}>
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ background: `${pAccent}15` }}>
                          {prod.images?.[0] ? (
                            <img src={prod.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">{prod.emoji || "📦"}</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold truncate" style={{ color: pText }}>{prod.title || "Produto"}</p>
                          <p className="text-[10px] font-bold" style={{ color: pAccent }}>
                            {prod.price ? `R$ ${prod.price}` : ""}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Watermark */}
                    <p className="text-center text-[8px] mt-4 opacity-40" style={{ color: pSub }}>Criado com maview.app</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-[10px] text-[hsl(var(--dash-text-subtle))] mt-2.5">Atualiza em tempo real ao editar</p>
          </div>
        </div>
      </div>

      {/* ── Sync status toast ── */}
      <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-medium shadow-sm transition-all duration-300 pointer-events-none whitespace-nowrap z-50 ${
        toastVisible || syncStatus === "saving"
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2"
      } ${syncStatus === "error" ? "bg-red-50 border border-red-100 text-red-700" : syncStatus === "saving" ? "bg-blue-50 border border-blue-100 text-blue-700" : "bg-emerald-50 border border-emerald-100 text-emerald-700"}`}>
        {syncStatus === "saving" ? (
          <><div className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" /> Salvando na nuvem...</>
        ) : syncStatus === "error" ? (
          <><AlertCircle size={13} className="text-red-500" /> Erro ao salvar — tentando novamente</>
        ) : (
          <><Check size={13} className="text-emerald-500" /> Salvo na nuvem</>
        )}
      </div>
    </div>
  );
}
