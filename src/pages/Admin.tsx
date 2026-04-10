import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { checkTablesExist, SETUP_SQL } from "@/lib/supabase-setup";
import type { User } from "@supabase/supabase-js";
import {
  Users, LogOut, Search, RefreshCw, Shield,
  Mail, Calendar, Clock, User as UserIcon,
  Link2, ChevronDown, ChevronUp, AlertTriangle, Database, Copy, Check,
} from "lucide-react";

/* ─────────────────────────────────────────────────
   EMAILS COM ACESSO ADMIN
───────────────────────────────────────────────── */
const ADMIN_EMAILS = [
  "andrefernandesbalada@gmail.com",
  "migueldrops@gmail.com",
  "maview.suporte@gmail.com",
];

/* ─── Logo ───────────────────────────────────────── */
import MaviewLogo from "@/components/MaviewLogo";

/* ─── Types ─────────────────────────────────────── */
interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  created_at: string;
  updated_at: string | null;
  last_sign_in_at: string | null;
  provider: string | null;
  avatar_url: string | null;
}

type SortField = "created_at" | "email" | "full_name" | "last_sign_in_at";
type SortDir   = "asc" | "desc";

/* ─── Helpers ────────────────────────────────────── */
const fmt = (iso: string | null) => {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
};

const relativeTime = (iso: string | null) => {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (mins < 1)   return "agora";
  if (mins < 60)  return `${mins}min atrás`;
  if (hours < 24) return `${hours}h atrás`;
  if (days < 30)  return `${days}d atrás`;
  return fmt(iso);
};

/* ─── Admin Page ─────────────────────────────────── */
const Admin = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading]         = useState(true);
  const [profiles, setProfiles]       = useState<Profile[]>([]);
  const [fetching, setFetching]       = useState(false);
  const [search, setSearch]           = useState("");
  const [sortField, setSortField]     = useState<SortField>("created_at");
  const [sortDir, setSortDir]         = useState<SortDir>("desc");
  const [tableError, setTableError]   = useState(false);
  const [expanded, setExpanded]       = useState<string | null>(null);
  const [dbStatus, setDbStatus]       = useState<{ vitrines: boolean; events: boolean } | null>(null);
  const [sqlCopied, setSqlCopied]     = useState(false);

  /* ── Auth guard ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/login"); return; }
      if (!ADMIN_EMAILS.includes(session.user.email || "")) { navigate("/dashboard"); return; }
      setCurrentUser(session.user);
      setLoading(false);
      // Check database tables
      checkTablesExist().then(setDbStatus);
    });
  }, [navigate]);

  const copySql = () => {
    navigator.clipboard.writeText(SETUP_SQL).catch(() => {});
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  /* ── Fetch profiles ── */
  const fetchProfiles = async () => {
    setFetching(true);
    setTableError(false);
    const { data, error } = await (supabase
      .from("profiles") as any)
      .select("*")
      .order(sortField, { ascending: sortDir === "asc" });

    if (error) {
      console.error(error);
      setTableError(true);
    } else {
      setProfiles(data || []);
    }
    setFetching(false);
  };

  useEffect(() => {
    if (!loading && currentUser) fetchProfiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, currentUser, sortField, sortDir]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown size={13} className="opacity-30" />;
    return sortDir === "asc" ? <ChevronUp size={13} className="text-maview-purple" /> : <ChevronDown size={13} className="text-maview-purple" />;
  };

  /* ── Filtered & sorted list ── */
  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.email || "").toLowerCase().includes(q) ||
      (p.full_name || "").toLowerCase().includes(q) ||
      (p.username || "").toLowerCase().includes(q)
    );
  });

  /* ── Stats ── */
  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const newToday = profiles.filter((p) => new Date(p.created_at) >= today).length;
  const thisWeek = profiles.filter((p) => {
    const d = new Date(p.created_at);
    const w = new Date(); w.setDate(w.getDate() - 7);
    return d >= w;
  }).length;
  const googleUsers = profiles.filter((p) => p.provider === "google").length;

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-maview-bg flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-maview-purple/30 border-t-maview-purple rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-maview-bg flex flex-col">

      {/* ── Header ── */}
      <header className="bg-white border-b border-maview-border px-6 h-16 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <MaviewLogo size={26} />
          <span className="text-maview-text font-bold text-lg tracking-tight">Maview</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 ml-2">
            <Shield size={11} className="text-red-500" />
            <span className="text-red-600 text-[11px] font-bold tracking-wide uppercase">Admin</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-xs text-maview-muted hover:text-maview-text transition-colors px-3 py-1.5 rounded-lg hover:bg-maview-surface">
            Meu Dashboard
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-maview-surface border border-maview-border">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-maview-purple-light to-maview-purple-dark flex items-center justify-center">
              <UserIcon size={11} className="text-white" />
            </div>
            <span className="text-xs text-maview-text-sub hidden md:block">{currentUser?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-maview-muted hover:text-maview-text hover:bg-maview-surface transition-all text-sm"
          >
            <LogOut size={14} />
            <span className="hidden sm:block text-xs">Sair</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">

        {/* ── Page title ── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-maview-text mb-1">Painel de Administração</h1>
          <p className="text-maview-muted text-sm">Visibilidade completa de todos os usuários da plataforma.</p>
        </div>

        {/* ── Stats cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total de usuários",  value: profiles.length,    icon: Users,    color: "text-maview-purple", bg: "bg-maview-purple-soft border-maview-purple/20" },
            { label: "Cadastros hoje",     value: newToday,           icon: Calendar, color: "text-emerald-600",   bg: "bg-emerald-50 border-emerald-200" },
            { label: "Últimos 7 dias",     value: thisWeek,           icon: Clock,    color: "text-blue-600",      bg: "bg-blue-50 border-blue-200" },
            { label: "Login com Google",   value: googleUsers,        icon: Mail,     color: "text-amber-600",     bg: "bg-amber-50 border-amber-200" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-maview-border rounded-2xl p-5 shadow-sm">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 border ${s.bg}`}>
                <s.icon size={16} className={s.color} />
              </div>
              <p className="text-maview-text text-2xl font-bold">{s.value}</p>
              <p className="text-maview-muted text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Database Setup Status ── */}
        {dbStatus && (!dbStatus.vitrines || !dbStatus.events) && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6 flex items-start gap-4">
            <Database size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-blue-800 font-semibold mb-1">Setup do Banco de Dados</p>
              <p className="text-blue-700 text-sm mb-2">
                {!dbStatus.vitrines && !dbStatus.events
                  ? "As tabelas vitrines e events precisam ser criadas."
                  : !dbStatus.vitrines
                    ? "A tabela vitrines precisa ser criada."
                    : "A tabela events precisa ser criada."}
                {" "}Copie o SQL abaixo e execute no <strong>Supabase Dashboard → SQL Editor</strong>.
              </p>
              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${dbStatus.vitrines ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                  {dbStatus.vitrines ? "✓" : "✗"} vitrines
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${dbStatus.events ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                  {dbStatus.events ? "✓" : "✗"} events
                </span>
              </div>
              <button onClick={copySql}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors mb-3">
                {sqlCopied ? <Check size={14} /> : <Copy size={14} />}
                {sqlCopied ? "SQL Copiado!" : "Copiar SQL de Setup"}
              </button>
              <details className="group">
                <summary className="text-blue-600 text-xs font-medium cursor-pointer hover:underline">Ver SQL completo</summary>
                <pre className="mt-2 bg-blue-100 border border-blue-200 rounded-xl p-4 text-[10px] text-blue-900 overflow-x-auto whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                  {SETUP_SQL}
                </pre>
              </details>
            </div>
          </div>
        )}

        {/* ── Table Error (tabela profiles não existe ainda) ── */}
        {tableError && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 flex items-start gap-4">
            <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 font-semibold mb-1">Tabela <code className="font-mono">profiles</code> não existe no Supabase</p>
              <p className="text-amber-700 text-sm mb-3">
                Execute o SQL abaixo no <strong>SQL Editor do Supabase</strong> para criar a tabela e o trigger automático.
                Após isso, atualize esta página.
              </p>
              <pre className="bg-amber-100 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 overflow-x-auto whitespace-pre-wrap font-mono">
{`-- 1. Criar tabela profiles
create table if not exists public.profiles (
  id              uuid references auth.users(id) on delete cascade primary key,
  email           text,
  full_name       text,
  username        text unique,
  avatar_url      text,
  provider        text,
  last_sign_in_at timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- 2. Habilitar RLS
alter table public.profiles enable row level security;

-- 3. Política: só o admin lê tudo
create policy "admin_read_all" on public.profiles
  for select using (
    auth.jwt() ->> 'email' in ('andrefernandesbalada@gmail.com','migueldrops@gmail.com','maview.suporte@gmail.com')
  );

-- 4. Política: usuário lê/edita o próprio
create policy "user_read_own" on public.profiles
  for select using (auth.uid() = id);

create policy "user_update_own" on public.profiles
  for update using (auth.uid() = id);

-- 5. Trigger: popula ao criar conta
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, username, avatar_url, provider, last_sign_in_at)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_app_meta_data ->> 'provider',
    new.last_sign_in_at
  )
  on conflict (id) do update set
    email           = excluded.email,
    full_name       = excluded.full_name,
    username        = excluded.username,
    avatar_url      = excluded.avatar_url,
    provider        = excluded.provider,
    last_sign_in_at = excluded.last_sign_in_at,
    updated_at      = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute function public.handle_new_user();`}
              </pre>
            </div>
          </div>
        )}

        {/* ── Toolbar ── */}
        {!tableError && (
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-maview-muted" />
              <input
                type="text"
                placeholder="Buscar por email, nome ou @username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-white border border-maview-border text-maview-text text-sm placeholder:text-maview-muted/60 outline-none focus:border-maview-purple focus:ring-2 focus:ring-maview-purple/10 shadow-sm transition-all"
              />
            </div>
            <button
              onClick={fetchProfiles}
              disabled={fetching}
              className="flex items-center gap-2 px-4 h-10 rounded-xl bg-white border border-maview-border text-maview-text-sub text-sm font-medium hover:bg-maview-surface hover:border-maview-purple/30 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={14} className={fetching ? "animate-spin" : ""} />
              Atualizar
            </button>
          </div>
        )}

        {/* ── Table ── */}
        {!tableError && (
          <div className="bg-white border border-maview-border rounded-2xl shadow-sm overflow-hidden">

            {/* Table header */}
            <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_140px_140px_80px] gap-4 px-5 py-3 bg-maview-surface border-b border-maview-border text-xs font-semibold text-maview-muted uppercase tracking-wide">
              <button className="flex items-center gap-1 text-left hover:text-maview-text transition-colors" onClick={() => toggleSort("email")}>
                Email <SortIcon field="email" />
              </button>
              <button className="flex items-center gap-1 text-left hover:text-maview-text transition-colors" onClick={() => toggleSort("full_name")}>
                Nome <SortIcon field="full_name" />
              </button>
              <span>Username / Link</span>
              <button className="flex items-center gap-1 hover:text-maview-text transition-colors" onClick={() => toggleSort("created_at")}>
                Cadastro <SortIcon field="created_at" />
              </button>
              <button className="flex items-center gap-1 hover:text-maview-text transition-colors" onClick={() => toggleSort("last_sign_in_at")}>
                Último login <SortIcon field="last_sign_in_at" />
              </button>
              <span>Provider</span>
            </div>

            {/* Rows */}
            {fetching ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-2 border-maview-purple/30 border-t-maview-purple rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <Users size={32} className="mx-auto mb-3 text-maview-border" />
                <p className="text-maview-muted text-sm">
                  {search ? "Nenhum resultado para essa busca." : "Nenhum usuário cadastrado ainda."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-maview-border">
                {filtered.map((profile) => (
                  <div key={profile.id}>
                    {/* Desktop row */}
                    <div
                      className="hidden md:grid grid-cols-[1fr_1fr_1fr_140px_140px_80px] gap-4 px-5 py-4 hover:bg-maview-bg/60 transition-colors cursor-pointer"
                      onClick={() => setExpanded(expanded === profile.id ? null : profile.id)}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-maview-purple-light to-maview-purple-dark flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                          {(profile.full_name || profile.email || "?").charAt(0).toUpperCase()}
                        </div>
                        <span className="text-maview-text text-sm truncate">{profile.email}</span>
                      </div>
                      <span className="text-maview-text-sub text-sm self-center truncate">{profile.full_name || "—"}</span>
                      <div className="self-center min-w-0">
                        {profile.username ? (
                          <span className="inline-flex items-center gap-1 text-maview-purple text-xs font-mono bg-maview-purple-soft px-2 py-0.5 rounded-lg border border-maview-purple/20">
                            <Link2 size={10} /> maview.app/{profile.username}
                          </span>
                        ) : (
                          <span className="text-maview-muted/40 text-xs">—</span>
                        )}
                      </div>
                      <span className="text-maview-muted text-xs self-center">{relativeTime(profile.created_at)}</span>
                      <span className="text-maview-muted text-xs self-center">{relativeTime(profile.last_sign_in_at)}</span>
                      <span className={`text-xs self-center font-semibold px-2 py-0.5 rounded-full w-fit ${
                        profile.provider === "google"
                          ? "bg-blue-50 text-blue-600 border border-blue-200"
                          : "bg-maview-surface text-maview-muted border border-maview-border"
                      }`}>
                        {profile.provider || "email"}
                      </span>
                    </div>

                    {/* Mobile row */}
                    <div
                      className="md:hidden px-4 py-4 hover:bg-maview-bg/60 transition-colors cursor-pointer"
                      onClick={() => setExpanded(expanded === profile.id ? null : profile.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-maview-purple-light to-maview-purple-dark flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {(profile.full_name || profile.email || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-maview-text text-sm font-medium truncate">{profile.full_name || "Sem nome"}</p>
                          <p className="text-maview-muted text-xs truncate">{profile.email}</p>
                        </div>
                        <span className="ml-auto text-maview-muted text-xs flex-shrink-0">{relativeTime(profile.created_at)}</span>
                      </div>
                    </div>

                    {/* Expanded detail row */}
                    {expanded === profile.id && (
                      <div className="px-5 pb-5 bg-maview-bg/40 border-t border-maview-border/60">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                          {[
                            { label: "ID",               value: profile.id },
                            { label: "Email",             value: profile.email },
                            { label: "Nome completo",     value: profile.full_name || "—" },
                            { label: "Username",          value: profile.username ? `@${profile.username}` : "—" },
                            { label: "Link público",      value: profile.username ? `maview.app/${profile.username}` : "—" },
                            { label: "Provider",          value: profile.provider || "email/password" },
                            { label: "Avatar",            value: profile.avatar_url || "—" },
                            { label: "Cadastro",          value: fmt(profile.created_at) },
                            { label: "Último login",      value: fmt(profile.last_sign_in_at) },
                            { label: "Atualizado em",     value: fmt(profile.updated_at) },
                          ].map(({ label, value }) => (
                            <div key={label}>
                              <p className="text-maview-muted text-[10px] font-semibold uppercase tracking-wide mb-0.5">{label}</p>
                              <p className="text-maview-text text-xs font-mono break-all">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Footer count */}
            {!fetching && filtered.length > 0 && (
              <div className="px-5 py-3 border-t border-maview-border bg-maview-surface/50 flex items-center justify-between">
                <p className="text-maview-muted text-xs">
                  {filtered.length === profiles.length
                    ? `${profiles.length} usuário${profiles.length !== 1 ? "s" : ""} no total`
                    : `${filtered.length} de ${profiles.length} usuário${profiles.length !== 1 ? "s" : ""}`}
                </p>
                <p className="text-maview-muted/50 text-[10px]">Clique em uma linha para ver detalhes completos</p>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default Admin;
