import { useState, useEffect, useCallback } from "react";
import { Bell, X, Check, ShoppingBag, Users, TrendingUp, Sparkles } from "lucide-react";

interface Notification {
  id: string;
  type: "sale" | "lead" | "milestone" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const LS_KEY = "maview_notifications";

function loadNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return getDefaultNotifications();
    return JSON.parse(raw).map((n: Notification) => ({ ...n, timestamp: new Date(n.timestamp) }));
  } catch {
    return getDefaultNotifications();
  }
}

function getDefaultNotifications(): Notification[] {
  return [
    {
      id: "welcome",
      type: "system",
      title: "Bem-vindo ao Maview!",
      message: "Configure sua vitrine e comece a compartilhar seu link.",
      timestamp: new Date(),
      read: false,
    },
    {
      id: "tip-1",
      type: "system",
      title: "Dica: Adicione seus produtos",
      message: "Vitrines com produtos vendem at\u00e9 3x mais.",
      timestamp: new Date(Date.now() - 60000),
      read: false,
    },
  ];
}

const iconMap = {
  sale: ShoppingBag,
  lead: Users,
  milestone: TrendingUp,
  system: Sparkles,
};

const colorMap = {
  sale: "text-emerald-500 bg-emerald-50",
  lead: "text-blue-500 bg-blue-50",
  milestone: "text-amber-500 bg-amber-50",
  system: "text-purple-500 bg-purple-50",
};

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setNotifications(loadNotifications());
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(() => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  }, [notifications]);

  const dismiss = useCallback((id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  }, [notifications]);

  const timeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return "agora";
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-[hsl(var(--dash-surface))] transition-colors"
        aria-label="Notifica\u00e7\u00f5es"
      >
        <Bell size={20} className="text-[hsl(var(--dash-text-secondary))]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border))] rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--dash-border-subtle))]">
              <h3 className="text-sm font-semibold text-[hsl(var(--dash-text))]">Notifica\u00e7\u00f5es</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-[hsl(var(--dash-purple))] hover:underline"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-[hsl(var(--dash-text-muted))]">
                  Nenhuma notifica\u00e7\u00e3o
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = iconMap[n.type];
                  return (
                    <div
                      key={n.id}
                      className={`flex gap-3 px-4 py-3 border-b border-[hsl(var(--dash-border-subtle))] last:border-0 transition-colors ${
                        !n.read ? "bg-[hsl(var(--dash-accent))]" : ""
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorMap[n.type]}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[hsl(var(--dash-text))] truncate">{n.title}</p>
                        <p className="text-[11px] text-[hsl(var(--dash-text-muted))] mt-0.5 line-clamp-2">{n.message}</p>
                        <span className="text-[10px] text-[hsl(var(--dash-text-subtle))] mt-1 block">{timeAgo(n.timestamp)}</span>
                      </div>
                      <button
                        onClick={() => dismiss(n.id)}
                        className="p-1 rounded hover:bg-[hsl(var(--dash-surface-2))] shrink-0 self-start"
                        aria-label="Dispensar notifica\u00e7\u00e3o"
                      >
                        <X size={12} className="text-[hsl(var(--dash-text-muted))]" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
