import api, { API_BASE_URL } from "../api/axios";
import type { ApiResponse, PageResponse } from "../types/api";

export type CategoryStatus = "ACTIVE" | "INACTIVE";

export type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  status: CategoryStatus;
  adminId?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CategoryInput = {
  name: string;
  description: string;
  status: CategoryStatus;
};

const categoryData = (input: CategoryInput) => ({
  name: input.name,
  description: input.description,
  status: input.status,
});

const multipartCategory = (input: CategoryInput, image?: File | null) => {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(categoryData(input))], { type: "application/json" }));
  if (image) formData.append("image", image);
  return formData;
};

export type CategoryQuery = {
  keyword?: string;
  status?: CategoryStatus | "";
  page?: number;
  size?: number;
  sortBy?: "id" | "name" | "slug" | "status" | "createdAt" | "updatedAt";
  sortDir?: "asc" | "desc";
};

export type CategoryTrip = {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  duration: number;
  price: number;
  currency: string;
  availableSeats: number;
  startDate?: string | null;
  difficulty?: string | null;
  featuredImage?: string | null;
  rating?: number | null;
  available: boolean;
  destination?: { id: number; name: string; slug: string };
};

export const CATEGORY_ENDPOINTS = {
  admin: "/api/admin/categories",
  mine: "/api/admin/categories/mine",
  public: "/api/categories",
} as const;

const publicDefaults = { page: 0, size: 20, sortBy: "name" as const, sortDir: "asc" as const };

export const categoryImageUrl = (image?: string | null) => {
  if (!image) return "";
  return image.startsWith("http://") || image.startsWith("https://") ? image : `${API_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

export const categoryService = {
  adminList(query: CategoryQuery) {
    return api.get<ApiResponse<PageResponse<Category>>>(CATEGORY_ENDPOINTS.admin, { params: query });
  },
  myCategories(query: Omit<CategoryQuery, "keyword"> = {}) {
    return api.get<ApiResponse<PageResponse<Category>>>(CATEGORY_ENDPOINTS.mine, { params: query });
  },
  adminById(id: number) {
    return api.get<ApiResponse<Category>>(`${CATEGORY_ENDPOINTS.admin}/${id}`);
  },
  create(input: CategoryInput, image?: File | null) {
    return image
      ? api.post<ApiResponse<Category>>(
          CATEGORY_ENDPOINTS.admin,
          multipartCategory(input, image),
        )
      : api.post<ApiResponse<Category>>(
          CATEGORY_ENDPOINTS.admin,
          categoryData(input),
        );
  },
  update(id: number, input: CategoryInput, image?: File | null) {
    return api.put<ApiResponse<Category>>(
      `${CATEGORY_ENDPOINTS.admin}/${id}`,
      multipartCategory(input, image),
    );
  },
  updateStatus(id: number, status: CategoryStatus) {
    return api.patch<ApiResponse<Category>>(`${CATEGORY_ENDPOINTS.admin}/${id}/status`, { status });
  },
  delete(id: number) {
    return api.delete<ApiResponse<null>>(`${CATEGORY_ENDPOINTS.admin}/${id}`);
  },
  publicList(query: Omit<CategoryQuery, "status"> = {}) {
    return api.get<ApiResponse<PageResponse<Category>>>(CATEGORY_ENDPOINTS.public, { params: { ...publicDefaults, ...query, keyword: query.keyword || undefined } });
  },
  publicById(id: number) {
    return api.get<ApiResponse<Category>>(`${CATEGORY_ENDPOINTS.public}/${id}`);
  },
  publicBySlug(slug: string) {
    return api.get<ApiResponse<Category>>(`${CATEGORY_ENDPOINTS.public}/${encodeURIComponent(slug)}`);
  },
  trips(categoryId: number, page = 0, size = 20) {
    return api.get<ApiResponse<PageResponse<CategoryTrip>>>(`${CATEGORY_ENDPOINTS.public}/${categoryId}/trips`, { params: { page, size } });
  },
};
