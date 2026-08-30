import api from "../api/axios";
import type { ApiResponse, PageResponse } from "../types/api";

export type NotificationType = "REGISTRATION" | "VERIFICATION" | "BOOKING" | "PAYMENT" | "GROUP" | "CHAT" | "REVIEW" | "TRIP_UPDATE" | "SYSTEM" | "BOOKING_CONFIRMATION" | "BOOKING_CANCELLATION" | "NEW_MESSAGE" | "TRIP_REMINDER" | "GROUP_TRIP_UPDATE" | "VERIFICATION_APPROVED" | "VERIFICATION_REJECTED" | "VERIFICATION_RESUBMISSION_REQUIRED";
export type Notification = { id: number; type: NotificationType; title: string; message: string; referenceId?: number | null; read: boolean; createdAt: string; readAt?: string | null };
export type NotificationQuery = { type?: NotificationType | ""; read?: boolean; page?: number; size?: number; sortBy?: string; sortDir?: "asc" | "desc" };

export const NOTIFICATION_ENDPOINTS = {
  list: "/api/notifications",
  unreadCount: "/api/notifications/unread-count",
  readAll: "/api/notifications/read-all",
} as const;

export const notificationService = {
  list(query: NotificationQuery = {}) {
    const params = {
      page: 0,
      size: 20,
      sortBy: "createdAt",
      sortDir: "desc" as const,
      ...query,
      type: query.type || undefined,
    };
    return api.get<ApiResponse<PageResponse<Notification>>>(NOTIFICATION_ENDPOINTS.list, {
      params: Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== "")),
    });
  },
  unreadCount() { return api.get<ApiResponse<number>>(NOTIFICATION_ENDPOINTS.unreadCount); },
  markRead(id: number) { return api.patch<ApiResponse<Notification>>(`${NOTIFICATION_ENDPOINTS.list}/${id}/read`); },
  markAllRead() { return api.patch<ApiResponse<number>>(NOTIFICATION_ENDPOINTS.readAll); },
  delete(id: number) { return api.delete<ApiResponse<null>>(`${NOTIFICATION_ENDPOINTS.list}/${id}`); },
};

export const notificationPath = (notification: Notification, role?: string | null) => {
  const normalized = role?.toUpperCase().replaceAll("-", "_");
  const isAdmin = normalized === "ADMIN" || normalized === "SUPERADMIN" || normalized === "SUPER_ADMIN";
  const isGuide = normalized === "FREELANCE_GUIDE" || normalized === "GUIDE";
  const reference = notification.referenceId;
  const messagesPath = isGuide ? "/guide/messages" : isAdmin ? "/admin/messages" : "/user/messages";
  switch (notification.type) {
    case "BOOKING": case "BOOKING_CONFIRMATION": case "BOOKING_CANCELLATION":
      return isAdmin ? "/admin/bookings" : reference ? `/booking/${reference}` : "/user/bookings";
    case "PAYMENT": return isAdmin ? "/admin/bookings" : "/user/bookings";
    case "VERIFICATION": case "VERIFICATION_APPROVED": case "VERIFICATION_REJECTED": case "VERIFICATION_RESUBMISSION_REQUIRED": case "REGISTRATION":
      return isGuide ? "/guide/verification-status" : isAdmin ? "/admin/verification-status" : "/user/profile";
    case "CHAT": case "NEW_MESSAGE": return reference && reference > 0 ? `${messagesPath}?conversationId=${reference}` : messagesPath;
    case "REVIEW": return isGuide ? "/guide/reviews" : isAdmin ? "/admin/reviews" : "/user/reviews";
    case "GROUP": case "GROUP_TRIP_UPDATE": return isAdmin ? "/admin/dashboard" : "/user/groups";
    case "TRIP_UPDATE": case "TRIP_REMINDER": return "/trips";
    default: return isGuide ? "/guide/notifications" : isAdmin ? "/admin/notifications" : "/user/notifications";
  }
};

export function formatNotificationTimestamp(value: string) { const date = new Date(value); const difference = Date.now() - date.getTime(); const minutes = Math.floor(difference / 60000); if (minutes < 1) return "Just now"; if (minutes < 60) return `${minutes}m ago`; const hours = Math.floor(minutes / 60); if (hours < 24) return `${hours}h ago`; return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date); }
