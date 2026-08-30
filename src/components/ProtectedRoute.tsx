import { Navigate, Outlet, useLocation } from "react-router";
import LoadingSpinner from "./ui/LoadingSpinner";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, isAuthLoading, userDTO } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f1e9] p-6">
        <LoadingSpinner label="Loading your account" />
      </main>
    );
  }

  if (!isAuthenticated || !userDTO) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
