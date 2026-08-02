import {
  Mountain,
  Star,
  MessageSquare,
  CreditCard,
  Calendar,
  Check,
  MessageCircle,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";

const stats = [
  {
    label: "Total Trips",
    value: "380",
    icon: Mountain,
    iconColor: "text-rose-500",
    bgIcon: "bg-rose-50",
  },
  {
    label: "Rating",
    value: "4.9",
    icon: Star,
    iconColor: "text-amber-500",
    bgIcon: "bg-amber-50",
  },
  {
    label: "Reviews",
    value: "245",
    icon: MessageSquare,
    iconColor: "text-blue-500",
    bgIcon: "bg-blue-50",
  },
  {
    label: "Total Earnings",
    value: "$28,400",
    icon: CreditCard,
    iconColor: "text-emerald-600",
    bgIcon: "bg-emerald-50",
  },
];

const upcomingTrips = [
  {
    id: 1,
    name: "Annapurna Circuit",
    tourist: "Sarah Johnson",
    duration: "12 days",
    date: "2026-04-20",
    status: "Confirmed",
    price: "$960",
  },
  {
    id: 2,
    name: "Everest Base Camp",
    tourist: "James Wilson",
    duration: "14 days",
    date: "2026-05-05",
    status: "Confirmed",
    price: "$1,120",
  },
];

const joinRequests = [
  {
    id: 1,
    initials: "EC",
    name: "Emily Chen",
    paid: true,
    location: "Singapore",
    date: "Mar 22, 2026",
    trip: "Everest Base Camp Group Trek",
  },
  {
    id: 2,
    initials: "DK",
    name: "David Kim",
    paid: true,
    location: "South Korea",
    date: "Mar 22, 2026",
    trip: "Everest Base Camp Group Trek",
  },
];

export default function GuideOverview() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-[#eae3dc] rounded-2xl p-5 shadow-sm flex items-start gap-4"
            >
              <div className={`p-2.5 rounded-xl ${stat.bgIcon} shrink-0`}>
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div>
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

      {/* Upcoming Trips */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#1a130e] tracking-tight font-serif">
            Upcoming Trips
          </h2>
          <button
            type="button"
            onClick={() => navigate("/guidedashboard/trips")}
            className="text-sm font-medium text-[#b31919] hover:underline"
          >
            View All
          </button>
        </div>

        <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm overflow-hidden divide-y divide-[#f0eae4]">
          {upcomingTrips.map((trip) => (
            <div
              key={trip.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4"
            >
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-[#1a130e] font-serif">
                  {trip.name}
                </h3>
                <p className="text-sm text-gray-400 mt-0.5">
                  Tourist: {trip.tourist} • {trip.duration}
                </p>
                <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{trip.date}</span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#b31919] text-white">
                  {trip.status}
                </span>
                <span className="text-lg font-bold text-[#1a130e] font-serif">
                  {trip.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Group Trip Join Requests */}
      <section>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1a130e] tracking-tight font-serif">
              Group Trip Join Requests
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Approve to add tourists to the group chat
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/guidedashboard/requests")}
            className="text-sm font-medium text-[#b31919] hover:underline shrink-0"
          >
            View All
          </button>
        </div>

        <div className="space-y-3">
          {joinRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm px-5 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-[#1e2a44] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                  {req.initials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#1a130e]">
                      {req.name}
                    </span>
                    {req.paid && (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-[#b31919] text-white">
                        Paid
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {req.location} • {req.date}
                  </p>
                  <p className="text-sm text-[#2c2520] mt-1">
                    Trip: {req.trip}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 bg-[#b31919] hover:bg-[#941414] text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  <Check className="w-4 h-4" />
                  Approve & Add
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 border border-[#dcd3cc] text-[#6e5e54] hover:bg-[#faf7f4] px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </button>
                <button
                  type="button"
                  className="p-2 text-[#b31919] hover:bg-red-50 rounded-lg transition"
                  aria-label={`Decline ${req.name}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
