import { forwardRef } from "react";

/** Multi-line text input. Matches the mockup `.field textarea`. `forwardRef` for RHF. */
export const Textarea = forwardRef(function Textarea(
  { className = "", invalid = false, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={`block min-h-50 w-full resize-y rounded-sm border bg-surface px-2.75 py-2.25 text-[13.5px] leading-[1.6] text-ink placeholder-ink-3 focus:outline-none focus:ring-[3px] focus:ring-light-blue-soft ${
        invalid
          ? "border-red bg-red-soft focus:border-red"
          : "border-line-2 focus:border-light-blue"
      } ${className}`}
      {...props}
    />
  );
});
