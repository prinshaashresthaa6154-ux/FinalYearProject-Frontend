import { useMemo, useState } from "react";
import { Users, Lock, UserMinus, Check, X } from "lucide-react";
import { GROUP_TRIPS } from "../../../data/groupTrips";
import { useGroupTrip } from "../../../context/GroupTripContext";

export default function AdminGroupTrips() {
  const { membersByTrip, isJoined } = useGroupTrip();
  const [closedIds, setClosedIds] = useState<number[]>([]);
  const [pendingByTrip, setPendingByTrip] = useState<
    Record<number, { id: string; name: string; initials: string }[]>
  >({
    1: [
      { id: "p1", name: "Ryan Lopez", initials: "RL" },
      { id: "p2", name: "Anna Müller", initials: "AM" },
    ],
    2: [{ id: "p3", name: "David Kim", initials: "DK" }],
  });
  const [removed, setRemoved] = useState<Record<number, string[]>>({});

  const trips = useMemo(
    () =>
      GROUP_TRIPS.map((t) => ({
        ...t,
        closed: closedIds.includes(t.id),
        members: (membersByTrip[t.id] ?? []).filter(
          (m) => !(removed[t.id] ?? []).includes(m.id),
        ),
        pending: pendingByTrip[t.id] ?? [],
      })),
    [closedIds, membersByTrip, pendingByTrip, removed],
  );

  const approve = (tripId: number, memberId: string) => {
    setPendingByTrip((prev) => ({
      ...prev,
      [tripId]: (prev[tripId] ?? []).filter((m) => m.id !== memberId),
    }));
  };

  const decline = (tripId: number, memberId: string) => {
    setPendingByTrip((prev) => ({
      ...prev,
      [tripId]: (prev[tripId] ?? []).filter((m) => m.id !== memberId),
    }));
  };

  const removeMember = (tripId: number, memberId: string) => {
    setRemoved((prev) => ({
      ...prev,
      [tripId]: [...(prev[tripId] ?? []), memberId],
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-[#1a130e] font-serif">
          Group Trips
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Manage members, join requests, and trip availability
        </p>
      </div>

      {trips.map((trip) => (
        <div
          key={trip.id}
          className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="p-5 border-b border-[#f0eae4] flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold font-serif text-[#1a130e]">
                  {trip.title}
                </h3>
                {trip.closed && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-400 text-white">
                    Closed
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-0.5">
                {trip.location} · {trip.date} · Guide: {trip.guide}
              </p>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {trip.members.length} members · capacity {trip.capacity}
                {isJoined(trip.id) ? " · you joined as tourist demo" : ""}
              </p>
            </div>
            <button
              type="button"
              disabled={trip.closed}
              onClick={() => setClosedIds((prev) => [...prev, trip.id])}
              className="inline-flex items-center gap-1.5 border border-[#dcd3cc] px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-[#faf7f4]"
            >
              <Lock className="w-4 h-4" />
              Close Trip
            </button>
          </div>

          <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <h4 className="text-sm font-semibold mb-3">Members</h4>
              <div className="space-y-2">
                {trip.members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between border border-[#eae3dc] rounded-xl px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#1e2a44] text-white text-xs flex items-center justify-center">
                        {m.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-[11px] text-gray-400">{m.role}</p>
                      </div>
                    </div>
                    {m.role === "Tourist" && !trip.closed && (
                      <button
                        type="button"
                        onClick={() => removeMember(trip.id, m.id)}
                        className="text-[#b31919] p-1"
                        title="Remove member"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">Join Requests</h4>
              {trip.pending.length === 0 ? (
                <p className="text-xs text-gray-400">No pending requests</p>
              ) : (
                <div className="space-y-2">
                  {trip.pending.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between border border-[#eae3dc] rounded-xl px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#1e2a44] text-white text-xs flex items-center justify-center">
                          {p.initials}
                        </div>
                        <p className="text-sm font-medium">{p.name}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={trip.closed}
                          onClick={() => approve(trip.id, p.id)}
                          className="p-1.5 bg-[#b31919] text-white rounded-lg disabled:opacity-40"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => decline(trip.id, p.id)}
                          className="p-1.5 text-[#b31919] hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
