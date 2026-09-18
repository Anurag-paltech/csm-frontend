import { useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';

function ChevronDown(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/**
 * Fully-controlled async combobox (search-select). The parent owns the text
 * (`inputValue` / `onInputChange`) and supplies the current `options`; this
 * component only handles open/close, keyboard nav, and selection. `onFocus` /
 * `onBlur` are optional passthroughs (e.g. for `SearchableSelect`'s snap-back).
 *
 *   <Combobox
 *     id="causal-part"
 *     inputValue={query} onInputChange={setQuery}
 *     options={parts}            // [{ value, label, hint? }]
 *     loading={isFetching}
 *     onSelect={(opt) => …}
 *     emptyText="No matching parts"
 *   />
 */
export function Combobox({
  id,
  inputValue,
  onInputChange,
  options = [],
  loading = false,
  onSelect,
  placeholder,
  emptyText = 'No results',
  error,
  disabled = false,
  onFocus,
  onBlur,
  footer,
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDocMouseDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [open]);

  // Reset the highlighted row whenever the option set changes.
  useEffect(() => {
    setActive(-1);
  }, [options]);

  const choose = (opt) => {
    onSelect(opt);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && open && active >= 0 && options[active]) {
      e.preventDefault();
      choose(options[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-invalid={error ? true : undefined}
        autoComplete="off"
        disabled={disabled}
        value={inputValue}
        placeholder={placeholder}
        onChange={(e) => {
          onInputChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          onFocus?.();
        }}
        onBlur={() => onBlur?.()}
        onKeyDown={onKeyDown}
        className={`block w-full rounded-sm border bg-surface px-2.75 py-2.25 pr-8 text-[13.5px] text-ink placeholder-ink-3 focus:outline-none focus:ring-[3px] focus:ring-light-blue-soft disabled:bg-surface-2 ${
          error
            ? 'border-red bg-red-soft focus:border-red'
            : 'border-line-2 focus:border-light-blue'
        }`}
      />
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3">
        {loading ? (
          <Spinner className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </span>

      {open ? (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-line-2 bg-surface p-1 shadow-pop"
        >
          {options.length === 0 ? (
            <li className="px-2.5 py-2 text-[13px] text-ink-3">
              {loading ? 'Searching…' : emptyText}
            </li>
          ) : (
            options.map((opt, i) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(opt);
                }}
                onMouseEnter={() => setActive(i)}
                className={`cursor-pointer rounded-sm px-2.5 py-2 text-[13px] ${
                  i === active ? 'bg-blue-soft text-blue' : 'text-ink'
                }`}
              >
                {opt.label}
              </li>
            ))
          )}
          {footer && options.length > 0 ? (
            <li className="cursor-default select-none border-t border-line px-2.5 py-1.5 text-[11px] text-ink-3">
              {footer}
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
