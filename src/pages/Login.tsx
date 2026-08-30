import React, { useState } from "react";
import { flushSync } from "react-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useAuth, type User } from "../context/AuthContext";
import {
  authService,
  getAuthUser,
  type AuthUser,
} from "../services/authService";
import {
  APP_ROLES,
  getRoleHome,
  normalizeRole,
  requiresVerificationReview,
} from "../auth/roles";
import { getApiError } from "../api/axios";
import { Button, Input } from "../components/ui";

type LoginForm = {
  email: string;
  password: string;
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, updateUser } = useAuth();

  const googleLogin = () => {
    setErrorMessage("");
    authService.startGoogleOAuth();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await authService.login(
        form.email.trim(),
        form.password,
      );
      if (!response.data.success) {
        throw new Error(response.data.message || "Unable to sign in.");
      }
      const session = response.data.data;
      if (!session) throw new Error("Login response did not include a session");
      const { accessToken, refreshToken, user } = session;
      const sessionUser: User = {
        ...user,
        username: user.username ?? user.fullName,
      };

      flushSync(() => {
        login(accessToken, sessionUser, refreshToken);
      });

      let currentUser: AuthUser = user;
      try {
        const currentUserResponse =
          await authService.getCurrentUser(accessToken);
        const latestUser = getAuthUser(currentUserResponse.data);
        currentUser = latestUser ? { ...user, ...latestUser } : user;
        updateUser({
          ...currentUser,
          username: currentUser.username ?? currentUser.fullName,
        });
      } catch (currentUserError) {
        void currentUserError;
      }

      const role = normalizeRole(currentUser.role);
      const requestedDestination = location.state?.from;
      const destination =
        role === APP_ROLES.FREELANCE_GUIDE &&
        (!currentUser.emailVerified || requiresVerificationReview(currentUser))
          ? "/guide/verification-status"
          : role === APP_ROLES.ADMIN && requiresVerificationReview(currentUser)
            ? "/pending-verification"
            : role === APP_ROLES.USER && requestedDestination
              ? requestedDestination
              : getRoleHome(currentUser.role);
      navigate(destination, { replace: true });
    } catch (error) {
      setErrorMessage(
        getApiError(error).message || "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f8f8]">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md mt-12 mb-8">
          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="mb-4 text-4xl font-bold text-black">
              Nepal Yatra
            </h1>

            <h2 className="mb-2 text-3xl font-bold text-black">
              Welcome Back
            </h2>

            <p className="text-lg text-black/60">
              Sign in to continue your journey
            </p>
            {location.state?.message && (
              <p role="status" className="mt-3 rounded-lg border border-[#1D78AF]/20 bg-[#1D78AF]/10 px-3 py-2 text-sm text-[#155D89]">
                {location.state.message}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-[2.7rem] z-10 text-black/45" />
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  required
                  className="pl-9"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-[2.7rem] z-10 text-black/45" />
                <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="pl-9 pr-12"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute bottom-3 right-3 text-black/50 hover:text-black"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
              </div>

              {errorMessage && (
                <p role="alert" className="rounded-lg border border-[#AF1D1D]/20 bg-[#AF1D1D]/10 px-3 py-2 text-sm text-[#AF1D1D]">
                  {errorMessage}
                </p>
              )}

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
                className="w-full"
              >
                Sign In
              </Button>

              {/* OR */}
              <div className="text-center text-gray-500 text-sm">Or</div>

              {/* Google Login */}
              <Button
                onClick={googleLogin}
                type="button"
                variant="secondary"
                className="w-full"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium">
                  Login with Google
                </span>
              </Button>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Signup */}
              <p className="text-center text-sm text-black/60">
                Don&apos;t have an account?{" "}
                <NavLink
                  to="/register"
                  className="font-semibold text-[#1D78AF] hover:underline"
                >
                  Sign Up
                </NavLink>
              </p>
              <p className="text-center text-sm">
                <NavLink
                  to="/forgot-password"
                  className="font-semibold text-[#1D78AF] hover:underline"
                >
                  Forgot your password?
                </NavLink>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-gray-500 text-sm">Footer</footer>
    </div>
  );
};

export default Login;
