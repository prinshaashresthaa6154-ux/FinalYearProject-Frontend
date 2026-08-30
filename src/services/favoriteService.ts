import api from "../api/axios";
import type { ApiResponse, PageResponse } from "../types/api";

export type FavoriteDestination = { id: number; name: string; province: string; district: string; categoryId: number; categoryName: string; difficulty: string; bestSeason: string; estimatedCost: number; rating: number; coverImage?: string | null; status: string };
export type Favorite = { id: number; destination: FavoriteDestination; createdAt: string };
export type FavoriteQuery = { page?: number; size?: number; sortBy?: string; sortDir?: "asc" | "desc" };

export const FAVORITE_ENDPOINTS = {
  list: "/api/favorites",
  destinations: "/api/favorites/destinations",
} as const;

const validateDestinationId = (destinationId: number) => {
  if (!Number.isInteger(destinationId) || destinationId <= 0) {
    throw new Error("Destination ID must be a positive number.");
  }
};

export const favoriteService = {
  list(query: FavoriteQuery = {}) {
    return api.get<ApiResponse<PageResponse<Favorite>>>(FAVORITE_ENDPOINTS.list, {
      params: { page: 0, size: 20, sortBy: "createdAt", sortDir: "desc", ...query },
    });
  },
  add(destinationId: number) {
    validateDestinationId(destinationId);
    return api.post<ApiResponse<Favorite>>(`${FAVORITE_ENDPOINTS.destinations}/${destinationId}`);
  },
  remove(destinationId: number) {
    validateDestinationId(destinationId);
    return api.delete<ApiResponse<null>>(`${FAVORITE_ENDPOINTS.destinations}/${destinationId}`);
  },
};
