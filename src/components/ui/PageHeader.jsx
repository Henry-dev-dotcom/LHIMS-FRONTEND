import { Sparkles } from 'lucide-react';

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-white via-clinical-25 to-emerald-25 p-4 shadow-soft backdrop-blur-xl sm:p-6 lg:p-7">
      <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-clinical-300/20 blur-3xl" />
      <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <p className="inline-flex items-center gap-2 rounded-full border border-clinical-100 bg-white/80 px-2.5 py-1 text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] text-clinical-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> {eyebrow}
            </p>
          )}
          <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl md:text-4xl">{title}</h1>
          {description && <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
