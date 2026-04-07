import { Settings } from "lucide-react";

const DashboardConfiguracoes = () => (
  <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10">
    <div className="space-y-1.5 mb-8">
      <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">Configurações</h1>
      <p className="text-[hsl(var(--dash-text-muted))] text-[15px]">Gerencie sua conta e preferências</p>
    </div>
    <div className="glass-card rounded-2xl text-center py-20">
      <div className="w-14 h-14 rounded-2xl bg-primary/[0.08] ring-1 ring-primary/20 flex items-center justify-center mx-auto mb-4">
        <Settings size={24} className="text-[hsl(var(--dash-text-subtle))]" />
      </div>
      <p className="text-[hsl(var(--dash-text))]/60 text-sm mb-1">Em breve</p>
      <p className="text-[hsl(var(--dash-text-subtle))] text-xs">As configurações da sua conta estarão disponíveis aqui</p>
    </div>
  </div>
);

export default DashboardConfiguracoes;
