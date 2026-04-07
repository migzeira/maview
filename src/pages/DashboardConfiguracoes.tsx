import { Settings } from "lucide-react";

const DashboardConfiguracoes = () => (
  <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-white">Configurações</h1>
      <p className="text-[#A78BFA]/50 text-sm mt-1">Gerencie sua conta e preferências</p>
    </div>
    <div className="text-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-[#6D28D9]/10 flex items-center justify-center mx-auto mb-4">
        <Settings size={28} className="text-[#A78BFA]/30" />
      </div>
      <p className="text-white/60 text-sm mb-1">Em breve</p>
      <p className="text-[#A78BFA]/30 text-xs">As configurações da sua conta estarão disponíveis aqui</p>
    </div>
  </div>
);

export default DashboardConfiguracoes;
