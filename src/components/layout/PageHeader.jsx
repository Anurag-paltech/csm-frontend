/** Screen header. `.page-head` / `.eyebrow` / `.page-title`. */
export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <div className="mb-1.25 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-red">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="text-[23px] font-bold tracking-[-0.015em] text-navy">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-ink-3">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
