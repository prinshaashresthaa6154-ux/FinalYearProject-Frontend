import { Outlet, useLocation } from "react-router";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const UserLayout = () => {
  const { pathname } = useLocation();
  const isManagementDashboard =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/superadmin" ||
    pathname.startsWith("/superadmin/");

  return (
    <div>
      {!isManagementDashboard && <Navbar />}
      <div>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default UserLayout;
