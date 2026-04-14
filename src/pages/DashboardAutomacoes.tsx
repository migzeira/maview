import { useState, useEffect } from "react";
import {
  Zap, Mail, Unlock, ExternalLink as Redirect,
  Plus, ToggleLeft, ToggleRight, Pencil, Trash2,
  ShoppingBag, UserPlus, ArrowRight, Sparkles, X,
  Loader2, AlertCircle,
} from "lucide-react";
import {
  fetchAutomations,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  type Automation,
  type TriggerType,
  type ActionType,
} from "@/lib/automations";

const TRIGGER_LABELS: Record<TriggerType, { label: string; icon: typeof ShoppingBag }> = {
  compra: { label: "Apos compra", icon: ShoppingBag },
  lead: { label: "Novo lead", icon: UserPlus },
  visualizacao: { label: "Visualizacao", icon: Zap },
};

const ACTION_LABELS: Record<ActionType, { label: string; icon: typeof Mail; desc: string }> = {
  email: { label: "Enviar email", icon: Mail, desc: "Email automatico para o cliente" },
  liberar: { label: "Liberar conteudo", icon: Unlock, desc: "Desbloquear acesso a produto/bloco" },
  redirecionar: { label: "Redirecionar", icon: Redirect, desc: "Enviar para outra pagina" },
};

const DashboardAutomacoes = () => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  /* ── Load automations from Supabase ── */
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const data = await fetchAutomations();
    setAutomations(data);
    setLoading(false);
  }

  /* ─�� Toggle active/inactive ── */
  const handleToggle = async (auto: Automation) => {
    setTogglingId(auto.id);
    const success = await updateAutomation(auto.id, { active: !auto.active });
    if (success) {
      setAutomations(prev => prev.map(a => a.id === auto.id ? { ...a, active: !a.active } : a));
    }
    setTogglingId(null);
  };

  /* ���─ Delete with confirmation ── */
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const success = await deleteAutomation(id);
    if (success) {
      setAutomations(prev => prev.filter(a => a.id !== id));
    }
    setDeletingId(null);
    setConfirmDeleteId(null);
  };

  /* ���─ Create new automation ── */
  const handleCreate = async (trigger: TriggerType, action: ActionType) => {
    const t = TRIGGER_LABELS[trigger];
    const a = ACTION_LABELS[action];
    const result = await createAutomation({
      name: `${t.label} → ${a.label}`,
      trigger_type: trigger,
      action_type: action,
      description: a.desc,
    });
    if (result) {
      setAutomations(prev => [result, ...prev]);
    }
    setShowCreateModal(false);
  };

  /* ── Save edit ── */
  const handleSaveEdit = async (id: string) => {
    const auto = automations.find(a => a.id === id);
    const cleanConfig: Record<string, string> = {};
    if (auto?.action_type === "email") {
      if (editConfig.email_subject) cleanConfig.email_subject = editConfig.email_subject;
      if (editConfig.email_html) cleanConfig.email_html = editConfig.email_html;
    } else if (auto?.action_type === "redirecionar") {
      if (editConfig.redirect_url) cleanConfig.redirect_url = editConfig.redirect_url;
    } else if (auto?.action_type === "liberar") {
      if (editConfig.content_id) cleanConfig.content_id = editConfig.content_id;
    }

    const success = await updateAutomation(id, { name: editName, description: editDesc, config: cleanConfig });
    if (success) {
      setAutomations(prev => prev.map(a => a.id === id ? { ...a, name: editName, description: editDesc, config: cleanConfig } : a));
    }
    setEditingId(null);
  };

  /* ── Config state for advanced editing ── */
  const [editConfig, setEditConfig] = useState<Record<string, string>>({});

  /* ── Start editing ── */
  const startEdit = (auto: Automation) => {
    setEditingId(auto.id);
    setEditName(auto.name);
    setEditDesc(auto.description);
    setEditConfig({
      email_subject: (auto.config as any)?.email_subject || "",
      email_html: (auto.config as any)?.email_html || "",
      redirect_url: (auto.config as any)?.redirect_url || "",
      content_id: (auto.config as any)?.content_id || "",
    });
  };

  /* ── Skeleton loader ── */
  const Skeleton = ({ className }: { className: string }) => (
    <div className={`skeleton ${className}`} />
  );

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8 page-enter">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">Automacoes</h1>
          <p className="text-[hsl(var(--dash-text-muted))] text-[15px]">Configure acoes automaticas para vender no piloto automatico</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 btn-primary-gradient text-[13px] px-4 py-2.5 rounded-xl"
        >
          <Plus size={15} /> Nova automacao
        </button>
      </div>

      {/* Feature banner */}
      <div className="glass-card rounded-2xl p-5 flex items-start gap-4 border-l-4 border-l-primary">
        <div className="w-10 h-10 rounded-xl bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-primary" />
        </div>
        <div>
          <p className="text-[hsl(var(--dash-text))] text-[13px] font-semibold mb-0.5">Automacoes sao o seu diferencial</p>
          <p className="text-[hsl(var(--dash-text-secondary))] text-[13px] leading-relaxed">
            Configure fluxos automaticos de pos-compra, captura de leads e entrega de conteudo. Tudo sem codigo.
          </p>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-40 h-4" />
                <Skeleton className="w-64 h-3" />
              </div>
              <Skeleton className="w-10 h-6 rounded-full" />
            </div>
          ))}
        </div>
      ) : automations.length === 0 ? (
        /* Empty state */
        <div className="text-center py-20 text-[hsl(var(--dash-text-subtle))]">
          <Zap size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Nenhuma automacao criada ainda</p>
          <p className="text-xs mt-1 text-[hsl(var(--dash-text-subtle))]">Clique em "Nova automacao" para comecar</p>
        </div>
      ) : (
        /* Automations list */
        <div className="space-y-2">
          {automations.map(auto => {
            const TriggerIcon = TRIGGER_LABELS[auto.trigger_type]?.icon || Zap;
            const ActionIcon = ACTION_LABELS[auto.action_type]?.icon || Mail;
            const isEditing = editingId === auto.id;

            return (
              <div
                key={auto.id}
                className={`glass-card-hover flex items-center gap-4 rounded-2xl p-5 group transition-opacity ${!auto.active ? "opacity-50" : ""}`}
              >
                {/* Trigger → Action icons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center">
                    <TriggerIcon size={16} className="text-primary" />
                  </div>
                  <ArrowRight size={14} className="text-[hsl(var(--dash-text-subtle))]" />
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 ring-1 ring-emerald-100 flex items-center justify-center">
                    <ActionIcon size={16} className="text-emerald-600" />
                  </div>
                </div>

                {/* Content (inline edit or display) */}
                {isEditing ? (
                  <div className="flex-1 min-w-0 space-y-2">
                    <input
                      className="w-full px-3 py-1.5 rounded-lg bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-primary/20"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      placeholder="Nome da automacao"
                    />
                    <input
                      className="w-full px-3 py-1.5 rounded-lg bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text-subtle))] text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value)}
                      placeholder="Descricao"
                    />

                    {/* Config fields based on action type */}
                    {auto.action_type === "email" && (
                      <div className="space-y-2 p-3 rounded-xl bg-[hsl(var(--dash-surface-2))]/50 border border-[hsl(var(--dash-border-subtle))]">
                        <p className="text-[10px] text-[hsl(var(--dash-text-muted))] font-semibold uppercase tracking-wider">Config do Email</p>
                        <input
                          className="w-full px-3 py-1.5 rounded-lg bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                          value={editConfig.email_subject || ""}
                          onChange={e => setEditConfig(c => ({ ...c, email_subject: e.target.value }))}
                          placeholder="Assunto do email (ex: Obrigado pela compra!)"
                        />
                        <textarea
                          className="w-full px-3 py-1.5 rounded-lg bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 min-h-[60px] resize-y"
                          value={editConfig.email_html || ""}
                          onChange={e => setEditConfig(c => ({ ...c, email_html: e.target.value }))}
                          placeholder="Mensagem do email (HTML ou texto simples)"
                          rows={3}
                        />
                      </div>
                    )}
                    {auto.action_type === "redirecionar" && (
                      <div className="space-y-2 p-3 rounded-xl bg-[hsl(var(--dash-surface-2))]/50 border border-[hsl(var(--dash-border-subtle))]">
                        <p className="text-[10px] text-[hsl(var(--dash-text-muted))] font-semibold uppercase tracking-wider">Config do Redirect</p>
                        <input
                          className="w-full px-3 py-1.5 rounded-lg bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                          value={editConfig.redirect_url || ""}
                          onChange={e => setEditConfig(c => ({ ...c, redirect_url: e.target.value }))}
                          placeholder="URL de destino (ex: https://meusite.com/obrigado)"
                        />
                      </div>
                    )}
                    {auto.action_type === "liberar" && (
                      <div className="space-y-2 p-3 rounded-xl bg-[hsl(var(--dash-surface-2))]/50 border border-[hsl(var(--dash-border-subtle))]">
                        <p className="text-[10px] text-[hsl(var(--dash-text-muted))] font-semibold uppercase tracking-wider">Config de Conteudo</p>
                        <input
                          className="w-full px-3 py-1.5 rounded-lg bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                          value={editConfig.content_id || ""}
                          onChange={e => setEditConfig(c => ({ ...c, content_id: e.target.value }))}
                          placeholder="ID ou URL do conteudo a liberar"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button onClick={() => handleSaveEdit(auto.id)} className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-medium">Salvar</button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1 rounded-lg bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text-muted))] text-xs">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium truncate">{auto.name}</p>
                    <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-0.5 truncate">{auto.description}</p>
                  </div>
                )}

                {/* Action buttons */}
                {!isEditing && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(auto)}
                      className="p-1.5 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-primary hover:bg-[hsl(var(--dash-surface-2))] transition-all"
                    >
                      <Pencil size={13} />
                    </button>
                    {confirmDeleteId === auto.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(auto.id)}
                          disabled={deletingId === auto.id}
                          className="px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-medium hover:bg-red-600 disabled:opacity-50"
                        >
                          {deletingId === auto.id ? <Loader2 size={10} className="animate-spin" /> : "Sim"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 rounded-lg bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text-muted))] text-[10px]"
                        >
                          Nao
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(auto.id)}
                        className="p-1.5 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                )}

                {/* Toggle */}
                <button
                  onClick={() => handleToggle(auto)}
                  disabled={togglingId === auto.id}
                  className="flex-shrink-0 disabled:opacity-50"
                >
                  {togglingId === auto.id ? (
                    <Loader2 size={18} className="animate-spin text-primary" />
                  ) : auto.active ? (
                    <ToggleRight size={26} className="text-primary" />
                  ) : (
                    <ToggleLeft size={26} className="text-[hsl(var(--dash-text-subtle))]" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Create automation modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative glass-card rounded-2xl p-6 md:p-7 w-full max-w-lg shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[hsl(var(--dash-text))] font-semibold text-lg">Nova automacao</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[hsl(var(--dash-text-subtle))] hover:text-[hsl(var(--dash-text))] p-1">
                <X size={18} />
              </button>
            </div>

            <p className="text-[hsl(var(--dash-text-secondary))] text-[13px] mb-4 font-medium">Escolha o gatilho e a acao:</p>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {(Object.keys(TRIGGER_LABELS) as TriggerType[]).map(trigger => {
                const t = TRIGGER_LABELS[trigger];
                return (Object.keys(ACTION_LABELS) as ActionType[]).map(action => {
                  const a = ACTION_LABELS[action];
                  return (
                    <button
                      key={`${trigger}-${action}`}
                      onClick={() => handleCreate(trigger, action)}
                      className="w-full flex items-center gap-3 p-4 rounded-xl border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 hover:bg-[hsl(var(--dash-accent))]/50 transition-all text-left group"
                    >
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center">
                          <t.icon size={14} className="text-primary" />
                        </div>
                        <ArrowRight size={12} className="text-[hsl(var(--dash-text-subtle))]" />
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 ring-1 ring-emerald-100 flex items-center justify-center">
                          <a.icon size={14} className="text-emerald-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium">{t.label} → {a.label}</p>
                        <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-0.5">{a.desc}</p>
                      </div>
                    </button>
                  );
                });
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAutomacoes;
