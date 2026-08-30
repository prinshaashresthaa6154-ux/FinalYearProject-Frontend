import {
  ArrowLeft,
  Check,
  Clock3,
  MapPin,
  X,
  Star,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { getApiError } from "../api/axios";
import { EmptyState, ErrorState, LoadingSpinner } from "../components/ui";
import { mediaUrl } from "../services/destinationService";
import RecommendationTrips from "../components/RecommendationTrips";
import { recommendationService } from "../services/recommendationService";
import { useAuth } from "../context/AuthContext";
import { APP_ROLES, canCreateBooking, normalizeRole } from "../auth/roles";
import {
  tripService,
  type SimilarTrip,
  type Trip,
  type TripRating,
  type TripReview,
  decodeItineraryDay,
  getTripBookability,
} from "../services/tripService";

export default function TripPage({ preview = false }: { preview?: boolean }) {
  const { slug = "" } = useParams();
  const { isAuthenticated, userDTO } = useAuth();
  const canUseCustomerActions = normalizeRole(userDTO?.role) === APP_ROLES.USER;
  const canBook = canCreateBooking(userDTO);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [reviews, setReviews] = useState<TripReview[]>([]);
  const [rating, setRating] = useState<TripRating | null>(null);
  const [similar, setSimilar] = useState<SimilarTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const recordedViewRef = useRef<number | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const identifier = slug.trim();
      const response =
        preview && /^\d+$/.test(identifier)
          ? await tripService.adminById(Number(identifier))
          : /^\d+$/.test(identifier)
            ? await tripService.publicById(Number(identifier))
            : await tripService.publicBySlug(identifier);
      const found = response.data.data;
      if (!found) throw new Error("Trip not found");
      setTrip(found);
      if (!preview && recordedViewRef.current !== found.id) {
        recordedViewRef.current = found.id;
        void recommendationService.recordView(found.id).catch(() => {
          recordedViewRef.current = null;
        });
      }
      const [reviewResponse, ratingResponse, similarResponse] =
        await Promise.allSettled([
          tripService.reviews(found.id),
          tripService.rating(found.id),
          tripService.similar(found.id),
        ]);
      if (reviewResponse.status === "fulfilled")
        setReviews(reviewResponse.value.data.data?.content ?? []);
      if (ratingResponse.status === "fulfilled")
        setRating(ratingResponse.value.data.data ?? null);
      if (similarResponse.status === "fulfilled")
        setSimilar(similarResponse.value.data.data?.content ?? []);
    } catch (e) {
      setError(getApiError(e).message);
    } finally {
      setLoading(false);
    }
  }, [preview, slug]);
  useEffect(() => {
    void load();
  }, [load]);
  if (loading)
    return (
      <main className="grid min-h-[70vh] place-items-center bg-[#f6f1e9]">
        <LoadingSpinner label="Loading trip" />
      </main>
    );
  if (error || !trip)
    return (
      <main className="min-h-[70vh] bg-[#f6f1e9] px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <ErrorState
            message={error || "Trip not found"}
            onRetry={() => void load()}
          />
        </div>
      </main>
    );
  const images = [trip.featuredImage, ...trip.gallery].filter(
    Boolean,
  ) as string[];
  const itinerary = trip.itinerary.map((item, index) =>
    decodeItineraryDay(item, index),
  );
  const availability = getTripBookability(trip);
  const bookable = availability.bookable;
  const availabilityMessage = availability.reason;
  return (
    <main className="min-h-screen bg-[#f6f1e9]">
      {preview && (
        <div className="bg-[#251c17] px-5 py-3 text-center text-sm font-semibold text-white">
          Preview mode · This page is not public until the trip is published.
        </div>
      )}
      <header className="relative min-h-[480px] overflow-hidden bg-[#251c17] text-white">
        {trip.featuredImage && (
          <img
            src={mediaUrl(trip.featuredImage)}
            alt={trip.title}
            className="absolute inset-0 h-full w-full object-cover opacity-55"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#211813] via-[#211813]/45 to-transparent" />
        <div className="relative mx-auto flex min-h-[480px] max-w-6xl flex-col justify-between px-5 py-10">
          <Link
            to={preview ? "/admin/trips" : "/destinations"}
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/85"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
              {trip.category.name}
            </span>
            <h1 className="mt-5 max-w-4xl font-display text-5xl font-bold sm:text-7xl">
              {trip.title}
            </h1>
            <p className="mt-4 flex flex-wrap gap-4 text-white/85">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {trip.destination.name}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4" /> {trip.duration} days
              </span>
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4" /> {trip.availableSeats} seats left
              </span>
            </p>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-12">
        <section className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#a62922]">
              The journey
            </p>
            <p className="mt-3 text-lg leading-8 text-[#675b52]">
              {trip.description}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Info
                label="Provider"
                value={trip.provider?.name || "Nepal Yatra"}
              />
              <Info
                label="Route"
                value={`${trip.startLocation} to ${trip.endLocation}`}
              />
              <Info label="Category" value={trip.category.name} />
              <Info label="Difficulty" value={trip.difficulty} />
              <Info
                label="Dates"
                value={`${trip.startDate || "Flexible"} - ${trip.endDate || "Flexible"}`}
              />
              <Info
                label="Booking window"
                value={`${trip.bookingStartDate || "Open"} - ${trip.bookingEndDate || "Open"}`}
              />
            </div>
          </div>
          <aside className="h-fit border-t-4 border-[#a62922] bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-[#897b70]">
              From
            </p>
            <p className="mt-1 font-display text-4xl font-bold text-[#a62922]">
              {trip.currency} {Number(trip.price).toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-[#75695f]">{availabilityMessage}</p>
            {!preview && (canUseCustomerActions || !isAuthenticated) && (
              <>
                <Link
                  to={
                    !isAuthenticated
                      ? "/login"
                      : canBook
                        ? "/checkout"
                        : userDTO?.emailVerified !== true
                          ? "/verify-account"
                          : "/user/dashboard"
                  }
                  state={
                    !isAuthenticated
                      ? {
                          from: { pathname: "/checkout", state: { trip } },
                          message: "Sign in to reserve your seats.",
                        }
                      : canBook
                        ? { trip }
                        : {
                            email: userDTO?.email,
                            role: userDTO?.role,
                            message:
                              userDTO?.emailVerified !== true
                                ? "Verify your email before creating a booking."
                                : "Your account must be active before creating a booking.",
                          }
                  }
                  className={`mt-6 inline-flex w-full justify-center rounded-lg px-4 py-3 text-sm font-bold text-white transition ${bookable ? "bg-[#a62922] hover:bg-[#8f211c]" : "pointer-events-none bg-gray-400"}`}
                >
                  {!bookable
                    ? availability.reason
                    : !isAuthenticated
                      ? "Sign in to book"
                      : canBook
                        ? "Book now"
                        : userDTO?.emailVerified !== true
                          ? "Verify email to book"
                          : "Account activation required"}
                </Link>
                {bookable && (
                  <p className="mt-3 text-center text-xs leading-5 text-[#75695f]">
                    Booking now immediately reserves your requested seats.
                  </p>
                )}
              </>
            )}
          </aside>
        </section>
        {images.length > 0 && (
          <section className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image, i) => (
              <img
                key={image}
                src={mediaUrl(image)}
                alt={`${trip.title} ${i + 1}`}
                className={`h-52 w-full rounded-lg object-cover ${i === 0 ? "sm:col-span-2 sm:h-80" : ""}`}
              />
            ))}
          </section>
        )}
        <section className="mt-16">
          <h2 className="font-display text-3xl font-bold">Itinerary</h2>
          <div className="mt-6 space-y-4">
            {itinerary.map((day, index) => (
              <div
                key={`${day.dayNumber}-${index}`}
                className="flex gap-4 rounded-xl bg-white p-5 shadow-sm"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f5e6e3] text-sm font-bold text-[#a62922]">
                  {day.dayNumber}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-xl font-bold">
                    {day.title}
                  </h3>
                  {day.description && (
                    <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#675b52]">
                      {day.description}
                    </p>
                  )}
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                    {day.activities && (
                      <ItineraryFact
                        label="Activities"
                        value={day.activities}
                      />
                    )}
                    {day.accommodation && (
                      <ItineraryFact
                        label="Accommodation"
                        value={day.accommodation}
                      />
                    )}
                    {day.meals && (
                      <ItineraryFact label="Meals" value={day.meals} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="mt-14 grid gap-8 md:grid-cols-3">
          <List
            title="Inclusions"
            items={trip.inclusions}
            variant="inclusion"
          />
          <List
            title="Exclusions"
            items={trip.exclusions}
            variant="exclusion"
          />
          <List title="Requirements" items={trip.requirements} />
        </section>
        <section className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#a62922]">
                Traveler feedback
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold">Reviews</h2>
            </div>
            {rating && (
              <p className="inline-flex items-center gap-2 text-sm font-bold">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />{" "}
                {Number(rating.averageRating).toFixed(1)} ·{" "}
                {rating.totalReviews} reviews
              </p>
            )}
          </div>
          {rating && (
            <div className="mt-6 grid gap-6 rounded-2xl border border-[#eae3dc] bg-white p-6 sm:grid-cols-[180px_1fr]">
              <div className="text-center sm:border-r sm:border-[#eee7e1]">
                <p className="font-display text-5xl font-bold">
                  {Number(rating.averageRating).toFixed(1)}
                </p>
                <p className="mt-2 text-sm text-[#75695f]">
                  {rating.totalReviews} total reviews
                </p>
              </div>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = rating.ratingDistribution[String(star)] ?? 0;
                  const percent = rating.totalReviews
                    ? (count / rating.totalReviews) * 100
                    : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 text-xs">
                      <span className="w-8">{star} star</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#eee7e1]">
                        <div
                          className="h-full bg-amber-400"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-7 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {reviews.length === 0 ? (
            <div className="mt-6">
              <EmptyState title="No published reviews yet" />
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {reviews.map((review) => (
                <article key={review.id} className="bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <b>{review.rating}/5</b>
                    <span className="text-sm text-gray-500">
                      {review.reviewer.name}
                    </span>
                  </div>
                  <h3 className="mt-3 font-bold">{review.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#675b52]">
                    {review.comment}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
        <section className="mt-16">
          <p className="text-xs font-bold uppercase tracking-widest text-[#a62922]">
            Continue discovering
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold">
            Similar Trips
          </h2>
          <p className="mt-3 text-sm text-[#75695f]">
            Selected by the backend from destination, category, and platform
            signals.
          </p>
          <div className="mt-7">
            <RecommendationTrips
              trips={similar}
              loading={false}
              emptyText="No similar trips are available yet."
            />
          </div>
        </section>
      </div>
    </main>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[#eee7e1] pb-3">
      <p className="text-xs font-bold uppercase tracking-wide text-[#897b70]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
function List({
  title,
  items,
  variant = "inclusion",
}: {
  title: string;
  items: string[];
  variant?: "inclusion" | "exclusion";
}) {
  const exclusion = variant === "exclusion";
  return (
    <div>
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-2 text-sm leading-6 text-[#675b52]"
          >
            {exclusion ? (
              <X className="mt-1 h-4 w-4 shrink-0 text-red-600" />
            ) : (
              <Check className="mt-1 h-4 w-4 shrink-0 text-[#47735b]" />
            )}{" "}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
function ItineraryFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#fcfaf7] p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-[#897b70]">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-line leading-6 text-[#675b52]">
        {value}
      </p>
    </div>
  );
}
