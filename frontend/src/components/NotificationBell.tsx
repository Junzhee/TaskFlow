import { Bell, CheckCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead
} from "../api/endpoints";
import type { Notification } from "../api/types";
import { useCurrentUser } from "../contexts/CurrentUser";
import { relativeTimestamp } from "../utils";

export function NotificationBell() {
  const { currentUser } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const refreshCount = useCallback(async () => {
    if (!currentUser) {
      return;
    }
    setCount(await fetchUnreadCount());
  }, [currentUser]);

  const refreshItems = useCallback(async () => {
    if (!currentUser) {
      return;
    }
    setLoading(true);
    try {
      const notifications = await fetchNotifications();
      setItems(notifications);
      setCount(notifications.filter((item) => !item.is_read).length);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    void refreshCount();
    const timer = window.setInterval(() => {
      void refreshCount();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [refreshCount]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  async function openPanel() {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) {
      await refreshItems();
    }
  }

  async function markRead(notification: Notification) {
    if (notification.is_read) {
      return;
    }
    setItems((current) => current.map((item) => (item.id === notification.id ? { ...item, is_read: true } : item)));
    setCount((current) => Math.max(0, current - 1));
    await markNotificationRead(notification.id).catch(() => {
      void refreshItems();
    });
  }

  async function markAllRead() {
    setItems((current) => current.map((item) => ({ ...item, is_read: true })));
    setCount(0);
    await markAllNotificationsRead().catch(() => {
      void refreshItems();
    });
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => void openPanel()}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-stone-200 bg-white text-graphite shadow-sm transition hover:border-moss hover:text-moss"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {count > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-clay px-1.5 py-0.5 text-center text-[11px] font-bold leading-none text-white">
            {count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-3 w-[360px] max-w-[calc(100vw-32px)] rounded-lg border border-stone-200 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Notifications</p>
              <p className="text-xs text-stone-500">{count} unread</p>
            </div>
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-moss transition hover:bg-moss/10"
            >
              <CheckCheck className="h-4 w-4" />
              Read all
            </button>
          </div>
          <div className="max-h-[420px] overflow-y-auto p-2 taskflow-scrollbar">
            {loading ? (
              <div className="space-y-2 p-2">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-16 animate-pulse rounded-md bg-stone-100" />
                ))}
              </div>
            ) : items.length ? (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void markRead(item)}
                  className={`mb-1 w-full rounded-md px-3 py-3 text-left transition ${
                    item.is_read ? "bg-stone-50 text-stone-500" : "bg-amber/10 text-ink hover:bg-amber/15"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.is_read ? "bg-stone-300" : "bg-clay"}`} />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium leading-snug">{item.message}</span>
                      <span className="mt-1 block text-xs text-stone-500">{relativeTimestamp(item.created_at)}</span>
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-stone-500">No notifications yet.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
