import { LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getApiError } from "../api/axios";
import { EmptyState, ErrorState, StatusBadge } from "../components/ui";
import { guideBookingService, type GuideBooking } from "../services/guideBookingService";

const money = (currency: string | null | undefined, value: number | null | undefined) =>
  `${currency || "NPR"} ${Number(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function GuideBookingOperations() {
  const [rows, setRows] = useState<GuideBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await guideBookingService.operations(0, 100);
      setRows(response.data.data?.content ?? []);
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <div className="grid min-h-64 place-items-center"><LoaderCircle className="h-8 w-8 animate-spin text-[#a62922]" /></div>;

  const accepted = rows.filter((row) => row.status === "CONFIRMED");
  const commission = accepted.reduce((sum, row) => sum + Number(row.commissionAmount ?? 0), 0);
  const guideRevenue = accepted.reduce((sum, row) => sum + Number(row.guideNetAmount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#a62922]">Freelance guide finance</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Guide booking commissions</h1>
        <p className="mt-2 text-sm text-gray-500">Acceptance-time price and commission snapshots for direct guide services.</p>
      </div>
      {error ? <ErrorState message={error} onRetry={() => void load()} /> : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Metric label="Accepted bookings" value={String(accepted.length)} />
            <Metric label="Platform commission" value={money(accepted[0]?.currency, commission)} />
            <Metric label="Guide net revenue" value={money(accepted[0]?.currency, guideRevenue)} />
          </div>
          {rows.length === 0 ? <EmptyState title="No direct guide requests" description="Guide booking financial records will appear after travelers submit requests." /> : (
            <div className="overflow-x-auto rounded-2xl border border-[#e5ddd6] bg-white shadow-sm">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-[#faf7f4] text-xs uppercase tracking-wide text-gray-500"><tr><th className="p-4">Guide / traveler</th><th className="p-4">Destination</th><th className="p-4">Service</th><th className="p-4">Gross</th><th className="p-4">Commission</th><th className="p-4">Guide net</th><th className="p-4">Payment</th><th className="p-4">Request</th></tr></thead>
                <tbody className="divide-y divide-[#eee7e1]">
                  {rows.map((row) => <tr key={row.id}><td className="p-4"><p className="font-semibold">{row.guide.name}</p><p className="text-xs text-gray-500">Traveler: {row.user.name}</p></td><td className="p-4">{row.destination?.name ?? "-"}</td><td className="p-4"><p>{row.billableDays ?? "-"} day(s)</p><p className="text-xs text-gray-500">{money(row.currency, row.dailyRate)} / day</p></td><td className="p-4 font-semibold">{money(row.currency, row.totalAmount)}</td><td className="p-4 font-semibold text-[#a62922]">{money(row.currency, row.commissionAmount)}<p className="text-xs font-normal text-gray-500">{Number(row.commissionPercentage ?? 0)}%</p></td><td className="p-4">{money(row.currency, row.guideNetAmount)}</td><td className="p-4"><StatusBadge status={row.paymentStatus || "NOT QUOTED"} /></td><td className="p-4"><StatusBadge status={row.status} /></td></tr>)}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-[#e5ddd6] bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p><p className="mt-2 text-2xl font-bold text-[#251c17]">{value}</p></div>;
}
