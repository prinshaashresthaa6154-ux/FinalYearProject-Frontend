import {
  Calendar,
  LoaderCircle,
  MapPin,
  Search,
  Star,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { getApiError } from "../api/axios";
import Pagination from "../components/Pagination";
import { Button, EmptyState, ErrorState, StatusBadge } from "../components/ui";
import {
  groupService,
  type GroupStatus,
  type StandaloneGroupTrip,
} from "../services/groupService";
import { useAuth } from "../context/AuthContext";
import { APP_ROLES, normalizeRole } from "../auth/roles";
import {
  destinationService,
  type Destination,
} from "../services/destinationService";
import { guideBookingService } from "../services/guideBookingService";

export default function GroupTrips() {
  const { userDTO } = useAuth();
  const [searchParams] = useSearchParams();
  const guideId = Number(searchParams.get("guideId")) || undefined;
  const [rows, setRows] = useState<StandaloneGroupTrip[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [status, setStatus] = useState<GroupStatus | "">("");
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<number | null>(null);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [joinedIds, setJoinedIds] = useState<Set<number>>(() => new Set());
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await groupService.list({
        keyword: search || undefined,
        destinationId: destinationId ? Number(destinationId) : undefined,
        guideId,
        status,
        page,
        size: 12,
        sortBy,
        sortDir,
      });
      setRows(response.data.data?.content ?? []);
      setPages(response.data.data?.totalPages ?? 0);
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, [destinationId, guideId, page, search, sortBy, sortDir, status]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    destinationService
      .publicList({ page: 0, size: 100, sortBy: "name", sortDir: "asc" })
      .then((response) => setDestinations(response.data.data?.content ?? []))
      .catch(() => setDestinations([]));
  }, []);
  useEffect(() => {
    if (normalizeRole(userDTO?.role) !== APP_ROLES.USER || rows.length === 0) {
      setJoinedIds(new Set());
      return;
    }

    let cancelled = false;
    guideBookingService.mine(0, 100).then((response) => {
      if (cancelled) return;
      setJoinedIds(
        new Set(
          (response.data.data?.content ?? [])
            .filter(
              (booking) =>
                booking.type === "GROUP_TRIP" &&
                booking.status === "CONFIRMED" &&
                booking.groupTrip?.id,
            )
            .map((booking) => booking.groupTrip!.id),
        ),
      );
    }).catch(() => {
      if (!cancelled) setJoinedIds(new Set());
    });

    return () => {
      cancelled = true;
    };
  }, [rows, userDTO?.role]);
  const apply = (event: FormEvent) => {
    event.preventDefault();
    setPage(0);
    setSearch(keyword.trim());
  };
  const join = async (id: number) => {
    setJoining(id);
    setError("");
    try {
      const response = await groupService.joinStandalone(id);
      if (!response.data.success)
        throw new Error(
          response.data.message || "Unable to join the group trip.",
        );
      setNotice(
        "You joined the group trip. Your confirmed guide booking and conversation are ready.",
      );
      setJoinedIds((current) => new Set(current).add(id));
      await load();
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setJoining(null);
    }
  };
  const leave = async (id: number) => {
    setLeaving(id);
    setError("");
    setNotice("");
    try {
      const response = await groupService.leaveStandalone(id);
      if (!response.data.success)
        throw new Error(
          response.data.message || "Unable to leave the group trip.",
        );
      setJoinedIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      setNotice(response.data.message || "You left the group trip.");
      await load();
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLeaving(null);
    }
  };
  const canParticipate = normalizeRole(userDTO?.role) === APP_ROLES.USER;
  return (
    <main className="min-h-screen bg-[#f7f3f0]">
      <header className="bg-black px-5 py-14 text-center text-white">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/70">
          Travel together
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold">Group Trips</h1>
        <p className="mx-auto mt-3 max-w-xl text-white/80">
          Join guide-led departures and explore Nepal with other travelers.
        </p>
      </header>
      <section className="mx-auto max-w-7xl px-5 py-9">
        <form
          onSubmit={apply}
          className="filter-surface grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-5"
        >
          <label className="relative sm:col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search group trips"
              className="field-control px-9 py-2.5"
            />
          </label>
          <select
            value={destinationId}
            onChange={(e) => {
              setDestinationId(e.target.value);
              setPage(0);
            }}
            className="field-control px-3 py-2.5"
          >
            <option value="">All destinations</option>
            {destinations.map((destination) => (
              <option key={destination.id} value={destination.id}>
                {destination.name}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as GroupStatus | "");
              setPage(0);
            }}
            className="field-control px-3 py-2.5"
          >
            <option value="">All statuses</option>
            {["OPEN", "CONFIRMED", "FULL", "CANCELLED", "COMPLETED"].map(
              (value) => (
                <option key={value}>{value}</option>
              ),
            )}
          </select>
          <Button type="submit">
            <Search className="h-4 w-4" /> Search
          </Button>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(0);
            }}
            className="field-control px-3 py-2.5"
          >
            {["date", "tripName", "price", "status", "createdAt"].map(
              (value) => (
                <option key={value}>{value}</option>
              ),
            )}
          </select>
          <select
            value={sortDir}
            onChange={(e) => {
              setSortDir(e.target.value as "asc" | "desc");
              setPage(0);
            }}
            className="field-control px-3 py-2.5"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </form>
        {notice && (
          <p className="mt-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
            {notice}
          </p>
        )}
        {error && (
          <div className="mt-6">
            <ErrorState message={error} onRetry={() => void load()} />
          </div>
        )}
        {loading ? (
          <div className="grid min-h-64 place-items-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-[#a51c1c]" />
          </div>
        ) : !error && rows.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No group trips found"
              description="Try changing the search filters."
            />
          </div>
        ) : (
          !error && (
            <>
              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {rows.map((trip) => (
                  <article
                    key={trip.id}
                    className="flex flex-col rounded-2xl border bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-display text-xl font-bold">
                          {trip.tripName}
                        </h2>
                        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3.5 w-3.5" />{" "}
                          {trip.destination.name}, {trip.destination.district}
                        </p>
                      </div>
                      <StatusBadge status={trip.status} />
                    </div>
                    <div className="mt-5 space-y-3 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />{" "}
                        {new Intl.DateTimeFormat("en", {
                          dateStyle: "medium",
                        }).format(new Date(trip.date))}
                      </p>
                      <p className="flex items-center gap-2">
                        <Users className="h-4 w-4" /> {trip.currentMembers}/
                        {trip.maximumMembers} travelers, minimum{" "}
                        {trip.minimumMembers}
                      </p>
                      <p className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />{" "}
                        {trip.guide.fullName} (
                        {trip.guide.rating == null
                          ? "Not rated"
                          : Number(trip.guide.rating).toFixed(1)}
                        )
                      </p>
                    </div>
                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full bg-[#a51c1c]"
                        style={{
                          width: `${Math.min(100, (trip.currentMembers / trip.maximumMembers) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="mt-6 flex items-end justify-between gap-3 border-t pt-4">
                      <p className="font-display text-xl font-bold text-[#a51c1c]">
                        NPR {Number(trip.price).toLocaleString()}
                      </p>
                      {!userDTO &&
                        trip.status === "OPEN" &&
                        trip.availableSeats > 0 && (
                          <Link
                            to="/login"
                            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#AF1D1D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#8f1717]"
                          >
                            Sign in to join
                          </Link>
                        )}
                      {canParticipate && joinedIds.has(trip.id) && (
                        <Button
                          type="button"
                          variant="secondary"
                          loading={leaving === trip.id}
                          disabled={
                            trip.status === "CANCELLED" ||
                            trip.status === "COMPLETED"
                          }
                          onClick={() => void leave(trip.id)}
                        >
                          <UserMinus className="h-4 w-4" /> Leave
                        </Button>
                      )}
                      {canParticipate &&
                        !joinedIds.has(trip.id) &&
                        trip.status === "OPEN" &&
                        trip.availableSeats > 0 && (
                        <Button
                          type="button"
                          loading={joining === trip.id}
                          onClick={() => void join(trip.id)}
                        >
                          <UserPlus className="h-4 w-4" /> Join
                        </Button>
                        )}
                    </div>
                  </article>
                ))}
              </div>
              <Pagination
                page={page + 1}
                totalPages={pages}
                onPageChange={(next) => setPage(next - 1)}
              />
            </>
          )
        )}
      </section>
    </main>
  );
}
