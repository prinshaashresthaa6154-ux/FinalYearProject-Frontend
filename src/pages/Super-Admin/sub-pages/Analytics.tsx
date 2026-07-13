const topDestinations = [
  { rank: 1, name: "Everest Base Camp", count: "4,521" },
  { rank: 2, name: "Pokhara", count: "3,890" },
  { rank: 3, name: "Kathmandu Valley", count: "3,450" },
  { rank: 4, name: "Chitwan", count: "2,100" },
  { rank: 5, name: "Lumbini", count: "1,850" },
];

const revenueByMonth = [
  { month: "March 2026", amount: "NPR 18.5L" },
  { month: "February 2026", amount: "NPR 15.2L" },
  { month: "January 2026", amount: "NPR 11.5L" },
];

const bookingTrends = [
  { label: "This Month", value: "842", change: "+18%", positive: true },
  { label: "Last Month", value: "714", change: "+12%", positive: true },
  {
    label: "Cancellation Rate",
    value: "3.2%",
    change: "-0.5%",
    positive: false,
  },
  { label: "Avg. Booking Value", value: "$680", change: "+5%", positive: true },
];

export default function Analytics() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Top Destinations */}
      <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-[#1a130e] tracking-tight font-serif mb-5">
          Top Destinations
        </h2>
        <div className="space-y-4">
          {topDestinations.map((dest) => (
            <div
              key={dest.rank}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-gray-400 font-medium w-4 shrink-0">
                  {dest.rank}.
                </span>
                <span className="font-semibold text-[#2c2520] truncate">
                  {dest.name}
                </span>
              </div>
              <span className="text-gray-400 font-medium tabular-nums shrink-0 ml-3">
                {dest.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by Month */}
      <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-[#1a130e] tracking-tight font-serif mb-5">
          Revenue by Month
        </h2>
        <div className="space-y-3">
          {revenueByMonth.map((item) => (
            <div
              key={item.month}
              className="flex items-center justify-between rounded-xl bg-[#f7f3ef] px-4 py-3.5"
            >
              <span className="text-sm font-medium text-[#2c2520]">
                {item.month}
              </span>
              <span className="text-sm font-semibold text-[#b31919] tabular-nums">
                {item.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Trends */}
      <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-[#1a130e] tracking-tight font-serif mb-5">
          Booking Trends
        </h2>
        <div className="space-y-5">
          {bookingTrends.map((trend) => (
            <div
              key={trend.label}
              className="flex items-center justify-between text-sm"
            >
              <span className="font-medium text-[#2c2520]">{trend.label}</span>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="font-semibold text-[#1a130e] tabular-nums">
                  {trend.value}
                </span>
                <span
                  className={`text-xs font-medium tabular-nums ${
                    trend.positive ? "text-emerald-600" : "text-[#b31919]"
                  }`}
                >
                  {trend.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
