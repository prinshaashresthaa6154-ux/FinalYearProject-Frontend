import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Compass, MapPin, Calendar, Star, ArrowRight } from "lucide-react";
import {
  DESTINATION_FILTERS,
  DESTINATIONS,
  type DestinationCategory,
} from "../data/destinations";

export default function Destinations() {
  const [activeFilter, setActiveFilter] = useState<"all" | DestinationCategory>(
    "all",
  );

  const filtered = useMemo(() => {
    if (activeFilter === "all") return DESTINATIONS;
    return DESTINATIONS.filter((d) => d.category === activeFilter);
  }, [activeFilter]);

  return (
    <div className="min-h-screen bg-[#F7F3F0] font-sans">
      <header className="bg-gradient-to-r from-[#A51C1C] to-[#2D3748] px-4 sm:px-6 md:px-16 py-10 sm:py-12 md:py-14">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-medium px-3 py-1 rounded-full mb-3 sm:mb-4">
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            Explore Nepal
          </span>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">
            Destinations
          </h1>
          <p className="text-white/90 text-sm md:text-base max-w-xl mx-auto px-1">
            Explore mountains, temples, wildlife reserves, and cultural heritage
            sites across Nepal.
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 md:px-16 py-6 sm:py-9">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
            {DESTINATION_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                  activeFilter === filter.id
                    ? "bg-[#A51C1C] text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 py-12 sm:py-16 text-sm sm:text-base">
              No destinations match this filter.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {filtered.map((dest) => (
                <Link
                  key={dest.id}
                  to={`/destinations/${dest.id}`}
                  className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A51C1C] focus-visible:ring-offset-2 hover:opacity-95 transition-opacity"
                >
                  <article className="bg-white rounded-xl shadow-sm p-4 sm:p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2">
                      <div className="min-w-0">
                        <h2 className="font-display font-bold text-[#1A1A1A] text-sm sm:text-base leading-tight">
                          {dest.title}
                        </h2>
                        <p className="flex items-start sm:items-center gap-1 text-xs text-gray-400 mt-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 sm:mt-0" />
                          <span className="break-words">{dest.location}</span>
                        </p>
                      </div>
                      <span className="bg-[#2D3748] text-white text-[10px] font-medium px-2 sm:px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap">
                        {dest.categoryLabel}
                      </span>
                    </div>

                    <p className="text-gray-500 text-sm leading-relaxed mb-3 sm:mb-4">
                      {dest.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1.5 text-xs text-gray-400 mb-3 sm:mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        {dest.bestTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                        {dest.rating}
                      </span>
                      <span>Altitude: {dest.altitude}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
                      <span className="text-[11px] text-gray-500 border border-gray-200 rounded-full px-2.5 py-0.5">
                        {dest.categoryLabel}
                      </span>
                      <span className="text-[11px] text-gray-500 border border-gray-200 rounded-full px-2.5 py-0.5">
                        Best: {dest.bestTime}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-auto pt-4 border-t border-gray-100">
                      <p className="font-display text-[#A51C1C] font-bold text-lg leading-none">
                        From ${dest.price.toLocaleString("en-US")}
                      </p>
                      <span className="inline-flex items-center justify-center gap-1.5 bg-[#A51C1C] text-white text-sm font-medium px-3 py-1.5 rounded-lg whitespace-nowrap w-full sm:w-auto">
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
