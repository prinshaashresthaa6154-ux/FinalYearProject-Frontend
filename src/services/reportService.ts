import api from "../api/axios";
import type { ApiResponse } from "../types/api";
import type { AdminReport } from "./adminDashboardService";

export type ReportFilters = {
  from?: string;
  to?: string;
  destination?: string;
  category?: string;
  trip?: string;
  status?: string;
};
const bookingStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED"];
const paymentStatuses = ["UNPAID", "INITIATED", "PAID", "FAILED", "CANCELLED", "REFUNDED"];
const tripStatuses = ["DRAFT", "PUBLISHED", "UNPUBLISHED", "FULL", "COMPLETED", "CANCELLED"];
const REPORT_ENDPOINTS = {
  admin: "/api/admin/reports",
  superadmin: "/api/superadmin/reports",
} as const;
const params = (filters: ReportFilters, status?: string) => ({
  from: filters.from || undefined,
  to: filters.to || undefined,
  destination: filters.destination ? Number(filters.destination) : undefined,
  category: filters.category ? Number(filters.category) : undefined,
  trip: filters.trip ? Number(filters.trip) : undefined,
  status: status || undefined,
});
const request = (
  scope: "admin" | "superadmin",
  report: "bookings" | "revenue" | "trips" | "users",
  filters: ReportFilters,
) =>
  api.get<ApiResponse<AdminReport>>(`${REPORT_ENDPOINTS[scope]}/${report}`, {
    params: params(filters, filters.status),
  });

export const reportService = {
  bookings(filters: ReportFilters = {}) {
    return request("admin", "bookings", filters);
  },
  revenue(filters: ReportFilters = {}) {
    return request("admin", "revenue", filters);
  },
  trips(filters: ReportFilters = {}) {
    return request("admin", "trips", filters);
  },
  users(filters: ReportFilters = {}) {
    return request("admin", "users", filters);
  },
  admin(filters: ReportFilters) {
    return Promise.all([
      this.bookings({ ...filters, status: bookingStatuses.includes(filters.status || "") ? filters.status : "" }),
      this.revenue({
        ...filters,
        status: paymentStatuses.includes(filters.status || "")
          ? filters.status
          : "",
      }),
      this.trips({
        ...filters,
        status: tripStatuses.includes(filters.status || "")
          ? filters.status
          : "",
      }),
      this.users({ ...filters, status: bookingStatuses.includes(filters.status || "") ? filters.status : "" }),
    ]);
  },
  superadmin(filters: ReportFilters) {
    return Promise.all([
      request("superadmin", "bookings", { ...filters, status: bookingStatuses.includes(filters.status || "") ? filters.status : "" }),
      request("superadmin", "revenue", {
        ...filters,
        status: paymentStatuses.includes(filters.status || "")
          ? filters.status
          : "",
      }),
      request("superadmin", "trips", {
        ...filters,
        status: tripStatuses.includes(filters.status || "")
          ? filters.status
          : "",
      }),
      request("superadmin", "users", { ...filters, status: bookingStatuses.includes(filters.status || "") ? filters.status : "" }),
    ]);
  },
};
