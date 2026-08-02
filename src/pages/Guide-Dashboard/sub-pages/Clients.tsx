import { useState } from "react";
import { Search, MessageCircle, Mail } from "lucide-react";

const clients = [
  {
    id: 1,
    initials: "SJ",
    name: "Sarah Johnson",
    country: "USA",
    trips: 3,
    lastTrip: "Everest Base Camp",
    spent: "$3,240",
    status: "Active",
  },
  {
    id: 2,
    initials: "MT",
    name: "Mark Thompson",
    country: "UK",
    trips: 1,
    lastTrip: "Annapurna Circuit",
    spent: "$960",
    status: "Pending",
  },
  {
    id: 3,
    initials: "YH",
    name: "Yuki Harada",
    country: "Japan",
    trips: 2,
    lastTrip: "Langtang Valley",
    spent: "$1,420",
    status: "Active",
  },
  {
    id: 4,
    initials: "EC",
    name: "Emily Chen",
    country: "Singapore",
    trips: 1,
    lastTrip: "EBC Group Trek",
    spent: "$890",
    status: "Active",
  },
  {
    id: 5,
    initials: "JW",
    name: "James Wilson",
    country: "Australia",
    trips: 4,
    lastTrip: "Manaslu Circuit",
    spent: "$4,100",
    status: "Active",
  },
];

export default function Clients() {
  const [query, setQuery] = useState("");

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.country.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#f0eae4]">
        <div>
          <h2 className="text-xl font-bold text-[#1a130e] tracking-tight font-serif">
            Clients
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Tourists you have guided or have upcoming bookings with
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search clients..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg pl-3 pr-10 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#b31919] transition"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-[#fcfaf7] border-b border-[#f0eae4] text-xs font-semibold text-gray-400">
              <th className="py-3.5 px-6 font-medium">Client</th>
              <th className="py-3.5 px-6 font-medium">Country</th>
              <th className="py-3.5 px-6 font-medium">Trips</th>
              <th className="py-3.5 px-6 font-medium">Last Trip</th>
              <th className="py-3.5 px-6 font-medium">Total Spent</th>
              <th className="py-3.5 px-6 font-medium">Status</th>
              <th className="py-3.5 px-6 font-medium text-center">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5efe9]">
            {filtered.map((client) => (
              <tr
                key={client.id}
                className="hover:bg-[#fdfcfb] transition-colors"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1e2a44] text-white flex items-center justify-center text-xs font-semibold">
                      {client.initials}
                    </div>
                    <span className="text-sm font-semibold text-[#2c2520]">
                      {client.name}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-gray-500">
                  {client.country}
                </td>
                <td className="py-4 px-6 text-sm text-gray-500">
                  {client.trips}
                </td>
                <td className="py-4 px-6 text-sm text-gray-500">
                  {client.lastTrip}
                </td>
                <td className="py-4 px-6 text-sm font-semibold text-[#1a130e]">
                  {client.spent}
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      client.status === "Active"
                        ? "bg-[#b31919] text-white"
                        : "bg-[#1e2a44] text-white"
                    }`}
                  >
                    {client.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      className="text-gray-500 hover:text-[#1a130e] transition"
                      title="Message"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="text-gray-500 hover:text-[#1a130e] transition"
                      title="Email"
                    >
                      <Mail className="w-4 h-4" />
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
