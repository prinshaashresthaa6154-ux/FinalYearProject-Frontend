import { Eye, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getApiError } from "../api/axios";
import Pagination from "../components/Pagination";
import {
  Button,
  EmptyState,
  ErrorState,
  Modal,
  StatusBadge,
} from "../components/ui";
import {
  bookingService,
  type Payment,
  type PaymentMethod,
  type PaymentStatus,
} from "../services/bookingService";

const statuses: PaymentStatus[] = [
  "PENDING",
  "UNPAID",
  "INITIATED",
  "PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
];
const methods: PaymentMethod[] = ["KHALTI", "ESEWA", "STRIPE"];

export default function PaymentOperationsPage({
  superAdmin = false,
}: {
  superAdmin?: boolean;
}) {
  const [rows, setRows] = useState<Payment[]>([]);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);
  const [status, setStatus] = useState<PaymentStatus | "">("");
  const [method, setMethod] = useState<PaymentMethod | "">("");
  const [bookingId, setBookingId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paidFrom, setPaidFrom] = useState("");
  const [paidTo, setPaidTo] = useState("");
  const [sortBy, setSortBy] = useState("paymentDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<Payment | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await bookingService.payments({
        status,
        method,
        bookingId: bookingId ? Number(bookingId) : undefined,
        transactionId: transactionId || undefined,
        paidFrom: paidFrom ? `${paidFrom}T00:00:00Z` : undefined,
        paidTo: paidTo ? `${paidTo}T23:59:59Z` : undefined,
        page,
        size: 20,
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
  }, [
    bookingId,
    method,
    page,
    paidFrom,
    paidTo,
    sortBy,
    sortDir,
    status,
    transactionId,
  ]);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-[#b31919]">
          {superAdmin ? "Platform payments" : "Owned package payments"}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold">Payments</h1>
        <p className="mt-2 text-sm text-gray-500">
          View gateway transactions and payment state returned by the backend.
        </p>
      </header>
      <div className="grid gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={transactionId}
          onChange={(e) => {
            setTransactionId(e.target.value);
            setPage(0);
          }}
          placeholder="Transaction ID"
          className="rounded-lg border px-3 py-2.5 text-sm"
        />
        <input
          value={bookingId}
          onChange={(e) => {
            setBookingId(e.target.value);
            setPage(0);
          }}
          placeholder="Booking ID"
          type="number"
          min="1"
          className="rounded-lg border px-3 py-2.5 text-sm"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as PaymentStatus | "");
            setPage(0);
          }}
          className="rounded-lg border px-3 py-2.5 text-sm"
        >
          <option value="">All statuses</option>
          {statuses.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <select
          value={method}
          onChange={(e) => {
            setMethod(e.target.value as PaymentMethod | "");
            setPage(0);
          }}
          className="rounded-lg border px-3 py-2.5 text-sm"
        >
          <option value="">All methods</option>
          {methods.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <label className="text-xs font-semibold text-gray-500">
          Paid from
          <input
            value={paidFrom}
            onChange={(e) => {
              setPaidFrom(e.target.value);
              setPage(0);
            }}
            type="date"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-900"
          />
        </label>
        <label className="text-xs font-semibold text-gray-500">
          Paid to
          <input
            value={paidTo}
            onChange={(e) => {
              setPaidTo(e.target.value);
              setPage(0);
            }}
            type="date"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-900"
          />
        </label>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(0);
          }}
          className="rounded-lg border px-3 py-2.5 text-sm"
        >
          {[
            "paymentDate",
            "updatedAt",
            "amount",
            "paymentStatus",
            "paymentMethod",
            "transactionId",
            "id",
          ].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <select
          value={sortDir}
          onChange={(e) => {
            setSortDir(e.target.value as "asc" | "desc");
            setPage(0);
          }}
          className="rounded-lg border px-3 py-2.5 text-sm"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
      {error && <ErrorState message={error} onRetry={() => void load()} />}
      {loading ? (
        <div className="grid min-h-52 place-items-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-[#b31919]" />
        </div>
      ) : !error && rows.length === 0 ? (
        <EmptyState
          title="No payments found"
          description="No payments match the current filters."
        />
      ) : (
        !error && (
          <>
            <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-[#fcfaf7] text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Transaction</th>
                    <th className="px-4 py-3">Booking</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Amount</th>
                    {superAdmin && <th className="px-4 py-3">Commission</th>}
                    {superAdmin && <th className="px-4 py-3">Admin net</th>}
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-4 py-4 font-mono text-xs">
                        {payment.transactionId}
                      </td>
                      <td className="px-4 py-4">
                        #{payment.booking.bookingId}
                        <p className="text-xs text-gray-500">
                          {payment.booking.packageTitle}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        {payment.booking.userEmail ?? "-"}
                      </td>
                      <td className="px-4 py-4 font-semibold">
                        {payment.currency}{" "}
                        {Number(payment.amount).toLocaleString()}
                      </td>
                      {superAdmin && <td className="px-4 py-4 font-semibold text-[#b31919]">{payment.currency} {Number(payment.commissionAmount).toLocaleString()}</td>}
                      {superAdmin && <td className="px-4 py-4">{payment.currency} {Number(payment.adminNetAmount).toLocaleString()}</td>}
                      <td className="px-4 py-4">{payment.paymentMethod}</td>
                      <td className="px-4 py-4">
                        <StatusBadge status={payment.paymentStatus} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setDetail(payment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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
        open={detail !== null}
        title="Payment details"
        onClose={() => setDetail(null)}
      >
        {detail && (
          <div className="space-y-3 text-sm">
            <Detail label="Transaction" value={detail.transactionId} />
            <Detail label="Booking" value={`#${detail.booking.bookingId}`} />
            <Detail label="Customer" value={detail.booking.userEmail ?? "-"} />
            <Detail label="Package" value={detail.booking.packageTitle} />
            <Detail
              label="Amount"
              value={`${detail.currency} ${Number(detail.amount).toLocaleString()}`}
            />
            {superAdmin && <Detail label={`Platform commission (${Number(detail.commissionPercentage).toLocaleString()}%)`} value={`${detail.currency} ${Number(detail.commissionAmount).toLocaleString()}`} />}
            {superAdmin && <Detail label="Admin net amount" value={`${detail.currency} ${Number(detail.adminNetAmount).toLocaleString()}`} />}
            <Detail label="Method" value={detail.paymentMethod} />
            <Detail label="Status" value={detail.paymentStatus} />
            <Detail
              label="Gateway reference"
              value={detail.gatewayReference ?? "-"}
            />
            <Detail
              label="Failure reason"
              value={detail.failureReason ?? "-"}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex justify-between gap-4 border-b py-2 last:border-0">
      <span className="text-gray-500">{label}</span>
      <b className="text-right">{value}</b>
    </p>
  );
}
