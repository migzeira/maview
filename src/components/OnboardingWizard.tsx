import { useState, useRef, useEffect } from "react";
import {
  Palette, Camera, User, Sparkles, ArrowRight, ArrowLeft,
  Check, X, PartyPopper, Copy, ExternalLink,
} from "lucide-react";
import { uploadImage } from "@/lib/vitrine-sync";

/* ── Types ─────────────────────────────────────── */
interface OnboardingProps {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
  theme: string;
  onUpdate: (key: string, value: string) => void;
  onSelectTheme: (themeId: string) => void;
  onApplyPack?: (packId: string) => void;
  onComplete: () => void;
}

/* ── 8 Templates Premium Showcase (igual aba Design) ──────────────── */
const SHOWCASE_PACKS = [
  { id: "showcase-financas", emoji: "💼", label: "Finanças",    nicho: "Consultor / Mentor",   bg: "#ffffff", accent: "#6366f1", accent2: "#8b5cf6", theme: "white" },
  { id: "showcase-dj",       emoji: "🎧", label: "DJ / Música", nicho: "Artista / Produtor",   bg: "#0a0010", accent: "#ec4899", accent2: "#8b5cf6", theme: "neon-pink" },
  { id: "showcase-beleza",   emoji: "💄", label: "Beleza",      nicho: "Estética / Maquiagem", bg: "#100509", accent: "#f43f5e", accent2: "#fb7185", theme: "rose" },
  { id: "showcase-branding", emoji: "✨", label: "Branding",    nicho: "Designer / Agência",   bg: "#faf7f2", accent: "#d97706", accent2: "#b45309", theme: "cream" },
  { id: "showcase-growth",   emoji: "🚀", label: "Growth",      nicho: "Marketing / SaaS",     bg: "#000000", accent: "#ffffff", accent2: "#a0a0a0", theme: "pure-black" },
  { id: "showcase-moda",     emoji: "👗", label: "Moda",        nicho: "Estilista / Influencer", bg: "#faf7f2", accent: "#d97706", accent2: "#b45309", theme: "cream" },
  { id: "showcase-fotografia", emoji: "📸", label: "Fotografia", nicho: "Fotógrafo / Visual",  bg: "#f8f9fa", accent: "#6366f1", accent2: "#8b5cf6", theme: "white" },
  { id: "showcase-clinica",  emoji: "🌿", label: "Wellness",    nicho: "Clínica / Saúde",      bg: "#050f05", accent: "#4ade80", accent2: "#34d399", theme: "forest" },
];

/* ── AI bio suggestions ────────────────────────── */
const AI_BIO_IDEAS = [
  "Criador de conteúdo | Ajudo você a crescer online",
  "Empreendedor digital | Transformando ideias em resultados",
  "Especialista em marketing | +10k alunos impactados",
  "Apaixonado por ensinar | Conteúdo que transforma vidas",
  "Designer & criador | Feito com amor e propósito",
];

const OnboardingWizard = ({
  displayName, username, bio, avatarUrl, theme,
  onUpdate, onSelectTheme, onApplyPack, onComplete,
}: OnboardingProps) => {
  const [step, setStep] = useState(0);
  const [localName, setLocalName] = useState(displayName || "");
  const [localBio, setLocalBio] = useState(bio || "");
  const [selectedPack, setSelectedPack] = useState<string>("showcase-financas");
  const [previewAvatar, setPreviewAvatar] = useState(avatarUrl || "");
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileUrl = username
    ? `${window.location.origin}/${username.replace(/^@/, "")}`
    : "";

  /* ── Step 1: Apply showcase pack (template completo) ──────────── */
  const handlePackSelect = (pack: typeof SHOWCASE_PACKS[0]) => {
    setSelectedPack(pack.id);
    onSelectTheme(pack.theme);
    if (onApplyPack) onApplyPack(pack.id);
  };

  /* ── Step 2: Avatar upload ────────── */
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = () => setPreviewAvatar(reader.result as string);
    reader.readAsDataURL(file);
    // Upload to Supabase Storage (fallback to base64)
    const publicUrl = await uploadImage(file, "avatars");
    if (publicUrl) {
      setPreviewAvatar(publicUrl);
      onUpdate("avatarUrl", publicUrl);
    } else {
      // fallback: use base64 from reader
      onUpdate("avatarUrl", previewAvatar || "");
    }
  };

  /* ── Step 3: Save name & bio ──────── */
  const saveNameBio = () => {
    if (localName.trim()) onUpdate("displayName", localName.trim());
    if (localBio.trim()) onUpdate("bio", localBio.trim());
  };

  const useAiBio = () => {
    const random = AI_BIO_IDEAS[Math.floor(Math.random() * AI_BIO_IDEAS.length)];
    setLocalBio(random);
  };

  /* ── Step 4: Celebration ──────────── */
  useEffect(() => {
    if (step === 3) {
      saveNameBio();
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(t);
    }
  }, [step]);

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const next = () => {
    if (step === 2) saveNameBio();
    setStep(s => Math.min(s + 1, 3));
  };
  const prev = () => setStep(s => Math.max(s - 1, 0));

  /* ── Progress bar: starts at 25% (endowed progress) ─ */
  const progress = 25 + (step / 3) * 75;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-lg bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))] rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: "page-enter 0.35s ease-out" }}>

        {/* Progress bar */}
        <div className="h-1 bg-[hsl(var(--dash-surface-2))]">
          <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-r-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }} />
        </div>

        {/* Close */}
        <button onClick={onComplete}
          className="absolute top-4 right-4 z-10 p-2 rounded-full text-[hsl(var(--dash-text-subtle))] hover:text-[hsl(var(--dash-text))] hover:bg-[hsl(var(--dash-surface-2))] transition-all">
          <X size={18} />
        </button>

        <div className="p-6 md:p-8">
          {/* Step dots */}
          <div className="flex justify-center gap-2 mb-6">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/50" : "w-4 bg-[hsl(var(--dash-border))]"
              }`} />
            ))}
          </div>

          {/* ════ STEP 0: Escolha seu nicho (template premium) ════ */}
          {step === 0 && (
            <div style={{ animation: "fadeSlideUp 0.3s ease both" }}>
              <div className="text-center mb-5">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                  <Sparkles size={24} className="text-primary" />
                </div>
                <h2 className="text-[hsl(var(--dash-text))] text-xl font-bold">Qual seu nicho?</h2>
                <p className="text-[hsl(var(--dash-text-muted))] text-sm mt-1">
                  Vamos sugerir o template ideal · você pode trocar depois
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-6 max-h-[400px] overflow-y-auto scrollbar-none px-1 py-1">
                {SHOWCASE_PACKS.map(p => {
                  const active = selectedPack === p.id;
                  return (
                    <button key={p.id} onClick={() => handlePackSelect(p)}
                      className={`relative rounded-2xl p-3 border-2 transition-all duration-200 group text-left ${
                        active
                          ? "border-primary shadow-lg shadow-primary/20 scale-[1.02] bg-primary/5"
                          : "border-[hsl(var(--dash-border-subtle))] hover:border-primary/40 bg-[hsl(var(--dash-surface-2))]"
                      }`}>
                      {/* Mini-preview da vitrine */}
                      <div className="w-full aspect-[3/4] rounded-xl overflow-hidden mb-2.5 relative shadow-md"
                        style={{ background: p.bg }}>
                        <div className="absolute inset-0 p-3 flex flex-col items-center justify-center gap-1.5">
                          <div className="text-2xl">{p.emoji}</div>
                          <div className="w-7 h-7 rounded-full" style={{ background: `linear-gradient(135deg, ${p.accent}, ${p.accent2})` }} />
                          <div className="w-12 h-1 rounded-full mt-1" style={{ background: p.accent + "70" }} />
                          <div className="w-9 h-1 rounded-full" style={{ background: p.accent + "40" }} />
                          <div className="w-full h-3 rounded mt-1" style={{ background: p.accent + "20", border: `1px solid ${p.accent}40` }} />
                          <div className="w-full h-3 rounded" style={{ background: p.accent + "15", border: `1px solid ${p.accent}30` }} />
                        </div>
                      </div>
                      <div>
                        <p className={`text-[12px] font-bold ${active ? "text-primary" : "text-[hsl(var(--dash-text))]"}`}>
                          {p.emoji} {p.label}
                        </p>
                        <p className="text-[10px] text-[hsl(var(--dash-text-subtle))] mt-0.5 truncate">{p.nicho}</p>
                      </div>
                      {active && (
                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg ring-2 ring-[hsl(var(--dash-surface))]">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════ STEP 1: Photo ════ */}
          {step === 1 && (
            <div style={{ animation: "fadeSlideUp 0.3s ease both" }}>
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                  <Camera size={24} className="text-primary" />
                </div>
                <h2 className="text-[hsl(var(--dash-text))] text-xl font-bold">Adicione sua foto</h2>
                <p className="text-[hsl(var(--dash-text-muted))] text-sm mt-1">Perfis com foto recebem 80% mais cliques</p>
              </div>

              <div className="flex flex-col items-center gap-4 mb-6">
                <button onClick={() => fileInputRef.current?.click()}
                  className="relative w-28 h-28 rounded-full border-2 border-dashed border-primary/40 hover:border-primary transition-all overflow-hidden group">
                  {previewAvatar ? (
                    <img src={previewAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-primary/5 group-hover:bg-primary/10 transition-colors">
                      <Camera size={24} className="text-primary/60 mb-1" />
                      <span className="text-[10px] text-primary/60 font-medium">Upload</span>
                    </div>
                  )}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <p className="text-[hsl(var(--dash-text-subtle))] text-xs">JPG, PNG ou WebP — máx. 2MB</p>
              </div>
            </div>
          )}

          {/* ════ STEP 2: Name & Bio ════ */}
          {step === 2 && (
            <div style={{ animation: "fadeSlideUp 0.3s ease both" }}>
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                  <User size={24} className="text-primary" />
                </div>
                <h2 className="text-[hsl(var(--dash-text))] text-xl font-bold">Sobre você</h2>
                <p className="text-[hsl(var(--dash-text-muted))] text-sm mt-1">Conte para seus visitantes quem você é</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--dash-text-secondary))] mb-1.5 block">Nome</label>
                  <input type="text" value={localName}
                    onChange={e => setLocalName(e.target.value)}
                    placeholder="Seu nome ou marca"
                    className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all placeholder:text-[hsl(var(--dash-text-subtle))]" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-[hsl(var(--dash-text-secondary))]">Bio</label>
                    <button onClick={useAiBio}
                      className="flex items-center gap-1 text-[10px] text-primary font-medium hover:underline">
                      <Sparkles size={10} /> Gerar com IA
                    </button>
                  </div>
                  <textarea value={localBio}
                    onChange={e => setLocalBio(e.target.value)}
                    placeholder="Ex: Criador de conteúdo | Ajudo você a crescer online"
                    rows={3} maxLength={160}
                    className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text))] text-sm resize-none focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all placeholder:text-[hsl(var(--dash-text-subtle))]" />
                  <p className="text-right text-[10px] text-[hsl(var(--dash-text-subtle))] mt-1">{localBio.length}/160</p>
                </div>
              </div>
            </div>
          )}

          {/* ════ STEP 3: Celebration ════ */}
          {step === 3 && (
            <div style={{ animation: "fadeSlideUp 0.3s ease both" }}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-3 celebrate">
                  <PartyPopper size={28} className="text-primary" />
                </div>
                <h2 className="text-[hsl(var(--dash-text))] text-2xl font-extrabold">Sua vitrine está no ar!</h2>
                <p className="text-[hsl(var(--dash-text-muted))] text-sm mt-1">Agora é só compartilhar e começar a vender</p>
              </div>

              {/* Mini preview */}
              <div className="mx-auto w-48 rounded-2xl overflow-hidden border border-[hsl(var(--dash-border-subtle))] shadow-lg mb-5"
                style={{ background: STYLE_PACKS.find(t => t.id === selectedTheme)?.bg || "#080612" }}>
                <div className="p-4 flex flex-col items-center gap-2">
                  {previewAvatar ? (
                    <img src={previewAvatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <span className="text-white font-bold">{(localName || "M")[0].toUpperCase()}</span>
                    </div>
                  )}
                  <p className="text-white text-xs font-bold">{localName || "Seu Nome"}</p>
                  {localBio && <p className="text-white/60 text-[9px] text-center line-clamp-2">{localBio}</p>}
                  <div className="w-full h-3 rounded-md mt-1" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <div className="w-full h-3 rounded-md" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} />
                </div>
              </div>

              {/* Share actions */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button onClick={copyLink}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text-secondary))] text-sm font-medium hover:border-primary/30 transition-all">
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  {copied ? "Copiado!" : "Copiar link"}
                </button>
                {profileUrl && (
                  <a href={profileUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3 rounded-xl btn-primary-gradient text-sm font-semibold">
                    <ExternalLink size={14} /> Ver vitrine
                  </a>
                )}
                {/* WhatsApp share */}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Confira minha vitrine: ${profileUrl}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.458-1.495A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.3 0-4.438-.744-6.166-2.006l-.43-.322-2.657.89.89-2.657-.322-.43A9.935 9.935 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                  WhatsApp
                </a>
                {/* Native share (mobile) */}
                {"share" in navigator && (
                  <button
                    onClick={() => navigator.share?.({ title: "Minha vitrine Maview", url: profileUrl }).catch(() => {})}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] text-[hsl(var(--dash-text-secondary))] text-sm font-medium hover:border-primary/30 transition-all"
                  >
                    <ArrowRight size={14} /> Compartilhar
                  </button>
                )}
              </div>

              {/* Confetti particles */}
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className="absolute w-2 h-2 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `-5%`,
                        background: ["#a855f7", "#ec4899", "#f59e0b", "#10b981", "#60a5fa", "#f43f5e"][i % 6],
                        animation: `confetti-fall ${1.5 + Math.random() * 2}s ease-out ${Math.random() * 0.5}s forwards`,
                        opacity: 0.9,
                      }} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Navigation buttons ── */}
          <div className="flex gap-3">
            {step > 0 && step < 3 && (
              <button onClick={prev}
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-[hsl(var(--dash-border))] text-[hsl(var(--dash-text-muted))] text-sm font-medium hover:bg-[hsl(var(--dash-surface-2))] transition-all">
                <ArrowLeft size={14} /> Voltar
              </button>
            )}
            {step < 3 ? (
              <button onClick={next}
                className="flex-1 btn-primary-gradient text-sm py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                {step === 0 ? "Começar" : "Próximo"} <ArrowRight size={14} />
              </button>
            ) : (
              <button onClick={onComplete}
                className="flex-1 btn-primary-gradient text-sm py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                Explorar minha vitrine <Sparkles size={14} />
              </button>
            )}
          </div>

          {step < 3 && (
            <button onClick={onComplete}
              className="w-full text-center text-[hsl(var(--dash-text-subtle))] text-[11px] mt-3 hover:text-primary transition-colors">
              Pular e montar sozinho
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
