import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { initialLoad, loadLocal, saveWithSync, fetchLeads, fetchOrders } from "@/lib/vitrine-sync";
import { Link } from "react-router-dom";
import StanleyAvatar from "@/components/StanleyAvatar";
import {
  CheckCircle2, Circle, ArrowRight,
  Copy, Check, ExternalLink,
  QrCode, X, Download, MessageCircle, Clock,
  Sparkles, Package, Link2, Star, Image, FileText,
  Trophy, Share2, BarChart3, PartyPopper,
  Lightbulb, Award, Flame, Zap, Heart, Eye,
  TrendingUp, Users, ShoppingBag, Palette,
} from "lucide-react";

/* ── Config ─────────────────────────────────────────────────── */

/* ── Health ─────────────────────────────────────────────────── */
interface HealthStep {
  key: string;
  label: string;
  tip: string;
  points: number;
  done: boolean;
  path: string;
}

function buildHealthSteps(cfg: Record<string, unknown>): HealthStep[] {
  const products = ((cfg.products as { active: boolean }[]) || []).filter(p => p.active);
  const links = ((cfg.links as unknown[]) || []);
  const testimonials = ((cfg.testimonials as unknown[]) || []);
  return [
    { key: "avatar", label: "Foto de perfil", tip: "Perfis com foto recebem 80% mais cliques", points: 15, done: !!cfg.avatarUrl, path: "/dashboard/pagina" },
    { key: "bio", label: "Nome e bio", tip: "Complete para gerar confiança", points: 10, done: !!(cfg.displayName && cfg.bio), path: "/dashboard/pagina" },
    { key: "theme", label: "Tema escolhido", tip: "Visual consistente reforça sua marca", points: 10, done: !!cfg.theme, path: "/dashboard/pagina" },
    { key: "product", label: "Primeiro produto", tip: "Produtos geram receita direta", points: 20, done: products.length > 0, path: "/dashboard/pagina" },
    { key: "links", label: "Links adicionados", tip: "Conecte suas redes sociais", points: 15, done: links.length > 0, path: "/dashboard/pagina" },
    { key: "testimonials", label: "Depoimento", tip: "Prova social aumenta conversão em 72%", points: 15, done: testimonials.length > 0, path: "/dashboard/pagina" },
    { key: "whatsapp", label: "WhatsApp", tip: "Contato direto converte 3x mais", points: 15, done: !!cfg.whatsapp, path: "/dashboard/pagina" },
  ];
}

/* ── Greeting ──────────────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

/* ── Theme map (full, matches Profile.tsx) ─────────────────── */
const THEMES: Record<string, { bg: string; accent: string; accent2: string; card: string; text: string; sub: string; border: string }> = {
  "dark-purple": { bg: "#080612", accent: "#a855f7", accent2: "#ec4899", card: "#13102a", text: "#f8f5ff", sub: "rgba(248,245,255,0.80)", border: "rgba(168,85,247,0.28)" },
  "midnight":    { bg: "#05080f", accent: "#60a5fa", accent2: "#818cf8", card: "#0d1524", text: "#f0f6ff", sub: "rgba(240,246,255,0.80)", border: "rgba(96,165,250,0.28)" },
  "forest":      { bg: "#050f05", accent: "#4ade80", accent2: "#34d399", card: "#0a1a0a", text: "#f0fff4", sub: "rgba(240,255,244,0.80)", border: "rgba(74,222,128,0.28)" },
  "rose":        { bg: "#100509", accent: "#f43f5e", accent2: "#fb7185", card: "#1e0912", text: "#fff0f3", sub: "rgba(255,240,243,0.80)", border: "rgba(244,63,94,0.28)" },
  "amber":       { bg: "#0f0a00", accent: "#f59e0b", accent2: "#fcd34d", card: "#1f1500", text: "#fffbeb", sub: "rgba(255,251,235,0.80)", border: "rgba(245,158,11,0.28)" },
  "ocean":       { bg: "#020c14", accent: "#06b6d4", accent2: "#22d3ee", card: "#051e30", text: "#ecfeff", sub: "rgba(236,254,255,0.80)", border: "rgba(6,182,212,0.28)" },
  "neon-pink":   { bg: "#0a0010", accent: "#ff2d95", accent2: "#ff6ec7", card: "#1a0828", text: "#fff0f8", sub: "rgba(255,240,248,0.80)", border: "rgba(255,45,149,0.28)" },
  "sunset":      { bg: "#0f0805", accent: "#f97316", accent2: "#ef4444", card: "#1f150a", text: "#fff7ed", sub: "rgba(255,247,237,0.80)", border: "rgba(249,115,22,0.28)" },
  "lavender":    { bg: "#0c0a14", accent: "#c084fc", accent2: "#a78bfa", card: "#1a1530", text: "#f5f0ff", sub: "rgba(245,240,255,0.80)", border: "rgba(192,132,252,0.28)" },
  "emerald":     { bg: "#021a0f", accent: "#10b981", accent2: "#6ee7b7", card: "#0a2a1a", text: "#ecfdf5", sub: "rgba(236,253,245,0.80)", border: "rgba(16,185,129,0.28)" },
  "crimson":     { bg: "#120508", accent: "#dc2626", accent2: "#f87171", card: "#220a10", text: "#fff1f2", sub: "rgba(255,241,242,0.80)", border: "rgba(220,38,38,0.28)" },
  "arctic":      { bg: "#050a10", accent: "#38bdf8", accent2: "#7dd3fc", card: "#0c1828", text: "#f0f9ff", sub: "rgba(240,249,255,0.80)", border: "rgba(56,189,248,0.28)" },
  "gold":        { bg: "#0c0a04", accent: "#eab308", accent2: "#d97706", card: "#1c1808", text: "#fefce8", sub: "rgba(254,252,232,0.80)", border: "rgba(234,179,8,0.28)" },
  "sage":        { bg: "#080c08", accent: "#84cc16", accent2: "#a3e635", card: "#121a12", text: "#f7fee7", sub: "rgba(247,254,231,0.80)", border: "rgba(132,204,22,0.28)" },
  "coral":       { bg: "#0f0808", accent: "#fb923c", accent2: "#f472b6", card: "#1f1212", text: "#fff7ed", sub: "rgba(255,247,237,0.80)", border: "rgba(251,146,60,0.28)" },
  "indigo":      { bg: "#06050f", accent: "#6366f1", accent2: "#a78bfa", card: "#100e28", text: "#eef2ff", sub: "rgba(238,242,255,0.80)", border: "rgba(99,102,241,0.28)" },
  "slate":       { bg: "#0c0e12", accent: "#94a3b8", accent2: "#cbd5e1", card: "#1a1e28", text: "#f8fafc", sub: "rgba(248,250,252,0.80)", border: "rgba(148,163,184,0.28)" },
  "wine":        { bg: "#100408", accent: "#be185d", accent2: "#e11d48", card: "#200a14", text: "#fff0f6", sub: "rgba(255,240,246,0.80)", border: "rgba(190,24,93,0.28)" },
  "custom":      { bg: "#080612", accent: "#a855f7", accent2: "#ec4899", card: "#13102a", text: "#f8f5ff", sub: "rgba(248,245,255,0.80)", border: "rgba(168,85,247,0.28)" },
  "white":       { bg: "#f8f9fa", accent: "#6366f1", accent2: "#8b5cf6", card: "#ffffff", text: "#111827", sub: "rgba(17,24,39,0.65)", border: "rgba(0,0,0,0.08)" },
  "cream":       { bg: "#faf7f2", accent: "#d97706", accent2: "#b45309", card: "#ffffff", text: "#1c1917", sub: "rgba(28,25,23,0.60)", border: "rgba(0,0,0,0.06)" },
  "pure-black":  { bg: "#000000", accent: "#ffffff", accent2: "#a0a0a0", card: "#0a0a0a", text: "#ffffff", sub: "rgba(255,255,255,0.70)", border: "rgba(255,255,255,0.12)" },
  "bold-red":    { bg: "#0a0000", accent: "#ff3333", accent2: "#ff6666", card: "#1a0505", text: "#fff5f5", sub: "rgba(255,245,245,0.80)", border: "rgba(255,51,51,0.25)" },
};

/* ══ COMPONENT ═════════════════════════════════════════════ */
const DashboardHome = () => {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [cfg, setCfg] = useState<Record<string, unknown>>({});
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const profileUrl = username ? `${window.location.origin}/${username.replace(/^@/, "")}` : "";
  const displayUrl = username ? `maview.app/${username.replace(/^@/, "")}` : "";

  /* ── Load (Supabase first, localStorage fallback) ── */
  useEffect(() => {
    (async () => {
      // Use initialLoad which fetches from Supabase (source of truth) and caches in localStorage
      const stored = await initialLoad();
      setCfg(stored);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const m = session.user.user_metadata;
          setDisplayName(
            (stored.displayName as string) || m?.full_name ||
            session.user.email?.split("@")[0] || "Criador"
          );
          setUsername(
            (stored.username as string) || m?.username ||
            session.user.email?.split("@")[0] || ""
          );
        }
      } catch { /* keep stored data */ }
      setTimeout(() => setVisible(true), 60);
    })();
  }, []);

  /* ── QR code ── */
  useEffect(() => {
    if (!showQR || !qrCanvasRef.current || !profileUrl) return;
    import("qrcode").then(QRCode => {
      QRCode.toCanvas(qrCanvasRef.current!, profileUrl, {
        width: 188, margin: 2, color: { dark: "#1a0533", light: "#ffffff" },
      });
    }).catch(() => {});
  }, [showQR, profileUrl]);

  /* ── Derived ── */
  const steps = buildHealthSteps(cfg);
  const health = steps.reduce((s, st) => s + (st.done ? st.points : 0), 0);
  const doneCount = steps.filter(s => s.done).length;
  const nextStep = steps.find(s => !s.done);

  /* ── Animated health counter ── */
  const [animatedHealth, setAnimatedHealth] = useState(0);
  const prevHealthRef = useRef(0);
  const [milestone, setMilestone] = useState<number | null>(null);

  useEffect(() => {
    const from = prevHealthRef.current;
    const to = health;
    if (from === to) { setAnimatedHealth(to); return; }

    const duration = 800;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setAnimatedHealth(Math.round(from + (to - from) * eased));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);

    // Milestone celebrations
    if (to >= 50 && from < 50) setMilestone(50);
    else if (to >= 80 && from < 80) setMilestone(80);
    else if (to >= 100 && from < 100) setMilestone(100);

    prevHealthRef.current = to;
  }, [health]);

  // Auto-dismiss milestone
  useEffect(() => {
    if (milestone === null) return;
    const t = setTimeout(() => setMilestone(null), 3500);
    return () => clearTimeout(t);
  }, [milestone]);

  const products = ((cfg.products as { active: boolean; emoji?: string; title?: string; price?: string; originalPrice?: string; images?: string[]; imageUrl?: string; linkType?: string; bookingDuration?: number; bookingDays?: string[]; badge?: string; description?: string; id?: string }[]) || []).filter(p => p.active);
  const links = ((cfg.links as { title?: string; url?: string; icon?: string; active?: boolean; type?: string; isSocial?: boolean; id?: string }[]) || []);
  const testimonials = ((cfg.testimonials as { name?: string; text?: string; stars?: number; avatar?: string; role?: string; id?: string }[]) || []);
  const blocks = ((cfg.blocks as { id: string; type: string; refId?: string; title?: string; separatorStyle?: string }[]) || []);

  const theme = THEMES[(cfg.theme as string)] || THEMES["dark-purple"];
  const design = (cfg.design as Record<string, unknown>) || {};

  // Resolve design (matches DashboardPagina + Profile.tsx logic)
  const pAccent = (design.accentColor as string) || theme.accent;
  const pAccent2 = (design.accentColor2 as string) || theme.accent2;
  const pBg = (design.bgColor as string) || theme.bg;
  const pText = (design.textColor as string) || theme.text;
  const pSub = (design.subtextColor as string) || theme.sub;
  const pCard = (design.cardBg as string) || theme.card;
  const pBorder = (design.cardBorder as string) || theme.border;
  const pFontH = (design.fontHeading as string) || "Inter";
  const pFontB = (design.fontBody as string) || "Inter";
  const bgType = (design.bgType as string) || "solid";
  const bgGradient = (design.bgGradient as [string, string]) || [pBg, "#1a0a2e"];
  const bgGradientDir = (design.bgGradientDir as string) || "to-b";
  const bgImageUrl = (design.bgImageUrl as string) || "";
  const btnShape = (design.buttonShape as string) || "rounded";
  const btnFill = (design.buttonFill as string) || "solid";
  const btnRadius = (design.buttonRadius as number) ?? 12;
  const btnShadow = (design.buttonShadow as string) || "none";
  const profileShape = (design.profileShape as string) || "circle";
  const profileSize = Math.round(((design.profileSize as number) ?? 88) * 0.7);
  const profileBorder = (design.profileBorder as boolean) ?? true;
  const profileBorderColor = (design.profileBorderColor as string) || pAccent;

  // Derived styles
  const pBtnRadius = btnShape === "pill" ? "999px" : btnShape === "square" ? "4px" : btnShape === "soft" ? "12px" : `${btnRadius}px`;
  const pBtnShadowCss = btnShadow === "glow" ? `0 0 12px ${pAccent}40` : btnShadow === "md" ? "0 3px 8px rgba(0,0,0,0.3)" : btnShadow === "sm" ? "0 1px 4px rgba(0,0,0,0.2)" : "none";
  const pBtnStyle: React.CSSProperties = btnFill === "outline"
    ? { background: "transparent", border: `1.5px solid ${pBorder}`, borderRadius: pBtnRadius, boxShadow: pBtnShadowCss }
    : btnFill === "glass"
    ? { background: `${pCard}aa`, backdropFilter: "blur(8px)", border: `1px solid ${pBorder}`, borderRadius: pBtnRadius, boxShadow: pBtnShadowCss }
    : btnFill === "ghost"
    ? { background: "transparent", borderRadius: pBtnRadius, boxShadow: pBtnShadowCss }
    : { background: pCard, border: `1px solid ${pBorder}`, borderRadius: pBtnRadius, boxShadow: pBtnShadowCss };
  const pProfileRadius = profileShape === "circle" ? "9999px" : profileShape === "rounded" ? "20%" : profileShape === "square" ? "6px" : "0";
  const pProfileClip = profileShape === "hexagon" ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" : undefined;

  // Background CSS
  const previewBgStyle: React.CSSProperties = (() => {
    const GRAD_DIRS: Record<string, string> = { "to-b": "to bottom", "to-t": "to top", "to-r": "to right", "to-l": "to left", "to-br": "to bottom right", "to-bl": "to bottom left", "to-tr": "to top right", "to-tl": "to top left" };
    switch (bgType) {
      case "gradient": {
        if (bgGradientDir === "radial") return { background: `radial-gradient(circle, ${bgGradient[0]}, ${bgGradient[1]})` };
        return { background: `linear-gradient(${GRAD_DIRS[bgGradientDir] || "to bottom"}, ${bgGradient[0]}, ${bgGradient[1]})` };
      }
      case "image": return bgImageUrl ? { backgroundImage: `url(${bgImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: pBg };
      default: return { background: pBg };
    }
  })();

  const healthColor = health >= 80 ? "#10b981" : health >= 50 ? "#a855f7" : health >= 20 ? "#f59e0b" : "#94a3b8";

  /* SVG ring */
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (health / 100) * circ;

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const downloadQR = () => {
    if (!qrCanvasRef.current) return;
    const a = document.createElement("a");
    a.download = `maview-qr-${username}.png`;
    a.href = qrCanvasRef.current.toDataURL();
    a.click();
  };

  /* ── Smart subtitle based on progress ── */
  const getSubtitle = () => {
    if (health === 100) return "Sua vitrine está completa. Hora de compartilhar!";
    if (health >= 80) return "Quase perfeita — finalize os últimos detalhes";
    if (health >= 50) return "Bom progresso! Continue construindo";
    if (nextStep) return nextStep.tip;
    return "Vamos montar sua vitrine?";
  };

  /* ── 4.1: AI Proactive Insights ── */
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    if (!cfg || Object.keys(cfg).length === 0) return;
    // Check cache first (24h TTL)
    const cacheKey = "maview_ai_insights";
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { insights, ts } = JSON.parse(cached);
        if (Date.now() - ts < 24 * 3600000) { setAiInsights(insights); return; }
      } catch {}
    }

    const generateInsights = async () => {
      setInsightsLoading(true);
      try {
        const context = `Modo insights. Dados: health_score=${health}, produtos=${products.length}, links=${links.length}, depoimentos=${testimonials.length}, tema=${cfg.theme || "default"}, bio=${cfg.bio ? "sim" : "nao"}, avatar=${cfg.avatarUrl ? "sim" : "nao"}, whatsapp=${cfg.whatsapp ? "sim" : "nao"}. Gere 2-3 insights curtos e acionáveis em PT-BR. Cada insight em uma linha separada, começando com emoji.`;

        const { data, error } = await supabase.functions.invoke("maview-ai", {
          body: { message: context },
        });

        if (!error && data?.text) {
          const parsed = data.text.split("\n").filter((l: string) => l.trim().length > 5).slice(0, 3);
          setAiInsights(parsed);
          localStorage.setItem(cacheKey, JSON.stringify({ insights: parsed, ts: Date.now() }));
        }
      } catch {}
      setInsightsLoading(false);
    };

    // Delay to not overwhelm initial load
    const t = setTimeout(generateInsights, 2000);
    return () => clearTimeout(t);
  }, [cfg, health, products.length, links.length, testimonials.length]);

  /* ── 4.4: Achievements System ── */
  const ACHIEVEMENTS = useMemo(() => [
    { id: "first_step", label: "Primeiro passo", desc: "Completou o onboarding", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10", check: () => !!((cfg.design as any)?.onboardingDone) },
    { id: "perfect_vitrine", label: "Vitrine perfeita", desc: "Health score 100", icon: Trophy, color: "text-emerald-500", bg: "bg-emerald-500/10", check: () => health >= 100 },
    { id: "designer", label: "Designer", desc: "Escolheu um tema", icon: Palette, color: "text-pink-500", bg: "bg-pink-500/10", check: () => !!cfg.theme && cfg.theme !== "dark-purple" },
    { id: "social", label: "Conectado", desc: "3+ links ativos", icon: Link2, color: "text-blue-500", bg: "bg-blue-500/10", check: () => links.length >= 3 },
    { id: "proof", label: "Prova social", desc: "3+ depoimentos", icon: Star, color: "text-amber-500", bg: "bg-amber-500/10", check: () => testimonials.length >= 3 },
    { id: "creator", label: "Criador premium", desc: "5+ produtos ativos", icon: ShoppingBag, color: "text-violet-500", bg: "bg-violet-500/10", check: () => products.length >= 5 },
    { id: "marketer", label: "Marketeiro", desc: "Adicionou WhatsApp", icon: MessageCircle, color: "text-green-500", bg: "bg-green-500/10", check: () => !!cfg.whatsapp },
    { id: "storyteller", label: "Storyteller", desc: "Escreveu uma bio", icon: FileText, color: "text-cyan-500", bg: "bg-cyan-500/10", check: () => !!cfg.bio && (cfg.bio as string).length > 20 },
  ], [cfg, health, links.length, testimonials.length, products.length]);

  const unlockedAchievements = ACHIEVEMENTS.filter(a => a.check());
  const lockedAchievements = ACHIEVEMENTS.filter(a => !a.check());

  // Check for new achievements and persist
  useEffect(() => {
    if (!cfg || Object.keys(cfg).length === 0) return;
    const designObj = (cfg.design as Record<string, any>) || {};
    const saved: string[] = designObj.achievements || [];
    const current = unlockedAchievements.map(a => a.id);
    const newOnes = current.filter(id => !saved.includes(id));
    if (newOnes.length > 0) {
      // Save new achievements
      const updated = { ...designObj, achievements: [...saved, ...newOnes] };
      const full = { ...loadLocal(), design: updated };
      try { saveWithSync(full); } catch { /* silent */ }
    }
  }, [unlockedAchievements, cfg]);

  const [showAllAchievements, setShowAllAchievements] = useState(false);

  return (
    <div className={`max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-10 page-enter transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}>

      {/* ── Greeting ── */}
      <div className="mb-6" style={{ animation: "fadeSlideUp 0.4s ease both" }}>
        <h1 className="text-2xl md:text-[28px] font-bold text-[hsl(var(--dash-text))] tracking-tight">
          {getGreeting()}, {displayName.split(" ")[0]} 👋
        </h1>
        <p className="text-[hsl(var(--dash-text-muted))] text-[14px] mt-1">{getSubtitle()}</p>
      </div>

      {/* ── WELCOME EMPTY STATE — 3 cards grandes estilo Stan (só quando vitrine vazia) ── */}
      {health < 30 && (
        <div className="mb-8" style={{ animation: "fadeSlideUp 0.5s ease 0.1s both" }}>
          <div className="rounded-3xl bg-gradient-to-br from-primary/8 via-purple-500/5 to-pink-500/8 border border-primary/15 p-6 md:p-8 mb-5">
            <h2 className="text-[hsl(var(--dash-text))] font-extrabold text-[22px] md:text-[26px] tracking-tight">
              Vamos deixar sua loja pronta para vender
            </h2>
            <p className="text-[hsl(var(--dash-text-muted))] text-[14px] mt-1.5">
              3 passos · você termina em menos de 5 minutos
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {/* Card 1: Escolher template */}
              <Link to="/dashboard/pagina?tab=design"
                className="group relative rounded-2xl bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))] p-5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className="absolute top-3 right-3 text-[10px] font-bold text-primary/40 group-hover:text-primary transition-colors">1</div>
                <div className="text-4xl mb-3">🎨</div>
                <h3 className="text-[hsl(var(--dash-text))] font-bold text-[15px] mb-1">Escolher template</h3>
                <p className="text-[hsl(var(--dash-text-muted))] text-[12px] leading-relaxed mb-4">
                  8 templates premium prontos. 1 clique aplica layout, cores e fonte.
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary group-hover:gap-2 transition-all">
                  Editar Design →
                </span>
              </Link>

              {/* Card 2: Adicionar produto */}
              <Link to="/dashboard/pagina"
                className="group relative rounded-2xl bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))] p-5 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className="absolute top-3 right-3 text-[10px] font-bold text-emerald-500/40 group-hover:text-emerald-500 transition-colors">2</div>
                <div className="text-4xl mb-3">🛍️</div>
                <h3 className="text-[hsl(var(--dash-text))] font-bold text-[15px] mb-1">Adicionar produto</h3>
                <p className="text-[hsl(var(--dash-text-muted))] text-[12px] leading-relaxed mb-4">
                  Curso, e-book, mentoria ou agendamento. 5 campos essenciais e pronto.
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500 group-hover:gap-2 transition-all">
                  Ir para Loja →
                </span>
              </Link>

              {/* Card 3: IA Stanley com mascot real */}
              <Link to="/dashboard/ia"
                className="group relative rounded-2xl bg-gradient-to-br from-fuchsia-500/8 to-purple-500/8 border border-fuchsia-500/20 p-5 hover:border-fuchsia-500/50 hover:shadow-xl hover:shadow-fuchsia-500/15 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className="absolute top-3 right-3 text-[10px] font-bold text-fuchsia-500/40 group-hover:text-fuchsia-500 transition-colors">3</div>
                <div className="mb-3 group-hover:scale-110 transition-transform inline-block">
                  <StanleyAvatar size="lg" variant="card" animated />
                </div>
                <h3 className="text-[hsl(var(--dash-text))] font-bold text-[15px] mb-1">Perguntar ao Stanley</h3>
                <p className="text-[hsl(var(--dash-text-muted))] text-[12px] leading-relaxed mb-4">
                  Sua IA de marketing. Bio, descrição, oferta — pronto em segundos.
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-fuchsia-500 group-hover:gap-2 transition-all">
                  Conversar →
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6" style={{ animation: "fadeSlideUp 0.45s ease 0.05s both" }}>

        {/* ══ LEFT COLUMN ══ */}
        <div className="space-y-5 min-w-0">

          {/* ── Progress card / Celebration card ── */}
          {health === 100 ? (
            /* ── Celebration: vitrine complete ── */
            <div className="glass-card rounded-2xl p-5 md:p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                  <Trophy size={22} className="text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-[hsl(var(--dash-text))] font-bold text-[16px]">Vitrine 100% completa!</h2>
                  <p className="text-[hsl(var(--dash-text-muted))] text-[12px] mt-0.5">Agora é hora de compartilhar e crescer</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button onClick={copyLink}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 btn-interactive text-[hsl(var(--dash-text-secondary))]">
                  <Share2 size={16} className="text-primary" />
                  <span className="text-[11px] font-medium">{copied ? "Copiado!" : "Copiar link"}</span>
                </button>
                <a href={`https://wa.me/?text=${encodeURIComponent(`Confira minha vitrine: ${profileUrl}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 btn-interactive text-emerald-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.458-1.495A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.3 0-4.438-.744-6.166-2.006l-.43-.322-2.657.89.89-2.657-.322-.43A9.935 9.935 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                  <span className="text-[11px] font-medium">WhatsApp</span>
                </a>
                <Link to="/dashboard/analytics"
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 btn-interactive text-[hsl(var(--dash-text-secondary))]">
                  <BarChart3 size={16} className="text-primary" />
                  <span className="text-[11px] font-medium">Analytics</span>
                </Link>
                <Link to="/dashboard/pagina"
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 btn-interactive text-[hsl(var(--dash-text-secondary))]">
                  <FileText size={16} className="text-primary" />
                  <span className="text-[11px] font-medium">Editar</span>
                </Link>
              </div>
            </div>
          ) : (
            /* ── Progress: health < 100 ── */
            <div className="glass-card rounded-2xl p-5 md:p-6">
              <div className="flex items-start gap-5">
                {/* Health ring */}
                <div className="flex-shrink-0">
                  <div className="relative w-[100px] h-[100px]">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r={r} fill="none"
                        stroke="hsl(var(--dash-surface-2))" strokeWidth="8" />
                      <circle cx="50" cy="50" r={r} fill="none"
                        stroke={healthColor} strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={circ} strokeDashoffset={offset}
                        style={{ transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[22px] font-extrabold text-[hsl(var(--dash-text))] leading-none tabular-nums">{animatedHealth}</span>
                      <span className="text-[10px] text-[hsl(var(--dash-text-muted))] font-medium mt-0.5">/100</span>
                    </div>
                  </div>
                </div>

                {/* Checklist */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[hsl(var(--dash-text))] font-semibold text-[15px]">Complete sua vitrine</h2>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: healthColor + "18", color: healthColor }}>
                      {doneCount}/{steps.length}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {steps.map(step => (
                      <Link key={step.key} to={step.path}
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all group ${
                          step.done ? "opacity-50" : "hover:bg-[hsl(var(--dash-surface-2))]"
                        }`}>
                        {step.done
                          ? <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                          : <Circle size={15} className="text-[hsl(var(--dash-text-muted))] flex-shrink-0 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                        }
                        <span className={`text-[12px] flex-1 font-medium ${step.done ? "line-through text-[hsl(var(--dash-text-muted))]" : "text-[hsl(var(--dash-text-secondary))]"}`}>
                          {step.label}
                        </span>
                        {!step.done && (
                          <span className="text-[11px] text-[hsl(var(--dash-text-muted))] hidden sm:inline">+{step.points}pts</span>
                        )}
                        {!step.done && <ArrowRight size={11} className="text-[hsl(var(--dash-text-muted))] group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />}
                      </Link>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="h-1.5 rounded-full bg-[hsl(var(--dash-surface-2))] overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${health}%`, background: `linear-gradient(90deg, ${healthColor}, ${healthColor}cc)` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary CTA */}
              <Link to="/dashboard/pagina"
                className="mt-5 w-full btn-primary-gradient text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98]">
                <FileText size={16} />
                {nextStep ? `Próximo: ${nextStep.label}` : "Montar Vitrine"}
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* ── Share card ── */}
          {profileUrl && (
            <div className="glass-card rounded-2xl p-4 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[hsl(var(--dash-text))] text-[13px] font-semibold">Sua vitrine está no ar</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] mb-3">
                <p className="flex-1 text-[12px] text-[hsl(var(--dash-text-muted))] font-mono truncate">{displayUrl}</p>
                <button onClick={copyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 text-[11px] text-[hsl(var(--dash-text-secondary))] font-medium transition-all flex-shrink-0">
                  {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowQR(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))] hover:border-primary/30 text-[12px] text-[hsl(var(--dash-text-secondary))] font-medium btn-interactive">
                  <QrCode size={14} /> QR Code
                </button>
                <a href={profileUrl} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl btn-primary-gradient text-[12px] font-medium transition-transform active:scale-95">
                  <ExternalLink size={14} /> Ver vitrine
                </a>
              </div>
            </div>
          )}

          {/* ── Quick stats (inline, not big cards) ── */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Produtos", val: products.length, icon: Package, color: "text-violet-500", bg: "bg-violet-500/10" },
              { label: "Links", val: links.length, icon: Link2, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Depoimentos", val: testimonials.length, icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
            ].map(({ label, val, icon: Icon, color, bg }) => (
              <Link key={label} to="/dashboard/pagina"
                className="glass-card card-hover rounded-xl p-3.5 group">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={14} className={color} />
                  </div>
                  <div>
                    <p className="text-[18px] font-bold text-[hsl(var(--dash-text))] leading-none">{val}</p>
                    <p className="text-[11px] text-[hsl(var(--dash-text-subtle))] mt-0.5">{label}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* ── AI Insights (4.1) ── */}
          {(aiInsights.length > 0 || insightsLoading) && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500/15 to-violet-500/15 flex items-center justify-center">
                  <Lightbulb size={15} className="text-fuchsia-500" />
                </div>
                <div>
                  <p className="text-[hsl(var(--dash-text))] text-[13px] font-semibold">Insights da IA</p>
                  <p className="text-[hsl(var(--dash-text-subtle))] text-[10px]">Atualizado diariamente</p>
                </div>
              </div>
              {insightsLoading ? (
                <div className="space-y-2">
                  {[1, 2].map(i => <div key={i} className="skeleton h-4 rounded-lg" style={{ width: `${70 + i * 10}%` }} />)}
                </div>
              ) : (
                <div className="space-y-2">
                  {aiInsights.map((insight, i) => (
                    <p key={i} className="text-[hsl(var(--dash-text-secondary))] text-[12px] leading-relaxed pl-1">
                      {insight}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Achievements (4.4) ── */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Award size={15} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-[hsl(var(--dash-text))] text-[13px] font-semibold">Conquistas</p>
                  <p className="text-[hsl(var(--dash-text-subtle))] text-[10px]">{unlockedAchievements.length}/{ACHIEVEMENTS.length} desbloqueadas</p>
                </div>
              </div>
              {ACHIEVEMENTS.length > 4 && (
                <button onClick={() => setShowAllAchievements(!showAllAchievements)}
                  className="text-[11px] text-primary font-medium hover:underline">
                  {showAllAchievements ? "Menos" : "Ver todas"}
                </button>
              )}
            </div>
            <div className="h-1.5 rounded-full bg-[hsl(var(--dash-surface-2))] overflow-hidden mb-4">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700"
                style={{ width: `${(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}%` }} />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(showAllAchievements ? ACHIEVEMENTS : ACHIEVEMENTS.slice(0, 8)).map(a => {
                const unlocked = a.check();
                const Icon = a.icon;
                return (
                  <div key={a.id} title={`${a.label}: ${a.desc}`}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all ${
                      unlocked ? "bg-[hsl(var(--dash-surface-2))] border border-[hsl(var(--dash-border-subtle))]" : "opacity-30"
                    }`}>
                    <div className={`w-7 h-7 rounded-lg ${unlocked ? a.bg : "bg-[hsl(var(--dash-surface-2))]"} flex items-center justify-center`}>
                      <Icon size={13} className={unlocked ? a.color : "text-[hsl(var(--dash-text-subtle))]"} />
                    </div>
                    <span className="text-[9px] text-[hsl(var(--dash-text-muted))] font-medium text-center leading-tight px-0.5">{a.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── IA teaser (subtle, not overwhelming) ── */}
          <Link to="/dashboard/ia"
            className="glass-card card-hover rounded-2xl p-4 flex items-center gap-4 group hover:border-fuchsia-200">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500/15 to-violet-500/15 border border-fuchsia-200/50 flex items-center justify-center flex-shrink-0">
              <Sparkles size={18} className="text-fuchsia-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[hsl(var(--dash-text))] text-[13px] font-semibold">IA Stanley</p>
              <p className="text-[hsl(var(--dash-text-subtle))] text-[11px]">Crie bios, descrições e conteúdo com IA</p>
            </div>
            <ArrowRight size={14} className="text-[hsl(var(--dash-text-subtle))] group-hover:text-fuchsia-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>
        </div>

        {/* ══ RIGHT COLUMN: Phone preview ══ */}
        <div className="hidden lg:block">
          <div className="sticky top-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[hsl(var(--dash-text-subtle))] text-xs font-medium uppercase tracking-wider">Preview</p>
              <Link to="/dashboard/pagina" className="text-[11px] text-primary font-medium flex items-center gap-1 hover:underline">
                Editar <ArrowRight size={10} />
              </Link>
            </div>

            {/* Phone mockup — mirrors Profile.tsx rendering */}
            <div className="relative mx-auto" style={{ width: 310 }}>
              <div className="rounded-[2.8rem] border-[3px] border-[hsl(var(--dash-text))] overflow-hidden shadow-2xl flex flex-col"
                style={{ aspectRatio: "9/16", ...previewBgStyle }}>
                {/* Status bar */}
                <div className="flex items-center justify-between px-6 pt-3 pb-1 flex-shrink-0">
                  <span className="text-[10px] font-semibold" style={{ color: `${pText}B3` }}>9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="flex gap-[2px] items-end">
                      {[3, 4, 5, 6].map(h => (
                        <div key={h} className="w-[3px] rounded-sm" style={{ height: h, background: `${pText}B3` }} />
                      ))}
                    </div>
                    <div className="w-5 h-2.5 rounded-sm border ml-1 relative" style={{ borderColor: `${pText}80` }}>
                      <div className="absolute inset-[2px] rounded-[1px]" style={{ background: `${pText}BF` }} />
                    </div>
                  </div>
                </div>

                {/* Dynamic Island */}
                <div className="flex justify-center pb-3 flex-shrink-0">
                  <div className="w-[88px] h-[26px] rounded-full bg-black" />
                </div>

                {/* Scrollable screen content */}
                <div className="flex-1 overflow-y-auto relative" style={{ fontFamily: `'${pFontB}', sans-serif` }}>
                  {/* Ambient glow */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] pointer-events-none" style={{ background: `radial-gradient(ellipse, ${pAccent}20, transparent 70%)` }} />
                  <div className="p-5 relative z-10">
                    {/* Profile */}
                    <div className="flex flex-col items-center mb-5">
                      <div className="mb-2.5 overflow-hidden"
                        style={{
                          width: profileSize, height: profileSize,
                          borderRadius: pProfileRadius,
                          clipPath: pProfileClip,
                          boxShadow: profileBorder ? `0 0 0 2px ${profileBorderColor}50` : "none",
                        }}>
                        {cfg.avatarUrl ? (
                          <img src={cfg.avatarUrl as string} alt="" className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"
                            style={{ background: pAccent }}>
                            <span className="text-white text-xl font-bold">
                              {(displayName || "M")[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="font-bold text-sm" style={{ color: pText, fontFamily: `'${pFontH}', sans-serif` }}>{(cfg.displayName as string) || displayName || "Seu Nome"}</p>
                      {(cfg.username || username) && (
                        <p className="text-xs mt-0.5" style={{ color: pAccent }}>@{((cfg.username as string) || username).replace(/^@/, "")}</p>
                      )}
                      {cfg.bio && (
                        <p className="text-xs text-center mt-1.5 px-2 line-clamp-2" style={{ color: pSub }}>
                          {cfg.bio as string}
                        </p>
                      )}
                      {cfg.whatsapp && (
                        <div className="flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full" style={{ background: "#25d36618" }}>
                          <MessageCircle size={10} style={{ color: "#25d366" }} />
                          <span className="text-[10px]" style={{ color: "#25d366" }}>WhatsApp</span>
                        </div>
                      )}
                    </div>

                    {/* Render blocks if available, else show items directly */}
                    {blocks.length > 0 ? (
                      blocks.map(block => {
                        if (block.type === "product") {
                          const p = products.find(pr => (pr as any).id === block.refId);
                          if (!p) return null;
                          const coverImg = p.images?.[0] || p.imageUrl;
                          const isBooking = p.linkType === "booking";
                          return (
                            <div key={block.id} className="flex items-center gap-2.5 p-2.5 mb-2"
                              style={{ ...pBtnStyle }}>
                              {coverImg ? (
                                <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
                                  <img src={coverImg} alt={p.title} className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <span className="text-base flex-shrink-0">{p.emoji || "📦"}</span>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold truncate" style={{ color: pText, fontFamily: `'${pFontH}', sans-serif` }}>{p.title}</p>
                                <div className="flex items-center gap-2">
                                  {p.originalPrice && <span className="text-[9px] line-through" style={{ color: pSub }}>{p.originalPrice}</span>}
                                  {p.price && <p className="text-[10px] font-bold" style={{ color: pAccent }}>{p.price}</p>}
                                </div>
                                {isBooking && (
                                  <p className="text-[9px] mt-0.5 flex items-center gap-1" style={{ color: pSub }}>
                                    <Clock size={8} /> {(p.bookingDuration || 60)}min · {(p.bookingDays || []).length} dias/sem
                                  </p>
                                )}
                              </div>
                              {p.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: pAccent + "25", color: pAccent }}>
                                  {p.badge}
                                </span>
                              )}
                            </div>
                          );
                        }
                        if (block.type === "link") {
                          const l = links.find(lk => (lk as any).id === block.refId);
                          if (!l) return null;
                          if (l.type === "header") return (
                            <div key={block.id} className="flex items-center gap-2 mb-2">
                              <div className="flex-1 h-px" style={{ background: pAccent + "30" }} />
                              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: pAccent + "80" }}>{l.title}</span>
                              <div className="flex-1 h-px" style={{ background: pAccent + "30" }} />
                            </div>
                          );
                          if (l.type === "spotlight") return (
                            <div key={block.id} className="p-2.5 mb-2 flex items-center justify-center gap-2"
                              style={{ background: `${pAccent}20`, border: `1px solid ${pAccent}35`, borderRadius: pBtnRadius }}>
                              <span className="text-xs font-bold" style={{ color: pAccent }}>{l.title || l.url}</span>
                            </div>
                          );
                          return (
                            <div key={block.id} className="flex items-center gap-2 p-2.5 mb-2"
                              style={{ ...pBtnStyle }}>
                              <span className="text-xs truncate" style={{ color: pSub }}>{l.title || l.url}</span>
                            </div>
                          );
                        }
                        if (block.type === "testimonial") {
                          const te = testimonials.find(t => (t as any).id === block.refId);
                          if (!te) return null;
                          return (
                            <div key={block.id} className="p-2.5 mb-2"
                              style={{ ...pBtnStyle }}>
                              <div className="flex items-center gap-2 mb-1.5">
                                {te.avatar ? (
                                  <img src={te.avatar} alt={te.name} className="w-5 h-5 rounded-full object-cover" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                                    style={{ background: pAccent }}>
                                    {(te.name || "?")[0]?.toUpperCase()}
                                  </div>
                                )}
                                <p className="text-[9px] font-semibold" style={{ color: pAccent }}>
                                  {te.name} {te.role && <span style={{ color: pSub }}>· {te.role}</span>}
                                </p>
                              </div>
                              <div className="text-[10px] mb-1">{"⭐".repeat(te.stars || 5)}</div>
                              <p className="text-[9px] line-clamp-2 italic" style={{ color: pSub }}>"{te.text}"</p>
                            </div>
                          );
                        }
                        if (block.type === "header") {
                          return (
                            <div key={block.id} className="flex items-center gap-2 mb-2">
                              <div className="flex-1 h-px" style={{ background: pAccent + "25" }} />
                              {block.title && <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: pAccent + "85" }}>{block.title}</span>}
                              {block.title && <div className="flex-1 h-px" style={{ background: pAccent + "25" }} />}
                            </div>
                          );
                        }
                        return null;
                      })
                    ) : (
                      <>
                        {products.length > 0 ? products.slice(0, 3).map((p, i) => {
                          const coverImg = p.images?.[0] || p.imageUrl;
                          return (
                            <div key={i} className="flex items-center gap-2.5 p-2.5 mb-2"
                              style={{ ...pBtnStyle }}>
                              {coverImg ? (
                                <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
                                  <img src={coverImg} alt={p.title} className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <span className="text-base flex-shrink-0">{p.emoji || "📦"}</span>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold truncate" style={{ color: pText, fontFamily: `'${pFontH}', sans-serif` }}>{p.title}</p>
                                {p.price && <p className="text-[10px] font-bold" style={{ color: pAccent }}>{p.price}</p>}
                              </div>
                            </div>
                          );
                        }) : (
                          <div className="rounded-xl border border-dashed p-3 mb-2 flex flex-col items-center gap-1"
                            style={{ borderColor: `${pText}1A` }}>
                            <Package size={12} style={{ color: `${pText}59` }} />
                            <p className="text-[10px]" style={{ color: `${pText}59` }}>Adicione produtos</p>
                          </div>
                        )}

                        {links.filter(l => !l.isSocial).slice(0, 2).map((l, i) => (
                          <div key={i} className="p-2.5 mb-2 text-center"
                            style={{ ...pBtnStyle }}>
                            <span className="text-xs" style={{ color: pSub }}>{l.title || l.url}</span>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Empty state */}
                    {products.length === 0 && links.length === 0 && blocks.length === 0 && (
                      <div className="text-center py-4 opacity-50">
                        <p className="text-[10px]" style={{ color: pSub }}>Adicione itens à sua vitrine</p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="pt-4 pb-2 text-center">
                      <p className="text-[10px]" style={{ color: `${pText}33` }}>Criado com maview.app</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp button — inside phone frame */}
              {cfg.whatsapp && (
                <div className="absolute bottom-14 right-4 w-9 h-9 rounded-full flex items-center justify-center shadow-lg z-20"
                  style={{ background: "#25d366", boxShadow: "0 2px 6px rgba(37,211,102,0.15)" }}>
                  <MessageCircle size={14} className="text-white fill-white" />
                </div>
              )}
            </div>

            {/* Below preview */}
            <div className="mt-3 text-center">
              <p className="text-[hsl(var(--dash-text-subtle))] text-[11px]">
                Atualiza em tempo real ao editar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile preview button ── */}
      <Link to="/dashboard/pagina"
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 lg:hidden flex items-center gap-2 px-5 py-3 rounded-full btn-primary-gradient shadow-xl text-sm font-semibold transition-transform active:scale-95"
      >
        <FileText size={16} /> Editar Vitrine
      </Link>

      {/* ── QR Code Modal ── */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-5 w-[260px]"
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={18} />
            </button>
            <div className="text-center">
              <h3 className="font-bold text-gray-900 text-[16px]">QR Code</h3>
              <p className="text-gray-500 text-[11px] mt-0.5 font-mono">{displayUrl}</p>
            </div>
            <canvas ref={qrCanvasRef} className="rounded-xl border border-gray-100" />
            <button onClick={downloadQR}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary-gradient text-[13px] font-semibold w-full justify-center">
              <Download size={14} /> Baixar PNG
            </button>
          </div>
        </div>
      )}

      {/* ── Milestone celebration popup ── */}
      {milestone !== null && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          style={{ animation: "fadeSlideUp 0.4s ease both" }}>
          <div className="glass-card rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-3 border-primary/20">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center celebrate">
              {milestone === 100 ? <Trophy size={20} className="text-amber-500" /> : <PartyPopper size={20} className="text-primary" />}
            </div>
            <div>
              <p className="text-[hsl(var(--dash-text))] text-sm font-bold">
                {milestone === 100 ? "Vitrine perfeita!" : milestone === 80 ? "Quase lá!" : "Meio caminho!"}
              </p>
              <p className="text-[hsl(var(--dash-text-muted))] text-xs">
                {milestone === 100
                  ? "Sua vitrine está 100% completa — hora de crescer!"
                  : milestone === 80
                    ? "80% completa — Analytics desbloqueado!"
                    : "50% completa — continue assim!"}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardHome;
