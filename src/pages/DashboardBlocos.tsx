import { useState, useEffect } from "react";
import {
  Plus, GripVertical, Pencil, Trash2, Copy, Link2, ShoppingBag,
  Type, Image, Video, CreditCard, Mail, ToggleLeft, ToggleRight, X, Info,
} from "lucide-react";

type BlockType = "link" | "produto" | "texto" | "imagem" | "video" | "pagamento" | "email";

interface Block {
  id: string;
  type: BlockType;
  title: string;
  description: string;
  active: boolean;
}

interface VitrineLink {
  id: string;
  title: string;
  url: string;
  icon: "instagram" | "youtube" | "twitter" | "globe" | "link";
  active: boolean;
  isSocial: boolean;
}

interface VitrineConfig {
  links: VitrineLink[];
  [key: string]: unknown;
}

const VITRINE_KEY = "maview_vitrine_config";

function loadVitrineConfig(): VitrineConfig | null {
  try {
    const raw = localStorage.getItem(VITRINE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VitrineConfig;
  } catch {
    return null;
  }
}

function saveVitrineConfig(config: VitrineConfig) {
  localStorage.setItem(VITRINE_KEY, JSON.stringify(config));
}

function getVitrineLinks(): VitrineLink[] {
  return loadVitrineConfig()?.links ?? [];
}

function upsertVitrineLink(link: VitrineLink) {
  const config = loadVitrineConfig() ?? { links: [] };
  const idx = config.links.findIndex(l => l.id === link.id);
  if (idx >= 0) {
    config.links[idx] = link;
  } else {
    config.links.push(link);
  }
  saveVitrineConfig(config);
}

function removeVitrineLink(id: string) {
  const config = loadVitrineConfig();
  if (!config) return;
  config.links = config.links.filter(l => l.id !== id);
  saveVitrineConfig(config);
}

function updateVitrineLinkActive(id: string, active: boolean) {
  const config = loadVitrineConfig();
  if (!config) return;
  const link = config.links.find(l => l.id === id);
  if (link) {
    link.active = active;
    saveVitrineConfig(config);
  }
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

const SAMPLE_NON_LINK_BLOCKS: Block[] = [
  { id: "2", type: "produto", title: "Ebook: Guia do Criador", description: "R$ 29,90", active: true },
  { id: "3", type: "video", title: "Vídeo de apresentação", description: "YouTube embed", active: false },
];

function buildInitialBlocks(): Block[] {
  const vitrineLinks = getVitrineLinks();
  const linkBlocks: Block[] = vitrineLinks.map(l => ({
    id: l.id,
    type: "link" as BlockType,
    title: l.title,
    description: l.url,
    active: l.active,
  }));
  return [...linkBlocks, ...SAMPLE_NON_LINK_BLOCKS];
}

// Modal step: "pick-type" | "link-form" | null
type ModalStep = "pick-type" | "link-form" | null;

const DashboardBlocos = () => {
  const [blocks, setBlocks] = useState<Block[]>(buildInitialBlocks);
  const [modalStep, setModalStep] = useState<ModalStep>(null);
  const [linkForm, setLinkForm] = useState({ title: "", url: "" });
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [infoBannerDismissed, setInfoBannerDismissed] = useState(false);

  // Re-sync link blocks from localStorage on mount (in case vitrine was updated elsewhere)
  useEffect(() => {
    const vitrineLinks = getVitrineLinks();
    if (vitrineLinks.length === 0) return;
    setBlocks(prev => {
      const nonLinkBlocks = prev.filter(b => b.type !== "link");
      const linkBlocks: Block[] = vitrineLinks.map(l => ({
        id: l.id,
        type: "link" as BlockType,
        title: l.title,
        description: l.url,
        active: l.active,
      }));
      return [...linkBlocks, ...nonLinkBlocks];
    });
  }, []);

  const openModal = () => setModalStep("pick-type");
  const closeModal = () => {
    setModalStep(null);
    setLinkForm({ title: "", url: "" });
  };

  const handlePickType = (type: BlockType) => {
    if (type === "link") {
      setModalStep("link-form");
      return;
    }
    const info = BLOCK_TYPES.find(b => b.type === type)!;
    setBlocks(prev => [
      ...prev,
      { id: Date.now().toString(), type, title: `Novo ${info.label}`, description: info.desc, active: true },
    ]);
    closeModal();
  };

  const handleSaveLinkBlock = () => {
    const title = linkForm.title.trim() || "Novo Link";
    const url = linkForm.url.trim() || "";
    const id = Date.now().toString();

    const newBlock: Block = { id, type: "link", title, description: url, active: true };
    setBlocks(prev => [...prev, newBlock]);

    const vitrineLink: VitrineLink = {
      id,
      title,
      url,
      icon: "link",
      active: true,
      isSocial: false,
    };
    upsertVitrineLink(vitrineLink);
    closeModal();
  };

  const toggleBlock = (id: string) => {
    setBlocks(prev =>
      prev.map(b => {
        if (b.id !== id) return b;
        const next = { ...b, active: !b.active };
        if (b.type === "link") updateVitrineLinkActive(id, next.active);
        return next;
      })
    );
  };

  const deleteBlock = (id: string) => {
    const block = blocks.find(b => b.id === id);
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (block?.type === "link") removeVitrineLink(id);
  };

  const duplicateBlock = (id: string) => {
    const block = blocks.find(b => b.id === id);
    if (!block) return;
    const newId = Date.now().toString();
    const copy: Block = { ...block, id: newId, title: `${block.title} (cópia)` };
    setBlocks(prev => [...prev, copy]);
    if (block.type === "link") {
      upsertVitrineLink({
        id: newId,
        title: copy.title,
        url: copy.description,
        icon: "link",
        active: copy.active,
        isSocial: false,
      });
    }
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

  const hasLinkBlocks = blocks.some(b => b.type === "link");

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
              onClick={openModal}
              className="flex items-center gap-2 btn-primary-gradient text-[13px] px-4 py-2.5 rounded-xl active:scale-[0.98]"
            >
              <Plus size={15} /> Criar bloco
            </button>
          </div>

          {/* Info banner */}
          {hasLinkBlocks && !infoBannerDismissed && (
            <div className="flex items-center justify-between gap-3 mb-4 px-4 py-2.5 rounded-xl border border-blue-400/20 bg-blue-500/8 text-blue-400/80">
              <div className="flex items-center gap-2">
                <Info size={13} className="flex-shrink-0 opacity-70" />
                <span className="text-xs">💡 Blocos de link aparecem automaticamente na sua vitrine</span>
              </div>
              <button
                onClick={() => setInfoBannerDismissed(true)}
                className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                aria-label="Fechar"
              >
                <X size={13} />
              </button>
            </div>
          )}

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

      {/* Add block modal — step 1: pick type */}
      {modalStep === "pick-type" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative glass-card rounded-2xl p-6 md:p-7 w-full max-w-lg shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-7">
              <h3 className="text-[hsl(var(--dash-text))] font-semibold text-lg">Escolha o tipo de bloco</h3>
              <button onClick={closeModal} className="text-[hsl(var(--dash-text-subtle))] hover:text-[hsl(var(--dash-text))] transition-colors p-1">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {BLOCK_TYPES.map(({ type, label, icon: Icon, desc }) => (
                <button
                  key={type}
                  onClick={() => handlePickType(type)}
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

      {/* Add block modal — step 2: link form */}
      {modalStep === "link-form" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative glass-card rounded-2xl p-6 md:p-7 w-full max-w-md shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[hsl(var(--dash-accent))] ring-1 ring-primary/10 flex items-center justify-center">
                  <Link2 size={14} className="text-primary" />
                </div>
                <h3 className="text-[hsl(var(--dash-text))] font-semibold text-lg">Novo bloco de link</h3>
              </div>
              <button onClick={closeModal} className="text-[hsl(var(--dash-text-subtle))] hover:text-[hsl(var(--dash-text))] transition-colors p-1">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[hsl(var(--dash-text))] text-[13px] font-medium mb-1.5">
                  Título
                </label>
                <input
                  type="text"
                  placeholder="Ex: Meu Instagram"
                  value={linkForm.title}
                  onChange={e => setLinkForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-xl border border-[hsl(var(--dash-border-subtle))] bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text))] placeholder:text-[hsl(var(--dash-text-subtle))] text-[13px] px-3.5 py-2.5 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[hsl(var(--dash-text))] text-[13px] font-medium mb-1.5">
                  URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={linkForm.url}
                  onChange={e => setLinkForm(f => ({ ...f, url: e.target.value }))}
                  onKeyDown={e => { if (e.key === "Enter") handleSaveLinkBlock(); }}
                  className="w-full rounded-xl border border-[hsl(var(--dash-border-subtle))] bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text))] placeholder:text-[hsl(var(--dash-text-subtle))] text-[13px] px-3.5 py-2.5 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-2.5 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 rounded-xl border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text-subtle))] text-[13px] py-2.5 hover:bg-[hsl(var(--dash-surface-2))] transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveLinkBlock}
                className="flex-1 btn-primary-gradient rounded-xl text-[13px] py-2.5 active:scale-[0.98]"
              >
                Adicionar link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBlocos;
