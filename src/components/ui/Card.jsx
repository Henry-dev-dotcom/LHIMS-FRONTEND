import clsx from 'clsx';

export function Card({ title, subtitle, actions, children, className, compact = false }) {
  return (
    <section className={clsx('clinical-panel rounded-[1.75rem] p-5 shadow-soft', compact && 'p-4', className)}>
      {(title || subtitle || actions) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title && <h2 className="text-lg font-black tracking-tight text-slate-950">{title}</h2>}
            {subtitle && <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
