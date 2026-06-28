import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Calendar, ChevronDown } from "lucide-react";
import { getGuideById } from "../../data/guides";
import { useGuideBooking } from "./GuideBookingContext";
import { getDestinationsForGuide } from "./constants";
import BookingSummary from "./BookingSummary";

export default function TripDetailsStep() {
  const { id } = useParams();
  const navigate = useNavigate();
  const guide = getGuideById(Number(id));
  const { tripDetails, setTripDetails } = useGuideBooking();

  const [startDate, setStartDate] = useState(tripDetails.startDate);
  const [endDate, setEndDate] = useState(tripDetails.endDate);
  const [travelers, setTravelers] = useState(tripDetails.travelers);
  const [destination, setDestination] = useState(tripDetails.destination);
  const [specialRequest, setSpecialRequest] = useState(
    tripDetails.specialRequest,
  );

  const destinations = guide ? getDestinationsForGuide(guide) : [];

  useEffect(() => {
    if (destination && !destinations.includes(destination)) {
      setDestination("");
    }
  }, [destination, destinations]);

  if (!guide) return null;

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const details = {
      startDate,
      endDate,
      travelers,
      destination,
      specialRequest,
    };
    setTripDetails(details);
    navigate(`/guide/${guide.id}/book/your-info`);
  };

  return (
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
              Number of Travelers <span className="text-[#A51C1C]">*</span>
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
              Preferred Destination <span className="text-[#A51C1C]">*</span>
            </label>
            <div className="relative">
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-500 outline-none focus:border-gray-300 appearance-none bg-white"
              >
                <option value="">Select destinations....</option>
                {destinations.map((dest) => (
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
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-gray-300 resize-none"
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

      <BookingSummary
        guide={guide}
        tripDetails={{
          startDate,
          endDate,
          travelers,
          destination,
          specialRequest,
        }}
      />
    </div>
  );
}
