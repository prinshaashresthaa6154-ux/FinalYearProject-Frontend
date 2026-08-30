import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  description?: string;
};

export default function Input({ label, error, description, id, className = "", ...props }: InputProps) {
  const inputId = id ?? props.name;
  const descriptionId = inputId && description ? `${inputId}-description` : undefined;
  const errorId = inputId && error ? `${inputId}-error` : undefined;
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm font-semibold text-black">{label}</span>}
      {description && <span id={descriptionId} className="block text-xs leading-5 text-black/60">{description}</span>}
      <input
        {...props}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}
        className={`field-control px-3 py-2.5 placeholder:text-black/40 ${error ? "!border-brand !ring-2 !ring-brand/10" : ""} ${className}`}
      />
      {error && <span id={errorId} className="text-xs font-medium text-brand">{error}</span>}
    </label>
  );
}
