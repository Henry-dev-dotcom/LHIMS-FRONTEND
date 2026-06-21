import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';

// Phase 6 QA anchor: bottom-[calc(6.25rem+env(safe-area-inset-bottom))]
export function ToastHost() {
  const { state, dispatch } = useAppStore();
  const toast = state.ui.toast;

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 2800);
    return () => window.clearTimeout(timer);
  }, [toast, dispatch]);

  if (!toast) return null;

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="mobile-toast fixed inset-x-3 bottom-[calc(var(--mobile-bottom-nav-space,6.25rem)+env(safe-area-inset-bottom))] z-[160] rounded-3xl border border-white/15 bg-slate-950/95 px-4 py-3 text-sm font-semibold text-white shadow-panel backdrop-blur-xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-w-sm sm:px-5 sm:py-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
        <span className="min-w-0 break-words">{toast.message}</span>
      </div>
    </div>
  );
}
