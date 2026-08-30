import {
  CalendarDays,
  ChevronRight,
  LoaderCircle,
  MessageSquare,
  Star,
} from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { getApiError } from "../api/axios";
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  Textarea,
} from "../components/ui";
import {
  bookingService,
  canCancelBooking,
  isBookingPaymentConfirmed,
  type Booking,
  type BookingStatus,
} from "../services/bookingService";
import { reviewService, type TripReview } from "../services/reviewService";
import { tripService } from "../services/tripService";
import { getOrCreateBookingConversation } from "../services/chatService";
import { RatingInput, Stars } from "./UserReviews";

const tabs: Array<{ label: string; statuses?: BookingStatus[] }> = [
  { label: "Upcoming", statuses: ["CONFIRMED"] },
  { label: "Pending", statuses: ["PENDING"] },
  { label: "Completed", statuses: ["COMPLETED"] },
  { label: "Cancelled", statuses: ["CANCELLED", "REJECTED"] },
];

export default function UserBookings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [active, setActive] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviewsByBooking, setReviewsByBooking] = useState<
    Record<number, TripReview>
  >({});
  const [providerNames, setProviderNames] = useState<Record<number, string>>(
    {},
  );
  const [reviewing, setReviewing] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeKind, setNoticeKind] = useState<"success" | "warning">(
    "success",
  );
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [chattingId, setChattingId] = useState<number | null>(null);

  useEffect(() => {
    const paymentResult = searchParams.get("payment")?.trim().toLowerCase();
    const returnedBookingId = Number(searchParams.get("bookingId") || 0);
    if (!paymentResult) return;

    let cancelled = false;
    const handlePaymentReturn = async () => {
      if (paymentResult === "success" && returnedBookingId > 0) {
        try {
          const [bookingResponse, paymentResponse] = await Promise.all([
            bookingService.getBooking(returnedBookingId),
            bookingService
              .getBookingPayment(returnedBookingId)
              .catch(() => null),
          ]);
          const booking = bookingResponse.data.data;
          if (cancelled) return;
          if (!booking)
            throw new Error("The returned booking could not be found.");
          const tabIndex = tabs.findIndex((tab) =>
            tab.statuses?.includes(booking.status),
          );
          if (tabIndex >= 0) setActive(tabIndex);
          setNoticeKind(
            isBookingPaymentConfirmed(booking) ? "success" : "warning",
          );
          setNotice(
            isBookingPaymentConfirmed(booking)
              ? `Payment confirmed for ${booking.bookingReference}. Your booking is confirmed.`
              : booking.status === "CANCELLED"
                ? booking.paymentStatus === "PAID"
                  ? `Booking ${booking.bookingReference} was cancelled. Payment remains PAID because no refund workflow is implemented.`
                  : `Booking ${booking.bookingReference} was cancelled and remains in your travel record.`
                : `Payment was returned for ${booking.bookingReference}. The backend is still confirming its status.`,
          );
          if (
            paymentResponse?.data.data &&
            paymentResponse.data.data.paymentStatus !== booking.paymentStatus
          ) {
            setNoticeKind("warning");
            setNotice(
              `Payment attempt ${paymentResponse.data.data.paymentStatus.toLowerCase()}; waiting for the backend booking state to settle.`,
            );
          }
        } catch (requestError) {
          if (!cancelled) setError(getApiError(requestError).message);
        }
      } else if (paymentResult === "cancelled") {
        setNoticeKind("warning");
        setNotice(
          "eSewa payment was cancelled or failed. Your booking was not marked as paid.",
        );
      }
      if (!cancelled) setSearchParams({}, { replace: true });
    };

    void handlePaymentReturn();
    return () => {
      cancelled = true;
    };
  }, [searchParams, setSearchParams]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const status = tabs[active].statuses?.[0];
      const [bookingResponse, reviewResponse] = await Promise.all([
        bookingService.listBookings(status),
        active === 2 ? reviewService.mine() : Promise.resolve(null),
      ]);
      const rows = bookingResponse.data.data?.content ?? [];
      const visibleRows =
        active === 3
          ? rows.filter(
              (booking) =>
                booking.status === "CANCELLED" || booking.status === "REJECTED",
            )
          : rows;
      setBookings(visibleRows);

      if (active === 2) {
        const ownReviews = reviewResponse?.data.data?.content ?? [];
        setReviewsByBooking(
          Object.fromEntries(
            ownReviews.map((review) => [review.bookingId, review]),
          ),
        );
        const providerEntries = await Promise.all(
          visibleRows.map(async (booking) => {
            if (booking.travelPackage.provider?.name)
              return [
                booking.travelPackage.id,
                booking.travelPackage.provider.name,
              ] as const;
            try {
              const trip = (
                await tripService.publicById(booking.travelPackage.id)
              ).data.data;
              return [
                booking.travelPackage.id,
                trip?.provider?.name || booking.travelPackage.title,
              ] as const;
            } catch {
              return [
                booking.travelPackage.id,
                booking.travelPackage.title,
              ] as const;
            }
          }),
        );
        setProviderNames(Object.fromEntries(providerEntries));
      }
    } catch (e) {
      const details = getApiError(e);
      const fieldErrors = Object.entries(details.validationErrors)
        .map(([field, message]) => `${field}: ${message}`)
        .join(" ");
      setError(
        fieldErrors ||
          (details.status
            ? `${details.message} (HTTP ${details.status})`
            : details.message),
      );
    } finally {
      setLoading(false);
    }
  }, [active]);

  useEffect(() => {
    void load();
  }, [load]);

  const companyName = (booking: Booking) =>
    booking.travelPackage.provider?.name ||
    providerNames[booking.travelPackage.id] ||
    booking.travelPackage.title;

  const openReview = (booking: Booking) => {
    if (booking.status !== "COMPLETED" || reviewsByBooking[booking.bookingId])
      return;
    setReviewing(booking);
    setRating(5);
    setReviewTitle("");
    setComment("");
    setError("");
  };

  const submitReview = async (event: FormEvent) => {
    event.preventDefault();
    if (
      !reviewing ||
      reviewing.status !== "COMPLETED" ||
      reviewsByBooking[reviewing.bookingId]
    )
      return;
    setSaving(true);
    setError("");
    try {
      const booking = {
        ...reviewing,
        travelPackage: {
          ...reviewing.travelPackage,
          provider: reviewing.travelPackage.provider || {
            name: companyName(reviewing),
          },
        },
      };
      const response = await reviewService.createForBooking(booking, {
        rating,
        title: reviewTitle,
        comment,
      });
      if (!response.data.success) {
        throw new Error(
          response.data.message || "The review could not be submitted.",
        );
      }
      setReviewing(null);
      setNotice(
        `Your review for ${companyName(reviewing)} was submitted for moderation.`,
      );
      await load();
    } catch (e) {
      setError(getApiError(e).message);
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (booking: Booking) => {
    if (!canCancelBooking(booking)) return;
    if (!window.confirm(`Cancel booking ${booking.bookingReference}?`)) return;
    setCancellingId(booking.bookingId);
    setError("");
    try {
      const response = await bookingService.cancelBooking(booking.bookingId);
      if (!response.data.success) {
        throw new Error(
          response.data.message || "The booking could not be cancelled.",
        );
      }
      const result = response.data.data;
      if (!result || result.status !== "CANCELLED") {
        throw new Error("The backend did not return a cancelled booking.");
      }
      setBookings((current) =>
        current.filter((item) => item.bookingId !== booking.bookingId),
      );
      setNoticeKind("success");
      setNotice(
        `${response.data.message || `${booking.bookingReference} was cancelled.`} Reserved seats were released by the backend.`,
      );
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setCancellingId(null);
    }
  };

  const openChat = async (booking: Booking) => {
    if (!isBookingPaymentConfirmed(booking)) return;
    setChattingId(booking.bookingId);
    setError("");
    try {
      const conversation = await getOrCreateBookingConversation(booking);
      window.location.assign(`/user/messages?conversationId=${conversation.id}`);
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setChattingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f1e9] px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase tracking-widest text-[#a62922]">
          Your travel record
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold">My bookings</h1>
        {notice && (
          <p
            role="status"
            className={`mt-6 rounded-lg px-4 py-3 text-sm ${noticeKind === "success" ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-900"}`}
          >
            {notice}
          </p>
        )}
        <div className="mt-8 flex gap-2 overflow-x-auto border-b border-[#d8cec0]">
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActive(index)}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-bold ${active === index ? "border-[#a62922] text-[#a62922]" : "border-transparent text-[#897b70]"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {error && !reviewing ? (
          <div className="mt-8">
            <ErrorState message={error} onRetry={() => void load()} />
          </div>
        ) : loading ? (
          <div className="grid min-h-48 place-items-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-[#a62922]" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title={`No ${tabs[active].label.toLowerCase()} bookings`}
              description="Bookings created through the checkout flow will appear here."
            />
          </div>
        ) : (
          <div className="mt-7 space-y-4">
            {bookings.map((booking) => {
              const review = reviewsByBooking[booking.bookingId];
              return (
                <article
                  key={booking.bookingId}
                  className="rounded-2xl border border-[#eae3dc] bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#897b70]">
                        {booking.bookingReference}
                      </p>
                      <h2 className="mt-1 font-display text-xl font-bold">
                        {booking.travelPackage.title}
                      </h2>
                      <p className="mt-2 flex items-center gap-2 text-sm text-[#75695f]">
                        <CalendarDays className="h-4 w-4" /> Booked{" "}
                        {new Intl.DateTimeFormat("en", {
                          dateStyle: "medium",
                        }).format(new Date(booking.bookingDate))}
                      </p>
                      <p className="mt-1 text-sm text-[#75695f]">
                        {booking.numberOfPeople || booking.participants}{" "}
                        travelers · {booking.currency}{" "}
                        {Number(booking.totalAmount).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-[#f5e6e3] px-3 py-1 text-xs font-bold text-[#a62922]">
                        {booking.status}
                      </span>
                      <Link
                        to={`/booking/${booking.bookingId}`}
                        className="inline-flex items-center gap-1 text-sm font-bold text-[#a62922]"
                      >
                        Details <ChevronRight className="h-4 w-4" />
                      </Link>
                      {canCancelBooking(booking) && (
                        <button
                          type="button"
                          onClick={() => void cancel(booking)}
                          disabled={cancellingId === booking.bookingId}
                          className="rounded-lg border border-red-300 px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-50"
                        >
                          {cancellingId === booking.bookingId
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      )}
                      {isBookingPaymentConfirmed(booking) && (
                        <button type="button" onClick={() => void openChat(booking)} disabled={chattingId === booking.bookingId} className="inline-flex items-center gap-1 rounded-lg border border-[#a62922] px-3 py-2 text-xs font-bold text-[#a62922] hover:bg-[#fff7f5] disabled:opacity-50">
                          <MessageSquare className="h-4 w-4" /> {chattingId === booking.bookingId ? "Opening..." : "Chat admin"}
                        </button>
                      )}
                    </div>
                  </div>
                  {booking.status === "COMPLETED" && (
                    <div className="mt-5 flex flex-col gap-4 border-t border-[#eee7e1] pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-display text-lg font-bold">
                          How was your experience with {companyName(booking)}?
                        </p>
                        <p className="mt-1 text-sm text-[#75695f]">
                          Your feedback helps this company and future travelers.
                        </p>
                      </div>
                      {review ? (
                        <Link
                          to="/user/reviews"
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#d8cec0] px-4 py-2.5 text-sm font-bold text-[#40382f] hover:bg-[#fcfaf7]"
                        >
                          <Stars value={review.rating} /> View Review
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openReview(booking)}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#a62922] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#85211c]"
                        >
                          <MessageSquare className="h-4 w-4" /> Write a Review
                        </button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={reviewing !== null}
        onClose={() => !saving && setReviewing(null)}
        title="Write a Review"
      >
        {reviewing && (
          <form onSubmit={submitReview}>
            <p className="text-xs font-bold uppercase tracking-widest text-[#a62922]">
              Completed booking verified
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold">
              How was your experience with {companyName(reviewing)}?
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#75695f]">
              This review is linked to booking {reviewing.bookingReference}. The
              company cannot be changed.
            </p>
            <div className="mt-5 space-y-5">
              <RatingInput value={rating} onChange={setRating} />
              <Input
                label="Review title"
                value={reviewTitle}
                onChange={(event) => setReviewTitle(event.target.value)}
                placeholder="Excellent experience"
                required
              />
              <Textarea
                label="Your review"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={2000}
                rows={5}
                required
              />
            </div>
            {error && (
              <p
                role="alert"
                className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                disabled={saving}
                onClick={() => setReviewing(null)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                <Star className="h-4 w-4" /> Submit Review
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </main>
  );
}
