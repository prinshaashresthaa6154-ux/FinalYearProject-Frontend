import Badge from "./Badge";

const dangerStatuses = ["reject", "cancel", "suspend", "fail", "inactive", "unpaid", "expired"];
const pendingStatuses = ["pending", "review", "draft", "processing", "partial"];
const successStatuses = ["active", "approved", "complete", "success", "published", "paid", "confirmed"];

export default function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = dangerStatuses.some((value) => normalized.includes(value))
    ? "danger"
    : pendingStatuses.some((value) => normalized.includes(value))
      ? "warning"
      : successStatuses.some((value) => normalized.includes(value))
        ? "success"
        : "neutral";
  const label = status.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

  return <Badge tone={tone}>{label}</Badge>;
}
