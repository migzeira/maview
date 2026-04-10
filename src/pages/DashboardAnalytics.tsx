import { useEffect, useState, useMemo } from "react";
import { Eye, MousePointer, TrendingUp, Smartphone, Monitor, Globe, ArrowUpRight, ArrowDownRight, Minus, Calendar } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import { supabase } from "@/integrations/supabase/client";

/* ── Types ──────────────────────────────────────── */
interface EventRow {
  event_type: string;
  created_at: string;
  referrer: string | null;
  device: string | null;
  metadata: Record<string, unknown> | null;
}

type Period = "7d" | "30d" | "90d";

/* ── Helpers ────────────────────────────────────── */
function daysAgo(d: number) {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  return dt.toISOString();
}

function shortDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function pctChange(curr: number, prev: number): { label: string; positive: boolean | null } {
  if (prev === 0 && curr === 0) return { label: "—", positive: null };
  if (prev === 0) return { label: "+∞", positive: true };
  const pct = Math.round(((curr - prev) / prev) * 100);
  return { label: `${pct >= 0 ? "+" : ""}${pct}%`, positive: pct >= 0 };
}

/* ── Custom Tooltip ─────────────────────────────── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card rounded-xl px-4 py-3 shadow-lg">
      <p className="text-[hsl(var(--dash-text-subtle))] text-xs mb-1.5 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-[hsl(var(--dash-text))] text-sm font-semibold">
          {p.dataKey === "views" ? `${p.value} views` : `${p.value} cliques`}
        </p>
      ))}
    </div>
  );
};

/* ══ COMPONENT ════════════════════════════════════ */
const DashboardAnalytics = () => {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("7d");
  const [vitrineId, setVitrineId] = useState<string | null>(null);

  /* ── Fetch vitrine_id for current user ── */
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data } = await supabase
        .from("vitrines")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (data) setVitrineId(data.id);
    })();
  }, []);

  /* ���─ Fetch events ── */
  useEffect(() => {
    if (!vitrineId) { setLoading(false); return; }

    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select("event_type, created_at, referrer, device, metadata")
        .eq("vitrine_id", vitrineId)
        .gte("created_at", daysAgo(days))
        .order("created_at", { ascending: true });

      if (!error && data) setEvents(data as EventRow[]);
      setLoading(false);
    })();
  }, [vitrineId, period]);

  /* ── Derived metrics ── */
  const metrics = useMemo(() => {
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const halfDays = Math.floor(days / 2);
    const halfDate = daysAgo(halfDays);

    const views = events.filter(e => e.event_type === "view");
    const clicks = events.filter(e => ["click_link", "click_product", "click_whatsapp"].includes(e.event_type));

    const viewsCurr = views.filter(e => e.created_at >= halfDate).length;
    const viewsPrev = views.filter(e => e.created_at < halfDate).length;
    const clicksCurr = clicks.filter(e => e.created_at >= halfDate).length;
    const clicksPrev = clicks.filter(e => e.created_at < halfDate).length;
    const ctr = views.length > 0 ? ((clicks.length / views.length) * 100).toFixed(1) : "0";

    // Timeline chart data
    const dayMap = new Map<string, { views: number; clicks: number }>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dayMap.set(key, { views: 0, clicks: 0 });
    }
    events.forEach(e => {
      const key = e.created_at.slice(0, 10);
      const entry = dayMap.get(key);
      if (!entry) return;
      if (e.event_type === "view") entry.views++;
      else if (["click_link", "click_product", "click_whatsapp"].includes(e.event_type)) entry.clicks++;
    });
    const chartData = Array.from(dayMap.entries()).map(([date, d]) => ({
      name: shortDate(date),
      views: d.views,
      clicks: d.clicks,
    }));

    // Top referrers
    const refMap = new Map<string, number>();
    views.forEach(e => {
      let ref = "Direto";
      if (e.referrer) {
        try { ref = new URL(e.referrer).hostname.replace("www.", ""); } catch { ref = e.referrer; }
      }
      refMap.set(ref, (refMap.get(ref) || 0) + 1);
    });
    const topReferrers = Array.from(refMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count, pct: views.length > 0 ? Math.round((count / views.length) * 100) : 0 }));

    // Top clicked items
    const clickMap = new Map<string, number>();
    clicks.forEach(e => {
      const label = (e.metadata as any)?.link_title || (e.metadata as any)?.product_title || e.event_type.replace("click_", "");
      clickMap.set(label, (clickMap.get(label) || 0) + 1);
    });
    const topClicks = Array.from(clickMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count, pct: clicks.length > 0 ? Math.round((count / clicks.length) * 100) : 0 }));

    // Devices
    const mobile = views.filter(e => e.device === "mobile").length;
    const desktop = views.length - mobile;

    return {
      totalViews: views.length,
      totalClicks: clicks.length,
      ctr,
      viewsChange: pctChange(viewsCurr, viewsPrev),
      clicksChange: pctChange(clicksCurr, clicksPrev),
      chartData,
      topReferrers,
      topClicks,
      mobile,
      desktop,
    };
  }, [events, period]);

  /* ── Skeleton ── */
  const Skeleton = ({ className }: { className: string }) => (
    <div className={`skeleton ${className}`} />
  );

  const PERIODS: { id: Period; label: string }[] = [
    { id: "7d", label: "7 dias" },
    { id: "30d", label: "30 dias" },
    { id: "90d", label: "90 dias" },
  ];

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10 space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">Analytics</h1>
          <p className="text-[hsl(var(--dash-text-muted))] text-[14px]">Acompanhe o desempenho da sua vitrine</p>
        </div>
        {/* Period selector */}
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

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Visualizações", value: metrics.totalViews, icon: Eye, change: metrics.viewsChange, color: "text-violet-500", bg: "bg-violet-500/10" },
          { label: "Cliques", value: metrics.totalClicks, icon: MousePointer, change: metrics.clicksChange, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "CTR", value: `${metrics.ctr}%`, icon: TrendingUp, change: { label: "—", positive: null }, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Mobile", value: `${metrics.totalViews > 0 ? Math.round((metrics.mobile / metrics.totalViews) * 100) : 0}%`, icon: Smartphone, change: { label: "—", positive: null }, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map(({ label, value, icon: Icon, change, color, bg }) => (
          <div key={label} className="glass-card rounded-2xl p-5 card-hover">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="w-20 h-7" />
                <Skeleton className="w-16 h-4" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color}`}>
                    <Icon size={17} />
                  </div>
                  {change.positive !== null && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                      change.positive ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
                    }`}>
                      {change.positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                      {change.label}
                    </span>
                  )}
                </div>
                <p className="text-[26px] font-bold text-[hsl(var(--dash-text))] tracking-tight leading-none count-up">{value}</p>
                <p className="text-[13px] text-[hsl(var(--dash-text-muted))] mt-1">{label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Chart + Top items */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Chart */}
        <div className="lg:col-span-3 glass-card rounded-2xl p-6">
          <h3 className="text-[hsl(var(--dash-text))] font-semibold text-[15px] mb-6">Views e cliques</h3>
          {loading ? (
            <Skeleton className="w-full h-[280px]" />
          ) : metrics.chartData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center">
              <div className="text-center">
                <Calendar size={32} className="text-[hsl(var(--dash-text-subtle))] mx-auto mb-2" />
                <p className="text-[hsl(var(--dash-text-muted))] text-sm">Sem dados ainda</p>
                <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-1">Compartilhe sua vitrine para começar</p>
              </div>
            </div>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.chartData}>
                  <defs>
                    <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(263, 76%, 50%)" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="hsl(263, 76%, 50%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(220, 90%, 56%)" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="hsl(220, 90%, 56%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 15%, 93%)" />
                  <XAxis dataKey="name" stroke="hsl(260, 10%, 65%)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="hsl(260, 10%, 65%)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="views" stroke="hsl(263, 76%, 50%)" fill="url(#gViews)" strokeWidth={2} />
                  <Area type="monotone" dataKey="clicks" stroke="hsl(220, 90%, 56%)" fill="url(#gClicks)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top referrers */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <h3 className="text-[hsl(var(--dash-text))] font-semibold text-[15px] mb-5">De onde vêm seus visitantes</h3>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="w-full h-8" />)}
            </div>
          ) : metrics.topReferrers.length === 0 ? (
            <div className="py-8 text-center">
              <Globe size={28} className="text-[hsl(var(--dash-text-subtle))] mx-auto mb-2" />
              <p className="text-[hsl(var(--dash-text-muted))] text-sm">Sem dados ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {metrics.topReferrers.map(({ name, count, pct }, i) => (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs text-[hsl(var(--dash-text-subtle))] font-mono w-4">{i + 1}.</span>
                      <span className="text-[hsl(var(--dash-text))] text-[13px] font-medium truncate">{name}</span>
                    </div>
                    <span className="text-[hsl(var(--dash-text-muted))] text-xs tabular-nums">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1 rounded-full bg-[hsl(var(--dash-surface-2))] overflow-hidden ml-6">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: top clicked + devices */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top clicked */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-[hsl(var(--dash-text))] font-semibold text-[15px] mb-5">Itens mais clicados</h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="w-full h-8" />)}
            </div>
          ) : metrics.topClicks.length === 0 ? (
            <div className="py-6 text-center">
              <MousePointer size={28} className="text-[hsl(var(--dash-text-subtle))] mx-auto mb-2" />
              <p className="text-[hsl(var(--dash-text-muted))] text-sm">Nenhum clique registrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.topClicks.map(({ name, count, pct }, i) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-xs text-[hsl(var(--dash-text-subtle))] font-mono w-4">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[hsl(var(--dash-text))] text-[13px] font-medium truncate">{name}</span>
                      <span className="text-[hsl(var(--dash-text-muted))] text-xs tabular-nums ml-2">{count}</span>
                    </div>
                    <div className="h-1 rounded-full bg-[hsl(var(--dash-surface-2))] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-700"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Devices */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-[hsl(var(--dash-text))] font-semibold text-[15px] mb-5">Dispositivos</h3>
          {loading ? (
            <Skeleton className="w-full h-[140px]" />
          ) : metrics.totalViews === 0 ? (
            <div className="py-6 text-center">
              <Monitor size={28} className="text-[hsl(var(--dash-text-subtle))] mx-auto mb-2" />
              <p className="text-[hsl(var(--dash-text-muted))] text-sm">Sem dados ainda</p>
            </div>
          ) : (
            <div className="space-y-5">
              {[
                { label: "Mobile", count: metrics.mobile, icon: Smartphone, color: "from-violet-500 to-fuchsia-500" },
                { label: "Desktop", count: metrics.desktop, icon: Monitor, color: "from-blue-500 to-cyan-500" },
              ].map(({ label, count, icon: Icon, color }) => {
                const pct = Math.round((count / metrics.totalViews) * 100);
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className="text-[hsl(var(--dash-text-muted))]" />
                        <span className="text-[hsl(var(--dash-text))] text-[13px] font-medium">{label}</span>
                      </div>
                      <span className="text-[hsl(var(--dash-text-muted))] text-sm tabular-nums font-semibold">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[hsl(var(--dash-surface-2))] overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--dash-border-subtle))]">
                <span className="text-[hsl(var(--dash-text-subtle))] text-xs">Total de visitantes</span>
                <span className="text-[hsl(var(--dash-text))] text-sm font-bold">{metrics.totalViews}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
