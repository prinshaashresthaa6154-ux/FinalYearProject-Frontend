import { useNavigate } from "react-router";
import {
  Users,
  Briefcase,
  Compass,
  Map,
  CalendarCheck,
  Clock,
  CheckCircle2,
  Wallet,
  Plus,
  UserPlus,
  Megaphone,
  FileBarChart,
} from "lucide-react";
import { useAdminPlatform } from "../../../context/AdminPlatformContext";

export default function AdminOverview() {
  const navigate = useNavigate();
  const {
    users,
    guides,
    destinations,
    trips,
    bookings,
    reviews,
    notifications,
  } = useAdminPlatform();

  const pendingBookings = bookings.filter((b) => b.status === "Pending").length;
  const completedTrips = trips.filter((t) => t.status === "Completed").length;
  const activeGuides = guides.filter((g) => g.status === "Active").length;
  const tourists = users.filter((u) => u.role === "Tourist").length;

  const stats = [
    {
      label: "Total Users",
      value: String(tourists),
      icon: Users,
      iconColor: "text-red-500",
      bgIcon: "bg-red-50",
    },
    {
      label: "Total Guides",
      value: String(activeGuides),
      icon: Briefcase,
      iconColor: "text-teal-500",
      bgIcon: "bg-teal-50",
    },
    {
      label: "Destinations",
      value: String(destinations.length),
      icon: Compass,
      iconColor: "text-amber-500",
      bgIcon: "bg-amber-50",
    },
    {
      label: "Total Trips",
      value: String(trips.length),
      icon: Map,
      iconColor: "text-blue-500",
      bgIcon: "bg-blue-50",
    },
    {
      label: "Total Bookings",
      value: String(bookings.length),
      icon: CalendarCheck,
      iconColor: "text-indigo-500",
      bgIcon: "bg-indigo-50",
    },
    {
      label: "Pending Bookings",
      value: String(pendingBookings),
      icon: Clock,
      iconColor: "text-orange-500",
      bgIcon: "bg-orange-50",
    },
    {
      label: "Completed Trips",
      value: String(completedTrips),
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      bgIcon: "bg-emerald-50",
    },
    {
      label: "Revenue Overview",
      value: "NPR 42L",
      icon: Wallet,
      iconColor: "text-rose-500",
      bgIcon: "bg-rose-50",
    },
  ];

  const popularDestinations = [...destinations]
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 5);

  const bookingStats = [
    {
      label: "Approved",
      count: bookings.filter((b) => b.status === "Approved").length,
      color: "bg-[#b31919]",
    },
    { label: "Pending", count: pendingBookings, color: "bg-orange-400" },
    {
      label: "Completed",
      count: bookings.filter((b) => b.status === "Completed").length,
      color: "bg-emerald-500",
    },
    {
      label: "Cancelled",
      count: bookings.filter((b) => b.status === "Cancelled").length,
      color: "bg-gray-400",
    },
  ];
  const bookingTotal = Math.max(1, bookings.length);

  const recentBookings = bookings.slice(0, 4);
  const recentUsers = users.filter((u) => u.role === "Tourist").slice(0, 4);
  const recentReviews = reviews
    .filter((r) => r.visibility === "Visible")
    .slice(0, 3);
  const timeline = [
    ...bookings.slice(0, 2).map((b) => ({
      time: b.date,
      text: `Booking ${b.id}: ${b.tourist} → ${b.trip}`,
      tone: "booking",
    })),
    ...notifications.slice(0, 2).map((n) => ({
      time: n.createdAt,
      text: `Announcement: ${n.title}`,
      tone: "notice",
    })),
    ...reviews.slice(0, 2).map((r) => ({
      time: r.date,
      text: `Review by ${r.author} on ${r.target}`,
      tone: "review",
    })),
  ].slice(0, 6);

  const quickActions = [
    { label: "Add Destination", path: "/admin/destinations", icon: Plus },
    { label: "Create Trip", path: "/admin/trips", icon: Map },
    { label: "Manage Users", path: "/admin/users", icon: UserPlus },
    { label: "Send Notice", path: "/admin/notifications", icon: Megaphone },
    { label: "View Reports", path: "/admin/reports", icon: FileBarChart },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-[#eae3dc] rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[120px]"
            >
              <div className={`p-2.5 rounded-xl ${stat.bgIcon} w-fit`}>
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold tracking-tight text-[#1a130e] font-serif">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-400 font-medium mt-0.5">
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#1a130e] font-serif mb-5">
            Booking Statistics
          </h2>
          <div className="space-y-4">
            {bookingStats.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 font-medium">
                    {item.label}
                  </span>
                  <span className="text-gray-400 font-mono">{item.count}</span>
                </div>
                <div className="w-full bg-[#f3ede8] h-2 rounded-full overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full`}
                    style={{ width: `${(item.count / bookingTotal) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#1a130e] font-serif mb-5">
            Popular Destinations
          </h2>
          <div className="space-y-4">
            {popularDestinations.map((dest, idx) => (
              <div
                key={dest.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-gray-400 w-4">{idx + 1}.</span>
                  <span className="font-semibold text-[#2c2520] truncate">
                    {dest.title}
                  </span>
                </div>
                <span className="text-gray-400 tabular-nums shrink-0 ml-3">
                  {dest.reviews.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#1a130e] font-serif mb-5">
            Quick Actions
          </h2>
          <div className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => navigate(action.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#eae3dc] hover:bg-[#faf7f4] text-sm font-medium text-[#2c2520] transition"
                >
                  <Icon className="w-4 h-4 text-[#b31919]" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#f0eae4] flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1a130e] font-serif">
              Recent Bookings
            </h2>
            <button
              type="button"
              onClick={() => navigate("/admin/bookings")}
              className="text-sm text-[#b31919] hover:underline"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-[#f5efe9]">
            {recentBookings.map((b) => (
              <div
                key={b.id}
                className="px-5 py-3.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1a130e] truncate">
                    {b.tourist}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {b.trip} · {b.date}
                  </p>
                </div>
                <span
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                    b.status === "Pending"
                      ? "bg-[#1e2a44] text-white"
                      : b.status === "Approved" || b.status === "Completed"
                        ? "bg-[#b31919] text-white"
                        : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#f0eae4] flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1a130e] font-serif">
              Recent Users
            </h2>
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="text-sm text-[#b31919] hover:underline"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-[#f5efe9]">
            {recentUsers.map((u) => (
              <div
                key={u.id}
                className="px-5 py-3.5 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[#1a130e]">
                    {u.name}
                  </p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                    u.status === "Active"
                      ? "bg-[#b31919] text-white"
                      : "bg-gray-400 text-white"
                  }`}
                >
                  {u.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#f0eae4]">
            <h2 className="text-lg font-bold text-[#1a130e] font-serif">
              Recent Reviews
            </h2>
          </div>
          <div className="divide-y divide-[#f5efe9]">
            {recentReviews.map((r) => (
              <div key={r.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#1a130e]">
                    {r.author}
                  </p>
                  <span className="text-xs text-amber-500 font-medium">
                    {r.rating}★
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{r.target}</p>
                <p className="text-sm text-[#2c2520] mt-1 line-clamp-2">
                  {r.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#f0eae4]">
            <h2 className="text-lg font-bold text-[#1a130e] font-serif">
              Activity Timeline
            </h2>
          </div>
          <div className="divide-y divide-[#f5efe9]">
            {timeline.map((item, idx) => (
              <div key={idx} className="px-5 py-3.5 flex gap-3">
                <div className="w-2 h-2 rounded-full bg-[#b31919] mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm text-[#2c2520]">{item.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
