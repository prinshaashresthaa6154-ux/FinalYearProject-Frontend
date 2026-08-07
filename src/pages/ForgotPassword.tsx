import axios from "axios";
import { ArrowLeft, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { NavLink } from "react-router";
import api from "../api/axios";

type ForgotPasswordResponse = {
  success: boolean;
  message: string;
  data: null;
};

type ErrorResponse = {
  message?: string;
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await api.post<ForgotPasswordResponse>(
        "/api/auth/forgot-password",
        { email: email.trim() },
      );

      setMessage(
        response.data.message ||
          "If the email exists, password reset instructions have been sent",
      );
    } catch (error) {
      const apiMessage = axios.isAxiosError<ErrorResponse>(error)
        ? error.response?.data?.message
        : undefined;

      setErrorMessage(
        apiMessage || "Unable to send reset instructions. Please try again.",
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
              Forgot Password
            </h2>
            <p className="text-[#7c6f66] text-lg">
              Enter your email to receive reset instructions
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="forgot-password-email"
                  className="flex items-center gap-2 text-sm font-medium text-[#2d1f1f] mb-2"
                >
                  <Mail size={16} />
                  Email
                </label>
                <input
                  id="forgot-password-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="email@example.com"
                  autoComplete="email"
                  required
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-red-700 hover:bg-red-800 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-md font-medium transition duration-300"
              >
                {isSubmitting ? "Sending..." : "Send Reset Instructions"}
              </button>

              <NavLink
                to="/login"
                className="flex items-center justify-center gap-2 text-sm text-red-700 font-medium hover:underline"
              >
                <ArrowLeft size={16} />
                Back to Login
              </NavLink>
            </form>
          </div>
        </div>
      </div>

      <footer className="p-4 text-gray-500 text-sm">Footer</footer>
    </div>
  );
};

export default ForgotPassword;
