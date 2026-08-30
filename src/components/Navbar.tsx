import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type FormEvent,
} from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import {
  Activity,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarCheck,
  ChevronDown,
  CircleHelp,
  Compass,
  FileBarChart,
  Heart,
  History,
  Home,
  Layers3,
  LayoutDashboard,
  LogOut,
  Map,
  MapPinned,
  Menu,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  User,
  UserRound,
  Users,
  UsersRound,
  Wallet,
  X,
} from "lucide-react";
import { normalizeRole } from "../auth/roles";
import { useAuth } from "../context/AuthContext";
import { profileImageUrl } from "../services/authService";
import NotificationBell from "./NotificationBell";
import nyLogo from "../assets/NY Logo.png";

type NavItem = {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  end?: boolean;
};
type MenuGroup = { label: string; items: NavItem[] };

const exploreItems: NavItem[] = [
  { label: "Destinations", path: "/destinations", icon: MapPinned },
  { label: "Categories", path: "/categories", icon: Layers3 },
  {
    label: "Popular places",
    path: "/destinations?sortBy=rating&sortDir=desc",
    icon: Star,
  },
  {
    label: "Trending trips",
    path: "/trips?sortBy=popularity&sortDir=desc",
    icon: TrendingUp,
  },
  {
    label: "Recommended for you",
    path: "/user/recommendations",
    icon: Sparkles,
  },
];

const tripItems: NavItem[] = [
  { label: "Upcoming trips", path: "/user/bookings", icon: CalendarCheck },
  { label: "Bookings", path: "/user/bookings", icon: CalendarCheck },
  {
    label: "Completed trips",
    path: "/user/bookings?status=COMPLETED",
    icon: ShieldCheck,
  },
  { label: "Saved trips", path: "/user/favorites", icon: Heart },
  { label: "Group trips", path: "/grouptrips", icon: UsersRound },
  {
    label: "Travel history",
    path: "/user/bookings?status=COMPLETED",
    icon: History,
  },
];

const guideItems: NavItem[] = [
  { label: "Find a guide", path: "/guides", icon: Compass },
  { label: "Recommended guides", path: "/guides", icon: Sparkles },
  { label: "Popular guides", path: "/freelance-guides", icon: Star },
  { label: "My guide bookings", path: "/user/guide-bookings", icon: UserRound },
];

const moreItems: NavItem[] = [
  { label: "Categories", path: "/categories", icon: Layers3 },
  { label: "Group trips", path: "/grouptrips", icon: UsersRound },
  { label: "Recommendations", path: "/user/recommendations", icon: Sparkles },
  { label: "Saved destinations", path: "/user/favorites", icon: Heart },
  { label: "Reviews", path: "/user/reviews", icon: Star },
  { label: "Messages", path: "/user/messages", icon: MessageSquare },
  { label: "Guide bookings", path: "/user/guide-bookings", icon: BriefcaseBusiness },
  {
    label: "Travel history",
    path: "/user/bookings?status=COMPLETED",
    icon: History,
  },
  { label: "Help & support", path: "/profile", icon: CircleHelp },
];

const mobileGroups: MenuGroup[] = [
  {
    label: "Main",
    items: [
      { label: "Home", path: "/user/dashboard", icon: Home },
      { label: "Explore", path: "/destinations", icon: Compass },
      { label: "Trips", path: "/trips", icon: Map },
      { label: "Guides", path: "/guides", icon: UserRound },
    ],
  },
  {
    label: "Explore",
    items: [exploreItems[0], exploreItems[1], exploreItems[4]],
  },
  { label: "Travel", items: [tripItems[4], moreItems[3], tripItems[5]] },
  {
    label: "Account",
    items: [
      { label: "Profile", path: "/user/profile", icon: UserRound },
      moreItems[5],
      moreItems[4],
      { label: "Settings", path: "/profile/edit", icon: Settings },
      moreItems[7],
    ],
  },
];

const roleItems: Record<string, NavItem[]> = {
  guide: [
    {
      label: "Overview",
      path: "/guidedashboard",
      icon: LayoutDashboard,
      end: true,
    },
    { label: "My Trips", path: "/guidedashboard/trips", icon: Map },
    { label: "Requests", path: "/guidedashboard/requests", icon: Users },
    { label: "Earnings", path: "/guidedashboard/earnings", icon: Wallet },
    { label: "Messages", path: "/guide/messages", icon: MessageSquare },
    { label: "Reviews", path: "/guidedashboard/reviews", icon: Star },
    {
      label: "Notifications",
      path: "/guidedashboard/notifications",
      icon: Bell,
    },
    { label: "Profile", path: "/guidedashboard/profile", icon: User },
    {
      label: "Legacy Profile",
      path: "/guidedashboard/legacy-profile",
      icon: BriefcaseBusiness,
    },
  ],
  admin: [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
      end: true,
    },
    { label: "Destinations", path: "/admin/destinations", icon: Compass },
    { label: "Categories", path: "/admin/categories", icon: Layers3 },
    { label: "Trips", path: "/admin/trips", icon: Map },
    { label: "Bookings", path: "/admin/bookings", icon: CalendarCheck },
    { label: "Settlements", path: "/admin/settlements", icon: Wallet },
    { label: "Reviews", path: "/admin/reviews", icon: Star },
    { label: "Notifications", path: "/admin/notifications", icon: Bell },
    { label: "Reports", path: "/admin/reports", icon: FileBarChart },
    { label: "Profile", path: "/admin/profile", icon: User },
    { label: "Messages", path: "/admin/messages", icon: MessageSquare },
  ],
  "super-admin": [
    {
      label: "System Overview",
      path: "/superadmin",
      icon: Activity,
      end: true,
    },
    { label: "All Accounts", path: "/superadmin/allaccount", icon: Users },
    { label: "Settlements", path: "/superadmin/settlements", icon: Wallet },
    { label: "System Logs", path: "/superadmin/systemlog", icon: ShieldCheck },
    {
      label: "Platform Settings",
      path: "/superadmin/platformsettings",
      icon: Settings,
    },
    { label: "Reports", path: "/superadmin/reports", icon: BarChart3 },
  ],
};

export default function Navbar() {
  const { token, userDTO } = useAuth();
  const location = useLocation();
  const normalizedRole = normalizeRole(userDTO?.role);
  const role =
    normalizedRole === "FREELANCE_GUIDE"
      ? "guide"
      : (normalizedRole?.toLowerCase().replace("superadmin", "super-admin") ??
        "user");
  const travelerNavigation = !token || role === "user";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (!travelerNavigation) return <RoleNavbar items={roleItems[role] ?? []} />;

  return <TravelerNavbar />;
}

function TravelerNavbar() {
  const { token, userDTO, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navRef = useRef<HTMLElement>(null);
  const name =
    userDTO?.fullName ||
    [userDTO?.firstName, userDTO?.lastName].filter(Boolean).join(" ") ||
    "Traveler";
  const avatar = profileImageUrl(userDTO?.profileImage);

  useEffect(() => {
    setMobileOpen(false);
    setMenu(null);
    setSearchOpen(false);
  }, [location.pathname, location.search]);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setMenu(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    setSearchOpen(false);
    navigate(`/search?keyword=${encodeURIComponent(value)}`);
  };
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  const home = token ? "/user/dashboard" : "/";

  return (
    <>
      <nav
        ref={navRef}
        className="sticky top-0 z-50 border-b border-[#e6e1dd] bg-white text-[#2b2521] shadow-[0_2px_14px_rgba(38,28,22,0.05)]"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <NavLink
            to={home}
            className="flex shrink-0 items-center gap-2"
            aria-label="Nepal Yatra home"
          >
            <img
              src={nyLogo}
              alt="Nepal Yatra"
              className="h-10 w-10 object-contain"
            />
            <span className="hidden text-base font-bold text-[#211b18] sm:block">
              Nepal Yatra
            </span>
          </NavLink>

          <div className="hidden h-full items-center gap-1 lg:flex">
            <PrimaryLink label="Home" path={home} end />
            <Dropdown
              label="Explore"
              open={menu === "explore"}
              onToggle={() => setMenu(menu === "explore" ? null : "explore")}
              items={exploreItems}
              active={
                location.pathname === "/destinations" ||
                location.pathname === "/categories" ||
                location.pathname === "/user/recommendations"
              }
            />
            <Dropdown
              label="Trips"
              open={menu === "trips"}
              onToggle={() => setMenu(menu === "trips" ? null : "trips")}
              items={tripItems}
              active={
                location.pathname.includes("trip") ||
                location.pathname.includes("booking") ||
                location.pathname.includes("groups")
              }
            />
            <Dropdown
              label="Guides"
              open={menu === "guides"}
              onToggle={() => setMenu(menu === "guides" ? null : "guides")}
              items={guideItems}
              active={location.pathname.includes("guide")}
            />
            {token && (
              <Dropdown
                label="More"
                open={menu === "more"}
                onToggle={() => setMenu(menu === "more" ? null : "more")}
                items={moreItems}
                active={false}
                columns
              />
            )}
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-10 items-center gap-2 px-2.5 text-sm font-medium text-[#554c46] hover:text-[#a62922]"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
              <span className="hidden xl:inline">Search</span>
            </button>
            {token && <NotificationBell />}
            {token ? (
              <div className="relative hidden lg:block">
                <button
                  type="button"
                  onClick={() => setMenu(menu === "profile" ? null : "profile")}
                  className="flex h-11 items-center gap-2 border-l border-[#e7e2de] pl-3"
                  aria-expanded={menu === "profile"}
                >
                  <Avatar src={avatar} name={name} />
                  <span className="max-w-28 truncate text-sm font-semibold">
                    {name.split(" ")[0]}
                  </span>
                  <ChevronDown className="h-4 w-4 text-[#81776f]" />
                </button>
                {menu === "profile" && (
                  <ProfileMenu
                    name={name}
                    avatar={avatar}
                    onLogout={handleLogout}
                  />
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-3 lg:flex">
                <NavLink
                  to="/login"
                  className="text-sm font-semibold hover:text-[#a62922]"
                >
                  Sign in
                </NavLink>
                <NavLink
                  to="/register"
                  className="bg-[#a62922] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#8f211c]"
                >
                  Create account
                </NavLink>
              </div>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="grid h-10 w-10 place-items-center lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <MobileMenu
            token={Boolean(token)}
            name={name}
            avatar={avatar}
            onLogout={handleLogout}
          />
        )}
      </nav>

      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 px-4 pt-[12vh]"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setSearchOpen(false)
          }
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Search Nepal Yatra"
            className="mx-auto max-w-2xl bg-white shadow-2xl"
          >
            <form
              onSubmit={submitSearch}
              className="flex items-center border-b border-[#e8e2dd] p-3 sm:p-4"
            >
              <Search className="ml-2 h-5 w-5 text-[#81776f]" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search destinations, trips or guides..."
                className="min-w-0 flex-1 px-4 py-3 text-base outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="grid h-9 w-9 place-items-center"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </form>
            <div className="grid gap-px bg-[#eee9e5] sm:grid-cols-4">
              {[
                {
                  label: "Destinations",
                  path: "/destinations",
                  icon: MapPinned,
                },
                { label: "Trips", path: "/trips", icon: Map },
                { label: "Guides", path: "/guides", icon: UserRound },
                { label: "Categories", path: "/categories", icon: Layers3 },
              ].map(({ label, path, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  className="flex items-center gap-2 bg-white p-4 text-sm font-semibold hover:text-[#a62922]"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function PrimaryLink({
  label,
  path,
  end,
}: {
  label: string;
  path: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={path}
      end={end}
      className={({ isActive }) =>
        `flex h-16 items-center border-b-2 px-3 text-sm font-semibold transition ${isActive ? "border-[#a62922] text-[#a62922]" : "border-transparent text-[#554c46] hover:text-[#211b18]"}`
      }
    >
      {label}
    </NavLink>
  );
}

function Dropdown({
  label,
  items,
  open,
  onToggle,
  active,
  columns = false,
}: {
  label: string;
  items: NavItem[];
  open: boolean;
  onToggle: () => void;
  active: boolean;
  columns?: boolean;
}) {
  return (
    <div className="relative h-full">
      <button
        type="button"
        onClick={onToggle}
        className={`flex h-16 items-center gap-1 border-b-2 px-3 text-sm font-semibold ${active ? "border-[#a62922] text-[#a62922]" : "border-transparent text-[#554c46] hover:text-[#211b18]"}`}
        aria-expanded={open}
      >
        {label}
        <ChevronDown
          className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          className={`absolute left-0 top-[58px] border border-[#e5dfda] bg-white p-2 shadow-xl ${columns ? "grid w-[420px] grid-cols-2" : "w-64"}`}
        >
          {items.map(({ label: itemLabel, path, icon: Icon }) => (
            <NavLink
              key={`${itemLabel}-${path}`}
              to={path}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#544b45] hover:bg-[#f8f5f2] hover:text-[#a62922]"
            >
              <Icon className="h-4 w-4" />
              <span>{itemLabel}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileMenu({
  name,
  avatar,
  onLogout,
}: {
  name: string;
  avatar: string;
  onLogout: () => Promise<void>;
}) {
  const items = [
    { label: "My profile", path: "/user/profile", icon: UserRound },
    { label: "Account settings", path: "/profile/edit", icon: Settings },
    {
      label: "Privacy & security",
      path: "/profile/change-password",
      icon: ShieldCheck,
    },
    { label: "Notification settings", path: "/user/notifications", icon: Bell },
    { label: "Messages", path: "/user/messages", icon: MessageSquare },
    { label: "Help & support", path: "/profile", icon: CircleHelp },
  ];
  return (
    <div className="absolute right-0 top-12 w-72 border border-[#e5dfda] bg-white p-2 shadow-xl">
      <div className="flex items-center gap-3 border-b border-[#eee9e5] p-3">
        <Avatar src={avatar} name={name} large />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{name}</p>
          <p className="text-xs text-[#81776f]">Traveler</p>
        </div>
      </div>
      <div className="py-2">
        {items.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={label}
            to={path}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#544b45] hover:bg-[#f8f5f2] hover:text-[#a62922]"
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </div>
      <button
        type="button"
        onClick={() => void onLogout()}
        className="flex w-full items-center gap-3 border-t border-[#eee9e5] px-3 py-3 text-sm font-semibold text-[#9f2620] hover:bg-red-50"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </div>
  );
}

function MobileMenu({
  token,
  name,
  avatar,
  onLogout,
}: {
  token: boolean;
  name: string;
  avatar: string;
  onLogout: () => Promise<void>;
}) {
  return (
    <div className="max-h-[calc(100vh-64px)] overflow-y-auto border-t border-[#e8e2dd] bg-white px-4 py-5 lg:hidden">
      {token && (
        <div className="mb-5 flex items-center gap-3 border-b border-[#eee9e5] pb-5">
          <Avatar src={avatar} name={name} large />
          <div>
            <p className="font-bold">{name}</p>
            <p className="text-xs text-[#81776f]">Traveler</p>
          </div>
        </div>
      )}
      {mobileGroups.map((group) => (
        <div key={group.label} className="mb-5">
          <p className="mb-2 px-2 text-[11px] font-bold uppercase text-[#8b817a]">
            {group.label}
          </p>
          <div className="grid sm:grid-cols-2">
            {group.items.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={`${group.label}-${label}`}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-2 py-3 text-sm font-semibold ${isActive ? "text-[#a62922]" : "text-[#4f4741]"}`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
      {token ? (
        <button
          type="button"
          onClick={() => void onLogout()}
          className="flex w-full items-center gap-3 border-t border-[#eee9e5] px-2 pt-5 text-sm font-semibold text-[#9f2620]"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3 border-t border-[#eee9e5] pt-5">
          <NavLink
            to="/login"
            className="border border-[#d8d1cb] px-4 py-3 text-center text-sm font-semibold"
          >
            Sign in
          </NavLink>
          <NavLink
            to="/register"
            className="bg-[#a62922] px-4 py-3 text-center text-sm font-semibold text-white"
          >
            Create account
          </NavLink>
        </div>
      )}
    </div>
  );
}

function Avatar({
  src,
  name,
  large = false,
}: {
  src: string;
  name: string;
  large?: boolean;
}) {
  const size = large ? "h-11 w-11" : "h-9 w-9";
  return src ? (
    <img
      src={src}
      alt=""
      className={`${size} shrink-0 rounded-full object-cover`}
    />
  ) : (
    <span
      className={`${size} grid shrink-0 place-items-center rounded-full bg-[#f0e6df] text-sm font-bold text-[#8f211c]`}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function RoleNavbar({ items }: { items: NavItem[] }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [location.pathname]);
  const signOut = async () => {
    await logout();
    navigate("/login");
  };
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#514847] bg-[#2B2525] text-[#F5F2F0]">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex shrink-0 items-center gap-2">
          <img
            src={nyLogo}
            alt="Nepal Yatra"
            className="h-12 w-12 object-contain"
          />
          <span className="hidden font-bold sm:block">Nepal Yatra</span>
        </NavLink>
        <div className="hidden min-w-0 flex-1 overflow-x-auto md:block">
          <div className="flex min-w-max justify-center gap-1">
            {items.map(({ label, path, icon: Icon, end }) => (
              <NavLink
                key={path}
                to={path}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-semibold ${isActive ? "border-[#AF1D1D] text-white" : "border-transparent text-[#C8C1BE] hover:text-white"}`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <NotificationBell dark />
          <button
            type="button"
            onClick={() => void signOut()}
            className="border border-[#756b68] px-4 py-2 text-xs"
          >
            Logout
          </button>
        </div>
        <div className="ml-auto flex items-center md:hidden">
          <NotificationBell dark />
          <button type="button" onClick={() => setOpen(!open)} className="p-2">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-white/10 px-4 py-4 md:hidden">
          {items.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className="flex items-center gap-3 px-3 py-3 text-sm text-[#C8C1BE]"
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-3 w-full border border-[#756b68] py-3 text-sm"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
