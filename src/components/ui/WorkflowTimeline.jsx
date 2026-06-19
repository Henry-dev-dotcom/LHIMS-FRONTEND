import clsx from 'clsx';
import { CheckCircle2, Circle, Clock3, XCircle } from 'lucide-react';

const ORDER_STEPS = ['Submitted', 'Confirmed', 'In Progress', 'Pending Review', 'Final / Released'];

export function WorkflowTimeline({ status, timeline = [], compact = false }) {
  const cancelled = status === 'Cancelled';
  const currentIndex = cancelled ? -1 : Math.max(0, ORDER_STEPS.indexOf(status));
  const events = timeline || [];

  return (
    <div className={clsx('rounded-[1.4rem] border border-slate-200/80 bg-white/80 p-4 shadow-sm', compact && 'p-3')}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Order workflow</p>
        {cancelled && <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-black text-red-700 ring-1 ring-red-200"><XCircle className="h-3.5 w-3.5" /> Cancelled</span>}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-5">
        {ORDER_STEPS.map((step, index) => {
          const complete = !cancelled && index <= currentIndex;
          const active = !cancelled && index === currentIndex;
          return (
            <div key={step} className="relative flex items-center gap-2 sm:block">
              <div className={clsx('grid h-8 w-8 shrink-0 place-items-center rounded-full ring-1 transition', complete ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-50 text-slate-400 ring-slate-200', active && 'shadow-lift')}>
                {complete ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              </div>
              <p className={clsx('text-xs font-black sm:mt-2', complete ? 'text-slate-900' : 'text-slate-400')}>{step}</p>
              {index < ORDER_STEPS.length - 1 && <div className={clsx('absolute left-8 top-4 hidden h-0.5 w-[calc(100%-1rem)] sm:block', index < currentIndex ? 'bg-emerald-300' : 'bg-slate-200')} />}
            </div>
          );
        })}
      </div>
      {events.length > 0 && (
        <div className="mt-4 rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 font-black text-slate-700"><Clock3 className="h-3.5 w-3.5" /> Last event:</span>{' '}
          {events[events.length - 1]?.status || events[events.length - 1]?.action || 'Updated'} by {events[events.length - 1]?.actor || 'System'}
        </div>
      )}
    </div>
  );
}
