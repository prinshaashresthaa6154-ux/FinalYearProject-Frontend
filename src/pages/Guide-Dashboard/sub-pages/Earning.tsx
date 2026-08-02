import { Wallet, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

const summary = [
  {
    label: "Total Earnings",
    value: "$28,400",
    icon: Wallet,
    iconColor: "text-emerald-600",
    bgIcon: "bg-emerald-50",
  },
  {
    label: "This Month",
    value: "$3,840",
    icon: TrendingUp,
    iconColor: "text-blue-500",
    bgIcon: "bg-blue-50",
  },
  {
    label: "Pending Payout",
    value: "$1,120",
    icon: Clock,
    iconColor: "text-amber-500",
    bgIcon: "bg-amber-50",
  },
  {
    label: "Paid Out",
    value: "$27,280",
    icon: CheckCircle2,
    iconColor: "text-rose-500",
    bgIcon: "bg-rose-50",
  },
];

const monthly = [
  { month: "March 2026", amount: "$3,840", trips: 4 },
  { month: "February 2026", amount: "$2,960", trips: 3 },
  { month: "January 2026", amount: "$2,240", trips: 2 },
  { month: "December 2025", amount: "$4,100", trips: 5 },
];

const transactions = [
  {
    id: 1,
    trip: "Everest Base Camp Trek",
    client: "Sarah Johnson",
    date: "2026-03-28",
    amount: "$1,120",
    status: "Paid",
  },
  {
    id: 2,
    trip: "Annapurna Circuit",
    client: "Mark Thompson",
    date: "2026-03-20",
    amount: "$960",
    status: "Pending",
  },
  {
    id: 3,
    trip: "Langtang Valley Trek",
    client: "Yuki Harada",
    date: "2026-03-12",
    amount: "$560",
    status: "Paid",
  },
  {
    id: 4,
    trip: "Manaslu Circuit",
    client: "James Wilson",
    date: "2026-02-28",
    amount: "$1,280",
    status: "Paid",
  },
];

export default function Earnings() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="bg-white border border-[#eae3dc] rounded-2xl p-5 shadow-sm flex items-start gap-4"
            >
              <div className={`p-2.5 rounded-xl ${item.bgIcon} shrink-0`}>
                <Icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight text-[#1a130e] font-serif">
                  {item.value}
                </div>
                <div className="text-xs text-gray-400 font-medium mt-0.5">
                  {item.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#1a130e] font-serif mb-4">
            Revenue by Month
          </h2>
          <div className="space-y-3">
            {monthly.map((item) => (
              <div
                key={item.month}
                className="flex items-center justify-between rounded-xl bg-[#f7f3ef] px-4 py-3.5"
              >
                <div>
                  <span className="text-sm font-medium text-[#2c2520]">
                    {item.month}
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.trips} trips
                  </p>
                </div>
                <span className="text-sm font-semibold text-[#b31919] tabular-nums">
                  {item.amount}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 pb-4">
            <h2 className="text-lg font-bold text-[#1a130e] font-serif">
              Recent Transactions
            </h2>
          </div>
          <div className="divide-y divide-[#f5efe9]">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between gap-3 px-6 py-3.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1a130e] truncate">
                    {tx.trip}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {tx.client} · {tx.date}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-[#1a130e]">
                    {tx.amount}
                  </p>
                  <span
                    className={`text-xs font-medium ${
                      tx.status === "Paid"
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
