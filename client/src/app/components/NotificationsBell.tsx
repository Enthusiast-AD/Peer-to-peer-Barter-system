import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell,
  Check,
  UserPlus,
  CalendarCheck,
  MessageSquare,
  Clock,
  Star,
  Info,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import api from '../services/api';
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

const PANEL_WIDTH = 360;
const GAP = 8;

export function NotificationsBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; maxHeight: number }>({ top: 0, left: 0, maxHeight: 360 });

  const load = useCallback(async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count')
      ]);
      if (listRes.data.success) setNotifs(listRes.data.data);
      if (countRes.data.success) setUnread(countRes.data.data.count);
    } catch (e) { /* noop */ }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Position the panel so it never overflows the viewport. The bell sits at the
  // bottom of the sidebar, so we open upward when there isn't room below.
  const positionPanel = () => {
    const rect = buttonRef.current!.getBoundingClientRect();

    let left = rect.right + GAP;
    if (left + PANEL_WIDTH > window.innerWidth - GAP) left = rect.left - PANEL_WIDTH - GAP;
    left = Math.max(GAP, Math.min(left, window.innerWidth - PANEL_WIDTH - GAP));

    const spaceBelow = window.innerHeight - rect.bottom - GAP;
    const spaceAbove = rect.top - GAP;
    const minH = 200;
    let top: number;
    let maxHeight: number;

    if (spaceBelow >= minH) {
      top = rect.bottom + GAP;
      maxHeight = spaceBelow - GAP;
    } else {
      maxHeight = Math.max(minH, spaceAbove - GAP);
      top = rect.top - GAP - maxHeight;
      if (top < GAP) {
        top = GAP;
        maxHeight = spaceAbove - GAP;
      }
    }

    setPos({ top, left, maxHeight: Math.max(160, maxHeight) });
  };

  const toggle = () => {
    if (!open) positionPanel();
    setOpen(!open);
  };

  const openNotification = async (n: Notification) => {
    api.put(`/notifications/${n.id}/read`).catch(() => {});
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const markAll = async () => {
    await api.put('/notifications/read-all').catch(() => {});
    setUnread(0);
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const fallbackIcon = TYPE_ICONS.system;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggle}
        className="relative p-2 rounded-md hover:bg-sidebar-accent/60 transition-colors text-sidebar-foreground"
        title="Notifications"
      >
        <Bell className="w-[18px] h-[18px]" strokeWidth={1.8} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.14, ease: [0.32, 0.72, 0, 1] }}
            className="fixed z-[100] bg-popover border border-border rounded-xl shadow-2xl overflow-hidden"
            style={{
              top: pos.top,
              left: pos.left,
              width: Math.min(PANEL_WIDTH, window.innerWidth - GAP * 2),
              maxHeight: pos.maxHeight,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Notifications</span>
                {unread > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold">
                    {unread}
                  </span>
                )}
              </div>
              {unread > 0 && (
                <button
                  onClick={markAll}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="overflow-y-auto" style={{ maxHeight: pos.maxHeight - 56 }}>
              {notifs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-10 h-10 mx-auto rounded-full bg-muted flex items-center justify-center mb-3">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">No notifications yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Updates about your sessions will show up here.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/70">
                  {notifs.map((n) => {
                    const meta = TYPE_ICONS[n.type] || fallbackIcon;
                    const Icon = meta.icon;
                    return (
                      <button
                        key={n.id}
                        onClick={() => openNotification(n)}
                        className={`w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors flex items-start gap-3 ${
                          n.read ? '' : 'bg-accent/[0.04]'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.className}`}>
                          <Icon className="w-4 h-4" strokeWidth={2} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-[13px] leading-snug ${n.read ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                            {n.title}
                          </p>
                          {n.body && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{n.body}</p>
                          )}
                          <p className="text-[11px] text-muted-foreground/70 mt-1">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
