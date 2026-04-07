import { useState, useEffect } from "react";
import {
  Plus, ShoppingBag, Pencil, Trash2, Copy,
  ToggleLeft, ToggleRight, Tag, X, Zap,
} from "lucide-react";

interface ProductItem {
  id: string;
  title: string;
  description: string;
  price: string;
  originalPrice: string;
  emoji: string;
  url: string;
  badge: string;
  urgency: boolean;
  active: boolean;
  sales?: number;
}

const EMOJI_OPTIONS = ["🎯", "📚", "🎨", "💡", "🚀", "🎤", "💎", "🔑", "⚡", "🛒"];

const LS_KEY = "maview_vitrine_config";

const readProductsFromLS = (): ProductItem[] => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.products)) return parsed.products;
    }
  } catch {
    // ignore
  }
  return [];
};

const saveProductsToLS = (products: ProductItem[]) => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const config = raw ? JSON.parse(raw) : {};
    config.products = products;
    localStorage.setItem(LS_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
};

const EMPTY_FORM: Omit<ProductItem, "id" | "sales"> = {
  title: "",
  description: "",
  price: "",
  originalPrice: "",
  emoji: "🎯",
  url: "",
  badge: "",
  urgency: false,
  active: true,
};

const DashboardProdutos = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ProductItem, "id" | "sales">>(EMPTY_FORM);

  // On mount: read from localStorage
  useEffect(() => {
    setProducts(readProductsFromLS());
  }, []);

  // Sync helper: update state + localStorage atomically
  const updateProducts = (next: ProductItem[]) => {
    setProducts(next);
    saveProductsToLS(next);
  };

  const toggleProduct = (id: string) => {
    updateProducts(products.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const deleteProduct = (id: string) => {
    updateProducts(products.filter(p => p.id !== id));
  };

  const duplicateProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      updateProducts([...products, { ...product, id: Date.now().toString(), title: `${product.title} (cópia)`, sales: 0 }]);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (product: ProductItem) => {
    setEditingId(product.id);
    setForm({
      title: product.title,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      emoji: product.emoji,
      url: product.url,
      badge: product.badge,
      urgency: product.urgency,
      active: product.active,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;

    if (editingId) {
      updateProducts(products.map(p =>
        p.id === editingId ? { ...p, ...form } : p
      ));
    } else {
      const newProduct: ProductItem = {
        ...form,
        id: Date.now().toString(),
        sales: 0,
      };
      updateProducts([...products, newProduct]);
    }
    closeModal();
  };

  const setField = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">Produtos</h1>
          <p className="text-[hsl(var(--dash-text-muted))] text-[15px]">Crie e gerencie seus produtos digitais</p>
        </div>
        <button
          onClick={openCreate}
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
          <p className="text-xl font-bold text-emerald-600">{products.filter(p => p.active).length}</p>
          <p className="text-xs text-[hsl(var(--dash-text-muted))] mt-0.5">Ativos</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-xl font-bold text-[hsl(var(--dash-text))]">{products.reduce((sum, p) => sum + (p.sales ?? 0), 0)}</p>
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
            <div
              key={product.id}
              className={`glass-card-hover flex items-center gap-4 rounded-2xl p-5 group ${!product.active ? "opacity-60" : ""}`}
            >
              {/* Emoji icon */}
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center flex-shrink-0 text-2xl">
                {product.emoji || "🎯"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[hsl(var(--dash-text))] text-[14px] font-semibold truncate">{product.title}</p>
                  {product.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 font-semibold flex-shrink-0">
                      {product.badge}
                    </span>
                  )}
                  {product.urgency && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-semibold flex items-center gap-1 flex-shrink-0">
                      <Zap size={9} />Urgência
                    </span>
                  )}
                </div>
                <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-0.5 truncate">{product.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs text-[hsl(var(--dash-text-muted))] font-semibold">
                    <Tag size={11} /> {product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs text-[hsl(var(--dash-text-subtle))] line-through">{product.originalPrice}</span>
                  )}
                  {(product.sales ?? 0) > 0 && (
                    <span className="text-xs text-emerald-600 font-medium">{product.sales} vendas</span>
                  )}
                </div>
              </div>

              <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                product.active
                  ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                  : "bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text-subtle))] ring-1 ring-[hsl(var(--dash-border-subtle))]"
              }`}>
                {product.active ? "Ativo" : "Inativo"}
              </span>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => duplicateProduct(product.id)}
                  className="p-1.5 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-primary hover:bg-[hsl(var(--dash-surface-2))] transition-all"
                >
                  <Copy size={13} />
                </button>
                <button
                  onClick={() => openEdit(product)}
                  className="p-1.5 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-primary hover:bg-[hsl(var(--dash-surface-2))] transition-all"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="p-1.5 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <button onClick={() => toggleProduct(product.id)} className="flex-shrink-0">
                {product.active ? (
                  <ToggleRight size={26} className="text-primary" />
                ) : (
                  <ToggleLeft size={26} className="text-[hsl(var(--dash-text-subtle))]" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit product modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative glass-card rounded-2xl p-6 md:p-7 w-full max-w-md shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[hsl(var(--dash-text))] font-semibold text-lg">
                {editingId ? "Editar produto" : "Novo produto"}
              </h3>
              <button onClick={closeModal} className="text-[hsl(var(--dash-text-subtle))] hover:text-[hsl(var(--dash-text))] p-1">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Emoji picker */}
              <div>
                <label className="text-[hsl(var(--dash-text-secondary))] text-xs font-medium mb-1.5 block">Emoji</label>
                <div className="flex gap-2 flex-wrap">
                  {EMOJI_OPTIONS.map(em => (
                    <button
                      key={em}
                      onClick={() => setField("emoji", em)}
                      className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                        form.emoji === em
                          ? "ring-2 ring-primary bg-[hsl(var(--dash-accent))]/60 scale-110"
                          : "bg-[hsl(var(--dash-surface-2))] hover:scale-105"
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-[hsl(var(--dash-text-secondary))] text-xs font-medium mb-1.5 block">Título do produto</label>
                <input
                  value={form.title}
                  onChange={e => setField("title", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                  placeholder="Ex: Ebook Premium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[hsl(var(--dash-text-secondary))] text-xs font-medium mb-1.5 block">Descrição</label>
                <textarea
                  value={form.description}
                  onChange={e => setField("description", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all resize-none h-20"
                  placeholder="Descreva seu produto..."
                />
              </div>

              {/* Price row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[hsl(var(--dash-text-secondary))] text-xs font-medium mb-1.5 block">Preço</label>
                  <input
                    value={form.price}
                    onChange={e => setField("price", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    placeholder="R$ 0,00"
                  />
                </div>
                <div>
                  <label className="text-[hsl(var(--dash-text-secondary))] text-xs font-medium mb-1.5 block">Preço original</label>
                  <input
                    value={form.originalPrice}
                    onChange={e => setField("originalPrice", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    placeholder="R$ 0,00"
                  />
                </div>
              </div>

              {/* Badge */}
              <div>
                <label className="text-[hsl(var(--dash-text-secondary))] text-xs font-medium mb-1.5 block">Badge <span className="opacity-50">(opcional)</span></label>
                <input
                  value={form.badge}
                  onChange={e => setField("badge", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                  placeholder="Ex: Mais vendido"
                />
              </div>

              {/* URL */}
              <div>
                <label className="text-[hsl(var(--dash-text-secondary))] text-xs font-medium mb-1.5 block">Link do produto <span className="opacity-50">(opcional)</span></label>
                <input
                  value={form.url}
                  onChange={e => setField("url", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                  placeholder="https://..."
                />
              </div>

              {/* Urgency toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))]">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-amber-500" />
                  <div>
                    <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium">Urgência</p>
                    <p className="text-[hsl(var(--dash-text-subtle))] text-xs">Exibe selo de urgência na vitrine</p>
                  </div>
                </div>
                <button
                  onClick={() => setField("urgency", !form.urgency)}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${form.urgency ? "bg-primary" : "bg-[hsl(var(--dash-border))]"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${form.urgency ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>

              <button
                onClick={handleSave}
                disabled={!form.title.trim()}
                className="w-full btn-primary-gradient py-3 rounded-xl text-sm font-semibold mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingId ? "Salvar alterações" : "Criar produto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardProdutos;
