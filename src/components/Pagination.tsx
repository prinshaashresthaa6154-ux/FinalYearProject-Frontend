import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-6 flex items-center justify-between gap-3 border-t border-black/10 pt-5" aria-label="Pagination">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-black/15 bg-white px-3 py-2 text-sm font-semibold text-black transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" /> Previous
      </button>
      <span className="text-center text-xs font-semibold text-black/55 sm:text-sm">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-black/15 bg-white px-3 py-2 text-sm font-semibold text-black transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
