import api from "../api/axios";
import type { ApiResponse, PageResponse } from "../types/api";

export type FreelanceGuideApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export type FreelanceGuideProfileInput = {
  experience: number;
  languages: string[];
  certificate: string;
  availability: boolean;
  specialization: string[];
};

export type FreelanceGuideProfile = FreelanceGuideProfileInput & {
  id: number;
  userId?: number;
  name?: string;
  fullName?: string;
  email?: string;
  profileImage?: string | null;
  rating?: number;
  approvalStatus?: FreelanceGuideApprovalStatus;
  rejectionReason?: string | null;
};

export type FreelanceGuideQuery = {
  keyword?: string;
  approvalStatus?: FreelanceGuideApprovalStatus;
  availability?: boolean;
  language?: string;
  specialization?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};

const PROFILE_ENDPOINT = "/api/freelance-guides/profile";
const PUBLIC_ENDPOINT = "/api/freelance-guides";

export const LEGACY_FREELANCE_GUIDE_ENDPOINTS = {
  profile: PROFILE_ENDPOINT,
  public: PUBLIC_ENDPOINT,
} as const;

export const freelanceGuideService = {
  create(input: FreelanceGuideProfileInput) {
    return api.post<ApiResponse<FreelanceGuideProfile>>(LEGACY_FREELANCE_GUIDE_ENDPOINTS.profile, input);
  },
  me() {
    return api.get<ApiResponse<FreelanceGuideProfile>>(LEGACY_FREELANCE_GUIDE_ENDPOINTS.profile);
  },
  update(input: FreelanceGuideProfileInput) {
    return api.put<ApiResponse<FreelanceGuideProfile>>(LEGACY_FREELANCE_GUIDE_ENDPOINTS.profile, input);
  },
  list(query: FreelanceGuideQuery = {}) {
    return api.get<ApiResponse<PageResponse<FreelanceGuideProfile>>>(LEGACY_FREELANCE_GUIDE_ENDPOINTS.public, {
      params: { page: 0, size: 20, sortBy: "rating", sortDir: "desc", ...query },
    });
  },
  get(id: number) {
    return api.get<ApiResponse<FreelanceGuideProfile>>(`${LEGACY_FREELANCE_GUIDE_ENDPOINTS.public}/${id}`);
  },
};
