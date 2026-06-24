import { useState } from "react";
import { Search, MapPin, Clock, Briefcase, Globe, Star } from "lucide-react";

const FILTERS = [
  "All",
  "Trekking",
  "Cultural",
  "Adventure",
  "Religious",
  "Wildlife",
];

const GUIDES = [
  {
    id: 1,
    initials: "PS",
    name: "Pemba Sherpa",
    category: "Trekking",
    rating: 4.9,
    reviews: 245,
    price: 80,
    description:
      "Expert mountaineer with multiple Everest summits. Specializes in high-altitude treks",
    location: "Namche Bazar",
    experience: "12 years",
    trips: "380 trips",
    languages: "English, Nepali, Tibetan",
    tags: ["Everest Base Camp", "Annapurna Circuit", "Langtang Valley"],
  },
  {
    id: 2,
    initials: "SG",
    name: "Sita Gurung",
    category: "Cultural",
    rating: 4.8,
    reviews: 189,
    price: 65,
    description:
      "Passionate cultural historian specializing in Kathmandu Valley heritage tours",
    location: "Kathmandu",
    experience: "10 years",
    trips: "290 trips",
    languages: "English, Nepali, Hindi",
    tags: ["Pashupatinath", "Bhaktapur Durbar", "Patan Heritage"],
  },
  {
    id: 3,
    initials: "TB",
    name: "Tenzing Bhote",
    category: "Adventure",
    rating: 4.9,
    reviews: 312,
    price: 90,
    description:
      "Adventure specialist with expertise in paragliding, rafting, and bungee experiences",
    location: "Pokhara",
    experience: "14 years",
    trips: "420 trips",
    languages: "English, Nepali, Tibetan",
    tags: ["Paragliding", "White Water Rafting", "Bungee Jump"],
  },
  {
    id: 4,
    initials: "RL",
    name: "Ram Lama",
    category: "Religious",
    rating: 4.7,
    reviews: 156,
    price: 55,
    description:
      "Licensed spiritual guide with deep knowledge of Buddhist monasteries and pilgrimage routes",
    location: "Lumbini",
    experience: "8 years",
    trips: "210 trips",
    languages: "English, Nepali, Tibetan, Hindi",
    tags: ["Lumbini Tour", "Boudhanath", "Swayambhunath"],
  },
  {
    id: 5,
    initials: "MK",
    name: "Maya Karki",
    category: "Wildlife",
    rating: 4.8,
    reviews: 198,
    price: 70,
    description:
      "Wildlife expert and naturalist specializing in Chitwan and Bardia national park safaris",
    location: "Chitwan",
    experience: "11 years",
    trips: "340 trips",
    languages: "English, Nepali, Hindi",
    tags: ["Chitwan Safari", "Bird Watching", "Jungle Trek"],
  },
  {
    id: 6,
    initials: "AS",
    name: "Ang Sherpa",
    category: "Trekking",
    rating: 4.9,
    reviews: 278,
    price: 85,
    description:
      "Expert mountaineer with multiple Everest summits. Specializes in high-altitude treks",
    location: "Namche Bazar",
    experience: "15 years",
    trips: "410 trips",
    languages: "English, Nepali, Tibetan",
    tags: ["Everest Base Camp", "Annapurna Circuit", "Langtang Valley"],
  },
];

export default function BookGuide() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

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
      <header className="bg-gradient-to-r from-[#A51C1C] to-[#2D3748] px-6 py-12 md:py-14">
        <div className="max-w-5xl mx-auto text-center">
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
      <main className="max-w-7xl mx-auto py-9">
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
                  <div className="w-10 h-10 rounded-full bg-[#A51C1C] flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-semibold">
                      {guide.initials}
                    </span>
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
                  {guide.languages}
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
                  <button className="text-sm text-gray-600 hover:text-gray-800 font-medium whitespace-nowrap cursor-pointer">
                    View Profile
                  </button>
                  <button className="bg-[#A51C1C] text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-[#8e1818] transition-colors whitespace-nowrap">
                    Book Guide
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
