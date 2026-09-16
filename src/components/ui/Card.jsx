/**
 * Bordered surface panel. Matches the mockup `.card` chrome only — layout
 * (flex, padding, overflow) is entirely up to the caller via `className`.
 * Pass `as` to render a different element (e.g. `"form"`) while keeping the
 * same chrome.
 */
export function Card({ as: As = 'div', className = '', ...props }) {
  return (
    <As
      className={`rounded-lg border border-line bg-surface shadow-card ${className}`}
      {...props}
    />
  );
}
