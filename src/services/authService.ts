import api, { API_BASE_URL } from "../api/axios";
import type { ApiResponse } from "../types/api";

export type AuthUser = {
  id: number;
  username?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImage?: string | null;
  email: string;
  role: string;
  emailVerified?: boolean;
  accountStatus?: string;
  verificationStatus?: string;
  approvalStatus?: string;
  roleVerified?: boolean;
  rejectionReason?: string;
  resubmissionAllowed?: boolean;
};

export type AuthToken = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
};

export type ProfileUpdate = {
  firstName: string;
  lastName: string;
  phone: string;
};

export const MAX_PROFILE_IMAGE_SIZE = 10 * 1024 * 1024;

const isSupportedProfileImage = (file: File) =>
  file.type === "image/jpeg" || file.type === "image/png";

export type PublicRegisterRequest = {
  fullName: string;
  email: string;
  password: string;
  role?: "USER" | "FREELANCE_GUIDE";
};

export type VerificationDocumentType =
  | "GOVERNMENT_ID"
  | "BUSINESS_REGISTRATION"
  | "LICENSE"
  | "CERTIFICATION"
  | "PAN_VAT"
  | "OWNER_IDENTITY"
  | "GUIDE_CERTIFICATION"
  | "GUIDE_LICENSE"
  | "OTHER";

export type AdminRegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  businessName: string;
  businessAddress: string;
  businessRegistrationNumber: string;
  businessDescription: string;
  documentTypes: VerificationDocumentType[];
  documentNumbers: string[];
};

export type GuideRegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  bio: string;
  experience: number;
  specializations: string[];
  destinationExpertise: number[];
  languages: string[];
  certifications: string[];
  documentTypes: VerificationDocumentType[];
  documentNumbers: string[];
};

export type RegistrationStatus = {
  registrationId: number;
  userId: number;
  verificationStatus: string;
  accountStatus: string;
  guideApprovalStatus?: string;
  message: string;
};

export type CurrentUserResponse = ApiResponse<AuthUser> | AuthUser;

export const getAuthUser = (response: CurrentUserResponse | null | undefined): AuthUser | null => {
  if (!response) return null;
  return "id" in response ? response : response.data;
};

export const GOOGLE_OAUTH_URL =
  import.meta.env.VITE_GOOGLE_OAUTH_URL ??
  `${API_BASE_URL}/oauth2/authorization/google`;

export const profileImageUrl = (value?: string | null) => {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:") || value.startsWith("blob:")) return value;
  return `${API_BASE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
};

const multipartRegistration = <T extends object>(
  registration: T,
  profileImage: File,
  documents: File[],
) => {
  const formData = new FormData();
  formData.append(
    "registration",
    new Blob([JSON.stringify(registration)], { type: "application/json" }),
  );
  formData.append("profileImage", profileImage);
  documents.forEach((document) => formData.append("documents", document));
  return formData;
};

const adminMultipartRegistration = (
  registration: AdminRegisterRequest,
  profileImage: File,
  documents: File[],
) => {
  const formData = new FormData();
  const { documentTypes, documentNumbers, ...fields } = registration;

  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  documentTypes.forEach((type) => formData.append("documentTypes", type));
  documentNumbers.forEach((number) => formData.append("documentNumbers", number));
  formData.append("profileImage", profileImage);
  documents.forEach((document) => formData.append("documents", document));

  return formData;
};

export const authService = {
  startGoogleOAuth() {
    window.location.assign(GOOGLE_OAUTH_URL);
  },

  register(payload: PublicRegisterRequest) {
    return api.post<ApiResponse<null>>("/api/auth/register", payload);
  },

  registerAdmin(
    payload: AdminRegisterRequest,
    profileImage: File,
    documents: File[],
  ) {
    return api.post<ApiResponse<RegistrationStatus>>(
      "/api/auth/admin/register",
      adminMultipartRegistration(payload, profileImage, documents),
    );
  },

  registerGuide(
    payload: GuideRegisterRequest,
    profileImage: File,
    documents: File[],
  ) {
    return api.post<ApiResponse<RegistrationStatus>>(
      "/api/auth/guides/register",
      multipartRegistration(payload, profileImage, documents),
    );
  },

  verifyOtp(email: string, otp: string) {
    return api.post<ApiResponse<AuthToken | null>>("/api/auth/verify", { email, otp });
  },

  resendOtp(email: string) {
    return api.post<ApiResponse<null>>("/api/auth/resend-otp", { email });
  },

  verifyEmailToken(token: string) {
    return api.get<ApiResponse<null>>("/api/auth/verify-email", {
      params: { token },
    });
  },

  login(email: string, password: string) {
    return api.post<ApiResponse<AuthToken>>("/api/auth/login", {
      email,
      password,
    });
  },

  refresh(refreshToken: string) {
    return api.post<ApiResponse<AuthToken>>("/api/auth/refresh", {
      refreshToken,
    });
  },

  logout(refreshToken: string) {
    return api.post<ApiResponse<null>>("/api/auth/logout", { refreshToken });
  },

  forgotPassword(email: string) {
    return api.post<ApiResponse<null>>("/api/auth/forgot-password", { email });
  },

  resetPassword(token: string, newPassword: string) {
    return api.post<ApiResponse<null>>(
      "/api/auth/reset-password",
      { newPassword },
      { params: { token } },
    );
  },

  changePassword(currentPassword: string, newPassword: string) {
    return api.post<ApiResponse<null>>("/api/auth/change-password", {
      currentPassword,
      newPassword,
    });
  },

  getOAuthProfile(token?: string) {
    return api.get<CurrentUserResponse>("/auth/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },

  getCurrentUser(token?: string) {
    return api.get<CurrentUserResponse>("/api/users/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },

  updateCurrentUser(profile: ProfileUpdate) {
    return api.put<ApiResponse<AuthUser>>("/api/users/me", profile);
  },

  uploadProfileImage(file: File) {
    if (!isSupportedProfileImage(file)) {
      throw new Error("Profile image must be a JPEG or PNG file.");
    }
    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      throw new Error("Profile image must be 10 MB or smaller.");
    }
    const formData = new FormData();
    formData.append("file", file);
    return api.post<ApiResponse<AuthUser>>("/api/users/me/profile-image", formData);
  },

  deleteProfileImage() {
    return api.delete<ApiResponse<AuthUser>>("/api/users/me/profile-image");
  },

  getLegacyProfile() {
    return api.get<ApiResponse<AuthUser>>("/api/users/profile");
  },

  updateLegacyProfile(fullName: string, phone: string, profileImage?: string) {
    return api.put<ApiResponse<AuthUser>>(
      "/api/users/profile",
      { fullName, phone, ...(profileImage ? { profileImage } : {}) },
    );
  },

  updateProfile(profile: ProfileUpdate, profileImage?: File) {
    return profileImage
      ? this.uploadProfileImage(profileImage)
      : this.updateCurrentUser(profile);
  },
};
