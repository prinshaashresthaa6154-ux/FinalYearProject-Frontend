import {
  BarChart3,
  CalendarRange,
  Filter,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { getApiError } from "../api/axios";
import { reportService, type ReportFilters } from "../services/reportService";
import type { AdminReport } from "../services/adminDashboardService";
import { ErrorState } from "../components/ui";
import Pagination from "../components/Pagination";
import { superadminService, type SuperadminDashboardData } from "../services/superadminService";

const emptyFilters: ReportFilters = {
  from: "",
  to: "",
  destination: "",
  category: "",
  trip: "",
  status: "",
};
const bookingStatuses = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
];
const paymentStatuses = [
  "UNPAID",
  "INITIATED",
  "PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
];
const tripStatuses = [
  "DRAFT",
  "PUBLISHED",
  "UNPUBLISHED",
  "FULL",
  "COMPLETED",
  "CANCELLED",
];
export default function ReportsDashboard({
  scope,
}: {
  scope: "admin" | "superadmin";
}) {
  const [filters, setFilters] = useState<ReportFilters>(emptyFilters);
  const [reports, setReports] = useState<
    [AdminReport, AdminReport, AdminReport, AdminReport] | null
  >(null);
  const [platform, setPlatform] = useState<SuperadminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(
    async (next: ReportFilters) => {
      setLoading(true);
      setError("");
      try {
        const responses =
          scope === "admin"
            ? await reportService.admin(next)
            : await reportService.superadmin(next);
        setReports(
          responses.map((response) => response.data.data ?? emptyReport()) as [
            AdminReport,
            AdminReport,
            AdminReport,
            AdminReport,
          ],
        );
        if (scope === "superadmin") {
          const platformResponse = await superadminService.dashboard();
          setPlatform(platformResponse.data.data ?? null);
        }
      } catch (requestError) {
        setError(getApiError(requestError).message);
      } finally {
        setLoading(false);
      }
    },
    [scope],
  );
  useEffect(() => {
    void load(emptyFilters);
  }, [load]);
  const update = (key: keyof ReportFilters, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));
  const apply = () => void load(filters);
  const clear = () => {
    setFilters(emptyFilters);
    void load(emptyFilters);
  };
  if (loading && !reports)
    return (
      <div className="grid min-h-[55vh] place-items-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-[#b31919]" />
      </div>
    );
  if (error && !reports)
    return <ErrorState message={error} onRetry={() => void load(filters)} />;
  const [bookings, revenue, trips, users] = reports ?? [
    emptyReport(),
    emptyReport(),
    emptyReport(),
    emptyReport(),
  ];
  const statusOptions = [...new Set([...bookingStatuses, ...paymentStatuses, ...tripStatuses])];
  const invalidRange = Boolean(filters.from && filters.to && new Date(filters.from) > new Date(filters.to));
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#b31919]">
            {scope === "admin"
              ? "Owner-scoped reporting"
              : "Platform reporting"}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold">Reports</h1>
          <p className="mt-2 text-sm text-gray-500">
            Aggregated values and series are returned by the backend. No
            sensitive totals are calculated in React.
          </p>
        </div>
        <Link
          to={scope === "admin" ? "/admin/reports" : "/superadmin/reports"}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#b31919]"
        >
          <BarChart3 className="h-4 w-4" /> Current report view
        </Link>
      </header>
      <section className="rounded-2xl border border-[#e5ddd6] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#b31919]" />
          <h2 className="font-display text-xl font-bold">Filters</h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <Field label="From">
            <input
              type="datetime-local"
              value={toLocal(filters.from)}
              onChange={(e) =>
                update(
                  "from",
                  e.target.value ? new Date(e.target.value).toISOString() : "",
                )
              }
            />
          </Field>
          <Field label="To">
            <input
              type="datetime-local"
              value={toLocal(filters.to)}
              onChange={(e) =>
                update(
                  "to",
                  e.target.value ? new Date(e.target.value).toISOString() : "",
                )
              }
            />
          </Field>
          <Field label="Destination ID">
            <input
              type="number"
              min="1"
              value={filters.destination}
              onChange={(e) => update("destination", e.target.value)}
              placeholder="Any"
            />
          </Field>
          <Field label="Category ID">
            <input
              type="number"
              min="1"
              value={filters.category}
              onChange={(e) => update("category", e.target.value)}
              placeholder="Any"
            />
          </Field>
          <Field label="Trip ID">
            <input
              type="number"
              min="1"
              value={filters.trip}
              onChange={(e) => update("trip", e.target.value)}
              placeholder="Any"
            />
          </Field>
          <Field label="Status">
            <select
              value={filters.status}
              onChange={(e) => update("status", e.target.value)}
            >
              <option value="">All statuses</option>
              {statusOptions.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={apply}
            disabled={invalidRange}
            className="inline-flex items-center gap-2 rounded-lg bg-[#b31919] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CalendarRange className="h-4 w-4" /> Apply filters
          </button>
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold"
          >
            <RefreshCw className="h-4 w-4" /> Clear
          </button>
          {loading && (
            <span className="self-center text-xs text-gray-500">
              Refreshing reports...
            </span>
          )}
          {invalidRange && <span className="self-center text-xs font-semibold text-red-700">The from date must be before the to date.</span>}
        </div>
      </section>
      {error && reports && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      <div className={`grid gap-5 sm:grid-cols-2 ${scope === "superadmin" ? "lg:grid-cols-4 xl:grid-cols-7" : "lg:grid-cols-4"}`}>
        <Kpi report={bookings} label="Bookings" metricKey="totalBookings" />
        <Kpi report={revenue} label="Revenue" metricKey="paidRevenue" currency />
        <Kpi report={trips} label="Trips" metricKey="totalTrips" />
        <Kpi report={users} label="Customers" metricKey="uniqueCustomers" />
        {scope === "superadmin" && <><DirectKpi label="Admins" value={platform?.totalAdmins ?? 0} /><DirectKpi label="Guides" value={platform?.totalGuides ?? 0} /><DirectKpi label="Payments" value={platform ? Object.values(platform.paymentStatistics).reduce((sum, value) => sum + value, 0) : 0} /></>}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <ReportPanel
          title="Booking trend"
          report={bookings}
          series="timeSeries"
        />
        <ReportPanel
          title="Revenue trend"
          report={revenue}
          series="timeSeries"
          currency
        />
        <ReportPanel title="Trip performance" report={trips} ranked />
        <ReportPanel
          title="User / customer activity"
          report={users}
          series="timeSeries"
        />
      </div>
      <AggregateTable reports={[bookings, revenue, trips, users]} />
    </div>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
        {label}
      </span>
      {children}
    </label>
  );
}
function Kpi({
  report,
  label,
  metricKey,
  currency = false,
}: {
  report: AdminReport;
  label: string;
  metricKey: string;
  currency?: boolean;
}) {
  const primary = report.summary.find((item) => item.key === metricKey);
  const value = primary ? Number(primary.value) : 0;
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-3 break-words font-display text-3xl font-bold">
        {currency ? `NPR ${value.toLocaleString()}` : value.toLocaleString()}
      </p>
      <p className="mt-1 text-xs text-gray-500">
        Backend summary: {primary?.key ?? "No data"}
      </p>
    </div>
  );
}
function DirectKpi({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p><p className="mt-3 font-display text-3xl font-bold">{value.toLocaleString()}</p><p className="mt-1 text-xs text-gray-500">Backend platform aggregate</p></div>; }
function AggregateTable({ reports }: { reports: AdminReport[] }) { const [page, setPage] = useState(1); const size = 8; const rows = reports.flatMap((report) => [...report.summary.map((item) => ({ report: report.reportType, metric: item.key, value: Number(item.value), count: null as number | null })), ...report.statusSeries.map((item) => ({ report: report.reportType, metric: item.label, value: Number(item.value), count: Number(item.count) }))]); const pages = Math.max(1, Math.ceil(rows.length / size)); const visible = rows.slice((page - 1) * size, page * size); return <section className="overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="p-6"><h2 className="font-display text-2xl font-bold">Aggregated report table</h2><p className="mt-2 text-sm text-gray-500">Summary and status rows exactly as returned by the backend.</p></div>{rows.length === 0 ? <div className="px-6 pb-8"><NoData /></div> : <><div className="overflow-x-auto"><table className="min-w-[650px] w-full text-left"><thead className="bg-[#fcfaf7] text-xs uppercase text-gray-500"><tr><th className="px-5 py-3">Report</th><th className="px-5 py-3">Metric / status</th><th className="px-5 py-3">Value</th><th className="px-5 py-3">Count</th></tr></thead><tbody className="divide-y">{visible.map((row, index) => <tr key={`${row.report}-${row.metric}-${index}`}><td className="px-5 py-4 text-sm font-bold">{row.report}</td><td className="px-5 py-4 text-sm">{row.metric}</td><td className="px-5 py-4 text-sm">{row.value.toLocaleString()}</td><td className="px-5 py-4 text-sm">{row.count == null ? "-" : row.count.toLocaleString()}</td></tr>)}</tbody></table></div><div className="px-5 pb-5"><Pagination page={page} totalPages={pages} onPageChange={setPage} /></div></>}</section>; }
function ReportPanel({
  title,
  report,
  series,
  ranked,
  currency = false,
}: {
  title: string;
  report: AdminReport;
  series?: "timeSeries" | "statusSeries";
  ranked?: boolean;
  currency?: boolean;
}) {
  const [rankedPage, setRankedPage] = useState(1);
  const rankedPageSize = 5;
  const rankedPages = Math.max(1, Math.ceil(report.rankedItems.length / rankedPageSize));
  const rankedRows = report.rankedItems.slice((rankedPage - 1) * rankedPageSize, rankedPage * rankedPageSize);
  if (ranked)
    return (
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl font-bold">{title}</h2>
        <div className="mt-5 space-y-4">
          {report.rankedItems.length ? (
            rankedRows.map((item) => (
              <div key={item.id}>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="truncate font-semibold">{item.label}</span>
                  <span className="shrink-0 text-gray-500">
                    {item.count} · {item.currency || "NPR"}{" "}
                    {Number(item.amount).toLocaleString()}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-[#b31919]"
                    style={{
                      width: `${Math.min(100, (item.count / Math.max(1, ...report.rankedItems.map((row) => row.count))) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <NoData />
          )}
        </div>
        <Pagination page={rankedPage} totalPages={rankedPages} onPageChange={setRankedPage} />
      </section>
    );
  const points = report[series ?? "timeSeries"];
  const max = Math.max(
    1,
    ...points.map((point) =>
      Number(series === "statusSeries" ? point.count : point.value),
    ),
  );
  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <div className="mt-6 flex h-52 items-end gap-2 overflow-x-auto border-b border-[#ddd4cc]">
        {points.length ? (
          points.map((point) => {
            const value = Number(
              series === "statusSeries" ? point.count : point.value,
            );
            return (
              <div
                key={point.label}
                className="flex min-w-12 flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-[10px] text-gray-500">
                  {currency ? compact(value) : value}
                </span>
                <div
                  className="w-full max-w-12 rounded-t bg-[#b31919]"
                  style={{ height: `${Math.max(4, (value / max) * 160)}px` }}
                />
                <span className="max-w-20 truncate text-[10px] text-gray-400">
                  {point.label}
                </span>
              </div>
            );
          })
        ) : (
          <div className="grid w-full place-items-center pb-10">
            <NoData />
          </div>
        )}
      </div>
    </section>
  );
}
function NoData() {
  return (
    <p className="text-sm text-gray-500">No aggregated data for this filter.</p>
  );
}
function emptyReport(): AdminReport {
  return {
    reportType: "",
    summary: [],
    statusSeries: [],
    timeSeries: [],
    rankedItems: [],
  };
}
function compact(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
function toLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}
