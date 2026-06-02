import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

type LoginForm = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
};

const Login = () => {

  const navigate = useNavigate();
  const [form, setform] = useState<LoginForm>({
   email:"",
   password:"",
  })
  const {login} = useAuth();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    setform({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();

    try {

      const response =
        await api.post<LoginResponse>(
          "/auth/login",
          form
        );

      login(response.data.token);

      navigate("/homepage");

    } catch (error) {

      console.error(error);

      alert("Invalid credentials");
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f5f4]">
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md mt-12 mb-8">

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#2d1f1f] font-serif mb-4">
              Nepal Yatra
            </h1>

            <h2 className="text-3xl font-bold text-[#2d1f1f] mb-2 font-serif">
              Welcome Back
            </h2>

            <p className="text-[#7c6f66] text-lg">
              Sign in to continue your journey
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#2d1f1f] mb-2">
                  <Mail size={16} />
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  required
                  className="w-full h-11 px-4 rounded-md border border-gray-300 bg-[#faf9f8] focus:outline-none focus:ring-2 focus:ring-red-700"
                />
              </div>

              {/* Password */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#2d1f1f] mb-2">
                  <Lock size={16} />
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full h-11 px-4 rounded-md border border-gray-300 bg-[#faf9f8] focus:outline-none focus:ring-2 focus:ring-red-700"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full h-11 bg-red-700 hover:bg-red-800 text-white rounded-md font-medium transition duration-300"
              >
                Sign In
              </button>

              {/* OR */}
              <div className="text-center text-gray-500 text-sm">
                Or
              </div>

              {/* Google Login */}
              <button
                type="button"
                className="w-full h-11 border border-gray-300 rounded-md flex items-center justify-center gap-3 hover:bg-gray-50 transition"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium text-[#2d1f1f]">
                  Login with Google
                </span>
              </button>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Signup */}
              <p className="text-center text-sm text-[#7c6f66]">
                Don&apos;t have an account?{" "}
                <span className="text-red-700 font-medium cursor-pointer hover:underline">
                  Sign Up
                </span>
              </p>

            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-gray-500 text-sm">
        Footer
      </footer>
    </div>
  );
};

export default Login;