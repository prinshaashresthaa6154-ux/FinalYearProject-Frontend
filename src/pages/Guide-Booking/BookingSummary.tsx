import { MapPin, Clock, Users, Globe, Star, Check, Medal } from "lucide-react";
import type { Guide } from "../../data/guides";
import type { TripDetails } from "./types";
import { getDurationDays } from "./types";

interface BookingSummaryProps {
  guide: Guide;
  tripDetails: TripDetails;
  showTripBreakdown?: boolean;
}

export default function BookingSummary({
  guide,
  tripDetails,
  showTripBreakdown = false,
}: BookingSummaryProps) {
  const duration = getDurationDays(tripDetails.startDate, tripDetails.endDate);
  const total = guide.price * duration;

  return (
    <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6">
      <h2 className="font-display text-xl font-bold text-[#1A1A1A] mb-5">
        Booking Summary
      </h2>

      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-full bg-[#FCEAEA] flex items-center justify-center shrink-0">
          <span className="text-[#A51C1C] text-sm font-semibold">
            {guide.initials}
          </span>
        </div>
        <div>
          <p className="font-semibold text-[#1A1A1A]">{guide.name}</p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            {guide.rating} · {guide.category}
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
          <span className="font-semibold text-[#1A1A1A]">
            ${guide.price}/day
          </span>
        </div>

        {showTripBreakdown ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Duration</span>
              <span className="font-semibold text-[#1A1A1A]">
                {duration} {duration === 1 ? "day" : "days"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Travelers</span>
              <span className="font-semibold text-[#1A1A1A]">
                {tripDetails.travelers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Destination</span>
              <span className="font-semibold text-[#1A1A1A] text-right max-w-[55%]">
                {tripDetails.destination}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Start</span>
              <span className="font-semibold text-[#1A1A1A]">
                {tripDetails.startDate}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">End</span>
              <span className="font-semibold text-[#1A1A1A]">
                {tripDetails.endDate}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="font-semibold text-[#1A1A1A]">Total</span>
              <span className="font-bold text-[#A51C1C] text-lg">${total}</span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Travelers</span>
            <span className="font-semibold text-[#1A1A1A]">
              {tripDetails.travelers}
            </span>
          </div>
        )}
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
  );
}
