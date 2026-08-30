export const APP_ROLES = {
  SUPERADMIN: "SUPERADMIN",
  ADMIN: "ADMIN",
  USER: "USER",
  FREELANCE_GUIDE: "FREELANCE_GUIDE",
} as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];

export type ApprovalState = "APPROVED" | "PENDING" | "REJECTED" | "UNKNOWN";

export type ApprovableUser = {
  accountStatus?: string | null;
  verificationStatus?: string | null;
  approvalStatus?: string | null;
  guideApprovalStatus?: string | null;
  roleVerified?: boolean | null;
};

export type BookingUser = ApprovableUser & {
  role?: string | null;
  emailVerified?: boolean | null;
};

const ROLE_ALIASES: Record<string, AppRole> = {
  SUPER_ADMIN: APP_ROLES.SUPERADMIN,
  SUPERADMIN: APP_ROLES.SUPERADMIN,
  ADMIN: APP_ROLES.ADMIN,
  USER: APP_ROLES.USER,
  TOURIST: APP_ROLES.USER,
  GUIDE: APP_ROLES.FREELANCE_GUIDE,
  FREELANCE_GUIDE: APP_ROLES.FREELANCE_GUIDE,
  FREELANCER_GUIDE: APP_ROLES.FREELANCE_GUIDE,
};

export function normalizeRole(role?: string | null): AppRole | null {
  if (!role) return null;

  const key = role
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  return ROLE_ALIASES[key] ?? null;
}

export function getRoleHome(role?: string | null): string {
  switch (normalizeRole(role)) {
    case APP_ROLES.SUPERADMIN:
      return "/superadmin/dashboard";
    case APP_ROLES.ADMIN:
      return "/admin/dashboard";
    case APP_ROLES.FREELANCE_GUIDE:
      return "/guide/dashboard";
    case APP_ROLES.USER:
      return "/user/dashboard";
    default:
      return "/";
  }
}

const normalizeStatus = (status?: string | null) =>
  status
    ?.trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_") ?? "";

export function getApprovalState(user?: ApprovableUser | null): ApprovalState {
  if (!user) return "UNKNOWN";
  if (user.roleVerified === true) return "APPROVED";

  const verificationStatus = normalizeStatus(
    user.verificationStatus ?? user.guideApprovalStatus ?? user.approvalStatus,
  );
  if (["APPROVED", "VERIFIED"].includes(verificationStatus)) {
    return "APPROVED";
  }
  if (["REJECTED", "RESUBMISSION_REQUIRED"].includes(verificationStatus)) {
    return "REJECTED";
  }
  if (["PENDING", "UNDER_REVIEW", "IN_REVIEW"].includes(verificationStatus)) {
    return "PENDING";
  }

  const accountStatus = normalizeStatus(user.accountStatus);
  if (["ACTIVE", "APPROVED", "VERIFIED"].includes(accountStatus)) {
    return "APPROVED";
  }
  if (
    ["PENDING", "PENDING_VERIFICATION", "UNDER_REVIEW"].includes(accountStatus)
  ) {
    return "PENDING";
  }
  if (["REJECTED", "RESUBMISSION_REQUIRED"].includes(accountStatus)) {
    return "REJECTED";
  }

  return "UNKNOWN";
}

export function hasApprovedAccount(user?: ApprovableUser | null): boolean {
  return getApprovalState(user) === "APPROVED";
}

export function requiresVerificationReview(
  user?: ApprovableUser | null,
): boolean {
  const state = getApprovalState(user);
  return state === "PENDING" || state === "REJECTED";
}

export function canCreateBooking(user?: BookingUser | null): boolean {
  return (
    normalizeRole(user?.role) === APP_ROLES.USER &&
    user?.emailVerified === true &&
    normalizeStatus(user.accountStatus) === "ACTIVE"
  );
}
