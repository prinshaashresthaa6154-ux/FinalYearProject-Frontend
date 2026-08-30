import { Eye, LoaderCircle, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getApiError } from "../../api/axios";
import Pagination from "../../components/Pagination";
import {
  Button,
  EmptyState,
  ErrorState,
  Modal,
  StatusBadge,
} from "../../components/ui";
import {
  bookingService,
  canCompleteBooking,
  canConfirmBooking,
  canRejectBooking,
  validateRejectionReason,
  type Booking,
  type BookingStatus,
  type Payment,
  type PaymentMethod,
  type PaymentStatus,
} from "../../services/bookingService";
import {
  reviewService,
  type ReviewStatus,
  type TripReview,
} from "../../services/reviewService";
import {
  groupService,
  type GroupTripModerationStatus,
  type StandaloneGroupTrip,
} from "../../services/groupService";

type Kind = "bookings" | "payments" | "reviews" | "groups";
type RowRecord = {
  id?: number;
  bookingId?: number;
  groupId?: number;
  status?: string;
  paymentStatus?: string;
  transactionId?: string;
  title?: string;
  tripTitle?: string;
  currentMembers?: number;
  maxMembers?: number;
  travelPackage?: { title?: string };
  user?: { email?: string };
  booking?: { bookingId?: number };
  trip?: { title?: string };
};
export default function OperationsPage({ kind }: { kind: Kind }) {
  const [rows, setRows] = useState<
    Array<Booking | Payment | TripReview | StandaloneGroupTrip>
  >([]);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);
  const [status, setStatus] = useState("");
  const [secondary, setSecondary] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<number | null>(null);
  const [detail, setDetail] = useState<unknown>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let response;
      if (kind === "bookings")
        response = await bookingService.adminList({
          status: status as BookingStatus | "",
          paymentStatus: secondary as PaymentStatus | "",
          customerEmail: keyword || undefined,
          page,
          size: 20,
          sortBy: "bookingDate",
          sortDir: "desc",
        });
      else if (kind === "payments")
        response = await bookingService.payments({
          status: status as PaymentStatus | "",
          method: secondary as PaymentMethod | "",
          transactionId: keyword || undefined,
          page,
          size: 20,
          sortBy: "updatedAt",
          sortDir: "desc",
        });
      else if (kind === "reviews")
        response = await reviewService.admin({
          status: status as ReviewStatus | "",
          tripId: keyword ? Number(keyword) : undefined,
          page,
          size: 20,
        });
      else
        response = await groupService.list({
          keyword: keyword || undefined,
          status: status as StandaloneGroupTrip["status"] | "",
          page,
          size: 20,
          sortBy: "date",
          sortDir: "desc",
        });
      const data = response.data.data;
      setRows(data && "content" in data ? data.content : []);
      setPages(data && "totalPages" in data ? data.totalPages : 0);
    } catch (e) {
      setError(getApiError(e).message);
    } finally {
      setLoading(false);
    }
  }, [kind, keyword, page, secondary, status]);
  useEffect(() => {
    void load();
  }, [load]);
  const run = async (id: number, action: string) => {
    setActionId(id);
    try {
      if (kind === "bookings") {
        let response;
        if (action === "confirm") response = await bookingService.confirm(id);
        else if (action === "complete")
          response = await bookingService.complete(id);
        else {
          const reason = window.prompt("Reason for rejection")?.trim() ?? "";
          const reasonError = validateRejectionReason(reason);
          if (reasonError) throw new Error(reasonError);
          response = await bookingService.reject(id, reason);
        }
        if (!response?.data.success) {
          throw new Error(
            response?.data.message || `Booking ${action} failed.`,
          );
        }
      } else if (kind === "reviews") {
        if (action === "publish") await reviewService.publish(id);
        else if (action === "hide") await reviewService.hide(id);
        else
          await reviewService.moderate(
            id,
            action as "APPROVED" | "REJECTED" | "HIDDEN",
            window.prompt("Moderation note") || "Moderated by Superadmin",
          );
      } else
        await groupService.updateStatus(
          id,
          action as GroupTripModerationStatus,
        );
      await load();
    } catch (e) {
      setError(getApiError(e).message);
    } finally {
      setActionId(null);
    }
  };
  const openDetail = async (id: number) => {
    try {
      const response =
        kind === "bookings"
          ? await bookingService.adminById(id)
          : kind === "groups"
            ? await groupService.byId(id)
            : kind === "payments"
              ? await bookingService.getPayment(id)
              : null;
      setDetail(response?.data.data ?? null);
    } catch (e) {
      setError(getApiError(e).message);
    }
  };
  const title = kind[0].toUpperCase() + kind.slice(1);
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-[#b31919]">
          Superadmin operations
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-gray-500">
          Manage platform-wide {kind} records and moderation actions.
        </p>
      </header>
      <div className="flex flex-wrap gap-3 rounded-2xl border bg-white p-4 shadow-sm">
        <label className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
            placeholder={
              kind === "reviews" ? "Trip ID" : "Email or transaction ID"
            }
            className="w-full rounded-lg border px-9 py-2.5 text-sm"
          />
        </label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            className="rounded-lg border px-3 py-2.5 text-sm"
          >
            <option value="">All statuses</option>
            {(kind === "bookings"
              ? ["PENDING", "CONFIRMED", "REJECTED", "COMPLETED", "CANCELLED"]
              : kind === "payments"
                ? ["PENDING", "PAID", "FAILED", "REFUNDED", "CANCELLED"]
                : kind === "reviews"
                  ? ["PENDING", "PUBLISHED", "HIDDEN", "REJECTED"]
                  : ["OPEN", "CONFIRMED", "FULL", "CANCELLED", "COMPLETED"]
            ).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        {(kind === "bookings" || kind === "payments") && (
          <select
            value={secondary}
            onChange={(e) => {
              setSecondary(e.target.value);
              setPage(0);
            }}
            className="rounded-lg border px-3 py-2.5 text-sm"
          >
            <option value="">
              {kind === "bookings" ? "Any payment status" : "Any method"}
            </option>
            {(kind === "bookings"
              ? ["PENDING", "PAID", "FAILED", "REFUNDED"]
              : ["KHALTI", "ESEWA", "STRIPE"]
            ).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        )}
      </div>
      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : loading ? (
        <div className="grid min-h-52 place-items-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-[#b31919]" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title={`No ${kind} found`}
          description="Try changing the filters."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#faf7f4] text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Summary</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => {
                  const value = row as RowRecord;
                  const id = Number(
                    value.bookingId ?? value.id ?? value.groupId,
                  );
                  const rowStatus = String(
                    value.status ?? value.paymentStatus ?? "-",
                  );
                  return (
                    <tr key={id} className="hover:bg-[#fffaf7]">
                      <td className="px-4 py-4">#{id}</td>
                      <td className="px-4 py-4">
                        <p className="font-semibold">
                          {kind === "bookings"
                            ? value.travelPackage?.title
                            : kind === "payments"
                              ? value.transactionId
                              : kind === "reviews"
                                ? value.title
                                : (value as StandaloneGroupTrip).tripName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {kind === "bookings"
                            ? value.user?.email
                            : kind === "reviews"
                              ? value.trip?.title
                              : kind === "groups"
                                ? `${value.currentMembers}/${(value as StandaloneGroupTrip).maximumMembers} members`
                                : `Booking #${value.booking?.bookingId}`}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={rowStatus} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void openDetail(id)}
                            className="rounded border p-2"
                            aria-label="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {kind === "bookings" && (
                            <>
                              {canConfirmBooking({
                                status: value.status as BookingStatus,
                                paymentStatus:
                                  value.paymentStatus as PaymentStatus,
                              }) && (
                                <Action
                                  id={id}
                                  current={actionId}
                                  label="Confirm"
                                  onClick={() => void run(id, "confirm")}
                                />
                              )}
                              {canCompleteBooking({
                                status: value.status as BookingStatus,
                              }) && (
                                <Action
                                  id={id}
                                  current={actionId}
                                  label="Complete"
                                  onClick={() => void run(id, "complete")}
                                />
                              )}
                              {canRejectBooking({
                                status: value.status as BookingStatus,
                              }) && (
                                <Action
                                  id={id}
                                  current={actionId}
                                  label="Reject"
                                  onClick={() => void run(id, "reject")}
                                />
                              )}
                            </>
                          )}
                          {kind === "reviews" && (
                            <>
                              <Action
                                id={id}
                                current={actionId}
                                label="Publish"
                                onClick={() => void run(id, "publish")}
                              />
                              <Action
                                id={id}
                                current={actionId}
                                label="Hide"
                                onClick={() => void run(id, "hide")}
                              />
                              <Action
                                id={id}
                                current={actionId}
                                label="Moderate"
                                onClick={() => void run(id, "APPROVED")}
                              />
                            </>
                          )}
                          {kind === "groups" && (
                            <select
                              value=""
                              onChange={(e) => void run(id, e.target.value)}
                              className="rounded border px-2 py-1 text-xs"
                            >
                              <option value="">Set group status</option>
                              {["CANCELLED", "COMPLETED"].map((item) => (
                                <option key={item}>{item}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page + 1}
            totalPages={pages}
            onPageChange={(next) => setPage(next - 1)}
          />
        </>
      )}
      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        title={`${title} details`}
      >
        <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-[#faf7f4] p-4 text-xs">
          {detail ? JSON.stringify(detail, null, 2) : "No details available."}
        </pre>
      </Modal>
    </div>
  );
}
function Action({
  id,
  current,
  label,
  onClick,
}: {
  id: number;
  current: number | null;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={label === "Reject" || label === "Hide" ? "danger" : "secondary"}
      disabled={current === id}
      onClick={onClick}
    >
      {current === id ? (
        <LoaderCircle className="h-3 w-3 animate-spin" />
      ) : (
        label
      )}
    </Button>
  );
}
