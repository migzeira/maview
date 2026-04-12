import { useState, useEffect, useMemo } from "react";
import {
  DollarSign, TrendingUp, ShoppingCart, Package,
  Filter, Download, CreditCard, Calendar,
} from "lucide-react";
import { fetchOrders, type Order } from "@/lib/vitrine-sync";

type StatusFilter = "todas" | "approved" | "pending" | "rejected";
type PeriodFilter = "7d" | "30d" | "90d";

const STATUS_LABEL: Record<string, string> = {
  approved: "Aprovado",
  pending: "Pendente",
  rejected: "Rejeitado",
};

const STATUS_STYLE: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
  pending: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
  rejected: "bg-red-50 text-red-500 ring-1 ring-red-100",
};

const METHOD_LABEL: Record<string, string> = {
  pix: "PIX",
  credit_card: "Cartão",
  boleto: "Boleto",
};

const PERIOD_LABEL: Record<PeriodFilter, string> = {
  "7d": "7 dias",
  "30d": "30 dias",
  "90d": "90 dias",
};

const PERIOD_MS: Record<PeriodFilter, number> = {
  "7d": 7 * 86400000,
  "30d": 30 * 86400000,
  "90d": 90 * 86400000,
};

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Agora";
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "Ontem" : `${days}d atrás`;
}

const DashboardVendas = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todas");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("30d");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const data = await fetchOrders();
    setOrders(data);
    setLoading(false);
  }

  // Derived data
  const periodOrders = useMemo(() => {
    const cutoff = Date.now() - PERIOD_MS[periodFilter];
    return orders.filter(o => new Date(o.created_at).getTime() >= cutoff);
  }, [orders, periodFilter]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "todas") return periodOrders;
    return periodOrders.filter(o => o.payment_status === statusFilter);
  }, [periodOrders, statusFilter]);

  const approved = useMemo(() => orders.filter(o => o.payment_status === "approved"), [orders]);
  const totalReceita = useMemo(() => approved.reduce((s, o) => s + o.amount, 0), [approved]);
  const ticketMedio = approved.length > 0 ? totalReceita / approved.length : 0;
  const last7 = useMemo(() => {
    const cutoff = Date.now() - 7 * 86400000;
    return approved.filter(o => new Date(o.created_at).getTime() >= cutoff).length;
  }, [approved]);

  const stats = [
    { label: "Total vendas", value: approved.length, icon: ShoppingCart, color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-100" },
    { label: "Receita total", value: formatBRL(totalReceita), icon: DollarSign, color: "text-primary", bg: "bg-[hsl(var(--dash-accent))]", ring: "ring-primary/10" },
    { label: "Ticket médio", value: formatBRL(ticketMedio), icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-100" },
    { label: "Últimos 7 dias", value: last7, icon: Package, color: "text-blue-600", bg: "bg-blue-50", ring: "ring-blue-100" },
  ];

  const handleExportCSV = () => {
    if (!filteredOrders.length) return;
    const csv = "Produto,Valor,Status,Método,Comprador,Email,Data\n" + filteredOrders.map(o =>
      `"${o.product_title}",${(o.amount / 100).toFixed(2)},${STATUS_LABEL[o.payment_status] || o.payment_status},${METHOD_LABEL[o.payment_method || ""] || o.payment_method || ""},${o.buyer_name || ""},${o.buyer_email || ""},${new Date(o.created_at).toLocaleDateString("pt-BR")}`
    ).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `maview-vendas-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">Vendas</h1>
          <p className="text-[hsl(var(--dash-text-muted))] text-[15px]">Acompanhe suas receitas e pedidos</p>
        </div>
        {filteredOrders.length > 0 && (
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 text-[13px] text-[hsl(var(--dash-text-secondary))] font-medium transition-all">
            <Download size={14} /> Exportar CSV
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, ring }) => (
          <div key={label} className={`glass-card-hover rounded-2xl p-5 md:p-6 ${loading ? "animate-pulse" : ""}`}>
            <div className={`w-10 h-10 rounded-xl ${bg} ring-1 ${ring} flex items-center justify-center mb-4`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-[26px] font-bold text-[hsl(var(--dash-text))] tracking-tight leading-none">{loading ? "—" : value}</p>
            <p className="text-[13px] text-[hsl(var(--dash-text-muted))] mt-1.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Orders table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 border-b border-[hsl(var(--dash-border-subtle))]">
          <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[15px]">Pedidos recentes</h2>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Period filter */}
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-[hsl(var(--dash-text-subtle))]" />
              {(Object.keys(PERIOD_LABEL) as PeriodFilter[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriodFilter(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    periodFilter === p
                      ? "bg-[hsl(var(--dash-accent))] text-primary"
                      : "text-[hsl(var(--dash-text-subtle))] hover:bg-[hsl(var(--dash-surface-2))]"
                  }`}
                >
                  {PERIOD_LABEL[p]}
                </button>
              ))}
            </div>
            {/* Status filter */}
            <div className="flex items-center gap-1.5">
              <Filter size={13} className="text-[hsl(var(--dash-text-subtle))]" />
              {(["todas", "approved", "pending", "rejected"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === f
                      ? "bg-[hsl(var(--dash-accent))] text-primary"
                      : "text-[hsl(var(--dash-text-subtle))] hover:bg-[hsl(var(--dash-surface-2))]"
                  }`}
                >
                  {f === "todas" ? "Todas" : STATUS_LABEL[f]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 && !loading ? (
          <div className="p-12 text-center">
            <ShoppingCart size={36} className="mx-auto mb-3 text-primary/20" />
            <p className="text-[hsl(var(--dash-text-subtle))] text-sm font-medium">Nenhuma venda ainda</p>
            <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-1">Suas vendas aparecerão aqui quando começarem a chegar</p>
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--dash-border-subtle))]">
            {filteredOrders.map(order => (
              <div key={order.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[hsl(var(--dash-surface-2))]/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center flex-shrink-0">
                  <CreditCard size={15} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium truncate">{order.product_title}</p>
                  <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-0.5">
                    {order.buyer_name || order.buyer_email || "—"} · {METHOD_LABEL[order.payment_method || ""] || order.payment_method || "—"}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[hsl(var(--dash-text))] text-sm font-semibold tabular-nums">{formatBRL(order.amount)}</p>
                  <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-0.5">{timeAgo(order.created_at)}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_STYLE[order.payment_status] || "bg-gray-50 text-gray-500 ring-1 ring-gray-100"}`}>
                  {STATUS_LABEL[order.payment_status] || order.payment_status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardVendas;
