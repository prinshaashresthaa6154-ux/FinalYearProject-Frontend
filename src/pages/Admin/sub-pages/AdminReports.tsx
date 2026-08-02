import { Download, FileText } from "lucide-react";
import { useAdminPlatform } from "../../../context/AdminPlatformContext";

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminReports() {
  const { bookings, trips, users, destinations, guides } = useAdminPlatform();

  const revenueEstimate =
    bookings.filter((b) => b.payment === "Paid").length * 850;

  const reports = [
    {
      title: "Bookings Report",
      desc: `${bookings.length} bookings · export tourist, trip, status, payment`,
      onExport: () =>
        downloadCsv("bookings-report.csv", [
          [
            "ID",
            "Tourist",
            "Trip",
            "Guide",
            "Date",
            "Amount",
            "Status",
            "Payment",
          ],
          ...bookings.map((b) => [
            b.id,
            b.tourist,
            b.trip,
            b.guide,
            b.date,
            b.amount,
            b.status,
            b.payment,
          ]),
        ]),
    },
    {
      title: "Revenue Report",
      desc: `Approx $${revenueEstimate.toLocaleString()} from paid bookings`,
      onExport: () =>
        downloadCsv("revenue-report.csv", [
          ["Metric", "Value"],
          [
            "Paid bookings",
            String(bookings.filter((b) => b.payment === "Paid").length),
          ],
          [
            "Unpaid bookings",
            String(bookings.filter((b) => b.payment === "Unpaid").length),
          ],
          [
            "Refunded",
            String(bookings.filter((b) => b.payment === "Refunded").length),
          ],
          ["Estimated revenue (USD)", String(revenueEstimate)],
        ]),
    },
    {
      title: "Trips Report",
      desc: `${trips.length} trips across ${destinations.length} destinations`,
      onExport: () =>
        downloadCsv("trips-report.csv", [
          [
            "ID",
            "Title",
            "Destination",
            "Guide",
            "Start",
            "End",
            "Capacity",
            "Price",
            "Status",
          ],
          ...trips.map((t) => [
            String(t.id),
            t.title,
            t.destination,
            t.guideName,
            t.startDate,
            t.endDate,
            `${t.booked}/${t.capacity}`,
            String(t.price),
            t.status,
          ]),
        ]),
    },
    {
      title: "Users Report",
      desc: `${users.length} accounts · ${guides.length} guides tracked`,
      onExport: () =>
        downloadCsv("users-report.csv", [
          ["ID", "Name", "Email", "Role", "Status", "Joined"],
          ...users.map((u) => [
            u.id,
            u.name,
            u.email,
            u.role,
            u.status,
            u.joined,
          ]),
        ]),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1a130e] font-serif">Reports</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Generate and export CSV reports from live admin data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <div
            key={report.title}
            className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm p-6 flex flex-col"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50">
                <FileText className="w-5 h-5 text-[#b31919]" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-[#1a130e] font-serif">
                  {report.title}
                </h3>
                <p className="text-sm text-gray-400 mt-1">{report.desc}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={report.onExport}
              className="mt-5 inline-flex items-center justify-center gap-1.5 bg-[#b31919] hover:bg-[#941414] text-white px-4 py-2 rounded-lg text-sm font-medium w-full sm:w-auto self-start"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
