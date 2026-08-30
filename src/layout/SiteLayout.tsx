import { Outlet } from "react-router";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function SiteLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}
