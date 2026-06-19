import clsx from 'clsx';

export function MetricCard({ label, value, icon: Icon, tone = 'blue', helper }) {
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
    <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-card-sheen p-5 shadow-soft backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:shadow-panel">
      <div className={clsx('absolute inset-x-5 top-0 h-1 rounded-b-full bg-gradient-to-r', bars[tone] || bars.blue)} />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <p className="mt-2 truncate text-3xl font-black tracking-tight text-slate-950">{value}</p>
          {helper && <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p>}
        </div>
        {Icon && (
          <div className={clsx('grid h-12 w-12 shrink-0 place-items-center rounded-2xl ring-1 transition group-hover:scale-105', tones[tone] || tones.blue)}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}
