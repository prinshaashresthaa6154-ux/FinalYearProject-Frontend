import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router";
import { getApiError } from "../api/axios";
import {
  bookingService,
  canCancelBooking,
  isBookingPaymentConfirmed,
  isBookingResolutionTerminal,
  paymentMethodForCurrency,
  type Booking,
  type CheckoutPaymentMethod,
  type Payment,
} from "../services/bookingService";
import { getOrCreateBookingConversation } from "../services/chatService";

type StatusState = {
  bookingId?: number;
  notice?: string;
  preferredPaymentMethod?: CheckoutPaymentMethod;
} | null;

export default function BookingStatus() {
  const { id } = useParams();
  const location = useLocation();
  const [params] = useSearchParams();
  const state = location.state as StatusState;
  const bookingId = Number(
    id ||
      params.get("bookingId") ||
      params.get("booking_id") ||
      state?.bookingId ||
      0,
  );
  const [booking, setBooking] = useState<Booking | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startingPayment, setStartingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelNotice, setCancelNotice] = useState("");
  const [openingChat, setOpeningChat] = useState(false);
  const [chatError, setChatError] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!bookingId) return;
    try {
      const [bookingResponse, paymentResponse] = await Promise.all([
        bookingService.getBooking(bookingId),
        bookingService.getBookingPayment(bookingId).catch(() => null),
      ]);
      setBooking(bookingResponse.data.data ?? null);
      setPayment(paymentResponse?.data.data ?? null);
      setError("");
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (!bookingId) {
      setError("A booking ID is required to verify the final state.");
      setLoading(false);
      return;
    }
    void load();
  }, [bookingId, load]);

  useEffect(() => {
    if (!booking || isBookingResolutionTerminal(booking)) return;
    const timer = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(timer);
  }, [booking, load]);

  useEffect(() => {
    if (!booking || !isBookingPaymentConfirmed(booking)) return;
    let cancelled = false;
    void getOrCreateBookingConversation(booking)
      .then((conversation) => {
        if (!cancelled) setConversationId(conversation.id);
      })
      .catch(() => {
        // Chat can still be opened manually if the provider is temporarily unavailable.
      });
    return () => {
      cancelled = true;
    };
  }, [booking]);

  const pay = async () => {
    if (!booking) return;
    setStartingPayment(true);
    setPaymentError("");
    try {
      const method = paymentMethodForCurrency(booking.currency);
      if (!method)
        throw new Error(
          `Online payment is not available for ${booking.currency}.`,
        );
      await bookingService.beginCheckout(booking, method);
    } catch (requestError) {
      setPaymentError(getApiError(requestError).message);
    } finally {
      setStartingPayment(false);
    }
  };

  const cancel = async () => {
    if (!booking || !canCancelBooking(booking)) return;
    if (!window.confirm(`Cancel booking ${booking.bookingReference}?`)) return;
    setCancelling(true);
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
      await load();
      setCancelNotice(
        `${response.data.message || "Booking cancelled successfully."} Reserved seats were released by the backend.`,
      );
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setCancelling(false);
    }
  };

  const openChat = async () => {
    if (!booking || !isBookingPaymentConfirmed(booking)) return;
    setOpeningChat(true);
    setChatError("");
    try {
      const conversation = conversationId
        ? { id: conversationId }
        : await getOrCreateBookingConversation(booking);
      window.location.assign(`/user/messages?conversationId=${conversation.id}`);
    } catch (requestError) {
      setChatError(getApiError(requestError).message);
    } finally {
      setOpeningChat(false);
    }
  };

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
            Booking could not be loaded
          </h1>
          <p className="mt-3 text-sm text-[#75695f]">
            {error || "The booking does not exist."}
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

  const isPaid = isBookingPaymentConfirmed(booking);
  const paymentSettled = booking.paymentStatus === "PAID";
  const isBookingCancelled = booking.status === "CANCELLED";
  const isFailed =
    booking.paymentStatus === "FAILED" ||
    booking.paymentStatus === "CANCELLED" ||
    booking.status === "REJECTED" ||
    isBookingCancelled;
  const canPay =
    booking.paymentStatus === "UNPAID" &&
    !isFailed &&
    (booking.status === "PENDING" || booking.status === "CONFIRMED");
  const Icon = isPaid ? CheckCircle2 : isFailed ? XCircle : Clock3;
  const title = isPaid
    ? "Payment confirmed"
    : isFailed
      ? isBookingCancelled
        ? "Booking cancelled"
        : "Payment failed or was cancelled"
      : paymentSettled
        ? "Booking confirmation pending"
        : "Payment is ready when you are";
  const description = isPaid
    ? "Your payment has been verified by the backend and this booking is confirmed."
    : isFailed
      ? isBookingCancelled
        ? paymentSettled
          ? "This booking was cancelled and its reserved seats were released. The backend keeps the payment status as PAID; no refund endpoint is available in the current system."
          : "This booking was cancelled and its reserved seats were released. The booking remains in your travel record."
        : "The backend has not marked this booking as paid. You can return to your bookings and try another available payment attempt."
      : paymentSettled
        ? "The backend has marked the payment as paid and is still finalizing the booking confirmation."
        : "Your seats are reserved while payment is completed. The booking becomes confirmed only after the provider verifies your payment.";

  return (
    <main className="min-h-screen bg-[#f6f1e9] px-5 py-14">
      <div className="mx-auto max-w-2xl rounded-2xl border-t-4 border-[#a62922] bg-white p-7 text-center shadow-sm sm:p-10">
        <Icon
          className={`mx-auto h-16 w-16 ${isPaid ? "text-green-700" : isFailed ? "text-red-700" : "text-amber-600"}`}
        />
        <p className="mt-6 text-xs font-bold uppercase tracking-widest text-[#a62922]">
          Booking {booking.bookingReference}
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold">{title}</h1>
        <p className="mt-4 leading-7 text-[#75695f]">{description}</p>
        {state?.notice && (
          <p className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {state.notice}
          </p>
        )}
        {cancelNotice && (
          <p className="mt-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
            {cancelNotice}
          </p>
        )}
        <div className="mt-8 border-y border-[#eee7e1] py-5 text-left text-sm">
          <p className="flex justify-between py-2">
            <span className="text-[#897b70]">Trip</span>
            <b>{booking.travelPackage.title}</b>
          </p>
          <p className="flex justify-between py-2">
            <span className="text-[#897b70]">Participants</span>
            <b>{booking.participants}</b>
          </p>
          <p className="flex justify-between py-2">
            <span className="text-[#897b70]">Seat reservation</span>
            <b>
              {booking.status === "CANCELLED" || booking.status === "REJECTED"
                ? "Released"
                : `${booking.participants} reserved`}
            </b>
          </p>
          <p className="flex justify-between py-2">
            <span className="text-[#897b70]">Remaining seats</span>
            <b>{booking.travelPackage.availableSeats}</b>
          </p>
          <p className="flex justify-between py-2">
            <span className="text-[#897b70]">Total</span>
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
                <span className="text-[#897b70]">Latest attempt</span>
                <b>{payment.paymentMethod}</b>
              </p>
              <p className="flex justify-between py-2">
                <span className="text-[#897b70]">Transaction</span>
                <b className="font-mono text-xs">{payment.transactionId}</b>
              </p>
            </>
          )}
        </div>
        {canPay && (
          <div className="mt-6 rounded-xl border border-[#e5ddd6] bg-[#fffaf7] p-4 text-left">
            <p className="font-bold">Continue payment</p>
            <p className="mt-1 text-sm text-[#75695f]">
              {paymentMethodForCurrency(booking.currency) === "ESEWA"
                ? "Pay with eSewa in NPR."
                : paymentMethodForCurrency(booking.currency) === "STRIPE"
                  ? "Pay securely by card through Stripe."
                  : `No online provider is available for ${booking.currency}.`}
            </p>
            {paymentError && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {paymentError}
              </p>
            )}
            <button
              type="button"
              onClick={() => void pay()}
              disabled={
                startingPayment || !paymentMethodForCurrency(booking.currency)
              }
              className="mt-4 w-full rounded-lg bg-[#a62922] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#8f211c] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {startingPayment
                ? "Opening secure checkout..."
                : "Continue to payment"}
            </button>
          </div>
        )}
        {isPaid && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-left">
            <p className="font-bold text-green-900">Chat with the trip admin</p>
            <p className="mt-1 text-sm text-green-800">
              Your payment is confirmed. Ask questions about the itinerary, meeting point, or preparation.
            </p>
            {chatError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{chatError}</p>}
            <button type="button" onClick={() => void openChat()} disabled={openingChat} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#a62922] px-4 py-3 text-sm font-bold text-white hover:bg-[#8f211c] disabled:cursor-not-allowed disabled:opacity-50">
              <MessageSquare className="h-4 w-4" /> {openingChat ? "Opening chat..." : "Chat with admin"}
            </button>
          </div>
        )}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {canCancelBooking(booking) && (
            <button
              type="button"
              onClick={() => void cancel()}
              disabled={cancelling}
              className="rounded-lg border border-red-300 px-5 py-3 text-sm font-bold text-red-700 disabled:opacity-50"
            >
              {cancelling ? "Cancelling..." : "Cancel booking"}
            </button>
          )}
          <Link
            to="/user/bookings"
            className="rounded-lg bg-[#a62922] px-5 py-3 text-sm font-bold text-white"
          >
            My bookings
          </Link>
          <Link
            to="/trips"
            className="rounded-lg border border-[#d8cec0] px-5 py-3 text-sm font-bold"
          >
            Browse trips
          </Link>
        </div>
      </div>
    </main>
  );
}
