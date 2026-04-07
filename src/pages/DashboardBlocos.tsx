import { useState } from "react";
import {
  Plus, GripVertical, Pencil, Trash2, Copy, Link2, ShoppingBag,
  Type, Image, Video, CreditCard, Mail, ToggleLeft, ToggleRight,
  X, Smartphone,
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

const getBlockIcon = (type: BlockType) => {
  return BLOCK_TYPES.find(b => b.type === type)?.icon || Link2;
};

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
    setBlocks(prev => [...prev, {
      id: Date.now().toString(),
      type,
      title: `Novo ${info.label}`,
      description: info.desc,
      active: true,
    }]);
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
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Block list */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Blocos</h1>
              <p className="text-[#A78BFA]/50 text-sm mt-1">Construa sua página com blocos</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-[#6D28D9] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#7C3AED] transition-all active:scale-[0.98] shadow-lg shadow-[#6D28D9]/20"
            >
              <Plus size={16} /> Criar bloco
            </button>
          </div>

          {blocks.length === 0 ? (
            <div className="text-center py-20 text-[#A78BFA]/30">
              <Plus size={40} className="mx-auto mb-3" />
              <p className="text-sm">Nenhum bloco ainda. Crie o primeiro!</p>
            </div>
          ) : (
            <div className="space-y-3">
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
                    className={`flex items-center gap-3 rounded-2xl border p-4 transition-all duration-200 cursor-pointer group ${
                      selectedBlock === block.id
                        ? "border-[#6D28D9]/50 bg-[#6D28D9]/10"
                        : "border-white/[0.06] bg-[#1A1333] hover:border-white/[0.12]"
                    } ${!block.active ? "opacity-50" : ""} ${dragIdx === idx ? "opacity-30" : ""}`}
                  >
                    <GripVertical size={16} className="text-[#A78BFA]/20 cursor-grab flex-shrink-0" />
                    <div className="w-10 h-10 rounded-xl bg-[#6D28D9]/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-[#A78BFA]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{block.title}</p>
                      <p className="text-[#A78BFA]/40 text-xs truncate">{block.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id); }} className="p-1.5 rounded-lg text-[#A78BFA]/30 hover:text-[#A78BFA] hover:bg-white/5 transition-all">
                        <Copy size={14} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedBlock(block.id); }} className="p-1.5 rounded-lg text-[#A78BFA]/30 hover:text-[#A78BFA] hover:bg-white/5 transition-all">
                        <Pencil size={14} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }} className="p-1.5 rounded-lg text-[#A78BFA]/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleBlock(block.id); }}
                      className="flex-shrink-0 ml-1"
                    >
                      {block.active ? (
                        <ToggleRight size={28} className="text-[#6D28D9]" />
                      ) : (
                        <ToggleLeft size={28} className="text-[#A78BFA]/20" />
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
            <p className="text-[#A78BFA]/40 text-xs font-medium mb-3 uppercase tracking-wider">Pré-visualização</p>
            <div className="relative">
              {/* Phone frame */}
              <div className="rounded-[2.5rem] border-[3px] border-white/[0.08] bg-[#0F0B1F] p-3 shadow-2xl shadow-[#6D28D9]/10">
                {/* Notch */}
                <div className="flex justify-center mb-2">
                  <div className="w-20 h-5 rounded-full bg-black/80" />
                </div>
                {/* Screen */}
                <div className="rounded-[1.8rem] bg-gradient-to-b from-[#1A1333] to-[#0F0B1F] min-h-[500px] p-5 space-y-3 overflow-hidden">
                  {/* Avatar */}
                  <div className="flex flex-col items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] mb-2" />
                    <p className="text-white text-sm font-semibold">@usuario</p>
                    <p className="text-[#A78BFA]/40 text-xs">Minha vitrine digital</p>
                  </div>
                  {/* Blocks preview */}
                  {blocks.filter(b => b.active).map(block => {
                    const Icon = getBlockIcon(block.type);
                    return (
                      <div
                        key={block.id}
                        className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                          selectedBlock === block.id
                            ? "border-[#6D28D9] bg-[#6D28D9]/20 ring-1 ring-[#6D28D9]/30"
                            : "border-white/[0.06] bg-white/[0.03]"
                        }`}
                      >
                        <Icon size={14} className="text-[#A78BFA] flex-shrink-0" />
                        <span className="text-white text-xs truncate">{block.title}</span>
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
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#1A1333] border border-white/[0.08] rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">Escolha o tipo de bloco</h3>
              <button onClick={() => setShowModal(false)} className="text-[#A78BFA]/30 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {BLOCK_TYPES.map(({ type, label, icon: Icon, desc }) => (
                <button
                  key={type}
                  onClick={() => addBlock(type)}
                  className="flex items-start gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-[#6D28D9]/40 hover:bg-[#6D28D9]/10 transition-all text-left group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#6D28D9]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#6D28D9]/20 transition-colors">
                    <Icon size={16} className="text-[#A78BFA]" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{label}</p>
                    <p className="text-[#A78BFA]/40 text-xs mt-0.5">{desc}</p>
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
