import { useState } from "react";
import { Plus, ShoppingBag } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: string;
  status: "ativo" | "rascunho";
  sales: number;
}

const SAMPLE: Product[] = [
  { id: "1", name: "Ebook: Guia do Criador Digital", price: "R$ 29,90", status: "ativo", sales: 12 },
  { id: "2", name: "Template Notion - Planejamento", price: "R$ 19,90", status: "ativo", sales: 8 },
  { id: "3", name: "Curso: Instagram Pro", price: "R$ 97,00", status: "rascunho", sales: 0 },
];

const DashboardProdutos = () => {
  const [products] = useState<Product[]>(SAMPLE);

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1.5">
          <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">Produtos</h1>
          <p className="text-[hsl(var(--dash-text-muted))] text-[15px]">Gerencie seus produtos digitais</p>
        </div>
        <button className="flex items-center gap-2 btn-primary-gradient text-[13px] px-4 py-2.5 rounded-xl">
          <Plus size={15} /> Criar produto
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-[hsl(var(--dash-text-subtle))]">
          <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum produto ainda.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map(product => (
            <div
              key={product.id}
              className="glass-card-hover flex items-center gap-4 rounded-2xl p-5 group"
            >
              <div className="w-11 h-11 rounded-xl bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center flex-shrink-0">
                <ShoppingBag size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium truncate">{product.name}</p>
                <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-0.5">{product.sales} vendas</p>
              </div>
              <p className="text-[hsl(var(--dash-text))] font-semibold text-sm tabular-nums">{product.price}</p>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                product.status === "ativo"
                  ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                  : "bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text-subtle))] ring-1 ring-[hsl(var(--dash-border-subtle))]"
              }`}>
                {product.status === "ativo" ? "Ativo" : "Rascunho"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardProdutos;
