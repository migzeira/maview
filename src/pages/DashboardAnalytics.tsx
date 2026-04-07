import { Eye, MousePointer, TrendingUp, DollarSign } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const CHART_DATA = [
  { name: "Seg", receita: 0, cliques: 12 },
  { name: "Ter", receita: 29, cliques: 18 },
  { name: "Qua", receita: 0, cliques: 24 },
  { name: "Qui", receita: 59, cliques: 31 },
  { name: "Sex", receita: 29, cliques: 45 },
  { name: "Sáb", receita: 97, cliques: 38 },
  { name: "Dom", receita: 0, cliques: 22 },
];

const STATS = [
  { label: "Visualizações", value: "190", icon: Eye, change: "+12%" },
  { label: "Cliques", value: "190", icon: MousePointer, change: "+8%" },
  { label: "Conversão", value: "3.2%", icon: TrendingUp, change: "+0.5%" },
  { label: "Receita", value: "R$ 214", icon: DollarSign, change: "+34%" },
];

const TOP_BLOCKS = [
  { name: "Meu Instagram", clicks: 67, pct: 35 },
  { name: "Ebook: Guia do Criador", clicks: 45, pct: 24 },
  { name: "YouTube", clicks: 38, pct: 20 },
  { name: "WhatsApp", clicks: 25, pct: 13 },
  { name: "Vídeo de apresentação", clicks: 15, pct: 8 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card rounded-xl px-4 py-3 shadow-lg">
      <p className="text-[hsl(var(--dash-text-subtle))] text-xs mb-1.5 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-[hsl(var(--dash-text))] text-sm font-semibold">
          {p.dataKey === "receita" ? `R$ ${p.value}` : `${p.value} cliques`}
        </p>
      ))}
    </div>
  );
};

const DashboardAnalytics = () => (
  <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10 space-y-10">
    <div className="space-y-1.5">
      <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">Analytics</h1>
      <p className="text-[hsl(var(--dash-text-muted))] text-[15px]">Acompanhe o desempenho da sua página</p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {STATS.map(({ label, value, icon: Icon, change }) => (
        <div key={label} className="glass-card-hover rounded-2xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center text-primary">
              <Icon size={17} />
            </div>
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-100">{change}</span>
          </div>
          <p className="text-[26px] font-bold text-[hsl(var(--dash-text))] tracking-tight leading-none">{value}</p>
          <p className="text-[13px] text-[hsl(var(--dash-text-muted))] mt-1.5">{label}</p>
        </div>
      ))}
    </div>

    <div className="grid lg:grid-cols-5 gap-4 md:gap-6">
      {/* Chart */}
      <div className="lg:col-span-3 glass-card rounded-2xl p-6 md:p-7">
        <h3 className="text-[hsl(var(--dash-text))] font-semibold text-[15px] mb-7">Receita e cliques</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CHART_DATA}>
              <defs>
                <linearGradient id="gReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(263, 76%, 50%)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(263, 76%, 50%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gCliques" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(258, 90%, 66%)" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="hsl(258, 90%, 66%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 15%, 93%)" />
              <XAxis dataKey="name" stroke="hsl(260, 10%, 65%)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke="hsl(260, 10%, 65%)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="receita" stroke="hsl(263, 76%, 50%)" fill="url(#gReceita)" strokeWidth={2} />
              <Area type="monotone" dataKey="cliques" stroke="hsl(258, 90%, 66%)" fill="url(#gCliques)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top blocks */}
      <div className="lg:col-span-2 glass-card rounded-2xl p-6 md:p-7">
        <h3 className="text-[hsl(var(--dash-text))] font-semibold text-[15px] mb-6">Blocos mais clicados</h3>
        <div className="space-y-5">
          {TOP_BLOCKS.map(({ name, clicks, pct }, i) => (
            <div key={name}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-[hsl(var(--dash-text-subtle))] font-mono w-4">{i + 1}.</span>
                  <span className="text-[hsl(var(--dash-text))] text-[13px] font-medium truncate">{name}</span>
                </div>
                <span className="text-[hsl(var(--dash-text-muted))] text-xs tabular-nums">{clicks}</span>
              </div>
              <div className="h-1 rounded-full bg-[hsl(var(--dash-surface-2))] overflow-hidden ml-6">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default DashboardAnalytics;
