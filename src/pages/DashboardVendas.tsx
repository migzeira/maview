import { useState } from "react";
import {
  DollarSign, TrendingUp, ShoppingCart, Package,
  ArrowUpRight, ArrowDownRight, Filter, Download,
  Calendar, CreditCard,
} from "lucide-react";

interface Order {
  id: string;
  product: string;
  customer: string;
  email: string;
  amount: string;
  status: "pago" | "pendente" | "reembolsado";
  date: string;
  method: string;
}

const SAMPLE_ORDERS: Order[] = [
  { id: "MV-001", product: "Ebook: Guia do Criador", customer: "Maria Silva", email: "maria@email.com", amount: "R$ 29,90", status: "pago", date: "Hoje, 14:32", method: "Pix" },
  { id: "MV-002", product: "Template Notion", customer: "João Santos", email: "joao@email.com", amount: "R$ 19,90", status: "pago", date: "Hoje, 11:05", method: "Cartão" },
  { id: "MV-003", product: "Curso Instagram Pro", customer: "Ana Costa", email: "ana@email.com", amount: "R$ 97,00", status: "pendente", date: "Ontem, 20:18", method: "Pix" },
  { id: "MV-004", product: "Ebook: Guia do Criador", customer: "Pedro Lima", email: "pedro@email.com", amount: "R$ 29,90", status: "reembolsado", date: "2 dias atrás", method: "Cartão" },
];

const STATS = [
  { label: "Receita total", value: "R$ 1.247,00", change: "+12%", up: true, icon: DollarSign, accent: "emerald" },
  { label: "Vendas do mês", value: "34", change: "+8%", up: true, icon: ShoppingCart, accent: "blue" },
  { label: "Ticket médio", value: "R$ 36,67", change: "+3%", up: true, icon: TrendingUp, accent: "amber" },
  { label: "Pedidos pendentes", value: "2", change: "", up: false, icon: Package, accent: "purple" },
];

const accentMap: Record<string, { icon: string; bg: string; ring: string }> = {
  emerald: { icon: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-100" },
  blue: { icon: "text-blue-600", bg: "bg-blue-50", ring: "ring-blue-100" },
  amber: { icon: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-100" },
  purple: { icon: "text-primary", bg: "bg-[hsl(var(--dash-accent))]", ring: "ring-primary/10" },
};

const statusStyles: Record<string, string> = {
  pago: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
  pendente: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
  reembolsado: "bg-red-50 text-red-500 ring-1 ring-red-100",
};

const DashboardVendas = () => {
  const [filter, setFilter] = useState<"todas" | "pago" | "pendente" | "reembolsado">("todas");
  const filtered = filter === "todas" ? SAMPLE_ORDERS : SAMPLE_ORDERS.filter(o => o.status === filter);

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">Vendas</h1>
          <p className="text-[hsl(var(--dash-text-muted))] text-[15px]">Acompanhe suas receitas e pedidos</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 text-[13px] text-[hsl(var(--dash-text-secondary))] font-medium transition-all">
          <Download size={14} /> Exportar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {STATS.map(({ label, value, change, up, icon: Icon, accent }) => {
          const a = accentMap[accent];
          return (
            <div key={label} className="glass-card-hover rounded-2xl p-5 md:p-6">
              <div className={`w-10 h-10 rounded-xl ${a.bg} ring-1 ${a.ring} flex items-center justify-center mb-4`}>
                <Icon size={18} className={a.icon} />
              </div>
              <p className="text-[26px] font-bold text-[hsl(var(--dash-text))] tracking-tight leading-none">{value}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <p className="text-[13px] text-[hsl(var(--dash-text-muted))]">{label}</p>
                {change && (
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${up ? "text-emerald-600" : "text-red-500"}`}>
                    {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />} {change}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue chart placeholder */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[15px]">Receita mensal</h2>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--dash-surface-2))] text-xs text-[hsl(var(--dash-text-muted))] font-medium">
              <Calendar size={12} /> Últimos 30 dias
            </button>
          </div>
        </div>
        <div className="h-48 flex items-center justify-center rounded-xl bg-[hsl(var(--dash-surface-2))] border border-dashed border-[hsl(var(--dash-border))]">
          <div className="text-center">
            <TrendingUp size={32} className="mx-auto mb-2 text-primary/20" />
            <p className="text-[hsl(var(--dash-text-subtle))] text-sm">Gráfico de receita disponível em breve</p>
          </div>
        </div>
      </div>

      {/* Orders table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--dash-border-subtle))]">
          <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[15px]">Pedidos recentes</h2>
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-[hsl(var(--dash-text-subtle))]" />
            {(["todas", "pago", "pendente", "reembolsado"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f
                    ? "bg-[hsl(var(--dash-accent))] text-primary"
                    : "text-[hsl(var(--dash-text-subtle))] hover:bg-[hsl(var(--dash-surface-2))]"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-[hsl(var(--dash-border-subtle))]">
          {filtered.map(order => (
            <div key={order.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[hsl(var(--dash-surface-2))]/50 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center flex-shrink-0">
                <CreditCard size={15} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium truncate">{order.product}</p>
                <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-0.5">{order.customer} · {order.method}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[hsl(var(--dash-text))] text-sm font-semibold tabular-nums">{order.amount}</p>
                <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-0.5">{order.date}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${statusStyles[order.status]}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardVendas;
