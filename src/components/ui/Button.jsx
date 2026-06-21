import { forwardRef } from 'react';
import clsx from 'clsx';

const variants = {
  primary: 'bg-gradient-to-r from-clinical-600 to-clinical-500 text-white shadow-lift hover:from-clinical-700 hover:to-clinical-600',
  secondary: 'border border-slate-200/80 bg-white/90 text-slate-700 shadow-sm hover:border-clinical-200 hover:bg-clinical-50 hover:text-clinical-800',
  danger: 'bg-gradient-to-r from-red-600 to-danger text-white shadow-sm hover:from-red-700 hover:to-red-600',
  subtle: 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/90',
  success: 'bg-gradient-to-r from-emerald-600 to-success text-white shadow-sm hover:from-emerald-700 hover:to-emerald-600',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
};

const sizes = {
  sm: 'min-h-10 rounded-xl px-3 py-1.5 text-xs sm:min-h-0',
  md: 'min-h-11 rounded-2xl px-4 py-2 text-sm sm:min-h-0',
  lg: 'min-h-12 rounded-2xl px-5 py-3 text-sm sm:min-h-0'
};

export const Button = forwardRef(function Button({ children, variant = 'primary', size = 'md', className, type = 'button', ...props }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      className={clsx(
        'inline-flex min-w-0 items-center justify-center gap-2 overflow-hidden text-center font-bold leading-5 transition duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-clinical-200 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 [&_svg]:shrink-0',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
