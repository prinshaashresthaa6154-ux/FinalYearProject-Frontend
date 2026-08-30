import type { ReactNode } from "react";

export type TableColumn<T> = { key: string; header: string; render: (row: T) => ReactNode };
type TableProps<T> = { columns: TableColumn<T>[]; rows: T[]; rowKey: (row: T) => string | number; emptyMessage?: string };

export default function Table<T>({ columns, rows, rowKey, emptyMessage = "No records found." }: TableProps<T>) {
  return <div className="overflow-x-auto rounded-xl border border-black/10 bg-white shadow-sm"><table className="min-w-full text-left text-sm"><thead className="border-b border-black/10 bg-black/[0.035] text-xs uppercase tracking-wide text-black/60"><tr>{columns.map((column) => <th key={column.key} scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">{column.header}</th>)}</tr></thead><tbody className="divide-y divide-black/10">{rows.length ? rows.map((row) => <tr key={rowKey(row)} className="align-top transition-colors hover:bg-[#1D78AF]/[0.04]">{columns.map((column) => <td key={column.key} className="px-4 py-3">{column.render(row)}</td>)}</tr>) : <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-black/55">{emptyMessage}</td></tr>}</tbody></table></div>;
}
