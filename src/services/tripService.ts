import api from "../api/axios";
import type { ApiResponse, PageResponse } from "../types/api";
import type { DestinationDifficulty } from "./destinationService";

export type PackageStatus =
  | "DRAFT"
  | "ACTIVE"
  | "INACTIVE"
  | "SOLD_OUT"
  | "PUBLISHED"
  | "UNPUBLISHED"
  | "FULL"
  | "COMPLETED"
  | "CANCELLED";
export type ItineraryDay = {
  dayNumber: number;
  title: string;
  description: string;
  activities: string;
  accommodation: string;
  meals: string;
};
export type TripInput = {
  title: string;
  shortDescription: string;
  description: string;
  destinationId: number;
  categoryId: number;
  duration: number;
  startLocation: string;
  endLocation: string;
  itinerary: string[];
  price: number;
  currency: string;
  maxParticipants: number;
  minimumParticipants: number;
  startDate: string | null;
  endDate: string | null;
  bookingStartDate: string | null;
  bookingEndDate: string | null;
  inclusions: string[];
  exclusions: string[];
  requirements: string[];
  difficulty: DestinationDifficulty;
  groupJoinEnabled: boolean;
};

const disableLegacyGroupJoining = (input: TripInput): TripInput => ({
  ...input,
  groupJoinEnabled: false,
});
export type Trip = TripInput & {
  id: number;
  slug: string;
  provider?: { adminId?: number; id?: number; name: string } | null;
  destination: { id: number; name: string; slug: string };
  category: { id: number; name: string; slug: string };
  availableSeats: number;
  featuredImage?: string | null;
  gallery: string[];
  status: PackageStatus;
  rating: number;
  popularity: number;
  available: boolean;
  createdAt: string;
  updatedAt: string;
};
export type TripReview = {
  id: number;
  rating: number;
  title: string;
  comment: string;
  reviewer: { id: number; name: string; profileImage?: string | null };
  createdAt: string;
};
export type TripRating = {
  tripId: number;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<string, number>;
};
export type SimilarTrip = {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  provider?: { id: number; name: string };
  destination: { id: number; name: string; slug: string };
  category: { id: number; name: string; slug: string };
  duration: number;
  price: number;
  currency: string;
  difficulty: string;
  featuredImage?: string | null;
  rating: number;
  availableSeats: number;
  available: boolean;
  startDate?: string | null;
};
export type AdminTripQuery = {
  keyword?: string;
  status?: PackageStatus | "";
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};
export type PublicTripQuery = {
  keyword?: string;
  destinationId?: number;
  categoryId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};
export type TripSearchQuery = {
  keyword?: string;
  destinationId?: number;
  categoryId?: number;
  admin?: number;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  difficulty?: string;
  rating?: number;
  date?: string;
  availableOnly?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
};
export type TripBookability = { bookable: boolean; reason: string };

export const TRIP_ENDPOINTS = {
  admin: "/api/admin/trips",
  public: "/api/trips",
  search: "/api/trips/search",
  featured: "/api/trips/featured",
} as const;

export const encodeItineraryDay = (day: ItineraryDay) => JSON.stringify(day);
export const decodeItineraryDay = (
  value: string | Partial<ItineraryDay>,
  index: number,
): ItineraryDay => {
  try {
    const parsed =
      typeof value === "string"
        ? (JSON.parse(value) as Partial<ItineraryDay>)
        : value;
    return {
      dayNumber: parsed.dayNumber ?? index + 1,
      title: parsed.title ?? `Day ${index + 1}`,
      description: parsed.description ?? "",
      activities: parsed.activities ?? "",
      accommodation: parsed.accommodation ?? "",
      meals: parsed.meals ?? "",
    };
  } catch {
    return {
      dayNumber: index + 1,
      title: `Day ${index + 1}`,
      description: typeof value === "string" ? value : "",
      activities: "",
      accommodation: "",
      meals: "",
    };
  }
};
const multipart = (
  data: TripInput,
  featured?: File | null,
  gallery: File[] = [],
) => {
  const form = new FormData();
  form.append(
    "data",
    new Blob([JSON.stringify(data)], { type: "application/json" }),
  );
  if (featured) form.append("featuredImage", featured);
  gallery.forEach((file) => form.append("gallery[]", file));
  return form;
};
const cleanParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );
const publicDefaults = {
  page: 0,
  size: 20,
  sortBy: "startDate",
  sortDir: "asc" as const,
};
const searchDefaults = {
  page: 0,
  size: 20,
  sortBy: "createdAt",
  sortDir: "desc",
  availableOnly: false,
};

const localDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getTripBookability = (
  trip: Trip,
  participants = 1,
  currentDate = localDate(),
): TripBookability => {
  if (trip.status !== "PUBLISHED")
    return { bookable: false, reason: "This trip is not published." };
  if (trip.bookingStartDate && currentDate < trip.bookingStartDate)
    return {
      bookable: false,
      reason: `Bookings open on ${trip.bookingStartDate}.`,
    };
  if (trip.bookingEndDate && currentDate > trip.bookingEndDate)
    return { bookable: false, reason: "The booking window has closed." };
  if (trip.startDate && currentDate >= trip.startDate)
    return { bookable: false, reason: "This trip has already started." };
  if (trip.availableSeats <= 0)
    return { bookable: false, reason: "No seats are available." };
  if (!Number.isInteger(participants) || participants < 1)
    return { bookable: false, reason: "Choose at least one participant." };
  if (participants > trip.availableSeats)
    return {
      bookable: false,
      reason: `Only ${trip.availableSeats} seats are available.`,
    };
  if (!trip.available)
    return { bookable: false, reason: "This trip is currently unavailable." };
  return { bookable: true, reason: `${trip.availableSeats} seats available.` };
};

export const tripService = {
  publicList(params: PublicTripQuery = {}) {
    return api.get<ApiResponse<PageResponse<Trip>>>(TRIP_ENDPOINTS.public, {
      params: cleanParams({ ...publicDefaults, ...params }),
    });
  },
  search(params: TripSearchQuery = {}) {
    return api.get<ApiResponse<PageResponse<Trip>>>(TRIP_ENDPOINTS.search, {
      params: cleanParams({ ...searchDefaults, ...params }),
    });
  },
  featured(page = 0, size = 10) {
    return api.get<ApiResponse<PageResponse<Trip>>>(TRIP_ENDPOINTS.featured, {
      params: { page, size },
    });
  },
  popular(size = 6) {
    return api.get<ApiResponse<PageResponse<Trip>>>(TRIP_ENDPOINTS.search, {
      params: { page: 0, size, sortBy: "popularity", sortDir: "desc" },
    });
  },
  adminList(params: AdminTripQuery) {
    return api.get<ApiResponse<PageResponse<Trip>>>(TRIP_ENDPOINTS.admin, {
      params,
    });
  },
  adminById(id: number) {
    return api.get<ApiResponse<Trip>>(`${TRIP_ENDPOINTS.admin}/${id}`);
  },
  create(data: TripInput, featured: File | null, gallery: File[]) {
    return api.post<ApiResponse<Trip>>(
      TRIP_ENDPOINTS.admin,
      multipart(disableLegacyGroupJoining(data), featured, gallery),
    );
  },
  update(id: number, data: TripInput, featured: File | null, gallery: File[]) {
    return api.put<ApiResponse<Trip>>(
      `${TRIP_ENDPOINTS.admin}/${id}`,
      multipart(disableLegacyGroupJoining(data), featured, gallery),
    );
  },
  publish(id: number) {
    return api.patch<ApiResponse<Trip>>(
      `${TRIP_ENDPOINTS.admin}/${id}/publish`,
    );
  },
  unpublish(id: number) {
    return api.patch<ApiResponse<Trip>>(
      `${TRIP_ENDPOINTS.admin}/${id}/unpublish`,
    );
  },
  complete(id: number) {
    return api.patch<ApiResponse<Trip>>(
      `${TRIP_ENDPOINTS.admin}/${id}/complete`,
    );
  },
  cancel(id: number) {
    return api.patch<ApiResponse<Trip>>(`${TRIP_ENDPOINTS.admin}/${id}/cancel`);
  },
  delete(id: number) {
    return api.delete<ApiResponse<null>>(`${TRIP_ENDPOINTS.admin}/${id}`);
  },
  publicBySlug(slug: string) {
    return api.get<ApiResponse<Trip>>(
      `${TRIP_ENDPOINTS.public}/${encodeURIComponent(slug)}`,
    );
  },
  publicById(id: number) {
    return api.get<ApiResponse<Trip>>(`${TRIP_ENDPOINTS.public}/${id}`);
  },
  reviews(id: number) {
    return api.get<ApiResponse<PageResponse<TripReview>>>(
      `/api/trips/${id}/reviews`,
      { params: { page: 0, size: 20 } },
    );
  },
  rating(id: number) {
    return api.get<ApiResponse<TripRating>>(`/api/trips/${id}/reviews/rating`);
  },
  similar(id: number, page = 0, size = 6) {
    return api.get<ApiResponse<PageResponse<SimilarTrip>>>(
      `/api/trips/${id}/similar`,
      { params: { page, size } },
    );
  },
  recordView(id: number) {
    return api.post<
      ApiResponse<{
        tripId: number;
        personalized: boolean;
        viewCount?: number | null;
        viewedAt: string;
      }>
    >(`/api/trips/${id}/view`);
  },
};
