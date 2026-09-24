const DATE_FMT = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const DATE_TIME_FMT = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function toDate(value) {
  if (!value) return null;
  // Backend sends tz-less ISO datetimes that are UTC — pin them so they aren't
  // parsed as local time.
  const s =
    typeof value === 'string' &&
    /^\d{4}-\d\d-\d\dT\d\d:\d\d/.test(value) &&
    !/(Z|[+-]\d\d:?\d\d)$/.test(value)
      ? `${value}Z`
      : value;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "01 Aug 2026", or `fallback` for null/invalid. */
export function formatDate(value, fallback = '—') {
  const d = toDate(value);
  return d ? DATE_FMT.format(d) : fallback;
}

/** "01 Aug 2026, 09:12", or `fallback` for null/invalid. */
export function formatDateTime(value, fallback = '—') {
  const d = toDate(value);
  return d ? DATE_TIME_FMT.format(d) : fallback;
}

export function formatHours(value, fallback = '—') {
  const n = Number(value);
  return Number.isFinite(n) ? String(Number(n.toFixed(4))) : fallback;
}

/** Grouped integer ("1,234"), or `fallback` for non-numbers. */
export function formatNumber(value, fallback = '—') {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString('en-GB')
    : fallback;
}
