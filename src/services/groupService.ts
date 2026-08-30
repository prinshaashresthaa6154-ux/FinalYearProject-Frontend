import api from "../api/axios";
import type { ApiResponse, PageResponse } from "../types/api";

export type GroupStatus =
  "OPEN" | "CONFIRMED" | "FULL" | "CANCELLED" | "COMPLETED";
export type GroupTripModerationStatus = "CANCELLED" | "COMPLETED";
export const GROUP_STATUSES: GroupStatus[] = [
  "OPEN",
  "CONFIRMED",
  "FULL",
  "CANCELLED",
  "COMPLETED",
];
export type StandaloneGroupTrip = {
  id: number;
  tripName: string;
  destination: { id: number; name: string; province: string; district: string };
  guide: {
    id: number;
    fullName: string;
    profileImage?: string | null;
    rating: number | null;
  };
  maximumMembers: number;
  minimumMembers: number;
  currentMembers: number;
  availableSeats: number;
  price: number;
  date: string;
  status: GroupStatus;
  createdAt: string;
  updatedAt: string;
};
export type GroupTripInput = {
  tripName: string;
  destinationId: number;
  maximumMembers: number;
  minimumMembers: number;
  price: number;
  date: string;
};
export type GroupTripParticipant = {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  profileImage?: string | null;
  joinedAt: string;
};
export type GroupTripQuery = {
  keyword?: string;
  destinationId?: number;
  guideId?: number;
  status?: GroupStatus | "";
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};
export type GroupMembershipAction = { groupTripId: number };

export const GROUP_TRIP_ENDPOINTS = {
  public: "/api/group-trips",
} as const;
const defaultListQuery = {
  page: 0,
  size: 20,
  sortBy: "date",
  sortDir: "asc" as const,
};

export const groupService = {
  create(input: GroupTripInput) {
    return api.post<ApiResponse<StandaloneGroupTrip>>(
      GROUP_TRIP_ENDPOINTS.public,
      input,
    );
  },
  list(query: GroupTripQuery = {}) {
    const params = { ...defaultListQuery, ...query };
    return api.get<ApiResponse<PageResponse<StandaloneGroupTrip>>>(
      GROUP_TRIP_ENDPOINTS.public,
      {
        params: Object.fromEntries(
          Object.entries(params).filter(
            ([, value]) => value !== undefined && value !== "",
          ),
        ),
      },
    );
  },
  byId(id: number) {
    return api.get<ApiResponse<StandaloneGroupTrip>>(
      `${GROUP_TRIP_ENDPOINTS.public}/${id}`,
    );
  },
  update(id: number, input: GroupTripInput) {
    return api.put<ApiResponse<StandaloneGroupTrip>>(
      `${GROUP_TRIP_ENDPOINTS.public}/${id}`,
      input,
    );
  },
  delete(id: number) {
    return api.delete<ApiResponse<null>>(
      `${GROUP_TRIP_ENDPOINTS.public}/${id}`,
    );
  },
  participants(id: number, page = 0, size = 20) {
    return api.get<ApiResponse<PageResponse<GroupTripParticipant>>>(
      `${GROUP_TRIP_ENDPOINTS.public}/${id}/participants`,
      { params: { page, size } },
    );
  },
  joinStandalone(id: number) {
    if (!Number.isInteger(id) || id <= 0)
      throw new Error("Group trip ID must be a positive number.");
    return api.post<ApiResponse<StandaloneGroupTrip>>(
      `${GROUP_TRIP_ENDPOINTS.public}/${id}/join`,
    );
  },
  leaveStandalone(id: number) {
    return api.delete<ApiResponse<null>>(
      `${GROUP_TRIP_ENDPOINTS.public}/${id}/leave`,
    );
  },
  updateStatus(id: number, status: GroupTripModerationStatus) {
    return api.patch<ApiResponse<StandaloneGroupTrip>>(
      `${GROUP_TRIP_ENDPOINTS.public}/${id}/status`,
      { status },
    );
  },
  approveGuide(
    id: number,
    approvalStatus: "APPROVED" | "REJECTED",
    moderationNote: string,
  ) {
    return api.patch<ApiResponse<unknown>>(
      `/api/freelance-guides/${id}/approval`,
      { approvalStatus, moderationNote },
    );
  },
};
