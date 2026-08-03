import { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Check,
  UserPlus,
  CalendarCheck,
  MessageSquare,
  Clock,
  Star,
  Info,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import api from '../../services/api';
import { notifyNotificationsChanged } from '../../services/notificationsEvents';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, { icon: any; className: string }> = {
  session_request: { icon: UserPlus, className: 'bg-accent/10 text-accent' },
  session_accepted: { icon: CalendarCheck, className: 'bg-emerald-500/10 text-emerald-500' },
  message: { icon: MessageSquare, className: 'bg-sky-500/10 text-sky-500' },
  proposal: { icon: Clock, className: 'bg-amber-500/10 text-amber-500' },
  review: { icon: Star, className: 'bg-amber-500/10 text-amber-500' },
  system: { icon: Info, className: 'bg-muted text-muted-foreground' },
};

const fallback = TYPE_ICONS.system;

export default function Inbox() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count')
      ]);
      if (listRes.data.success) setNotifs(listRes.data.data);
      if (countRes.data.success) setUnread(countRes.data.data.count);
    } catch (e) { /* noop */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNotification = async (n: Notification) => {
    api.put(`/notifications/${n.id}/read`).catch(() => {});
    setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    setUnread((u) => Math.max(0, u - 1));
    notifyNotificationsChanged();
    if (n.link) navigate(n.link);
  };

  const markAll = async () => {
    await api.put('/notifications/read-all').catch(() => {});
    setUnread(0);
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    notifyNotificationsChanged();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-3">
            Inbox
            {unread > 0 && (
              <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                {unread}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-[15px]">Updates about your sessions, messages, and reviews.</p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAll}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Check className="w-4 h-4" /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        </div>
      ) : notifs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-2xl"
        >
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-[15px]">You're all caught up</h3>
          <p className="text-muted-foreground text-sm mt-1">New updates about your sessions will show up here.</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border overflow-hidden bg-card"
        >
          <div className="divide-y divide-border/70">
            {notifs.map((n) => {
              const meta = TYPE_ICONS[n.type] || fallback;
              const Icon = meta.icon;
              return (
                <button
                  key={n.id}
                  onClick={() => openNotification(n)}
                  className={`w-full text-left px-4 sm:px-6 py-4 hover:bg-muted/40 transition-colors flex items-start gap-4 group ${
                    n.read ? '' : 'bg-accent/[0.04]'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${meta.className}`}>
                    <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className={`text-sm leading-snug ${n.read ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                        {n.title}
                      </p>
                      <span className="text-[11px] text-muted-foreground/70 whitespace-nowrap shrink-0 pt-0.5">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {n.body && (
                      <p className="text-[13px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{n.body}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0 mt-2" />
                  {!n.read && <span className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
