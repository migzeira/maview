import { useState } from "react";
import { Plus, ShoppingBag, MoreVertical, Eye, EyeOff } from "lucide-react";

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
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Produtos</h1>
          <p className="text-[#A78BFA]/50 text-sm mt-1">Gerencie seus produtos digitais</p>
        </div>
        <button className="flex items-center gap-2 bg-[#6D28D9] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#7C3AED] transition-all shadow-lg shadow-[#6D28D9]/20">
          <Plus size={16} /> Criar produto
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-[#A78BFA]/30">
          <ShoppingBag size={40} className="mx-auto mb-3" />
          <p className="text-sm">Nenhum produto ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(product => (
            <div
              key={product.id}
              className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#1A1333] p-5 hover:border-white/[0.12] transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#6D28D9]/10 flex items-center justify-center flex-shrink-0">
                <ShoppingBag size={20} className="text-[#A78BFA]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{product.name}</p>
                <p className="text-[#A78BFA]/40 text-xs mt-0.5">{product.sales} vendas</p>
              </div>
              <p className="text-white font-semibold text-sm">{product.price}</p>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                product.status === "ativo"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-white/[0.04] text-[#A78BFA]/40 border border-white/[0.06]"
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
