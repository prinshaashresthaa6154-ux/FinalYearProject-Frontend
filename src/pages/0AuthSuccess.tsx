import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { getApiError } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  authService,
  getAuthUser,
} from "../services/authService";
import {
  APP_ROLES,
  getRoleHome,
  normalizeRole,
  requiresVerificationReview,
} from "../auth/roles";

const readOAuthParameter = (
  fragment: URLSearchParams,
  query: URLSearchParams,
  ...names: string[]
) => {
  for (const name of names) {
    const value = fragment.get(name) ?? query.get(name);
    if (value) return value;
  }

  return null;
};

function OAuthSuccess() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [message, setMessage] = useState("Completing secure sign-in...");
  const hasHandledOAuth = useRef(false);

  useEffect(() => {
    // Updating the auth context changes the login function identity and can
    // rerun this effect after the token has been removed from the URL.
    if (hasHandledOAuth.current) return;
    hasHandledOAuth.current = true;

    const handleOAuth = async () => {
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const query = new URLSearchParams(window.location.search);
      const token = readOAuthParameter(
        fragment,
        query,
        "token",
        "accessToken",
        "access_token",
      );
      const refreshToken = readOAuthParameter(
        fragment,
        query,
        "refreshToken",
        "refresh_token",
      );
      const oauthError = readOAuthParameter(
        fragment,
        query,
        "error_description",
        "message",
        "error",
      );

      if (oauthError) {
        setMessage(oauthError);
        navigate("/login", {
          replace: true,
          state: { message: oauthError },
        });
        return;
      }

      if (!token) {
        const missingTokenMessage =
          "Google sign-in did not return an access token. Please try again.";
        setMessage(missingTokenMessage);
        navigate("/login", {
          replace: true,
          state: { message: missingTokenMessage },
        });
        return;
      }

      try {
        window.history.replaceState(null, "", window.location.pathname);
        const currentUserResponse = await authService.getOAuthProfile(token);
        const currentUser = getAuthUser(currentUserResponse.data);
        if (!currentUser || !currentUser.id) {
          throw new Error("OAuth profile response was empty");
        }

        login(token, currentUser, refreshToken ?? undefined);
        const destination =
          normalizeRole(currentUser.role) === APP_ROLES.ADMIN &&
          requiresVerificationReview(currentUser)
            ? "/admin/verification-status"
            : getRoleHome(currentUser.role);
        navigate(destination, { replace: true });
      } catch (error) {
        const apiError = getApiError(error);
        const errorMessage =
          apiError.kind === "unauthorized"
            ? "Google sign-in expired before it could be completed. Please try again."
            : apiError.message || "Google sign-in could not be completed.";
        setMessage(errorMessage);
        navigate("/login", {
          replace: true,
          state: { message: errorMessage },
        });
      }
    };

    handleOAuth();
  }, [login, navigate]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f1e9] p-6">
      <p role="status" className="text-sm font-semibold text-[#40382f]">
        {message}
      </p>
    </main>
  );
}

export default OAuthSuccess;
