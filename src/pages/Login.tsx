import { useState, useEffect, useCallback } from "react";
import {
  Eye, EyeOff, ArrowLeft, Check, X,
  Link2, Star, Zap, ShoppingBag, BarChart3,
  TrendingUp, Users, DollarSign, Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Mode = "login" | "signup" | "forgot";

/* ─── Static data ─────────────────────────────────────────────── */

const FEATURES = [
  { icon: Link2,      label: "Link in bio profissional", desc: "Uma URL para tudo que você cria" },
  { icon: ShoppingBag, label: "Loja sem taxas abusivas",  desc: "Venda produtos digitais e físicos" },
  { icon: BarChart3,  label: "Analytics em tempo real",  desc: "Veja cliques, visitas e vendas" },
];

const STATS = [
  { icon: Users,      value: "+2.000",  label: "criadores ativos" },
  { icon: TrendingUp, value: "+340%",   label: "média de cliques a mais" },
  { icon: DollarSign, value: "R$0",     label: "taxa por venda" },
  { icon: Sparkles,   value: "∞",       label: "temas personalizáveis" },
];

const TESTIMONIALS_ROW1 = [
  { name: "Ana Beatriz",  role: "Criadora de conteúdo", text: "Com o Maview vendo cursos e tenho meu link bio num lugar só. Triplicou minhas vendas!", badge: "+3x vendas",     initials: "AB", color: "#7C3AED" },
  { name: "Lucas Ferreira", role: "Designer freelancer", text: "Personalizei meu tema em minutos. Nenhum concorrente oferece essa liberdade.", badge: "100% meu estilo", initials: "LF", color: "#6D28D9" },
  { name: "Camila Torres", role: "Influenciadora",       text: "Meus seguidores adoram a página. Parece profissional de verdade.", badge: "+40% cliques",  initials: "CT", color: "#5B21B6" },
  { name: "Rafael Costa",  role: "Coach digital",        text: "Vendo sessões de coaching direto pelo Maview. Zero complicação e zero taxa.", badge: "Sem taxas",      initials: "RC", color: "#4C1D95" },
  { name: "Juliana Melo",  role: "Fotógrafa",            text: "Portfólio, loja e contato em um link só. Meus clientes chegam me perguntando como fiz.", badge: "+5x alcance",   initials: "JM", color: "#7C3AED" },
];

const TESTIMONIALS_ROW2 = [
  { name: "Pedro Alves",   role: "Músico independente", text: "Vendo meus beats direto pelo link. O analytics me mostrou o que converte.", badge: "+60% insights",      initials: "PA", color: "#6D28D9" },
  { name: "Marina Silva",  role: "Nutricionista",       text: "Antes usava 3 ferramentas separadas. Agora só o Maview. Economizei tempo e dinheiro.", badge: "3 ferramentas → 1", initials: "MS", color: "#5B21B6" },
  { name: "Bruno Nunes",   role: "Empreendedor",        text: "O tema ficou exatamente com a identidade da minha marca. Incrível diferencial.", badge: "Marca forte",        initials: "BN", color: "#4C1D95" },
  { name: "Fernanda Lima", role: "Professora online",   text: "Meus alunos me encontram fácil pelo link personalizado. Simples e eficiente.", badge: "+80% acessos",       initials: "FL", color: "#7C3AED" },
  { name: "Thiago Rocha",  role: "Streamer",            text: "Centralizo doações, produtos e redes sociais no meu Maview. Engajamento dobrou.", badge: "+2x engajamento",    initials: "TR", color: "#6D28D9" },
];

/* ─── Components ──────────────────────────────────────────────── */

const TestimonialCard = ({
  name, role, text, badge, initials, color,
}: {
  name: string; role: string; text: string;
  badge: string; initials: string; color: string;
}) => (
  <div className="flex-shrink-0 w-[280px] bg-[#12102A] border border-white/[0.08] rounded-2xl p-5 mx-2 hover:border-maview-purple/30 transition-colors duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
        ))}
      </div>
      <span className="text-[10px] font-bold tracking-wide text-maview-purple-light bg-maview-purple/15 border border-maview-purple/25 px-2.5 py-0.5 rounded-full whitespace-nowrap">
        {badge}
      </span>
    </div>
    <p className="text-white/75 text-sm leading-relaxed mb-5">"{text}"</p>
    <div className="flex items-center gap-2.5">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
      >
        {initials}
      </div>
      <div>
        <p className="text-white text-xs font-semibold">{name}</p>
        <p className="text-maview-muted/70 text-xs">{role}</p>
      </div>
    </div>
  </div>
);

const InfiniteRow = ({
  items, reverse = false,
}: {
  items: typeof TESTIMONIALS_ROW1; reverse?: boolean;
}) => {
  const doubled = [...items, ...items];
  return (
    <div
      className="overflow-hidden w-full"
      style={{ maskImage: "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)" }}
    >
      <div
        className={`flex ${reverse ? "animate-scroll-reverse" : "animate-scroll"}`}
        style={{ width: "max-content" }}
      >
        {doubled.map((t, i) => <TestimonialCard key={i} {...t} />)}
      </div>
    </div>
  );
};

/* ─── Helpers ─────────────────────────────────────────────────── */

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
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
  }, [navigate]);

  const clearError = () => setError("");

  const switchMode = (next: Mode) => {
    clearError();
    setPassword("");
    setConfirmPassword("");
    setUsernameStatus("idle");
    setMode(next);
  };

  const checkUsername = useCallback(async (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setUsername(clean);
    if (!clean) { setUsernameStatus("idle"); return; }
    if (!isValidUsername(clean)) { setUsernameStatus("invalid"); return; }
    setUsernameStatus("checking");
    await new Promise((r) => setTimeout(r, 600));
    setUsernameStatus("available");
  }, []);

  useEffect(() => {
    if (mode !== "signup") return;
    const t = setTimeout(() => checkUsername(username), 400);
    return () => clearTimeout(t);
  }, [username, mode, checkUsername]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email ou senha incorretos."
          : "Ocorreu um erro. Tente novamente."
      );
    } else {
      navigate("/dashboard");
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();
    if (password !== confirmPassword) { setError("As senhas não coincidem."); setIsLoading(false); return; }
    if (password.length < 6)          { setError("Mínimo 6 caracteres.");     setIsLoading(false); return; }
    if (!isValidUsername(username))   { setError("Link inválido.");            setIsLoading(false); return; }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, username },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      setError(
        error.message === "User already registered"
          ? "Este email já está cadastrado."
          : error.message
      );
    } else {
      toast.success("Conta criada! Verifique seu email para confirmar.");
      switchMode("login");
    }
    setIsLoading(false);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError("Não foi possível enviar o email.");
    } else {
      toast.success("Email enviado! Verifique sua caixa de entrada.");
      switchMode("login");
    }
    setIsLoading(false);
  };

  const handleGoogle = async () => {
    clearError();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) toast.error("Erro ao entrar com Google.");
  };

  const onSubmit =
    mode === "login" ? handleLogin :
    mode === "signup" ? handleSignup :
    handleForgot;

  const usernameHint = {
    idle:      null,
    checking:  <span className="text-maview-muted/70 flex items-center gap-1"><span className="w-2.5 h-2.5 border border-maview-muted/40 border-t-maview-muted rounded-full animate-spin inline-block" /> Verificando...</span>,
    available: <span className="text-emerald-400 flex items-center gap-1"><Check size={11} /> maview.app/<b>{username}</b> está disponível!</span>,
    taken:     <span className="text-red-400 flex items-center gap-1"><X size={11} /> Já está em uso</span>,
    invalid:   <span className="text-amber-400">Mín. 3 caracteres — letras, números e hífen</span>,
  }[usernameStatus];

  return (
    <div className="min-h-screen flex flex-col bg-maview-bg relative overflow-hidden">

      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full bg-maview-purple/[0.07] blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[550px] h-[550px] rounded-full bg-violet-900/[0.09] blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: "linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
      </div>

      {/* ══════════════════════════════════════════
          TOP SECTION — split: branding + form
      ══════════════════════════════════════════ */}
      <div className="flex flex-1 relative z-10">

        {/* ── LEFT ── */}
        <div className="hidden lg:flex flex-1 flex-col justify-center px-16 xl:px-24">
          <div className="max-w-[480px]">

            {/* Logo */}
            <div className="flex items-center gap-3 mb-14">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-maview-purple to-maview-purple-dark flex items-center justify-center shadow-xl shadow-maview-purple/30">
                <span className="text-white font-bold text-xl leading-none">M</span>
              </div>
              <span className="text-white text-2xl font-bold tracking-tight">Maview</span>
              <span className="ml-1 text-[10px] font-semibold text-maview-purple-light bg-maview-purple/10 border border-maview-purple/25 px-2 py-0.5 rounded-full uppercase tracking-widest">Beta</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl xl:text-[3.2rem] font-extrabold text-white leading-[1.1] mb-5 tracking-tight">
              Sua vitrine.<br />
              Seu link.<br />
              <span className="bg-gradient-to-r from-maview-purple-light via-violet-400 to-maview-purple bg-clip-text text-transparent">
                Sua renda.
              </span>
            </h1>

            <p className="text-maview-muted text-lg leading-relaxed mb-10">
              Combine link in bio + loja digital em um único lugar.
              Sem taxas absurdas. Sem engessamento de temas.
            </p>

            {/* Features */}
            <div className="space-y-4 mb-12">
              {FEATURES.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-maview-purple/10 border border-maview-purple/20 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-maview-purple-light" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{label}</p>
                    <p className="text-maview-muted text-xs">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 pt-8 border-t border-white/[0.05]">
              <div className="flex -space-x-2.5">
                {[0,1,2,3,4].map((i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-maview-bg" style={{
                    background: `linear-gradient(135deg, hsl(${255+i*18} 65% ${28+i*7}%), hsl(${268+i*10} 45% ${18+i*5}%))`,
                  }} />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={11} className="text-amber-400 fill-amber-400" />)}
                  <span className="text-amber-400 text-xs font-semibold ml-1">4.9</span>
                </div>
                <p className="text-sm text-maview-muted">
                  <span className="text-white font-semibold">+2.000</span> criadores já usam
                </p>
              </div>
            </div>

            {/* Live preview */}
            <div className="mt-8 bg-maview-card/40 border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">@seunome</p>
                <p className="text-maview-muted text-xs truncate">maview.app/seunome</p>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                <Zap size={12} className="fill-emerald-400" />
                Ao vivo
              </div>
            </div>

          </div>
        </div>

        {/* ── RIGHT — Form ── */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-14">
          <div className="w-full max-w-[420px]">

            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-2.5 mb-10 justify-center">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-maview-purple to-maview-purple-dark flex items-center justify-center shadow-lg shadow-maview-purple/20">
                <span className="text-white font-bold text-lg leading-none">M</span>
              </div>
              <span className="text-white text-2xl font-bold tracking-tight">Maview</span>
            </div>

            {/* Card */}
            <div className="relative bg-maview-card/70 backdrop-blur-2xl rounded-[24px] border border-white/[0.07] p-8 sm:p-10 shadow-2xl shadow-black/40">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-maview-purple/60 to-transparent rounded-t-[24px]" />

              {/* Header */}
              <div className="mb-7">
                {mode === "forgot" ? (
                  <button type="button" onClick={() => switchMode("login")} className="flex items-center gap-1.5 text-xs text-maview-muted hover:text-white transition-colors mb-4">
                    <ArrowLeft size={13} /> Voltar ao login
                  </button>
                ) : (
                  <div className="flex bg-white/[0.04] rounded-xl p-1 mb-6 border border-white/[0.05]">
                    {(["login", "signup"] as Mode[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => switchMode(m)}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          mode === m
                            ? "bg-maview-purple text-white shadow-lg shadow-maview-purple/30"
                            : "text-maview-muted hover:text-white"
                        }`}
                      >
                        {m === "login" ? "Entrar" : "Criar conta"}
                      </button>
                    ))}
                  </div>
                )}

                <h2 className="text-white text-lg font-semibold mb-1">
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

              <form onSubmit={onSubmit} className="space-y-4">

                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-maview-muted-light block">Nome completo</label>
                    <input
                      type="text" placeholder="Seu nome" value={name}
                      onChange={(e) => { setName(e.target.value); clearError(); }}
                      className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-maview-muted/50 outline-none transition-all focus:border-maview-purple focus:ring-1 focus:ring-maview-purple/40"
                      required
                    />
                  </div>
                )}

                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-maview-muted-light block">
                      Personalize seu link
                      <span className="ml-2 text-[10px] text-maview-purple-light bg-maview-purple/10 border border-maview-purple/20 px-1.5 py-0.5 rounded-full">Exclusivo seu</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-maview-muted/80 text-sm font-medium select-none pointer-events-none">
                        maview.app/
                      </div>
                      <input
                        type="text" placeholder="seunome" value={username}
                        onChange={(e) => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); clearError(); }}
                        className={`w-full h-11 pl-[104px] pr-10 rounded-xl bg-white/[0.04] border text-white text-sm placeholder:text-maview-muted/40 outline-none transition-all focus:ring-1 ${
                          usernameStatus === "available"
                            ? "border-emerald-500/50 focus:border-emerald-400 focus:ring-emerald-400/30"
                            : usernameStatus === "taken" || usernameStatus === "invalid"
                            ? "border-red-500/40 focus:border-red-400 focus:ring-red-400/30"
                            : "border-white/[0.08] focus:border-maview-purple focus:ring-maview-purple/40"
                        }`}
                        required maxLength={30}
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {usernameStatus === "checking"  && <div className="w-3.5 h-3.5 border-2 border-maview-muted/30 border-t-maview-muted rounded-full animate-spin" />}
                        {usernameStatus === "available" && <Check size={14} className="text-emerald-400" />}
                        {(usernameStatus === "taken" || usernameStatus === "invalid") && <X size={14} className="text-red-400" />}
                      </div>
                    </div>
                    {usernameHint && <p className="text-[11px] pl-1 mt-1">{usernameHint}</p>}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-maview-muted-light block">Email</label>
                  <input
                    type="email" placeholder="seu@email.com" value={email}
                    onChange={(e) => { setEmail(e.target.value); clearError(); }}
                    className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-maview-muted/50 outline-none transition-all focus:border-maview-purple focus:ring-1 focus:ring-maview-purple/40"
                    required
                  />
                </div>

                {mode !== "forgot" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-maview-muted-light block">Senha</label>
                      {mode === "login" && (
                        <button type="button" onClick={() => switchMode("forgot")} className="text-xs text-maview-purple-light hover:text-white transition-colors">
                          Esqueceu?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"} placeholder="••••••••" value={password}
                        onChange={(e) => { setPassword(e.target.value); clearError(); }}
                        className="w-full h-11 px-4 pr-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-maview-muted/50 outline-none transition-all focus:border-maview-purple focus:ring-1 focus:ring-maview-purple/40"
                        required minLength={mode === "signup" ? 6 : undefined}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-maview-muted hover:text-white transition-colors">
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-maview-muted-light block">Confirmar senha</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); clearError(); }}
                        className="w-full h-11 px-4 pr-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-maview-muted/50 outline-none transition-all focus:border-maview-purple focus:ring-1 focus:ring-maview-purple/40"
                        required
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-maview-muted hover:text-white transition-colors">
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 flex items-start gap-2">
                    <X size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || (mode === "signup" && usernameStatus !== "available")}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 via-maview-purple to-purple-700 text-white text-sm font-semibold transition-all duration-200 hover:shadow-xl hover:shadow-maview-purple/35 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] mt-1"
                >
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
              </form>

              {mode !== "forgot" && (
                <>
                  <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-white/[0.05]" />
                    <span className="text-xs text-maview-muted/60">ou continue com</span>
                    <div className="flex-1 h-px bg-white/[0.05]" />
                  </div>
                  <button
                    type="button" onClick={handleGoogle}
                    className="w-full h-11 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm font-medium flex items-center justify-center gap-2.5 transition-all hover:bg-white/[0.07] hover:border-white/[0.14] active:scale-[0.98]"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                  </button>
                </>
              )}
            </div>

            <p className="text-center text-xs text-maview-muted/40 mt-5">
              Ao continuar, você concorda com os{" "}
              <span className="hover:text-maview-muted cursor-pointer transition-colors underline underline-offset-2">Termos de Uso</span>
              {" "}e a{" "}
              <span className="hover:text-maview-muted cursor-pointer transition-colors underline underline-offset-2">Política de Privacidade</span>.
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          STATS BAR — full width
      ══════════════════════════════════════════ */}
      <div className="relative z-10 border-t border-white/[0.05] bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-maview-purple/10 border border-maview-purple/20 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-maview-purple-light" />
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-none">{value}</p>
                <p className="text-maview-muted text-xs mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          TESTIMONIALS — full width below
      ══════════════════════════════════════════ */}
      <div className="relative z-10 py-14 border-t border-white/[0.04]">

        {/* Section header */}
        <div className="text-center mb-10 px-6">
          <div className="inline-flex items-center gap-2 bg-maview-purple/10 border border-maview-purple/20 rounded-full px-4 py-1.5 mb-4">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold text-maview-purple-light tracking-wide uppercase">Histórias reais</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Criadores que já transformaram{" "}
            <span className="bg-gradient-to-r from-maview-purple-light to-violet-400 bg-clip-text text-transparent">
              sua renda
            </span>
          </h2>
          <p className="text-maview-muted text-sm max-w-lg mx-auto">
            Mais de <strong className="text-white">2.000 criadores</strong> usam o Maview para vender mais, aparecer mais e trabalhar menos.
          </p>
        </div>

        {/* Carousels */}
        <div className="space-y-4">
          <InfiniteRow items={TESTIMONIALS_ROW1} />
          <InfiniteRow items={TESTIMONIALS_ROW2} reverse />
        </div>

        {/* CTA below carousel */}
        <div className="text-center mt-10 px-6">
          <p className="text-maview-muted/60 text-sm mb-1">
            Sua história pode ser a próxima.
          </p>
          <button
            onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); switchMode("signup"); }}
            className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-maview-purple text-white text-sm font-semibold px-6 py-3 rounded-xl hover:brightness-110 hover:shadow-xl hover:shadow-maview-purple/30 transition-all active:scale-[0.98]"
          >
            <Zap size={15} className="fill-white" />
            Criar minha vitrine grátis
          </button>
        </div>
      </div>

    </div>
  );
};

export default Login;
