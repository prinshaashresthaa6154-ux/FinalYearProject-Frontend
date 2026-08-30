import { ArrowRight, Layers3, Search } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { getApiError } from "../api/axios";
import Pagination from "../components/Pagination";
import { EmptyState, ErrorState, LoadingSpinner } from "../components/ui";
import { categoryImageUrl, categoryService, type Category } from "../services/categoryService";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await categoryService.publicList({ keyword: search || undefined, page, size: 9, sortBy: "name", sortDir: "asc" });
      const result = response.data.data; const rows = result?.content ?? [];
      setCategories(rows); setTotalPages(result?.totalPages ?? 0);
      const tripCounts = await Promise.allSettled(rows.map((category) => categoryService.trips(category.id, 0, 1)));
      setCounts(Object.fromEntries(rows.map((category, index) => [category.id, tripCounts[index].status === "fulfilled" ? tripCounts[index].value.data.data?.totalElements ?? 0 : 0])));
    } catch (requestError) { setError(getApiError(requestError).message); } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { void load(); }, [load]);
  const submitSearch = (event: FormEvent) => { event.preventDefault(); setPage(0); setSearch(keyword.trim()); };

  return <main className="min-h-screen bg-[#f6f1e9]"><header className="relative overflow-hidden bg-[#241b16] px-5 py-16 text-white sm:py-20"><div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[50px] border-[#a62922]/20" /><div className="relative mx-auto max-w-6xl"><p className="text-xs font-bold uppercase tracking-[0.25em] text-[#e5a59f]">Find your way through Nepal</p><h1 className="mt-4 max-w-2xl font-display text-4xl font-bold sm:text-6xl">Travel by story, landscape, and tradition.</h1><p className="mt-5 max-w-xl leading-7 text-[#d4c8c0]">Browse curated categories and discover published journeys connected to each theme.</p><form onSubmit={submitSearch} className="mt-8 flex max-w-lg overflow-hidden rounded-lg bg-white text-[#241f1a]"><Search className="ml-4 mt-3.5 h-5 w-5 text-gray-400" /><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Search trekking, culture, wildlife..." className="min-w-0 flex-1 px-3 py-3 outline-none" /><button className="bg-[#a62922] px-5 text-sm font-bold text-white">Explore</button></form></div></header><section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">{loading ? <div className="grid min-h-52 place-items-center"><LoadingSpinner label="Loading categories" /></div> : error ? <ErrorState message={error} onRetry={() => void load()} /> : categories.length === 0 ? <EmptyState title="No categories found" description="There are no active categories matching this search." /> : <><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category, index) => <Link key={category.id} to={`/categories/${category.slug}`} className={`group overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(52,40,32,0.07)] transition hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(52,40,32,0.12)] ${index === 0 && page === 0 ? "sm:col-span-2" : ""}`}><div className={`relative overflow-hidden bg-[#ddd2c8] ${index === 0 && page === 0 ? "h-64" : "h-52"}`}>{category.image ? <img src={categoryImageUrl(category.image)} alt={category.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center text-[#8c7d70]"><Layers3 className="h-10 w-10" /></div>}<span className="absolute left-4 top-4 rounded-full bg-[#241b16]/85 px-3 py-1 text-xs font-bold text-white">{counts[category.id] ?? 0} trips</span></div><div className="p-5"><h2 className="font-display text-2xl font-bold text-[#241f1a]">{category.name}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-[#75695f]">{category.description || "Discover trips and destinations in this category."}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#a62922]">Browse category <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></div></Link>)}</div><Pagination page={page + 1} totalPages={totalPages} onPageChange={(next) => setPage(next - 1)} /></>}</section></main>;
}
