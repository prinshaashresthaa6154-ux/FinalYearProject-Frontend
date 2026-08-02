import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";

type TripStatus = "Confirmed" | "Pending" | "Completed" | "Cancelled";

interface Trip {
  id: number;
  tourist: string;
  package: string;
  startDate: string;
  duration: string;
  earnings: string;
  status: TripStatus;
}

const initialTrips: Trip[] = [
  {
    id: 1,
    tourist: "Sarah Johnson",
    package: "Everest Base Camp Trek",
    startDate: "2026-04-05",
    duration: "14 days",
    earnings: "$1,120",
    status: "Confirmed",
  },
  {
    id: 2,
    tourist: "Mark Thompson",
    package: "Annapurna Circuit",
    startDate: "2026-04-20",
    duration: "12 days",
    earnings: "$960",
    status: "Pending",
  },
  {
    id: 3,
    tourist: "Yuki Harada",
    package: "Langtang Valley Trek",
    startDate: "2026-05-01",
    duration: "7 days",
    earnings: "$560",
    status: "Confirmed",
  },
  {
    id: 4,
    tourist: "James Wilson",
    package: "Manaslu Circuit",
    startDate: "2026-03-10",
    duration: "16 days",
    earnings: "$1,280",
    status: "Completed",
  },
];

const statusStyle: Record<TripStatus, string> = {
  Confirmed: "bg-[#b31919] text-white",
  Pending: "bg-[#1e2a44] text-white",
  Completed: "bg-emerald-700 text-white",
  Cancelled: "bg-gray-400 text-white",
};

export default function MyTrips() {
  const [trips, setTrips] = useState(initialTrips);

  const acceptTrip = (id: number) => {
    setTrips((prev) =>
      prev.map((trip) =>
        trip.id === id ? { ...trip, status: "Confirmed" } : trip,
      ),
    );
  };

  const declineTrip = (id: number) => {
    setTrips((prev) =>
      prev.map((trip) =>
        trip.id === id ? { ...trip, status: "Cancelled" } : trip,
      ),
    );
  };

  const deleteTrip = (id: number) => {
    setTrips((prev) => prev.filter((trip) => trip.id !== id));
  };

  return (
    <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-[#f0eae4]">
        <div>
          <h2 className="text-xl font-bold text-[#1a130e] tracking-tight font-serif">
            My Trips Schedule
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Create, update or remove trips you lead
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 bg-[#b31919] hover:bg-[#941414] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Trip
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-[#fcfaf7] border-b border-[#f0eae4] text-xs font-semibold text-gray-400">
              <th className="py-3.5 px-6 font-medium">Tourist</th>
              <th className="py-3.5 px-6 font-medium">Package</th>
              <th className="py-3.5 px-6 font-medium">Start Date</th>
              <th className="py-3.5 px-6 font-medium">Duration</th>
              <th className="py-3.5 px-6 font-medium">Earnings</th>
              <th className="py-3.5 px-6 font-medium">Status</th>
              <th className="py-3.5 px-6 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5efe9]">
            {trips.map((trip) => (
              <tr
                key={trip.id}
                className="hover:bg-[#fdfcfb] transition-colors"
              >
                <td className="py-4 px-6 text-sm font-semibold text-[#2c2520]">
                  {trip.tourist}
                </td>
                <td className="py-4 px-6 text-sm text-gray-500">
                  {trip.package}
                </td>
                <td className="py-4 px-6 text-sm text-gray-500">
                  {trip.startDate}
                </td>
                <td className="py-4 px-6 text-sm text-gray-500">
                  {trip.duration}
                </td>
                <td className="py-4 px-6 text-sm font-semibold text-[#1a130e]">
                  {trip.earnings}
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-2 items-start">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[trip.status]}`}
                    >
                      {trip.status}
                    </span>
                    {trip.status === "Pending" && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => acceptTrip(trip.id)}
                          className="bg-[#b31919] hover:bg-[#941414] text-white px-3 py-1 rounded-md text-xs font-medium transition"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => declineTrip(trip.id)}
                          className="text-[#b31919] hover:underline text-xs font-medium"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      className="text-gray-500 hover:text-[#1a130e] transition"
                      title="Edit trip"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTrip(trip.id)}
                      className="text-[#b31919] hover:text-red-800 transition"
                      title="Delete trip"
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
    </div>
  );
}
