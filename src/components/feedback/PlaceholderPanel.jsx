/**
 * Temporary stand-in for screens that will be built once the UI mockup lands.
 * Remove usages as real screens are implemented.
 */
export function PlaceholderPanel({
  title = 'Screen not implemented yet',
  children,
}) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <p className="mt-1 text-sm text-gray-500">
        {children ??
          'This screen will be implemented once the UI mockup is provided.'}
      </p>
    </div>
  );
}
