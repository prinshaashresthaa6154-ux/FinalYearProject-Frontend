import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { getApiError } from "../api/axios";
import { LoadingSpinner } from "../components/ui";
import { authService } from "../services/authService";

export default function EmailVerification() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [message, setMessage] = useState("");
  const [verified, setVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    authService
      .verifyEmailToken(token)
      .then((response) => {
        if (!cancelled) {
          setVerified(response.data.success);
          setMessage(
            response.data.message ||
              (response.data.success
                ? "Email verified successfully."
                : "Email verification failed."),
          );
        }
      })
      .catch((error) => {
        if (!cancelled) setMessage(getApiError(error).message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f1e9] p-4">
      <section className="w-full max-w-md rounded-xl border border-[#e4dbd1] bg-white p-7 text-center shadow-sm">
        <h1 className="font-display text-3xl font-bold text-[#241f1a]">
          Email verification
        </h1>
        <div className="mt-5">
          {isLoading ? (
            <LoadingSpinner label="Verifying your email..." />
          ) : (
            <p
              role={verified ? "status" : "alert"}
              className="text-sm text-[#6e6258]"
            >
              {message || "This verification link is invalid or incomplete."}
            </p>
          )}
        </div>
        <Link
          to="/login"
          className="mt-6 inline-flex text-sm font-bold text-[#a62922] hover:underline"
        >
          {verified ? "Continue to sign in" : "Return to sign in"}
        </Link>
      </section>
    </main>
  );
}
