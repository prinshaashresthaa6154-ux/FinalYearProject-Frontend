import {
  ArrowLeft,
  ArrowRight,
  Award,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Globe2,
  LoaderCircle,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router";
import { APP_ROLES, normalizeRole } from "../auth/roles";
import { getApiError } from "../api/axios";
import { Button, EmptyState, ErrorState, Input, Modal, Textarea } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import {
  mediaUrl,
} from "../services/destinationService";
import {
  guideService,
  type GuideDestination,
  type GuideProfile as GuideProfileType,
} from "../services/guideService";
import type { TripReview } from "../services/reviewService";
import { groupService, type StandaloneGroupTrip } from "../services/groupService";
import {
  guideBookingService,
  validateDirectGuideBooking,
  type DirectGuideBookingInput,
  type GuideServiceReview,
} from "../services/guideBookingService";

const today = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

export default function GuideProfile() {
  const { id = "" } = useParams();
  const { userDTO } = useAuth();
  const [guide, setGuide] = useState<GuideProfileType | null>(null);
  const [reviews, setReviews] = useState<TripReview[]>([]);
  const [serviceReviews, setServiceReviews] = useState<GuideServiceReview[]>([]);
  const [trips, setTrips] = useState<StandaloneGroupTrip[]>([]);
  const [bookingDestinations, setBookingDestinations] = useState<GuideDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestOpen, setRequestOpen] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [requestNotice, setRequestNotice] = useState("");
  const [requestError, setRequestError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [request, setRequest] = useState<Omit<DirectGuideBookingInput, "guideId">>({
    destinationId: 0,
    startDate: "",
    endDate: "",
    participants: 1,
    message: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const guideResponse = await guideService.get(Number(id));
      const found = guideResponse.data.data;
      if (!found) throw new Error("Guide not found");
      setGuide(found);

       const [reviewResult, serviceReviewResult, tripResult] = await Promise.allSettled([
          guideService.reviews(found.id),
          guideService.serviceReviews(found.id),
         groupService.list({
           guideId: found.id,
           page: 0,
            size: 6,
           sortBy: "date",
           sortDir: "asc",
          }),
        ]);
      setReviews(
        reviewResult.status === "fulfilled"
          ? reviewResult.value.data.data?.content ?? []
          : [],
      );
      setServiceReviews(
        serviceReviewResult.status === "fulfilled"
          ? serviceReviewResult.value.data.data?.content ?? []
          : [],
      );
       setTrips(
        tripResult.status === "fulfilled"
          ? tripResult.value.data.data?.content ?? []
           : [],
       );
       setBookingDestinations(found.destinations);
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const openRequest = () => {
    if (!guide) return;
    setRequest({
      destinationId: bookingDestinations[0]?.id ?? guide.destinations[0]?.id ?? 0,
      startDate: "",
      endDate: "",
      participants: 1,
      message: "",
    });
    setFieldErrors({});
    setRequestError("");
    setRequestOpen(true);
  };

  const submitRequest = async (event: FormEvent) => {
    event.preventDefault();
    if (!guide) return;
    const input = { ...request, guideId: guide.id };
    const validationErrors = validateDirectGuideBooking(input);
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;
    setRequesting(true);
    setRequestError("");
    try {
      const response = await guideBookingService.createDirect(input);
      setRequestNotice(response.data.message || "Guide booking request submitted.");
      setRequestOpen(false);
    } catch (requestFailure) {
      const details = getApiError(requestFailure);
      setFieldErrors(details.validationErrors);
      setRequestError(details.message);
    } finally {
      setRequesting(false);
    }
  };

  if (loading)
    return (
      <main className="grid min-h-[70vh] place-items-center bg-[#f6f1e9]">
        <LoaderCircle className="h-8 w-8 animate-spin text-[#a62922]" />
      </main>
    );
  if (error || !guide)
    return (
      <main className="min-h-[70vh] bg-[#f6f1e9] px-5 py-14">
        <div className="mx-auto max-w-3xl">
          <ErrorState
            message={error || "Guide not found"}
            onRetry={() => void load()}
          />
        </div>
      </main>
    );

  const guideTrips = trips.filter((item) => item.guide.id === guide.userId);
  const dailyRate = Number.isFinite(Number(guide.dailyRate)) ? Number(guide.dailyRate) : 0;
  const rateCurrency = guide.rateCurrency || "NPR";
  const role = normalizeRole(userDTO?.role);
  const canRequest = role === APP_ROLES.USER || role === APP_ROLES.SUPERADMIN;

  return (
    <main className="min-h-screen bg-[#f6f1e9]">
      <header className="bg-[#251c17] px-5 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/guides"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/80"
          >
            <ArrowLeft className="h-4 w-4" /> All guides
          </Link>
          <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="h-32 w-32 overflow-hidden rounded-full bg-white/10">
              {guide.profileImage ? (
                <img
                  src={mediaUrl(guide.profileImage)}
                  alt={guide.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center">
                  <BriefcaseBusiness className="h-10 w-10" />
                </div>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-4xl font-bold sm:text-5xl">
                  {guide.name}
                </h1>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${guide.availability ? "bg-green-500/20 text-green-200" : "bg-white/10 text-white/70"}`}
                >
                  {guide.availability ? "Available" : "Unavailable"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-5 text-sm text-white/80">
                <span className="inline-flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                 {Number(guide.rating).toFixed(1)} · {serviceReviews.length + reviews.length} reviews
                </span>
                <span className="inline-flex items-center gap-2">
                  <Award className="h-4 w-4" /> {guide.experience} years
                  experience
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-12">
        {requestNotice && (
          <p role="status" className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
            {requestNotice} You can track it under My guide bookings.
          </p>
        )}
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-10">
            <section>
              <p className="text-xs font-bold uppercase tracking-widest text-[#a62922]">
                Profile
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold">
                About {guide.name}
              </h2>
              <p className="mt-4 whitespace-pre-line leading-8 text-[#675b52]">
                {guide.bio}
              </p>
            </section>
            <TagSection title="Specializations" items={guide.specialization} />
            <TagSection title="Languages" items={guide.languages} />
            <section>
              <h2 className="font-display text-2xl font-bold">
                Destination expertise
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {guide.destinations.map((destination) => (
                  <Link
                    key={destination.id}
                    to={`/destinations/${destination.slug}`}
                    className="flex items-center gap-3 rounded-xl border border-[#ded4c8] bg-white p-4"
                  >
                    <MapPin className="h-5 w-5 text-[#a62922]" />
                    <span>
                      <b>{destination.name}</b>
                      <small className="block text-[#897b70]">
                        {destination.district}, {destination.province}
                      </small>
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            <section id="guide-trips">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#a62922]">
                    Created by this guide
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold">
                    Guide-led trips
                  </h2>
                </div>
                {guideTrips.length > 0 && (
                  <Link to={`/grouptrips?guideId=${guide.id}`} className="text-sm font-bold text-[#a62922]">
                    Explore group trips
                  </Link>
                )}
              </div>
              {guideTrips.length === 0 ? (
                <div className="mt-4">
                  <EmptyState title="No guide-created trips yet" description="This guide has not published an upcoming group trip." />
                </div>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {guideTrips.map((item) => (
                    <article key={item.id} className="rounded-xl border border-[#ded4c8] bg-white p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-xl font-bold">{item.tripName}</h3>
                        <span className="rounded-full bg-[#f5e6e3] px-2.5 py-1 text-xs font-bold text-[#a62922]">{item.status}</span>
                      </div>
                      <p className="mt-2 inline-flex items-center gap-2 text-sm text-[#675b52]"><MapPin className="h-4 w-4" /> {item.destination.name}</p>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#675b52]">
                        <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {item.date}</span>
                        <span className="inline-flex items-center gap-2"><Users className="h-4 w-4" /> {item.availableSeats} places</span>
                      </div>
                      <div className="mt-5 flex items-end justify-between gap-3">
                        <strong className="text-[#a62922]">NPR {Number(item.price).toLocaleString()}</strong>
                        <Link to="/grouptrips" className="inline-flex items-center gap-1 text-sm font-bold text-[#a62922]">View trip <ArrowRight className="h-4 w-4" /></Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <TagSection title="Certifications" items={guide.certifications} />
            <section>
              <h2 className="font-display text-2xl font-bold">Guide service reviews</h2>
              <p className="mt-1 text-sm text-[#897b70]">Reviews from travelers after completed direct guide bookings.</p>
              <div className="mt-4 space-y-4">
                {serviceReviews.length === 0 ? <EmptyState title="No guide reviews yet" description="Travelers can review this guide after a completed service." /> : serviceReviews.map((review) => <article key={review.id} className="rounded-xl border border-[#ded4c8] bg-white p-5"><div className="flex justify-between gap-4"><b>{review.title}</b><span className="text-amber-600">{review.rating}/5</span></div><p className="mt-2 text-sm leading-6 text-[#675b52]">{review.comment}</p><p className="mt-3 text-xs text-[#897b70]">{review.reviewer.name}</p></article>)}
              </div>
            </section>
            <section>
              <h2 className="font-display text-2xl font-bold">
                Traveler reviews
              </h2>
              <div className="mt-4 space-y-4">
                {reviews.length === 0 ? (
                  <EmptyState
                    title="No reviews yet"
                    description="Published traveler reviews will appear here."
                  />
                ) : (
                  reviews.map((review) => (
                    <article
                      key={review.id}
                      className="rounded-xl border border-[#ded4c8] bg-white p-5"
                    >
                      <div className="flex justify-between gap-4">
                        <b>{review.title}</b>
                        <span className="text-amber-600">
                          {review.rating}/5
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#675b52]">
                        {review.comment}
                      </p>
                      <p className="mt-3 text-xs text-[#897b70]">
                        {review.reviewer.name} · {review.trip.title}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-2xl bg-[#251c17] p-6 text-white lg:sticky lg:top-24">
            <Globe2 className="h-8 w-8 text-[#e3a49e]" />
            <h2 className="mt-4 font-display text-2xl font-bold">
              Book {guide.name}
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/70">
              {!guide.availability
                ? "This guide is not accepting assignments right now."
                : dailyRate > 0
                  ? `Request an independent guide from ${rateCurrency} ${dailyRate.toLocaleString()} per day.`
                  : "This guide has not configured a daily service rate yet."}
            </p>
            <div className="mt-5 rounded-xl border border-white/15 bg-white/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-white/60">Daily service rate</p>
              <p className="mt-1 font-display text-2xl font-bold">{dailyRate > 0 ? `${rateCurrency} ${dailyRate.toLocaleString()}` : "Not configured"}</p>
              <p className="mt-1 text-xs text-white/60">Final total and platform commission are fixed when the guide accepts.</p>
            </div>
             {guide.availability && canRequest && dailyRate > 0 ? (
               <Button type="button" onClick={openRequest} className="mt-6 w-full">
                 Request this guide <ArrowRight className="h-4 w-4" />
               </Button>
             ) : !userDTO ? (
               <Link to="/login" className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[#a62922] px-4 py-3 text-sm font-bold text-white">
                 Sign in to request
               </Link>
             ) : (
               <button
                type="button"
                disabled
                className="mt-6 w-full cursor-not-allowed rounded-lg bg-white/10 px-4 py-3 text-sm font-bold text-white/50"
              >
                  {guide.availability && dailyRate <= 0 ? "Fare not configured" : guide.availability ? "Traveler account required" : "Booking unavailable"}
               </button>
             )}
            <div className="mt-5 flex items-center gap-2 text-sm font-bold">
              <Check className="h-4 w-4 text-green-300" /> Profile reviewed by
              the platform
            </div>
          </aside>
        </div>
      </div>
      <Modal open={requestOpen} onClose={() => !requesting && setRequestOpen(false)} title={`Request ${guide.name}`} size="lg">
        <form onSubmit={submitRequest} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#27323b]">Destination</span>
            <select value={request.destinationId || ""} onChange={(event) => setRequest((current) => ({ ...current, destinationId: Number(event.target.value) }))} className={`min-h-11 w-full rounded-lg border bg-white px-3 py-2.5 text-sm ${fieldErrors.destinationId ? "border-red-500" : "border-[#dfe4e8]"}`} required>
              <option value="">Select destination</option>
              {(bookingDestinations.length ? bookingDestinations : guide.destinations).map((destination) => <option key={destination.id} value={destination.id}>{destination.name}</option>)}
            </select>
            {fieldErrors.destinationId && <span className="text-xs text-red-700">{fieldErrors.destinationId}</span>}
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Start date" type="date" min={today()} value={request.startDate} onChange={(event) => setRequest((current) => ({ ...current, startDate: event.target.value }))} error={fieldErrors.startDate} required />
            <Input label="End date" type="date" min={request.startDate || today()} value={request.endDate} onChange={(event) => setRequest((current) => ({ ...current, endDate: event.target.value }))} error={fieldErrors.endDate} required />
          </div>
          <Input label="Participants" type="number" min={1} max={100} value={request.participants} onChange={(event) => setRequest((current) => ({ ...current, participants: Number(event.target.value) }))} error={fieldErrors.participants} required />
          {request.startDate && request.endDate && request.endDate >= request.startDate && (
            <div className="rounded-xl bg-[#f6f1e9] p-4 text-sm text-[#4f4741]">
              <div className="flex justify-between gap-4"><span>Daily rate</span><b>{rateCurrency} {dailyRate.toLocaleString()}</b></div>
              <div className="mt-2 flex justify-between gap-4"><span>Estimated service total</span><b>{rateCurrency} {(dailyRate * (Math.round((new Date(`${request.endDate}T00:00:00`).getTime() - new Date(`${request.startDate}T00:00:00`).getTime()) / 86_400_000) + 1)).toLocaleString()}</b></div>
              <p className="mt-2 text-xs text-[#75695f]">Inclusive day count. The accepted quote includes the platform commission split.</p>
            </div>
          )}
          <Textarea label="Message (optional)" maxLength={2000} value={request.message} onChange={(event) => setRequest((current) => ({ ...current, message: event.target.value }))} error={fieldErrors.message} placeholder="Describe your itinerary, language needs, or other requirements." />
          {requestError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{requestError}</p>}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" disabled={requesting} onClick={() => setRequestOpen(false)}>Cancel</Button>
            <Button type="submit" loading={requesting}>Submit request</Button>
          </div>
        </form>
      </Modal>
    </main>
  );
}

function TagSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-[#d8cec0] bg-white px-4 py-2 text-sm"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
