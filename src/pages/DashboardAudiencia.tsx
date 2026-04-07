import {
  Users, Mail, Globe, TrendingUp,
  ArrowUpRight, Instagram, Twitter, MessageCircle,
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  source: string;
  date: string;
  type: "lead" | "cliente";
}

const SAMPLE_LEADS: Lead[] = [
  { id: "1", name: "Maria Silva", email: "maria@email.com", source: "Instagram", date: "Hoje", type: "cliente" },
  { id: "2", name: "João Santos", email: "joao@email.com", source: "Link direto", date: "Hoje", type: "lead" },
  { id: "3", name: "Ana Costa", email: "ana@email.com", source: "WhatsApp", date: "Ontem", type: "lead" },
  { id: "4", name: "Pedro Lima", email: "pedro@email.com", source: "Twitter", date: "2 dias", type: "cliente" },
  { id: "5", name: "Carla Mendes", email: "carla@email.com", source: "Instagram", date: "3 dias", type: "lead" },
];

const STATS = [
  { label: "Total de leads", value: "127", change: "+18%", icon: Mail, accent: "emerald" },
  { label: "Clientes", value: "34", change: "+8%", icon: Users, accent: "blue" },
  { label: "Taxa de conversão", value: "26,8%", change: "+2,3%", icon: TrendingUp, accent: "amber" },
  { label: "Visitas únicas", value: "482", change: "+24%", icon: Globe, accent: "purple" },
];

const accentMap: Record<string, { icon: string; bg: string; ring: string }> = {
  emerald: { icon: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-100" },
  blue: { icon: "text-blue-600", bg: "bg-blue-50", ring: "ring-blue-100" },
  amber: { icon: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-100" },
  purple: { icon: "text-primary", bg: "bg-[hsl(var(--dash-accent))]", ring: "ring-primary/10" },
};

const SOURCES = [
  { name: "Instagram", icon: Instagram, pct: 42, color: "bg-pink-500" },
  { name: "Link direto", icon: Globe, pct: 28, color: "bg-primary" },
  { name: "WhatsApp", icon: MessageCircle, pct: 18, color: "bg-emerald-500" },
  { name: "Twitter", icon: Twitter, pct: 12, color: "bg-sky-500" },
];

const DashboardAudiencia = () => (
  <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8">
    <div className="space-y-1.5">
      <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">Audiência</h1>
      <p className="text-[hsl(var(--dash-text-muted))] text-[15px]">Entenda de onde vêm seus visitantes e leads</p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {STATS.map(({ label, value, change, icon: Icon, accent }) => {
        const a = accentMap[accent];
        return (
          <div key={label} className="glass-card-hover rounded-2xl p-5 md:p-6">
            <div className={`w-10 h-10 rounded-xl ${a.bg} ring-1 ${a.ring} flex items-center justify-center mb-4`}>
              <Icon size={18} className={a.icon} />
            </div>
            <p className="text-[26px] font-bold text-[hsl(var(--dash-text))] tracking-tight leading-none">{value}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <p className="text-[13px] text-[hsl(var(--dash-text-muted))]">{label}</p>
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight size={11} /> {change}
              </span>
            </div>
          </div>
        );
      })}
    </div>

    <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
      {/* Traffic sources */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[15px] mb-5">Origem do tráfego</h2>
        <div className="space-y-4">
          {SOURCES.map(({ name, icon: Icon, pct, color }) => (
            <div key={name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Icon size={15} className="text-[hsl(var(--dash-text-muted))]" />
                  <span className="text-[13px] text-[hsl(var(--dash-text-secondary))] font-medium">{name}</span>
                </div>
                <span className="text-[13px] text-[hsl(var(--dash-text))] font-semibold tabular-nums">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-[hsl(var(--dash-surface-2))] overflow-hidden">
                <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent leads */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[hsl(var(--dash-border-subtle))]">
          <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[15px]">Leads recentes</h2>
        </div>
        <div className="divide-y divide-[hsl(var(--dash-border-subtle))]">
          {SAMPLE_LEADS.map(lead => (
            <div key={lead.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[hsl(var(--dash-surface-2))]/50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {lead.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium truncate">{lead.name}</p>
                <p className="text-[hsl(var(--dash-text-subtle))] text-xs truncate">{lead.email}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                lead.type === "cliente"
                  ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                  : "bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text-subtle))] ring-1 ring-[hsl(var(--dash-border-subtle))]"
              }`}>
                {lead.type === "cliente" ? "Cliente" : "Lead"}
              </span>
              <span className="text-xs text-[hsl(var(--dash-text-subtle))] flex-shrink-0">{lead.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default DashboardAudiencia;
