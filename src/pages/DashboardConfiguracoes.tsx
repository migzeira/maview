import { useState, useEffect, useRef } from "react";
import {
  Settings, User, Globe, Link2, Bell, Shield, Check, Save,
  Upload, Camera, Clock, Sparkles, Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { initialLoad, loadLocal, saveWithSync, uploadImage } from "@/lib/vitrine-sync";

const TABS = [
  { id: "perfil",       label: "Perfil",       icon: User     },
  { id: "dominio",      label: "Domínio",       icon: Globe    },
  { id: "integracoes",  label: "Integrações",   icon: Link2    },
  { id: "notificacoes", label: "Notificações",  icon: Bell     },
];

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

  /* ── Avatar upload state ── */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  /* ── Integration state ── */
  const [gaId, setGaId] = useState("");
  const [metaPixelId, setMetaPixelId] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [mpToken, setMpToken] = useState("");
  const [integSaved, setIntegSaved] = useState("");

  /* ── Notif toggles (persisted via design JSONB) ── */
  const [notifs, setNotifs] = useState({
    venda: true, lead: true, visitas: false, email: false,
  });

  /* ── Domain waitlist state ── */
  const [domainWaitlisted, setDomainWaitlisted] = useState(false);

  useEffect(() => {
    (async () => {
      // Load from Supabase (source of truth) via initialLoad
      const cfg = await initialLoad();

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

      // Load notification prefs from design JSONB
      const notifPrefs = design.notificationPrefs as Record<string, boolean> | undefined;
      if (notifPrefs) {
        setNotifs(prev => ({ ...prev, ...notifPrefs }));
      }

      // Load domain waitlist status
      if (design.domainWaitlist) setDomainWaitlisted(true);

      // Load email from Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setEmail(session.user.email || "");
        if (!cfg.displayName) setDisplayName(session.user.user_metadata?.full_name || "");
        if (!cfg.username)    setUsername(session.user.user_metadata?.username || session.user.email?.split("@")[0] || "");
      }
    })();
  }, []);

  /* ── Save profile → Supabase via saveWithSync ── */
  const handleSave = async () => {
    setSaving(true);

    // Read current full config, merge profile fields, save via sync
    const current = loadLocal();
    const merged = {
      ...current,
      displayName,
      username: username.replace(/^@/, ""),
      bio,
      avatarUrl,
    };
    saveWithSync(merged);

    // Also update Supabase user metadata
    try {
      await supabase.auth.updateUser({
        data: { full_name: displayName, username: username.replace(/^@/, "") },
      });
    } catch {
      // silent — vitrine sync already saved
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  /* ── Avatar file upload ── */
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (file.size > 5 * 1024 * 1024) {
      alert("Imagem muito grande. Máximo 5MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem.");
      return;
    }

    setUploading(true);

    // Instant local preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);

    // Upload to Supabase Storage
    const publicUrl = await uploadImage(file, "avatars");
    if (publicUrl) {
      setAvatarUrl(publicUrl);
      // Save immediately to vitrine config
      const current = loadLocal();
      saveWithSync({ ...current, avatarUrl: publicUrl });
    } else {
      // Revert preview if upload failed
      const current = loadLocal();
      setAvatarUrl(current.avatarUrl || "");
    }

    setUploading(false);
    // Clean up file input for re-upload
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── Integration save ── */
  const saveIntegration = (key: string, value: string) => {
    const cfg = loadLocal();
    const design = (cfg.design || {}) as Record<string, unknown>;
    design[key] = value;
    cfg.design = design;
    saveWithSync(cfg);
    setIntegSaved(key);
    setTimeout(() => setIntegSaved(""), 2000);
  };

  /* ── Notification toggle → persist in design JSONB ── */
  const toggleNotif = (key: string) => {
    const newNotifs = { ...notifs, [key]: !notifs[key as keyof typeof notifs] };
    setNotifs(newNotifs);

    // Persist to Supabase via design.notificationPrefs
    const cfg = loadLocal();
    const design = (cfg.design || {}) as Record<string, unknown>;
    design.notificationPrefs = newNotifs;
    cfg.design = design;
    saveWithSync(cfg);
  };

  /* ── Domain waitlist ── */
  const handleDomainWaitlist = () => {
    const cfg = loadLocal();
    const design = (cfg.design || {}) as Record<string, unknown>;
    design.domainWaitlist = true;
    cfg.design = design;
    saveWithSync(cfg);
    setDomainWaitlisted(true);
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
          {/* Avatar row with REAL upload */}
          <div className="flex items-center gap-4">
            <div
              className="relative w-16 h-16 rounded-full overflow-hidden ring-4 ring-primary/10 flex-shrink-0 cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                  <Loader2 size={20} className="text-white animate-spin" />
                </div>
              ) : avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold">
                  {initials}
                </div>
              )}
              {/* Upload overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={18} className="text-white" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[hsl(var(--dash-text))] font-semibold text-[14px]">{displayName || "Seu nome"}</p>
              <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-0.5">{window.location.host}/{username?.replace(/^@/, "") || "usuario"}</p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text-secondary))] hover:border-primary/30 transition-all disabled:opacity-50"
                >
                  <Upload size={12} /> {uploading ? "Enviando..." : "Enviar foto"}
                </button>
                <span className="text-[hsl(var(--dash-text-subtle))] text-[10px]">ou cole URL abaixo</span>
              </div>
              <div className="mt-1.5">
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

      {/* ── DOMÍNIO — Coming Soon with Waitlist ── */}
      {activeTab === "dominio" && (
        <div className="glass-card rounded-2xl p-6 md:p-7 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center">
              <Globe size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[15px]">Domínio personalizado</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white">PRO</span>
              </div>
              <p className="text-[hsl(var(--dash-text-subtle))] text-xs">Use seu próprio domínio na sua página</p>
            </div>
          </div>

          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center mx-auto mb-4">
              <Clock size={28} className="text-primary/60" />
            </div>
            <h3 className="text-[hsl(var(--dash-text))] font-semibold text-lg mb-1">Em breve</h3>
            <p className="text-[hsl(var(--dash-text-muted))] text-sm max-w-sm mx-auto leading-relaxed">
              Estamos construindo o suporte a domínios personalizados com SSL automático.
              Cadastre-se na lista de espera para ser avisado quando estiver disponível.
            </p>

            <div className="mt-6 max-w-xs mx-auto">
              {domainWaitlisted ? (
                <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <Check size={16} className="text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">Você será avisado!</span>
                </div>
              ) : (
                <button
                  onClick={handleDomainWaitlist}
                  className="w-full flex items-center justify-center gap-2 btn-primary-gradient px-6 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
                >
                  <Sparkles size={15} /> Avisar quando disponível
                </button>
              )}
            </div>
          </div>
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
            { key: "mercadoPagoToken", label: "Mercado Pago Access Token", desc: "Pagamentos reais via PIX e cartão pelo Mercado Pago", placeholder: "APP_USR-...", value: mpToken, set: setMpToken },
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

      {/* ── NOTIFICAÇÕES — Persisted via design.notificationPrefs ── */}
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
                onClick={() => toggleNotif(n.key)}
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
