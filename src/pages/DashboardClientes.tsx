import { Users, Mail } from "lucide-react";

const DashboardClientes = () => (
  <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-white">Clientes</h1>
      <p className="text-[#A78BFA]/50 text-sm mt-1">Gerencie sua base de clientes e leads</p>
    </div>
    <div className="text-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-[#6D28D9]/10 flex items-center justify-center mx-auto mb-4">
        <Users size={28} className="text-[#A78BFA]/30" />
      </div>
      <p className="text-white/60 text-sm mb-1">Nenhum cliente ainda</p>
      <p className="text-[#A78BFA]/30 text-xs">Seus leads e compradores aparecerão aqui</p>
    </div>
  </div>
);

export default DashboardClientes;
