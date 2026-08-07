import axios from "axios";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useState, type FormEvent } from "react";
import { NavLink, useSearchParams } from "react-router";
import api from "../api/axios";

type ResetPasswordResponse = {
  success: boolean;
  message: string;
  data: null;
};

type ErrorResponse = {
  message?: string;
};

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!token) {
      setErrorMessage("This password reset link is invalid or incomplete.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post<ResetPasswordResponse>(
        "/api/auth/reset-password",
        { token, newPassword },
      );

      setMessage(response.data.message || "Password reset successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const apiMessage = axios.isAxiosError<ErrorResponse>(error)
        ? error.response?.data?.message
        : undefined;

      setErrorMessage(
        apiMessage || "Unable to reset your password. The link may have expired.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f5f4]">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md mt-12 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#2d1f1f] font-serif mb-4">
              Nepal Yatra
            </h1>
            <h2 className="text-3xl font-bold text-[#2d1f1f] mb-2 font-serif">
              Reset Password
            </h2>
            <p className="text-[#7c6f66] text-lg">
              Choose a new password for your account
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            {!token ? (
              <div className="space-y-5 text-center">
                <p role="alert" className="text-sm text-red-700">
                  This password reset link is invalid or incomplete.
                </p>
                <NavLink
                  to="/forgot-password"
                  className="inline-flex text-sm text-red-700 font-medium hover:underline"
                >
                  Request a new reset link
                </NavLink>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="new-password"
                    className="flex items-center gap-2 text-sm font-medium text-[#2d1f1f] mb-2"
                  >
                    <Lock size={16} />
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      className="w-full h-11 px-4 pr-12 rounded-md border border-gray-300 bg-[#faf9f8] focus:outline-none focus:ring-2 focus:ring-red-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? "Hide passwords" : "Show passwords"}
                      className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="flex items-center gap-2 text-sm font-medium text-[#2d1f1f] mb-2"
                  >
                    <Lock size={16} />
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="w-full h-11 px-4 rounded-md border border-gray-300 bg-[#faf9f8] focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                </div>

                {message && (
                  <p role="status" className="text-sm text-green-700">
                    {message}
                  </p>
                )}
                {errorMessage && (
                  <p role="alert" className="text-sm text-red-700">
                    {errorMessage}
                  </p>
                )}

                {!message && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 bg-red-700 hover:bg-red-800 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-md font-medium transition duration-300"
                  >
                    {isSubmitting ? "Resetting..." : "Reset Password"}
                  </button>
                )}

                <NavLink
                  to="/login"
                  className="flex justify-center text-sm text-red-700 font-medium hover:underline"
                >
                  {message ? "Continue to Login" : "Back to Login"}
                </NavLink>
              </form>
            )}
          </div>
        </div>
      </div>

      <footer className="p-4 text-gray-500 text-sm">Footer</footer>
    </div>
  );
};

export default ResetPassword;
