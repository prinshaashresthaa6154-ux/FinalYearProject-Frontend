import React, { useState } from "react";
import axios from "axios";
import { User, Mail, Lock, Eye, EyeOff, ChevronDown } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import api from "../api/axios";

type RegisterRole = "USER" | "GUIDE";

type RegisterForm = {
  fullName: string;
  email: string;
  password: string;
  role: RegisterRole | "";
};

type ValidationErrorResponse = {
  message?: string;
  data?: Record<string, string> | string[];
};

type RegisterResponse = {
  success: boolean;
  message: string;
  data: null;
  timestamp: string;
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({
    fullName: "",
    email: "",
    password: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({
      ...form,
      role: e.target.value as RegisterForm["role"],
    });
  };

  const googleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const payload = {
      fullName,
      email,
      password: form.password,
      role: form.role,
    };

    try {
      const response = await api.post<RegisterResponse>(
        "/api/auth/register",
        payload,
      );

      if (response.status !== 201 || !response.data.success) {
        setErrorMessage(response.data.message || "Registration failed");
        return;
      }

      navigate("/otp", {
        state: {
          email,
          message: response.data.message,
        },
      });
    } catch (error) {
      const errorData = axios.isAxiosError<ValidationErrorResponse>(error)
        ? error.response?.data
        : undefined;
      const validationErrors = errorData?.data
        ? Object.values(errorData.data).join(" ")
        : undefined;
      const message = validationErrors || errorData?.message;

      setErrorMessage(message || "Unable to register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5f5] flex items-center justify-center px-4">
      <div className="w-full max-w-lg mt-12 mb-12">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#2d1f1f] mb-3">
            Nepal Yatra
          </h1>

          <h2 className="text-3xl font-semibold text-[#2d1f1f] mb-2">
            Create Account
          </h2>

          <p className="text-gray-500">Join Nepal Yatra and start exploring</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-8"
        >
          {/* Full Name */}
          <div className="mb-5">
            <label className="flex items-center gap-2 text-sm mb-2 font-medium text-gray-700">
              <User size={16} />
              Full Name
            </label>

            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={150}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-red-300"
            />
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="flex items-center gap-2 text-sm mb-2 font-medium text-gray-700">
              <Mail size={16} />
              Email
            </label>

            <input
              type="email"
              placeholder="email@example.com"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-red-300"
            />
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="flex items-center gap-2 text-sm mb-2 font-medium text-gray-700">
              <Lock size={16} />
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="********"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={72}
                pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+"
                title="Use 8-72 characters with uppercase, lowercase, a number, and a special character."
                className="w-full border border-gray-200 rounded-lg px-4 py-3 pr-12 outline-none focus:ring-1 focus:ring-red-300"
              />

              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Use 8-72 characters with uppercase, lowercase, a number, and a
              special character.
            </p>
          </div>

          {/* Role */}
          <div className="mb-6">
            <label className="text-sm font-medium block mb-2 text-gray-700">
              Role
            </label>

            <div className="relative">
              <select
                name="role"
                value={form.role}
                onChange={handleSelectChange}
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 appearance-none outline-none focus:ring-1 focus:ring-red-300"
              >
                <option value="">Select Role</option>
                <option value="USER">User</option>
                <option value="GUIDE">Guide</option>
              </select>

              <ChevronDown
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {errorMessage && (
            <p role="alert" className="mb-4 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-700 hover:bg-red-800 disabled:bg-red-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>

          {/* Divider */}
          <div className="text-center my-5 text-gray-400">Or</div>

          {/* Google */}
          <button
            type="button"
            onClick={googleLogin}
            className="w-full border border-gray-200 rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-gray-50 transition"
          >
            Continue with
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="google"
              className="w-5 h-5"
            />
          </button>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <NavLink to="/login">
              <span className="text-red-700 font-medium cursor-pointer">
                Sign In
              </span>
            </NavLink>
          </p>
        </form>
      </div>
    </div>
  );
}
