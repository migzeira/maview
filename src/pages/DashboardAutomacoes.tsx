import { useState } from "react";
import {
  Zap, Mail, Unlock, ExternalLink as Redirect,
  Plus, ToggleLeft, ToggleRight, Pencil, Trash2,
  ShoppingBag, UserPlus, ArrowRight, Sparkles, X,
} from "lucide-react";

type TriggerType = "compra" | "lead" | "visualizacao";
type ActionType = "email" | "liberar" | "redirecionar";

interface Automation {
  id: string;
  name: string;
  trigger: TriggerType;
  action: ActionType;
  active: boolean;
  description: string;
}

const TRIGGER_LABELS: Record<TriggerType, { label: string; icon: any }> = {
  compra: { label: "Após compra", icon: ShoppingBag },
  lead: { label: "Novo lead", icon: UserPlus },
  visualizacao: { label: "Visualização", icon: Zap },
};

const ACTION_LABELS: Record<ActionType, { label: string; icon: any; desc: string }> = {
  email: { label: "Enviar email", icon: Mail, desc: "Email automático para o cliente" },
  liberar: { label: "Liberar conteúdo", icon: Unlock, desc: "Desbloquear acesso a produto/bloco" },
  redirecionar: { label: "Redirecionar", icon: Redirect, desc: "Enviar para outra página" },
};

const SAMPLE: Automation[] = [
  { id: "1", name: "Email pós-compra", trigger: "compra", action: "email", active: true, description: "Envia email de agradecimento após compra" },
  { id: "2", name: "Liberar ebook", trigger: "compra", action: "liberar", active: true, description: "Libera acesso ao ebook após pagamento" },
  { id: "3", name: "Redirect pós-captura", trigger: "lead", action: "redirecionar", active: false, description: "Redireciona lead para página de oferta" },
];

const DashboardAutomacoes = () => {
  const [automations, setAutomations] = useState<Automation[]>(SAMPLE);
  const [showModal, setShowModal] = useState(false);

  const toggleAutomation = (id: string) =>
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));

  const deleteAutomation = (id: string) =>
    setAutomations(prev => prev.filter(a => a.id !== id));

  const addAutomation = (trigger: TriggerType, action: ActionType) => {
    const t = TRIGGER_LABELS[trigger];
    const a = ACTION_LABELS[action];
    setAutomations(prev => [...prev, {
      id: Date.now().toString(),
      name: `${t.label} → ${a.label}`,
      trigger,
      action,
      active: true,
      description: a.desc,
    }]);
    setShowModal(false);
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">Automações</h1>
          <p className="text-[hsl(var(--dash-text-muted))] text-[15px]">Configure ações automáticas para vender no piloto automático</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 btn-primary-gradient text-[13px] px-4 py-2.5 rounded-xl"
        >
          <Plus size={15} /> Nova automação
        </button>
      </div>

      {/* Feature banner */}
      <div className="glass-card rounded-2xl p-5 flex items-start gap-4 border-l-4 border-l-primary">
        <div className="w-10 h-10 rounded-xl bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-primary" />
        </div>
        <div>
          <p className="text-[hsl(var(--dash-text))] text-[13px] font-semibold mb-0.5">Automações são o seu diferencial</p>
          <p className="text-[hsl(var(--dash-text-secondary))] text-[13px] leading-relaxed">
            Configure fluxos automáticos de pós-compra, captura de leads e entrega de conteúdo. Tudo sem código.
          </p>
        </div>
      </div>

      {/* Automations list */}
      {automations.length === 0 ? (
        <div className="text-center py-20 text-[hsl(var(--dash-text-subtle))]">
          <Zap size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhuma automação criada ainda</p>
        </div>
      ) : (
        <div className="space-y-2">
          {automations.map(auto => {
            const TriggerIcon = TRIGGER_LABELS[auto.trigger].icon;
            const ActionIcon = ACTION_LABELS[auto.action].icon;
            return (
              <div
                key={auto.id}
                className={`glass-card-hover flex items-center gap-4 rounded-2xl p-5 group ${!auto.active ? "opacity-50" : ""}`}
              >
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center">
                    <TriggerIcon size={16} className="text-primary" />
                  </div>
                  <ArrowRight size={14} className="text-[hsl(var(--dash-text-subtle))]" />
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 ring-1 ring-emerald-100 flex items-center justify-center">
                    <ActionIcon size={16} className="text-emerald-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium truncate">{auto.name}</p>
                  <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-0.5 truncate">{auto.description}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-primary hover:bg-[hsl(var(--dash-surface-2))] transition-all">
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => deleteAutomation(auto.id)}
                    className="p-1.5 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <button
                  onClick={() => toggleAutomation(auto.id)}
                  className="flex-shrink-0"
                >
                  {auto.active ? (
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
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative glass-card rounded-2xl p-6 md:p-7 w-full max-w-lg shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[hsl(var(--dash-text))] font-semibold text-lg">Nova automação</h3>
              <button onClick={() => setShowModal(false)} className="text-[hsl(var(--dash-text-subtle))] hover:text-[hsl(var(--dash-text))] p-1">
                <X size={18} />
              </button>
            </div>

            <p className="text-[hsl(var(--dash-text-secondary))] text-[13px] mb-4 font-medium">Escolha o gatilho e a ação:</p>

            <div className="space-y-2">
              {(Object.keys(TRIGGER_LABELS) as TriggerType[]).map(trigger => {
                const t = TRIGGER_LABELS[trigger];
                return (Object.keys(ACTION_LABELS) as ActionType[]).map(action => {
                  const a = ACTION_LABELS[action];
                  return (
                    <button
                      key={`${trigger}-${action}`}
                      onClick={() => addAutomation(trigger, action)}
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
