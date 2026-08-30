import api from "../api/axios";
import type { ApiResponse, PageResponse } from "../types/api";
import type { SimilarTrip } from "./tripService";

export type TripViewResponse = { tripId: number; personalized: boolean; viewCount?: number | null; viewedAt: string };
export type DestinationRecommendation = { id: number; name: string; province: string; district: string; categoryId: number; categoryName: string; difficulty: string; bestSeason: string; estimatedCost: number; rating: number; coverImage?: string | null; recommendationScore: number };
export type RecentlyViewedDestination = { id: number; destination: DestinationRecommendation; viewedAt: string; viewCount: number };
export type RecommendationSeason = "SPRING" | "SUMMER" | "MONSOON" | "AUTUMN" | "WINTER" | "ALL_YEAR";
export type RecommendationDifficulty = "EASY" | "MODERATE" | "CHALLENGING" | "DIFFICULT" | "EXTREME";
export type RecommendationQuery = { categoryId?: number; maxBudget?: number; province?: string; season?: RecommendationSeason; difficulty?: RecommendationDifficulty; page?: number; size?: number };

export const RECOMMENDATION_ENDPOINTS = {
  destinations: "/api/recommendations",
  recentlyViewed: "/api/recommendations/recently-viewed",
} as const;

const validateDestinationId = (destinationId: number) => {
  if (!Number.isInteger(destinationId) || destinationId <= 0) throw new Error("Destination ID must be a positive number.");
};

const cleanParams = (params: Record<string, unknown>) => Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ""));

export const recommendationService = {
  destinations(query: RecommendationQuery = {}) {
    return api.get<ApiResponse<PageResponse<DestinationRecommendation>>>(RECOMMENDATION_ENDPOINTS.destinations, { params: cleanParams({ page: 0, size: 20, ...query }) });
  },
  recentlyViewed(page = 0, size = 20) {
    return api.get<ApiResponse<PageResponse<RecentlyViewedDestination>>>(RECOMMENDATION_ENDPOINTS.recentlyViewed, { params: { page, size } });
  },
  recordDestinationView(destinationId: number) {
    validateDestinationId(destinationId);
    return api.post<ApiResponse<RecentlyViewedDestination>>(`${RECOMMENDATION_ENDPOINTS.recentlyViewed}/${destinationId}`);
  },
  clearRecentlyViewed() {
    return api.delete<ApiResponse<null>>(RECOMMENDATION_ENDPOINTS.recentlyViewed);
  },
  trips(page = 0, size = 6) {
    return api.get<ApiResponse<PageResponse<SimilarTrip>>>("/api/recommendations/trips", { params: { page, size } });
  },
  similar(tripId: number, page = 0, size = 6) {
    return api.get<ApiResponse<PageResponse<SimilarTrip>>>(`/api/trips/${tripId}/similar`, { params: { page, size } });
  },
  recordView(tripId: number) {
    return api.post<ApiResponse<TripViewResponse>>(`/api/trips/${tripId}/view`);
  },
};
