import clsx from 'clsx';

export function MobileStickyActions({ children, className, label = 'Actions' }) {
  if (!children) return null;

  return (
    <div
      className={clsx(
        'mobile-sticky-actions lg:hidden',
        className
      )}
      aria-label={label}
    >
      <div className="grid gap-2 [&_button]:w-full [&_button]:justify-center">
        {children}
      </div>
    </div>
  );
}
