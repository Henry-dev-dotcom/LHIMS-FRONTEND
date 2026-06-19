import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';

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
    <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-3xl border border-white/15 bg-slate-950/95 px-5 py-4 text-sm font-semibold text-white shadow-panel backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
