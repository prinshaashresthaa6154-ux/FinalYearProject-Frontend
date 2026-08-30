import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string; description?: string };

export default function Select({ label, error, description, id, className = "", children, ...props }: SelectProps) {
  const selectId = id ?? props.name;
  const descriptionId = selectId && description ? `${selectId}-description` : undefined;
  const errorId = selectId && error ? `${selectId}-error` : undefined;
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm font-semibold text-black">{label}</span>}
      {description && <span id={descriptionId} className="block text-xs leading-5 text-black/60">{description}</span>}
      <select {...props} id={selectId} aria-invalid={Boolean(error)} aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined} className={`field-control px-3 py-2.5 ${error ? "!border-brand !ring-2 !ring-brand/10" : ""} ${className}`}>
        {children}
      </select>
      {error && <span id={errorId} className="text-xs font-medium text-brand">{error}</span>}
    </label>
  );
}
