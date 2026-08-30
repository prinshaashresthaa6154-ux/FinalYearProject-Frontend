import {
  ArrowLeft,
  Activity,
  Users,
  Database,
  BarChart3,
  ShieldCheck,
  BriefcaseBusiness,
  Compass,
  FolderTree,
  Map,
  CreditCard,
  FileCheck2,
  Menu,
  X,
  LogOut,
  Settings,
  WalletCards,
} from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import NotificationBell from "../../components/NotificationBell";
import { useAuth } from "../../context/AuthContext";
import nyLogo from "../../assets/NY Logo.png";

export default function SuperAdminPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: 1, name: "Dashboard", icon: Activity, path: "/superadmin/dashboard" },
    { id: 2, name: "Verifications", icon: FileCheck2, path: "/superadmin/verifications" },
    { id: 3, name: "Users", icon: Users, path: "/superadmin/users" },
    { id: 4, name: "Admins", icon: ShieldCheck, path: "/superadmin/admins" },
    { id: 5, name: "Guides", icon: BriefcaseBusiness, path: "/superadmin/guides" },
    { id: 6, name: "Categories", icon: FolderTree, path: "/superadmin/categories" },
    { id: 7, name: "Destinations", icon: Compass, path: "/superadmin/destinations" },
    { id: 8, name: "Trips", icon: Map, path: "/superadmin/trips" },
    { id: 10, name: "Payments", icon: CreditCard, path: "/superadmin/payments" },
    { id: 18, name: "Guide commissions", icon: WalletCards, path: "/superadmin/guide-bookings" },
    { id: 17, name: "Settlements", icon: WalletCards, path: "/superadmin/settlements" },
    { id: 13, name: "Reports", icon: BarChart3, path: "/superadmin/reports" },
    { id: 14, name: "Audit Logs", icon: Database, path: "/superadmin/audit-logs" },
    { id: 16, name: "Platform Settings", icon: Settings, path: "/superadmin/platformsettings" },
  ];

  const activeTab =
    tabs.find((tab) =>
      tab.path === "/superadmin/dashboard"
        ? location.pathname === "/superadmin/dashboard" || location.pathname === "/superadmin"
        : location.pathname.startsWith(tab.path),
    )?.name ?? "System Overview";

  const handleChange = (tab: (typeof tabs)[number]) => {
    navigate(tab.path);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1f2933] antialiased">
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#e4e8ec] bg-white px-4 py-5 shadow-[4px_0_18px_rgba(31,41,51,0.04)] transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-3">
          <div className="flex items-center gap-3">
            <img src={nyLogo} alt="Nepal Yatra logo" className="h-14 w-14 rounded-xl object-contain" />
            <div>
              <p className="text-lg font-bold tracking-tight text-[#1f2933]">Nepal Yatra</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#AF1D1D]">Super Admin</p>
            </div>
          </div>
          <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-lg p-2 text-[#66717c] hover:bg-[#f7f8fa] hover:text-[#AF1D1D] lg:hidden" aria-label="Close navigation">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="my-6 h-px bg-[#edf0f2]" />
        <nav aria-label="Super admin navigation" className="flex-1 space-y-1 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.name;
            return (
              <button key={tab.id} type="button" onClick={() => handleChange(tab)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors ${isActive ? "bg-[#AF1D1D] text-white shadow-sm" : "text-[#66717c] hover:bg-[#fff5f5] hover:text-[#AF1D1D]"}`}>
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
        <div className="mt-5 border-t border-[#edf0f2] pt-4">
          <p className="px-3 text-xs leading-5 text-[#98a2aa]">Platform administration and system operations.</p>
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
          <div className="flex items-center gap-4 ">
            <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-[#66717c] hover:bg-[#f7f8fa] hover:text-[#AF1D1D] lg:hidden" aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </button>
            <button onClick={() => navigate(-1)} className="hidden text-[#98a2aa] transition hover:text-[#AF1D1D] sm:block">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="flex items-center gap-2 text-base font-semibold tracking-tight sm:text-lg">
                <span className="hidden h-2.5 w-2.5 rounded-full bg-[#AF1D1D] sm:inline-block" />
                Super Admin Panel
              </h1>
              <p className="text-xs text-[#98a2aa]">Full System Control</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
             <div className="rounded-full border border-[#f0caca] bg-[#fff5f5] px-3 py-1.5 text-xs font-semibold text-[#AF1D1D]">
              Super Admin
            </div>
          </div>
        </div>
      </header>

      <main className="superadmin-content mx-auto max-w-7xl space-y-9 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Outlet />
      </main>
      </div>
    </div>
  );
}
