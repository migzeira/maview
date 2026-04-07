import { useState } from "react";
import {
  Settings, User, Globe, Link2, Bell, Shield, Check,
} from "lucide-react";

const TABS = [
  { id: "perfil", label: "Perfil", icon: User },
  { id: "dominio", label: "Domínio", icon: Globe },
  { id: "integracoes", label: "Integrações", icon: Link2 },
  { id: "notificacoes", label: "Notificações", icon: Bell },
];

const INTEGRATIONS = [
  { name: "Stripe", desc: "Pagamentos e assinaturas", connected: false },
  { name: "Google Analytics", desc: "Métricas avançadas", connected: false },
  { name: "Pixel do Facebook", desc: "Rastreamento de conversões", connected: false },
  { name: "Webhook", desc: "Integre com qualquer ferramenta", connected: false },
];

const DashboardConfiguracoes = () => {
  const [activeTab, setActiveTab] = useState("perfil");

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8">
      <div className="space-y-1.5">
        <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">Configurações</h1>
        <p className="text-[hsl(var(--dash-text-muted))] text-[15px]">Gerencie sua conta e preferências</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
              activeTab === id
                ? "bg-[hsl(var(--dash-surface))] text-[hsl(var(--dash-text))] shadow-sm"
                : "text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text-secondary))]"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "perfil" && (
        <div className="glass-card rounded-2xl p-6 md:p-7 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold ring-4 ring-primary/10">
              U
            </div>
            <div>
              <p className="text-[hsl(var(--dash-text))] font-semibold">Foto de perfil</p>
              <button className="text-xs text-primary hover:underline mt-1">Alterar foto</button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-[hsl(var(--dash-text-secondary))] text-xs font-medium mb-1.5 block">Nome completo</label>
              <input className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" placeholder="Seu nome" />
            </div>
            <div>
              <label className="text-[hsl(var(--dash-text-secondary))] text-xs font-medium mb-1.5 block">Username</label>
              <input className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" placeholder="@usuario" />
            </div>
            <div>
              <label className="text-[hsl(var(--dash-text-secondary))] text-xs font-medium mb-1.5 block">Email</label>
              <input className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" placeholder="seu@email.com" />
            </div>
            <div>
              <label className="text-[hsl(var(--dash-text-secondary))] text-xs font-medium mb-1.5 block">Bio</label>
              <input className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" placeholder="Sua descrição" />
            </div>
          </div>
          <button className="btn-primary-gradient px-6 py-2.5 rounded-xl text-sm font-semibold">Salvar alterações</button>
        </div>
      )}

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
            <input className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" placeholder="meusite.com.br" />
          </div>
          <div className="flex items-center gap-2 p-4 rounded-xl bg-amber-50 border border-amber-100">
            <Shield size={16} className="text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700">SSL automático incluso. Configure o CNAME para ativar.</p>
          </div>
          <button className="btn-primary-gradient px-6 py-2.5 rounded-xl text-sm font-semibold">Conectar domínio</button>
        </div>
      )}

      {activeTab === "integracoes" && (
        <div className="space-y-2">
          {INTEGRATIONS.map(int => (
            <div key={int.name} className="glass-card-hover flex items-center gap-4 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center flex-shrink-0">
                <Link2 size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium">{int.name}</p>
                <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-0.5">{int.desc}</p>
              </div>
              <button className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                int.connected
                  ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                  : "bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text-secondary))] border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30"
              }`}>
                {int.connected ? "Conectado" : "Conectar"}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "notificacoes" && (
        <div className="glass-card rounded-2xl p-6 md:p-7 space-y-4">
          {[
            { label: "Nova venda", desc: "Receber notificação quando houver uma venda", enabled: true },
            { label: "Novo lead", desc: "Quando alguém se inscrever na sua lista", enabled: true },
            { label: "Visitas diárias", desc: "Resumo diário de visitas na página", enabled: false },
            { label: "Email semanal", desc: "Relatório semanal de performance", enabled: false },
          ].map(n => (
            <div key={n.label} className="flex items-center justify-between py-3 border-b border-[hsl(var(--dash-border-subtle))] last:border-0">
              <div>
                <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium">{n.label}</p>
                <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-0.5">{n.desc}</p>
              </div>
              <div className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${n.enabled ? "bg-primary" : "bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border))]"}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${n.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardConfiguracoes;
