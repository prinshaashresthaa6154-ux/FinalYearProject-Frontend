import {
  ArrowLeft,
  Bell,
  LayoutDashboard,
  Users,
  Compass,
  Map,
  CalendarCheck,
  UsersRound,
  Star,
  Megaphone,
  FileBarChart,
  User,
  Briefcase,
} from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 1, name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { id: 2, name: "Users", icon: Users, path: "/admin/users" },
    { id: 3, name: "Guides", icon: Briefcase, path: "/admin/guides" },
    { id: 4, name: "Destinations", icon: Compass, path: "/admin/destinations" },
    { id: 5, name: "Trips", icon: Map, path: "/admin/trips" },
    { id: 6, name: "Bookings", icon: CalendarCheck, path: "/admin/bookings" },
    {
      id: 7,
      name: "Group Trips",
      icon: UsersRound,
      path: "/admin/group-trips",
    },
    { id: 8, name: "Reviews", icon: Star, path: "/admin/reviews" },
    {
      id: 9,
      name: "Notifications",
      icon: Megaphone,
      path: "/admin/notifications",
    },
    { id: 10, name: "Reports", icon: FileBarChart, path: "/admin/reports" },
    { id: 11, name: "Profile", icon: User, path: "/admin/profile" },
  ];

  const activeTab =
    tabs.find((tab) =>
      tab.path === "/admin"
        ? location.pathname === "/admin"
        : location.pathname.startsWith(tab.path),
    )?.name ?? "Dashboard";

  return (
    <div className="min-h-screen bg-[#fdfbf9] text-[#2c2520] font-sans antialiased">
      <header className="bg-[#1e1611] text-[#f5efe9] py-4 shadow-md">
        <div className="max-w-7xl w-full mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold tracking-wide flex items-center gap-2 font-serif">
                <span className="w-2.5 h-2.5 rounded-full bg-[#b31919] inline-block" />
                Admin Panel
              </h1>
              <p className="text-xs text-gray-400">
                Tourism Platform Management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/admin/notifications")}
              className="relative text-gray-300 hover:text-white p-1"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#b31919] rounded-full" />
            </button>
            <div className="bg-[#2d221a] px-4 py-1.5 rounded-full text-xs font-medium text-orange-300 border border-orange-900/50">
              Admin
            </div>
          </div>
        </div>
      </header>

      <main className="py-8 max-w-7xl mx-auto px-4 space-y-8">
        <div className="overflow-x-auto scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
          <nav className="flex space-x-2 md:space-x-3 items-center whitespace-nowrap min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.name;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => navigate(tab.path)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-[14px] font-medium transition-all duration-200 rounded-xl ${
                    isActive
                      ? "bg-[#b31919] text-white shadow-sm"
                      : "text-[#6e5e54] hover:text-[#b31919] hover:bg-[#efece9]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
