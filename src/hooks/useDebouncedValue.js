import { useEffect, useState } from "react";

/** Debounce Search
 * Returns `value` delayed by `delay` ms — resets the timer on every change, so
 * it only settles once input pauses. Use for search-as-you-type inputs.
 */
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
