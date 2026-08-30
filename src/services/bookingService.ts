import api from "../api/axios";
import type { ApiResponse, PageResponse } from "../types/api";

export type BookingStatus =
  "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED";
export type PaymentStatus =
  | "PENDING"
  | "UNPAID"
  | "INITIATED"
  | "CANCELLED"
  | "PAID"
  | "FAILED"
  | "REFUNDED";
export const NON_CANCELLABLE_BOOKING_STATUSES: BookingStatus[] = [
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
];
export const TERMINAL_BOOKING_STATUSES: BookingStatus[] = [
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
];
export const TERMINAL_PAYMENT_STATUSES: PaymentStatus[] = [
  "PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
];
export type PaymentMethod = "KHALTI" | "ESEWA" | "STRIPE";
export type CheckoutPaymentMethod = Extract<PaymentMethod, "ESEWA" | "STRIPE">;
export type PaymentRequest = {
  bookingId: number;
  paymentMethod: PaymentMethod;
};
export type CreateBookingInput = {
  tripId: number;
  participants: number;
  travellerFullName?: string;
  travellerEmail?: string;
  travellerPhone?: string;
  emergencyContact?: string;
  specialRequests?: string;
};
export type Booking = {
  bookingId: number;
  bookingReference: string;
  user: { id: number; fullName: string; email: string };
  travelPackage: {
    id: number;
    title: string;
    price: number;
    capacity: number;
    availableSeats: number;
    adminId?: number | null;
    provider?: { adminId?: number; id?: number; name: string } | null;
  };
  bookingDate: string;
  numberOfPeople: number;
  participants: number;
  unitPrice: number;
  totalAmount: number;
  currency: string;
  specialRequests?: string | null;
  travellerFullName?: string | null;
  travellerEmail?: string | null;
  travellerPhone?: string | null;
  emergencyContact?: string | null;
  travelDate?: string | null;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  updatedAt: string;
};
export type BookingPaymentHandoff = Pick<
  Booking,
  | "bookingId"
  | "bookingReference"
  | "totalAmount"
  | "currency"
  | "paymentStatus"
  | "status"
>;
export type CancelledBooking = Pick<
  Booking,
  "bookingId" | "bookingReference" | "paymentStatus" | "status"
>;
export type AdminBookingAction = Pick<
  Booking,
  "bookingId" | "bookingReference" | "paymentStatus" | "status"
>;
export type Payment = {
  id: number;
  transactionId: string;
  booking: {
    bookingId: number;
    userId?: number;
    userEmail?: string;
    packageId: number;
    packageTitle: string;
  };
  amount: number;
  commissionPercentage: number;
  commissionAmount: number;
  adminNetAmount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDate?: string;
  gatewayReference?: string | null;
  gateway?: string | null;
  checkoutUrl?: string | null;
  clientSecret?: string | null;
  completedAt?: string | null;
  failureReason?: string | null;
  updatedAt: string;
};
export type EsewaPayment = {
  payment: Payment;
  actionUrl: string;
  method: "POST";
  fields: Record<string, string>;
};
export type CheckoutBooking = Pick<
  Booking,
  | "bookingId"
  | "currency"
  | "status"
  | "paymentStatus"
  | "unitPrice"
  | "totalAmount"
>;
type BookingResponse = Omit<ApiResponse<Booking>, "data"> & { data: Booking };
export type AdminBookingQuery = {
  status?: BookingStatus | "";
  paymentStatus?: PaymentStatus | "";
  packageId?: number;
  customerEmail?: string;
  bookedFrom?: string;
  bookedTo?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};
export type PaymentQuery = {
  status?: PaymentStatus | "";
  method?: PaymentMethod | "";
  bookingId?: number;
  transactionId?: string;
  paidFrom?: string;
  paidTo?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};

export const BOOKING_ENDPOINTS = {
  admin: "/api/admin/bookings",
  authenticated: "/api/bookings",
  mine: "/api/bookings/my",
} as const;

export const PAYMENT_ENDPOINTS = { public: "/api/payments" } as const;

const cleanParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateCreateBookingInput = (input: CreateBookingInput) => {
  const errors: Record<string, string> = {};
  if (!Number.isInteger(input.tripId) || input.tripId <= 0)
    errors.tripId = "Trip ID must be a positive number.";
  if (
    !Number.isInteger(input.participants) ||
    input.participants < 1 ||
    input.participants > 10000
  )
    errors.participants = "Participants must be between 1 and 10000.";
  if (input.travellerFullName && input.travellerFullName.length > 150)
    errors.travellerFullName =
      "Traveller name must be 150 characters or fewer.";
  if (
    input.travellerEmail &&
    (!EMAIL_PATTERN.test(input.travellerEmail) ||
      input.travellerEmail.length > 255)
  )
    errors.travellerEmail =
      "Enter a valid email address of 255 characters or fewer.";
  if (input.travellerPhone && input.travellerPhone.length > 30)
    errors.travellerPhone = "Traveller phone must be 30 characters or fewer.";
  if (input.emergencyContact && input.emergencyContact.length > 200)
    errors.emergencyContact =
      "Emergency contact must be 200 characters or fewer.";
  if (input.specialRequests && input.specialRequests.length > 2000)
    errors.specialRequests =
      "Special requests must be 2000 characters or fewer.";
  return errors;
};

export const bookingPaymentHandoff = (
  booking: Booking,
): BookingPaymentHandoff => ({
  bookingId: booking.bookingId,
  bookingReference: booking.bookingReference,
  totalAmount: booking.totalAmount,
  currency: booking.currency,
  paymentStatus: booking.paymentStatus,
  status: booking.status,
});

export const canCancelBooking = (booking: Pick<Booking, "status">) =>
  !NON_CANCELLABLE_BOOKING_STATUSES.includes(booking.status);

export const canConfirmBooking = (
  booking: Pick<Booking, "status" | "paymentStatus">,
) => booking.status === "PENDING" && booking.paymentStatus === "PAID";

export const canRejectBooking = (booking: Pick<Booking, "status">) =>
  booking.status === "PENDING";

export const canCompleteBooking = (booking: Pick<Booking, "status">) =>
  booking.status === "CONFIRMED";

export const isBookingPaymentConfirmed = (
  booking: Pick<Booking, "status" | "paymentStatus">,
) => booking.paymentStatus === "PAID" && booking.status === "CONFIRMED";

export const isPaymentTerminal = (paymentStatus: PaymentStatus) =>
  TERMINAL_PAYMENT_STATUSES.includes(paymentStatus);

export const isBookingResolutionTerminal = (
  booking: Pick<Booking, "status" | "paymentStatus">,
) =>
  isBookingPaymentConfirmed(booking) ||
  TERMINAL_BOOKING_STATUSES.includes(booking.status) ||
  ["FAILED", "CANCELLED", "REFUNDED"].includes(booking.paymentStatus);

export const validateRejectionReason = (reason: string) => {
  const trimmed = reason.trim();
  if (!trimmed) return "A rejection reason is required.";
  if (trimmed.length > 1000)
    return "The rejection reason must be 1000 characters or fewer.";
  return null;
};

const paymentRequest = (
  bookingId: number,
  paymentMethod: PaymentMethod,
): PaymentRequest => {
  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    throw new Error("Booking ID must be a positive number.");
  }
  if (!["KHALTI", "ESEWA", "STRIPE"].includes(paymentMethod)) {
    throw new Error("Unsupported payment method.");
  }
  return { bookingId, paymentMethod };
};

export const paymentMethodForCurrency = (
  currency: string,
): CheckoutPaymentMethod | null => {
  const normalized = currency.trim().toUpperCase();
  if (normalized === "NPR") return "ESEWA";
  if (normalized === "USD") return "STRIPE";
  return null;
};

export const paymentInitiationError = (
  booking: CheckoutBooking,
  paymentMethod: CheckoutPaymentMethod,
) => {
  if (!["PENDING", "CONFIRMED"].includes(booking.status)) {
    return "Only pending or confirmed bookings can be paid.";
  }
  if (booking.paymentStatus !== "UNPAID") {
    return booking.paymentStatus === "PAID"
      ? "This booking has already been paid."
      : `Payment cannot be initiated from ${booking.paymentStatus} status.`;
  }
  if (
    !Number.isFinite(Number(booking.totalAmount)) ||
    Number(booking.totalAmount) <= 0
  ) {
    return "This booking does not have a valid total amount.";
  }
  if (!booking.currency.trim()) {
    return "This booking does not have a payment currency.";
  }
  if (
    paymentMethod === "STRIPE" &&
    booking.currency.trim().toUpperCase() !== "USD"
  ) {
    return "Stripe checkout is available only for USD bookings.";
  }
  if (
    paymentMethod === "STRIPE" &&
    (!Number.isFinite(Number(booking.unitPrice)) ||
      Number(booking.unitPrice) <= 0)
  ) {
    return "This booking does not have a valid unit-price snapshot.";
  }
  if (
    paymentMethod === "ESEWA" &&
    booking.currency.trim().toUpperCase() !== "NPR"
  ) {
    return "eSewa checkout is available only for NPR bookings.";
  }
  return null;
};

export const redirectToEsewa = (gateway: EsewaPayment) => {
  const form = document.createElement("form");
  form.method = gateway.method;
  form.action = gateway.actionUrl;
  form.hidden = true;
  Object.entries(gateway.fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
};

export const bookingService = {
  adminList(query: AdminBookingQuery = {}) {
    return api.get<ApiResponse<PageResponse<Booking>>>(
      BOOKING_ENDPOINTS.admin,
      { params: query },
    );
  },
  adminById(id: number) {
    if (!Number.isInteger(id) || id <= 0)
      throw new Error("Booking ID must be a positive number.");
    return api.get<ApiResponse<Booking>>(`${BOOKING_ENDPOINTS.admin}/${id}`);
  },
  confirm(id: number) {
    if (!Number.isInteger(id) || id <= 0)
      throw new Error("Booking ID must be a positive number.");
    return api.post<ApiResponse<Booking>>(
      `${BOOKING_ENDPOINTS.admin}/${id}/confirm`,
    );
  },
  complete(id: number) {
    if (!Number.isInteger(id) || id <= 0)
      throw new Error("Booking ID must be a positive number.");
    return api.post<ApiResponse<Booking>>(
      `${BOOKING_ENDPOINTS.admin}/${id}/complete`,
    );
  },
  reject(id: number, reason: string) {
    if (!Number.isInteger(id) || id <= 0)
      throw new Error("Booking ID must be a positive number.");
    const reasonError = validateRejectionReason(reason);
    if (reasonError) throw new Error(reasonError);
    return api.post<ApiResponse<Booking>>(
      `${BOOKING_ENDPOINTS.admin}/${id}/reject`,
      { reason: reason.trim() },
    );
  },
  createBooking(input: CreateBookingInput) {
    const errors = validateCreateBookingInput(input);
    if (Object.keys(errors).length > 0)
      throw new Error(Object.values(errors).join(" "));
    return api.post<BookingResponse>("/api/bookings", input);
  },
  getBooking(id: number) {
    return api.get<ApiResponse<Booking>>(
      `${BOOKING_ENDPOINTS.authenticated}/${id}`,
    );
  },
  listBookings(status?: BookingStatus) {
    return api.get<ApiResponse<PageResponse<Booking>>>(BOOKING_ENDPOINTS.mine, {
      params: { status, page: 0, size: 100 },
    });
  },
  cancelBooking(id: number) {
    if (!Number.isInteger(id) || id <= 0)
      throw new Error("Booking ID must be a positive number.");
    return api.post<ApiResponse<CancelledBooking>>(
      `/api/bookings/${id}/cancel`,
    );
  },
  createPayment(bookingId: number, paymentMethod: PaymentMethod) {
    return api.post<ApiResponse<Payment>>(
      "/api/payments",
      paymentRequest(bookingId, paymentMethod),
    );
  },
  createStripePayment(bookingId: number) {
    return api.post<ApiResponse<Payment>>(
      "/api/payments/stripe/create",
      paymentRequest(bookingId, "STRIPE"),
    );
  },
  createEsewaPayment(bookingId: number) {
    return api.post<ApiResponse<EsewaPayment>>(
      "/api/payments/esewa/create",
      paymentRequest(bookingId, "ESEWA"),
    );
  },
  async beginCheckout(
    booking: CheckoutBooking,
    paymentMethod: CheckoutPaymentMethod,
  ) {
    const eligibilityError = paymentInitiationError(booking, paymentMethod);
    if (eligibilityError) throw new Error(eligibilityError);
    if (paymentMethod === "ESEWA") {
      const response = await this.createEsewaPayment(booking.bookingId);
      if (!response.data.success) {
        throw new Error(
          response.data.message || "eSewa payment initiation failed.",
        );
      }
      const gateway = response.data.data;
      if (!gateway?.actionUrl || !gateway.fields)
        throw new Error("The eSewa checkout response was incomplete.");
      redirectToEsewa(gateway);
      return;
    }
    const response = await this.createStripePayment(booking.bookingId);
    if (!response.data.success) {
      throw new Error(
        response.data.message || "Stripe payment initiation failed.",
      );
    }
    const payment = response.data.data;
    if (!payment?.checkoutUrl)
      throw new Error(
        "The Stripe checkout response did not include a redirect URL.",
      );
    window.location.assign(payment.checkoutUrl);
  },
  getPayment(id: number) {
    if (!Number.isInteger(id) || id <= 0)
      throw new Error("Payment ID must be a positive number.");
    return api.get<ApiResponse<Payment>>(`${PAYMENT_ENDPOINTS.public}/${id}`);
  },
  getBookingPayment(bookingId: number) {
    if (!Number.isInteger(bookingId) || bookingId <= 0)
      throw new Error("Booking ID must be a positive number.");
    return api.get<ApiResponse<Payment>>(
      `${PAYMENT_ENDPOINTS.public}/booking/${bookingId}`,
    );
  },
  payments(query: PaymentQuery = {}) {
    return api.get<ApiResponse<PageResponse<Payment>>>(
      PAYMENT_ENDPOINTS.public,
      {
        params: cleanParams({
          page: 0,
          size: 20,
          sortBy: "paymentDate",
          sortDir: "desc",
          ...query,
        }),
      },
    );
  },
};
