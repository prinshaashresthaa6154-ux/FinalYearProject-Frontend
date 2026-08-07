import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import { Shield } from "lucide-react";
import api from "../../api/axios";
import { getGuideById } from "../../data/guides";
import { useGuideBooking } from "./GuideBookingContext";
import BookingSummary from "./BookingSummary";
import { getDurationDays, type PaymentMethod } from "./types";

type CreateBookingResponse = {
  success: boolean;
  message: string;
  data: {
    bookingId: number;
  };
};

type TravelPackage = {
  id: number;
};

type TravelPackageListResponse = {
  success: boolean;
  message: string;
  data: {
    content: TravelPackage[];
  };
};

type BookingErrorResponse = {
  message?: string;
  data?: Record<string, string> | string[] | null;
};

const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  label: string;
  description: string;
}[] = [
  {
    id: "esewa",
    label: "eSewa",
    description: "Pay via eSewa mobile wallet",
  },
  {
    id: "stripe",
    label: "Stripe",
    description: "Pay securely with Stripe",
  },
  {
    id: "card",
    label: "Credit/Debit Card",
    description: "Visa, Mastercard accepted",
  },
  {
    id: "bank",
    label: "Bank Transfer",
    description: "Direct bank transfer",
  },
];

export default function PaymentStep() {
  const { id } = useParams();
  const navigate = useNavigate();
  const guide = getGuideById(Number(id));
  const { tripDetails } = useGuideBooking();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("esewa");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [packageId, setPackageId] = useState<number | null>(null);
  const [isLoadingPackage, setIsLoadingPackage] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadPackage = async () => {
      if (!guide) {
        setIsLoadingPackage(false);
        return;
      }

      try {
        const response = await api.get<TravelPackageListResponse>(
          "/api/travel-packages",
          { params: { guideId: guide.id, size: 1 } },
        );

        if (isMounted) {
          setPackageId(response.data.data.content[0]?.id ?? null);
        }
      } catch {
        if (isMounted) {
          setErrorMessage("Unable to load this guide's travel package.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingPackage(false);
        }
      }
    };

    void loadPackage();

    return () => {
      isMounted = false;
    };
  }, [guide]);

  useEffect(() => {
    if (!tripDetails.startDate || !tripDetails.destination) {
      navigate(`/guidebook/${id}`, { replace: true });
      return;
    }
  }, [tripDetails, id, navigate]);

  if (!guide) return null;

  const duration = getDurationDays(tripDetails.startDate, tripDetails.endDate);
  const total = guide.price * duration;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || bookingId !== null) return;

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      if (packageId === null) {
        setErrorMessage("No travel package is available for this guide.");
        return;
      }

      const response = await api.post<CreateBookingResponse>("/api/bookings", {
        packageId,
        numberOfPeople: tripDetails.travelers,
      });

      if (!response.data.success) {
        setErrorMessage(response.data.message || "Unable to create booking.");
        return;
      }

      setBookingId(response.data.data.bookingId);
    } catch (error) {
      const errorData = axios.isAxiosError<BookingErrorResponse>(error)
        ? error.response?.data
        : undefined;
      const validationErrors = errorData?.data
        ? Object.values(errorData.data).join(" ")
        : "";

      setErrorMessage(
        validationErrors ||
          errorData?.message ||
          "Unable to create booking. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(`/guidebook/${guide.id}/your-info`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 md:p-8">
        <h2 className="font-display text-xl font-bold text-[#1A1A1A] mb-6">
          Payment Method
        </h2>

        <form onSubmit={handleConfirm} className="space-y-3">
          {PAYMENT_OPTIONS.map((option) => (
            <label
              key={option.id}
              className={`flex items-center justify-between gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                paymentMethod === option.id
                  ? "border-[#A51C1C] bg-[#FCEAEA]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div>
                <p className="font-semibold text-[#1A1A1A] text-sm">
                  {option.label}
                </p>
                <p className="text-gray-500 text-sm mt-0.5">
                  {option.description}
                </p>
              </div>
              <input
                type="radio"
                name="paymentMethod"
                value={option.id}
                checked={paymentMethod === option.id}
                onChange={() => setPaymentMethod(option.id)}
                className="w-4 h-4 accent-[#A51C1C] shrink-0"
              />
            </label>
          ))}

          <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
            <Shield className="w-4 h-4 shrink-0" />
            Your payment information is secured with 256-bit encryption
          </div>

          {errorMessage && (
            <p role="alert" className="text-sm text-red-600">
              {errorMessage}
            </p>
          )}

          {bookingId !== null && (
            <p role="status" className="text-sm text-green-700">
              Booking #{bookingId} was created successfully.
            </p>
          )}

          {!isLoadingPackage && packageId === null && !errorMessage && (
            <p role="alert" className="text-sm text-red-600">
              No travel package is available for this guide.
            </p>
          )}

          <div className="flex items-center gap-4 pt-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={
                isLoadingPackage ||
                packageId === null ||
                isSubmitting ||
                bookingId !== null
              }
              className="flex-1 bg-[#A51C1C] text-white font-semibold py-3.5 rounded-lg hover:bg-[#8e1818] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Creating booking..."
                : bookingId !== null
                  ? "Booking Confirmed"
                  : `Confirm Booking $${total}`}
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
