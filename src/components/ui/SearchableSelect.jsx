import { useEffect, useMemo, useState } from 'react';
import { Combobox } from '@/components/ui/Combobox';

/**
 * Drop-in searchable replacement for a native `<select>` when the option list
 * is worth filtering. Takes the full `options` list up front (already loaded —
 * see the `?all=true` lookup hooks) and filters it client-side as the user
 * types; no server round-trip and no minimum character count, so the full list
 * shows immediately on focus.
 *
 *   <SearchableSelect
 *     value={field.value} onChange={field.onChange}
 *     options={truckModels.data ?? []}     // [{ value, label }]
 *     placeholder="Search or select a model"
 *   />
 */
export function SearchableSelect({
  id,
  value,
  onChange,
  options = [],
  loading = false,
  disabled = false,
  error,
  placeholder,
  emptyText = 'No matches',
}) {
  const [query, setQuery] = useState(value || '');
  const [focused, setFocused] = useState(false);

  // Keep the displayed text in sync with the selected value (e.g. a default
  // getting auto-picked, or a reset) — but never while the user is mid-edit,
  // or their keystroke would get clobbered by this sync.
  useEffect(() => {
    if (!focused) setQuery(value || '');
  }, [value, focused]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <Combobox
      id={id}
      inputValue={query}
      onInputChange={(v) => {
        setQuery(v);
        // Typing over a prior selection invalidates it until they pick again.
        if (value) onChange('');
      }}
      options={filtered}
      loading={loading}
      disabled={disabled}
      onSelect={(opt) => {
        onChange(opt.value);
        setQuery(opt.value);
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={loading ? 'Loading…' : placeholder}
      emptyText={loading ? 'Loading…' : emptyText}
      error={error}
    />
  );
}
