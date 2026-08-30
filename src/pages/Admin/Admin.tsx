import {
  ArrowLeft,
  LayoutDashboard,
  Compass,
  Map,
  CalendarCheck,
  Star,
  Megaphone,
  FileBarChart,
  User,
  Tags,
  MessageSquare,
  Menu,
  X,
  LogOut,
  WalletCards,
} from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import NotificationBell from "../../components/NotificationBell";
import { useAuth } from "../../context/AuthContext";
import nyLogo from "../../assets/NY Logo.png";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: 1, name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { id: 4, name: "Destinations", icon: Compass, path: "/admin/destinations" },
    { id: 12, name: "Categories", icon: Tags, path: "/admin/categories" },
    { id: 5, name: "Trips", icon: Map, path: "/admin/trips" },
    { id: 6, name: "Bookings", icon: CalendarCheck, path: "/admin/bookings" },
    { id: 15, name: "Guide commissions", icon: WalletCards, path: "/admin/guide-bookings" },
    { id: 14, name: "Settlements", icon: WalletCards, path: "/admin/settlements" },
    { id: 8, name: "Reviews", icon: Star, path: "/admin/reviews" },
    { id: 13, name: "Messages", icon: MessageSquare, path: "/admin/messages" },
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
      tab.path === "/admin/dashboard"
        ? location.pathname === "/admin/dashboard" || location.pathname === "/admin"
        : location.pathname.startsWith(tab.path),
    )?.name ?? "Dashboard";

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const navigateTo = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2933] antialiased">
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#e4e8ec] bg-white px-4 py-5 shadow-[4px_0_18px_rgba(31,41,51,0.04)] transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-3">
          <div className="flex items-center gap-3">
            <img src={nyLogo} alt="Nepal Yatra logo" className="h-14 w-14 rounded-xl object-contain" />
            <div>
              <p className="text-lg font-bold tracking-tight text-[#1f2933]">Nepal Yatra</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#AF1D1D]">Admin workspace</p>
            </div>
          </div>
          <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-lg p-2 text-[#66717c] hover:bg-[#f7f8fa] hover:text-[#AF1D1D] lg:hidden" aria-label="Close navigation">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="my-6 h-px bg-[#edf0f2]" />
        <nav aria-label="Admin navigation" className="flex-1 space-y-1 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.name;
            return (
              <button key={tab.id} type="button" onClick={() => navigateTo(tab.path)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors ${isActive ? "bg-[#AF1D1D] text-white shadow-sm" : "text-[#66717c] hover:bg-[#fff5f5] hover:text-[#AF1D1D]"}`}>
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
        <div className="mt-5 border-t border-[#edf0f2] pt-4">
          <p className="px-3 text-xs leading-5 text-[#98a2aa]">Manage destinations, trips, bookings, and travelers.</p>
          <button type="button" onClick={() => void handleLogout()} className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#AF1D1D] transition-colors hover:bg-[#fff5f5]">
            <LogOut className="h-[18px] w-[18px]" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      {sidebarOpen && <button type="button" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-[#1f2933]/35 lg:hidden" aria-label="Close navigation overlay" />}

      <div className="lg:pl-64">
      <header className="sticky top-0 z-30 border-b border-[#e4e8ec] bg-white/95 py-4 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-[#66717c] hover:bg-[#f7f8fa] hover:text-[#AF1D1D] lg:hidden" aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="hidden text-[#98a2aa] transition hover:text-[#AF1D1D] sm:block"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="flex items-center gap-2 text-base font-semibold tracking-tight sm:text-lg">
                <span className="hidden h-2.5 w-2.5 rounded-full bg-[#AF1D1D] sm:inline-block" />
                Admin Panel
              </h1>
               <p className="text-xs text-[#98a2aa]">
                Tourism Platform Management
              </p>
            </div>
          </div>
           <div className="flex items-center gap-3">
             <NotificationBell />
                <div className="rounded-full border border-[#f0caca] bg-[#fff5f5] px-3 py-1.5 text-xs font-semibold text-[#AF1D1D]">
              Admin
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Outlet />
      </main>
      </div>
    </div>
  );
}
