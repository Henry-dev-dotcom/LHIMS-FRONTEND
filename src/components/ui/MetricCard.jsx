import clsx from 'clsx';

export function MetricCard({ label, value, icon: Icon, tone = 'blue', helper, compact = true }) {
  const tones = {
    blue: 'bg-clinical-50 text-clinical-700 ring-clinical-100',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    yellow: 'bg-amber-50 text-amber-700 ring-amber-100',
    red: 'bg-red-50 text-red-700 ring-red-100',
    purple: 'bg-purple-50 text-purple-700 ring-purple-100'
  };
  const bars = {
    blue: 'from-clinical-500 to-clinical-300',
    green: 'from-emerald-500 to-emerald-300',
    yellow: 'from-amber-500 to-amber-300',
    red: 'from-red-500 to-red-300',
    purple: 'from-purple-500 to-purple-300'
  };
  return (
    <div className={clsx(
      'group relative min-h-[5.25rem] overflow-hidden border border-white/70 bg-card-sheen shadow-soft backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:shadow-panel sm:min-h-[4.5rem]',
      compact ? 'rounded-[1.15rem] p-3 sm:rounded-2xl sm:p-2.5' : 'rounded-[1.2rem] p-3.5 sm:p-3'
    )}>
      <div className={clsx('absolute top-0 h-0.5 rounded-b-full bg-gradient-to-r', compact ? 'inset-x-3' : 'inset-x-3.5', bars[tone] || bars.blue)} />
      <div className={clsx('flex items-start justify-between', compact ? 'gap-2.5 sm:gap-2' : 'gap-2.5')}>
        <div className="min-w-0">
          <p className={clsx('font-black uppercase text-slate-400', compact ? 'text-[9px] tracking-[0.15em] sm:text-[8.5px] sm:tracking-[0.14em]' : 'text-[9px] tracking-[0.15em]')}>{label}</p>
          <p className={clsx('mt-1 truncate font-black tracking-tight text-slate-950', compact ? 'text-2xl sm:text-xl' : 'text-2xl')}>{value}</p>
          {helper && <p className={clsx('mt-0.5 leading-4 text-slate-500', compact ? 'text-[11px] sm:text-[10px]' : 'text-[11px]')}>{helper}</p>}
        </div>
        {Icon && (
          <div className={clsx('grid shrink-0 place-items-center rounded-xl ring-1 transition group-hover:scale-105', compact ? 'h-9 w-9 sm:h-8 sm:w-8' : 'h-9 w-9', tones[tone] || tones.blue)}>
            <Icon className={clsx(compact ? 'h-[1.125rem] w-[1.125rem] sm:h-4 sm:w-4' : 'h-5 w-5')} />
          </div>
        )}
      </div>
    </div>
  );
}
