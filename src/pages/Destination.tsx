import React from "react";
import { MapPin, ArrowLeft, CheckCircle2, Star } from "lucide-react";
import everest from "../assets/Everest-base.jpeg";
import { NavLink } from "react-router";
import { useAdminPlatformOptional } from "../context/AdminPlatformContext";

// Structured Destination Details Object (fallback + static fields)
const DESTINATION_DATA = {
  title: "Everest Base Camp",
  location: "Solukhumbu, Koshi Province",
  heroImage: "https:// unsplash.com",
  about:
    "The Everest Base Camp trek is the ultimate adventure for mountain lovers. Follow the footsteps of legendary mountaineers through the Khumbu region, passing through Sherpa villages, ancient monasteries, and breathtaking glacial valleys. The trek offers unparalleled views of Mt. Everest (8,848m), Lhotse, Nuptse, and Ama Dablam.",
  highlights: [
    "Kala Patthar viewpoint",
    "Tengboche Monastery",
    "Namche Bazaar",
    "Khumbu Glacier",
  ],
  pricing: {
    amount: 1200,
    currency: "$",
    period: "per person",
  },
  specs: {
    altitude: "5,364m",
    bestSeason: "Mar-May, Sep-Nov",
    ranking: "4.9/5",
  },
  emergencyContacts: [
    { label: "Nepal Police", value: "100" },
    { label: "Tourist Police", value: "1144" },
    { label: "Rescue", value: "+977-1-4228094" },
  ],
  reviewsSummary: {
    rating: 4.9,
    totalReviews: 2847,
  },
  reviews: [
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
  ],
};

export default function EverestBaseCampDetails() {
  const platform = useAdminPlatformOptional();
  const live = platform?.getDestinationById(1);
  const data = {
    ...DESTINATION_DATA,
    title: live?.title ?? DESTINATION_DATA.title,
    location: live?.location ?? DESTINATION_DATA.location,
    about: live?.description || DESTINATION_DATA.about,
    pricing: {
      ...DESTINATION_DATA.pricing,
      amount: live?.price ?? DESTINATION_DATA.pricing.amount,
    },
    specs: {
      altitude: live?.altitude ?? DESTINATION_DATA.specs.altitude,
      bestSeason: live?.bestSeason ?? DESTINATION_DATA.specs.bestSeason,
      ranking: live ? `${live.rating}/5` : DESTINATION_DATA.specs.ranking,
    },
    reviewsSummary: {
      rating: live?.rating ?? DESTINATION_DATA.reviewsSummary.rating,
      totalReviews:
        live?.reviews ?? DESTINATION_DATA.reviewsSummary.totalReviews,
    },
  };

  if (live && live.status === "Inactive") {
    return (
      <div className="min-h-screen bg-[#fcf8f5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-3">
            This destination is currently unavailable.
          </p>
          <NavLink
            to="/"
            className="text-[#AF1D1D] font-medium hover:underline"
          >
            Back home
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf8f5] text-[#555] font-poppins text-[14px] pb-12">
      {/* Hero Header Section */}
      <div
        className="relative w-full h-[400px] bg-center"
        style={{ backgroundImage: `url('${everest}')` }}
      >
        <div className="absolute inset-0 bg-black/15"></div>

        <div className="absolute inset-0 flex flex-col justify-between py-8 max-w-7xl mx-auto w-full">
          <div>
            <button className="flex items-center gap-1 text-[11px] text-white/90 bg-black/20 hover:bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded transition">
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Destination</span>
            </button>
          </div>

          <div className="text-white drop-shadow-md">
            <h1 className="font-display text-[26px] font-bold tracking-tight">
              {data.title}
            </h1>
            <div className="flex items-center gap-1 mt-1 text-white/90">
              <MapPin className="w-4 h-4 text-orange-400 fill-orange-400" />
              <span>{data.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <main className="max-w-7xl mx-auto py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns - Content Fields */}
        <div className="lg:col-span-2 space-y-10">
          {/* About Field */}
          <section>
            <h2 className="font-display text-[26px] font-bold text-slate-900 mb-4">
              About this Destination
            </h2>
            <p className="leading-relaxed text-slate-500 font-normal">
              {data.about}
            </p>
          </section>

          {/* Highlights Grid */}
          <section>
            <h2 className="font-display text-[26px] font-bold text-slate-900 mb-4">
              Highlights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.highlights.map((highlight, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 bg-white border border-slate-100 rounded-lg p-4 shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="font-medium text-slate-700">
                    {highlight}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Reviews Aggregator & Stream */}
          <section className="space-y-4">
            <h2 className="font-display text-[26px] font-bold text-slate-900">
              Reviews
            </h2>

            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(4)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
                <Star className="w-4 h-4 text-slate-200" />
              </div>
              <span className="font-bold text-slate-800">
                {data.reviewsSummary.rating}
              </span>
              <span className="text-[12px] text-slate-400">
                ({data.reviewsSummary.totalReviews.toLocaleString()} reviews)
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {data.reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white border border-slate-100 rounded-lg p-5 shadow-sm space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full ${review.avatarColor} text-white font-bold flex items-center justify-center text-[12px] shadow-inner`}
                    >
                      {review.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-800">
                      {review.name}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-700 leading-relaxed">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column - Side Panel Cards */}
        <div className="space-y-6 lg:h-fit lg:sticky lg:top-6">
          {/* Action & Specification Summary Card */}
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm text-center space-y-5">
            <div>
              <span className="text-[12px] text-slate-400 block mb-0.5">
                Starting from
              </span>
              <span className="text-3xl font-extrabold text-[#AF1D1D]">
                {data.pricing.currency}
                {data.pricing.amount.toLocaleString()}
              </span>
              <span className="text-[12px] text-slate-400 block mt-0.5">
                {data.pricing.period}
              </span>
            </div>

            <div className="border-t border-slate-100 divide-y divide-slate-100 text-[13px] text-slate-600">
              <div className="flex justify-between py-3">
                <span className="text-slate-400 font-medium">Altitude</span>
                <span className="font-bold text-slate-800">
                  {data.specs.altitude}
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-slate-400 font-medium">Best Season</span>
                <span className="font-bold text-slate-800">
                  {data.specs.bestSeason}
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-slate-400 font-medium">Ranking</span>
                <span className="font-bold text-slate-800 flex items-center gap-0.5">
                  4.9<span className="text-slate-300 font-normal">/5</span>
                </span>
              </div>
            </div>

            <NavLink to="/tripdetail">
              <button className="w-full bg-[#AF1D1D] hover:bg-[#911818] text-white font-semibold py-3 rounded-lg shadow-md shadow-red-900/10 transition-colors">
                Book Now
              </button>
            </NavLink>
          </div>

          {/* Emergency Protocols Block */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-5 space-y-3 text-[13px]">
            <h3 className="font-bold text-slate-800 text-[14px]">
              Emergency Contact
            </h3>
            <div className="space-y-1 text-slate-600 font-medium leading-relaxed">
              {data.emergencyContacts.map((contact, idx) => (
                <p key={idx}>
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
