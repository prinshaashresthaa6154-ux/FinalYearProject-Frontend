import { useState } from "react";
import {
  Trophy,
  MapPin,
  Calendar,
  Clock,
  User,
  MessageCircle,
  UserPlus,
} from "lucide-react";

const FILTERS = ["All Trips", "Available", "Easy", "Moderate"];

const GROUP_TRIPS = [
  {
    id: 1,
    title: "Everest Base Camp Group Trek",
    location: "Everest Region",
    description:
      "Join fellow trekkers on the iconic journey to Everest Base Camp with an expert Sherpa guide.",
    date: "April 5–18, 2026",
    duration: "14 days",
    guide: "Pemba Sherpa",
    tags: ["Namche Bazaar", "Tengboche Monastery"],
    joined: 8,
    capacity: 12,
    difficulty: "Moderate",
    price: 1100,
    spotsLeft: 4,
  },
  {
    id: 2,
    title: "Annapurna Circuit Group Tour",
    location: "Annapurna Region",
    description:
      "Circle the Annapurna massif with a diverse group of adventurers through varied landscapes.",
    date: "May 10–22, 2026",
    duration: "12 days",
    guide: "Ang Sherpa",
    tags: ["Thorong La Pass", "Manang Valley"],
    joined: 7,
    capacity: 12,
    difficulty: "Moderate",
    price: 950,
    spotsLeft: 5,
  },
  {
    id: 3,
    title: "Kathmandu Cultural Walk",
    location: "Kathmandu Valley",
    description:
      "Explore UNESCO heritage sites and hidden alleys of the Kathmandu Valley with a local historian.",
    date: "March 15–17, 2026",
    duration: "3 days",
    guide: "Sita Gurung",
    tags: ["Pashupatinath", "Patan Durbar Square"],
    joined: 8,
    capacity: 12,
    difficulty: "Easy",
    price: 280,
    spotsLeft: 4,
  },
  {
    id: 4,
    title: "Chitwan Safari Group",
    location: "Chitwan National Park",
    description:
      "Spot rhinos, elephants, and exotic birds on a shared jungle safari adventure.",
    date: "June 1–5, 2026",
    duration: "4 days",
    guide: "Maya Karki",
    tags: ["Jungle Safari", "Canoe Ride"],
    joined: 7,
    capacity: 12,
    difficulty: "Easy",
    price: 420,
    spotsLeft: 5,
  },
];

export default function GroupTrips() {
  const [activeFilter, setActiveFilter] = useState("All Trips");

  const filteredTrips = GROUP_TRIPS.filter((trip) => {
    if (activeFilter === "All Trips") return true;
    if (activeFilter === "Available") return trip.spotsLeft > 0;
    if (activeFilter === "Easy") return trip.difficulty === "Easy";
    if (activeFilter === "Moderate") return trip.difficulty === "Moderate";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F7F3F0] font-sans">
      <header className="bg-gradient-to-r from-[#A51C1C] to-[#2D3748] px-6 md:px-16 py-12 md:py-14">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-medium px-3 py-1 rounded-full mb-4">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            Travel Together
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            Group Trips
          </h1>
          <p className="text-white/90 text-sm md:text-base max-w-xl mx-auto">
            Join other travelers and share the adventure! Save money, make
            friends, and explore Nepal together.
          </p>
        </div>
      </header>

      <main className="px-6 md:px-16 py-9">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-8">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === filter
                    ? "bg-[#A51C1C] text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredTrips.map((trip) => {
              const progress = (trip.joined / trip.capacity) * 100;

              return (
                <div
                  key={trip.id}
                  className="bg-white rounded-xl shadow-sm p-5 flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <h2 className="font-display font-bold text-[#1A1A1A] text-base leading-tight">
                        {trip.title}
                      </h2>
                      <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {trip.location}
                      </p>
                    </div>
                    <span className="bg-[#2D3748] text-white text-[10px] font-medium px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap">
                      {trip.spotsLeft} spots left
                    </span>
                  </div>

                  <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    {trip.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {trip.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {trip.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      Guide: {trip.guide}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {trip.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] text-gray-500 border border-gray-200 rounded-full px-2.5 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-gray-500">
                        {trip.joined}/{trip.capacity} travelers joined
                      </span>
                      <span className="text-gray-500">{trip.difficulty}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#A51C1C] rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-auto pt-4 border-t border-gray-100">
                    <p className="text-[#A51C1C] font-bold text-lg leading-none">
                      ${trip.price}
                      <span className="text-gray-400 text-xs font-normal">
                        /person
                      </span>
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <button className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                        <MessageCircle className="w-4 h-4" />
                        Group Chat
                      </button>
                      <button className="flex items-center gap-1.5 bg-[#A51C1C] text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-[#8e1818] transition-colors whitespace-nowrap">
                        <UserPlus className="w-4 h-4" />
                        Join Trip
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
