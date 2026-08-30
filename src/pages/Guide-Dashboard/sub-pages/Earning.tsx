import { CheckCircle2, Clock, LoaderCircle, ReceiptText, Wallet } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getApiError } from "../../../api/axios";
import { EmptyState, ErrorState, StatusBadge } from "../../../components/ui";
import { guideBookingService, type GuideBooking } from "../../../services/guideBookingService";

const money = (booking: GuideBooking, amount: number | null | undefined) =>
  `${booking.currency || "NPR"} ${Number(amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Earnings() {
  const [rows, setRows] = useState<GuideBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await guideBookingService.requests(0, 100);
      setRows((response.data.data?.content ?? []).filter((row) => row.type === "DIRECT" && row.status === "CONFIRMED"));
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  if (loading) return <div className="grid min-h-64 place-items-center"><LoaderCircle className="h-8 w-8 animate-spin text-[#a62922]" /></div>;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  const paid = rows.filter((row) => row.paymentStatus === "PAID");
  const unpaid = rows.filter((row) => row.paymentStatus !== "PAID");
  const paidNet = paid.reduce((sum, row) => sum + Number(row.guideNetAmount ?? 0), 0);
  const pendingNet = unpaid.reduce((sum, row) => sum + Number(row.guideNetAmount ?? 0), 0);
  const commission = rows.reduce((sum, row) => sum + Number(row.commissionAmount ?? 0), 0);
  const currency = rows[0]?.currency || "NPR";
  const format = (value: number) => `${currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return <div className="space-y-6">
    <div><p className="text-xs font-bold uppercase tracking-widest text-[#a62922]">Direct guide services</p><h1 className="mt-1 font-display text-3xl font-bold">Earnings and commission</h1><p className="mt-2 text-sm text-gray-500">Amounts are fixed when you accept a request. Platform commission is deducted from your gross service fee.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Metric icon={Wallet} label="Paid guide revenue" value={format(paidNet)} />
      <Metric icon={Clock} label="Awaiting payment" value={format(pendingNet)} />
      <Metric icon={ReceiptText} label="Platform commission" value={format(commission)} />
      <Metric icon={CheckCircle2} label="Accepted requests" value={String(rows.length)} />
    </div>
    {rows.length === 0 ? <EmptyState title="No accepted requests" description="Accepted direct bookings and their financial split will appear here." /> : <div className="overflow-x-auto rounded-2xl border border-[#eae3dc] bg-white shadow-sm"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-[#faf7f4] text-xs uppercase text-gray-500"><tr><th className="p-4">Traveler</th><th className="p-4">Destination</th><th className="p-4">Service fee</th><th className="p-4">Commission</th><th className="p-4">Your revenue</th><th className="p-4">Payment</th></tr></thead><tbody className="divide-y">{rows.map((row) => <tr key={row.id}><td className="p-4 font-semibold">{row.user.name}</td><td className="p-4">{row.destination?.name}</td><td className="p-4">{money(row, row.totalAmount)}<p className="text-xs text-gray-500">{row.billableDays} day(s)</p></td><td className="p-4">{money(row, row.commissionAmount)} <span className="text-xs text-gray-500">({row.commissionPercentage}%)</span></td><td className="p-4 font-semibold text-[#a62922]">{money(row, row.guideNetAmount)}</td><td className="p-4"><StatusBadge status={row.paymentStatus || "UNPAID"} /></td></tr>)}</tbody></table></div>}
  </div>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof Wallet; label: string; value: string }) {
  return <div className="rounded-2xl border border-[#eae3dc] bg-white p-5 shadow-sm"><Icon className="h-5 w-5 text-[#a62922]" /><p className="mt-3 text-2xl font-bold">{value}</p><p className="mt-1 text-xs font-semibold text-gray-500">{label}</p></div>;
}
