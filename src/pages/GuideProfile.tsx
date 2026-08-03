import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Briefcase,
  Star,
  Check,
  Medal,
  MessageCircle,
} from "lucide-react";
import { getGuideById } from "../data/guides";
import { DASHBOARD_GUIDE_ID, getGuideAvatarUrl } from "../utils/guideAvatar";
import { useGuideAvatarOptional } from "./Guide-Dashboard/GuideAvatarContext";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < rating
              ? "text-amber-400 fill-amber-400"
              : "text-gray-200 fill-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function GuideProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const guide = getGuideById(Number(id));
  const avatarCtx = useGuideAvatarOptional();
  const avatarUrl =
    guide?.id === DASHBOARD_GUIDE_ID
      ? (avatarCtx?.avatarUrl ?? getGuideAvatarUrl())
      : null;

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

  return (
    <div className="min-h-screen bg-[#F7F3F0] font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#A51C1C] to-[#2D3748] px-6 md:px-16 py-8 md:py-10">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate("/guide")}
            className="flex items-center gap-1.5 text-white/90 text-sm hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Guides
          </button>

          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-5 min-w-0">
              <div className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-full bg-[#C44B4B] overflow-hidden flex items-center justify-center shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={guide.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-lg font-semibold">
                    {guide.initials}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
                    {guide.name}
                  </h1>
                  <span className="bg-[#2D3748] text-white text-xs font-medium px-3 py-1 rounded-full">
                    {guide.categoryExpert}
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-medium px-3 py-1 rounded-full border border-emerald-400/30">
                    • Available
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-white/85 text-sm">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {guide.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {guide.experience}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    {guide.trips}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    {guide.rating} ({guide.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0 hidden sm:block">
              <p className="font-display text-3xl md:text-4xl font-bold text-white leading-none">
                ${guide.price}
              </p>
              <p className="text-white/70 text-sm mt-1">per day</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 md:px-16 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <section>
                <h2 className="font-display text-xl font-bold text-[#1A1A1A] mb-3">
                  About
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {guide.about}
                </p>
              </section>

              {/* Languages */}
              <section>
                <h2 className="font-display text-xl font-bold text-[#1A1A1A] mb-3">
                  Languages
                </h2>
                <div className="flex flex-wrap gap-2">
                  {guide.languages.map((lang) => (
                    <span
                      key={lang}
                      className="bg-[#2D3748] text-white text-sm font-medium px-4 py-1.5 rounded-full"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </section>

              {/* Certifications */}
              <section className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="font-display text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
                  <Medal className="w-5 h-5 text-amber-500" />
                  Certifications
                </h2>
                <ul className="space-y-3">
                  {guide.certifications.map((cert) => (
                    <li
                      key={cert}
                      className="flex items-center gap-2.5 text-sm text-gray-600"
                    >
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      {cert}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Specialization Areas */}
              <section className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="font-display text-lg font-bold text-[#1A1A1A] mb-4">
                  Specialization Areas
                </h2>
                <div className="flex flex-wrap gap-2">
                  {guide.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-sm text-gray-600 border border-gray-200 rounded-full px-4 py-1.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>

              {/* Tourist Reviews */}
              <section className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="font-display text-lg font-bold text-[#1A1A1A] mb-4">
                  Tourist Reviews
                </h2>
                <div className="space-y-4">
                  {guide.touristReviews.map((review) => (
                    <div
                      key={`${review.name}-${review.date}`}
                      className="border border-gray-100 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="font-semibold text-[#1A1A1A] text-sm">
                          {review.name}
                        </span>
                        <StarRating rating={review.rating} />
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed mb-2">
                        {review.text}
                      </p>
                      <p className="text-gray-400 text-xs">{review.date}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column - Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-5 sticky top-6">
                <h2 className="font-display text-lg font-bold text-[#1A1A1A] mb-5">
                  Book This Guide
                </h2>

                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Rate</span>
                    <span className="font-semibold text-[#1A1A1A]">
                      ${guide.price}/day
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Rating</span>
                    <span className="flex items-center gap-1 font-semibold text-[#1A1A1A]">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      {guide.rating}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Experience</span>
                    <span className="font-semibold text-[#1A1A1A]">
                      {guide.experience}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => navigate(`/guidebook/${guide.id}`)}
                    className="w-full bg-[#A51C1C] text-white font-semibold py-3 rounded-lg hover:bg-[#8e1818] transition-colors"
                  >
                    Book Now
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    Send a message
                  </button>
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <h3 className="font-semibold text-[#1A1A1A] text-sm mb-4">
                    Availability
                  </h3>
                  <ul className="space-y-3">
                    {guide.availability.map((slot) => (
                      <li
                        key={slot.month}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-600">{slot.month}</span>
                        <span
                          className={`text-xs font-medium px-3 py-1 rounded-full ${
                            slot.status === "Available"
                              ? "bg-[#A51C1C] text-white"
                              : "bg-[#2D3748] text-white"
                          }`}
                        >
                          {slot.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
