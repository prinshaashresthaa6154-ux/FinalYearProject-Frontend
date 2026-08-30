import api from "../api/axios";
import type { ApiResponse, PageResponse } from "../types/api";
import type { TripReview } from "./reviewService";
import type { GuideServiceReview } from "./guideBookingService";

export type GuideDestination = { id: number; name: string; slug: string; province: string; district: string };
export type GuideProfile = { id: number; userId: number; name: string; bio: string; experience: number; specialization: string[]; destinations: GuideDestination[]; languages: string[]; certifications: string[]; profileImage?: string | null; rating: number; availability: boolean; dailyRate: number; rateCurrency: string; approvalStatus?: "PENDING" | "APPROVED" | "REJECTED"; guideApprovalStatus?: "PENDING" | "APPROVED" | "REJECTED"; verificationStatus?: string | null };
export type GuideProfileInput = { bio: string; experience: number; specialization: string[]; destinations: number[]; languages: string[]; certifications: string[]; dailyRate: number; rateCurrency: string };
export type GuideQuery = { keyword?: string; availability?: boolean; language?: string; specialization?: string; destinationId?: number; page?: number; size?: number; sortBy?: string; sortDir?: "asc" | "desc" };

export const GUIDE_ENDPOINTS = {
  public: "/api/guides",
  search: "/api/guides/search",
  profile: "/api/guides/me",
  availability: "/api/guides/me/availability",
} as const;

const defaultQuery: Required<Pick<GuideQuery, "page" | "size" | "sortBy" | "sortDir">> = {
  page: 0,
  size: 20,
  sortBy: "rating",
  sortDir: "desc",
};

export const guideService = {
  list(params: GuideQuery = {}) { return api.get<ApiResponse<PageResponse<GuideProfile>>>(GUIDE_ENDPOINTS.public, { params: { ...defaultQuery, ...params } }); },
  search(params: GuideQuery = {}) { return api.get<ApiResponse<PageResponse<GuideProfile>>>(GUIDE_ENDPOINTS.search, { params: { ...defaultQuery, ...params } }); },
  get(id: number) { return api.get<ApiResponse<GuideProfile>>(`${GUIDE_ENDPOINTS.public}/${id}`); },
  me() { return api.get<ApiResponse<GuideProfile>>(GUIDE_ENDPOINTS.profile); },
  update(input: GuideProfileInput) { return api.put<ApiResponse<GuideProfile>>(GUIDE_ENDPOINTS.profile, input); },
  setAvailability(availability: boolean) { return api.put<ApiResponse<GuideProfile>>(GUIDE_ENDPOINTS.availability, { availability }); },
  reviews(id: number, page = 0, size = 20) { return api.get<ApiResponse<PageResponse<TripReview>>>(`/api/guides/${id}/reviews`, { params: { page, size } }); },
  serviceReviews(id: number, page = 0, size = 20) { return api.get<ApiResponse<PageResponse<GuideServiceReview>>>(`/api/guides/${id}/service-reviews`, { params: { page, size } }); },
};
