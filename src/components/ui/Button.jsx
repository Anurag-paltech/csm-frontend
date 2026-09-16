const base =
  'inline-flex items-center justify-center gap-1.75 rounded-sm border border-transparent font-display font-bold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-[0.42] disabled:shadow-none';

const sizes = {
  md: 'px-4 py-2.25 text-[13.5px]',
  sm: 'px-3 py-1.75 text-[12.5px]',
};

const variants = {
  primary: 'bg-blue text-white shadow-card hover:bg-navy',
  secondary:
    'border-blue-border bg-surface text-blue hover:border-blue hover:bg-blue-soft',
  ghost: 'bg-transparent text-ink-2 hover:bg-surface-2 hover:text-navy',
  outline:
    'border-line-2 bg-surface text-ink-2 hover:border-ink-3 hover:bg-surface-2',
  danger:
    'border-red-border bg-surface text-red hover:border-red hover:bg-red-soft',
};

export function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      className={`${base} ${sizes[size] ?? sizes.md} ${
        variants[variant] ?? variants.primary
      } ${className}`}
      {...props}
    />
  );
}
