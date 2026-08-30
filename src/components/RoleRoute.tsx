import { Navigate, Outlet } from "react-router";
import { getRoleHome, normalizeRole, type AppRole } from "../auth/roles";
import { useAuth } from "../context/AuthContext";

type RoleRouteProps = {
  allowedRoles: readonly AppRole[];
};

export default function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { userDTO } = useAuth();
  const role = normalizeRole(userDTO?.role);

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={getRoleHome(userDTO?.role)} replace />;
  }

  return <Outlet />;
}
