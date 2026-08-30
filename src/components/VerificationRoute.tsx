import { Navigate, Outlet } from "react-router";
import {
  APP_ROLES,
  normalizeRole,
  requiresVerificationReview,
} from "../auth/roles";
import { useAuth } from "../context/AuthContext";

export default function VerificationRoute() {
  const { userDTO } = useAuth();

  const role = normalizeRole(userDTO?.role);
  const requiresAccountApproval =
    role === APP_ROLES.ADMIN || role === APP_ROLES.FREELANCE_GUIDE;

  if (requiresAccountApproval && (userDTO?.emailVerified !== true || requiresVerificationReview(userDTO))) {
    return (
      <Navigate
        to={
          role === APP_ROLES.ADMIN
            ? "/pending-verification"
            : "/guide/verification-status"
        }
        replace
      />
    );
  }

  return <Outlet />;
}
