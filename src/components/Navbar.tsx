import { useEffect, useState, type ComponentType } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  Activity,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarCheck,
  Compass,
  FileBarChart,
  Home,
  LayoutDashboard,
  Map,
  Menu,
  MessageSquare,
  Settings,
  ShieldCheck,
  Star,
  User,
  UserRound,
  Users,
  UsersRound,
  Wallet,
  X,
} from "lucide-react";

type NavItem = {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  end?: boolean;
};

const publicItems: NavItem[] = [
  { label: "Home", path: "/", icon: Home, end: true },
  { label: "Destinations", path: "/destinations", icon: Compass },
  { label: "Group Trips", path: "/grouptrips", icon: UsersRound },
  { label: "Find a Guide", path: "/guide", icon: BriefcaseBusiness },
];

const roleItems: Record<string, NavItem[]> = {
  user: publicItems,
  guide: [
    { label: "Overview", path: "/guidedashboard", icon: LayoutDashboard, end: true },
    { label: "My Trips", path: "/guidedashboard/trips", icon: Map },
    { label: "Requests", path: "/guidedashboard/requests", icon: Users },
    { label: "Clients", path: "/guidedashboard/clients", icon: UserRound },
    { label: "Earnings", path: "/guidedashboard/earnings", icon: Wallet },
    { label: "Messages", path: "/guidedashboard/messages", icon: MessageSquare },
    { label: "Reviews", path: "/guidedashboard/reviews", icon: Star },
    { label: "Notifications", path: "/guidedashboard/notifications", icon: Bell },
    { label: "Profile", path: "/guidedashboard/profile", icon: User },
  ],
  admin: [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard, end: true },
    { label: "Users", path: "/admin/users", icon: Users },
    { label: "Guides", path: "/admin/guides", icon: BriefcaseBusiness },
    { label: "Destinations", path: "/admin/destinations", icon: Compass },
    { label: "Trips", path: "/admin/trips", icon: Map },
    { label: "Bookings", path: "/admin/bookings", icon: CalendarCheck },
    { label: "Group Trips", path: "/admin/group-trips", icon: UsersRound },
    { label: "Reviews", path: "/admin/reviews", icon: Star },
    { label: "Notifications", path: "/admin/notifications", icon: Bell },
    { label: "Reports", path: "/admin/reports", icon: FileBarChart },
    { label: "Profile", path: "/admin/profile", icon: User },
  ],
  "super-admin": [
    { label: "System Overview", path: "/superadmin", icon: Activity, end: true },
    { label: "All Accounts", path: "/superadmin/allaccount", icon: Users },
    { label: "System Logs", path: "/superadmin/systemlog", icon: ShieldCheck },
    { label: "Platform Settings", path: "/superadmin/platformsettings", icon: Settings },
    { label: "Analytics", path: "/superadmin/analytics", icon: BarChart3 },
  ],
};

const roleLabels: Record<string, string> = {
  user: "Traveler",
  guide: "Freelance Guide",
  admin: "Admin",
  "super-admin": "Super Admin",
};

const normalizeRole = (role?: string) => {
  const normalized = role?.trim().toLowerCase().replace(/[_\s]+/g, "-") ?? "user";

  if (normalized === "freelancer-guide" || normalized === "freelance-guide") {
    return "guide";
  }

  return normalized;
};

export default function Navbar() {
  const { token, userDTO, logout } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const role = normalizeRole(userDTO?.role);
  const items = token ? roleItems[role] ?? publicItems : publicItems;
  const roleLabel = token ? roleLabels[role] ?? "Traveler" : "Explore Nepal";

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#251D18] text-[#F9F7F5] shadow-lg shadow-black/5 font-poppins">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-8">
        <NavLink to="/" end className="shrink-0" aria-label="Nepal Yatra home">
          <span className="block text-lg font-bold tracking-wide sm:text-xl">Nepal Yatra</span>
          <span className="block text-[10px] uppercase tracking-[0.2em] text-[#d4b8a5]">{roleLabel}</span>
        </NavLink>

        <div className="hidden min-w-0 flex-1 md:block">
          <div className="overflow-x-auto scrollbar-none">
            <div className="flex min-w-max items-center justify-center gap-1">
              {items.map(({ label, path, icon: Icon, end }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={end}
                  className={({ isActive }) =>
                    `group flex items-center gap-2 rounded-lg border-b-2 px-3 py-2 text-xs font-semibold transition-all duration-200 lg:px-3.5 ${
                      isActive
                        ? "border-[#e35d4f] bg-white/10 text-white"
                        : "border-transparent text-[#d7cbc3] hover:bg-white/[0.06] hover:text-white"
                    }`
                  }
                >
                  <Icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-105" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        {token ? (
          <div className="hidden shrink-0 md:flex items-center text-sm font-semibold">
            <button
              onClick={handleLogout}
              className="rounded-lg border border-white/30 px-4 py-2 text-xs transition-colors hover:border-white/70 hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="hidden shrink-0 items-center gap-2 text-sm font-semibold md:flex">
            <NavLink
              to="/login"
              className="rounded-lg border border-white/30 px-4 py-2 text-xs transition-colors hover:border-white/70 hover:bg-white/10"
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className="rounded-lg bg-[#b31919] px-4 py-2 text-xs transition-colors hover:bg-[#cf3029]"
            >
              Sign Up
            </NavLink>
          </div>
        )}

        <div className="ml-auto flex items-center md:hidden">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2 text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#e35d4f]"
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div id="mobile-navigation" className="border-t border-white/10 px-4 pb-5 pt-3 md:hidden">
          <div className="flex max-h-[70vh] flex-col gap-1 overflow-y-auto">
            {items.map(({ label, path, icon: Icon, end }) => (
              <NavLink
                key={path}
                to={path}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${
                    isActive ? "bg-[#b31919] text-white" : "text-[#d7cbc3] hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </div>
          <div className="mt-3 border-t border-white/10 pt-3">
            {token ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-lg border border-white/30 py-3 text-sm font-semibold transition-colors hover:bg-white/10"
              >
                Logout
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <NavLink to="/login" className="rounded-lg border border-white/30 py-3 text-center text-sm font-semibold transition-colors hover:bg-white/10">Login</NavLink>
                <NavLink to="/register" className="rounded-lg bg-[#b31919] py-3 text-center text-sm font-semibold transition-colors hover:bg-[#cf3029]">Sign Up</NavLink>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
