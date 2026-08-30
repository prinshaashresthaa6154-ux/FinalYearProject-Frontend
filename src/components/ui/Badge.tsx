import type { ReactNode } from "react";

type BadgeTone = "neutral" | "success" | "warning" | "danger";

const tones: Record<BadgeTone, string> = {
  neutral: "border-black/10 bg-black/[0.05] text-black/65",
  success: "border-accent/20 bg-accent/10 text-accent-dark",
  warning: "border-accent/35 bg-white text-accent-dark",
  danger: "border-brand/20 bg-brand/10 text-brand-dark",
};

export default function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: BadgeTone }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
