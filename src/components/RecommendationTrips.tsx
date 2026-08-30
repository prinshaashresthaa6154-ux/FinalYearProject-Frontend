import { Clock3, MapPin, Mountain, Star } from "lucide-react";
import { Link } from "react-router";
import { Skeleton } from "./ui";
import { mediaUrl } from "../services/destinationService";

export type RecommendationCardTrip = {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  destination: { name: string };
  category: { name: string };
  provider?: { name: string } | null;
  duration: number;
  price: number;
  currency: string;
  featuredImage?: string | null;
  rating: number;
  availableSeats: number;
  available: boolean;
};

export default function RecommendationTrips({ trips, loading, emptyText = "No trips are available yet." }: { trips: RecommendationCardTrip[]; loading: boolean; emptyText?: string }) {
  if (loading) return <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="rounded-2xl bg-white p-4"><Skeleton className="h-44 w-full" /><Skeleton className="mt-4 h-6 w-3/4" /><Skeleton className="mt-3 h-4 w-full" /></div>)}</div>;
  if (!trips.length) return <div className="rounded-2xl border border-dashed border-[#d8cec0] px-6 py-12 text-center text-sm text-[#786d63]">{emptyText}</div>;
  return <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{trips.map((trip) => <Link key={trip.id} to={`/trips/${trip.slug}`} className="group overflow-hidden rounded-2xl bg-white shadow-[0_8px_28px_rgba(52,40,32,0.08)] transition hover:-translate-y-1"><div className="relative h-48 bg-[#ded4ca]">{trip.featuredImage ? <img src={mediaUrl(trip.featuredImage)} alt={trip.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center text-[#8c7d70]"><Mountain className="h-8 w-8" /></div>}<span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold ${trip.available ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{trip.available ? `${trip.availableSeats} seats` : "Unavailable"}</span></div><div className="p-5"><p className="text-xs font-bold uppercase tracking-wide text-[#a62922]">{trip.category.name}</p><h3 className="mt-2 font-display text-xl font-bold">{trip.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-[#75695f]">{trip.shortDescription}</p><div className="mt-4 flex flex-wrap gap-3 text-xs text-[#807269]"><span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {trip.destination.name}</span><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {trip.duration} days</span><span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {Number(trip.rating).toFixed(1)}</span></div><div className="mt-5 flex items-center justify-between border-t border-[#eee7e1] pt-4"><span className="text-xs text-[#807269]">{trip.provider?.name || "Nepal Yatra"}</span><strong className="text-[#a62922]">{trip.currency} {Number(trip.price).toLocaleString()}</strong></div></div></Link>)}</div>;
}
