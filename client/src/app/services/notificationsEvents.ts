// Lightweight event bus so the sidebar badge refreshes the instant a
// notification is read anywhere (Inbox, notification click, etc.) without
// waiting for the polling interval.

type Listener = () => void;

const listeners = new Set<Listener>();

export const subscribeNotifications = (fn: Listener) => {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
};

export const notifyNotificationsChanged = () => {
  listeners.forEach((fn) => fn());
};
