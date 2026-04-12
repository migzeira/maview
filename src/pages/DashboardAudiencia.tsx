import { useState, useEffect } from "react";
import { Users, Mail, Globe, TrendingUp, ArrowUpRight, Download } from "lucide-react";
import { fetchLeads } from "@/lib/vitrine-sync";
import { supabase } from "@/integrations/supabase/client";

interface Lead {
  id: string; email: string; name: string | null; source: string; created_at: string;
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

const DashboardAudiencia = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalViews, setTotalViews] = useState(0);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const leadsData = await fetchLeads();
    setLeads(leadsData);
    // Get view count
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: v } = await supabase.from("vitrines").select("id").eq("user_id", session.user.id).maybeSingle();
      if (v) {
        const { count } = await supabase.from("events").select("*", { count: "exact", head: true }).eq("vitrine_id", v.id).eq("event_type", "view");
        setTotalViews(count || 0);
      }
    }
    setLoading(false);
  }

  const convRate = totalViews > 0 ? ((leads.length / totalViews) * 100).toFixed(1) : "0";
  const last7 = leads.filter(l => Date.now() - new Date(l.created_at).getTime() < 7 * 86400000).length;

  // Source breakdown
  const srcCounts: Record<string, number> = {};
  leads.forEach(l => { srcCounts[l.source || "profile"] = (srcCounts[l.source || "profile"] || 0) + 1; });
  const sources = Object.entries(srcCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const handleExportCSV = () => {
    if (!leads.length) return;
    const csv = "Email,Nome,Fonte,Data\n" + leads.map(l =>
      `${l.email},${l.name || ""},${l.source},${new Date(l.created_at).toLocaleDateString("pt-BR")}`
    ).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `maview-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const stats = [
    { label: "Total de leads", value: leads.length, icon: Mail, color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-100" },
    { label: "Visitas únicas", value: totalViews, icon: Globe, color: "text-primary", bg: "bg-[hsl(var(--dash-accent))]", ring: "ring-primary/10" },
    { label: "Taxa de conversão", value: `${convRate}%`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-100" },
    { label: "Últimos 7 dias", value: last7, icon: Users, color: "text-blue-600", bg: "bg-blue-50", ring: "ring-blue-100" },
  ];

  const srcColors = ["bg-pink-500", "bg-primary", "bg-emerald-500", "bg-sky-500", "bg-amber-500"];

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">Audiência</h1>
          <p className="text-[hsl(var(--dash-text-muted))] text-[15px]">Seus leads e visitantes reais</p>
        </div>
        {leads.length > 0 && (
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 text-[13px] text-[hsl(var(--dash-text-secondary))] font-medium transition-all">
            <Download size={14} /> Exportar CSV
          </button>
        )}
      </div>

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

      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        {/* Sources */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[15px] mb-5">Origem dos leads</h2>
          {sources.length === 0 ? (
            <p className="text-[hsl(var(--dash-text-subtle))] text-sm py-8 text-center">Compartilhe sua vitrine para capturar leads!</p>
          ) : (
            <div className="space-y-4">
              {sources.map(([name, count], i) => {
                const pct = Math.round((count / leads.length) * 100);
                return (
                  <div key={name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-[hsl(var(--dash-text-secondary))] font-medium">{name}</span>
                      <span className="text-[13px] text-[hsl(var(--dash-text))] font-semibold tabular-nums">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[hsl(var(--dash-surface-2))] overflow-hidden">
                      <div className={`h-full rounded-full ${srcColors[i % 5]} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Leads list */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-[hsl(var(--dash-border-subtle))]">
            <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[15px]">Leads recentes</h2>
          </div>
          {leads.length === 0 && !loading ? (
            <div className="p-8 text-center">
              <Mail size={32} className="mx-auto mb-3 text-primary/20" />
              <p className="text-[hsl(var(--dash-text-subtle))] text-sm">Nenhum lead capturado</p>
              <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-1">O formulário de email aparece na sua vitrine pública</p>
            </div>
          ) : (
            <div className="divide-y divide-[hsl(var(--dash-border-subtle))]">
              {leads.slice(0, 10).map(lead => (
                <div key={lead.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[hsl(var(--dash-surface-2))]/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(lead.name || lead.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium truncate">{lead.name || lead.email.split("@")[0]}</p>
                    <p className="text-[hsl(var(--dash-text-subtle))] text-xs truncate">{lead.email}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text-subtle))] ring-1 ring-[hsl(var(--dash-border-subtle))]">{lead.source}</span>
                  <span className="text-xs text-[hsl(var(--dash-text-subtle))] flex-shrink-0">{timeAgo(lead.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardAudiencia;
