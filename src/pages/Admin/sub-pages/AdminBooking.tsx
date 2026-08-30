import { Check, Eye, LoaderCircle, MessageCircle, Search, XCircle } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { getApiError } from "../../../api/axios";
import Pagination from "../../../components/Pagination";
import {
  Button,
  EmptyState,
  ErrorState,
  Modal,
  StatusBadge,
} from "../../../components/ui";
import {
  bookingService,
  canCompleteBooking,
  canConfirmBooking,
  canRejectBooking,
  isBookingPaymentConfirmed,
  validateRejectionReason,
  type Booking,
  type BookingStatus,
  type PaymentStatus,
} from "../../../services/bookingService";
import { getOrCreateBookingConversation } from "../../../services/chatService";

const bookingStatuses: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
];
const paymentStatuses: PaymentStatus[] = [
  "PENDING",
  "UNPAID",
  "INITIATED",
  "PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
];
const toStart = (value: string) => (value ? `${value}T00:00:00Z` : undefined);
const toEnd = (value: string) => (value ? `${value}T23:59:59Z` : undefined);

export default function AdminBookings() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Booking[]>([]);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "">("");
  const [packageId, setPackageId] = useState("");
  const [email, setEmail] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [bookedFrom, setBookedFrom] = useState("");
  const [bookedTo, setBookedTo] = useState("");
  const [sortBy, setSortBy] = useState("bookingDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [actionId, setActionId] = useState<number | null>(null);
  const [detail, setDetail] = useState<Booking | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [openingChatId, setOpeningChatId] = useState<number | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await bookingService.adminList({
        status,
        paymentStatus,
        packageId: packageId ? Number(packageId) : undefined,
        customerEmail: emailFilter || undefined,
        bookedFrom: toStart(bookedFrom),
        bookedTo: toEnd(bookedTo),
        page,
        size: 20,
        sortBy,
        sortDir,
      });
      setRows(response.data.data?.content ?? []);
      setPages(response.data.data?.totalPages ?? 0);
    } catch (e) {
      setError(getApiError(e).message);
    } finally {
      setLoading(false);
    }
  }, [
    bookedFrom,
    bookedTo,
    emailFilter,
    packageId,
    page,
    paymentStatus,
    sortBy,
    sortDir,
    status,
  ]);
  useEffect(() => {
    void load();
  }, [load]);
  const apply = (event: FormEvent) => {
    event.preventDefault();
    setPage(0);
    setEmailFilter(email.trim());
  };
  const openDetail = async (id: number) => {
    setDetailLoading(true);
    setError("");
    try {
      const response = await bookingService.adminById(id);
      setDetail(response.data.data ?? null);
    } catch (e) {
      setError(getApiError(e).message);
    } finally {
      setDetailLoading(false);
    }
  };
  const run = async (
    booking: Booking,
    action: "confirm" | "reject" | "complete",
  ) => {
    let reason = "";
    if (action === "reject") {
      reason = window.prompt("Reason for rejecting this booking")?.trim() ?? "";
      const reasonError = validateRejectionReason(reason);
      if (reasonError) {
        setError(reasonError);
        return;
      }
    } else if (action === "confirm" && !canConfirmBooking(booking)) {
      setError("Booking can only be confirmed after successful payment.");
      return;
    } else if (action === "complete" && !canCompleteBooking(booking)) {
      setError("Only confirmed bookings can be completed.");
      return;
    }
    setActionId(booking.bookingId);
    setError("");
    try {
      let response;
      if (action === "confirm")
        response = await bookingService.confirm(booking.bookingId);
      else if (action === "complete")
        response = await bookingService.complete(booking.bookingId);
      else response = await bookingService.reject(booking.bookingId, reason);
      if (!response.data.success)
        throw new Error(response.data.message || `Booking ${action} failed.`);
      setNotice(
        `${booking.bookingReference} ${action === "confirm" ? "confirmed" : action === "complete" ? "completed" : "rejected"}.`,
      );
      await load();
    } catch (e) {
      setError(getApiError(e).message);
    } finally {
      setActionId(null);
    }
  };
  const openChat = async (booking: Booking) => {
    setOpeningChatId(booking.bookingId);
    setError("");
    try {
      const conversation = await getOrCreateBookingConversation(booking);
      navigate(`/admin/messages?conversationId=${conversation.id}`);
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setOpeningChatId(null);
    }
  };
  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-[#b31919]">
          Owned package bookings
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold">
          Booking Management
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Confirm, reject, complete, and inspect bookings returned by the
          backend.
        </p>
      </header>
      <form
        onSubmit={apply}
        className="filter-surface grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        <label className="relative sm:col-span-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Customer email"
            type="email"
            className="field-control px-9 py-2.5"
          />
        </label>
        <input
          value={packageId}
          onChange={(e) => {
            setPackageId(e.target.value);
            setPage(0);
          }}
          placeholder="Package ID"
          type="number"
          min="1"
          className="field-control px-3 py-2.5"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as BookingStatus | "");
            setPage(0);
          }}
          className="field-control px-3 py-2.5"
        >
          <option value="">All booking statuses</option>
          {bookingStatuses.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <select
          value={paymentStatus}
          onChange={(e) => {
            setPaymentStatus(e.target.value as PaymentStatus | "");
            setPage(0);
          }}
          className="field-control px-3 py-2.5"
        >
          <option value="">All payment statuses</option>
          {paymentStatuses.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <label className="text-xs font-semibold text-gray-500">
          Booked from
          <input
            value={bookedFrom}
            onChange={(e) => {
              setBookedFrom(e.target.value);
              setPage(0);
            }}
            type="date"
            className="field-control mt-1 px-3 py-2"
          />
        </label>
        <label className="text-xs font-semibold text-gray-500">
          Booked to
          <input
            value={bookedTo}
            onChange={(e) => {
              setBookedTo(e.target.value);
              setPage(0);
            }}
            type="date"
            className="field-control mt-1 px-3 py-2"
          />
        </label>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(0);
          }}
          className="field-control px-3 py-2.5"
        >
          {[
            "bookingDate",
            "updatedAt",
            "status",
            "paymentStatus",
            "numberOfPeople",
            "id",
          ].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select
          value={sortDir}
          onChange={(e) => {
            setSortDir(e.target.value as "asc" | "desc");
            setPage(0);
          }}
          className="field-control px-3 py-2.5"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
        <Button type="submit">
          <Search className="h-4 w-4" /> Apply
        </Button>
      </form>
      {notice && (
        <p
          role="status"
          className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          {notice}
        </p>
      )}
      {error && <ErrorState message={error} onRetry={() => void load()} />}
      {loading ? (
        <div className="grid min-h-52 place-items-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-[#b31919]" />
        </div>
      ) : !error && rows.length === 0 ? (
        <EmptyState
          title="No bookings found"
          description="No owned bookings match the current filters."
        />
      ) : (
        !error && (
          <>
            <div className="overflow-x-auto rounded-2xl border border-[#eae3dc] bg-white shadow-sm">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-[#fcfaf7] text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Package</th>
                    <th className="px-4 py-3">People</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((booking) => (
                    <tr key={booking.bookingId}>
                      <td className="px-4 py-4 font-mono text-xs">
                        {booking.bookingReference}
                      </td>
                      <td className="px-4 py-4">
                        <b>{booking.user.fullName}</b>
                        <p className="text-xs text-gray-500">
                          {booking.user.email}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        {booking.travelPackage.title}
                      </td>
                      <td className="px-4 py-4">
                        {booking.participants ?? booking.numberOfPeople}
                      </td>
                      <td className="px-4 py-4 font-semibold">
                        {booking.currency}{" "}
                        {Number(booking.totalAmount).toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={booking.paymentStatus} />
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => void openDetail(booking.bookingId)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isBookingPaymentConfirmed(booking) && (
                            <Button
                              type="button"
                              variant="secondary"
                              loading={openingChatId === booking.bookingId}
                              disabled={actionId === booking.bookingId}
                              onClick={() => void openChat(booking)}
                            >
                              <MessageCircle className="h-4 w-4" /> Message traveler
                            </Button>
                          )}
                          {canConfirmBooking(booking) && (
                            <Button
                              type="button"
                              disabled={actionId === booking.bookingId}
                              onClick={() => void run(booking, "confirm")}
                            >
                              <Check className="h-4 w-4" /> Confirm
                            </Button>
                          )}
                          {canRejectBooking(booking) && (
                            <>
                              <Button
                                type="button"
                                variant="danger"
                                disabled={actionId === booking.bookingId}
                                onClick={() => void run(booking, "reject")}
                              >
                                <XCircle className="h-4 w-4" /> Reject
                              </Button>
                            </>
                          )}
                          {canCompleteBooking(booking) && (
                            <Button
                              type="button"
                              variant="secondary"
                              disabled={actionId === booking.bookingId}
                              onClick={() => void run(booking, "complete")}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page + 1}
              totalPages={pages}
              onPageChange={(next) => setPage(next - 1)}
            />
          </>
        )
      )}
      <Modal
        open={detail !== null || detailLoading}
        onClose={() => setDetail(null)}
        title="Booking details"
      >
        {detailLoading ? (
          <div className="grid min-h-32 place-items-center">
            <LoaderCircle className="h-7 w-7 animate-spin text-[#b31919]" />
          </div>
        ) : (
          detail && (
            <div className="space-y-3 text-sm">
              <Detail label="Reference" value={detail.bookingReference} />
              <Detail
                label="Customer"
                value={`${detail.user.fullName} (${detail.user.email})`}
              />
              <Detail label="Package" value={detail.travelPackage.title} />
              <Detail
                label="Participants"
                value={detail.participants ?? detail.numberOfPeople}
              />
              <Detail
                label="Total"
                value={`${detail.currency} ${Number(detail.totalAmount).toLocaleString()}`}
              />
              <Detail label="Payment" value={detail.paymentStatus} />
              <Detail label="Status" value={detail.status} />
              <Detail
                label="Booked"
                value={new Intl.DateTimeFormat("en", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(detail.bookingDate))}
              />
              {detail.specialRequests && (
                <Detail
                  label="Special requests"
                  value={detail.specialRequests}
                />
              )}
              {isBookingPaymentConfirmed(detail) && (
                <Button
                  type="button"
                  className="w-full"
                  loading={openingChatId === detail.bookingId}
                  onClick={() => void openChat(detail)}
                >
                  <MessageCircle className="h-4 w-4" /> Message traveler
                </Button>
              )}
            </div>
          )
        )}
      </Modal>
    </div>
  );
}
function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <p className="flex justify-between gap-4 border-b py-2 last:border-0">
      <span className="text-gray-500">{label}</span>
      <b className="text-right">{value}</b>
    </p>
  );
}
