import api from "../api/axios";
import type { ApiResponse, PageResponse } from "../types/api";

export type PaymentStatistics = { unpaid: number; initiated: number; paid: number; failed: number; cancelled: number; refunded: number };
export type PlatformActivity = { id: number; userId: number; userEmail: string; type: string; title: string; message: string; referenceId?: number | null; read: boolean; createdAt: string };
export type SuperadminDashboardData = { totalUsers: number; totalAdmins: number; totalGuides: number; pendingVerifications: number; approvedAdmins: number; approvedGuides: number; totalCategories: number; totalDestinations: number; totalTrips: number; publishedTrips: number; totalBookings: number; overallTransactions: number; totalRevenue: number; paymentStatistics: PaymentStatistics; reviews: number; groups: number; recentActivities: PlatformActivity[] };
export type PlatformCommissionSetting = { commissionPercentage: number };
export type PlatformUser = { id: number; fullName: string; email: string; role: string; status: string; accountStatus?: string; verificationStatus?: string; emailVerified: boolean; createdAt: string };
export type ManagedUser = PlatformUser & { username?: string; phone?: string | null; profileImage?: string | null; roleVerified?: boolean; updatedAt?: string };
export type UserPayload = { fullName: string; email: string; phone?: string; profileImage?: string | null; password?: string; role: string; status: string };
export type VerificationItem = { userId: number; fullName: string; email: string; role: string; verificationStatus: string; createdAt: string };
export type VerificationDetail = VerificationItem & { phone?: string; accountStatus?: string; rejectionReason?: string | null; updatedAt?: string; documents?: VerificationDocument[] };
export type VerificationDocument = { id: number; documentType?: string; fileName?: string; status: string; rejectionReason?: string | null; uploadedAt?: string; reviewedAt?: string | null };
export type AuditLog = { id: number; actorId?: number | null; actorEmail?: string | null; action: string; entityType: string; entityId?: string | null; oldValue?: string | null; newValue?: string | null; timestamp: string; ipAddress?: string | null };

export type ResourceFilters = {
  keyword?: string;
  status?: string;
  role?: string;
  emailVerified?: boolean | "";
  paymentStatus?: string;
  method?: string;
  tripId?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};

const cleanParams = (filters: ResourceFilters = {}) =>
  Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value !== undefined && value !== null),
  );

export const superadminService = {
  dashboard() { return api.get<ApiResponse<SuperadminDashboardData>>("/api/superadmin/dashboard"); },
  platformCommission() { return api.get<ApiResponse<PlatformCommissionSetting>>("/api/superadmin/settings/platform-commission"); },
  updatePlatformCommission(commissionPercentage: number) { return api.patch<ApiResponse<PlatformCommissionSetting>>("/api/superadmin/settings/platform-commission", { commissionPercentage }); },
  users(kind: "users" | "admins" | "guides", filters: ResourceFilters = {}) { return api.get<ApiResponse<PageResponse<PlatformUser>>>(`/api/superadmin/${kind}`, { params: cleanParams({ page: 0, size: 20, ...filters }) }); },
  resource<T>(kind: "categories" | "destinations" | "trips" | "bookings" | "payments" | "reviews" | "groups", filters: ResourceFilters = {}) { return api.get<ApiResponse<PageResponse<T>>>(`/api/superadmin/${kind}`, { params: cleanParams({ page: 0, size: 20, ...filters }) }); },
  updateUserStatus(id: number, action: "activate" | "suspend" | "deactivate") { return api.patch<ApiResponse<PlatformUser>>(`/api/superadmin/users/${id}/${action}`); },
  managedUsers(filters: ResourceFilters = {}) { return api.get<ApiResponse<PageResponse<ManagedUser>>>("/api/users", { params: cleanParams({ page: 0, size: 20, sortBy: "createdAt", sortDir: "desc", ...filters }) }); },
  searchUsers(filters: ResourceFilters = {}) { return api.get<ApiResponse<PageResponse<ManagedUser>>>("/api/users/search", { params: cleanParams({ page: 0, size: 20, sortBy: "createdAt", sortDir: "desc", ...filters }) }); },
  managedUser(id: number) { return api.get<ApiResponse<ManagedUser>>(`/api/users/${id}`); },
  createManagedUser(payload: UserPayload) { return api.post<ApiResponse<ManagedUser>>("/api/users", payload); },
  updateManagedUser(id: number, payload: Omit<UserPayload, "password">) { return api.put<ApiResponse<ManagedUser>>(`/api/users/${id}`, payload); },
  deleteManagedUser(id: number) { return api.delete<ApiResponse<null>>(`/api/users/${id}`); },
  setRoleVerification(id: number, verified: boolean) { return api.patch<ApiResponse<ManagedUser>>(`/api/users/${id}/role-verification`, { verified }); },
  verifications(filters: { role?: string; status?: string; from?: string; to?: string; search?: string; page?: number; size?: number; sortBy?: string; sortDir?: "asc" | "desc" } = {}) { return api.get<ApiResponse<PageResponse<VerificationItem>>>("/api/superadmin/verifications", { params: cleanParams({ ...filters, page: filters.page ?? 0, size: filters.size ?? 20 }) }); },
  verification(userId: number) { return api.get<ApiResponse<VerificationDetail>>(`/api/superadmin/verifications/${userId}`); },
  approveVerification(userId: number) { return api.post<ApiResponse<VerificationDetail>>(`/api/superadmin/verifications/${userId}/approve`); },
  rejectVerification(userId: number, rejectionReason: string) { return api.post<ApiResponse<VerificationDetail>>(`/api/superadmin/verifications/${userId}/reject`, { rejectionReason }); },
  requestResubmission(userId: number, rejectionReason: string) { return api.post<ApiResponse<VerificationDetail>>(`/api/superadmin/verifications/${userId}/request-resubmission`, { rejectionReason }); },
  verificationDocuments(userId: number) { return api.get<ApiResponse<VerificationDocument[]>>(`/api/superadmin/verifications/${userId}/documents`); },
  downloadDocument(id: number) { return api.get<Blob>(`/api/superadmin/documents/${id}`, { responseType: "blob" }); },
  reviewDocument(id: number, status: "APPROVED" | "REJECTED", rejectionReason: string | null = null) { return api.patch<ApiResponse<VerificationDocument>>(`/api/superadmin/documents/${id}/review`, { status, rejectionReason }); },
  auditLogs(filters: { actor?: string; action?: string; entity?: string; from?: string; to?: string; page?: number; size?: number; sortBy?: string; sortDir?: "asc" | "desc" } = {}) { return api.get<ApiResponse<PageResponse<AuditLog>>>("/api/superadmin/audit-logs", { params: cleanParams({ ...filters, page: filters.page ?? 0, size: filters.size ?? 20 }) }); },
};
