import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell, ChevronDown, Home, LogOut, RotateCcw, Sparkles, UserRound } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { NotificationDrawer } from '../components/ui/NotificationDrawer';
import { PAGE_HEADER_EVENT } from '../components/ui/PageHeader';
import { useAppStore } from '../store/AppStore';
import { PAGE_META } from '../routes/routeRegistry';
import { ROLES } from '../data/roles';

const dashboardMeta = {
  'doctor-dashboard': {
    eyebrow: 'Doctor Portal',
    title: 'Hospital-side doctor workspace',
    description: 'Places patient orders, follows active work, receives released results, and manages result notification preferences.'
  },
  'reception-dashboard': {
    eyebrow: 'Reception Desk',
    title: 'Incoming order and check-in command center',
    description: 'Confirms doctor orders, handles walk-ins, manages patient check-in, and routes work to billing, lab and scan units.'
  },
  'lab-dashboard': {
    eyebrow: 'Laboratory Unit',
    title: 'Lab processing dashboard',
    description: 'Tracks routed lab orders, sample collection, structured result entry, abnormal flags and review handoff.'
  },
  'scan-dashboard': {
    eyebrow: 'Scan / Imaging Unit',
    title: 'Imaging processing dashboard',
    description: 'Manages scan queues, room/equipment booking, uploads, reports and radiologist sign-off.'
  },
  'billing-dashboard': {
    eyebrow: 'Billing / Finance',
    title: 'Finance control dashboard',
    description: 'Generates invoices, tracks payment status, follows outstanding balances and prepares financial reports.'
  },
  'admin-dashboard': {
    eyebrow: 'Administration',
    title: 'System oversight dashboard',
    description: 'Manages users, hospitals, catalog configuration, department settings, audit logs and system reports.'
  }
};

function fallbackPageHeader(pageId, role) {
  const roleInfo = ROLES.find((item) => item.id === role);
  const meta = dashboardMeta[pageId] || PAGE_META[pageId];
  return {
    eyebrow: meta?.section || meta?.eyebrow || roleInfo?.label || 'Workspace',
    title: meta?.title || roleInfo?.label || 'Diagnosis Center',
    description: meta?.description || '',
    actions: null
  };
}

export function Header() {
  const { state, dispatch } = useAppStore();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [pageHeader, setPageHeader] = useState(() => fallbackPageHeader(state.currentPage, state.auth?.role));
  const notificationTriggerRef = useRef(null);
  const userMenuRef = useRef(null);
  const userDropdownRef = useRef(null);
  const [userMenuPosition, setUserMenuPosition] = useState({ top: 0, right: 24 });
  const role = state.auth?.role;
  const roleInfo = ROLES.find((item) => item.id === role);

  useEffect(() => {
    setPageHeader(fallbackPageHeader(state.currentPage, role));
  }, [state.currentPage, role]);

  useEffect(() => {
    if (!userMenuOpen) return undefined;
    const handlePointerDown = (event) => {
      if (userMenuRef.current?.contains(event.target) || userDropdownRef.current?.contains(event.target)) return;
      setUserMenuOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [userMenuOpen]);

  useEffect(() => {
    if (!userMenuOpen) return undefined;

    const syncUserMenuPosition = () => {
      const triggerRect = userMenuRef.current?.getBoundingClientRect();
      if (!triggerRect) return;
      const viewportPadding = 16;
      setUserMenuPosition({
        top: Math.min(triggerRect.bottom + 8, window.innerHeight - viewportPadding),
        right: Math.max(viewportPadding, window.innerWidth - triggerRect.right)
      });
    };

    syncUserMenuPosition();
    window.addEventListener('resize', syncUserMenuPosition);
    window.addEventListener('scroll', syncUserMenuPosition, true);
    return () => {
      window.removeEventListener('resize', syncUserMenuPosition);
      window.removeEventListener('scroll', syncUserMenuPosition, true);
    };
  }, [userMenuOpen]);

  useEffect(() => {
    const handlePageHeader = (event) => {
      setPageHeader((current) => ({
        ...current,
        ...(event.detail || {})
      }));
    };
    window.addEventListener(PAGE_HEADER_EVENT, handlePageHeader);
    return () => window.removeEventListener(PAGE_HEADER_EVENT, handlePageHeader);
  }, []);

  const roleNotifications = useMemo(() => {
    return (state.data.notifications || []).filter((item) => {
      const audience = item.audience || item.role || item.channel;
      return !audience || audience === role || audience === 'all' || ['Email', 'SMS', 'In-Platform'].includes(audience);
    });
  }, [state.data.notifications, role]);
  const unread = roleNotifications.filter((item) => !item.read && item.status !== 'Delivered').length;

  return (
    <header className="relative z-[90] border-b border-white/60 bg-slate-50/80 px-3 py-2 shadow-sm backdrop-blur-2xl sm:px-5 lg:px-8 print:hidden">
      <div className="ml-14 max-w-full overflow-visible lg:ml-0">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-2xl focus:bg-clinical-700 focus:px-4 focus:py-2 focus:text-sm focus:font-black focus:text-white">Skip to content</a>
        <div className="relative flex min-h-[4.6rem] max-w-full items-center justify-between gap-3 overflow-visible rounded-[1.35rem] border border-white/85 bg-white/94 px-4 py-2.5 shadow-card backdrop-blur-xl sm:px-5 lg:px-6">
          <div className="min-w-0 flex-1 pr-2">
            {pageHeader?.eyebrow && (
              <p className="inline-flex items-center gap-1.5 rounded-full border border-clinical-100 bg-clinical-50/80 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-clinical-800 shadow-sm">
                <Sparkles className="h-3 w-3" /> {pageHeader.eyebrow}
              </p>
            )}
            <div className="mt-1.5 flex min-w-0 flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <h1 className="truncate text-xl font-black tracking-tight text-slate-950 sm:text-2xl lg:text-[1.65rem]">{pageHeader?.title || 'Diagnosis Center'}</h1>
                {pageHeader?.description && <p className="mt-0.5 line-clamp-1 max-w-5xl text-xs leading-5 text-slate-600 sm:text-sm">{pageHeader.description}</p>}
              </div>
              {pageHeader?.actions && <div className="flex shrink-0 flex-wrap gap-2">{pageHeader.actions}</div>}
            </div>
          </div>
          <div className="relative z-[95] flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div ref={notificationTriggerRef} className="relative">
              <button
                className="relative grid h-9 w-9 place-items-center rounded-2xl border border-slate-200/80 bg-white/90 text-slate-600 shadow-sm transition hover:border-clinical-200 hover:bg-clinical-50 hover:text-clinical-700 sm:h-10 sm:w-10"
                title="Role notifications"
                onClick={() => setNotificationsOpen((value) => !value)}
              >
                <Bell className="h-4 w-4" />
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
            <div ref={userMenuRef} className="relative">
              <button
                className="flex h-10 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/95 px-2.5 text-slate-700 shadow-sm transition hover:border-clinical-200 hover:bg-clinical-50 hover:text-clinical-800 sm:h-11 sm:px-3"
                title="User menu"
                aria-label="Open user menu"
                aria-expanded={userMenuOpen}
                onClick={() => setUserMenuOpen((value) => !value)}
              >
                <span className="grid h-7 w-7 place-items-center rounded-xl bg-clinical-600 text-xs font-black text-white shadow-sm">{(state.auth?.userName || roleInfo?.label || 'U').charAt(0)}</span>
                <span className="hidden min-w-0 text-left lg:block">
                  <span className="block max-w-[8rem] truncate text-xs font-black text-slate-900">{state.auth?.userName || 'User'}</span>
                  <span className="block max-w-[8rem] truncate text-[10px] font-bold capitalize text-slate-500">{roleInfo?.demoUsername || role || 'workspace'}</span>
                </span>
                <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
              </button>
              {userMenuOpen && typeof document !== 'undefined' && createPortal(
                <div
                  ref={userDropdownRef}
                  className="fixed z-[130] w-72 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-lift ring-1 ring-slate-950/5"
                  style={{ top: `${userMenuPosition.top}px`, right: `${userMenuPosition.right}px` }}
                  role="menu"
                  aria-label="User session menu"
                >
                  <div className="border-b border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-clinical-600 to-emerald-500 text-lg font-black text-white shadow-sm">{(state.auth?.userName || roleInfo?.label || 'U').charAt(0)}</div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Signed in as</p>
                        <p className="truncate text-base font-black text-slate-950">{state.auth?.userName || 'User'}</p>
                        <p className="text-xs font-semibold capitalize text-slate-500">{roleInfo?.demoUsername || role || 'workspace'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="mb-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2 font-black text-slate-800"><UserRound className="h-3.5 w-3.5" /> {roleInfo?.label || 'Workspace'}</div>
                      <p className="mt-1 leading-5">Use this menu to view your session details or sign out securely.</p>
                    </div>
                    <Button
                      variant="danger"
                      className="w-full"
                      onClick={() => {
                        setUserMenuOpen(false);
                        dispatch({ type: 'LOGOUT' });
                      }}
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </Button>
                  </div>
                </div>,
                document.body
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
