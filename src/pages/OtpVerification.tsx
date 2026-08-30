import { useState, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { authService } from "../services/authService";
import { getApiError } from "../api/axios";
import { useAuth } from "../context/AuthContext";

const OtpVerification = () => {
  const [countdown, setCountdown] = useState<number>(42);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const email = location.state?.email as string | undefined;
  const initialMessage = location.state?.message as string | undefined;
  const role = location.state?.role as string | undefined;
  const verificationStatus = location.state?.verificationStatus as
    string | undefined;
  const isGuide = role === "FREELANCE_GUIDE";
  const isAdmin = role === "ADMIN";

  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState(initialMessage || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!email) {
    return <Navigate to="/login" replace />;
  }

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setErrorMessage("Enter the exact six-digit verification code.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authService.verifyOtp(email, otp);
      if (!response.data.success) {
        throw new Error(response.data.message || "Email verification failed.");
      }
      const session = response.data.data;
      if (isAdmin && session) {
        login(session.accessToken, session.user, session.refreshToken);
      }

      navigate(
        isGuide
          ? "/guide/verification-status"
          : isAdmin
            ? "/pending-verification"
            : "/login",
        {
          replace: true,
          state: isGuide
            ? {
                emailVerified: true,
                status: verificationStatus || "PENDING",
                message:
                  "Email verified successfully. Your guide application is awaiting admin approval.",
              }
            : isAdmin
              ? {
                  emailVerified: true,
                  status: verificationStatus || "PENDING",
                  email,
                  message:
                    "Email verified successfully. Your admin application is awaiting review.",
                }
              : {
                  message: "Email verified successfully. You can now sign in.",
                },
        },
      );
    } catch (error) {
      setErrorMessage(getApiError(error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setErrorMessage("");
    setStatusMessage("");

    try {
      const response = await authService.resendOtp(email);
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Unable to resend the verification code.",
        );
      }

      setCountdown(60);
      setStatusMessage(response.data.message || "OTP resent successfully.");
    } catch (error) {
      setErrorMessage(getApiError(error).message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F5] font-sans antialiased">
      <div className="w-full max-w-[480px] px-6 text-center">
        {/* Logo Section */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xl font-bold text-[#1F1F1F]">Nepal Yatra</span>
        </div>

        {/* Shield Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 rounded-full bg-[#FBEBEB] flex items-center justify-center text-[#D97475]"></div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-[#1F1F1F] mb-1">
          Verify Your Account
        </h2>

        <p className="text-sm text-[#707070] mb-8">
          Enter the 6-digit code sent to {email}
        </p>

        {/* Card */}
        <form
          onSubmit={handleVerify}
          className="flex flex-col gap-6 bg-white rounded-xl border border-[#EBEBEB] p-8 shadow-sm"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Verification Code
            </label>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              required
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none text-center text-lg font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-800 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg hover:opacity-90 transition cursor-pointer"
          >
            {isSubmitting ? "Verifying..." : "Verify Account"}
          </button>
          {errorMessage && (
            <p role="alert" className="text-sm text-red-700">
              {errorMessage}
            </p>
          )}
          {statusMessage && (
            <p
              role="status"
              className="rounded-md bg-amber-50 px-3 py-2 text-sm leading-5 text-amber-900"
            >
              {statusMessage}
            </p>
          )}
          {/* Timer */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#707070] mb-4">
            <span>◷</span>

            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0}
              className="disabled:cursor-not-allowed"
            >
              {countdown > 0
                ? `Resend code in ${countdown}s`
                : "Send a new code"}
            </button>
          </div>

          {/* Back */}
          <button
            type="button"
            onClick={() =>
              navigate(
                isGuide
                  ? "/guide/verification-status"
                  : isAdmin
                    ? "/pending-verification"
                    : "/login",
                {
                  replace: true,
                  state:
                    isGuide || isAdmin
                      ? { status: verificationStatus || "PENDING", email }
                      : undefined,
                },
              )
            }
            className="
              inline-flex 
              items-center 
              gap-1 
              text-xs 
              font-medium 
              text-[#707070] 
              hover:text-[#1F1F1F]
            "
          >
            {isGuide || isAdmin
              ? "Back to application status"
              : "Back to login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpVerification;
