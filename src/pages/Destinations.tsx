import {
  ArrowRight,
  ChevronDown,
  Compass,
  Heart,
  MapPin,
  Search,
  Star,
} from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { getApiError } from "../api/axios";
import Pagination from "../components/Pagination";
import { EmptyState, ErrorState, LoadingSpinner } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { categoryService, type Category } from "../services/categoryService";
import {
  destinationService,
  mediaUrl,
  type Destination,
} from "../services/destinationService";
import { favoriteService } from "../services/favoriteService";

export default function Destinations() {
  const { token } = useAuth();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [favoriteLoading, setFavoriteLoading] = useState<number | null>(null);
  useEffect(() => {
    categoryService
      .publicList({ page: 0, size: 100, sortBy: "name", sortDir: "asc" })
      .then((response) => setCategories(response.data.data?.content ?? []))
      .catch(() => setCategories([]));
  }, []);
  useEffect(() => {
    if (!token) {
      setFavoriteIds(new Set());
      return;
    }
    favoriteService
      .list({ page: 0, size: 100 })
      .then((response) =>
        setFavoriteIds(
          new Set(
            (response.data.data?.content ?? []).map(
              (item) => item.destination.id,
            ),
          ),
        ),
      )
      .catch(() => undefined);
  }, [token]);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await destinationService.search({
        keyword: search || undefined,
        categoryId: categoryId || undefined,
        page,
        size: 9,
        sortBy: "rating",
        sortDir: "desc",
      });
      setDestinations(response.data.data?.content ?? []);
      setTotalPages(response.data.data?.totalPages ?? 0);
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, [categoryId, page, search]);
  useEffect(() => {
    void load();
  }, [load]);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setPage(0);
    setSearch(keyword.trim());
  };
  const toggleFavorite = async (id: number) => {
    if (!token) return;
    const active = favoriteIds.has(id);
    setFavoriteLoading(id);
    try {
      if (active) await favoriteService.remove(id);
      else await favoriteService.add(id);
      setFavoriteIds((current) => {
        const next = new Set(current);
        if (active) next.delete(id);
        else next.add(id);
        return next;
      });
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setFavoriteLoading(null);
    }
  };
  return (
    <main className="min-h-screen bg-[#f6f1e9]">
      <header className="bg-[#251c17] px-5 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#e3a49e]">
            <Compass className="h-4 w-4" /> Across Nepal
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-bold sm:text-6xl">
            Places worth making the journey for.
          </h1>
          <p className="mt-5 max-w-xl leading-7 text-[#d4c8c0]">
            Discover active destinations, local context, and published trips
            available in each place.
          </p>
          <form
            onSubmit={submit}
            className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-[1fr_220px_auto]"
          >
            <div className="flex rounded-lg bg-white text-[#241f1a]">
              <Search className="ml-4 mt-3.5 h-5 w-5 text-gray-400" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search destinations"
                className="min-w-0 flex-1 px-3 py-3 outline-none"
              />
            </div>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(Number(event.target.value));
                  setPage(0);
                }}
                className="w-full appearance-none rounded-lg bg-white py-3 pl-3 pr-12 text-sm text-[#241f1a]"
              >
                <option value={0}>All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1D78AF]"
              />
            </div>
            <button className="rounded-lg bg-[#a62922] px-6 py-3 text-sm font-bold text-white">
              Search
            </button>
          </form>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-5 py-12">
        {loading ? (
          <div className="grid min-h-52 place-items-center">
            <LoadingSpinner label="Loading destinations" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => void load()} />
        ) : destinations.length === 0 ? (
          <EmptyState
            title="No destinations found"
            description="No active destinations match the current search."
          />
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {destinations.map((destination) => (
                <article
                  key={destination.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_28px_rgba(52,40,32,0.08)]"
                >
                  <div className="relative">
                    <Link
                      to={`/destinations/${destination.slug}`}
                      className="block h-64 overflow-hidden bg-[#ded4ca]"
                    >
                      {(destination.featuredImage ||
                        destination.coverImage) && (
                        <img
                          src={mediaUrl(
                            destination.featuredImage || destination.coverImage,
                          )}
                          alt={destination.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </Link>
                    {token && (
                      <button
                        type="button"
                        disabled={favoriteLoading === destination.id}
                        onClick={() => void toggleFavorite(destination.id)}
                        aria-label={
                          favoriteIds.has(destination.id)
                            ? "Remove from favorites"
                            : "Save to favorites"
                        }
                        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-[#a62922] shadow-sm disabled:opacity-50"
                      >
                        <Heart
                          size={18}
                          className={
                            favoriteIds.has(destination.id)
                              ? "fill-[#a62922]"
                              : ""
                          }
                        />
                      </button>
                    )}
                  </div>
                  <Link
                    to={`/destinations/${destination.slug}`}
                    className="block p-5"
                  >
                    <p className="text-xs font-bold uppercase tracking-widest text-[#a62922]">
                      {destination.category?.name}
                    </p>
                    <h2 className="mt-2 font-display text-2xl font-bold">
                      {destination.name}
                    </h2>
                    <p className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" /> {destination.location}
                    </p>
                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#675b52]">
                      {destination.shortDescription}
                    </p>
                    <div className="mt-5 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />{" "}
                        {Number(destination.rating).toFixed(1)}
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-[#a62922]">
                        Explore <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
            <Pagination
              page={page + 1}
              totalPages={totalPages}
              onPageChange={(nextPage) => setPage(nextPage - 1)}
            />
          </>
        )}
      </section>
    </main>
  );
}
