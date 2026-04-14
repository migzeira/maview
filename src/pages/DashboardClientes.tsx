import { useState, useEffect, useMemo } from "react";
import {
  Users, UserPlus, TrendingUp, Search, Download,
  Calendar, Filter, Mail, ShoppingBag, Globe,
} from "lucide-react";
import { fetchLeads, fetchOrders, type Order } from "@/lib/vitrine-sync";

interface Lead {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  created_at: string;
}

interface Contact {
  id: string;
  email: string;
  name: string;
  source: string;
  date: string;
  type: "lead" | "comprador";
  totalSpent: number;
}

type PeriodFilter = "7d" | "30d" | "all";
type TypeFilter = "todos" | "lead" | "comprador";

const PERIOD_MS: Record<PeriodFilter, number> = {
  "7d": 7 * 86400000,
  "30d": 30 * 86400000,
  "all": Infinity,
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Agora";
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "Ontem" : `${days}d`;
}

function getInitials(name: string): string {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map(n => n[0] || "").join("").toUpperCase();
}

const Skeleton = ({ className }: { className: string }) => (
  <div className={`skeleton ${className}`} />
);

const DashboardClientes = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("30d");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("todos");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [leadsData, ordersData] = await Promise.all([fetchLeads(), fetchOrders()]);
      setLeads(leadsData as Lead[]);
      setOrders(ordersData);
      setLoading(false);
    })();
  }, []);

  /* ── Merge leads + buyers into unified contacts ���─ */
  const contacts: Contact[] = useMemo(() => {
    const contactMap = new Map<string, Contact>();

    // Add leads
    leads.forEach(l => {
      contactMap.set(l.email, {
        id: l.id,
        email: l.email,
        name: l.name || "",
        source: l.source || "direto",
        date: l.created_at,
        type: "lead",
        totalSpent: 0,
      });
    });

    // Upgrade to buyer or add buyer
    orders.filter(o => o.payment_status === "approved" && o.buyer_email).forEach(o => {
      const existing = contactMap.get(o.buyer_email!);
      if (existing) {
        existing.type = "comprador";
        existing.totalSpent += o.amount;
        if (o.buyer_name && !existing.name) existing.name = o.buyer_name;
      } else {
        contactMap.set(o.buyer_email!, {
          id: o.id,
          email: o.buyer_email!,
          name: o.buyer_name || "",
          source: "compra",
          date: o.created_at,
          type: "comprador",
          totalSpent: o.amount,
        });
      }
    });

    return Array.from(contactMap.values()).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [leads, orders]);

  /* ── Filtered contacts ── */
  const filtered = useMemo(() => {
    const cutoff = PERIOD_MS[periodFilter] === Infinity ? 0 : Date.now() - PERIOD_MS[periodFilter];
    return contacts.filter(c => {
      if (new Date(c.date).getTime() < cutoff) return false;
      if (typeFilter !== "todos" && c.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return c.email.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [contacts, periodFilter, typeFilter, search]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000;
    const newThisWeek = contacts.filter(c => new Date(c.date).getTime() >= weekAgo).length;
    const buyers = contacts.filter(c => c.type === "comprador").length;
    const convRate = contacts.length > 0 ? ((buyers / contacts.length) * 100).toFixed(1) : "0";

    // Top source
    const sourceMap = new Map<string, number>();
    contacts.forEach(c => sourceMap.set(c.source, (sourceMap.get(c.source) || 0) + 1));
    let topSource = "—";
    let topCount = 0;
    sourceMap.forEach((count, name) => { if (count > topCount) { topCount = count; topSource = name; } });

    return { total: contacts.length, newThisWeek, convRate, topSource };
  }, [contacts]);

  /* ── CSV Export ── */
  const handleExport = () => {
    if (!filtered.length) return;
    const csv = "Nome,Email,Tipo,Fonte,Data\n" + filtered.map(c =>
      `"${c.name}","${c.email}","${c.type === "comprador" ? "Comprador" : "Lead"}","${c.source}","${new Date(c.date).toLocaleDateString("pt-BR")}"`
    ).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `maview-clientes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10 space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">Clientes</h1>
          <p className="text-[hsl(var(--dash-text-muted))] text-[14px]">Gerencie sua base de leads e compradores</p>
        </div>
        {filtered.length > 0 && (
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 text-[13px] text-[hsl(var(--dash-text-secondary))] font-medium transition-all">
            <Download size={14} /> Exportar CSV
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total contatos", value: stats.total, icon: Users, color: "text-violet-500", bg: "bg-violet-500/10" },
          { label: "Novos (7 dias)", value: stats.newThisWeek, icon: UserPlus, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Taxa conversao", value: `${stats.convRate}%`, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Top fonte", value: stats.topSource, icon: Globe, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass-card rounded-2xl p-5 card-hover">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="w-20 h-7" />
                <Skeleton className="w-16 h-4" />
              </div>
            ) : (
              <>
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color} mb-3`}>
                  <Icon size={17} />
                </div>
                <p className="text-[26px] font-bold text-[hsl(var(--dash-text))] tracking-tight leading-none">{value}</p>
                <p className="text-[13px] text-[hsl(var(--dash-text-muted))] mt-1">{label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 border-b border-[hsl(var(--dash-border-subtle))]">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--dash-text-subtle))]" />
            <input
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Period */}
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-[hsl(var(--dash-text-subtle))]" />
              {(["7d", "30d", "all"] as PeriodFilter[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriodFilter(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    periodFilter === p
                      ? "bg-[hsl(var(--dash-accent))] text-primary"
                      : "text-[hsl(var(--dash-text-subtle))] hover:bg-[hsl(var(--dash-surface-2))]"
                  }`}
                >
                  {p === "all" ? "Todos" : p === "7d" ? "7 dias" : "30 dias"}
                </button>
              ))}
            </div>
            {/* Type */}
            <div className="flex items-center gap-1.5">
              <Filter size={13} className="text-[hsl(var(--dash-text-subtle))]" />
              {(["todos", "lead", "comprador"] as TypeFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    typeFilter === f
                      ? "bg-[hsl(var(--dash-accent))] text-primary"
                      : "text-[hsl(var(--dash-text-subtle))] hover:bg-[hsl(var(--dash-surface-2))]"
                  }`}
                >
                  {f === "todos" ? "Todos" : f === "lead" ? "Leads" : "Compradores"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contact list */}
        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-9 h-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-48 h-3" />
                </div>
                <Skeleton className="w-16 h-5 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={36} className="mx-auto mb-3 text-primary/20" />
            <p className="text-[hsl(var(--dash-text-subtle))] text-sm font-medium">
              {contacts.length === 0 ? "Nenhum contato ainda" : "Nenhum resultado encontrado"}
            </p>
            <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-1">
              {contacts.length === 0 ? "Seus leads e compradores aparecerão aqui" : "Tente alterar os filtros"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--dash-border-subtle))]">
            {filtered.map(contact => (
              <div key={contact.id + contact.email} className="flex items-center gap-4 px-5 py-4 hover:bg-[hsl(var(--dash-surface-2))]/50 transition-colors">
                {/* Avatar with initials */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[11px] font-bold text-primary">
                    {getInitials(contact.name || contact.email)}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium truncate">
                    {contact.name || contact.email.split("@")[0]}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Mail size={10} className="text-[hsl(var(--dash-text-subtle))] flex-shrink-0" />
                    <span className="text-[hsl(var(--dash-text-subtle))] text-xs truncate">{contact.email}</span>
                  </div>
                </div>

                {/* Source */}
                <span className="text-[hsl(var(--dash-text-subtle))] text-xs hidden sm:block">{contact.source}</span>

                {/* Time */}
                <span className="text-[hsl(var(--dash-text-subtle))] text-xs tabular-nums flex-shrink-0">{timeAgo(contact.date)}</span>

                {/* Type badge */}
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                  contact.type === "comprador"
                    ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                    : "bg-violet-50 text-violet-600 ring-1 ring-violet-100"
                }`}>
                  {contact.type === "comprador" ? (
                    <span className="flex items-center gap-1"><ShoppingBag size={10} /> Comprador</span>
                  ) : (
                    <span className="flex items-center gap-1"><UserPlus size={10} /> Lead</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[hsl(var(--dash-border-subtle))]">
            <span className="text-[hsl(var(--dash-text-subtle))] text-xs">
              {filtered.length} {filtered.length === 1 ? "contato" : "contatos"}
              {filtered.length !== contacts.length && ` de ${contacts.length}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardClientes;
