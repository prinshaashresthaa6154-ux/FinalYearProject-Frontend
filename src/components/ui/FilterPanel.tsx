import type { ReactNode } from "react";

type FilterPanelProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export default function FilterPanel({ children, title = "Filter results", description, actions, className = "" }: FilterPanelProps) {
  return (
    <section className={`filter-surface p-4 sm:p-5 ${className}`}>
      {(title || description || actions) && (
        <div className="mb-4 flex flex-col gap-3 border-b border-black/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && <h2 className="text-sm font-semibold text-black">{title}</h2>}
            {description && <p className="mt-1 text-xs leading-5 text-black/55">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </section>
  );
}
