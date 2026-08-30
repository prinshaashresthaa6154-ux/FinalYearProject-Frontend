import { BarChart3, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ErrorState } from "../../../components/ui";
import { superadminService, type SuperadminDashboardData } from "../../../services/superadminService";

export default function Analytics() {
  const [data, setData] = useState<SuperadminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await superadminService.dashboard();
      setData(response.data.data ?? null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Reports could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <div className="grid min-h-52 place-items-center"><LoaderCircle className="h-8 w-8 animate-spin text-[#b31919]" /></div>;
  if (error || !data) return <ErrorState message={error || "Reports are unavailable."} onRetry={() => void load()} />;

  const paymentTotal = Object.values(data.paymentStatistics).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-[#b31919]">Platform analytics</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Reports</h1>
        <p className="mt-2 text-sm text-gray-500">Platform transaction volume and commission revenue returned by protected Superadmin APIs.</p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ReportCard label="Overall transactions" value={`NPR ${Number(data.overallTransactions).toLocaleString()}`} />
        <ReportCard label="Total revenue" value={`NPR ${Number(data.totalRevenue).toLocaleString()}`} />
        <ReportCard label="Total bookings" value={data.totalBookings} />
        <ReportCard label="Payment records" value={paymentTotal} />
      </div>
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-[#b31919]" />
          <h2 className="font-display text-2xl font-bold">Payment distribution</h2>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(data.paymentStatistics).map(([status, count]) => (
            <div key={status} className="rounded-xl bg-[#fcfaf7] p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{status}</p>
              <p className="mt-2 text-3xl font-bold">{count}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ReportCard({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p><p className="mt-3 font-display text-3xl font-bold">{value}</p></div>;
}
