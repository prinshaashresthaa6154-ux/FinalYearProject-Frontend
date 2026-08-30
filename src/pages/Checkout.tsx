import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  LoaderCircle,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { getApiError } from "../api/axios";
import { Button, Input, Textarea } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import {
  bookingService,
  bookingPaymentHandoff,
  paymentMethodForCurrency,
  validateCreateBookingInput,
  type CheckoutPaymentMethod,
  type CreateBookingInput,
} from "../services/bookingService";
import { mediaUrl } from "../services/destinationService";
import {
  getTripBookability,
  tripService,
  type Trip,
} from "../services/tripService";
import { canCreateBooking } from "../auth/roles";

type CheckoutState = {
  trip?: Trip;
  participants?: number;
  specialRequests?: string;
};
const methods: Array<{
  id: CheckoutPaymentMethod;
  label: string;
  description: string;
  currency: string;
}> = [
  {
    id: "ESEWA",
    label: "eSewa",
    description: "Pay through Nepal's trusted wallet",
    currency: "NPR",
  },
  {
    id: "STRIPE",
    label: "Card",
    description: "Secure Stripe-hosted checkout",
    currency: "USD",
  },
];

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { userDTO } = useAuth();
  const navigationState = location.state as CheckoutState | null;
  const tripId = navigationState?.trip?.id ?? Number(params.get("tripId") || 0);
  const [trip, setTrip] = useState<Trip | null>(navigationState?.trip ?? null);
  const [participants, setParticipants] = useState(
    navigationState?.participants ?? 1,
  );
  const [travellerFullName, setTravellerFullName] = useState(
    userDTO?.fullName ?? "",
  );
  const [travellerEmail, setTravellerEmail] = useState(userDTO?.email ?? "");
  const [travellerPhone, setTravellerPhone] = useState(userDTO?.phone ?? "");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [specialRequests, setSpecialRequests] = useState(
    navigationState?.specialRequests ?? "",
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userDTO) return;
    setTravellerFullName((value) => value || userDTO.fullName || "");
    setTravellerEmail((value) => value || userDTO.email || "");
    setTravellerPhone((value) => value || userDTO.phone || "");
  }, [userDTO]);

  useEffect(() => {
    if (!tripId) {
      setLoading(false);
      return;
    }
    tripService
      .publicById(tripId)
      .then((response) => setTrip(response.data.data ?? null))
      .catch((requestError) => setError(getApiError(requestError).message))
      .finally(() => setLoading(false));
  }, [tripId]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!trip) return;
    if (!canCreateBooking(userDTO)) {
      setError(
        "A verified, active customer account is required to create a booking.",
      );
      return;
    }
    const availability = getTripBookability(trip, participants);
    if (!availability.bookable) {
      setError(availability.reason);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const input: CreateBookingInput = {
        tripId: trip.id,
        participants,
        travellerFullName: travellerFullName.trim() || undefined,
        travellerEmail: travellerEmail.trim() || undefined,
        travellerPhone: travellerPhone.trim() || undefined,
        emergencyContact: emergencyContact.trim() || undefined,
        specialRequests: specialRequests.trim() || undefined,
      };
      const validationErrors = validateCreateBookingInput(input);
      if (Object.keys(validationErrors).length > 0) {
        setError(Object.values(validationErrors).join(" "));
        return;
      }
      const response = await bookingService.createBooking(input);
      if (!response.data.success) {
        throw new Error(
          response.data.message || "The booking could not be created.",
        );
      }
      const booking = response.data.data;
      if (!booking?.bookingId)
        throw new Error("The booking was created without a booking ID.");
      localStorage.setItem("lastBookingId", String(booking.bookingId));
      localStorage.setItem(
        "lastBookingPaymentHandoff",
        JSON.stringify(bookingPaymentHandoff(booking)),
      );

      const paymentMethod = paymentMethodForCurrency(booking.currency);
      if (!paymentMethod) {
        navigate(`/booking/${booking.bookingId}`, {
          state: {
            notice: `Online payment is not available for ${booking.currency}. Your unpaid booking has been saved.`,
          },
        });
        return;
      }
      try {
        await bookingService.beginCheckout(booking, paymentMethod);
      } catch (paymentError) {
        navigate(`/booking/${booking.bookingId}`, {
          state: {
            notice: `Booking ${booking.bookingReference} was created and ${booking.participants} seats were reserved. ${getApiError(paymentError).message}`,
          },
        });
      }
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <main className="grid min-h-[70vh] place-items-center bg-[#f6f1e9]">
        <LoaderCircle className="h-8 w-8 animate-spin text-[#a62922]" />
      </main>
    );
  if (!trip)
    return (
      <main className="min-h-[70vh] bg-[#f6f1e9] p-8 text-center">
        <p>Trip could not be loaded.</p>
        <Link
          to="/trips"
          className="mt-4 inline-block font-bold text-[#a62922]"
        >
          Browse trips
        </Link>
      </main>
    );

  const total = Number(trip.price) * participants;
  const maxParticipants = Math.min(10000, trip.availableSeats);
  const paymentMethod = paymentMethodForCurrency(trip.currency);
  const availability = getTripBookability(trip, participants);

  return (
    <main className="min-h-screen bg-[#f6f1e9] px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          to={`/trips/${trip.slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#8f211c]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to trip
        </Link>
        <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_360px]">
          <form onSubmit={submit} className="space-y-6">
            <header>
              <p className="text-xs font-bold uppercase tracking-widest text-[#a62922]">
                Secure booking
              </p>
              <h1 className="mt-2 font-display text-4xl font-bold">
                Complete your booking
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#75695f]">
                Seats are reserved when the booking is created. The booking
                starts unpaid and is confirmed only after secure provider
                verification.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[#75695f]">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#a62922] text-white">
                  1
                </span>
                <span>Trip details</span>
                <span className="h-px w-8 bg-[#d8cec0]" />
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#a62922] text-white">
                  2
                </span>
                <span>Traveler details</span>
                <span className="h-px w-8 bg-[#d8cec0]" />
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#a62922] text-white">
                  3
                </span>
                <span>Payment</span>
              </div>
            </header>
            <section className="rounded-2xl border border-[#eae3dc] bg-white p-6 shadow-sm">
              <h2 className="font-display text-2xl font-bold">
                Traveler information
              </h2>
              <p className="mt-2 text-sm text-[#75695f]">
                Contact details help the guide prepare for your journey.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Input
                  label="Number of participants"
                  type="number"
                  min={1}
                  max={maxParticipants || 10000}
                  value={participants}
                  onChange={(event) =>
                    setParticipants(
                      Math.max(1, Number(event.target.value) || 1),
                    )
                  }
                  required
                />
                <Input
                  label="Availability"
                  value={`${trip.availableSeats} seats available`}
                  readOnly
                />
                <Input
                  label="Full name"
                  value={travellerFullName}
                  onChange={(event) => setTravellerFullName(event.target.value)}
                  maxLength={150}
                  placeholder="Ram Bahadur"
                />
                <Input
                  label="Email"
                  type="email"
                  value={travellerEmail}
                  onChange={(event) => setTravellerEmail(event.target.value)}
                  maxLength={255}
                />
                <Input
                  label="Phone"
                  value={travellerPhone}
                  onChange={(event) => setTravellerPhone(event.target.value)}
                  maxLength={30}
                />
                <Input
                  label="Emergency contact"
                  value={emergencyContact}
                  onChange={(event) => setEmergencyContact(event.target.value)}
                  maxLength={200}
                />
              </div>
              <div className="mt-4">
                <Textarea
                  label="Special requests"
                  value={specialRequests}
                  onChange={(event) => setSpecialRequests(event.target.value)}
                  maxLength={2000}
                  rows={4}
                />
              </div>
            </section>
            <section className="rounded-2xl border border-[#eae3dc] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold">
                    Payment route
                  </h2>
                  <p className="mt-1 text-sm text-[#75695f]">
                    Your booking currency determines the secure provider.
                  </p>
                </div>
                <WalletCards className="h-6 w-6 text-[#a62922]" />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {methods.map((method) => {
                  const available = method.id === paymentMethod;
                  return (
                    <div
                      key={method.id}
                      className={`rounded-xl border p-4 ${available ? "border-[#a62922] bg-[#fff8f5] shadow-sm" : "border-[#e5ddd6] bg-[#f8f6f3] opacity-50"}`}
                    >
                      <span className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-[#a62922]" />
                        <span>
                          <span className="flex items-center gap-2">
                            <b>{method.label}</b>
                            <small className="rounded-full bg-white px-2 py-0.5 font-bold text-[#75695f]">
                              {method.currency}
                            </small>
                          </span>
                          <small className="mt-1 block text-[#75695f]">
                            {method.description}
                          </small>
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
              {!paymentMethod && (
                <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Online payment is not configured for {trip.currency}. The
                  booking will be saved as unpaid.
                </p>
              )}
              <p className="mt-4 flex items-center gap-2 text-xs text-[#75695f]">
                <ShieldCheck className="h-4 w-4 text-green-700" /> The server
                reserves seats atomically, then validates provider signatures,
                amount, and currency before confirmation.
              </p>
            </section>
            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}
            <Button
              type="submit"
              loading={submitting}
              className="w-full"
              disabled={!availability.bookable}
            >
              {paymentMethod
                ? `Continue with ${paymentMethod === "ESEWA" ? "eSewa" : "Stripe"}`
                : "Save unpaid booking"}
            </Button>
          </form>
          <aside className="h-fit overflow-hidden rounded-2xl border border-[#eae3dc] bg-white shadow-sm lg:sticky lg:top-24">
            {trip.featuredImage && (
              <img
                src={mediaUrl(trip.featuredImage)}
                alt=""
                className="h-44 w-full object-cover"
              />
            )}
            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#a62922]">
                Your journey
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold">
                {trip.title}
              </h2>
              <p className="mt-1 text-sm text-[#75695f]">
                {trip.destination.name}
              </p>
              <div className="mt-5 space-y-3 border-y border-[#eee7e1] py-4 text-sm">
                <p className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[#75695f]">
                    <CalendarDays className="h-4 w-4" /> Duration
                  </span>
                  <b>{trip.duration} days</b>
                </p>
                <p className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[#75695f]">
                    <Users className="h-4 w-4" /> Travelers
                  </span>
                  <b>{participants}</b>
                </p>
              </div>
              <div className="mt-5 flex items-end justify-between">
                <span className="text-sm text-[#75695f]">Total</span>
                <strong className="font-display text-2xl">
                  {trip.currency} {total.toLocaleString()}
                </strong>
              </div>
              <p className="mt-4 text-xs leading-5 text-[#897b70]">
                You leave this site only for the provider's secure checkout. No
                secret payment credentials are stored in the browser.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
