import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Maview] Uncaught error:", error, errorInfo);
    // TODO: Send to Sentry when configured
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--dash-bg))] px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[hsl(var(--dash-text))] mb-2">
              Algo deu errado
            </h2>
            <p className="text-sm text-[hsl(var(--dash-text-muted))] mb-6">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            {this.state.error && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/30 border border-red-500/20 text-left max-w-lg mx-auto overflow-auto max-h-40">
                <p className="text-xs font-mono text-red-400 break-all">{this.state.error.message}</p>
                <p className="text-[10px] font-mono text-red-400/60 mt-1 break-all whitespace-pre-wrap">{this.state.error.stack?.split('\n').slice(1, 5).join('\n')}</p>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl bg-[hsl(var(--dash-purple))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
