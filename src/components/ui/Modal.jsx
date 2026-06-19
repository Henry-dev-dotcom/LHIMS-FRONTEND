import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export function Modal({ open, title, description, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/60 px-2 py-0 backdrop-blur-md sm:items-start sm:px-4 sm:py-8"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }}
      role="presentation"
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-t-[1.6rem] border border-white/70 bg-white/95 shadow-panel sm:max-h-[calc(100vh-2rem)] sm:rounded-[2rem]"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-white to-clinical-50/95 px-4 py-4 backdrop-blur sm:px-6 sm:py-5">
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-950 sm:text-xl">{title}</h2>
            {description && <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}
          </div>
          <Button variant="subtle" className="h-10 w-10 shrink-0 p-0" onClick={onClose} aria-label="Close modal">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="px-4 py-4 sm:px-6 sm:py-5">{children}</div>
        {footer && <div className="sticky bottom-0 z-10 flex flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50/95 px-4 py-4 backdrop-blur sm:px-6">{footer}</div>}
      </div>
    </div>
  );
}
