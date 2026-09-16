/**
 * Label + control + error/hint wrapper. Matches the mockup `.field`.
 *
 *   <FormField label="VIN" htmlFor="vin" required error={errors.vin?.message}>
 *     <Input id="vin" {...register('vin')} />
 *   </FormField>
 */
export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  className = '',
  children,
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className="font-display text-[12px] font-bold tracking-[0.02em] text-ink-2"
        >
          {label}
          {required ? <span className="ml-0.5 text-red">*</span> : null}
        </label>
      ) : null}
      {children}
      {hint && !error ? (
        <p className="text-[11px] text-ink-3">{hint}</p>
      ) : null}
      {error ? (
        <p className="text-[11px] font-bold text-red">{error}</p>
      ) : null}
    </div>
  );
}
