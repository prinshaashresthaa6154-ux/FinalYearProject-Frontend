import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, MapPin, Clock, Briefcase, Globe, Star } from "lucide-react";
import { GUIDES } from "../data/guides";
import { DASHBOARD_GUIDE_ID, getGuideAvatarUrl } from "../utils/guideAvatar";
import { useGuideAvatarOptional } from "./Guide-Dashboard/GuideAvatarContext";

const FILTERS = [
  "All",
  "Trekking",
  "Cultural",
  "Adventure",
  "Religious",
  "Wildlife",
];

export default function BookGuide() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const avatarCtx = useGuideAvatarOptional();
  const pembaAvatar = avatarCtx?.avatarUrl ?? getGuideAvatarUrl();

  const filteredGuides = GUIDES.filter((guide) => {
    const matchesFilter =
      activeFilter === "All" || guide.category === activeFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      guide.name.toLowerCase().includes(query) ||
      guide.location.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F7F3F0] font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#A51C1C] to-[#2D3748] px-6 md:px-16 py-12 md:py-14">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            Our Expert Guides
          </h1>
          <p className="text-white/90 text-sm md:text-base mb-8 max-w-xl mx-auto">
            Connect with experienced, licensed freelance guides for your Nepali
            adventure
          </p>

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search guides by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-5 py-3.5 rounded-full bg-white text-gray-700 placeholder:text-gray-400 text-sm outline-none shadow-sm"
            />
          </div>
        </div>
      </header>

      {/* Filters & Cards */}
      <main className="px-6 md:px-16 py-9">
        <div className="max-w-7xl mx-auto">
          {/* Filter Pills */}
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

          {/* Guide Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredGuides.map((guide) => (
              <div
                key={guide.id}
                className="bg-white rounded-xl shadow-sm p-5 flex flex-col"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#A51C1C] overflow-hidden flex items-center justify-center shrink-0">
                      {guide.id === DASHBOARD_GUIDE_ID && pembaAvatar ? (
                        <img
                          src={pembaAvatar}
                          alt={guide.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-xs font-semibold">
                          {guide.initials}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-display font-bold text-[#1A1A1A] text-base leading-tight">
                        {guide.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="bg-[#2D3748] text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                          {guide.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-xs text-gray-500">
                            {guide.rating} ({guide.reviews})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[#A51C1C] font-bold text-xl leading-none">
                      ${guide.price}
                    </p>
                    <p className="text-gray-400 text-xs">/day</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  {guide.description}
                </p>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {guide.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {guide.experience}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    {guide.trips}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" />
                    {guide.languages.join(", ")}
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 mb-4" />

                {/* Tags & Actions */}
                <div className="flex items-end justify-between gap-3 mt-auto">
                  <div className="flex flex-wrap gap-1.5">
                    {guide.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] text-gray-500 border border-gray-200 rounded-full px-2.5 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => navigate(`/guideprofile/${guide.id}`)}
                      className="text-sm text-gray-600 hover:text-gray-800 font-medium whitespace-nowrap"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => navigate(`/guideprofile/${guide.id}`)}
                      className="bg-[#A51C1C] text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-[#8e1818] transition-colors whitespace-nowrap"
                    >
                      Book Guide
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
