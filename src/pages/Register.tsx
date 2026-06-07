import React, { useState } from "react";
import {User,Mail,Lock,Eye,ChevronDown,} from "lucide-react";
import { useNavigate } from "react-router";
import api from "../api/axios";



type RegisterForm = {
  username: string;
  email: string;
  password: string;
  role: string;
};

export default function Register() {
  const navigate = useNavigate();
  const[form, setForm] = useState<RegisterForm>({
    username:"",
    email:"",
    password:"",
    role: ""
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {

    setForm({
      ...form,
      role : e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();

    try {

      await api.post(
        "/auth/register",
        form
      );

      alert("Registration successful");

      navigate("/login");

    } catch (error) {

      console.error(error);

      alert("Registration failed");
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

          <p className="text-gray-500">
            Join Nepal Yatra and start exploring
          </p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-8">

          {/* Full Name */}
          <div className="mb-5">
            <label className="flex items-center gap-2 text-sm mb-2 font-medium text-gray-700">
              <User size={16} />
              Full Name
            </label>

            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter your full name"
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
                type="password"
                placeholder="********"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-red-300"
              />

              <Eye
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
              />
            </div>
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
              className="w-full border border-gray-200 rounded-lg px-4 py-3 appearance-none outline-none focus:ring-1 focus:ring-red-300">
                <option value = "USER">User</option>
                <option value = "Guide">Guide</option>
              </select>

              <ChevronDown
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* Button */}
          <button type="submit" className="w-full bg-red-700 hover:bg-red-800 text-white py-3 rounded-lg font-medium transition">
            Create Account
          </button>

          {/* Divider */}
          <div className="text-center my-5 text-gray-400">
            Or
          </div>

          {/* Google */}
          <button className="w-full border border-gray-200 rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-gray-50 transition">
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
            <span className="text-red-700 font-medium cursor-pointer">
              Sign In
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}