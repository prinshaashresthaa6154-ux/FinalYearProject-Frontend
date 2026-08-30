import api from "../api/axios";
import type { ApiResponse, PageResponse } from "../types/api";

export type GuideBookingType = "GROUP_TRIP" | "DIRECT";
export type GuideBookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export type GuideBookingParticipant = {
  id: number;
  name: string;
  email: string;
};

export type GuideBookingGroupTrip = {
  id: number;
  tripName: string;
  currentMembers?: number;
  maximumMembers?: number;
  availableSeats?: number;
  status?: string;
  date?: string;
};

export type GuideBooking = {
  id: number;
  type: GuideBookingType;
  status: GuideBookingStatus;
  user: GuideBookingParticipant;
  guide: GuideBookingParticipant;
  groupTrip?: GuideBookingGroupTrip | null;
  destination?: { id: number; name: string } | null;
  startDate?: string | null;
  endDate?: string | null;
  participants?: number | null;
  requestMessage?: string | null;
  rejectionReason?: string | null;
  conversationId?: number | null;
  dailyRate?: number | null;
  billableDays?: number | null;
  totalAmount?: number | null;
  currency?: string | null;
  commissionPercentage?: number | null;
  commissionAmount?: number | null;
  guideNetAmount?: number | null;
  paymentStatus?: "PENDING" | "UNPAID" | "INITIATED" | "CANCELLED" | "PAID" | "FAILED" | "REFUNDED" | null;
  reviewed?: boolean;
  respondedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type DirectGuideBookingInput = {
  guideId: number;
  destinationId: number;
  startDate: string;
  endDate: string;
  participants: number;
  message?: string;
};

export const GUIDE_BOOKING_ENDPOINTS = {
  root: "/api/guide-bookings",
  direct: "/api/guide-bookings/direct",
  mine: "/api/guide-bookings/my",
  requests: "/api/guide-bookings/requests",
  operations: "/api/guide-bookings/operations",
} as const;

const isValidDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

export const validateDirectGuideBooking = (input: DirectGuideBookingInput) => {
  const errors: Record<string, string> = {};
  if (!Number.isInteger(input.guideId) || input.guideId <= 0)
    errors.guideId = "Select a valid guide.";
  if (!Number.isInteger(input.destinationId) || input.destinationId <= 0)
    errors.destinationId = "Select a destination.";
  if (!isValidDate(input.startDate)) errors.startDate = "Select a start date.";
  if (!isValidDate(input.endDate)) errors.endDate = "Select an end date.";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (isValidDate(input.startDate) && new Date(`${input.startDate}T00:00:00`) < today)
    errors.startDate = "Start date cannot be in the past.";
  if (
    isValidDate(input.startDate) &&
    isValidDate(input.endDate) &&
    input.endDate < input.startDate
  )
    errors.endDate = "End date cannot precede the start date.";
  if (!Number.isInteger(input.participants) || input.participants < 1 || input.participants > 100)
    errors.participants = "Participants must be between 1 and 100.";
  if ((input.message?.length ?? 0) > 2000)
    errors.message = "Message must be 2000 characters or fewer.";
  return errors;
};

const validatePage = (page: number, size: number) => {
  if (!Number.isInteger(page) || page < 0) throw new Error("Page must be zero or greater.");
  if (!Number.isInteger(size) || size < 1 || size > 100)
    throw new Error("Page size must be between 1 and 100.");
};

export const guideBookingService = {
  createDirect(input: DirectGuideBookingInput) {
    const errors = validateDirectGuideBooking(input);
    if (Object.keys(errors).length) {
      const error = new Error("Please correct the highlighted fields.");
      Object.assign(error, { validationErrors: errors });
      throw error;
    }
    return api.post<ApiResponse<GuideBooking>>(GUIDE_BOOKING_ENDPOINTS.direct, {
      ...input,
      message: input.message?.trim() || undefined,
    });
  },
  mine(page = 0, size = 20) {
    validatePage(page, size);
    return api.get<ApiResponse<PageResponse<GuideBooking>>>(GUIDE_BOOKING_ENDPOINTS.mine, {
      params: { page, size },
    });
  },
  requests(page = 0, size = 20) {
    validatePage(page, size);
    return api.get<ApiResponse<PageResponse<GuideBooking>>>(GUIDE_BOOKING_ENDPOINTS.requests, {
      params: { page, size },
    });
  },
  operations(page = 0, size = 20) {
    validatePage(page, size);
    return api.get<ApiResponse<PageResponse<GuideBooking>>>(GUIDE_BOOKING_ENDPOINTS.operations, {
      params: { page, size },
    });
  },
  get(id: number) {
    return api.get<ApiResponse<GuideBooking>>(`${GUIDE_BOOKING_ENDPOINTS.root}/${id}`);
  },
  accept(id: number) {
    return api.post<ApiResponse<GuideBooking>>(`${GUIDE_BOOKING_ENDPOINTS.root}/${id}/accept`);
  },
  reject(id: number, reason: string) {
    const normalized = reason.trim();
    if (!normalized) throw new Error("A rejection reason is required.");
    if (normalized.length > 1000)
      throw new Error("Rejection reason must be 1000 characters or fewer.");
    return api.post<ApiResponse<GuideBooking>>(`${GUIDE_BOOKING_ENDPOINTS.root}/${id}/reject`, {
      reason: normalized,
    });
  },
  cancel(id: number) {
    return api.post<ApiResponse<GuideBooking>>(`${GUIDE_BOOKING_ENDPOINTS.root}/${id}/cancel`);
  },
  complete(id: number) {
    return api.post<ApiResponse<GuideBooking>>(`${GUIDE_BOOKING_ENDPOINTS.root}/${id}/complete`);
  },
  review(id: number, input: { rating: number; title: string; comment: string }) {
    return api.post<ApiResponse<GuideServiceReview>>(`${GUIDE_BOOKING_ENDPOINTS.root}/${id}/review`, input);
  },
};

export type GuideServiceReview = {
  id: number;
  bookingId: number;
  rating: number;
  title: string;
  comment: string;
  reviewer: { id: number; name: string; profileImage?: string | null };
  createdAt: string;
  updatedAt: string;
};
