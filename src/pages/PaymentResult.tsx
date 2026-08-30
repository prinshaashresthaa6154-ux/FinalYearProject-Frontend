import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { getApiError } from "../api/axios";
import {
  bookingService,
  isBookingPaymentConfirmed,
  isBookingResolutionTerminal,
  type Booking,
  type Payment,
} from "../services/bookingService";

type ResultKind = "success" | "failed" | "cancelled";
export default function PaymentResult({ kind }: { kind: ResultKind }) {
  const [params] = useSearchParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const bookingId = Number(
    params.get("bookingId") ||
      params.get("booking_id") ||
      localStorage.getItem("lastBookingId") ||
      "0",
  );
  const load = useCallback(async () => {
    try {
      if (!bookingId)
        throw new Error(
          "The payment return did not include a booking reference.",
        );
      const [bookingResponse, paymentResponse] = await Promise.all([
        bookingService.getBooking(bookingId),
        bookingService.getBookingPayment(bookingId).catch(() => null),
      ]);
      setBooking(bookingResponse.data.data ?? null);
      setPayment(paymentResponse?.data.data ?? null);
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (kind !== "success" || !booking || isBookingResolutionTerminal(booking))
      return;
    const timer = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(timer);
  }, [booking, kind, load]);
  if (loading)
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f1e9]">
        <LoaderCircle className="h-8 w-8 animate-spin text-[#a62922]" />
      </main>
    );
  if (error || !booking)
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f1e9] p-5">
        <div className="max-w-md text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-700" />
          <h1 className="mt-4 font-display text-3xl font-bold">
            Payment result unavailable
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#75695f]">
            {error || "The booking could not be retrieved from the backend."}
          </p>
          <Link
            to="/user/bookings"
            className="mt-6 inline-block font-bold text-[#a62922]"
          >
            View my bookings
          </Link>
        </div>
      </main>
    );
  const paid = isBookingPaymentConfirmed(booking);
  const bookingCancelled = booking.status === "CANCELLED";
  const failed =
    bookingCancelled ||
    booking.paymentStatus === "FAILED" ||
    booking.paymentStatus === "CANCELLED";
  const Icon = paid ? CheckCircle2 : failed ? XCircle : Clock3;
  const title = paid
    ? "Payment successful"
    : failed
      ? bookingCancelled
        ? "Booking cancelled"
        : kind === "cancelled"
          ? "Payment cancelled"
          : "Payment failed"
      : "Payment pending verification";
  return (
    <main className="min-h-screen bg-[#f6f1e9] px-5 py-14">
      <div className="mx-auto max-w-2xl rounded-2xl border-t-4 border-[#a62922] bg-white p-8 text-center shadow-sm sm:p-10">
        <Icon
          className={`mx-auto h-16 w-16 ${paid ? "text-green-700" : failed ? "text-red-700" : "text-amber-600"}`}
        />
        <p className="mt-6 text-xs font-bold uppercase tracking-widest text-[#a62922]">
          Payment result
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold">{title}</h1>
        <p className="mt-4 leading-7 text-[#75695f]">
          {paid
            ? "The backend has confirmed this payment. Your booking record is now up to date."
            : failed
              ? bookingCancelled && booking.paymentStatus === "PAID"
                ? "This booking was cancelled and its reserved seats were released. The backend keeps the payment status as PAID; no refund endpoint is available in the current system."
                : bookingCancelled
                  ? "This booking was cancelled. No successful payment is assumed from the browser return."
                  : "The backend has not marked this booking as paid. No successful payment is assumed from the browser return."
              : "The provider return was received, but the backend has not confirmed payment yet. Refresh your booking details shortly."}
        </p>
        <div className="mt-8 border-y border-[#eee7e1] py-5 text-left text-sm">
          <p className="flex justify-between py-2">
            <span className="text-[#897b70]">Booking</span>
            <b>{booking.bookingReference}</b>
          </p>
          <p className="flex justify-between py-2">
            <span className="text-[#897b70]">Trip</span>
            <b>{booking.travelPackage.title}</b>
          </p>
          <p className="flex justify-between py-2">
            <span className="text-[#897b70]">Amount</span>
            <b>
              {booking.currency} {Number(booking.totalAmount).toLocaleString()}
            </b>
          </p>
          <p className="flex justify-between py-2">
            <span className="text-[#897b70]">Booking status</span>
            <b>{booking.status}</b>
          </p>
          <p className="flex justify-between py-2">
            <span className="text-[#897b70]">Payment status</span>
            <b>{booking.paymentStatus}</b>
          </p>
          {payment && (
            <>
              <p className="flex justify-between py-2">
                <span className="text-[#897b70]">Latest method</span>
                <b>{payment.paymentMethod}</b>
              </p>
              <p className="flex justify-between py-2">
                <span className="text-[#897b70]">Latest attempt</span>
                <b>{payment.paymentStatus}</b>
              </p>
            </>
          )}
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            to={`/booking/${booking.bookingId}`}
            className="rounded-lg bg-[#a62922] px-5 py-3 text-sm font-bold text-white"
          >
            View booking
          </Link>
          <Link
            to="/user/bookings"
            className="rounded-lg border border-[#d8cec0] px-5 py-3 text-sm font-bold"
          >
            My bookings
          </Link>
        </div>
      </div>
    </main>
  );
}
