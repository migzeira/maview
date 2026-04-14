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
  const pProfileR = d.profileShape === "circle" ? "9999px" : d.profileShape === "rounded" ? "20%" : d.profileShape === "square" ? "8px" : "9999px";
  const pProfileClip = undefined; // Hexagon removed — always round
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
                        <p className="text-[11px] mt-1.5 text-center max-w-[220px] leading-relaxed" style={{ color: pSub }}>
                          {config.bio}
                        </p>
                      )}

                      {/* WhatsApp CTA */}
                      {config.whatsapp && (
                        <div className="flex items-center justify-center gap-1.5 mt-3 px-5 py-2 rounded-full text-[11px] font-bold text-white"
                          style={{ background: "#25d366", boxShadow: "0 2px 8px rgba(37,211,102,0.25)" }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
                          WhatsApp
                        </div>
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
