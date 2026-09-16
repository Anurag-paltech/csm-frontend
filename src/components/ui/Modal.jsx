import { useEffect } from 'react';

/**
 * Centered dialog with a backdrop. Controlled — render it only while `open`
 * is true (or pass `open` and it renders nothing when false). Closes on
 * Escape or a backdrop click; `onClose` decides what that means.
 */
export function Modal({ open, onClose, title, children, className = '' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full max-w-md rounded-lg bg-surface p-5.5 shadow-pop ${className}`}
      >
        {title ? (
          <h2 className="mb-4 font-display text-[15px] font-bold text-navy">
            {title}
          </h2>
        ) : null}
        {children}
      </div>
    </div>
  );
}
