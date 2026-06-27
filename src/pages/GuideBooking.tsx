import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  MapPin,
  Clock,
  Users,
  Globe,
  Star,
  Check,
  Medal,
} from "lucide-react";
import { getGuideById } from "../data/guide";

const DESTINATIONS = [
  "Everest Base Camp",
  "Annapurna Circuit",
  "Langtang Valley",
  "Pashupatinath",
  "Bhaktapur Durbar",
  "Patan Heritage",
  "Paragliding",
  "White Water Rafting",
  "Bungee Jump",
  "Lumbini Tour",
  "Boudhanath",
  "Swayambhunath",
  "Chitwan Safari",
  "Bird Watching",
  "Jungle Trek",
];

const STEPS = ["Trip Details", "Your Info", "Payment"];

export default function GuideBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const guide = getGuideById(Number(id));

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelers, setTravelers] = useState(1);
  const [destination, setDestination] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");

  if (!guide) {
    return (
      <div className="min-h-screen bg-[#F7F3F0] flex items-center justify-center font-sans">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Guide not found.</p>
          <button
            onClick={() => navigate("/guide")}
            className="text-[#A51C1C] font-medium hover:underline"
          >
            Back to Guides
          </button>
        </div>
      </div>
    );
  }

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-[#F7F3F0] font-sans">
      <header className="bg-gradient-to-r from-[#A51C1C] to-[#2D3748] px-6 md:px-16 py-8 md:py-10">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(`/guide/${guide.id}`)}
            className="flex items-center gap-1.5 text-white/90 text-sm hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Guide Profile
          </button>

          <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
            Book Freelance Guide
          </h1>
          <p className="text-white/85 text-sm md:text-base">
            Complete your booking with {guide.name}
          </p>
        </div>
      </header>

      <main className="px-6 md:px-16 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-0 mb-8 max-w-2xl mx-auto">
            {STEPS.map((step, index) => (
              <div key={step} className="flex items-center">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      index === 0
                        ? "bg-[#A51C1C] text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span
                    className={`text-sm whitespace-nowrap ${
                      index === 0
                        ? "font-semibold text-[#1A1A1A]"
                        : "text-gray-400"
                    }`}
                  >
                    {step}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className="w-12 sm:w-20 h-px bg-gray-300 mx-3 sm:mx-4" />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 md:p-8">
              <h2 className="font-display text-xl font-bold text-[#1A1A1A] mb-6">
                Trip Details
              </h2>

              <form onSubmit={handleContinue} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Start Date <span className="text-[#A51C1C]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-gray-300"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      End Date <span className="text-[#A51C1C]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-gray-300"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Number of Travelers{" "}
                    <span className="text-[#A51C1C]">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={travelers}
                    onChange={(e) =>
                      setTravelers(Math.max(1, Number(e.target.value)))
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Preferred Destination{" "}
                    <span className="text-[#A51C1C]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-500 outline-none focus:border-gray-300 appearance-none bg-white"
                    >
                      <option value="">Select destinations....</option>
                      {DESTINATIONS.map((dest) => (
                        <option key={dest} value={dest}>
                          {dest}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Special Request
                  </label>
                  <textarea
                    value={specialRequest}
                    onChange={(e) => setSpecialRequest(e.target.value)}
                    rows={4}
                    placeholder="Any dietary needs, accessibility requirements..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-gray-300 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#A51C1C] text-white font-semibold py-3.5 rounded-lg hover:bg-[#8e1818] transition-colors mt-2"
                >
                  Continue
                </button>
              </form>
            </div>

            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-display text-xl font-bold text-[#1A1A1A] mb-5">
                Booking Summary
              </h2>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-[#A51C1C] flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-semibold">
                    {guide.initials}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A]">{guide.name}</p>
                  <p className="text-sm text-gray-500">
                    {guide.category} ·{" "}
                    <span className="inline-flex items-center gap-0.5">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      {guide.rating}
                    </span>
                  </p>
                </div>
              </div>

              <ul className="space-y-2.5 text-sm text-gray-500 mb-5">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  {guide.location}
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                  {guide.experience} experience
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400 shrink-0" />
                  {guide.trips} completed
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                  {guide.languages.join(", ")}
                </li>
              </ul>

              <div className="mb-5">
                <h3 className="font-semibold text-[#1A1A1A] text-sm mb-3 flex items-center gap-2">
                  <Medal className="w-4 h-4 text-amber-500" />
                  Certifications
                </h3>
                <ul className="space-y-2">
                  {guide.certifications.slice(0, 2).map((cert) => (
                    <li
                      key={cert}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <Check className="w-4 h-4 text-[#A51C1C] shrink-0" />
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-5 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Rate</span>
                  <span className="font-semibold text-[#A51C1C]">
                    ${guide.price}/day
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Travelers</span>
                  <span className="font-semibold text-[#1A1A1A]">
                    {travelers}
                  </span>
                </div>
              </div>

              <ul className="space-y-2.5">
                {[
                  "Free cancellation up to 48hrs",
                  "Verified & certified guide",
                  "24/7 support during trip",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <Check className="w-4 h-4 text-[#A51C1C] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
