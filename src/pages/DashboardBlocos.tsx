import { useState } from "react";
import {
  Plus, GripVertical, Pencil, Trash2, Copy, Link2, ShoppingBag,
  Type, Image, Video, CreditCard, Mail, ToggleLeft, ToggleRight, X,
} from "lucide-react";

type BlockType = "link" | "produto" | "texto" | "imagem" | "video" | "pagamento" | "email";

interface Block {
  id: string;
  type: BlockType;
  title: string;
  description: string;
  active: boolean;
}

const BLOCK_TYPES: { type: BlockType; label: string; icon: any; desc: string }[] = [
  { type: "link", label: "Link", icon: Link2, desc: "Adicione um link externo" },
  { type: "produto", label: "Produto", icon: ShoppingBag, desc: "Venda um produto digital" },
  { type: "texto", label: "Texto", icon: Type, desc: "Bloco de texto livre" },
  { type: "imagem", label: "Imagem", icon: Image, desc: "Upload de imagem" },
  { type: "video", label: "Vídeo", icon: Video, desc: "Embed de vídeo" },
  { type: "pagamento", label: "Pagamento", icon: CreditCard, desc: "Botão de pagamento" },
  { type: "email", label: "Captura de email", icon: Mail, desc: "Formulário de captura" },
];

const getBlockIcon = (type: BlockType) => BLOCK_TYPES.find(b => b.type === type)?.icon || Link2;

const SAMPLE_BLOCKS: Block[] = [
  { id: "1", type: "link", title: "Meu Instagram", description: "instagram.com/usuario", active: true },
  { id: "2", type: "produto", title: "Ebook: Guia do Criador", description: "R$ 29,90", active: true },
  { id: "3", type: "video", title: "Vídeo de apresentação", description: "YouTube embed", active: false },
];

const DashboardBlocos = () => {
  const [blocks, setBlocks] = useState<Block[]>(SAMPLE_BLOCKS);
  const [showModal, setShowModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const addBlock = (type: BlockType) => {
    const info = BLOCK_TYPES.find(b => b.type === type)!;
    setBlocks(prev => [...prev, { id: Date.now().toString(), type, title: `Novo ${info.label}`, description: info.desc, active: true }]);
    setShowModal(false);
  };

  const toggleBlock = (id: string) => setBlocks(prev => prev.map(b => b.id === id ? { ...b, active: !b.active } : b));
  const deleteBlock = (id: string) => setBlocks(prev => prev.filter(b => b.id !== id));
  const duplicateBlock = (id: string) => {
    const block = blocks.find(b => b.id === id);
    if (block) setBlocks(prev => [...prev, { ...block, id: Date.now().toString(), title: `${block.title} (cópia)` }]);
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const newBlocks = [...blocks];
    const [moved] = newBlocks.splice(dragIdx, 1);
    newBlocks.splice(idx, 0, moved);
    setBlocks(newBlocks);
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Block list */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1.5">
              <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">Blocos</h1>
              <p className="text-[hsl(var(--dash-text-muted))] text-[15px]">Construa sua página com blocos</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 btn-primary-gradient text-[13px] px-4 py-2.5 rounded-xl active:scale-[0.98]"
            >
              <Plus size={15} /> Criar bloco
            </button>
          </div>

          {blocks.length === 0 ? (
            <div className="text-center py-20 text-[hsl(var(--dash-text-subtle))]">
              <Plus size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum bloco ainda. Crie o primeiro!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {blocks.map((block, idx) => {
                const Icon = getBlockIcon(block.type);
                return (
                  <div
                    key={block.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedBlock(block.id)}
                    className={`
                      flex items-center gap-3 rounded-2xl border p-4 transition-all duration-200 cursor-pointer group
                      ${selectedBlock === block.id
                        ? "border-primary/30 bg-[hsl(var(--dash-accent))]/50 ring-1 ring-primary/10"
                        : "glass-card-hover"
                      }
                      ${!block.active ? "opacity-50" : ""}
                      ${dragIdx === idx ? "opacity-30 scale-[0.98]" : ""}
                    `}
                  >
                    <GripVertical size={15} className="text-[hsl(var(--dash-text-subtle))] cursor-grab flex-shrink-0 opacity-40 group-hover:opacity-70 transition-opacity" />
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={17} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium truncate">{block.title}</p>
                      <p className="text-[hsl(var(--dash-text-subtle))] text-xs truncate mt-0.5">{block.description}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id); }} className="p-1.5 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-primary hover:bg-[hsl(var(--dash-surface-2))] transition-all">
                        <Copy size={13} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedBlock(block.id); }} className="p-1.5 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-primary hover:bg-[hsl(var(--dash-surface-2))] transition-all">
                        <Pencil size={13} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }} className="p-1.5 rounded-lg text-[hsl(var(--dash-text-subtle))] hover:text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleBlock(block.id); }}
                      className="flex-shrink-0 ml-1"
                    >
                      {block.active ? (
                        <ToggleRight size={26} className="text-primary" />
                      ) : (
                        <ToggleLeft size={26} className="text-[hsl(var(--dash-text-subtle))]" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Live preview */}
        <div className="hidden lg:block w-[340px] flex-shrink-0">
          <div className="sticky top-8">
            <p className="text-[hsl(var(--dash-text-subtle))] text-xs font-medium mb-3 uppercase tracking-wider">Pré-visualização</p>
            <div className="relative">
              <div className="rounded-[2.5rem] border-[3px] border-[hsl(var(--dash-border))] bg-[hsl(var(--dash-surface))] p-3 shadow-xl">
                <div className="flex justify-center mb-2">
                  <div className="w-20 h-5 rounded-full bg-[hsl(var(--dash-surface-2))]" />
                </div>
                <div className="rounded-[1.8rem] bg-gradient-to-b from-[hsl(var(--dash-bg))] to-[hsl(var(--dash-surface))] min-h-[500px] p-5 space-y-3 overflow-hidden">
                  <div className="flex flex-col items-center mb-5">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mb-2.5 ring-2 ring-primary/10" />
                    <p className="text-[hsl(var(--dash-text))] text-sm font-semibold">@usuario</p>
                    <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-0.5">Minha vitrine digital</p>
                  </div>
                  {blocks.filter(b => b.active).map(block => {
                    const BlockIcon = getBlockIcon(block.type);
                    return (
                      <div
                        key={block.id}
                        className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                          selectedBlock === block.id
                            ? "border-primary bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10"
                            : "border-[hsl(var(--dash-border-subtle))] bg-[hsl(var(--dash-surface))]"
                        }`}
                      >
                        <BlockIcon size={13} className="text-primary flex-shrink-0" />
                        <span className="text-[hsl(var(--dash-text))] text-xs truncate">{block.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add block modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative glass-card rounded-2xl p-6 md:p-7 w-full max-w-lg shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-7">
              <h3 className="text-[hsl(var(--dash-text))] font-semibold text-lg">Escolha o tipo de bloco</h3>
              <button onClick={() => setShowModal(false)} className="text-[hsl(var(--dash-text-subtle))] hover:text-[hsl(var(--dash-text))] transition-colors p-1">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {BLOCK_TYPES.map(({ type, label, icon: Icon, desc }) => (
                <button
                  key={type}
                  onClick={() => addBlock(type)}
                  className="flex items-start gap-3 p-4 rounded-xl border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 hover:bg-[hsl(var(--dash-accent))]/50 transition-all text-left group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center flex-shrink-0 group-hover:ring-primary/20 transition-all">
                    <Icon size={15} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[hsl(var(--dash-text))] text-[13px] font-medium">{label}</p>
                    <p className="text-[hsl(var(--dash-text-subtle))] text-xs mt-0.5">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBlocos;
