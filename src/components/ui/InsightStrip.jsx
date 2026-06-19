import clsx from 'clsx';

export function InsightStrip({ items = [], className }) {
  if (!items.length) return null;
  return (
    <div className={clsx('grid gap-3 rounded-[1.75rem] border border-white/70 bg-white/80 p-3 shadow-soft backdrop-blur-xl sm:grid-cols-2 xl:grid-cols-4', className)}>
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl bg-slate-50/90 px-4 py-3 ring-1 ring-slate-100">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
          <p className="mt-1 text-sm font-black text-slate-900">{item.value}</p>
          {item.helper && <p className="mt-1 text-xs leading-5 text-slate-500">{item.helper}</p>}
        </div>
      ))}
    </div>
  );
}
