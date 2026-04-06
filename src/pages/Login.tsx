import { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Mode = "login" | "signup" | "forgot";

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
    setMode(next);
  };

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

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
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
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) toast.error("Erro ao entrar com Google. Tente novamente.");
  };

  const headings = {
    login: { title: "Bem-vindo de volta", sub: "Entre na sua conta para continuar" },
    signup: { title: "Crie sua conta", sub: "Comece sua jornada no Maview" },
    forgot: { title: "Recuperar senha", sub: "Enviaremos um link para seu email" },
  };

  const submitLabel = {
    login: "Entrar",
    signup: "Criar conta",
    forgot: "Enviar link",
  };

  const loadingLabel = {
    login: "Entrando...",
    signup: "Criando conta...",
    forgot: "Enviando...",
  };

  const onSubmit = mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleForgot;

  return (
    <div className="min-h-screen flex bg-maview-bg relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-maview-purple/[0.07] blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-[400px] bg-gradient-to-t from-maview-purple-dark/10 to-transparent" />
        <svg
          className="absolute bottom-0 left-0 right-0 w-full opacity-[0.04]"
          viewBox="0 0 1440 400"
          fill="none"
          preserveAspectRatio="none"
          style={{ height: "40%" }}
        >
          <path
            d="M0 400V250C120 200 240 180 360 200C480 220 600 280 720 260C840 240 960 140 1080 120C1200 100 1320 160 1440 180V400H0Z"
            fill="url(#mountain1)"
          />
          <path
            d="M0 400V300C160 260 320 240 480 270C640 300 800 350 960 320C1120 290 1280 230 1440 250V400H0Z"
            fill="url(#mountain2)"
          />
          <defs>
            <linearGradient id="mountain1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6D28D9" />
              <stop offset="100%" stopColor="#0F0B1F" />
            </linearGradient>
            <linearGradient id="mountain2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4C1D95" />
              <stop offset="100%" stopColor="#0F0B1F" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }} />
      </div>

      {/* Left — Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 xl:px-24 relative z-10">
        <div className="max-w-lg">
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-maview-purple to-maview-purple-dark flex items-center justify-center shadow-lg shadow-maview-purple/20">
              <span className="text-white font-bold text-lg leading-none">M</span>
            </div>
            <span className="text-white text-2xl font-semibold tracking-tight">Maview</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-5">
            Construa sua{" "}
            <span className="bg-gradient-to-r from-maview-purple-light to-maview-purple bg-clip-text text-transparent">
              vitrine digital.
            </span>
          </h1>

          <p className="text-maview-muted text-lg leading-relaxed">
            Sua página. Seus produtos. Sua renda.
          </p>

          <div className="mt-10 space-y-3">
            {[
              "Link in bio + loja em um só lugar",
              "Temas flexíveis para sua identidade",
              "Venda produtos digitais sem taxas absurdas",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-maview-purple/20 border border-maview-purple/30 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-maview-purple-light" />
                </div>
                <span className="text-maview-muted text-sm">{feat}</span>
              </div>
            ))}
          </div>

          <div className="mt-16 flex items-center gap-4">
            <div className="flex -space-x-2.5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-maview-bg bg-maview-card"
                  style={{
                    background: `linear-gradient(135deg, hsl(${260 + i * 15} 60% ${30 + i * 8}%), hsl(${270 + i * 10} 40% ${20 + i * 5}%))`,
                  }}
                />
              ))}
            </div>
            <p className="text-sm text-maview-muted">
              <span className="text-maview-purple-light font-medium">+2.000</span> criadores já usam
            </p>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 relative z-10">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-10 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-maview-purple to-maview-purple-dark flex items-center justify-center shadow-lg shadow-maview-purple/20">
              <span className="text-white font-bold text-lg leading-none">M</span>
            </div>
            <span className="text-white text-2xl font-semibold tracking-tight">Maview</span>
          </div>

          {/* Card */}
          <div className="bg-maview-card/80 backdrop-blur-xl rounded-[20px] border border-white/[0.06] p-8 sm:p-10 shadow-2xl shadow-maview-purple/[0.08]">
            <div className="mb-8">
              {mode === "forgot" && (
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="flex items-center gap-1.5 text-xs text-maview-muted hover:text-white transition-colors duration-200 mb-4"
                >
                  <ArrowLeft size={13} />
                  Voltar ao login
                </button>
              )}
              <h2 className="text-white text-xl font-semibold mb-1.5">{headings[mode].title}</h2>
              <p className="text-maview-muted text-sm">{headings[mode].sub}</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {/* Name — signup only */}
              {mode === "signup" && (
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-maview-muted-light block">
                    Nome completo
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => { setName(e.target.value); clearError(); }}
                    className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-maview-muted/60 outline-none transition-all duration-200 focus:border-maview-purple focus:ring-1 focus:ring-maview-purple/40"
                    required
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-maview-muted-light block">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-maview-muted/60 outline-none transition-all duration-200 focus:border-maview-purple focus:ring-1 focus:ring-maview-purple/40"
                  required
                />
              </div>

              {/* Password */}
              {mode !== "forgot" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-maview-muted-light block">
                      Senha
                    </label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="text-xs text-maview-purple-light hover:text-white transition-colors duration-200"
                      >
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); clearError(); }}
                      className="w-full h-11 px-4 pr-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-maview-muted/60 outline-none transition-all duration-200 focus:border-maview-purple focus:ring-1 focus:ring-maview-purple/40"
                      required
                      minLength={mode === "signup" ? 6 : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-maview-muted hover:text-white transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {mode === "signup" && (
                    <p className="text-xs text-maview-muted mt-1">Mínimo de 6 caracteres</p>
                  )}
                </div>
              )}

              {/* Confirm password — signup only */}
              {mode === "signup" && (
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-maview-muted-light block">
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); clearError(); }}
                      className="w-full h-11 px-4 pr-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-maview-muted/60 outline-none transition-all duration-200 focus:border-maview-purple focus:ring-1 focus:ring-maview-purple/40"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-maview-muted hover:text-white transition-colors duration-200"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-maview-purple to-maview-purple-dark text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-maview-purple/25 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{loadingLabel[mode]}</span>
                  </div>
                ) : (
                  submitLabel[mode]
                )}
              </button>
            </form>

            {/* Social login — not shown on forgot */}
            {mode !== "forgot" && (
              <>
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-xs text-maview-muted">ou</span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogle}
                  className="w-full h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-medium flex items-center justify-center gap-2.5 transition-all duration-200 hover:bg-white/[0.07] hover:border-white/[0.12] active:scale-[0.98]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continuar com Google
                </button>
              </>
            )}

            {/* Footer link */}
            <p className="text-center text-sm text-maview-muted mt-6">
              {mode === "login" ? (
                <>
                  Não tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className="text-maview-purple-light hover:text-white font-medium transition-colors duration-200"
                  >
                    Criar conta
                  </button>
                </>
              ) : mode === "signup" ? (
                <>
                  Já tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="text-maview-purple-light hover:text-white font-medium transition-colors duration-200"
                  >
                    Entrar
                  </button>
                </>
              ) : null}
            </p>
          </div>

          <p className="text-center text-xs text-maview-muted/50 mt-6">
            Ao continuar, você concorda com nossos{" "}
            <span className="hover:text-maview-muted cursor-pointer transition-colors">Termos</span>
            {" "}e{" "}
            <span className="hover:text-maview-muted cursor-pointer transition-colors">Política de Privacidade</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
