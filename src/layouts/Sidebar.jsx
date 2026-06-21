import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Activity, ChevronRight, X } from 'lucide-react';
import { useAppStore } from '../store/AppStore';
import { getNavForRole, groupNavItems } from '../utils/permissions';
import { ROLES } from '../data/roles';

export function Sidebar() {
  const { state, dispatch } = useAppStore();
  const role = state.auth?.role || 'admin';
  const roleInfo = ROLES.find((item) => item.id === role);
  const closeButtonRef = useRef(null);
  const allItems = getNavForRole(role);
  const groups = groupNavItems(allItems);

  useEffect(() => {
    if (!state.ui.sidebarOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') dispatch({ type: 'CLOSE_SIDEBAR' });
    };
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleViewportChange = (event) => {
      if (event.matches) dispatch({ type: 'CLOSE_SIDEBAR' });
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    window.setTimeout(() => closeButtonRef.current?.focus({ preventScroll: true }), 0);
    mediaQuery.addEventListener?.('change', handleViewportChange);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      mediaQuery.removeEventListener?.('change', handleViewportChange);
    };
  }, [dispatch, state.ui.sidebarOpen]);

  const content = (
    <>
      <div className="relative overflow-hidden border-b border-white/10 p-5 pr-14">
        <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-clinical-500/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-clinical-400 to-emerald-400 text-white shadow-lift ring-1 ring-white/15">
            <Activity className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-lg font-black tracking-tight text-white">Diagnosis Center</div>
            <div className="truncate text-xs font-semibold text-slate-200">Orders · Billing · Results</div>
          </div>
        </div>
      </div>

      <div className="border-b border-white/10 px-5 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300">Active workspace</p>
        <p className="mt-1 truncate font-black text-white">{roleInfo?.label}</p>
      </div>

      <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        {Object.entries(groups).length === 0 && <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200">No matching menu items.</div>}
        {Object.entries(groups).map(([section, items]) => (
          <div key={section} className="mb-5">
            <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-300">{section}</p>
            <div className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                const active = state.currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => {
                      dispatch({ type: 'NAVIGATE', pageId: item.id });
                      dispatch({ type: 'CLOSE_SIDEBAR' });
                    }}
                    className={clsx(
                      'group flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-bold transition duration-200',
                      active ? 'bg-white text-clinical-800 shadow-lift' : 'text-slate-100 hover:bg-white/15 hover:text-white'
                    )}
                  >
                    <span className={clsx('grid h-8 w-8 shrink-0 place-items-center rounded-xl transition', active ? 'bg-clinical-50 text-clinical-700' : 'bg-white/10 text-slate-100 group-hover:bg-white/20 group-hover:text-white')}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    <ChevronRight className={clsx('h-4 w-4 shrink-0 transition', active ? 'text-clinical-500' : 'text-slate-300 group-hover:text-white')} />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-[19rem] flex-col bg-slate-950 print:hidden lg:flex">{content}</aside>
      <div
        className={clsx('fixed inset-0 z-[120] bg-slate-950/55 backdrop-blur-sm transition-opacity print:hidden lg:hidden', state.ui.sidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0')}
        role="presentation"
        aria-hidden={!state.ui.sidebarOpen}
        onClick={() => dispatch({ type: 'CLOSE_SIDEBAR' })}
      >
        <aside
          className={clsx(
            'flex h-full w-[19rem] max-w-[88vw] transform flex-col bg-slate-950 shadow-2xl transition-transform duration-200 ease-out',
            state.ui.sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <button
            ref={closeButtonRef}
            className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-white transition hover:bg-white/15 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/25"
            type="button"
            onClick={() => dispatch({ type: 'CLOSE_SIDEBAR' })}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
          {content}
        </aside>
      </div>
    </>
  );
}
