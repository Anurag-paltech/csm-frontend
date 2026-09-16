import { forwardRef } from 'react';

/**
 * Uncontrolled text input. `forwardRef` so it works directly with
 * React Hook Form's `register()`. Styled to match the mockup `.field input`.
 * Pass `invalid` for the error state.
 */
export const Input = forwardRef(function Input(
  { className = '', invalid = false, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={`block w-full rounded-sm border bg-surface px-2.75 py-2.25 text-[13.5px] text-ink placeholder-ink-3 focus:outline-none focus:ring-[3px] focus:ring-light-blue-soft disabled:bg-surface-2 ${
        invalid
          ? 'border-red bg-red-soft focus:border-red'
          : 'border-line-2 focus:border-light-blue'
      } ${className}`}
      {...props}
    />
  );
});
