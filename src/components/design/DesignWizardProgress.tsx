import { useState, useEffect } from "react";
import { Check, Copy, PartyPopper } from "lucide-react";

interface DesignWizardProgressProps {
  completedSteps: Set<number>;
  username?: string;
  onCopyLink?: () => void;
}

const STEPS = [
  { id: 1, label: "Estilo" },
  { id: 2, label: "Cor" },
  { id: 3, label: "Fonte" },
];

export default function DesignWizardProgress({ completedSteps, username, onCopyLink }: DesignWizardProgressProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [copied, setCopied] = useState(false);
  const allDone = completedSteps.size >= 3;

  useEffect(() => {
    if (allDone) {
      setShowCelebration(true);
      const t = setTimeout(() => setShowCelebration(false), 5000);
      return () => clearTimeout(t);
    }
  }, [allDone]);

  const handleCopy = () => {
    if (onCopyLink) onCopyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-0">
        {STEPS.map((step, i) => {
          const done = completedSteps.has(step.id);
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
                  done
                    ? "bg-primary text-white shadow-lg shadow-primary/30 wizard-step-done"
                    : "bg-[hsl(var(--dash-surface-2))] text-[hsl(var(--dash-text-subtle))] border border-[hsl(var(--dash-border-subtle))]"
                }`}>
                  {done ? <Check size={13} strokeWidth={3} /> : step.id}
                </div>
                <span className={`text-[9px] font-semibold transition-colors ${done ? "text-primary" : "text-[hsl(var(--dash-text-subtle))]"}`}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-[2px] mx-1.5 rounded-full transition-all duration-500" style={{
                  background: done ? "hsl(var(--primary))" : "hsl(var(--dash-border-subtle))",
                  opacity: done ? 0.6 : 0.3,
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Celebration banner */}
      {showCelebration && (
        <div className="design-complete-banner rounded-2xl bg-gradient-to-r from-primary/10 via-primary/15 to-primary/10 border border-primary/20 p-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <PartyPopper size={18} className="text-primary" />
            <p className="text-[13px] font-bold text-[hsl(var(--dash-text))]">Sua vitrine esta pronta!</p>
            <PartyPopper size={18} className="text-primary scale-x-[-1]" />
          </div>
          {username && (
            <button onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-[11px] font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25">
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Link copiado!" : "Compartilhar minha vitrine"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
