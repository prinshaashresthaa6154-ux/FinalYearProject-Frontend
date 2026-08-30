import api from "../api/axios";
import type { ApiResponse } from "../types/api";
import type { GuideBooking } from "./guideBookingService";
import type { Notification } from "./notificationService";
import type { SimilarTrip } from "./tripService";

export type DashboardUpcomingBooking = {
  bookingId: number;
  bookingReference: string;
  tripId: number;
  tripTitle: string;
  tripSlug: string;
  startDate?: string | null;
  participants: number;
  status: string;
  paymentStatus: string;
  amount: number;
  currency: string;
};

export type UserDashboardData = {
  totalBookings: number;
  upcomingBookings: number;
  completedTrips: number;
  cancelledBookings: number;
  groups: number;
  reviews: number;
  unreadMessages: number;
  unreadNotifications: number;
  upcoming: DashboardUpcomingBooking[];
  groupItems: GuideBooking[];
  reviewItems: unknown[];
  recommendations: SimilarTrip[];
  recentActivity: Notification[];
};

export const userDashboardService = {
  get() {
    return api.get<ApiResponse<UserDashboardData>>("/api/user/dashboard");
  },
};
