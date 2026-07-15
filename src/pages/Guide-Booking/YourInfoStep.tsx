import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getGuideById } from "../../data/guides";
import { useGuideBooking } from "./GuideBookingContext";
import BookingSummary from "./BookingSummary";

export default function YourInfoStep() {
  const { id } = useParams();
  const navigate = useNavigate();
  const guide = getGuideById(Number(id));
  const { tripDetails, yourInfo, setYourInfo } = useGuideBooking();

  const [fullName, setFullName] = useState(yourInfo.fullName);
  const [email, setEmail] = useState(yourInfo.email);
  const [phone, setPhone] = useState(yourInfo.phone);

  useEffect(() => {
    if (!tripDetails.startDate || !tripDetails.destination) {
      navigate(`/guidebook/${id}/`, { replace: true });
    }
  }, [tripDetails, id, navigate]);

  if (!guide) return null;

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setYourInfo({ fullName, email, phone });
    navigate(`/guidebook/${guide.id}/payment`);
  };

  const handleBack = () => {
    setYourInfo({ fullName, email, phone });
    navigate(`/guidebook/${guide.id}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 md:p-8">
        <h2 className="font-display text-xl font-bold text-[#1A1A1A] mb-6">
          Your Information
        </h2>

        <form onSubmit={handleContinue} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Full Name <span className="text-[#A51C1C]">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address <span className="text-[#A51C1C]">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone Number <span className="text-[#A51C1C]">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+977-XXXXXXXXXX"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-gray-300"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#A51C1C] text-white font-semibold py-3.5 rounded-lg hover:bg-[#8e1818] transition-colors"
            >
              Continue
            </button>
          </div>
        </form>
      </div>

      <BookingSummary
        guide={guide}
        tripDetails={tripDetails}
        showTripBreakdown
      />
    </div>
  );
}
