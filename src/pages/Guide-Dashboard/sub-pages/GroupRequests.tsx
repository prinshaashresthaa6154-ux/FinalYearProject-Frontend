import { CalendarDays, Check, Flag, LoaderCircle, MapPin, MessageCircle, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { getApiError } from "../../../api/axios";
import { Button, EmptyState, ErrorState, Modal, Textarea } from "../../../components/ui";
import {
  guideBookingService,
  type GuideBooking,
} from "../../../services/guideBookingService";

export default function GroupRequests() {
  const [requests, setRequests] = useState<GuideBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<GuideBooking | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await guideBookingService.requests(0, 100);
      setRequests(response.data.data?.content ?? []);
    } catch (requestError) {
      const details = getApiError(requestError);
      if (details.status === 404) {
        // Some backend versions return 404 instead of an empty page when the
        // assigned guide has not received any booking requests yet.
        setRequests([]);
      } else {
        setError(details.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const accept = async (booking: GuideBooking) => {
    setProcessing(booking.id);
    setError("");
    try {
      const response = await guideBookingService.accept(booking.id);
      setNotice(response.data.message || "Guide booking accepted.");
      await load();
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setProcessing(null);
    }
  };

  const reject = async () => {
    if (!rejecting) return;
    setProcessing(rejecting.id);
    setError("");
    try {
      const response = await guideBookingService.reject(rejecting.id, reason);
      setNotice(response.data.message || "Guide booking rejected.");
      setRejecting(null);
      setReason("");
      await load();
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setProcessing(null);
    }
  };

  const complete = async (booking: GuideBooking) => {
    if (!window.confirm(`Mark the service for ${booking.user.name} as completed?`)) return;
    setProcessing(booking.id);
    setError("");
    try {
      const response = await guideBookingService.complete(booking.id);
      setNotice(response.data.message || "Guide trip completed.");
      await load();
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setProcessing(null);
    }
  };

  if (loading)
    return <div className="grid min-h-64 place-items-center"><LoaderCircle className="h-8 w-8 animate-spin text-[#a62922]" /></div>;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#a62922]">Direct bookings</p>
        <h2 className="mt-1 font-display text-3xl font-bold">Guide requests</h2>
        <p className="mt-2 text-sm text-gray-500">Accepting a pending request confirms it and creates the traveler conversation.</p>
      </div>
      {notice && <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p>}
      {error && <ErrorState message={error} onRetry={() => void load()} />}
      {!error && requests.length === 0 ? (
        <EmptyState title="No guide requests" description="Direct booking requests assigned to you will appear here." />
      ) : (
        <div className="space-y-3">
          {requests.map((booking) => (
            <article key={booking.id} className="rounded-2xl border border-[#eae3dc] bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-xl font-bold">{booking.user.name}</h3>
                    <span className="rounded-full bg-[#f5e6e3] px-3 py-1 text-xs font-bold text-[#a62922]">{booking.status}</span>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-[#faf7f4] p-3"><p className="text-xs font-bold uppercase tracking-wide text-gray-500">Destination</p><p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold"><MapPin className="h-4 w-4 text-[#a62922]" />{booking.destination?.name ?? "Destination unavailable"}</p></div>
                    <div className="rounded-lg bg-[#faf7f4] p-3"><p className="text-xs font-bold uppercase tracking-wide text-gray-500">Service dates</p><p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold"><CalendarDays className="h-4 w-4 text-[#a62922]" />{booking.startDate} to {booking.endDate}</p><p className="mt-1 text-xs text-gray-500">{booking.participants ?? 1} traveler(s)</p></div>
                  </div>
                  {booking.dailyRate != null && <p className="mt-2 text-sm font-semibold text-[#a62922]">{booking.currency} {Number(booking.dailyRate).toLocaleString()} / day{booking.billableDays ? ` · ${booking.billableDays} day(s)` : ""}</p>}
                  {booking.totalAmount != null && <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600"><span>Gross: <b>{booking.currency} {Number(booking.totalAmount).toLocaleString()}</b></span><span>Commission ({booking.commissionPercentage}%): <b>{booking.currency} {Number(booking.commissionAmount).toLocaleString()}</b></span><span>Your net: <b>{booking.currency} {Number(booking.guideNetAmount).toLocaleString()}</b></span><span>Payment: <b>{booking.paymentStatus}</b></span></div>}
                  {booking.requestMessage && <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4f4741]">{booking.requestMessage}</p>}
                  {booking.rejectionReason && <p className="mt-3 text-sm text-red-700">Reason: {booking.rejectionReason}</p>}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {booking.status === "PENDING" && booking.type === "DIRECT" && (
                    <>
                      <Button loading={processing === booking.id} onClick={() => void accept(booking)}><Check className="h-4 w-4" /> Accept</Button>
                      <Button variant="secondary" disabled={processing === booking.id} onClick={() => { setRejecting(booking); setReason(""); }}><X className="h-4 w-4" /> Reject</Button>
                    </>
                  )}
                  {booking.status === "CONFIRMED" && booking.conversationId && (
                    <Link to={`/guide/messages?conversationId=${booking.conversationId}`} className="inline-flex items-center gap-2 rounded-lg bg-[#a62922] px-4 py-2.5 text-sm font-bold text-white"><MessageCircle className="h-4 w-4" /> Message</Link>
                  )}
                  {booking.status === "CONFIRMED" && booking.type === "DIRECT" && booking.endDate && booking.endDate <= new Date().toISOString().slice(0, 10) && (
                    <Button loading={processing === booking.id} onClick={() => void complete(booking)}><Flag className="h-4 w-4" /> Complete trip</Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <Modal open={rejecting !== null} onClose={() => !processing && setRejecting(null)} title="Reject guide request">
        <Textarea label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} required />
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setRejecting(null)} disabled={Boolean(processing)}>Keep pending</Button>
          <Button onClick={() => void reject()} loading={Boolean(processing)} disabled={!reason.trim()}>Reject request</Button>
        </div>
      </Modal>
    </div>
  );
}
