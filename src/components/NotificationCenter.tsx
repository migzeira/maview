import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, X, Check, ShoppingBag, Users, TrendingUp, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  type: "sale" | "lead" | "milestone" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const LS_KEY = "maview_notifications";
const LS_SEEN_KEY = "maview_notif_seen";

function loadNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return getDefaultNotifications();
    return JSON.parse(raw).map((n: Notification) => ({ ...n, timestamp: new Date(n.timestamp) }));
  } catch {
    return getDefaultNotifications();
  }
}

function saveNotifications(notifs: Notification[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(notifs));
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
      message: "Vitrines com produtos vendem até 3x mais.",
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
  const vitrineIdRef = useRef<string | null>(null);

  useEffect(() => {
    setNotifications(loadNotifications());

    // Get vitrine_id for realtime subscriptions
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data } = await supabase
          .from("vitrines")
          .select("id")
          .eq("user_id", session.user.id)
          .single();

        if (data?.id) {
          vitrineIdRef.current = data.id;
          setupRealtimeSubscriptions(data.id);
        }
      } catch {}
    })();

    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  const addNotification = useCallback((notif: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotif: Notification = {
      ...notif,
      id: `rt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev].slice(0, 50); // Keep max 50
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const setupRealtimeSubscriptions = useCallback((vitrineId: string) => {
    // Listen for new orders
    supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `vitrine_id=eq.${vitrineId}`,
        },
        (payload) => {
          const record = payload.new as Record<string, any>;
          if (record.payment_status === "approved") {
            const amount = record.amount
              ? (record.amount / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
              : "";
            addNotification({
              type: "sale",
              title: "Nova venda!",
              message: `${record.product_title || "Produto"}${amount ? ` — ${amount}` : ""}`,
            });
          }
        }
      )
      .subscribe();

    // Listen for new leads
    supabase
      .channel("leads-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "leads",
          filter: `vitrine_id=eq.${vitrineId}`,
        },
        (payload) => {
          const record = payload.new as Record<string, any>;
          addNotification({
            type: "lead",
            title: "Novo lead!",
            message: `${record.email || "Alguém"} se cadastrou na sua vitrine.`,
          });
        }
      )
      .subscribe();
  }, [addNotification]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(() => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  }, [notifications]);

  const dismiss = useCallback((id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    saveNotifications(updated);
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
        aria-label="Notificações"
      >
        <Bell size={20} className="text-[hsl(var(--dash-text-secondary))]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border))] rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--dash-border-subtle))]">
              <h3 className="text-sm font-semibold text-[hsl(var(--dash-text))]">Notificações</h3>
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
                  Nenhuma notificação
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
                        aria-label="Dispensar notificação"
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
