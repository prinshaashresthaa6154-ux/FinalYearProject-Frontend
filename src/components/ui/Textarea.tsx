import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string; description?: string };

export default function Textarea({ label, error, description, id, className = "", ...props }: TextareaProps) {
  const textareaId = id ?? props.name;
  const descriptionId = textareaId && description ? `${textareaId}-description` : undefined;
  const errorId = textareaId && error ? `${textareaId}-error` : undefined;
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm font-semibold text-black">{label}</span>}
      {description && <span id={descriptionId} className="block text-xs leading-5 text-black/60">{description}</span>}
      <textarea
        {...props}
        id={textareaId}
        aria-invalid={Boolean(error)}
        aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}
        className={`field-control min-h-28 resize-y px-3 py-2.5 placeholder:text-black/40 ${error ? "!border-brand !ring-2 !ring-brand/10" : ""} ${className}`}
      />
      {error && <span id={errorId} className="text-xs font-medium text-brand">{error}</span>}
    </label>
  );
}
