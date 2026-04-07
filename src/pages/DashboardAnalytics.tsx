import { BarChart3, TrendingUp, MousePointer, DollarSign, Eye } from "lucide-react";
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
    <div className="bg-[#1A1333] border border-white/[0.08] rounded-xl px-4 py-3 shadow-xl">
      <p className="text-[#A78BFA]/50 text-xs mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-white text-sm font-medium">
          {p.dataKey === "receita" ? `R$ ${p.value}` : `${p.value} cliques`}
        </p>
      ))}
    </div>
  );
};

const DashboardAnalytics = () => (
  <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
    <div>
      <h1 className="text-2xl font-bold text-white">Analytics</h1>
      <p className="text-[#A78BFA]/50 text-sm mt-1">Acompanhe o desempenho da sua página</p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map(({ label, value, icon: Icon, change }) => (
        <div key={label} className="rounded-2xl border border-white/[0.06] bg-[#1A1333] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center text-[#A78BFA]">
              <Icon size={18} />
            </div>
            <span className="text-xs text-emerald-400 font-medium">{change}</span>
          </div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-[#A78BFA]/40 mt-0.5">{label}</p>
        </div>
      ))}
    </div>

    <div className="grid lg:grid-cols-5 gap-6">
      {/* Chart */}
      <div className="lg:col-span-3 rounded-2xl border border-white/[0.06] bg-[#1A1333] p-6">
        <h3 className="text-white font-semibold mb-6">Receita e cliques</h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CHART_DATA}>
              <defs>
                <linearGradient id="gReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6D28D9" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6D28D9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gCliques" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#A78BFA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(167,139,250,0.06)" />
              <XAxis dataKey="name" stroke="rgba(167,139,250,0.3)" tick={{ fontSize: 12 }} />
              <YAxis stroke="rgba(167,139,250,0.3)" tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="receita" stroke="#6D28D9" fill="url(#gReceita)" strokeWidth={2} />
              <Area type="monotone" dataKey="cliques" stroke="#A78BFA" fill="url(#gCliques)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top blocks */}
      <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-[#1A1333] p-6">
        <h3 className="text-white font-semibold mb-5">Blocos mais clicados</h3>
        <div className="space-y-4">
          {TOP_BLOCKS.map(({ name, clicks, pct }) => (
            <div key={name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-white text-sm truncate">{name}</span>
                <span className="text-[#A78BFA]/50 text-xs">{clicks} cliques</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6D28D9] to-[#A78BFA]"
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
