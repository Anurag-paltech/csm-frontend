const tones = {
  neutral: 'border border-line bg-surface-2 text-ink-3',
  navy: 'bg-navy-soft text-navy',
  blue: 'bg-light-blue-soft text-blue',
  green: 'bg-green-soft text-green',
  red: 'bg-red-soft text-red',
};

/** Small pill label. Matches the mockup `.badge`. */
export function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.25 whitespace-nowrap rounded-full px-2.5 py-1 font-display text-[11px] font-bold ${
        tones[tone] ?? tones.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
}
