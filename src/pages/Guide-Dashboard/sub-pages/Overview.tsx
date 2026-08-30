import { CalendarCheck, CircleDollarSign, LoaderCircle, MessageSquare, Mountain, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getApiError } from "../../../api/axios";
import { Button, EmptyState, ErrorState } from "../../../components/ui";
import { guideDashboardService, type GuideDashboardData } from "../../../services/guideDashboardService";

export default function GuideOverview() {
  const [dashboard, setDashboard] = useState<GuideDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await guideDashboardService.get();
      setDashboard(response.data.data);
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <div className="grid min-h-64 place-items-center"><LoaderCircle className="h-8 w-8 animate-spin text-[#b31919]" /></div>;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  return <div className="space-y-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-[#b31919]">Guide dashboard</p><h2 className="mt-2 font-display text-3xl font-bold text-[#1a130e]">Your performance</h2><p className="mt-2 text-sm text-[#66717c]">Current statistics from your guide account.</p></div><Button type="button" variant="secondary" onClick={() => void load()}><RefreshCw className="h-4 w-4" /> Refresh</Button></div>{!dashboard ? <EmptyState title="No dashboard statistics available" description="Statistics will appear after guide activity is recorded." /> : <><div className="grid gap-4 sm:grid-cols-3"><Metric icon={CircleDollarSign} value={new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(dashboard.revenue)} label="Revenue" /><Metric icon={CalendarCheck} value={dashboard.bookings.toLocaleString()} label="Bookings" /><Metric icon={MessageSquare} value={dashboard.unreadMessages.toLocaleString()} label="Unread messages" /></div><section className="rounded-lg border border-[#e2d9d1] bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><Mountain className="h-5 w-5 text-[#b31919]" /><div><h3 className="font-display text-xl font-bold">Upcoming trips</h3><p className="text-sm text-[#7b7068]">{dashboard.upcomingTrips.length} upcoming trip{dashboard.upcomingTrips.length === 1 ? "" : "s"}</p></div></div>{dashboard.upcomingTrips.length === 0 ? <p className="mt-5 text-sm text-[#66717c]">No upcoming trips scheduled.</p> : <div className="mt-5 grid gap-3 sm:grid-cols-2">{dashboard.upcomingTrips.map((trip, index) => <div key={trip.id ?? index} className="rounded-lg border border-[#eee7e1] p-4"><p className="font-semibold">{trip.title ?? trip.tripName ?? trip.name ?? "Untitled trip"}</p>{trip.date !== undefined && <p className="mt-1 text-sm text-[#66717c]">{trip.date}</p>}</div>)}</div>}</section></>}</div>;
}

function Metric({ icon: Icon, value, label }: { icon: typeof CircleDollarSign; value: string; label: string }) {
  return <section className="flex min-h-32 items-start gap-4 rounded-lg border border-[#e2d9d1] bg-white p-5 shadow-sm"><div className="rounded-lg bg-[#f9ecea] p-2.5 text-[#b31919]"><Icon className="h-5 w-5" /></div><div className="min-w-0"><p className="break-words font-display text-2xl font-bold text-[#1a130e]">{value}</p><p className="mt-1 text-xs font-semibold text-[#7b7068]">{label}</p></div></section>;
}
