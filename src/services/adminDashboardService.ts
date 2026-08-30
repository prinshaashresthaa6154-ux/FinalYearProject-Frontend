import api from "../api/axios";
import type { ApiResponse } from "../types/api";

export type AdminDashboardData = {
  totalCategories: number;
  totalDestinations: number;
  totalTrips: number;
  publishedTrips: number;
  draftTrips: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  revenue: number;
  averageRating: number;
  reviewCount: number;
  activeGroups: number;
};

export type ReportPoint = { label: string; value: number; count: number };
export type RankedItem = { id: number; label: string; count: number; amount: number; currency?: string | null };
export type AdminReport = { reportType: string; summary: Array<{ key: string; value: number }>; statusSeries: ReportPoint[]; timeSeries: ReportPoint[]; rankedItems: RankedItem[] };

export const ADMIN_DASHBOARD_ENDPOINT = "/api/admin/dashboard";

export const adminDashboardService = {
  dashboard() { return api.get<ApiResponse<AdminDashboardData>>(ADMIN_DASHBOARD_ENDPOINT); },
  bookingReport() { return api.get<ApiResponse<AdminReport>>("/api/admin/reports/bookings"); },
  revenueReport() { return api.get<ApiResponse<AdminReport>>("/api/admin/reports/revenue"); },
  tripReport() { return api.get<ApiResponse<AdminReport>>("/api/admin/reports/trips"); },
};
