import { useState, useEffect, useCallback } from "react";
import { Eye, EyeOff, ArrowLeft, Check, X, Link2, Star, Zap, ShoppingBag, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Mode = "login" | "signup" | "forgot";

const FEATURES = [
  { icon: Link2, label: "Link in bio profissional", desc: "Uma URL para tudo que você cria" },
  { icon: ShoppingBag, label: "Loja sem taxas abusivas", desc: "Venda produtos digitais e físicos" },
  { icon: BarChart3, label: "Analytics em tempo real", desc: "Veja cliques, visitas e vendas" },
];

const TESTIMONIALS_ROW1 = [
  { name: "Ana Beatriz", role: "Criadora de conteúdo", text: "Com o Maview eu vendo cursos e tenho meu link bio num lugar só. Simples demais!", badge: "+3x vendas" },
  { name: "Lucas Ferreira", role: "Designer freelancer", text: "Personalizei meu tema em minutos. Nenhum concorrente oferece isso.", badge: "100% meu estilo" },
  { name: "Camila Torres", role: "Influenciadora", text: "Meus seguidores adoram a página. Parece profissional de verdade.", badge: "+40% cliques" },
  { name: "Rafael Costa", role: "Coach digital", text: "Vendo sessões de coaching direto pelo Maview. Zero complicação.", badge: "Sem taxas" },
  { name: "Juliana Melo", role: "Fotógrafa", text: "Coloquei meu portfólio, loja e contato em um link só. Perfeito!", badge: "+5x alcance" },
];

const TESTIMONIALS_ROW2 = [
  { name: "Pedro Alves", role: "Músico independente", text: "Vendo meus beats direto pelo link. O analytics me mostrou o que funciona.", badge: "+60% insights" },
  { name: "Marina Silva", role: "Nutricionista", text: "Antes usava 3 ferramentas. Agora só o Maview. Economizei muito tempo.", badge: "0 ferramentas extras" },
  { name: "Bruno Nunes", role: "Empreendedor", text: "O tema ficou exatamente com a identidade da minha marca. Incrível.", badge: "Marca forte" },
  { name: "Fernanda Lima", role: "Professora online", text: "Meus alunos me encontram fácil pelo link personalizado. Adorei!", badge: "+80% acessos" },
  { name: "Thiago Rocha", role: "Streamer", text: "Centralizo tudo no meu Maview: doações, produtos e redes sociais.", badge: "+2x engajamento" },
];

const TestimonialCard = ({ name, role, text, badge }: { name: string; role: string; text: string; badge: string }) => (
  <div className="flex-shrink-0 w-[260px] bg-maview-card/60 border border-white/[0.07] rounded-2xl p-5 mx-2">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => <Star key={i} size={11} className="text-amber-400 fill-amber-400" />)}
      </div>
      <span className="text-[10px] font-semibold text-maview-purple-light bg-maview-purple/10 border border-maview-purple/20 px-2 py-0.5 rounded-full whitespace-nowrap">{badge}</span>
    </div>
    <p className="text-white/80 text-sm leading-relaxed mb-4">"{text}"</p>
    <div>
      <p className="text-white text-xs font-semibold">{name}</p>
      <p className="text-maview-muted text-xs">{role}</p>
    </div>
  </div>
);

const InfiniteRow = ({ items, reverse = false }: { items: typeof TESTIMONIALS_ROW1; reverse?: boolean }) => {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden w-full" style={{ maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)" }}>
      <div
        className={`flex ${reverse ? "animate-scroll-reverse" : "animate-scroll"}`}
        style={{ width: "max-content" }}
      >
        {doubled.map((t, i) => <TestimonialCard key={i} {...t} />)}
      </div>
    </div>
  );
};

const isValidUsername = (val: string) => /^[a-z0-9-]{3,30}$/.test(val);

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");

  // Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");

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

  // Username validation debounced
  const checkUsername = useCallback(async (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setUsername(clean);
    if (!clean) { setUsernameStatus("idle"); return; }
    if (!isValidUsername(clean)) { setUsernameStatus("invalid"); return; }
    setUsernameStatus("checking");
    // Simulate check (replace with real DB check when profiles table exists)
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

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setIsLoading(false);
      return;
    }
    if (!isValidUsername(username)) {
      setError("Link inválido. Use letras minúsculas, números e hífen (mín. 3 caracteres).");
      setIsLoading(false);
      return;
    }

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
      setError("Não foi possível enviar o email. Tente novamente.");
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
    if (error) toast.error("Erro ao entrar com Google. Tente novamente.");
  };

  const onSubmit = mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleForgot;

  const usernameHint = {
    idle: null,
    checking: <span className="text-maview-muted/70">Verificando...</span>,
    available: <span className="text-emerald-400 flex items-center gap-1"><Check size={11} /> Disponível</span>,
    taken: <span className="text-red-400 flex items-center gap-1"><X size={11} /> Já está em uso</span>,
    invalid: <span className="text-amber-400">Mín. 3 caracteres — letras, números e hífen</span>,
  }[usernameStatus];

  return (
    <div className="min-h-screen flex bg-maview-bg relative overflow-hidden">

      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] rounded-full bg-maview-purple/[0.06] blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-maview-purple-dark/[0.08] blur-[120px]" />
        <svg className="absolute bottom-0 left-0 right-0 w-full opacity-[0.035]" viewBox="0 0 1440 360" fill="none" preserveAspectRatio="none" style={{ height: "38%" }}>
          <path d="M0 360V220C140 175 280 160 420 185C560 210 700 270 840 250C980 230 1120 145 1260 125C1340 115 1400 148 1440 165V360H0Z" fill="url(#mg1)" />
          <path d="M0 360V290C180 252 340 238 500 262C660 286 820 336 980 308C1140 280 1300 225 1440 242V360H0Z" fill="url(#mg2)" />
          <defs>
            <linearGradient id="mg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6D28D9" /><stop offset="100%" stopColor="#0F0B1F" /></linearGradient>
            <linearGradient id="mg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4C1D95" /><stop offset="100%" stopColor="#0F0B1F" /></linearGradient>
          </defs>
        </svg>
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.018]" style={{
          backgroundImage: "linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
      </div>

      {/* ── LEFT — Branding ── */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 xl:px-24 relative z-10">
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
          <h1 className="text-5xl xl:text-[3.4rem] font-extrabold text-white leading-[1.1] mb-5 tracking-tight">
            Sua vitrine.{" "}
            <br />
            Seu link.{" "}
            <br />
            <span className="bg-gradient-to-r from-maview-purple-light via-violet-400 to-maview-purple bg-clip-text text-transparent">
              Sua renda.
            </span>
          </h1>

          <p className="text-maview-muted text-lg leading-relaxed mb-10">
            Combine link in bio + loja digital em um único lugar.
            Sem taxas absurdas. Sem engessamento de temas.
          </p>

          {/* Feature list */}
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
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-maview-bg" style={{
                  background: `linear-gradient(135deg, hsl(${255 + i * 18} 65% ${28 + i * 7}%), hsl(${268 + i * 10} 45% ${18 + i * 5}%))`,
                }} />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={11} className="text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-sm text-maview-muted">
                <span className="text-white font-semibold">+2.000</span> criadores já usam
              </p>
            </div>
          </div>

          {/* Mock profile preview */}
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

          {/* Testimonials carousel */}
          <div className="mt-10 space-y-3">
            <p className="text-xs text-maview-muted/60 mb-4">O que nossos criadores dizem</p>
            <InfiniteRow items={TESTIMONIALS_ROW1} />
            <InfiniteRow items={TESTIMONIALS_ROW2} reverse />
          </div>

        </div>
      </div>

      {/* ── RIGHT — Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 relative z-10 py-12">
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
            {/* Purple glow border top */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-maview-purple/50 to-transparent rounded-t-[24px]" />

            {/* Header */}
            <div className="mb-7">
              {mode === "forgot" && (
                <button type="button" onClick={() => switchMode("login")} className="flex items-center gap-1.5 text-xs text-maview-muted hover:text-white transition-colors mb-4">
                  <ArrowLeft size={13} /> Voltar ao login
                </button>
              )}

              {/* Mode tabs — login / signup */}
              {mode !== "forgot" && (
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
                {mode === "login" && "Bem-vindo de volta"}
                {mode === "signup" && "Crie sua conta grátis"}
                {mode === "forgot" && "Recuperar senha"}
              </h2>
              <p className="text-maview-muted text-sm">
                {mode === "login" && "Entre para acessar sua vitrine"}
                {mode === "signup" && "Comece em menos de 2 minutos"}
                {mode === "forgot" && "Enviaremos um link de redefinição"}
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">

              {/* Name */}
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-maview-muted-light block">Nome completo</label>
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => { setName(e.target.value); clearError(); }}
                    className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-maview-muted/50 outline-none transition-all focus:border-maview-purple focus:ring-1 focus:ring-maview-purple/40"
                    required
                  />
                </div>
              )}

              {/* Username — signup only */}
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-maview-muted-light block">Personalize seu link</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-maview-muted text-sm font-medium select-none pointer-events-none">
                      maview.app/
                    </div>
                    <input
                      type="text"
                      placeholder="seunome"
                      value={username}
                      onChange={(e) => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); clearError(); }}
                      className={`w-full h-11 pl-[104px] pr-4 rounded-xl bg-white/[0.04] border text-white text-sm placeholder:text-maview-muted/40 outline-none transition-all focus:ring-1 ${
                        usernameStatus === "available"
                          ? "border-emerald-500/50 focus:border-emerald-400 focus:ring-emerald-400/30"
                          : usernameStatus === "taken" || usernameStatus === "invalid"
                          ? "border-red-500/40 focus:border-red-400 focus:ring-red-400/30"
                          : "border-white/[0.08] focus:border-maview-purple focus:ring-maview-purple/40"
                      }`}
                      required
                      maxLength={30}
                    />
                    {usernameStatus !== "idle" && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {usernameStatus === "checking" && <div className="w-3.5 h-3.5 border-2 border-maview-muted/30 border-t-maview-muted rounded-full animate-spin" />}
                        {usernameStatus === "available" && <Check size={14} className="text-emerald-400" />}
                        {(usernameStatus === "taken" || usernameStatus === "invalid") && <X size={14} className="text-red-400" />}
                      </div>
                    )}
                  </div>
                  {usernameHint && (
                    <p className="text-[11px] pl-1">{usernameHint}</p>
                  )}
                  {username && usernameStatus === "available" && (
                    <p className="text-[11px] text-maview-muted/60 pl-1">
                      Seu link: <span className="text-maview-purple-light">maview.app/{username}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-maview-muted-light block">Email</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-maview-muted/50 outline-none transition-all focus:border-maview-purple focus:ring-1 focus:ring-maview-purple/40"
                  required
                />
              </div>

              {/* Password */}
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
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); clearError(); }}
                      className="w-full h-11 px-4 pr-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-maview-muted/50 outline-none transition-all focus:border-maview-purple focus:ring-1 focus:ring-maview-purple/40"
                      required
                      minLength={mode === "signup" ? 6 : undefined}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-maview-muted hover:text-white transition-colors">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm password */}
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-maview-muted-light block">Confirmar senha</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
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

              {/* Error */}
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 flex items-start gap-2">
                  <X size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || (mode === "signup" && usernameStatus !== "available")}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 via-maview-purple to-purple-700 text-white text-sm font-semibold transition-all duration-200 hover:shadow-xl hover:shadow-maview-purple/30 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] mt-1"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{mode === "login" ? "Entrando..." : mode === "signup" ? "Criando conta..." : "Enviando..."}</span>
                  </div>
                ) : (
                  mode === "login" ? "Entrar" : mode === "signup" ? "Criar minha vitrine →" : "Enviar link de recuperação"
                )}
              </button>
            </form>

            {/* Google */}
            {mode !== "forgot" && (
              <>
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-white/[0.05]" />
                  <span className="text-xs text-maview-muted/60">ou continue com</span>
                  <div className="flex-1 h-px bg-white/[0.05]" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogle}
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
  );
};

export default Login;
