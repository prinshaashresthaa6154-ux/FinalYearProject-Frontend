import { X } from "lucide-react";
import { useEffect, useId, type ReactNode } from "react";

type ModalProps = { open: boolean; onClose: () => void; title: string; children: ReactNode; size?: "sm" | "lg" };

export default function Modal({ open, onClose, title, children, size = "sm" }: ModalProps) {
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [onClose, open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby={titleId} className={`max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-xl border border-black/10 bg-white p-5 shadow-xl ${size === "lg" ? "max-w-2xl" : "max-w-md"}`}>
        <header className="flex items-center justify-between gap-4 border-b border-black/10 pb-4">
          <h2 id={titleId} className="font-display text-xl font-bold text-black">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-md p-1.5 text-black/50 hover:bg-black/[0.05] hover:text-black"><X className="h-5 w-5" /></button>
        </header>
        <div className="pt-5">{children}</div>
      </section>
    </div>
  );
}
