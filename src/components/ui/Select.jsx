import { forwardRef } from 'react';

function ChevronDown(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/**
 * Native select styled to match the mockup `.select-control`. Pass `invalid`
 * for the error state.
 *
 * `appearance-none` + a custom chevron replace the OS's own select chrome —
 * without it, the browser's native rendering made this a few pixels taller
 * than Input/Textarea despite identical padding.
 *
 * Pass `placeholder` when the currently selected option is a disabled
 * "choose one" placeholder (value `""`) rather than a real value, so it
 * reads in the same gray as an empty Input instead of full-strength ink.
 */
export const Select = forwardRef(function Select(
  { className = '', invalid = false, placeholder = false, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={`block appearance-none rounded-sm border bg-surface px-2.75 py-2.25 pr-8 text-[13.5px] ${
          placeholder ? 'text-ink-3' : 'text-ink'
        } focus:outline-none focus:ring-[3px] focus:ring-light-blue-soft disabled:bg-surface-2 ${
          invalid
            ? 'border-red bg-red-soft focus:border-red'
            : 'border-line-2 focus:border-light-blue'
        } ${className}`}
        {...props}
      />
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" />
    </div>
  );
});
