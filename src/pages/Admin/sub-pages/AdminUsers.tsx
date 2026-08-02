import { useMemo, useState } from "react";
import { Search, Eye, UserX, UserCheck, Trash2, X } from "lucide-react";
import { useAdminPlatform } from "../../../context/AdminPlatformContext";
import type { PlatformUser, UserStatus } from "../../../data/adminPlatform";

const PAGE_SIZE = 5;

export default function AdminUsers() {
  const { users, bookings, reviews, updateUserStatus, deleteUser } =
    useAdminPlatform();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | UserStatus>("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<PlatformUser | null>(null);

  const filtered = useMemo(() => {
    return users
      .filter((u) => u.role === "Tourist" || u.role === "Admin")
      .filter((u) =>
        statusFilter === "All" ? true : u.status === statusFilter,
      )
      .filter(
        (u) =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.email.toLowerCase().includes(query.toLowerCase()) ||
          u.id.toLowerCase().includes(query.toLowerCase()),
      );
  }, [users, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const userBookings = selected
    ? bookings.filter((b) => b.tourist === selected.name)
    : [];
  const userReviews = selected
    ? reviews.filter((r) => r.author === selected.name)
    : [];

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#f0eae4]">
          <div>
            <h2 className="text-xl font-bold text-[#1a130e] font-serif">
              User Management
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Search, filter, suspend or remove platform users
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search users..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-[#b31919]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as "All" | UserStatus);
                setPage(1);
              }}
              className="bg-[#faf7f4] border border-[#dcd3cc] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#b31919]"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#fcfaf7] border-b border-[#f0eae4] text-xs font-semibold text-gray-400">
                <th className="py-3.5 px-6 font-medium">ID</th>
                <th className="py-3.5 px-6 font-medium">Name</th>
                <th className="py-3.5 px-6 font-medium">Email</th>
                <th className="py-3.5 px-6 font-medium">Role</th>
                <th className="py-3.5 px-6 font-medium">Status</th>
                <th className="py-3.5 px-6 font-medium">Joined</th>
                <th className="py-3.5 px-6 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5efe9]">
              {pageItems.map((user) => (
                <tr key={user.id} className="hover:bg-[#fdfcfb]">
                  <td className="py-4 px-6 text-xs font-mono text-gray-400">
                    {user.id}
                  </td>
                  <td className="py-4 px-6 text-sm font-semibold text-[#2c2520]">
                    {user.name}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-400">
                    {user.email}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#1d2d44] text-white">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === "Active"
                          ? "bg-[#b31919] text-white"
                          : "bg-gray-400 text-white"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-400">
                    {user.joined}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelected(user)}
                        className="text-gray-500 hover:text-[#1a130e]"
                        title="View profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateUserStatus(
                            user.id,
                            user.status === "Active" ? "Suspended" : "Active",
                          )
                        }
                        className="text-[#b31919] hover:text-red-800"
                        title={
                          user.status === "Active" ? "Suspend" : "Activate"
                        }
                      >
                        {user.status === "Active" ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete ${user.name}?`))
                            deleteUser(user.id);
                        }}
                        className="text-gray-400 hover:text-[#b31919]"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-[#f0eae4] flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Showing {pageItems.length} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-xs rounded-lg border border-[#dcd3cc] disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-xs text-gray-500 px-2 py-1.5">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-xs rounded-lg border border-[#dcd3cc] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#eae3dc] shadow-lg max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="p-5 border-b border-[#f0eae4] flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold font-serif text-[#1a130e]">
                  {selected.name}
                </h3>
                <p className="text-sm text-gray-400">{selected.email}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#faf7f4] rounded-xl p-3">
                  <p className="text-xs text-gray-400">Role</p>
                  <p className="font-semibold mt-0.5">{selected.role}</p>
                </div>
                <div className="bg-[#faf7f4] rounded-xl p-3">
                  <p className="text-xs text-gray-400">Status</p>
                  <p className="font-semibold mt-0.5">{selected.status}</p>
                </div>
                <div className="bg-[#faf7f4] rounded-xl p-3">
                  <p className="text-xs text-gray-400">Joined Trips</p>
                  <p className="font-semibold mt-0.5">{selected.trips}</p>
                </div>
                <div className="bg-[#faf7f4] rounded-xl p-3">
                  <p className="text-xs text-gray-400">Reviews</p>
                  <p className="font-semibold mt-0.5">{selected.reviews}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-[#1a130e] mb-2">
                  Booking History
                </h4>
                {userBookings.length === 0 ? (
                  <p className="text-gray-400 text-xs">No bookings</p>
                ) : (
                  <ul className="space-y-2">
                    {userBookings.map((b) => (
                      <li
                        key={b.id}
                        className="border border-[#eae3dc] rounded-lg px-3 py-2"
                      >
                        <p className="font-medium">{b.trip}</p>
                        <p className="text-xs text-gray-400">
                          {b.date} · {b.status} · {b.amount}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-[#1a130e] mb-2">Reviews</h4>
                {userReviews.length === 0 ? (
                  <p className="text-gray-400 text-xs">No reviews</p>
                ) : (
                  <ul className="space-y-2">
                    {userReviews.map((r) => (
                      <li
                        key={r.id}
                        className="border border-[#eae3dc] rounded-lg px-3 py-2"
                      >
                        <p className="font-medium">
                          {r.target} · {r.rating}★
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{r.text}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
