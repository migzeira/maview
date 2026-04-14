import { useState, useEffect, useMemo } from "react";
import { DollarSign, ShoppingBag, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import DashboardProdutos from "./DashboardProdutos";
import DashboardVendas from "./DashboardVendas";
import { fetchOrders, type Order } from "@/lib/vitrine-sync";

const TABS = [
  { id: "produtos", label: "Produtos", icon: ShoppingBag },
  { id: "vendas", label: "Pedidos / Vendas", icon: DollarSign },
  { id: "receita", label: "Receita", icon: TrendingUp },
] as const;

type TabId = (typeof TABS)[number]["id"];

const DashboardMonetizacao = () => {
  const [activeTab, setActiveTab] = useState<TabId>("produtos");

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10 space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">
          Monetizacao
        </h1>
        <p className="text-[hsl(var(--dash-text-muted))] text-[15px]">
          Gerencie seus produtos, vendas e receita em um so lugar
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))] w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all
              ${activeTab === id
                ? "bg-[hsl(var(--dash-accent))] text-primary shadow-sm"
                : "text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text-secondary))] hover:bg-[hsl(var(--dash-surface-2))]"
              }
            `}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="-mx-4 md:-mx-8 -mb-8 md:-mb-10">
        {activeTab === "produtos" && <DashboardProdutos />}
        {activeTab === "vendas" && <DashboardVendas />}
        {activeTab === "receita" && <ReceitaContent />}
      </div>
    </div>
  );
};

/* ══ RECEITA CONTENT — Real revenue dashboard ══════════════════ */

type Period = "7d" | "30d" | "90d";

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card rounded-xl px-4 py-3 shadow-lg">
      <p className="text-[hsl(var(--dash-text-subtle))] text-xs mb-1.5 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-[hsl(var(--dash-text))] text-sm font-semibold">
          {formatBRL(p.value)}
        </p>
      ))}
    </div>
  );
};

const Skeleton = ({ className }: { className: string }) => (
  <div className={`skeleton ${className}`} />
);

const ReceitaContent = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("30d");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data);
      setLoading(false);
    })();
  }, []);

  const metrics = useMemo(() => {
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const cutoff = Date.now() - days * 86400000;
    const halfCutoff = Date.now() - Math.floor(days / 2) * 86400000;

    const approved = orders.filter(o => o.payment_status === "approved");
    const periodOrders = approved.filter(o => new Date(o.created_at).getTime() >= cutoff);
    const totalRevenue = approved.reduce((s, o) => s + o.amount, 0);
    const periodRevenue = periodOrders.reduce((s, o) => s + o.amount, 0);

    // Period comparison (current half vs previous half)
    const currHalf = periodOrders.filter(o => new Date(o.created_at).getTime() >= halfCutoff);
    const prevHalf = periodOrders.filter(o => new Date(o.created_at).getTime() < halfCutoff);
    const currRev = currHalf.reduce((s, o) => s + o.amount, 0);
    const prevRev = prevHalf.reduce((s, o) => s + o.amount, 0);
    let change = "—";
    let positive: boolean | null = null;
    if (prevRev > 0) {
      const pct = Math.round(((currRev - prevRev) / prevRev) * 100);
      change = `${pct >= 0 ? "+" : ""}${pct}%`;
      positive = pct >= 0;
    } else if (currRev > 0) {
      change = "+∞";
      positive = true;
    }

    // Daily average for projection
    const daysWithData = Math.max(1, Math.ceil((Date.now() - Math.min(...approved.map(o => new Date(o.created_at).getTime()), Date.now())) / 86400000));
    const dailyAvg = totalRevenue / daysWithData;
    const projection = dailyAvg * 30;

    // Ticket medio
    const ticket = approved.length > 0 ? totalRevenue / approved.length : 0;

    // Timeline chart data (daily revenue)
    const dayMap = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dayMap.set(d.toISOString().slice(0, 10), 0);
    }
    periodOrders.forEach(o => {
      const key = o.created_at.slice(0, 10);
      if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) || 0) + o.amount);
    });
    const chartData = Array.from(dayMap.entries()).map(([date, amount]) => ({
      name: shortDate(date),
      receita: amount,
    }));

    // Revenue by product
    const productMap = new Map<string, number>();
    periodOrders.forEach(o => {
      productMap.set(o.product_title, (productMap.get(o.product_title) || 0) + o.amount);
    });
    const productData = Array.from(productMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, amount]) => ({ name: name.length > 20 ? name.slice(0, 20) + "..." : name, receita: amount }));

    return { totalRevenue, periodRevenue, projection, ticket, change, positive, chartData, productData, periodOrders };
  }, [orders, period]);

  const PERIODS: { id: Period; label: string }[] = [
    { id: "7d", label: "7 dias" },
    { id: "30d", label: "30 dias" },
    { id: "90d", label: "90 dias" },
  ];

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-1 p-1 glass-card rounded-xl">
          {PERIODS.map(p => (
            <button key={p.id} onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                period === p.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))]"
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Receita total", value: formatBRL(metrics.totalRevenue), icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", showChange: false },
          { label: `Receita (${period})`, value: formatBRL(metrics.periodRevenue), icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-500/10", showChange: true },
          { label: "Projecao mensal", value: formatBRL(metrics.projection), icon: ArrowUpRight, color: "text-blue-500", bg: "bg-blue-500/10", showChange: false },
          { label: "Ticket medio", value: formatBRL(metrics.ticket), icon: ShoppingBag, color: "text-amber-500", bg: "bg-amber-500/10", showChange: false },
        ].map(({ label, value, icon: Icon, color, bg, showChange }) => (
          <div key={label} className="glass-card rounded-2xl p-5 card-hover">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="w-24 h-7" />
                <Skeleton className="w-16 h-4" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color}`}>
                    <Icon size={17} />
                  </div>
                  {showChange && metrics.positive !== null && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                      metrics.positive ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
                    }`}>
                      {metrics.positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                      {metrics.change}
                    </span>
                  )}
                </div>
                <p className="text-[22px] md:text-[26px] font-bold text-[hsl(var(--dash-text))] tracking-tight leading-none">{value}</p>
                <p className="text-[13px] text-[hsl(var(--dash-text-muted))] mt-1">{label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Revenue timeline */}
        <div className="lg:col-span-3 glass-card rounded-2xl p-6">
          <h3 className="text-[hsl(var(--dash-text))] font-semibold text-[15px] mb-6">Receita ao longo do tempo</h3>
          {loading ? (
            <Skeleton className="w-full h-[280px]" />
          ) : metrics.periodOrders.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center">
              <div className="text-center">
                <Calendar size={32} className="text-[hsl(var(--dash-text-subtle))] mx-auto mb-2" />
                <p className="text-[hsl(var(--dash-text-muted))] text-sm">Sem vendas neste periodo</p>
                <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-1">Suas receitas aparecerão aqui</p>
              </div>
            </div>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.chartData}>
                  <defs>
                    <linearGradient id="gReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 15%, 93%)" />
                  <XAxis dataKey="name" stroke="hsl(260, 10%, 65%)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="hsl(260, 10%, 65%)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 100).toFixed(0)}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="receita" stroke="hsl(160, 84%, 39%)" fill="url(#gReceita)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Revenue by product */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <h3 className="text-[hsl(var(--dash-text))] font-semibold text-[15px] mb-5">Receita por produto</h3>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="w-full h-8" />)}
            </div>
          ) : metrics.productData.length === 0 ? (
            <div className="py-8 text-center">
              <ShoppingBag size={28} className="text-[hsl(var(--dash-text-subtle))] mx-auto mb-2" />
              <p className="text-[hsl(var(--dash-text-muted))] text-sm">Sem vendas ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {metrics.productData.map(({ name, receita }, i) => {
                const maxAmount = metrics.productData[0]?.receita || 1;
                const pct = Math.round((receita / maxAmount) * 100);
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs text-[hsl(var(--dash-text-subtle))] font-mono w-4">{i + 1}.</span>
                        <span className="text-[hsl(var(--dash-text))] text-[13px] font-medium truncate">{name}</span>
                      </div>
                      <span className="text-[hsl(var(--dash-text-muted))] text-xs tabular-nums">{formatBRL(receita)}</span>
                    </div>
                    <div className="h-1 rounded-full bg-[hsl(var(--dash-surface-2))] overflow-hidden ml-6">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardMonetizacao;
