import { useState } from "react";
import {
  Plus, ShoppingBag, Pencil, Trash2, Copy,
  ToggleLeft, ToggleRight, Tag, Package, X,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  status: "ativo" | "rascunho";
  sales: number;
  delivery: string;
}

const SAMPLE: Product[] = [
  { id: "1", name: "Ebook: Guia do Criador Digital", price: "R$ 29,90", description: "O guia completo para criadores", status: "ativo", sales: 12, delivery: "Download automático" },
  { id: "2", name: "Template Notion - Planejamento", price: "R$ 19,90", description: "Organize sua vida de criador", status: "ativo", sales: 8, delivery: "Link de acesso" },
  { id: "3", name: "Curso: Instagram Pro", price: "R$ 97,00", description: "Domine o Instagram e cresça", status: "rascunho", sales: 0, delivery: "Área de membros" },
];

const DashboardProdutos = () => {
  const [products, setProducts] = useState<Product[]>(SAMPLE);
  const [showModal, setShowModal] = useState(false);

  const toggleProduct = (id: string) =>
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: p.status === "ativo" ? "rascunho" : "ativo" } : p));

  const deleteProduct = (id: string) =>
    setProducts(prev => prev.filter(p => p.id !== id));

  const duplicateProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) setProducts(prev => [...prev, { ...product, id: Date.now().toString(), name: `${product.name} (cópia)`, sales: 0 }]);
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">Produtos</h1>
          <p className="text-[hsl(var(--dash-text-muted))] text-[15px]">Crie e gerencie seus produtos digitais</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 btn-primary-gradient text-[13px] px-4 py-2.5 rounded-xl"
        >
          <Plus size={15} /> Criar produto
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-xl font-bold text-[hsl(var(--dash-text))]">{products.length}</p>
          <p className="text-xs text-[hsl(var(--dash-text-muted))] mt-0.5">Produtos</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-xl font-bold text-emerald-600">{products.filter(p => p.status === "ativo").length}</p>
          <p className="text-xs text-[hsl(var(--dash-text-muted))] mt-0.5">Ativos</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-xl font-bold text-[hsl(var(--dash-text))]">{products.reduce((sum, p) => sum + p.sales, 0)}</p>
          <p className="text-xs text-[hsl(var(--dash-text-muted))] mt-0.5">Vendas totais</p>
        </div>
      </div>

      {/* Products list */}
      {products.length === 0 ? (
        <div className="text-center py-20 text-[hsl(var(--dash-text-subtle))]">
          <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum produto ainda. Crie o primeiro!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map(product => (
            <div key={product.id} className={`glass-card-hover flex items-center gap-4 rounded-2xl p-5 group ${product.status === "rascunho" ? "opacity-60" : ""}`}>
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center flex-shrink-0">
                <ShoppingBag size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[hsl(var(--dash-text))] text-[14px] font-semibold truncate">{product.name}</p>
                <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-0.5 truncate">{product.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs text-[hsl(var(--dash-text-muted))]">
                    <Tag size={11} /> {product.price}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[hsl(var(--dash-text-muted))]">
                    <Package size={11} /> {product.delivery}
                  </span>
                  <span className="text-xs text-[hsl(var(--dash-text-muted))]">{product.sales} vendas</span>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                product.status === "ativo"
                  ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                  : "bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text-subtle))] ring-1 ring-[hsl(var(--dash-border-subtle))]"
              }`}>
                {product.status === "ativo" ? "Ativo" : "Rascunho"}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => duplicateProduct(product.id)} className="p-1.5 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-primary hover:bg-[hsl(var(--dash-surface-2))] transition-all">
                  <Copy size={13} />
                </button>
                <button className="p-1.5 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-primary hover:bg-[hsl(var(--dash-surface-2))] transition-all">
                  <Pencil size={13} />
                </button>
                <button onClick={() => deleteProduct(product.id)} className="p-1.5 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-red-500 hover:bg-red-50 transition-all">
                  <Trash2 size={13} />
                </button>
              </div>
              <button onClick={() => toggleProduct(product.id)} className="flex-shrink-0">
                {product.status === "ativo" ? (
                  <ToggleRight size={26} className="text-primary" />
                ) : (
                  <ToggleLeft size={26} className="text-[hsl(var(--dash-text-subtle))]" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create product modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative glass-card rounded-2xl p-6 md:p-7 w-full max-w-md shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[hsl(var(--dash-text))] font-semibold text-lg">Novo produto</h3>
              <button onClick={() => setShowModal(false)} className="text-[hsl(var(--dash-text-subtle))] hover:text-[hsl(var(--dash-text))] p-1">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[hsl(var(--dash-text-secondary))] text-xs font-medium mb-1.5 block">Nome do produto</label>
                <input className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" placeholder="Ex: Ebook Premium" />
              </div>
              <div>
                <label className="text-[hsl(var(--dash-text-secondary))] text-xs font-medium mb-1.5 block">Preço</label>
                <input className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" placeholder="R$ 0,00" />
              </div>
              <div>
                <label className="text-[hsl(var(--dash-text-secondary))] text-xs font-medium mb-1.5 block">Descrição</label>
                <textarea className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all resize-none h-20" placeholder="Descreva seu produto..." />
              </div>
              <div>
                <label className="text-[hsl(var(--dash-text-secondary))] text-xs font-medium mb-1.5 block">Entrega</label>
                <select className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all">
                  <option>Download automático</option>
                  <option>Link de acesso</option>
                  <option>Área de membros</option>
                  <option>Email</option>
                </select>
              </div>
              <button className="w-full btn-primary-gradient py-3 rounded-xl text-sm font-semibold mt-2">
                Criar produto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardProdutos;
