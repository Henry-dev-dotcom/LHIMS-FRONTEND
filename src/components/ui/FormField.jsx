export function FormField({ label, help, children }) {
  return (
    <label className="block">
      <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <div className="mt-2">{children}</div>
      {help && <span className="mt-1.5 block text-xs leading-5 text-slate-400">{help}</span>}
    </label>
  );
}

export const inputClass = 'clinical-input';
