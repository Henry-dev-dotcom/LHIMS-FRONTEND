import { useMemo, useRef, useState } from 'react';
import { Bell, Home, RotateCcw, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { NotificationDrawer } from '../components/ui/NotificationDrawer';
import { useAppStore } from '../store/AppStore';
import { getRoleLabel } from '../utils/permissions';
import { NAV_ITEMS } from '../data/roles';

export function Header() {
  const { state, dispatch } = useAppStore();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationTriggerRef = useRef(null);
  const role = state.auth?.role;
  const currentPageLabel = NAV_ITEMS.find((item) => item.id === state.currentPage)?.label || getRoleLabel(role);
  const roleNotifications = useMemo(() => {
    return (state.data.notifications || []).filter((item) => {
      const audience = item.audience || item.role || item.channel;
      return !audience || audience === role || audience === 'all' || ['Email', 'SMS', 'In-Platform'].includes(audience);
    });
  }, [state.data.notifications, role]);
  const unread = roleNotifications.filter((item) => !item.read && item.status !== 'Delivered').length;

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-2xl sm:px-5 sm:py-3 lg:px-8 print:hidden">
      <div className="ml-14 flex min-h-[3rem] items-center justify-between gap-2 sm:gap-4 lg:ml-0">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-2xl focus:bg-clinical-700 focus:px-4 focus:py-2 focus:text-sm focus:font-black focus:text-white">Skip to content</a>
        <div className="min-w-0">
          <p className="hidden items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-clinical-700 sm:flex">
            <ShieldCheck className="h-3.5 w-3.5" /> Frontend stabilized · Pre-backend QA
          </p>
          <p className="truncate text-base font-black tracking-tight text-slate-950 sm:hidden">{currentPageLabel}</p>
          <p className="truncate text-[11px] font-semibold text-slate-600 sm:mt-1 sm:text-sm">
            <span className="hidden sm:inline">{state.auth?.userName} · {getRoleLabel(role)} · Clinical operations workspace</span>
            <span className="sm:hidden">{getRoleLabel(role)} · {state.auth?.userName}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div ref={notificationTriggerRef} className="relative">
            <button
              className="relative grid h-11 w-11 place-items-center rounded-2xl border border-slate-200/80 bg-white/90 text-slate-600 shadow-sm transition hover:border-clinical-200 hover:bg-clinical-50 hover:text-clinical-700"
              title="Role notifications"
              onClick={() => setNotificationsOpen((value) => !value)}
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[10px] font-black text-white ring-2 ring-white">{unread}</span>}
            </button>
            <NotificationDrawer
              open={notificationsOpen}
              notifications={roleNotifications}
              onClose={() => setNotificationsOpen(false)}
              onMarkDelivered={(notificationId) => dispatch({ type: 'MARK_NOTIFICATION_DELIVERED', notificationId })}
              ignoreRef={notificationTriggerRef}
            />
          </div>
          <Button variant="secondary" onClick={() => dispatch({ type: 'GO_HOME' })}>
            <Home className="h-4 w-4" /> <span className="hidden sm:inline">Home</span>
          </Button>
          <Button variant="secondary" onClick={() => dispatch({ type: 'RESET_DEMO_DATA' })}>
            <RotateCcw className="h-4 w-4" /> <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
