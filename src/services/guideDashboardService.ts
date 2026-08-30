import api from "../api/axios";
import type { ApiResponse } from "../types/api";

export type GuideDashboardTrip = {
  id?: number;
  title?: string;
  tripName?: string;
  name?: string;
  date?: string;
};
export type GuideDashboardData = {
  upcomingTrips: GuideDashboardTrip[];
  revenue: number;
  bookings: number;
  unreadMessages: number;
};

export const GUIDE_DASHBOARD_ENDPOINT = "/api/dashboard/guide";
export const LEGACY_GUIDE_DASHBOARD_ENDPOINT = "/dashboard/guide";

export const guideDashboardService = {
  get() {
    return api.get<ApiResponse<GuideDashboardData>>(GUIDE_DASHBOARD_ENDPOINT);
  },
  getLegacy() {
    return api.get<ApiResponse<GuideDashboardData>>(LEGACY_GUIDE_DASHBOARD_ENDPOINT);
  },
};
