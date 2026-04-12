import { useState, useEffect } from "react";
import {
  Settings, User, Globe, Link2, Bell, Shield, Check, Save,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { saveWithSync, loadLocal } from "@/lib/vitrine-sync";

const TABS = [
  { id: "perfil",       label: "Perfil",       icon: User     },
  { id: "dominio",      label: "Domínio",       icon: Globe    },
  { id: "integracoes",  label: "Integrações",   icon: Link2    },
  { id: "notificacoes", label: "Notificações",  icon: Bell     },
];

const LS_KEY = "maview_vitrine_config";

function loadVitrine() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; }
}
function saveVitrine(data: object) {
  const existing = loadVitrine();
  localStorage.setItem(LS_KEY, JSON.stringify({ ...existing, ...data }));
}

const DashboardConfiguracoes = () => {
  const [activeTab, setActiveTab] = useState("perfil");

  /* ── Perfil state ── */
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername]       = useState("");
  const [email, setEmail]             = useState("");
  const [bio, setBio]                 = useState("");
  const [avatarUrl, setAvatarUrl]     = useState("");
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);

  /* ── Integration state ── */
  const [gaId, setGaId] = useState("");
  const [metaPixelId, setMetaPixelId] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [mpToken, setMpToken] = useState("");
  const [integSaved, setIntegSaved] = useState("");

  /* ── Notif toggles ── */
  const [notifs, setNotifs] = useState({
    venda: true, lead: true, visitas: false, email: false,
  });

  useEffect(() => {
    // Load from localStorage
    const cfg = loadVitrine();
    if (cfg.displayName) setDisplayName(cfg.displayName);
    if (cfg.username)    setUsername(cfg.username);
    if (cfg.bio)         setBio(cfg.bio);
    if (cfg.avatarUrl)   setAvatarUrl(cfg.avatarUrl);

    const design = (cfg.design || {}) as Record<string, unknown>;
    if (design.gaId) setGaId(design.gaId as string);
    if (design.metaPixelId) setMetaPixelId(design.metaPixelId as string);
    if (design.webhookUrl) setWebhookUrl(design.webhookUrl as string);
    if (design.pixKey) setPixKey(design.pixKey as string);
    if (design.mercadoPagoToken) setMpToken(design.mercadoPagoToken as string);

    // Load email from Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setEmail(session.user.email || "");
        // Only pre-fill from session if localStorage doesn't have it
        if (!cfg.displayName) setDisplayName(session.user.user_metadata?.full_name || "");
        if (!cfg.username)    setUsername(session.user.user_metadata?.username || session.user.email?.split("@")[0] || "");
      }
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // Save to localStorage
    saveVitrine({ displayName, username, bio, avatarUrl });

    // Update Supabase user metadata
    try {
      await supabase.auth.updateUser({
        data: { full_name: displayName, username },
      });
    } catch {
      // silent — localStorage already saved
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const saveIntegration = (key: string, value: string) => {
    const cfg = loadVitrine();
    const design = (cfg.design || {}) as Record<string, unknown>;
    design[key] = value;
    cfg.design = design;
    saveVitrine(cfg);
    saveWithSync(cfg);
    setIntegSaved(key);
    setTimeout(() => setIntegSaved(""), 2000);
  };

  const initials = displayName
    ? displayName.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()
    : "?";

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8">
      <div className="space-y-1.5">
        <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">Configurações</h1>
        <p className="text-[hsl(var(--dash-text-muted))] text-[15px]">Gerencie sua conta e preferências</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] w-fit overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap ${
              activeTab === id
                ? "bg-[hsl(var(--dash-surface))] text-[hsl(var(--dash-text))] shadow-sm"
                : "text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text-secondary))]"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── PERFIL ── */}
      {activeTab === "perfil" && (
        <div className="glass-card rounded-2xl p-6 md:p-7 space-y-6">
          {/* Avatar row */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden ring-4 ring-primary/10 flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold">
                  {initials}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[hsl(var(--dash-text))] font-semibold text-[14px]">{displayName || "Seu nome"}</p>
              <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-0.5">{window.location.host}/{username?.replace(/^@/, "") || "usuario"}</p>
              <div className="mt-2">
                <label className="text-[hsl(var(--dash-text-subtle))] text-xs font-medium block mb-1">URL da foto</label>
                <input
                  type="url"
                  className="w-full px-3 py-1.5 rounded-lg bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/30 transition-all"
                  placeholder="https://exemplo.com/foto.jpg"
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-[hsl(var(--dash-text-secondary))] text-xs font-medium mb-1.5 block">Nome de exibição</label>
              <input
                className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                placeholder="Seu nome"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[hsl(var(--dash-text-secondary))] text-xs font-medium mb-1.5 block">Username</label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 rounded-l-xl bg-[hsl(var(--dash-accent))] border border-r-0 border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text-subtle))] text-sm select-none">@</span>
                <input
                  className="flex-1 px-4 py-2.5 rounded-r-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                  placeholder="usuario"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                />
              </div>
            </div>
            <div>
              <label className="text-[hsl(var(--dash-text-secondary))] text-xs font-medium mb-1.5 block">Email</label>
              <input
                disabled
                className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text-subtle))] text-sm opacity-60 cursor-not-allowed"
                value={email}
                readOnly
              />
            </div>
            <div>
              <label className="text-[hsl(var(--dash-text-secondary))] text-xs font-medium mb-1.5 block">Bio</label>
              <input
                className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                placeholder="Sua descrição em poucas palavras"
                maxLength={120}
                value={bio}
                onChange={e => setBio(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 btn-primary-gradient px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 transition-all active:scale-[0.98]"
          >
            {saved
              ? <><Check size={15} /> Salvo!</>
              : saving
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando…</>
                : <><Save size={15} /> Salvar alterações</>
            }
          </button>
        </div>
      )}

      {/* ── DOMÍNIO ── */}
      {activeTab === "dominio" && (
        <div className="glass-card rounded-2xl p-6 md:p-7 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center">
              <Globe size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[15px]">Domínio personalizado</h2>
              <p className="text-[hsl(var(--dash-text-subtle))] text-xs">Use seu próprio domínio na sua página</p>
            </div>
          </div>
          <div>
            <label className="text-[hsl(var(--dash-text-secondary))] text-xs font-medium mb-1.5 block">Seu domínio</label>
            <input
              className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              placeholder="meusite.com.br"
            />
          </div>
          <div className="flex items-center gap-2 p-4 rounded-xl bg-amber-50 border border-amber-100">
            <Shield size={16} className="text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700">SSL automático incluso. Configure o CNAME para ativar.</p>
          </div>
          <button className="btn-primary-gradient px-6 py-2.5 rounded-xl text-sm font-semibold">Conectar domínio</button>
        </div>
      )}

      {/* ── INTEGRAÇÕES ── */}
      {activeTab === "integracoes" && (
        <div className="space-y-3">
          {[
            { key: "gaId", label: "Google Analytics", desc: "Métricas avançadas de visitantes", placeholder: "G-XXXXXXXXXX", value: gaId, set: setGaId },
            { key: "metaPixelId", label: "Meta Pixel (Facebook)", desc: "Rastreamento de conversões do Facebook/Instagram Ads", placeholder: "123456789012345", value: metaPixelId, set: setMetaPixelId },
            { key: "webhookUrl", label: "Webhook", desc: "Receba notificações em tempo real", placeholder: "https://seu-webhook.com/api", value: webhookUrl, set: setWebhookUrl },
            { key: "pixKey", label: "Chave PIX", desc: "Receba pagamentos via PIX na vitrine", placeholder: "email@exemplo.com, CPF ou telefone", value: pixKey, set: setPixKey },
            { key: "mercadoPagoToken", label: "Mercado Pago Access Token", desc: "Pagamentos reais via PIX e cartao pelo Mercado Pago", placeholder: "APP_USR-...", value: mpToken, set: setMpToken },
          ].map(({ key, label, desc, placeholder, value, set }) => (
            <div key={key} className="glass-card-hover rounded-2xl p-5">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center flex-shrink-0">
                  <Link2 size={16} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium">{label}</p>
                  <p className="text-[hsl(var(--dash-text-subtle))] text-xs">{desc}</p>
                </div>
                {value && <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 font-medium">Conectado</span>}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 px-3 py-2 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  placeholder={placeholder}
                  value={value}
                  onChange={e => set(e.target.value)}
                />
                <button onClick={() => saveIntegration(key, value)} className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-medium hover:opacity-90 transition-all">
                  {integSaved === key ? "Salvo!" : "Salvar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── NOTIFICAÇÕES ── */}
      {activeTab === "notificacoes" && (
        <div className="glass-card rounded-2xl p-6 md:p-7 space-y-0 divide-y divide-[hsl(var(--dash-border-subtle))]">
          {[
            { key: "venda",   label: "Nova venda",       desc: "Receber notificação quando houver uma venda" },
            { key: "lead",    label: "Novo lead",         desc: "Quando alguém se inscrever na sua lista" },
            { key: "visitas", label: "Visitas diárias",   desc: "Resumo diário de visitas na página" },
            { key: "email",   label: "Email semanal",     desc: "Relatório semanal de performance" },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between py-4">
              <div>
                <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium">{n.label}</p>
                <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-0.5">{n.desc}</p>
              </div>
              <button
                onClick={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key as keyof typeof prev] }))}
                className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                  notifs[n.key as keyof typeof notifs] ? "bg-primary" : "bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border))]"
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  notifs[n.key as keyof typeof notifs] ? "translate-x-4" : "translate-x-0.5"
                }`} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardConfiguracoes;
