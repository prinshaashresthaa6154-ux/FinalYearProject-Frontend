import { ArrowLeft, MapPin, Mountain, Star, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getApiError } from "../api/axios";
import Pagination from "../components/Pagination";
import { EmptyState, ErrorState, LoadingSpinner } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { destinationService, mediaUrl, type Destination, type DestinationTrip } from "../services/destinationService";
import { recommendationService } from "../services/recommendationService";

export default function DestinationDetail() {
  const { token } = useAuth();
  const { slug = "" } = useParams();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [trips, setTrips] = useState<DestinationTrip[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const identifier = slug.trim();
      const response = /^\d+$/.test(identifier) ? await destinationService.publicById(Number(identifier)) : await destinationService.publicBySlug(identifier);
      const found = response.data.data;
      if (!found) throw new Error("Destination not found");
      setDestination(found);
      if (token) void recommendationService.recordDestinationView(found.id).catch(() => undefined);
      const tripResponse = await destinationService.trips(found.id, page, 9);
      setTrips(tripResponse.data.data?.content ?? []);
      setTotalPages(tripResponse.data.data?.totalPages ?? 0);
    } catch (requestError) { setError(getApiError(requestError).message); } finally { setLoading(false); }
  }, [page, slug, token]);

  useEffect(() => { void load(); }, [load]);
  if (loading) return <main className="grid min-h-[70vh] place-items-center bg-[#f6f1e9]"><LoadingSpinner label="Loading destination" /></main>;
  if (error || !destination) return <main className="min-h-[70vh] bg-[#f6f1e9] px-5 py-16"><div className="mx-auto max-w-3xl"><ErrorState message={error || "Destination not found"} onRetry={() => void load()} /></div></main>;

  const hero = destination.featuredImage || destination.coverImage;
  const gallery = [hero, ...(destination.gallery ?? [])].filter((value, index, all): value is string => Boolean(value) && all.indexOf(value) === index);
  return <main className="min-h-screen bg-[#f6f1e9]">
    <header className="relative min-h-[500px] bg-[#251c17] text-white">{hero && <img src={mediaUrl(hero)} alt={destination.name} className="absolute inset-0 h-full w-full object-cover opacity-55" />}<div className="absolute inset-0 bg-gradient-to-t from-[#201713] via-[#201713]/45 to-[#201713]/20" /><div className="relative mx-auto flex min-h-[500px] max-w-6xl flex-col justify-between px-5 py-10"><Link to="/destinations" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/85"><ArrowLeft className="h-4 w-4" /> All destinations</Link><div><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">{destination.category?.name}</span><h1 className="mt-5 max-w-4xl font-display text-5xl font-bold sm:text-7xl">{destination.name}</h1><p className="mt-4 flex items-center gap-2 text-white/85"><MapPin className="h-5 w-5" /> {destination.location}, {destination.district}, {destination.province}</p></div></div></header>
    <div className="mx-auto max-w-6xl px-5 py-12">
      <section className="grid gap-10 lg:grid-cols-[1fr_300px]"><div><p className="text-xs font-bold uppercase tracking-widest text-[#a62922]">About the place</p><h2 className="mt-2 font-display text-3xl font-bold">Discover {destination.name}</h2><p className="mt-5 whitespace-pre-line text-base leading-8 text-[#675b52]">{destination.description}</p></div><aside className="border-l-4 border-[#a62922] bg-white p-6"><Info label="Category" value={destination.category?.name} /><Info label="Difficulty" value={destination.difficulty} /><Info label="Best season" value={destination.bestSeason.replace("_", " ")} /><Info label="Coordinates" value={`${destination.latitude}, ${destination.longitude}`} /><Info label="Rating" value={`${Number(destination.rating).toFixed(1)} / 5 (${destination.reviewCount} reviews)`} /></aside></section>
      {gallery.length > 0 && <section className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{gallery.map((image, index) => <img key={image} src={mediaUrl(image)} alt={`${destination.name} ${index + 1}`} className={`h-52 w-full rounded-lg object-cover ${index === 0 ? "sm:col-span-2 sm:h-80" : ""}`} />)}</section>}
      <section className="mt-16"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-[#a62922]">Available journeys</p><h2 className="mt-2 font-display text-3xl font-bold">Trips in {destination.name}</h2></div><span className="text-sm text-[#75695f]">{trips.length} on this page</span></div>{trips.length === 0 ? <div className="mt-6"><EmptyState title="No published trips yet" description="Published trips for this destination will appear here." /></div> : <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{trips.map((trip) => <TripCard key={trip.id} trip={trip} />)}</div>}{totalPages > 1 && <div className="mt-8"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>}</section>
    </div>
  </main>;
}

function TripCard({ trip }: { trip: DestinationTrip }) {
  const adminName = trip.adminName || trip.admin?.fullName || trip.admin?.name || trip.provider?.fullName || trip.provider?.name || "Nepal Yatra";
  return <Link to={`/trips/${trip.slug || trip.id}`} className="group overflow-hidden rounded-2xl bg-white shadow-[0_8px_28px_rgba(52,40,32,0.08)] transition hover:-translate-y-1 hover:shadow-lg"><div className="relative h-48 bg-[#ded4ca]">{trip.featuredImage ? <img src={mediaUrl(trip.featuredImage)} alt={trip.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-[#8c7d70]">No image</div>}<span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold ${trip.available ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{trip.available ? "Available" : "Unavailable"}</span></div><div className="p-5"><h3 className="font-display text-2xl font-bold group-hover:text-[#a62922]">{trip.title}</h3><div className="mt-3 flex flex-wrap gap-4 text-sm text-[#75695f]"><span className="inline-flex items-center gap-2"><Mountain className="h-4 w-4" /> {trip.duration} days</span><span className="inline-flex items-center gap-2"><Users className="h-4 w-4" /> {trip.availableSeats} seats left</span></div><p className="mt-4 border-t border-[#eee7e1] pt-4 text-xs text-[#75695f]">Trip by <span className="font-bold text-[#2f2722]">{adminName}</span></p><div className="mt-4 flex items-center justify-between gap-3"><span className="inline-flex items-center gap-1 text-sm font-semibold text-[#75695f]"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> View details</span><strong className="text-[#a62922]">{trip.currency} {Number(trip.price).toLocaleString()}</strong></div></div></Link>;
}

function Info({ label, value }: { label: string; value?: string | number | null }) { return <div className="border-b border-[#eee7e1] py-3 first:pt-0 last:border-0 last:pb-0"><p className="text-xs font-bold uppercase tracking-wide text-[#897b70]">{label}</p><p className="mt-1 text-sm font-semibold text-[#2f2722]">{value ?? "Not provided"}</p></div>; }
