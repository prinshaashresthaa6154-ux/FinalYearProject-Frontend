<<<<<<< HEAD
import { useState } from "react";
import { Check, MessageCircle, X } from "lucide-react";
=======
import { useState } from 'react';
import { Check, MessageCircle, X } from 'lucide-react';
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb

interface JoinRequest {
  id: number;
  initials: string;
  name: string;
  paid: boolean;
  location: string;
  date: string;
  trip: string;
  spots: number;
}

const initialRequests: JoinRequest[] = [
  {
    id: 1,
<<<<<<< HEAD
    initials: "EC",
    name: "Emily Chen",
    paid: true,
    location: "Singapore",
    date: "Mar 22, 2026",
    trip: "Everest Base Camp Group Trek",
=======
    initials: 'EC',
    name: 'Emily Chen',
    paid: true,
    location: 'Singapore',
    date: 'Mar 22, 2026',
    trip: 'Everest Base Camp Group Trek',
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
    spots: 1,
  },
  {
    id: 2,
<<<<<<< HEAD
    initials: "DK",
    name: "David Kim",
    paid: true,
    location: "South Korea",
    date: "Mar 22, 2026",
    trip: "Everest Base Camp Group Trek",
=======
    initials: 'DK',
    name: 'David Kim',
    paid: true,
    location: 'South Korea',
    date: 'Mar 22, 2026',
    trip: 'Everest Base Camp Group Trek',
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
    spots: 1,
  },
  {
    id: 3,
<<<<<<< HEAD
    initials: "AM",
    name: "Anna Müller",
    paid: false,
    location: "Germany",
    date: "Apr 02, 2026",
    trip: "Annapurna Base Camp Group",
=======
    initials: 'AM',
    name: 'Anna Müller',
    paid: false,
    location: 'Germany',
    date: 'Apr 02, 2026',
    trip: 'Annapurna Base Camp Group',
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
    spots: 2,
  },
  {
    id: 4,
<<<<<<< HEAD
    initials: "RL",
    name: "Ryan Lopez",
    paid: true,
    location: "USA",
    date: "Apr 10, 2026",
    trip: "Langtang Valley Group Trek",
=======
    initials: 'RL',
    name: 'Ryan Lopez',
    paid: true,
    location: 'USA',
    date: 'Apr 10, 2026',
    trip: 'Langtang Valley Group Trek',
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
    spots: 1,
  },
];

export default function GroupRequests() {
  const [requests, setRequests] = useState(initialRequests);

  const removeRequest = (id: number) => {
    setRequests((prev) => prev.filter((req) => req.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1a130e] tracking-tight font-serif">
            Group Trip Join Requests
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
<<<<<<< HEAD
            Approve to add tourists to the group chat · {requests.length}{" "}
            pending
=======
            Approve to add tourists to the group chat · {requests.length} pending
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
          </p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm p-10 text-center">
          <p className="text-sm text-gray-400">No pending join requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
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
<<<<<<< HEAD
                    <span className="font-semibold text-[#1a130e]">
                      {req.name}
                    </span>
=======
                    <span className="font-semibold text-[#1a130e]">{req.name}</span>
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
                    {req.paid ? (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-[#b31919] text-white">
                        Paid
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-800">
                        Awaiting payment
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
<<<<<<< HEAD
                      {req.spots} spot{req.spots > 1 ? "s" : ""}
=======
                      {req.spots} spot{req.spots > 1 ? 's' : ''}
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {req.location} · {req.date}
                  </p>
<<<<<<< HEAD
                  <p className="text-sm text-[#2c2520] mt-1">
                    Trip: {req.trip}
                  </p>
=======
                  <p className="text-sm text-[#2c2520] mt-1">Trip: {req.trip}</p>
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => removeRequest(req.id)}
                  disabled={!req.paid}
                  className="inline-flex items-center gap-1.5 bg-[#b31919] hover:bg-[#941414] disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition"
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
                  onClick={() => removeRequest(req.id)}
                  className="p-2 text-[#b31919] hover:bg-red-50 rounded-lg transition"
                  aria-label={`Decline ${req.name}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
