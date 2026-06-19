import { useEffect, useRef } from 'react';
import { BellRing, CheckCheck, Mail, MessageSquareText } from 'lucide-react';
import { Button } from './Button';
import { StatusBadge } from './StatusBadge';
import { formatDateTime } from '../../utils/formatters';

export function NotificationDrawer({ open, notifications = [], onClose, onMarkDelivered, ignoreRef }) {
  const drawerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handlePointerDown = (event) => {
      const target = event.target;
      const clickedDrawer = drawerRef.current && drawerRef.current.contains(target);
      const clickedIgnoredElement = ignoreRef?.current && ignoreRef.current.contains(target);
      if (!clickedDrawer && !clickedIgnoredElement) {
        onClose?.();
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, ignoreRef]);

  if (!open) return null;
  return (
    <div ref={drawerRef} role="dialog" aria-modal="true" aria-label="Notifications" className="fixed right-3 top-[4.25rem] z-[70] w-[calc(100vw-1.5rem)] max-w-[26rem] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-panel sm:right-5 lg:absolute lg:right-0 lg:top-14 lg:w-[min(92vw,26rem)]">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-br from-white to-clinical-50 px-5 py-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-black text-slate-950"><BellRing className="h-4 w-4 text-clinical-600" /> Delivery & role notifications</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Frontend demo feed for in-platform, email and SMS events.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </div>
      <div className="max-h-[28rem] overflow-y-auto p-3">
        {notifications.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">No notifications for this workspace.</div>
        ) : notifications.slice(0, 12).map((note) => (
          <div key={note.id} className="mb-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-clinical-50 text-clinical-700">
                  {String(note.channel || note.type || '').toLowerCase().includes('sms') ? <MessageSquareText className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                </span>
                <div>
                  <p className="text-sm font-black text-slate-900">{note.title || note.channel || 'Notification'}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{note.message || note.body || note.status || 'No details supplied.'}</p>
                </div>
              </div>
              <StatusBadge status={note.status || (note.read ? 'Delivered' : 'Queued')} />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-slate-400">
              <span>{formatDateTime(note.createdAt || note.timestamp)}</span>
              {onMarkDelivered && note.status !== 'Delivered' && (
                <button onClick={() => onMarkDelivered(note.id)} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-black text-emerald-700 ring-1 ring-emerald-200">
                  <CheckCheck className="h-3.5 w-3.5" /> mark delivered
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
