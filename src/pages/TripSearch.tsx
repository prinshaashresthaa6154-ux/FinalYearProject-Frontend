import {
  Clock3,
  Filter,
  MapPin,
  Search as SearchIcon,
  Star,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, useSearchParams } from "react-router";
import { getApiError } from "../api/axios";
import Pagination from "../components/Pagination";
import { EmptyState, ErrorState, Skeleton } from "../components/ui";
import { categoryService, type Category } from "../services/categoryService";
import {
  destinationService,
  type Destination,
  mediaUrl,
} from "../services/destinationService";
import {
  getTripBookability,
  tripService,
  type Trip,
} from "../services/tripService";

type Filters = {
  keyword: string;
  destination: string;
  category: string;
  admin: string;
  minPrice: string;
  maxPrice: string;
  minDuration: string;
  maxDuration: string;
  difficulty: string;
  rating: string;
  date: string;
  available: boolean;
  sort: string;
  page: number;
};
const defaults: Filters = {
  keyword: "",
  destination: "",
  category: "",
  admin: "",
  minPrice: "",
  maxPrice: "",
  minDuration: "",
  maxDuration: "",
  difficulty: "",
  rating: "",
  date: "",
  available: false,
  sort: "newest",
  page: 1,
};
const sortMap: Record<string, { sortBy: string; sortDir: string }> = {
  newest: { sortBy: "createdAt", sortDir: "desc" },
  priceLow: { sortBy: "price", sortDir: "asc" },
  priceHigh: { sortBy: "price", sortDir: "desc" },
  rating: { sortBy: "rating", sortDir: "desc" },
  duration: { sortBy: "duration", sortDir: "asc" },
};
const parseFilters = (params: URLSearchParams): Filters => ({
  keyword: params.get("keyword") || params.get("q") || "",
  destination: params.get("destination") || "",
  category: params.get("category") || "",
  admin: params.get("admin") || "",
  minPrice: params.get("minPrice") || "",
  maxPrice: params.get("maxPrice") || "",
  minDuration: params.get("minDuration") || "",
  maxDuration: params.get("maxDuration") || "",
  difficulty: params.get("difficulty") || "",
  rating: params.get("rating") || "",
  date: params.get("date") || "",
  available: params.get("available") === "true",
  sort: params.get("sort") || "newest",
  page: Math.max(1, Number(params.get("page") || 1)),
});

export default function TripSearch() {
  const [params, setParams] = useSearchParams();
  const initial = useMemo(() => parseFilters(params), [params]);
  const [filters, setFilters] = useState(initial);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileFilters, setMobileFilters] = useState(false);
  useEffect(() => {
    setFilters(initial);
  }, [initial]);
  useEffect(() => {
    Promise.all([
      destinationService.publicList({
        page: 0,
        size: 100,
        sortBy: "name",
        sortDir: "asc",
      }),
      categoryService.publicList({
        page: 0,
        size: 100,
        sortBy: "name",
        sortDir: "asc",
      }),
    ])
      .then(([d, c]) => {
        setDestinations(d.data.data?.content ?? []);
        setCategories(c.data.data?.content ?? []);
      })
      .catch(() => undefined);
  }, []);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const destinationId = destinations.find(
      (item) => item.slug === filters.destination,
    )?.id;
    const categoryId = categories.find(
      (item) => item.slug === filters.category,
    )?.id;
    const sort = sortMap[filters.sort] || sortMap.newest;
    try {
      const response = await tripService.search({
        keyword: filters.keyword || undefined,
        destinationId,
        categoryId,
        admin: filters.admin ? Number(filters.admin) : undefined,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        minDuration: filters.minDuration
          ? Number(filters.minDuration)
          : undefined,
        maxDuration: filters.maxDuration
          ? Number(filters.maxDuration)
          : undefined,
        difficulty: filters.difficulty || undefined,
        rating: filters.rating ? Number(filters.rating) : undefined,
        date: filters.date || undefined,
        availableOnly: filters.available,
        page: filters.page - 1,
        size: 12,
        ...sort,
      });
      setTrips(response.data.data?.content ?? []);
      setTotalPages(response.data.data?.totalPages ?? 0);
    } catch (e) {
      setError(getApiError(e).message);
    } finally {
      setLoading(false);
    }
  }, [categories, destinations, filters]);
  useEffect(() => {
    if (
      destinations.length ||
      categories.length ||
      (!filters.destination && !filters.category)
    )
      void load();
  }, [
    categories.length,
    destinations.length,
    filters.destination,
    filters.category,
    load,
  ]);
  const queryFor = (values: Filters, page = 1) => {
    const next = new URLSearchParams();
    Object.entries({ ...values, page }).forEach(([key, value]) => {
      if (value !== "" && value !== false && !(key === "page" && value === 1))
        next.set(key, String(value));
    });
    return next;
  };
  const apply = (event?: FormEvent) => {
    event?.preventDefault();
    setParams(queryFor(filters));
  };
  const clear = () => {
    setParams(new URLSearchParams());
    setFilters(defaults);
  };
  const update = (key: keyof Filters, value: string | boolean | number) =>
    setFilters((current) => ({ ...current, [key]: value }));
  const filterPanel = (
    <div className="filter-fields space-y-4">
      <Field label="Destination">
        <select
          value={filters.destination}
          onChange={(e) => update("destination", e.target.value)}
        >
          <option value="">All destinations</option>
          {destinations.map((d) => (
            <option key={d.id} value={d.slug}>
              {d.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Category">
        <select
          value={filters.category}
          onChange={(e) => update("category", e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Provider/admin ID">
        <input
          value={filters.admin}
          onChange={(e) => update("admin", e.target.value)}
          inputMode="numeric"
          placeholder="Optional ID"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Min price">
          <input
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(e) => update("minPrice", e.target.value)}
          />
        </Field>
        <Field label="Max price">
          <input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(e) => update("maxPrice", e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Min days">
          <input
            type="number"
            min="1"
            value={filters.minDuration}
            onChange={(e) => update("minDuration", e.target.value)}
          />
        </Field>
        <Field label="Max days">
          <input
            type="number"
            min="1"
            value={filters.maxDuration}
            onChange={(e) => update("maxDuration", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Difficulty">
        <select
          value={filters.difficulty}
          onChange={(e) => update("difficulty", e.target.value)}
        >
          <option value="">Any difficulty</option>
          {["EASY", "MODERATE", "CHALLENGING", "DIFFICULT", "EXTREME"].map(
            (v) => (
              <option key={v}>{v}</option>
            ),
          )}
        </select>
      </Field>
      <Field label="Minimum rating">
        <select
          value={filters.rating}
          onChange={(e) => update("rating", e.target.value)}
        >
          <option value="">Any rating</option>
          {[5, 4, 3, 2, 1].map((v) => (
            <option key={v} value={v}>
              {v}+ stars
            </option>
          ))}
        </select>
      </Field>
      <Field label="Travel date">
        <input
          type="date"
          value={filters.date}
          onChange={(e) => update("date", e.target.value)}
        />
      </Field>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={filters.available}
          onChange={(e) => update("available", e.target.checked)}
          className="h-4 w-4 accent-[#1D78AF]"
        />{" "}
        Only available trips
      </label>
      <button
        type="button"
        onClick={clear}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#1D78AF] hover:underline"
      >
        <X className="h-4 w-4" /> Clear filters
      </button>
    </div>
  );
  return (
    <main className="min-h-screen bg-[#f8f8f8]">
      <header className="bg-black px-5 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#1D78AF]">
            Search the journey
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
            Find your next Nepal trip.
          </h1>
          <form
            onSubmit={apply}
            className="mt-7 flex max-w-3xl overflow-hidden rounded-lg border border-white/20 bg-white text-black shadow-lg"
          >
            <SearchIcon className="ml-4 mt-3.5 h-5 w-5 text-gray-400" />
            <input
              value={filters.keyword}
              onChange={(e) => update("keyword", e.target.value)}
              placeholder="Search by trip, destination, category..."
              className="min-w-0 flex-1 px-3 py-3 outline-none placeholder:text-black/40"
            />
            <button className="bg-[#AF1D1D] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#881717]">
              Search
            </button>
          </form>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-black/60">
            {loading ? "Searching..." : `${trips.length} trips on this page`}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMobileFilters(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-black/15 bg-white px-3 py-2 text-sm font-semibold hover:border-[#1D78AF] hover:text-[#1D78AF] lg:hidden"
            >
              <Filter className="h-4 w-4" /> Filters
            </button>
            <select
              value={filters.sort}
              onChange={(e) => {
                const next = { ...filters, sort: e.target.value, page: 1 };
                setFilters(next);
                setParams(queryFor(next));
              }}
              className="field-control w-auto px-3 py-2.5"
            >
              <option value="newest">Newest</option>
              <option value="priceLow">Price low to high</option>
              <option value="priceHigh">Price high to low</option>
              <option value="rating">Highest rating</option>
              <option value="duration">Duration</option>
            </select>
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
          <aside className="filter-surface hidden p-5 lg:block">
            <div className="mb-5 flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#1D78AF]" />
              <h2 className="font-display text-xl font-bold">Filters</h2>
            </div>
            {filterPanel}
          </aside>
          <div>
            {error ? (
              <ErrorState message={error} onRetry={() => void load()} />
            ) : loading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="rounded-2xl bg-white p-4">
                    <Skeleton className="h-44 w-full" />
                    <Skeleton className="mt-4 h-6 w-3/4" />
                    <Skeleton className="mt-3 h-4 w-full" />
                    <Skeleton className="mt-5 h-5 w-1/2" />
                  </div>
                ))}
              </div>
            ) : trips.length === 0 ? (
              <EmptyState
                title="No trips match your search"
                description="Try widening your filters or searching for another destination."
                action={
                  <button
                    type="button"
                    onClick={clear}
                    className="rounded-lg bg-[#AF1D1D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#881717]"
                  >
                    Clear filters
                  </button>
                }
              />
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {trips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
                <Pagination
                  page={filters.page}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    update("page", page);
                    const next = new URLSearchParams(params);
                    next.set("page", String(page));
                    setParams(next);
                  }}
                />
              </>
            )}
          </div>
        </div>
      </section>
      {mobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 lg:hidden">
          <div className="ml-auto h-full max-w-sm overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">Filters</h2>
              <button type="button" onClick={() => setMobileFilters(false)}>
                <X />
              </button>
            </div>
            {filterPanel}
            <button
              type="button"
              onClick={() => {
                apply();
                setMobileFilters(false);
              }}
              className="mt-6 w-full rounded-lg bg-[#AF1D1D] px-4 py-3 text-sm font-semibold text-white hover:bg-[#881717]"
            >
              Apply filters
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-black/65">
        {label}
      </span>
      {children}
    </label>
  );
}
function TripCard({ trip }: { trip: Trip }) {
  const availability = getTripBookability(trip);
  return (
    <Link
      to={`/trips/${trip.slug}`}
      className="group overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm transition hover:border-[#1D78AF]/35 hover:shadow-md"
    >
      <div className="relative h-44 bg-[#ddd2c8]">
        {trip.featuredImage ? (
          <img
            src={mediaUrl(trip.featuredImage)}
            alt={trip.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-[#8b7c70]">
            No image
          </div>
        )}
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold ${availability.bookable ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
        >
          {availability.bookable ? "Available" : "Unavailable"}
        </span>
      </div>
      <div className="p-4">
        <h2 className="font-display text-xl font-bold">{trip.title}</h2>
        <p className="mt-2 flex items-center gap-1 text-xs text-[#807269]">
          <MapPin className="h-3.5 w-3.5" /> {trip.destination.name}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#807269]">
          <span>{trip.category.name}</span>
          <span>·</span>
          <span>{trip.provider?.name || "Nepal Yatra"}</span>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-[#eee7e1] pt-4">
          <span className="inline-flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />{" "}
            {Number(trip.rating).toFixed(1)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs">
            <Clock3 className="h-3.5 w-3.5" /> {trip.duration} days
          </span>
          <strong className="text-[#a62922]">
            {trip.currency} {Number(trip.price).toLocaleString()}
          </strong>
        </div>
      </div>
    </Link>
  );
}
