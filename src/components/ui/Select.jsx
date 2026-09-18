import { forwardRef } from 'react';

/**
 * Native select styled to match the mockup `.select-control`. Pass `invalid`
 * for the error state.
 */
export const Select = forwardRef(function Select(
  { className = '', invalid = false, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={`rounded-sm border bg-surface px-2.75 py-2.25 text-[13.5px] text-ink focus:outline-none focus:ring-[3px] focus:ring-light-blue-soft disabled:bg-surface-2 ${
        invalid
          ? 'border-red bg-red-soft focus:border-red'
          : 'border-line-2 focus:border-light-blue'
      } ${className}`}
      {...props}
    />
  );
});
