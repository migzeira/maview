import { Layout } from "lucide-react";

const DashboardPagina = () => (
  <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10">
    <div className="space-y-1.5 mb-8">
      <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">Minha Página</h1>
      <p className="text-[hsl(var(--dash-text-muted))] text-[15px]">Personalize sua vitrine digital</p>
    </div>
    <div className="glass-card rounded-2xl text-center py-20">
      <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center mx-auto mb-4">
        <Layout size={24} className="text-primary/40" />
      </div>
      <p className="text-[hsl(var(--dash-text-secondary))] text-sm mb-1">Editor de página em breve</p>
      <p className="text-[hsl(var(--dash-text-subtle))] text-xs">Personalize cores, fontes e layout da sua página</p>
    </div>
  </div>
);

export default DashboardPagina;
