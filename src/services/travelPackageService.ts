import api from "../api/axios";
import type { ApiResponse, PageResponse } from "../types/api";

export type TravelPackageStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "PUBLISHED";
export type TravelPackage = { id: number; title: string; description: string; price: number; duration: number; capacity: number; availableSeats?: number; destinationId?: number; guideId?: number; destination?: { id: number; name: string; province?: string; district?: string } | null; guide?: { id: number; name: string } | null; difficulty: string; includes: string[]; excludes: string[]; itinerary: string[]; status: TravelPackageStatus; createdAt?: string; updatedAt?: string };
export type TravelPackageInput = { title: string; description: string; price: number; duration: number; capacity: number; destinationId: number; guideId: number; difficulty: string; includes: string[]; excludes: string[]; itinerary: string[]; status: TravelPackageStatus };
export type TravelPackageQuery = { keyword?: string; status?: TravelPackageStatus | ""; destinationId?: number; guideId?: number; minPrice?: number; maxPrice?: number; minDuration?: number; maxDuration?: number; difficulty?: string; page?: number; size?: number; sortBy?: string; sortDir?: "asc" | "desc" };

export const TRAVEL_PACKAGE_ENDPOINTS = {
  public: "/api/travel-packages",
  search: "/api/travel-packages/search",
} as const;

const publicDefaults = { page: 0, size: 20, sortBy: "createdAt", sortDir: "desc" as const };

const cleanParams = (query: TravelPackageQuery) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined && value !== ""));

export const travelPackageService = {
  list(query: TravelPackageQuery = {}) { return api.get<ApiResponse<PageResponse<TravelPackage>>>(TRAVEL_PACKAGE_ENDPOINTS.public, { params: cleanParams({ ...publicDefaults, ...query }) }); },
  search(query: TravelPackageQuery = {}) { return api.get<ApiResponse<PageResponse<TravelPackage>>>(TRAVEL_PACKAGE_ENDPOINTS.search, { params: cleanParams({ ...publicDefaults, ...query }) }); },
  byId(id: number) { return api.get<ApiResponse<TravelPackage>>(`${TRAVEL_PACKAGE_ENDPOINTS.public}/${id}`); },
  create(input: TravelPackageInput) { return api.post<ApiResponse<TravelPackage>>(TRAVEL_PACKAGE_ENDPOINTS.public, input); },
  update(id: number, input: TravelPackageInput) { return api.put<ApiResponse<TravelPackage>>(`${TRAVEL_PACKAGE_ENDPOINTS.public}/${id}`, input); },
  delete(id: number) { return api.delete<ApiResponse<null>>(`${TRAVEL_PACKAGE_ENDPOINTS.public}/${id}`); },
};
