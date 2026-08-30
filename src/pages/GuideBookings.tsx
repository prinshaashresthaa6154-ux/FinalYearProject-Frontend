import { CalendarDays, LoaderCircle, MapPin, MessageCircle, Star, Users } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { getApiError } from "../api/axios";
import { Button, EmptyState, ErrorState, Input, Modal, StatusBadge, Textarea } from "../components/ui";
import {
  guideBookingService,
  type GuideBooking,
} from "../services/guideBookingService";

export default function GuideBookings() {
  const [bookings, setBookings] = useState<GuideBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reviewing, setReviewing] = useState<GuideBooking | null>(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await guideBookingService.mine(0, 100);
      setBookings(response.data.data?.content ?? []);
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const cancel = async (booking: GuideBooking) => {
    if (!window.confirm(`Cancel your request to ${booking.guide.name}?`)) return;
    setCancelling(booking.id);
    setError("");
    try {
      const response = await guideBookingService.cancel(booking.id);
      setNotice(response.data.message || "Guide booking cancelled.");
      await load();
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setCancelling(null);
    }
  };

  const submitReview = async (event: FormEvent) => {
    event.preventDefault();
    if (!reviewing) return;
    setSubmittingReview(true);
    setError("");
    try {
      const response = await guideBookingService.review(reviewing.id, { rating, title: title.trim(), comment: comment.trim() });
      setNotice(response.data.message || "Guide review submitted.");
      setReviewing(null);
      setTitle("");
      setComment("");
      setRating(5);
      await load();
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f1e9] px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase tracking-widest text-[#a62922]">Guide relationships</p>
        <h1 className="mt-2 font-display text-4xl font-bold">My guide bookings</h1>
        <p className="mt-3 text-sm text-[#75695f]">Direct requests and confirmed group-trip guide bookings.</p>
        {notice && <p className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p>}
        {error ? <div className="mt-8"><ErrorState message={error} onRetry={() => void load()} /></div> : loading ? (
          <div className="grid min-h-52 place-items-center"><LoaderCircle className="h-8 w-8 animate-spin text-[#a62922]" /></div>
        ) : bookings.length === 0 ? (
          <div className="mt-8"><EmptyState title="No guide bookings" description="Request an available guide or join a guide-led group trip." /></div>
        ) : (
          <div className="mt-8 space-y-4">
            {bookings.map((booking) => (
              <article key={booking.id} className="rounded-2xl border border-[#eae3dc] bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3"><h2 className="font-display text-2xl font-bold">{booking.guide.name}</h2><StatusBadge status={booking.status} /></div>
                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#a62922]">{booking.type === "DIRECT" ? "Direct request" : booking.groupTrip?.tripName ?? "Group trip"}</p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#75695f]">
                      {booking.destination && <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> {booking.destination.name}</span>}
                      {booking.startDate && <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {booking.startDate}{booking.endDate && ` to ${booking.endDate}`}</span>}
                      {booking.participants && <span className="inline-flex items-center gap-2"><Users className="h-4 w-4" /> {booking.participants} traveler(s)</span>}
                    </div>
                    {booking.rejectionReason && <p className="mt-3 text-sm text-red-700">Reason: {booking.rejectionReason}</p>}
                    {booking.totalAmount != null && <div className="mt-3 rounded-lg bg-[#faf7f4] p-3 text-sm"><p className="font-semibold">Accepted service total: {booking.currency} {Number(booking.totalAmount).toLocaleString()}</p><p className="mt-1 text-xs text-gray-500">{booking.billableDays} inclusive day(s) at {booking.currency} {Number(booking.dailyRate).toLocaleString()} per day · Payment {booking.paymentStatus}</p></div>}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {booking.status === "CONFIRMED" && booking.conversationId && <Link to={`/user/messages?conversationId=${booking.conversationId}`} className="inline-flex items-center gap-2 rounded-lg bg-[#a62922] px-4 py-2.5 text-sm font-bold text-white"><MessageCircle className="h-4 w-4" /> Message guide</Link>}
                    {booking.type === "DIRECT" && booking.status === "PENDING" && <Button variant="secondary" loading={cancelling === booking.id} onClick={() => void cancel(booking)}>Cancel request</Button>}
                    {booking.type === "GROUP_TRIP" && booking.status === "CONFIRMED" && <Link to="/grouptrips" className="rounded-lg border border-[#d8cec0] px-4 py-2.5 text-sm font-bold">Manage group trip</Link>}
                    {booking.type === "DIRECT" && booking.status === "COMPLETED" && !booking.reviewed && <Button onClick={() => setReviewing(booking)}><Star className="h-4 w-4" /> Review guide</Button>}
                    {booking.reviewed && <span className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2.5 text-sm font-bold text-green-700"><Star className="h-4 w-4" /> Reviewed</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <Modal open={reviewing !== null} onClose={() => !submittingReview && setReviewing(null)} title={`Review ${reviewing?.guide.name ?? "guide"}`}>
        <form onSubmit={submitReview} className="space-y-4">
          <label className="block space-y-1.5"><span className="text-sm font-semibold">Rating</span><select value={rating} onChange={(event) => setRating(Number(event.target.value))} className="min-h-11 w-full rounded-lg border border-[#d8cec0] bg-white px-3"><option value={5}>5 - Excellent</option><option value={4}>4 - Very good</option><option value={3}>3 - Good</option><option value={2}>2 - Fair</option><option value={1}>1 - Poor</option></select></label>
          <Input label="Review title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={180} required />
          <Textarea label="Your experience" value={comment} onChange={(event) => setComment(event.target.value)} maxLength={2000} rows={5} required />
          <div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setReviewing(null)} disabled={submittingReview}>Cancel</Button><Button type="submit" loading={submittingReview}>Submit review</Button></div>
        </form>
      </Modal>
    </main>
  );
}
