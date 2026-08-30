import { Navigate, Outlet, useLocation } from "react-router";
import { canCreateBooking } from "../auth/roles";
import { useAuth } from "../context/AuthContext";

export default function BookingAccessRoute() {
  const { userDTO } = useAuth();
  const location = useLocation();

  if (canCreateBooking(userDTO)) return <Outlet />;

  if (userDTO?.emailVerified !== true) {
    return (
      <Navigate
        to="/verify-account"
        replace
        state={{
          email: userDTO?.email,
          role: userDTO?.role,
          from: location,
          message: "Verify your email before creating a booking.",
        }}
      />
    );
  }

  return (
    <Navigate
      to="/user/dashboard"
      replace
      state={{
        message: "Your account must be active before creating a booking.",
      }}
    />
  );
}
