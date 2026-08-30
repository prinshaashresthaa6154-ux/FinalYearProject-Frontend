import {
  ArrowLeft,
  Bell,
  Settings,
  LayoutDashboard,
  Map,
  Users,
  Wallet,
  MessageSquare,
  Star,
  User,
  CalendarClock,
  FileUser,
  LogOut,
  Search,
} from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useState } from "react";
import { useGuideAvatar } from "./GuideAvatarContext";
import NotificationBell from "../../components/NotificationBell";
import { useAuth } from "../../context/AuthContext";
import { profileImageUrl } from "../../services/authService";

function GuideDashboardShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { avatarUrl } = useGuideAvatar();
  const { userDTO, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const guideName =
    [userDTO?.firstName, userDTO?.lastName].filter(Boolean).join(" ") ||
    userDTO?.fullName ||
    userDTO?.username ||
    "Guide";
  const guideAvatar = profileImageUrl(userDTO?.profileImage) || avatarUrl;

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const tabs = [
    { id: 1, name: "Overview", icon: LayoutDashboard, path: "/guidedashboard" },
    { id: 2, name: "My Trips", icon: Map, path: "/guidedashboard/trips" },
    {
      id: 3,
      name: "Group Requests",
      icon: Users,
      path: "/guidedashboard/requests",
    },
    { id: 5, name: "Earnings", icon: Wallet, path: "/guidedashboard/earnings" },
    {
      id: 6,
      name: "Messages",
      icon: MessageSquare,
      path: "/guide/messages",
    },
    { id: 7, name: "Reviews", icon: Star, path: "/guide/reviews" },
    {
      id: 8,
      name: "Notifications",
      icon: Bell,
      path: "/guidedashboard/notifications",
    },
    { id: 9, name: "Profile", icon: User, path: "/guide/profile" },
    { id: 10, name: "Availability", icon: CalendarClock, path: "/guide/availability" },
    { id: 11, name: "Legacy Profile", icon: FileUser, path: "/guidedashboard/legacy-profile" },
  ];

  const activeTab =
    tabs.find((tab) =>
      tab.path === "/guidedashboard"
        ? location.pathname === "/guidedashboard"
        : location.pathname.startsWith(tab.path),
    )?.name ?? "Overview";

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2933] antialiased">
      <header className="border-b border-[#e4e8ec] bg-white py-4">
        <div className="max-w-7xl w-full mx-auto px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-[#2c2520] transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1e1611] text-[#f5efe9] flex items-center justify-center text-sm font-semibold shrink-0">
              {guideAvatar ? (
                <img
                  src={guideAvatar}
                  alt="Guide avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                guideName
                  .split(/\s+/)
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-base font-semibold text-[#1a130e] tracking-tight font-serif">
                 {guideName}
              </h1>
              <p className="text-xs text-gray-400">Freelance Guide Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search trips, clients..."
                className="w-full bg-white border border-[#dcd3cc] rounded-lg pl-3 pr-10 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#b31919] transition"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <NotificationBell />
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-[#AF1D1D] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">
                {loggingOut ? "Logging out..." : "Logout"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/guide/profile")}
              className="text-gray-500 hover:text-[#2c2520] p-1.5 transition"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="py-6 max-w-7xl mx-auto px-4 space-y-8">
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
                       ? "bg-[#AF1D1D] text-white shadow-sm"
                       : "text-[#66717c] hover:text-[#AF1D1D] hover:bg-white"
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

export default function GuideDashboard() {
  return <GuideDashboardShell />;
}
