import api, { API_BASE_URL } from "../api/axios";
import type { ApiResponse, PageResponse } from "../types/api";

export type DestinationStatus = "DRAFT" | "ACTIVE" | "INACTIVE";
export type DestinationDifficulty = "EASY" | "MODERATE" | "CHALLENGING" | "DIFFICULT" | "EXTREME";
export type BestSeason = "SPRING" | "SUMMER" | "MONSOON" | "AUTUMN" | "WINTER" | "ALL_YEAR";

export type Destination = {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  province: string;
  district: string;
  location: string;
  latitude: number;
  longitude: number;
  category: { id: number; name: string };
  difficulty: DestinationDifficulty;
  bestSeason: BestSeason;
  estimatedCost: number;
  rating: number;
  coverImage?: string | null;
  featuredImage?: string | null;
  gallery: string[];
  status: DestinationStatus;
  adminId?: number | null;
  reviewCount: number;
  packageCount: number;
  createdAt: string;
  updatedAt: string;
};

export type DestinationInput = {
  name: string;
  shortDescription: string;
  description: string;
  province: string;
  district: string;
  location: string;
  latitude: number;
  longitude: number;
  categoryId: number;
  difficulty: DestinationDifficulty;
  bestSeason: BestSeason;
  estimatedCost: number;
  status: DestinationStatus;
};

export type DestinationQuery = {
  keyword?: string;
  province?: string;
  district?: string;
  categoryId?: number;
  status?: DestinationStatus | "";
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};

export type PublicDestinationQuery = Omit<DestinationQuery, "status"> & {
  minBudget?: number;
  maxBudget?: number;
  difficulty?: DestinationDifficulty | "";
  season?: BestSeason | "";
  minRating?: number;
};

export type DestinationTrip = {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  duration: number;
  price: number;
  currency: string;
  availableSeats: number;
  startDate?: string | null;
  featuredImage?: string | null;
  status?: string;
  available: boolean;
  adminName?: string | null;
  admin?: { id?: number; name?: string | null; fullName?: string | null } | null;
  provider?: { id?: number; name?: string | null; fullName?: string | null } | null;
};

export const DESTINATION_ENDPOINTS = {
  admin: "/api/admin/destinations",
  public: "/api/destinations",
  search: "/api/destinations/search",
} as const;

const publicDefaults = { page: 0, size: 20, sortBy: "rating", sortDir: "desc" as const };

export const mediaUrl = (value?: string | null) => {
  if (!value) return "";
  return value.startsWith("http://") || value.startsWith("https://") ? value : `${API_BASE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
};

const multipart = (data: DestinationInput, featuredImage?: File | null, gallery: File[] = []) => {
  const form = new FormData();
  form.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
  if (featuredImage) form.append("featuredImage", featuredImage);
  gallery.forEach((file) => form.append("gallery[]", file));
  return form;
};

export const destinationService = {
  adminList(query: DestinationQuery) { return api.get<ApiResponse<PageResponse<Destination>>>(DESTINATION_ENDPOINTS.admin, { params: query }); },
  adminById(id: number) { return api.get<ApiResponse<Destination>>(`${DESTINATION_ENDPOINTS.admin}/${id}`); },
  create(data: DestinationInput, featuredImage: File, gallery: File[]) { return api.post<ApiResponse<Destination>>(DESTINATION_ENDPOINTS.admin, multipart(data, featuredImage, gallery)); },
  update(id: number, data: DestinationInput, featuredImage: File | null, gallery: File[]) { return api.put<ApiResponse<Destination>>(`${DESTINATION_ENDPOINTS.admin}/${id}`, multipart(data, featuredImage, gallery)); },
  updateStatus(id: number, status: DestinationStatus) { return api.patch<ApiResponse<Destination>>(`${DESTINATION_ENDPOINTS.admin}/${id}/status`, { status }); },
  delete(id: number) { return api.delete<ApiResponse<null>>(`${DESTINATION_ENDPOINTS.admin}/${id}`); },
  publicList(query: PublicDestinationQuery = {}) { return api.get<ApiResponse<PageResponse<Destination>>>(DESTINATION_ENDPOINTS.public, { params: cleanParams({ ...publicDefaults, ...query }) }); },
  search(query: PublicDestinationQuery = {}) { return api.get<ApiResponse<PageResponse<Destination>>>(DESTINATION_ENDPOINTS.search, { params: cleanParams({ ...publicDefaults, ...query }) }); },
  publicBySlug(slug: string) { return api.get<ApiResponse<Destination>>(`${DESTINATION_ENDPOINTS.public}/${encodeURIComponent(slug)}`); },
  publicById(id: number) { return api.get<ApiResponse<Destination>>(`${DESTINATION_ENDPOINTS.public}/${id}`); },
  trips(id: number, page = 0, size = 20) { return api.get<ApiResponse<PageResponse<DestinationTrip>>>(`${DESTINATION_ENDPOINTS.public}/${id}/trips`, { params: { page, size } }); },
};

function cleanParams<T extends Record<string, unknown>>(params: T) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ""));
}
