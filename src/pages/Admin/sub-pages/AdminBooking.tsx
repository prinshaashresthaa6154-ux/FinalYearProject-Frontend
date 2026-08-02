import { useState } from "react";
import { Search, Check, XCircle, Ban } from "lucide-react";
import { useAdminPlatform } from "../../../context/AdminPlatformContext";
import type { BookingStatus, PaymentStatus } from "../../../data/adminPlatform";

export default function AdminBookings() {
  const { bookings, updateBookingStatus, updatePaymentStatus } =
    useAdminPlatform();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | BookingStatus>(
    "All",
  );

  const filtered = bookings.filter((b) => {
    const matchStatus = statusFilter === "All" || b.status === statusFilter;
    const q = query.toLowerCase();
    const matchQuery =
      !q ||
      b.tourist.toLowerCase().includes(q) ||
      b.trip.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q);
    return matchStatus && matchQuery;
  });

  return (
    <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#f0eae4]">
        <div>
          <h2 className="text-xl font-bold text-[#1a130e] font-serif">
            Bookings
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Approve, reject, cancel and track payment status
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative sm:w-64">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bookings..."
              className="w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-[#b31919]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "All" | BookingStatus)
            }
            className="bg-[#faf7f4] border border-[#dcd3cc] rounded-lg px-3 py-2 text-sm"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-[#fcfaf7] border-b border-[#f0eae4] text-xs font-semibold text-gray-400">
              <th className="py-3.5 px-6 font-medium">ID</th>
              <th className="py-3.5 px-6 font-medium">Tourist</th>
              <th className="py-3.5 px-6 font-medium">Trip</th>
              <th className="py-3.5 px-6 font-medium">Guide</th>
              <th className="py-3.5 px-6 font-medium">Date</th>
              <th className="py-3.5 px-6 font-medium">Amount</th>
              <th className="py-3.5 px-6 font-medium">Payment</th>
              <th className="py-3.5 px-6 font-medium">Status</th>
              <th className="py-3.5 px-6 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5efe9]">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-[#fdfcfb]">
                <td className="py-4 px-6 text-xs font-mono text-gray-400">
                  {b.id}
                </td>
                <td className="py-4 px-6 text-sm font-semibold">{b.tourist}</td>
                <td className="py-4 px-6 text-sm text-gray-500">{b.trip}</td>
                <td className="py-4 px-6 text-sm text-gray-500">{b.guide}</td>
                <td className="py-4 px-6 text-sm text-gray-500">{b.date}</td>
                <td className="py-4 px-6 text-sm font-semibold">{b.amount}</td>
                <td className="py-4 px-6">
                  <select
                    value={b.payment}
                    onChange={(e) =>
                      updatePaymentStatus(b.id, e.target.value as PaymentStatus)
                    }
                    className="bg-[#faf7f4] border border-[#dcd3cc] rounded-md px-2 py-1 text-xs"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      b.status === "Pending"
                        ? "bg-[#1e2a44] text-white"
                        : b.status === "Approved" || b.status === "Completed"
                          ? "bg-[#b31919] text-white"
                          : "bg-gray-400 text-white"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex justify-center gap-2 flex-wrap">
                    {b.status === "Pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => updateBookingStatus(b.id, "Approved")}
                          className="inline-flex items-center gap-1 bg-[#b31919] text-white px-2.5 py-1 rounded-md text-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => updateBookingStatus(b.id, "Rejected")}
                          className="inline-flex items-center gap-1 text-[#b31919] text-xs font-medium"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </>
                    )}
                    {(b.status === "Approved" || b.status === "Pending") && (
                      <button
                        type="button"
                        onClick={() => updateBookingStatus(b.id, "Cancelled")}
                        className="inline-flex items-center gap-1 text-gray-500 text-xs hover:text-[#b31919]"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    )}
                    {b.status === "Approved" && (
                      <button
                        type="button"
                        onClick={() => updateBookingStatus(b.id, "Completed")}
                        className="text-xs text-emerald-700 font-medium hover:underline"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
