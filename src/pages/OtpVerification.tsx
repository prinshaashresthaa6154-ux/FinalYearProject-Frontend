import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

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

  const email = location.state?.email;

  const [otp, setOtp] = useState("");

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/verify", {
        email,
        otp,
      });

      login(response.data.token, response.data.userDTO);

      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const handleResend = async () => {
    try {
      const response = await api.post("/auth/resend-otp", {
        email,
      });

      alert(response.data);
    } catch (error) {
      console.log(error);
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
          Enter the 6-digit code sent to your email
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
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none text-center text-lg font-semibold"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-800 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition cursor-pointer"
          >
            Verify Account
          </button>
          {/* Timer */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#707070] mb-4">
            <span>◷</span>

            <button onClick={handleResend}>Resend code in {countdown}s</button>
          </div>

          {/* Back */}
          <button
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
            ← Back to login
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpVerification;
