import { useState } from "react";
import { DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import DashboardProdutos from "./DashboardProdutos";
import DashboardVendas from "./DashboardVendas";

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
          Monetização
        </h1>
        <p className="text-[hsl(var(--dash-text-muted))] text-[15px]">
          Gerencie seus produtos, vendas e receita em um só lugar
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

      {/* Tab content - render without the outer wrapper since we already have one */}
      <div className="-mx-4 md:-mx-8 -mb-8 md:-mb-10">
        {activeTab === "produtos" && <DashboardProdutosContent />}
        {activeTab === "vendas" && <DashboardVendasContent />}
        {activeTab === "receita" && <ReceitaContent />}
      </div>
    </div>
  );
};

/* Wrap existing pages - they have their own container, so we just render them */
const DashboardProdutosContent = () => <DashboardProdutos />;
const DashboardVendasContent = () => <DashboardVendas />;

const ReceitaContent = () => (
  <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 space-y-6">
    <div className="glass-card rounded-2xl p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center mx-auto mb-4">
        <TrendingUp size={24} className="text-primary" />
      </div>
      <h3 className="text-[hsl(var(--dash-text))] font-semibold text-lg mb-2">
        Relatório de receita
      </h3>
      <p className="text-[hsl(var(--dash-text-muted))] text-sm max-w-md mx-auto">
        Acompanhe sua receita com gráficos detalhados, métricas de crescimento e projeções. Disponível em breve.
      </p>
    </div>
  </div>
);

export default DashboardMonetizacao;
