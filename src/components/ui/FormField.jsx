import clsx from 'clsx';

export function FormField({ label, help, children, className }) {
  return (
    <label className={clsx('block min-w-0', className)}>
      <span className="block min-w-0 break-words text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <div className="mt-2 min-w-0 [&>*]:min-w-0">{children}</div>
      {help && <span className="mt-1.5 block break-words text-xs leading-5 text-slate-400">{help}</span>}
    </label>
  );
}

export const inputClass = 'clinical-input min-w-0';
