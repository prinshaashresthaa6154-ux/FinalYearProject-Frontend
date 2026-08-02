import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useAdminPlatform } from "../../../context/AdminPlatformContext";
import type { PlatformTrip, TripStatus } from "../../../data/adminPlatform";

const emptyTrip = (): PlatformTrip => ({
  id: 0,
  title: "",
  destinationId: 1,
  destination: "",
  guideId: null,
  guideName: "Unassigned",
  startDate: "",
  endDate: "",
  duration: "",
  capacity: 12,
  booked: 0,
  price: 0,
  status: "Draft",
});

export default function AdminTrips() {
  const { trips, destinations, guides, upsertTrip, deleteTrip } =
    useAdminPlatform();
  const [editing, setEditing] = useState<PlatformTrip | null>(null);

  const save = () => {
    if (!editing || !editing.title.trim()) return;
    const dest = destinations.find((d) => d.id === editing.destinationId);
    const guide = guides.find((g) => g.id === editing.guideId);
    const id = editing.id || Math.max(0, ...trips.map((t) => t.id)) + 1;
    upsertTrip({
      ...editing,
      id,
      destination: dest?.title ?? editing.destination,
      guideName:
        guide?.name ?? (editing.guideId ? editing.guideName : "Unassigned"),
    });
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#f0eae4]">
          <div>
            <h2 className="text-xl font-bold text-[#1a130e] font-serif">
              Trip Management
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Create trips, assign guides, set capacity and schedule
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setEditing({
                ...emptyTrip(),
                destinationId: destinations[0]?.id ?? 1,
                destination: destinations[0]?.title ?? "",
              })
            }
            className="inline-flex items-center gap-1.5 bg-[#b31919] hover:bg-[#941414] text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Create Trip
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#fcfaf7] border-b border-[#f0eae4] text-xs font-semibold text-gray-400">
                <th className="py-3.5 px-6 font-medium">Trip</th>
                <th className="py-3.5 px-6 font-medium">Guide</th>
                <th className="py-3.5 px-6 font-medium">Schedule</th>
                <th className="py-3.5 px-6 font-medium">Capacity</th>
                <th className="py-3.5 px-6 font-medium">Price</th>
                <th className="py-3.5 px-6 font-medium">Status</th>
                <th className="py-3.5 px-6 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5efe9]">
              {trips.map((trip) => (
                <tr key={trip.id} className="hover:bg-[#fdfcfb]">
                  <td className="py-4 px-6">
                    <p className="text-sm font-semibold">{trip.title}</p>
                    <p className="text-xs text-gray-400">{trip.destination}</p>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {trip.guideName}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {trip.startDate} → {trip.endDate}
                    <br />
                    <span className="text-xs">{trip.duration}</span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {trip.booked}/{trip.capacity}
                  </td>
                  <td className="py-4 px-6 text-sm font-semibold">
                    ${trip.price}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        trip.status === "Published"
                          ? "bg-[#b31919] text-white"
                          : trip.status === "Completed"
                            ? "bg-emerald-700 text-white"
                            : trip.status === "Draft"
                              ? "bg-[#1e2a44] text-white"
                              : "bg-gray-400 text-white"
                      }`}
                    >
                      {trip.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setEditing({ ...trip })}
                      >
                        <Pencil className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete ${trip.title}?`))
                            deleteTrip(trip.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-[#b31919]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-[#eae3dc]">
            <div className="p-5 border-b border-[#f0eae4] flex justify-between">
              <h3 className="text-lg font-bold font-serif">
                {editing.id ? "Update Trip" : "Create Trip"}
              </h3>
              <button type="button" onClick={() => setEditing(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="sm:col-span-2 text-xs text-gray-400">
                Title
                <input
                  value={editing.title}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                  className="mt-1 w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-gray-400">
                Destination
                <select
                  value={editing.destinationId}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      destinationId: Number(e.target.value),
                    })
                  }
                  className="mt-1 w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg px-3 py-2 text-sm"
                >
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-gray-400">
                Assign Guide
                <select
                  value={editing.guideId ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      guideId: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="mt-1 w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Unassigned</option>
                  {guides
                    .filter((g) => g.status === "Active")
                    .map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                </select>
              </label>
              <label className="text-xs text-gray-400">
                Start Date
                <input
                  type="date"
                  value={editing.startDate}
                  onChange={(e) =>
                    setEditing({ ...editing, startDate: e.target.value })
                  }
                  className="mt-1 w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-gray-400">
                End Date
                <input
                  type="date"
                  value={editing.endDate}
                  onChange={(e) =>
                    setEditing({ ...editing, endDate: e.target.value })
                  }
                  className="mt-1 w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-gray-400">
                Duration
                <input
                  value={editing.duration}
                  onChange={(e) =>
                    setEditing({ ...editing, duration: e.target.value })
                  }
                  className="mt-1 w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-gray-400">
                Max Capacity
                <input
                  type="number"
                  value={editing.capacity}
                  onChange={(e) =>
                    setEditing({ ...editing, capacity: Number(e.target.value) })
                  }
                  className="mt-1 w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-gray-400">
                Price
                <input
                  type="number"
                  value={editing.price}
                  onChange={(e) =>
                    setEditing({ ...editing, price: Number(e.target.value) })
                  }
                  className="mt-1 w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-gray-400">
                Status
                <select
                  value={editing.status}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      status: e.target.value as TripStatus,
                    })
                  }
                  className="mt-1 w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg px-3 py-2 text-sm"
                >
                  {(
                    [
                      "Draft",
                      "Published",
                      "Ongoing",
                      "Completed",
                      "Cancelled",
                    ] as TripStatus[]
                  ).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="p-5 border-t border-[#f0eae4] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm border rounded-lg border-[#dcd3cc]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                className="px-4 py-2 text-sm bg-[#b31919] text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
