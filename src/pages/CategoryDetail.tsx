import { ArrowLeft, CalendarDays, Clock3, MapPin, Mountain, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getApiError } from "../api/axios";
import Pagination from "../components/Pagination";
import { EmptyState, ErrorState, LoadingSpinner } from "../components/ui";
import { categoryImageUrl, categoryService, type Category, type CategoryTrip } from "../services/categoryService";

export default function CategoryDetail() {
  const { slug = "" } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [trips, setTrips] = useState<CategoryTrip[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalTrips, setTotalTrips] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const identifier = slug.trim(); const categoryResponse = /^\d+$/.test(identifier) ? await categoryService.publicById(Number(identifier)) : await categoryService.publicBySlug(identifier); const found = categoryResponse.data.data; if (!found) throw new Error("Category not found"); setCategory(found); const tripResponse = await categoryService.trips(found.id, page, 9); setTrips(tripResponse.data.data?.content ?? []); setTotalPages(tripResponse.data.data?.totalPages ?? 0); setTotalTrips(tripResponse.data.data?.totalElements ?? 0); }
    catch (requestError) { setError(getApiError(requestError).message); } finally { setLoading(false); }
  }, [page, slug]);
  useEffect(() => { void load(); }, [load]);

  if (loading) return <main className="grid min-h-[70vh] place-items-center bg-[#f6f1e9]"><LoadingSpinner label="Loading category" /></main>;
  if (error || !category) return <main className="min-h-[70vh] bg-[#f6f1e9] px-5 py-16"><div className="mx-auto max-w-3xl"><ErrorState message={error || "Category not found"} onRetry={() => void load()} /></div></main>;
  return <main className="min-h-screen bg-[#f6f1e9]"><header className="relative min-h-[380px] overflow-hidden bg-[#241b16] text-white">{category.image && <img src={categoryImageUrl(category.image)} alt={category.name} className="absolute inset-0 h-full w-full object-cover opacity-45" />}<div className="absolute inset-0 bg-gradient-to-r from-[#211813] via-[#211813]/75 to-transparent" /><div className="relative mx-auto flex min-h-[380px] max-w-6xl flex-col justify-end px-5 py-12"><Link to="/categories" className="mb-auto inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/80 hover:text-white"><ArrowLeft className="h-4 w-4" /> All categories</Link><p className="text-xs font-bold uppercase tracking-[0.25em] text-[#efb0aa]">Nepal Yatra collection</p><h1 className="mt-3 max-w-3xl font-display text-5xl font-bold sm:text-6xl">{category.name}</h1><p className="mt-4 max-w-2xl text-base leading-7 text-white/80">{category.description || "Explore destinations and journeys in this collection."}</p><p className="mt-5 text-sm font-bold">{totalTrips} published {totalTrips === 1 ? "trip" : "trips"}</p></div></header><section className="mx-auto max-w-6xl px-5 py-12"><div className="mb-7 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-[#a62922]">Related journeys</p><h2 className="mt-2 font-display text-3xl font-bold">Trips in {category.name}</h2></div></div>{trips.length === 0 ? <EmptyState title="No published trips yet" description="Published trips associated with this category will appear here." /> : <><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{trips.map((trip) => <article key={trip.id} className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_26px_rgba(52,40,32,0.07)]"><div className="h-48 bg-[#ded4ca]">{trip.featuredImage ? <img src={categoryImageUrl(trip.featuredImage)} alt={trip.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-[#8c7d70]"><Mountain className="h-9 w-9" /></div>}</div><div className="p-5"><div className="flex flex-wrap gap-3 text-xs text-[#807269]"><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {trip.duration} days</span>{trip.destination && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {trip.destination.name}</span>}</div><h3 className="mt-3 font-display text-xl font-bold">{trip.title}</h3><p className="mt-2 line-clamp-3 text-sm leading-6 text-[#75695f]">{trip.shortDescription}</p><div className="mt-4 flex flex-wrap gap-3 text-xs text-[#807269]">{trip.startDate && <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(trip.startDate))}</span>}<span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {trip.availableSeats} seats</span></div><div className="mt-5 flex items-center justify-between border-t border-[#eee7e1] pt-4"><p className="font-display text-xl font-bold text-[#a62922]">{trip.currency} {Number(trip.price).toLocaleString()}</p><span className="text-xs font-semibold text-[#807269]">Published journey</span></div></div></article>)}</div><Pagination page={page + 1} totalPages={totalPages} onPageChange={(next) => setPage(next - 1)} /></>}</section></main>;
}
