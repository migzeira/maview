import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Home, FileText, DollarSign, BarChart3, Users,
  Zap, Settings, ExternalLink, Palette, Package, User, Sparkles, Command,
} from "lucide-react";
import StanleyAvatar from "./StanleyAvatar";

/* ═══════════════════════════════════════════════════════════════════════════
   CommandPalette — Cmd+K menu universal de comandos (estilo Linear/Notion/Raycast)

   Features:
   - Cmd/Ctrl+K abre/fecha de qualquer lugar
   - Search fuzzy nas ações
   - Setas ↑↓ navegam
   - Enter executa
   - Esc fecha
   - Ações categorizadas: Navegação, Ações, IA, Conta
   ═══════════════════════════════════════════════════════════════════════════ */

interface Action {
  id: string;
  label: string;
  shortcut?: string;
  category: "Navegação" | "Editar" | "IA" | "Conta";
  icon: React.ReactNode;
  onRun: () => void;
  keywords?: string;
}

interface Props {
  username?: string;
}

export default function CommandPalette({ username }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  /* Toggle com Cmd/Ctrl+K */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const cmdK = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k";
      if (cmdK) {
        e.preventDefault();
        setOpen(o => !o);
        setSearch("");
        setHighlighted(0);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* Focus input ao abrir */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const actions: Action[] = useMemo(() => [
    /* Navegação */
    { id: "nav-home", category: "Navegação", label: "Ir para Início", icon: <Home size={15} />, onRun: () => navigate("/dashboard"), keywords: "home dashboard" },
    { id: "nav-loja", category: "Navegação", label: "Minha Loja", icon: <FileText size={15} />, onRun: () => navigate("/dashboard/pagina"), keywords: "vitrine produtos" },
    { id: "nav-renda", category: "Navegação", label: "Renda", icon: <DollarSign size={15} />, onRun: () => navigate("/dashboard/monetizacao"), keywords: "vendas receita dinheiro" },
    { id: "nav-analises", category: "Navegação", label: "Análises", icon: <BarChart3 size={15} />, onRun: () => navigate("/dashboard/analytics"), keywords: "analytics estatisticas dados" },
    { id: "nav-clientes", category: "Navegação", label: "Clientes", icon: <Users size={15} />, onRun: () => navigate("/dashboard/clientes"), keywords: "leads compradores contatos" },
    { id: "nav-autodm", category: "Navegação", label: "AutoDM", icon: <Zap size={15} />, onRun: () => navigate("/dashboard/automacoes"), keywords: "automacoes mensagens" },

    /* Editar / Ações */
    { id: "edit-design", category: "Editar", label: "Editar Design", icon: <Palette size={15} />, onRun: () => navigate("/dashboard/pagina?tab=design"), shortcut: "D", keywords: "tema cor template" },
    { id: "edit-product", category: "Editar", label: "Adicionar produto", icon: <Package size={15} />, onRun: () => navigate("/dashboard/pagina"), shortcut: "P", keywords: "novo produto" },
    { id: "edit-profile", category: "Editar", label: "Editar perfil", icon: <User size={15} />, onRun: () => navigate("/dashboard/pagina?tab=perfil"), keywords: "bio nome foto avatar" },
    { id: "edit-publish", category: "Editar", label: "Abrir vitrine pública", icon: <ExternalLink size={15} />, onRun: () => username && window.open(`/${username.replace(/^@/, "")}`, "_blank"), keywords: "publicar ver vitrine" },

    /* IA Stanley */
    { id: "ai-stanley", category: "IA", label: "Conversar com Stanley", icon: <div className="w-4 h-4 flex items-center justify-center"><StanleyAvatar size="xs" /></div>, onRun: () => navigate("/dashboard/ia"), shortcut: "I", keywords: "ia stanley assistente" },
    { id: "ai-bio", category: "IA", label: "Stanley: criar minha bio", icon: <Sparkles size={15} />, onRun: () => navigate("/dashboard/ia?prompt=bio"), keywords: "biografia gerar" },
    { id: "ai-product", category: "IA", label: "Stanley: descrever produto", icon: <Sparkles size={15} />, onRun: () => navigate("/dashboard/ia?prompt=produto"), keywords: "descricao copy" },

    /* Conta */
    { id: "acc-settings", category: "Conta", label: "Configurações", icon: <Settings size={15} />, onRun: () => navigate("/dashboard/configuracoes"), keywords: "preferencias" },
  ], [navigate, username]);

  /* Filter por search */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return actions;
    return actions.filter(a =>
      a.label.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      (a.keywords?.toLowerCase().includes(q) ?? false)
    );
  }, [search, actions]);

  /* Group por categoria */
  const grouped = useMemo(() => {
    const g: Record<string, Action[]> = {};
    for (const a of filtered) {
      (g[a.category] ??= []).push(a);
    }
    return g;
  }, [filtered]);

  /* Lista flat pra navegação por seta */
  const flatList = useMemo(() => Object.values(grouped).flat(), [grouped]);

  /* Reset highlighted ao filtrar */
  useEffect(() => {
    setHighlighted(0);
  }, [search]);

  /* Setas + Enter */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlighted(h => Math.min(h + 1, flatList.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlighted(h => Math.max(h - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const action = flatList[highlighted];
        if (action) {
          action.onRun();
          setOpen(false);
          setSearch("");
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, highlighted, flatList]);

  if (!open) return null;

  let flatIdx = -1;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4 animate-in fade-in duration-150">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* Palette */}
      <div className="relative w-full max-w-2xl bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border))] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-200">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[hsl(var(--dash-border-subtle))]">
          <Search size={16} className="text-[hsl(var(--dash-text-subtle))]" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="O que você quer fazer? (digite ou navegue com ↑↓)"
            className="flex-1 bg-transparent text-[14px] text-[hsl(var(--dash-text))] placeholder:text-[hsl(var(--dash-text-subtle))] focus:outline-none"
          />
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border))] text-[10px] font-semibold text-[hsl(var(--dash-text-muted))]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto scrollbar-none py-2">
          {Object.keys(grouped).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[14px] text-[hsl(var(--dash-text-muted))]">Nenhum resultado para "{search}"</p>
              <p className="text-[11px] text-[hsl(var(--dash-text-subtle))] mt-1">Tente "design", "produto", "stanley"...</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="px-2 mb-2">
                <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--dash-text-subtle))]">
                  {category}
                </p>
                {items.map(action => {
                  flatIdx++;
                  const isActive = flatIdx === highlighted;
                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        action.onRun();
                        setOpen(false);
                        setSearch("");
                      }}
                      onMouseEnter={() => setHighlighted(flatList.indexOf(action))}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-[hsl(var(--dash-text-secondary))] hover:bg-[hsl(var(--dash-surface-2))]"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isActive ? "bg-primary/15 text-primary" : "bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text-muted))]"
                      }`}>
                        {action.icon}
                      </div>
                      <span className="flex-1 text-[13px] font-medium">{action.label}</span>
                      {action.shortcut && (
                        <kbd className="px-1.5 py-0.5 rounded bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border))] text-[10px] font-mono text-[hsl(var(--dash-text-subtle))]">
                          {action.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-[hsl(var(--dash-border-subtle))] bg-[hsl(var(--dash-bg))]/30 flex items-center justify-between text-[10px] text-[hsl(var(--dash-text-subtle))]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border))] font-mono">↑↓</kbd>
              navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border))] font-mono">↵</kbd>
              abrir
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Command size={10} />
            <span>K</span>
            <span className="ml-1">para reabrir</span>
          </span>
        </div>
      </div>
    </div>
  );
}
