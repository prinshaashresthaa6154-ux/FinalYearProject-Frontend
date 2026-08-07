import { MapPin, ArrowLeft, CheckCircle2, Star } from "lucide-react";
import { NavLink, useParams } from "react-router";
import { useAdminPlatformOptional } from "../context/AdminPlatformContext";
import { getDestinationById } from "../data/destinations";

const EMERGENCY_CONTACTS = [
  { label: "Nepal Police", value: "100" },
  { label: "Tourist Police", value: "1144" },
  { label: "Rescue", value: "+977-1-4228094" },
];

const SAMPLE_REVIEWS = [
  {
    id: 1,
    name: "Sarah M.",
    avatarColor: "bg-[#AF1D1D]",
    text: "Absolutely breathtaking experience! The views were beyond anything I imagined",
  },
  {
    id: 2,
    name: "Rajesh K.",
    avatarColor: "bg-amber-700",
    text: "Well organized and informative. Our guide was knowledgeable and friendly.",
  },
];

export default function DestinationDetail() {
  const { id } = useParams();
  const destinationId = Number(id);
  const destination = getDestinationById(destinationId);
  const platform = useAdminPlatformOptional();
  const live = platform?.getDestinationById(destinationId);

  if (!destination) {
    return (
      <div className="min-h-screen bg-[#F7F3F0] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-600 mb-3 text-sm sm:text-base">
            Destination not found.
          </p>
          <NavLink
            to="/destinations"
            className="text-[#AF1D1D] font-medium hover:underline text-sm sm:text-base"
          >
            Back to Destinations
          </NavLink>
        </div>
      </div>
    );
  }

  if (live && live.status === "Inactive") {
    return (
      <div className="min-h-screen bg-[#F7F3F0] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-600 mb-3 text-sm sm:text-base">
            This destination is currently unavailable.
          </p>
          <NavLink
            to="/destinations"
            className="text-[#AF1D1D] font-medium hover:underline text-sm sm:text-base"
          >
            Back to Destinations
          </NavLink>
        </div>
      </div>
    );
  }

  const data = {
    title: live?.title ?? destination.title,
    location: live?.location ?? destination.location,
    about: live?.description || destination.about,
    highlights: destination.highlights,
    pricing: {
      amount: live?.price ?? destination.price,
      currency: "$",
      period: "per person",
    },
    specs: {
      altitude: live?.altitude ?? destination.altitude,
      bestSeason: live?.bestSeason ?? destination.bestTime,
      ranking: `${live?.rating ?? destination.rating}/5`,
    },
    reviewsSummary: {
      rating: live?.rating ?? destination.rating,
      totalReviews: live?.reviews ?? destination.reviews,
    },
  };

  return (
    <div className="min-h-screen bg-[#F7F3F0] text-[#555] font-sans text-sm pb-10 sm:pb-12">
      <header className="bg-gradient-to-r from-[#A51C1C] to-[#2D3748] px-4 sm:px-6 md:px-16 py-8 sm:py-10 md:py-12">
        <div className="max-w-7xl mx-auto">
          <NavLink
            to="/destinations"
            className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-white/90 bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded transition mb-5 sm:mb-6"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Destinations</span>
          </NavLink>

          <div className="text-white">
            <span className="inline-block bg-white/15 text-white text-[10px] sm:text-xs font-medium px-2.5 py-1 rounded-full mb-3">
              {destination.categoryLabel}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              {data.title}
            </h1>
            <div className="flex items-start sm:items-center gap-1 mt-2 text-white/90 text-sm">
              <MapPin className="w-4 h-4 text-amber-300 shrink-0 mt-0.5 sm:mt-0" />
              <span>{data.location}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-16 py-6 sm:py-8 md:py-10 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-8 sm:space-y-10 order-2 lg:order-1">
          <section>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">
              About this Destination
            </h2>
            <p className="leading-relaxed text-slate-500">{data.about}</p>
          </section>

          <section>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">
              Highlights
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="flex items-center gap-3 bg-white border border-slate-100 rounded-lg p-3 sm:p-4 shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="font-medium text-slate-700 text-sm">
                    {highlight}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              Reviews
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(4)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
                <Star className="w-4 h-4 text-slate-200" />
              </div>
              <span className="font-bold text-slate-800">
                {data.reviewsSummary.rating}
              </span>
              <span className="text-xs text-slate-400">
                ({data.reviewsSummary.totalReviews.toLocaleString()} reviews)
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {SAMPLE_REVIEWS.map((review) => (
                <div
                  key={review.id}
                  className="bg-white border border-slate-100 rounded-lg p-4 sm:p-5 shadow-sm space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full ${review.avatarColor} text-white font-bold flex items-center justify-center text-xs shadow-inner`}
                    >
                      {review.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-800 text-sm">
                      {review.name}
                    </span>
                  </div>
                  <p className="font-medium text-slate-700 leading-relaxed text-sm">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-4 sm:space-y-6 lg:h-fit lg:sticky lg:top-6 order-1 lg:order-2">
          <div className="bg-white border border-slate-100 rounded-xl p-5 sm:p-6 shadow-sm text-center space-y-4 sm:space-y-5">
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">
                Starting from
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#AF1D1D]">
                {data.pricing.currency}
                {data.pricing.amount.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                {data.pricing.period}
              </span>
            </div>

            <div className="border-t border-slate-100 divide-y divide-slate-100 text-sm text-slate-600">
              <div className="flex justify-between gap-3 py-3">
                <span className="text-slate-400 font-medium">Altitude</span>
                <span className="font-bold text-slate-800 text-right">
                  {data.specs.altitude}
                </span>
              </div>
              <div className="flex justify-between gap-3 py-3">
                <span className="text-slate-400 font-medium shrink-0">
                  Best Season
                </span>
                <span className="font-bold text-slate-800 text-right">
                  {data.specs.bestSeason}
                </span>
              </div>
              <div className="flex justify-between gap-3 py-3">
                <span className="text-slate-400 font-medium">Ranking</span>
                <span className="font-bold text-slate-800">
                  {data.specs.ranking}
                </span>
              </div>
            </div>

            <NavLink to="/tripdetail" className="block">
              <button
                type="button"
                className="w-full bg-[#AF1D1D] hover:bg-[#911818] text-white font-semibold py-3 rounded-lg shadow-md shadow-red-900/10 transition-colors"
              >
                Book Now
              </button>
            </NavLink>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-xl p-4 sm:p-5 space-y-3 text-sm">
            <h3 className="font-bold text-slate-800">Emergency Contact</h3>
            <div className="space-y-1 text-slate-600 font-medium leading-relaxed">
              {EMERGENCY_CONTACTS.map((contact) => (
                <p key={contact.label} className="break-words">
                  <span className="text-slate-400 font-normal">
                    {contact.label}:
                  </span>{" "}
                  {contact.value}
                </p>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
