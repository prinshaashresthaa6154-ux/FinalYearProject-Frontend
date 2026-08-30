import api from "../api/axios";
import type { ApiResponse, PageResponse } from "../types/api";
import type { Booking } from "./bookingService";

export type ReviewStatus = "PENDING" | "PUBLISHED" | "HIDDEN" | "REJECTED";
export type TripReview = {
  id: number;
  userId: number;
  tripId: number;
  bookingId: number;
  rating: number;
  title: string;
  comment: string;
  status: ReviewStatus;
  reviewer: { id: number; name: string; profileImage?: string | null };
  trip: { id: number; title: string; slug: string; adminId?: number | null };
  createdAt: string;
  updatedAt: string;
};
export type TripRating = {
  tripId: number;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<string, number>;
};
export type ReviewInput = {
  bookingId: number;
  rating: number;
  title: string;
  comment: string;
};
export type BookingReviewInput = Pick<
  ReviewInput,
  "rating" | "title" | "comment"
>;
export type DestinationReviewStatus =
  "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";
export type DestinationReview = {
  id: number;
  destinationId: number;
  userId: number;
  userName?: string;
  rating: number;
  comment: string;
  status: DestinationReviewStatus;
  createdAt: string;
  updatedAt?: string;
};
export type DestinationReviewInput = { rating: number; comment: string };
export type DestinationReviewQuery = {
  status?: DestinationReviewStatus | "";
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};
export type DestinationRating = {
  destinationId: number;
  averageRating: number;
  totalReviews: number;
};

const destinationReviewDefaults = {
  page: 0,
  size: 20,
  sortBy: "createdDate",
  sortDir: "desc" as const,
};
const tripReviewDefaults = {
  page: 0,
  size: 20,
  sortBy: "createdDate",
  sortDir: "desc" as const,
};

export const validateReviewInput = (input: ReviewInput) => {
  const errors: Record<string, string> = {};
  if (!Number.isInteger(input.bookingId) || input.bookingId <= 0)
    errors.bookingId = "A valid booking is required.";
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5)
    errors.rating = "Rating must be between 1 and 5 stars.";
  if (!input.title.trim()) errors.title = "A review title is required.";
  if (!input.comment.trim()) errors.comment = "A review comment is required.";
  return errors;
};

export const reviewService = {
  publicList(tripId: number, page = 0, size = 20) {
    return api.get<ApiResponse<PageResponse<TripReview>>>(
      `/api/trips/${tripId}/reviews`,
      { params: { ...tripReviewDefaults, page, size } },
    );
  },
  rating(tripId: number) {
    return api.get<ApiResponse<TripRating>>(
      `/api/trips/${tripId}/reviews/rating`,
    );
  },
  create(tripId: number, input: ReviewInput) {
    if (!Number.isInteger(tripId) || tripId <= 0)
      throw new Error("A valid trip is required.");
    const normalized = {
      ...input,
      title: input.title.trim(),
      comment: input.comment.trim(),
    };
    const errors = validateReviewInput(normalized);
    if (Object.keys(errors).length > 0)
      throw new Error(Object.values(errors).join(" "));
    return api.post<ApiResponse<TripReview>>(
      `/api/trips/${tripId}/reviews`,
      normalized,
    );
  },
  createForBooking(booking: Booking, input: BookingReviewInput) {
    if (booking.status !== "COMPLETED")
      throw new Error("Only completed bookings can be reviewed.");
    return this.create(booking.travelPackage.id, {
      bookingId: booking.bookingId,
      rating: input.rating,
      title: input.title,
      comment: input.comment,
    });
  },
  mine() {
    return api.get<ApiResponse<PageResponse<TripReview>>>(
      "/api/users/me/reviews",
      { params: { page: 0, size: 100 } },
    );
  },
  update(id: number, input: ReviewInput) {
    return api.put<ApiResponse<TripReview>>(`/api/reviews/${id}`, input);
  },
  delete(id: number) {
    return api.delete<ApiResponse<null>>(`/api/reviews/${id}`);
  },
  admin(
    query: {
      status?: ReviewStatus | "";
      tripId?: number;
      page?: number;
      size?: number;
    } = {},
  ) {
    return api.get<ApiResponse<PageResponse<TripReview>>>(
      "/api/admin/reviews",
      { params: { page: 0, size: 20, ...query } },
    );
  },
  publish(id: number) {
    return api.patch<ApiResponse<TripReview>>(
      `/api/admin/reviews/${id}/publish`,
    );
  },
  hide(id: number) {
    return api.patch<ApiResponse<TripReview>>(`/api/admin/reviews/${id}/hide`);
  },
  moderate(
    id: number,
    status: "APPROVED" | "REJECTED" | "HIDDEN",
    moderationNote: string,
  ) {
    return api.patch<ApiResponse<TripReview>>(`/reviews/${id}/moderate`, {
      status,
      moderationNote,
    });
  },
  destinationById(id: number) {
    return api.get<ApiResponse<DestinationReview>>(`/reviews/${id}`);
  },
  destinationList(destinationId: number, query: DestinationReviewQuery = {}) {
    return api.get<ApiResponse<PageResponse<DestinationReview>>>(
      `/reviews/destinations/${destinationId}`,
      {
        params: {
          ...destinationReviewDefaults,
          ...query,
          status: query.status || undefined,
          keyword: query.keyword || undefined,
        },
      },
    );
  },
  destinationAverage(destinationId: number) {
    return api.get<ApiResponse<DestinationRating>>(
      `/reviews/destinations/${destinationId}/average-rating`,
    );
  },
  createDestination(destinationId: number, input: DestinationReviewInput) {
    return api.post<ApiResponse<DestinationReview>>(
      `/reviews/destinations/${destinationId}`,
      input,
    );
  },
  updateDestination(id: number, input: DestinationReviewInput) {
    return api.put<ApiResponse<DestinationReview>>(`/reviews/${id}`, input);
  },
  deleteDestination(id: number) {
    return api.delete<ApiResponse<null>>(`/reviews/${id}`);
  },
  moderateDestination(
    id: number,
    status: "APPROVED" | "REJECTED" | "HIDDEN",
    moderationNote: string,
  ) {
    return api.patch<ApiResponse<DestinationReview>>(
      `/reviews/${id}/moderate`,
      { status, moderationNote },
    );
  },
};
