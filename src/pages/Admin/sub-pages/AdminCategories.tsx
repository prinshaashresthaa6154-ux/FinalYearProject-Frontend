import { ArrowDownAZ, ArrowUpAZ, EyeOff, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { getApiError } from "../../../api/axios";
import Pagination from "../../../components/Pagination";
import { ConfirmDialog, EmptyState, ErrorState, LoadingSpinner } from "../../../components/ui";
import { categoryImageUrl, categoryService, type Category, type CategoryStatus } from "../../../services/categoryService";

const pageSize = 10;

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CategoryStatus | "">("");
  const [sortBy, setSortBy] = useState<"name" | "status" | "createdAt">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await categoryService.adminList({ keyword: search || undefined, status, page, size: pageSize, sortBy, sortDir });
      const result = response.data.data;
      const rows = result?.content ?? [];
      setCategories(rows); setTotalPages(result?.totalPages ?? 0); setTotalElements(result?.totalElements ?? 0);
      const countResults = await Promise.allSettled(rows.map((category) => categoryService.trips(category.id, 0, 1)));
      setCounts(Object.fromEntries(rows.map((category, index) => [category.id, countResults[index].status === "fulfilled" ? countResults[index].value.data.data?.totalElements ?? 0 : 0])));
    } catch (requestError) { setError(getApiError(requestError).message); } finally { setLoading(false); }
  }, [page, search, sortBy, sortDir, status]);

  useEffect(() => { void load(); }, [load]);

  const changeStatus = async (category: Category) => {
    setActionId(category.id); setNotice("");
    try { await categoryService.updateStatus(category.id, category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"); setNotice(`${category.name} was ${category.status === "ACTIVE" ? "deactivated" : "activated"}.`); await load(); }
    catch (requestError) { setError(getApiError(requestError).message); } finally { setActionId(null); }
  };

  const remove = async () => {
    if (!deleting) return;
    setActionId(deleting.id); setNotice("");
    try { await categoryService.delete(deleting.id); setNotice(`${deleting.name} was deleted.`); setDeleting(null); await load(); }
    catch (requestError) { setError(getApiError(requestError).message); setDeleting(null); } finally { setActionId(null); }
  };

  return <div className="space-y-5"><div className="rounded-2xl border border-[#eae3dc] bg-white shadow-sm"><div className="flex flex-col gap-4 border-b border-[#f0eae4] p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-[#b31919]">Content taxonomy</p><h2 className="mt-1 font-display text-2xl font-bold text-[#1a130e]">Category Management</h2><p className="mt-1 text-sm text-gray-500">{totalElements} categories available to this account</p></div><Link to="/admin/categories/create" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#b31919] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#941414]"><Plus className="h-4 w-4" /> Create category</Link></div>
    <div className="grid gap-3 border-b border-[#f0eae4] bg-[#fcfaf7] p-4 md:grid-cols-[1fr_auto_auto_auto]"><form onSubmit={(event) => { event.preventDefault(); setPage(0); setSearch(keyword.trim()); }} className="flex rounded-lg border border-[#ded5cd] bg-white"><Search className="ml-3 mt-2.5 h-4 w-4 text-gray-400" /><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Search categories" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none" /><button className="px-3 text-xs font-bold text-[#b31919]">Search</button></form><select value={status} onChange={(event) => { setStatus(event.target.value as CategoryStatus | ""); setPage(0); }} className="rounded-lg border border-[#ded5cd] bg-white px-3 py-2 text-sm"><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select><select value={sortBy} onChange={(event) => { setSortBy(event.target.value as typeof sortBy); setPage(0); }} className="rounded-lg border border-[#ded5cd] bg-white px-3 py-2 text-sm"><option value="createdAt">Created date</option><option value="name">Name</option><option value="status">Status</option></select><button type="button" onClick={() => setSortDir((value) => value === "asc" ? "desc" : "asc")} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#ded5cd] bg-white px-3 py-2 text-sm">{sortDir === "asc" ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />}{sortDir === "asc" ? "Ascending" : "Descending"}</button></div>
    {notice && <p role="status" className="mx-5 mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p>}{error && !loading && <div className="p-5"><ErrorState message={error} onRetry={() => void load()} /></div>}{loading ? <div className="grid min-h-48 place-items-center"><LoadingSpinner label="Loading categories" /></div> : !error && categories.length === 0 ? <div className="p-5"><EmptyState title="No categories found" description="Change the filters or create the first category." /></div> : !error && <><div className="overflow-x-auto"><table className="min-w-[850px] w-full text-left"><thead className="bg-[#fcfaf7] text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-5 py-3">Category</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Trips</th><th className="px-5 py-3">Created</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-[#f0eae4]">{categories.map((category) => <tr key={category.id} className="hover:bg-[#fdfcfb]"><td className="px-5 py-4"><div className="flex items-center gap-3">{category.image ? <img src={categoryImageUrl(category.image)} alt="" className="h-12 w-16 rounded-lg object-cover" /> : <div className="grid h-12 w-16 place-items-center rounded-lg bg-[#eee7df] text-xs text-gray-500">No image</div>}<div><p className="font-semibold text-[#2c2520]">{category.name}</p><p className="mt-0.5 max-w-xs truncate text-xs text-gray-500">{category.description || "No description"}</p></div></div></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${category.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{category.status}</span></td><td className="px-5 py-4 text-sm font-semibold">{counts[category.id] ?? 0}</td><td className="px-5 py-4 text-sm text-gray-500">{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(category.createdAt))}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><Link to={`/admin/categories/${category.id}/edit`} aria-label={`Edit ${category.name}`} className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-[#b31919]"><Pencil className="h-4 w-4" /></Link><button type="button" disabled={actionId === category.id} onClick={() => void changeStatus(category)} aria-label={`${category.status === "ACTIVE" ? "Deactivate" : "Activate"} ${category.name}`} className="rounded-md p-2 text-amber-700 hover:bg-amber-50 disabled:opacity-50"><EyeOff className="h-4 w-4" /></button><button type="button" onClick={() => setDeleting(category)} aria-label={`Delete ${category.name}`} className="rounded-md p-2 text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div><div className="px-5 pb-5"><Pagination page={page + 1} totalPages={totalPages} onPageChange={(next) => setPage(next - 1)} /></div></>}</div><ConfirmDialog open={Boolean(deleting)} title="Delete category" message={`Delete ${deleting?.name ?? "this category"}? The backend will reject deletion if destinations still reference it.`} confirmLabel="Delete category" loading={actionId === deleting?.id} onConfirm={() => void remove()} onCancel={() => setDeleting(null)} /></div>;
}
