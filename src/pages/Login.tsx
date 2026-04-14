import { useState, useEffect, useCallback } from "react";
import {
  Eye, EyeOff, ArrowLeft, Check, X, ChevronDown,
  Link2, Star, Zap, ShoppingBag, BarChart3,
  TrendingUp, Users, DollarSign, Sparkles,
  Instagram, Palette, Globe, Sun, Moon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { checkUsername as checkUsernameAvail } from "@/lib/vitrine-sync";
import { toast } from "sonner";

type Mode = "login" | "signup" | "forgot" | "verify";

import MaviewLogo from "@/components/MaviewLogo";
import MeshGradientBg from "@/components/MeshGradientBg";

/* ─── Static data ─────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: Instagram,
    label: "Todas as suas redes em 1 link",
    desc: "Instagram, YouTube, TikTok, WhatsApp — tudo num só lugar",
    badge: null,
  },
  {
    icon: Globe,
    label: "Link na bio profissional",
    desc: "Seu link personalizado: maview.app/seunome",
    badge: null,
  },
  {
    icon: ShoppingBag,
    label: "Loja sem taxa de venda",
    desc: "Venda cursos, produtos digitais e físicos — 0% de comissão",
    badge: "0%",
  },
  {
    icon: Palette,
    label: "Temas totalmente personalizáveis",
    desc: "Escolha cores, fontes e layouts que combinam com você",
    badge: null,
  },
  {
    icon: BarChart3,
    label: "Analytics em tempo real",
    desc: "Veja cliques, visitas e de onde vêm seus seguidores",
    badge: null,
  },
];

const DEFAULT_STATS = [
  { icon: Users,       valueFn: (c: number | null) => c ? `+${c.toLocaleString("pt-BR")}` : "+2.000", label: "criadores ativos" },
  { icon: TrendingUp,  valueFn: () => "+340%",  label: "média de cliques a mais" },
  { icon: DollarSign,  valueFn: () => "R$0",    label: "taxa por venda" },
  { icon: Sparkles,    valueFn: () => "∞",      label: "temas personalizáveis" },
];

const TESTIMONIALS_ROW1 = [
  { name: "Ana Beatriz",    role: "Criadora de conteúdo", text: "Com o Maview vendo cursos e tenho meu link bio num lugar só. Triplicou minhas vendas!", badge: "+3x vendas",      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face" },
  { name: "Lucas Ferreira", role: "Designer freelancer",  text: "Personalizei meu tema em minutos. Nenhum concorrente oferece essa liberdade.",           badge: "100% meu estilo", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face" },
  { name: "Camila Torres",  role: "Influenciadora",       text: "Meus seguidores adoram a página. Parece profissional de verdade.",                        badge: "+40% cliques",    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face" },
  { name: "Rafael Costa",   role: "Coach digital",        text: "Vendo sessões de coaching direto pelo Maview. Zero complicação e zero taxa.",             badge: "Sem taxas",       avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face" },
  { name: "Juliana Melo",   role: "Fotógrafa",            text: "Portfólio, loja e contato em um link só. Meus clientes chegam perguntando como fiz.",     badge: "+5x alcance",     avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face" },
];

const TESTIMONIALS_ROW2 = [
  { name: "Pedro Alves",   role: "Músico independente", text: "Vendo meus beats direto pelo link. O analytics me mostrou o que converte.",                 badge: "+60% insights",     avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face" },
  { name: "Marina Silva",  role: "Nutricionista",       text: "Antes usava 3 ferramentas separadas. Agora só o Maview. Economizei tempo e dinheiro.",      badge: "3 ferramentas → 1", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=64&h=64&fit=crop&crop=face" },
  { name: "Bruno Nunes",   role: "Empreendedor",        text: "O tema ficou exatamente com a identidade da minha marca. Incrível diferencial.",             badge: "Marca forte",       avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=64&h=64&fit=crop&crop=face" },
  { name: "Fernanda Lima", role: "Professora online",   text: "Meus alunos me encontram fácil pelo link personalizado. Simples e eficiente.",               badge: "+80% acessos",      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face" },
  { name: "Thiago Rocha",  role: "Streamer",            text: "Centralizo doações, produtos e redes sociais no meu Maview. Engajamento dobrou.",            badge: "+2x engajamento",   avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=face" },
];

const FAQ_ITEMS = [
  { q: "O Maview é realmente grátis?", a: "Sim, 100% grátis. Sem período de teste, sem cartão de crédito. Você cria sua vitrine e começa a usar agora mesmo." },
  { q: "Preciso de cartão de crédito?", a: "Não. Você cria sua conta apenas com email e senha. Sem cobrança nenhuma." },
  { q: "Posso vender produtos pela vitrine?", a: "Sim! Você pode vender produtos digitais, físicos, serviços e sessões de coaching — e o Maview cobra 0% de taxa por venda." },
  { q: "Como personalizo minha página?", a: "No painel, escolha entre 20+ temas, 40+ efeitos animados e 24+ fontes. Tudo com 1 clique — sem código, sem complicação." },
  { q: "O Maview cobra taxa por venda?", a: "Não. O Maview cobra 0% de taxa. O valor da venda é 100% seu. Cobramos apenas pela futura versão Pro (opcional)." },
];

const SIGNUP_NOTIFICATIONS = [
  { name: "Gabriela M.", action: "acabou de criar sua vitrine", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=64&h=64&fit=crop&crop=face" },
  { name: "Carlos R.",   action: "fez sua primeira venda",      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=face" },
  { name: "Beatriz S.",  action: "personalizou seu link bio",   avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=64&h=64&fit=crop&crop=face" },
  { name: "Felipe N.",   action: "acabou de criar sua vitrine", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face" },
  { name: "Larissa T.",  action: "recebeu 200 cliques hoje",    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face" },
];

/* ─── Template gallery (vitrine demos) ────────────────────────── */

const TEMPLATE_GALLERY = [
  {
    name: "Criadora de Conteúdo",
    theme: { bg: "#080612", accent: "#a855f7", accent2: "#ec4899" },
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    displayName: "Mariana Silva",
    bio: "Criadora digital & mentora",
    items: ["Mentoria 1:1 — R$197", "Ebook Redes Sociais — R$47", "Instagram", "YouTube"],
  },
  {
    name: "Coach & Consultor",
    theme: { bg: "#021a0f", accent: "#10b981", accent2: "#6ee7b7" },
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
    displayName: "Rafael Costa",
    bio: "Coach de carreira & negócios",
    items: ["Sessão Estratégica — R$297", "Curso Online — R$197", "LinkedIn", "WhatsApp"],
  },
  {
    name: "Artista & Designer",
    theme: { bg: "#0a0010", accent: "#ff2d95", accent2: "#ff6ec7" },
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
    displayName: "Julia Melo",
    bio: "Design gráfico & ilustração",
    items: ["Portfolio", "Pacote de Logos — R$350", "Behance", "Dribbble"],
  },
  {
    name: "Fitness & Saúde",
    theme: { bg: "#0f0a00", accent: "#f59e0b", accent2: "#fcd34d" },
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    displayName: "Lucas Ferreira",
    bio: "Personal trainer certificado",
    items: ["Plano Treino 12 sem — R$97", "Consultoria Nutri — R$147", "Instagram", "TikTok"],
  },
];

/* ─── Testimonial card ────────────────────────────────────────── */

const TestimonialCard = ({ name, role, text, badge, avatar }: {
  name: string; role: string; text: string; badge: string; avatar: string;
}) => (
  <div className="flex-shrink-0 w-full sm:w-[280px] bg-white dark:bg-[hsl(260,30%,9%)] border border-maview-border rounded-2xl p-5 mx-2 shadow-sm hover:shadow-md hover:border-maview-purple/30 dark:shadow-[0_2px_12px_-3px_rgba(124,58,237,0.1)] transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)}
      </div>
      <span className="text-[10px] font-bold tracking-wide text-maview-purple bg-maview-purple-soft border border-maview-purple/20 px-2.5 py-0.5 rounded-full whitespace-nowrap">
        {badge}
      </span>
    </div>
    <p className="text-maview-text/70 text-sm leading-relaxed mb-5">"{text}"</p>
    <div className="flex items-center gap-2.5">
      <img src={avatar} alt={name} className="w-9 h-9 rounded-full object-cover border-2 border-maview-purple/20 flex-shrink-0" loading="lazy" decoding="async" />
      <div>
        <p className="text-maview-text text-xs font-semibold">{name}</p>
        <p className="text-maview-muted text-xs">{role}</p>
      </div>
    </div>
  </div>
);

const InfiniteRow = ({ items, reverse = false }: { items: typeof TESTIMONIALS_ROW1; reverse?: boolean }) => {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden w-full" style={{ maskImage: "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)" }}>
      <div className={`flex ${reverse ? "animate-scroll-reverse" : "animate-scroll"}`} style={{ width: "max-content" }}>
        {doubled.map((t, i) => <TestimonialCard key={i} {...t} />)}
      </div>
    </div>
  );
};

/* ─── Animated Waves ─────────────────────────────────────────── */

const AnimatedWaves = () => {
  const waveContainer = (cls: string) => ({
    position: "absolute" as const,
    bottom: 0, left: 0,
    width: "200%",
    height: "100%",
  });

  return (
    <>
      {/* Bottom waves */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none select-none overflow-hidden" style={{ height: 300, zIndex: 0 }}>
        {/* Layer 1 — back, slowest, tallest */}
        <div className="wave-slow" style={waveContainer("")}>
          <svg viewBox="0 0 2880 300" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
            <defs>
              <linearGradient id="wg1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.07"/>
                <stop offset="100%" stopColor="#4C1D95" stopOpacity="0.12"/>
              </linearGradient>
            </defs>
            <path d="M0,180 C360,90 720,270 1080,180 C1440,90 1800,270 2160,180 C2520,90 2880,270 3240,180 L3240,300 L0,300 Z" fill="url(#wg1)"/>
          </svg>
        </div>
        {/* Layer 2 — mid */}
        <div className="wave-mid" style={{ ...waveContainer(""), animationDelay: "-10s" }}>
          <svg viewBox="0 0 2880 300" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
            <defs>
              <linearGradient id="wg2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.09"/>
                <stop offset="100%" stopColor="#6D28D9" stopOpacity="0.15"/>
              </linearGradient>
            </defs>
            <path d="M0,220 C480,140 960,290 1440,220 C1920,140 2400,290 2880,220 L2880,300 L0,300 Z" fill="url(#wg2)"/>
          </svg>
        </div>
        {/* Layer 3 — front, fastest, smallest */}
        <div className="wave-fast" style={{ ...waveContainer(""), animationDelay: "-5s" }}>
          <svg viewBox="0 0 2880 300" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
            <defs>
              <linearGradient id="wg3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.12"/>
                <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.20"/>
              </linearGradient>
            </defs>
            <path d="M0,248 C240,212 480,278 720,248 C960,212 1200,278 1440,248 C1680,212 1920,278 2160,248 C2400,212 2640,278 2880,248 L2880,300 L0,300 Z" fill="url(#wg3)"/>
          </svg>
        </div>
        {/* Soft glow at the very bottom */}
        <div className="absolute inset-x-0 bottom-0 h-20" style={{ background: "linear-gradient(to top, rgba(109,40,217,0.10), transparent)" }} />
      </div>

      {/* Top subtle wave — very soft */}
      <div className="absolute inset-x-0 top-0 pointer-events-none select-none overflow-hidden" style={{ height: 160, zIndex: 0 }}>
        <div className="wave-rev" style={{ position: "absolute", top: 0, left: 0, width: "200%", height: "100%" }}>
          <svg viewBox="0 0 2880 160" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block", transform: "rotate(180deg)" }}>
            <path d="M0,80 C480,140 960,20 1440,80 C1920,140 2400,20 2880,80 L2880,160 L0,160 Z" fill="rgba(109,40,217,0.04)"/>
          </svg>
        </div>
      </div>

      {/* Ambient blobs */}
      <div className="absolute top-[-10%] right-[-8%] w-[550px] h-[550px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(109,40,217,0.07) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[5%] left-[-8%] w-[450px] h-[450px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)" }} />
      <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)" }} />
    </>
  );
};

const isValidUsername = (val: string) => /^[a-z0-9-]{3,30}$/.test(val);

/* ─── Page ────────────────────────────────────────────────────── */

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle"|"checking"|"available"|"taken"|"invalid">("idle");
  const [notification, setNotification] = useState<{ name: string; action: string; avatar: string } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("maview_dark") === "1");

  // Sync dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("maview_dark", darkMode ? "1" : "0");
  }, [darkMode]);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [realUserCount, setRealUserCount] = useState<number | null>(null);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
    // Fetch real user count
    supabase.from("vitrines").select("*", { count: "exact", head: true }).then(({ count }) => {
      if (count !== null && count > 0) setRealUserCount(count);
    });
  }, [navigate]);

  useEffect(() => {
    let idx = 0;
    const show = () => {
      setNotification(SIGNUP_NOTIFICATIONS[idx % SIGNUP_NOTIFICATIONS.length]);
      idx++;
      setTimeout(() => setNotification(null), 4000);
    };
    const t = setTimeout(show, 3000);
    const interval = setInterval(show, 9000);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, []);


  // Exit intent detection (desktop only)
  useEffect(() => {
    if (sessionStorage.getItem("maview_exit_shown")) return;
    const handler = (e: MouseEvent) => {
      if (e.clientY < 5) {
        setShowExitPopup(true);
        sessionStorage.setItem("maview_exit_shown", "1");
        document.removeEventListener("mouseleave", handler);
      }
    };
    document.addEventListener("mouseleave", handler);
    return () => document.removeEventListener("mouseleave", handler);
  }, []);

  // Sticky mobile CTA: show after scrolling past fold
  useEffect(() => {
    if (mode !== "login" && mode !== "signup") return;
    const onScroll = () => setShowStickyCTA(window.scrollY > window.innerHeight * 0.6);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mode]);

  const clearError = () => setError("");
  const switchMode = (next: Mode) => { clearError(); setPassword(""); setConfirmPassword(""); setUsernameStatus("idle"); setMode(next); };

  const checkUsername = useCallback(async (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setUsername(clean);
    if (!clean) { setUsernameStatus("idle"); return; }
    if (!isValidUsername(clean)) { setUsernameStatus("invalid"); return; }
    setUsernameStatus("checking");
    try {
      // Check both vitrines table and profiles table for uniqueness
      const [vitrineResult, profileResult] = await Promise.all([
        checkUsernameAvail(clean),
        supabase.from("profiles").select("username").eq("username", clean).maybeSingle(),
      ]);
      if (vitrineResult === "taken" || profileResult.data) {
        setUsernameStatus("taken");
      } else {
        setUsernameStatus("available");
      }
    } catch {
      // On error, allow signup (will fail server-side if taken)
      setUsernameStatus("available");
    }
  }, []);

  useEffect(() => {
    if (mode !== "signup") return;
    const t = setTimeout(() => checkUsername(username), 400);
    return () => clearTimeout(t);
  }, [username, mode, checkUsername]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true); clearError();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message === "Invalid login credentials" ? "Email ou senha incorretos." : "Ocorreu um erro. Tente novamente.");
    else navigate("/dashboard");
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true); clearError();
    if (password !== confirmPassword) { setError("As senhas não coincidem."); setIsLoading(false); return; }
    if (password.length < 8) { setError("Mínimo 8 caracteres com letras e números."); setIsLoading(false); return; }
    if (!isValidUsername(username)) { setError("Link inválido."); setIsLoading(false); return; }
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name, username }, emailRedirectTo: `${window.location.origin}/dashboard` } });
    if (error) setError(error.message === "User already registered" ? "Este email já está cadastrado." : error.message);
    else {
      switchMode("verify");
      // Fire-and-forget welcome email + enqueue nurture via Edge Function
      // (uses service_role internally, safe before email verification)
      supabase.functions.invoke("send-email", {
        body: { to: email, template: "welcome" },
      }).catch(() => {});
      // Enqueue nurture D+1, D+3, D+7 via Edge Function
      supabase.functions.invoke("send-email", {
        body: {
          action: "enqueue_nurture",
          email,
          templates: [
            { template: "getting_started", delay_hours: 24 },
            { template: "add_products", delay_hours: 72 },
            { template: "first_week_report", delay_hours: 168 },
          ],
        },
      }).catch(() => {});
    }
    setIsLoading(false);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true); clearError();
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) setError("Não foi possível enviar o email.");
    else { toast.success("Email enviado! Verifique sua caixa de entrada."); switchMode("login"); }
    setIsLoading(false);
  };

  const handleGoogle = async () => {
    clearError();
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/dashboard` } });
    if (error) toast.error("Erro ao entrar com Google.");
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) toast.error("Erro ao reenviar. Tente novamente.");
    else {
      toast.success("Email reenviado!");
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => { if (prev <= 1) { clearInterval(interval); return 0; } return prev - 1; });
      }, 1000);
    }
  };

  const onSubmit = mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleForgot;

  const usernameHint = {
    idle:      null,
    checking:  <span className="text-maview-muted flex items-center gap-1"><span className="w-2.5 h-2.5 border border-maview-muted/40 border-t-maview-purple rounded-full animate-spin inline-block" /> Verificando...</span>,
    available: <span className="text-emerald-600 flex items-center gap-1"><Check size={11} /> maview.app/<b>{username}</b> está disponível!</span>,
    taken:     <span className="text-red-500 flex items-center gap-1"><X size={11} /> Já está em uso</span>,
    invalid:   <span className="text-amber-600">Mín. 3 caracteres — letras, números e hífen</span>,
  }[usernameStatus];

  const inputClass = "w-full h-11 px-4 rounded-xl bg-white dark:bg-[hsl(260,25%,12%)] border border-maview-border dark:border-[hsl(260,20%,18%)] text-maview-text text-sm placeholder:text-maview-muted/60 outline-none transition-all focus:border-maview-purple focus:ring-2 focus:ring-maview-purple/10 shadow-sm dark:shadow-none";

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Skip to content — accessibility */}
      <a href="#login-form" className="skip-to-content">Pular para o formulário</a>

      {/* ── Interactive mesh gradient background ── */}
      <MeshGradientBg dark={darkMode} />

      {/* ── Grid overlay (on top of mesh) ── */}
      <div className="absolute inset-0 pointer-events-none select-none z-[1]" style={{
        backgroundImage: `
          linear-gradient(rgba(109,40,217,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(109,40,217,0.035) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
        maskImage: "radial-gradient(ellipse at 60% 40%, black 20%, transparent 80%)",
      }} />

      {/* ── Animated wave background ── */}
      <AnimatedWaves />

      {/* ── Notification pop-up ── */}
      <div className={`fixed bottom-6 left-6 z-50 transition-all duration-500 ${notification ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        <div className="flex items-center gap-3 bg-white dark:bg-[hsl(260,30%,10%)] border border-maview-border rounded-2xl px-4 py-3 shadow-xl shadow-maview-purple/10 dark:shadow-maview-purple/20 max-w-[280px]">
          <img src={notification?.avatar} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-maview-purple/20 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-maview-text text-xs font-semibold truncate">{notification?.name}</p>
            <p className="text-maview-muted text-xs truncate">{notification?.action}</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
        </div>
      </div>

      {/* ── Dark mode toggle (top-right) ── */}
      <button
        onClick={() => setDarkMode(d => !d)}
        className="fixed top-4 right-4 z-50 p-2.5 rounded-xl bg-white/80 dark:bg-[hsl(260,30%,12%)]/80 border border-maview-border backdrop-blur-sm hover:bg-white dark:hover:bg-[hsl(260,30%,15%)] transition-all shadow-sm"
        aria-label={darkMode ? "Modo claro" : "Modo escuro"}
      >
        {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-maview-purple" />}
      </button>

      {/* ══════════ SPLIT SECTION ══════════ */}
      <div className="flex flex-1 relative z-10">

        {/* ── LEFT — Branding ── */}
        <div className="hidden lg:flex flex-1 flex-col justify-center px-16 xl:px-24">
          <div className="max-w-[500px]">

            {/* Logo */}
            <div className="flex items-center gap-3 mb-14">
              <MaviewLogo size={40} />
              <span className="text-maview-text text-2xl font-extrabold tracking-tight">Maview</span>
              <span className="ml-1 text-[11px] font-bold text-maview-purple bg-maview-purple-soft border border-maview-purple/20 px-2.5 py-0.5 rounded-full uppercase tracking-widest">Beta</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl xl:text-[3.4rem] font-extrabold text-maview-text leading-[1.1] mb-5 tracking-tight">
              Sua vitrine.<br />
              Seu link.<br />
              <span className="bg-gradient-to-r from-maview-purple to-violet-500 bg-clip-text text-transparent">
                Sua renda.
              </span>
            </h1>

            <p className="text-maview-text-sub text-lg leading-relaxed mb-10">
              Para quem quer centralizar redes sociais, vender online
              ou simplesmente ter uma presença digital profissional —
              <span className="text-maview-text font-semibold"> sem pagar taxa de venda.</span>
            </p>

            {/* Features */}
            <div className="space-y-3 mb-12">
              {FEATURES.map(({ icon: Icon, label, desc, badge }) => (
                <div key={label} className="flex items-center gap-3 group">
                  {/* Icon box */}
                  <div className="w-9 h-9 rounded-xl bg-maview-purple-soft border border-maview-purple/15 flex items-center justify-center flex-shrink-0 group-hover:bg-maview-purple group-hover:border-maview-purple transition-all duration-200">
                    <Icon size={16} className="text-maview-purple group-hover:text-white transition-colors duration-200" />
                  </div>
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-maview-text text-sm font-semibold leading-tight">{label}</p>
                      {badge && (
                        <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          {badge} taxa
                        </span>
                      )}
                    </div>
                    <p className="text-maview-muted text-xs mt-0.5">{desc}</p>
                  </div>
                  {/* Check */}
                  <div className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center flex-shrink-0">
                    <Check size={9} className="text-emerald-600" strokeWidth={3} />
                  </div>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 pt-8 border-t border-maview-border">
              <div className="flex -space-x-2.5">
                {[
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face",
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
                  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=64&h=64&fit=crop&crop=face",
                ].map((src, i) => (
                  <img key={i} src={src} alt="creator"
                    className="w-9 h-9 rounded-full border-2 border-maview-bg object-cover" loading="lazy" />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={11} className="text-amber-400 fill-amber-400" />)}
                  <span className="text-amber-500 text-xs font-bold ml-1">4.9</span>
                </div>
                <p className="text-sm text-maview-muted">
                  <span className="text-maview-text font-bold">+{realUserCount ? realUserCount.toLocaleString("pt-BR") : "2.000"}</span> criadores já usam
                </p>
              </div>
            </div>

            {/* ── Phone mockup showing a real vitrine ── */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-maview-muted text-xs font-medium">Assim fica sua vitrine:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-600 text-xs font-bold">Pronta em minutos</span>
                </div>
              </div>

              {/* Phone frame */}
              <div className="relative mx-auto" style={{ width: 220, perspective: "1000px" }}>
                {/* Glow behind phone */}
                <div className="absolute -inset-6 rounded-[3rem] pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.15) 0%, transparent 70%)" }} />

                <div className="relative rounded-[2.2rem] overflow-hidden border-[3px] border-white/10 shadow-2xl"
                  style={{ aspectRatio: "9/18", background: "linear-gradient(160deg, #1a0e38 0%, #080612 50%, #0a0520 100%)", boxShadow: "0 25px 80px rgba(109,40,217,0.30), 0 8px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)" }}>

                  {/* Status bar */}
                  <div className="flex items-center justify-between px-5 pt-3 pb-1">
                    <span className="text-white/40 text-[9px] font-medium">9:41</span>
                    <div className="w-16 h-[3px] rounded-full bg-white/15" />
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-2 rounded-sm border border-white/30" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-4 pt-4 pb-5 flex flex-col items-center">
                    {/* Avatar */}
                    <div className="relative mb-2">
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
                        alt="" className="w-14 h-14 rounded-full object-cover border-2 border-violet-500/50" style={{ boxShadow: "0 0 20px rgba(139,92,246,0.3)" }} loading="lazy" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0d0a1e]" />
                    </div>
                    <p className="text-white text-xs font-bold">Ana Beatriz</p>
                    <p className="text-violet-400/70 text-[9px] mb-1">@anabeatriz</p>
                    <p className="text-white/40 text-[8px] text-center mb-3 leading-relaxed">Designer & criadora de conteúdo</p>

                    {/* Social icons */}
                    <div className="flex gap-1.5 mb-3">
                      {[Instagram, Globe, Star].map((Icon, i) => (
                        <div key={i} className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}>
                          <Icon size={9} className="text-violet-400" />
                        </div>
                      ))}
                    </div>

                    {/* Links */}
                    <div className="w-full space-y-1.5 mb-3">
                      {[
                        { label: "Meu portfólio", color: "#C084FC" },
                        { label: "Agende uma call", color: "#34D399" },
                      ].map(({ label, color }) => (
                        <div key={label} className="w-full py-2 rounded-xl text-center text-[9px] font-semibold text-white/80"
                          style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
                          {label}
                        </div>
                      ))}
                    </div>

                    {/* Products */}
                    <div className="w-full">
                      <p className="text-violet-400/60 text-[8px] font-bold uppercase tracking-wider mb-1.5">Produtos</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { title: "Ebook Design", price: "R$ 47", color: "#a855f7" },
                          { title: "Mentoria 1:1", price: "R$ 197", color: "#ec4899" },
                        ].map(({ title, price, color }) => (
                          <div key={title} className="rounded-lg p-1.5" style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
                            <div className="w-full h-8 rounded mb-1" style={{ background: `${color}10` }} />
                            <p className="text-white/70 text-[7px] font-semibold truncate">{title}</p>
                            <p className="text-[8px] font-bold" style={{ color }}>{price}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Maview branding */}
                    <div className="flex items-center gap-1 mt-3 opacity-30">
                      <MaviewLogo size={8} />
                      <span className="text-white text-[7px]">maview.app</span>
                    </div>
                  </div>
                </div>

                {/* Floating badges around phone */}
                <div className="absolute -right-3 top-[18%] bg-white dark:bg-[hsl(260,30%,12%)] rounded-xl px-2.5 py-1.5 shadow-lg border border-maview-border animate-[ambient-float_4s_ease-in-out_infinite]">
                  <p className="text-[9px] font-bold text-emerald-600">+3x vendas</p>
                </div>
                <div className="absolute -left-4 top-[55%] bg-white dark:bg-[hsl(260,30%,12%)] rounded-xl px-2.5 py-1.5 shadow-lg border border-maview-border animate-[ambient-float_5s_ease-in-out_infinite_1s]">
                  <p className="text-[9px] font-bold text-violet-600">40+ efeitos</p>
                </div>
                <div className="absolute -right-2 bottom-[18%] bg-white dark:bg-[hsl(260,30%,12%)] rounded-xl px-2.5 py-1.5 shadow-lg border border-maview-border animate-[ambient-float_6s_ease-in-out_infinite_2s]">
                  <p className="text-[9px] font-bold text-amber-600">0% taxa</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── RIGHT — Form ── */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-12 py-10 sm:py-14">
          <div className="w-full max-w-[420px]">

            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-2.5 mb-4 justify-center">
              <MaviewLogo size={34} />
              <span className="text-maview-text text-2xl font-extrabold tracking-tight">Maview</span>
            </div>

            {/* Mobile hero — context above form */}
            <div className="lg:hidden mb-8 text-center">
              <h1 className="text-maview-text text-xl sm:text-2xl font-extrabold leading-tight mb-2">
                Sua vitrine digital.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-maview-purple to-fuchsia-500">Seu link. Sua renda.</span>
              </h1>
              <p className="text-maview-muted text-sm mb-4">
                Produtos, links e agendamentos em uma página bonita — grátis.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-maview-surface border border-maview-border rounded-full px-3 py-1 text-xs text-maview-muted">
                  <Sparkles size={11} className="text-maview-purple" /> 40+ efeitos
                </span>
                <span className="inline-flex items-center gap-1.5 bg-maview-surface border border-maview-border rounded-full px-3 py-1 text-xs text-maview-muted">
                  <TrendingUp size={11} className="text-emerald-500" /> Analytics real
                </span>
                <span className="inline-flex items-center gap-1.5 bg-maview-surface border border-maview-border rounded-full px-3 py-1 text-xs text-maview-muted">
                  <DollarSign size={11} className="text-amber-500" /> 100% grátis
                </span>
              </div>
            </div>

            {/* ══ VERIFY EMAIL SCREEN ══ */}
            {mode === "verify" && (
              <div className="bg-white dark:bg-[hsl(260,30%,9%)] rounded-[24px] border border-maview-border p-8 sm:p-10 shadow-xl shadow-maview-purple/[0.07] dark:shadow-maview-purple/[0.15] text-center relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent pointer-events-none" />

                {/* Icon */}
                <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-6">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-500">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                <h2 className="text-maview-text text-xl font-bold mb-2">Verifique seu email</h2>
                <p className="text-maview-muted text-sm leading-relaxed mb-1">
                  Enviamos um link de confirmação para
                </p>
                <p className="text-maview-purple font-semibold text-sm mb-6 break-all">{email}</p>

                <div className="bg-maview-surface border border-maview-border rounded-xl p-4 text-left space-y-2 mb-6">
                  {[
                    "Abra seu email",
                    "Procure por um email do Maview",
                    "Clique em \"Confirmar email\"",
                    "Volte aqui e faça login",
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-maview-purple flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px] font-bold">{i + 1}</span>
                      </div>
                      <p className="text-maview-text-sub text-sm">{step}</p>
                    </div>
                  ))}
                </div>

                <p className="text-maview-muted text-xs mb-4">Não recebeu? Verifique a pasta de spam ou</p>

                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="w-full h-11 rounded-xl border border-maview-border text-maview-text text-sm font-semibold hover:bg-maview-surface transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                  {resendCooldown > 0 ? `Reenviar em ${resendCooldown}s` : "Reenviar email"}
                </button>

                <button
                  onClick={() => switchMode("login")}
                  className="flex items-center justify-center gap-1.5 w-full text-xs text-maview-muted hover:text-maview-text transition-colors"
                >
                  <ArrowLeft size={12} /> Voltar ao login
                </button>
              </div>
            )}

            {/* Online counter + form card + termos — só mostra fora do verify */}
            {mode !== "verify" && <>
            {realUserCount && realUserCount > 0 && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-full px-3 py-1">
                  <Users size={12} className="text-emerald-500" />
                  <span className="text-emerald-700 dark:text-emerald-400 text-xs font-semibold">{realUserCount.toLocaleString("pt-BR")}+ criadores já usam o Maview</span>
                </div>
              </div>
            )}

            {/* Card */}
            <div className="relative bg-white dark:bg-[hsl(260,30%,9%)] rounded-[24px] border border-maview-border p-6 sm:p-10 shadow-xl shadow-maview-purple/[0.07] dark:shadow-maview-purple/[0.15] overflow-hidden">
              {/* Top accent line */}
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-maview-purple to-transparent pointer-events-none" />

              {/* Mode tabs */}
              <div className="mb-6">
                {mode !== "forgot" && (
                  <div className="flex bg-maview-surface rounded-2xl p-1 mb-6 border border-maview-border w-full">
                    {(["login", "signup"] as Mode[]).map((m) => (
                      <button key={m} type="button" onClick={() => switchMode(m)}
                        className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 whitespace-nowrap min-w-0 ${
                          mode === m
                            ? "bg-maview-purple text-white shadow-md shadow-maview-purple/25"
                            : "text-maview-muted hover:text-maview-text"
                        }`}>
                        {m === "login" ? "Entrar" : "Criar conta"}
                      </button>
                    ))}
                  </div>
                )}
                {mode === "forgot" && (
                  <button type="button" onClick={() => switchMode("login")} className="flex items-center gap-1.5 text-xs text-maview-muted hover:text-maview-text transition-colors mb-4">
                    <ArrowLeft size={13} /> Voltar ao login
                  </button>
                )}
                <h2 className="text-maview-text text-xl font-bold mb-1">
                  {mode === "login"  && "Bem-vindo de volta"}
                  {mode === "signup" && "Crie sua conta grátis"}
                  {mode === "forgot" && "Recuperar senha"}
                </h2>
                <p className="text-maview-muted text-sm">
                  {mode === "login"  && "Entre para acessar sua vitrine"}
                  {mode === "signup" && "Comece em menos de 2 minutos"}
                  {mode === "forgot" && "Enviaremos um link de redefinição"}
                </p>
              </div>

              {/* Beta banner — signup */}
              {mode === "signup" && (
                <div className="flex items-center gap-2.5 bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/30 dark:via-purple-950/20 dark:to-fuchsia-950/20 border border-violet-200 dark:border-violet-800/40 rounded-xl px-4 py-3 mb-5">
                  <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={14} className="text-violet-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-violet-800 dark:text-violet-300 text-xs font-bold">
                      Beta gratuito — acesso completo
                    </p>
                    <p className="text-violet-600 dark:text-violet-400 text-[11px] mt-0.5">
                      Todos os recursos premium, sem cobrança
                    </p>
                  </div>
                </div>
              )}
              {/* Soft trigger — login mode */}
              {mode === "login" && (
                <div className="flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl px-4 py-2.5 mb-5">
                  <Sparkles size={12} className="text-emerald-500" />
                  <p className="text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                    <span className="font-bold">{realUserCount ? realUserCount.toLocaleString("pt-BR") : "2.000"}+</span> criadores já estão usando
                  </p>
                </div>
              )}

              <form id="login-form" onSubmit={onSubmit} className="space-y-4">

                {/* Name */}
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-maview-text-sub block">Nome completo</label>
                    <input type="text" placeholder="Seu nome" value={name}
                      onChange={(e) => { setName(e.target.value); clearError(); }}
                      className={inputClass} required />
                  </div>
                )}

                {/* Username */}
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-maview-text-sub flex items-center gap-2">
                      Personalize seu link
                      <span className="text-[10px] font-bold text-maview-purple bg-maview-purple-soft border border-maview-purple/20 px-1.5 py-0.5 rounded-full">Exclusivo seu</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-maview-muted text-sm font-semibold select-none pointer-events-none">
                        maview.app/
                      </div>
                      <input type="text" placeholder="seunome" value={username}
                        onChange={(e) => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); clearError(); }}
                        className={`w-full h-11 pl-[108px] pr-10 rounded-xl bg-white dark:bg-[hsl(260,25%,12%)] border text-maview-text text-sm placeholder:text-maview-muted/50 outline-none transition-all shadow-sm dark:shadow-none focus:ring-2 ${
                          usernameStatus === "available"
                            ? "border-emerald-400 focus:ring-emerald-100"
                            : usernameStatus === "taken" || usernameStatus === "invalid"
                            ? "border-red-400 focus:ring-red-100"
                            : "border-maview-border focus:border-maview-purple focus:ring-maview-purple/10"
                        }`}
                        required maxLength={30} />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {usernameStatus === "checking"  && <div className="w-3.5 h-3.5 border-2 border-maview-border border-t-maview-purple rounded-full animate-spin" />}
                        {usernameStatus === "available" && <Check size={14} className="text-emerald-500" />}
                        {(usernameStatus === "taken" || usernameStatus === "invalid") && <X size={14} className="text-red-500" />}
                      </div>
                    </div>
                    {usernameHint && <p className="text-[11px] pl-1 mt-1">{usernameHint}</p>}
                  </div>
                )}

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-maview-text-sub block">Email</label>
                  <input type="email" placeholder="seu@email.com" value={email}
                    onChange={(e) => { setEmail(e.target.value); clearError(); }}
                    className={inputClass} required />
                </div>

                {/* Password */}
                {mode !== "forgot" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-maview-text-sub block">Senha</label>
                      {mode === "login" && (
                        <button type="button" onClick={() => switchMode("forgot")} className="text-xs text-maview-purple hover:text-maview-purple-dark font-medium transition-colors py-2 px-1 -mr-1 min-h-[44px] flex items-center">
                          Esqueceu?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password}
                        onChange={(e) => { setPassword(e.target.value); clearError(); }}
                        className={`${inputClass} pr-11`} required minLength={mode === "signup" ? 6 : undefined} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-maview-muted hover:text-maview-text transition-colors" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirm password */}
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-maview-text-sub block">Confirmar senha</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); clearError(); }}
                        className={`${inputClass} pr-11`} required />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-maview-muted hover:text-maview-text transition-colors" aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}>
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-start gap-2">
                    <X size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <div className="mt-1">
                  <button type="submit"
                    disabled={isLoading || (mode === "signup" && usernameStatus !== "available")}
                    className="relative w-full h-12 rounded-xl bg-gradient-to-r from-maview-purple to-violet-600 text-white text-sm font-bold transition-all duration-200 hover:shadow-xl hover:shadow-maview-purple/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] overflow-hidden group"
                  >
                    {/* Shine sweep on hover */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{mode === "login" ? "Entrando..." : mode === "signup" ? "Criando conta..." : "Enviando..."}</span>
                      </div>
                    ) : (
                      mode === "login"  ? "Entrar" :
                      mode === "signup" ? "Criar minha vitrine →" :
                      "Enviar link de recuperação"
                    )}
                  </button>
                  {mode === "signup" && (
                    <div className="flex items-center justify-center gap-4 mt-3">
                      {["✓ Grátis", "✓ Sem cartão", "✓ Suporte PT"].map((t) => (
                        <span key={t} className="text-[11px] text-maview-muted font-medium">{t}</span>
                      ))}
                    </div>
                  )}
                  {mode === "login" && (
                    <p className="text-center text-[11px] text-maview-muted mt-2">Acesso seguro · Seus dados protegidos</p>
                  )}
                </div>
              </form>

              {/* Google */}
              {mode !== "forgot" && (
                <>
                  <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-maview-border" />
                    <span className="text-xs text-maview-muted font-medium">ou continue com</span>
                    <div className="flex-1 h-px bg-maview-border" />
                  </div>
                  <button type="button" onClick={handleGoogle}
                    className="w-full h-11 rounded-xl bg-white dark:bg-[hsl(260,25%,12%)] border border-maview-border text-maview-text text-sm font-semibold flex items-center justify-center gap-2.5 transition-all hover:bg-maview-surface hover:border-maview-purple/30 hover:shadow-sm active:scale-[0.98] shadow-sm dark:shadow-none"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continuar com Google
                  </button>
                </>
              )}
            </div>

            <p className="text-center text-xs text-maview-muted mt-5">
              Ao continuar, você concorda com os{" "}
              <a href="/termos" className="hover:text-maview-purple transition-colors underline underline-offset-2">Termos de Uso</a>
              {" "}e a{" "}
              <a href="/privacidade" className="hover:text-maview-purple transition-colors underline underline-offset-2">Política de Privacidade</a>.
            </p>
            </>}
          </div>
        </div>
      </div>

      {/* ══════════ STATS BAR ══════════ */}
      <div className="relative z-10 border-t border-maview-border bg-white dark:bg-[hsl(260,30%,7%)]">
        <div className="max-w-5xl mx-auto px-8 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {DEFAULT_STATS.map(({ icon: Icon, valueFn, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-maview-purple-soft border border-maview-purple/15 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-maview-purple" />
              </div>
              <div>
                <p className="text-maview-text font-extrabold text-lg leading-none">{valueFn(realUserCount)}</p>
                <p className="text-maview-muted text-xs mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <div className="relative z-10 py-16 border-t border-maview-border bg-maview-surface content-lazy">

        <div className="text-center mb-10 px-6">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-[hsl(260,30%,10%)] border border-maview-border rounded-full px-4 py-1.5 mb-4 shadow-sm dark:shadow-none">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-maview-purple tracking-wide uppercase">Histórias reais</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-maview-text mb-3 tracking-tight">
            Criadores que já transformaram{" "}
            <span className="bg-gradient-to-r from-maview-purple to-violet-500 bg-clip-text text-transparent">
              sua renda
            </span>
          </h2>
          <p className="text-maview-muted text-base max-w-lg mx-auto">
            Mais de <strong className="text-maview-text">{realUserCount ? realUserCount.toLocaleString("pt-BR") : "2.000"} criadores</strong> usam o Maview para vender mais, aparecer mais e trabalhar menos.
          </p>
        </div>

        <div className="space-y-4">
          <InfiniteRow items={TESTIMONIALS_ROW1} />
          <InfiniteRow items={TESTIMONIALS_ROW2} reverse />
        </div>

        <div className="text-center mt-12 px-6">
          <p className="text-maview-muted text-sm mb-4">Sua história pode ser a próxima.</p>
          <button
            onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); switchMode("signup"); }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-maview-purple to-violet-600 text-white text-sm font-bold px-7 py-3.5 rounded-xl hover:brightness-105 hover:shadow-xl hover:shadow-maview-purple/25 transition-all active:scale-[0.98]"
          >
            <Zap size={15} className="fill-white" />
            Criar minha vitrine grátis
          </button>
        </div>
      </div>

      {/* ══════════ COMPARATIVO COM CONCORRENTES ══════════ */}
      <div className="relative z-10 py-16 px-6 border-t border-maview-border">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-maview-text mb-3 tracking-tight">
              Por que escolher o{" "}
              <span className="bg-gradient-to-r from-maview-purple to-violet-500 bg-clip-text text-transparent">Maview</span>?
            </h2>
            <p className="text-maview-muted text-base">Comparativo honesto com os maiores do mercado.</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-maview-border shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-maview-surface">
                  <th className="text-left px-4 py-3 text-maview-muted font-medium text-xs">Recurso</th>
                  <th className="px-4 py-3 text-center">
                    <span className="bg-gradient-to-r from-maview-purple to-violet-500 bg-clip-text text-transparent font-extrabold text-sm">Maview</span>
                  </th>
                  <th className="px-4 py-3 text-center text-maview-muted font-medium text-xs">Linktree</th>
                  <th className="px-4 py-3 text-center text-maview-muted font-medium text-xs">Stan Store</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Preço",               "Grátis",   "$5-24/mês",  "$29-99/mês"],
                  ["Taxa por venda",      "0%",       "2.9%",       "0%"],
                  ["Temas personalizáveis","19+",      "Limitados",  "1 layout"],
                  ["Efeitos animados",    "40+",      "0",          "0"],
                  ["Booking nativo",      "true",     "false",      "true"],
                  ["IA integrada",        "true",     "false",      "false"],
                  ["Design Packs 1 clique","16",      "0",          "0"],
                  ["Google Fonts",        "24+",      "Limitado",   "0"],
                  ["Suporte em PT-BR",    "true",     "false",      "false"],
                ].map(([feature, maview, linktree, stan], i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white dark:bg-[hsl(260,30%,9%)]" : "bg-maview-surface/50"}>
                    <td className="px-4 py-2.5 text-maview-text font-medium text-xs">{feature}</td>
                    <td className="px-4 py-2.5 text-center">
                      {maview === "true" ? <Check size={16} className="mx-auto text-emerald-500" />
                        : maview === "false" ? <X size={16} className="mx-auto text-red-400" />
                        : <span className="font-bold text-maview-purple text-xs">{maview}</span>}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {linktree === "true" ? <Check size={16} className="mx-auto text-emerald-500" />
                        : linktree === "false" ? <X size={16} className="mx-auto text-red-400" />
                        : <span className="text-maview-muted text-xs">{linktree}</span>}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {stan === "true" ? <Check size={16} className="mx-auto text-emerald-500" />
                        : stan === "false" ? <X size={16} className="mx-auto text-red-400" />
                        : <span className="text-maview-muted text-xs">{stan}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); switchMode("signup"); }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-maview-purple to-violet-600 text-white text-sm font-bold px-7 py-3.5 rounded-xl hover:brightness-105 hover:shadow-xl hover:shadow-maview-purple/25 transition-all active:scale-[0.98]"
            >
              Começar grátis — sem cartão
            </button>
          </div>
        </div>
      </div>

      {/* ══════════ TEMPLATE GALLERY ══════════ */}
      <div className="relative z-10 py-16 px-6 border-t border-maview-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-maview-text mb-3 tracking-tight">
              Comece com um{" "}
              <span className="bg-gradient-to-r from-maview-purple to-violet-500 bg-clip-text text-transparent">template pronto</span>
            </h2>
            <p className="text-maview-muted text-base max-w-lg mx-auto">
              Escolha um estilo, personalize em 1 minuto e publique. Sem começar do zero.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {TEMPLATE_GALLERY.map((tpl, i) => (
              <button
                key={i}
                onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); switchMode("signup"); }}
                className="group relative bg-white dark:bg-[hsl(260,30%,9%)] border border-maview-border rounded-2xl overflow-hidden hover:border-maview-purple/40 hover:shadow-xl hover:shadow-maview-purple/10 transition-all duration-300"
              >
                {/* Mini phone preview */}
                <div className="aspect-[9/14] rounded-t-xl overflow-hidden" style={{ background: tpl.theme.bg }}>
                  <div className="flex flex-col items-center pt-6 px-3">
                    <img src={tpl.avatar} alt="" className="w-10 h-10 rounded-full object-cover mb-2" style={{ boxShadow: `0 0 0 2px ${tpl.theme.accent}40` }} />
                    <p className="text-white text-[11px] font-bold">{tpl.displayName}</p>
                    <p className="text-[10px] mb-3" style={{ color: tpl.theme.accent }}>@{tpl.displayName.toLowerCase().replace(/\s/g, "")}</p>

                    {tpl.items.slice(0, 3).map((item, j) => (
                      <div key={j} className="w-full rounded-lg border px-2.5 py-1.5 mb-1.5 text-center"
                        style={{ borderColor: tpl.theme.accent + "30", background: tpl.theme.accent + "08" }}>
                        <span className="text-[9px] text-white/80 truncate block">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Label */}
                <div className="px-3 py-3 text-center">
                  <p className="text-maview-text text-xs font-bold">{tpl.name}</p>
                  <p className="text-maview-muted text-[10px] mt-0.5 group-hover:text-maview-purple transition-colors">Usar este template →</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ FAQ ══════════ */}
      <div className="relative z-10 py-16 px-6 border-t border-maview-border bg-maview-surface">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-maview-text mb-3 tracking-tight">
              Perguntas{" "}
              <span className="bg-gradient-to-r from-maview-purple to-violet-500 bg-clip-text text-transparent">frequentes</span>
            </h2>
            <p className="text-maview-muted text-base">Tudo que você precisa saber antes de começar.</p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map(({ q, a }, i) => (
              <details key={i} className="group rounded-2xl border border-maview-border bg-white dark:bg-[hsl(260,30%,9%)] shadow-sm overflow-hidden">
                <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer select-none hover:bg-maview-surface/50 transition-colors min-h-[52px]">
                  <span className="text-maview-text text-sm font-semibold">{q}</span>
                  <ChevronDown size={16} className="text-maview-muted group-open:rotate-180 transition-transform flex-shrink-0" />
                </summary>
                <div className="px-5 pb-4 border-t border-maview-border/50">
                  <p className="text-maview-muted text-sm leading-relaxed pt-3">{a}</p>
                </div>
              </details>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); switchMode("signup"); }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-maview-purple to-violet-600 text-white text-sm font-bold px-7 py-3.5 rounded-xl hover:brightness-105 hover:shadow-xl hover:shadow-maview-purple/25 transition-all active:scale-[0.98]"
            >
              <Zap size={15} className="fill-white" />
              Criar minha vitrine grátis
            </button>
          </div>
        </div>
      </div>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="relative z-10 border-t border-maview-border bg-white dark:bg-[hsl(260,30%,7%)]">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MaviewLogo size={28} />
                <span className="text-maview-text text-lg font-extrabold tracking-tight">Maview</span>
              </div>
              <p className="text-maview-muted text-sm leading-relaxed">
                Sua vitrine digital profissional. Link na bio, loja e booking — tudo em um só lugar.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="text-maview-text text-sm font-bold mb-3">Produto</p>
              <div className="space-y-2">
                <button onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); switchMode("signup"); }} className="block text-maview-muted text-sm hover:text-maview-purple transition-colors">Criar vitrine grátis</button>
                <span className="block text-maview-muted text-sm">Temas e design</span>
                <span className="block text-maview-muted text-sm">Analytics</span>
                <span className="block text-maview-muted text-sm">IA Maview</span>
              </div>
            </div>

            {/* Legal */}
            <div>
              <p className="text-maview-text text-sm font-bold mb-3">Suporte</p>
              <div className="space-y-2">
                <a href="/termos" className="block text-maview-muted text-sm hover:text-maview-purple transition-colors">Termos de Uso</a>
                <a href="/privacidade" className="block text-maview-muted text-sm hover:text-maview-purple transition-colors">Política de Privacidade</a>
                <a href="mailto:suporte@maview.app" className="block text-maview-muted text-sm hover:text-maview-purple transition-colors">suporte@maview.app</a>
                <a href="https://instagram.com/maview.app" target="_blank" rel="noopener noreferrer" className="block text-maview-muted text-sm hover:text-maview-purple transition-colors">@maview.app</a>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-6 border-t border-maview-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-maview-muted text-xs">&copy; {new Date().getFullYear()} Maview. Todos os direitos reservados.</p>
            <p className="text-maview-muted text-xs">Feito com 💜 no Brasil</p>
          </div>
        </div>
      </footer>

      {/* ══════════ EXIT INTENT POPUP ══════════ */}
      {showExitPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowExitPopup(false)} />
          <div className="relative bg-white dark:bg-[hsl(260,30%,9%)] rounded-3xl shadow-2xl dark:shadow-[0_8px_40px_-8px_rgba(124,58,237,0.2)] max-w-[380px] w-full p-8 text-center animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowExitPopup(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-maview-surface flex items-center justify-center hover:bg-maview-border transition-colors">
              <X size={16} className="text-maview-muted" />
            </button>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-maview-purple to-violet-500 flex items-center justify-center mx-auto mb-5">
              <Sparkles size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-extrabold text-maview-text mb-2">
              Espera! Sua vitrine em 30 segundos
            </h3>
            <p className="text-maview-muted text-sm mb-6">
              Mais de <strong>{realUserCount ? realUserCount.toLocaleString("pt-BR") : "2.000"} criadores</strong> ja usam o Maview para vender mais. 100% gratis, sem cartao de credito.
            </p>
            <button
              onClick={() => { setShowExitPopup(false); window.scrollTo({ top: 0, behavior: "smooth" }); switchMode("signup"); }}
              className="w-full bg-gradient-to-r from-maview-purple to-violet-600 text-white font-bold py-3.5 rounded-xl hover:brightness-105 transition-all active:scale-[0.98] shadow-lg shadow-maview-purple/25"
            >
              Criar agora — R$ 0
            </button>
            <p className="text-maview-muted text-[11px] mt-3 flex items-center justify-center gap-1.5">
              <Check size={10} className="text-emerald-500" /> Grátis para sempre
              <span className="mx-1 text-maview-border">·</span>
              <Check size={10} className="text-emerald-500" /> Sem cartão
              <span className="mx-1 text-maview-border">·</span>
              <Check size={10} className="text-emerald-500" /> Suporte PT
            </p>
          </div>
        </div>
      )}

      {/* ── Sticky mobile CTA (4.5) ── */}
      {showStickyCTA && mode !== "verify" && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden p-3 pb-safe bg-gradient-to-t from-maview-bg via-maview-bg/95 to-transparent">
          <button
            onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); switchMode("signup"); }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-maview-purple to-maview-pink text-white text-sm font-bold shadow-lg shadow-maview-purple/25 flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
          >
            <Sparkles size={16} />
            Criar minha vitrine gratis
          </button>
        </div>
      )}

    </div>
  );
};

export default Login;
