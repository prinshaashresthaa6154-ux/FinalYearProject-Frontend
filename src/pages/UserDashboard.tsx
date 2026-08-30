import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Compass,
  LoaderCircle,
  MapPinned,
  TicketCheck,
  UsersRound,
} from "lucide-react";
import { useCallback, useEffect, useState, type ComponentType } from "react";
import { Link, useNavigate } from "react-router";
import { getApiError } from "../api/axios";
import RecommendationTrips from "../components/RecommendationTrips";
import { EmptyState, ErrorState } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { bookingService, type Booking } from "../services/bookingService";
import {
  formatNotificationTimestamp,
  notificationPath,
  notificationService,
  type Notification,
} from "../services/notificationService";
import {
  userDashboardService,
  type DashboardUpcomingBooking,
  type UserDashboardData,
} from "../services/userDashboardService";

type Metric = {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  path: string;
};

export default function UserDashboard() {
  const { userDTO } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<UserDashboardData | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [dashboardResponse, bookingResponse] = await Promise.all([
        userDashboardService.get(),
        bookingService.listBookings(),
      ]);
      setDashboard(dashboardResponse.data.data ?? null);
      setBookings(bookingResponse.data.data?.content ?? []);
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openNotification = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await notificationService.markRead(notification.id);
      } catch {
        /* Navigation remains available. */
      }
    }
    navigate(notificationPath(notification, userDTO?.role));
  };

  if (loading)
    return (
      <main className="grid min-h-[70vh] place-items-center bg-[#f7f6f4]">
        <LoaderCircle className="h-8 w-8 animate-spin text-[#a62922]" />
      </main>
    );
  if (error || !dashboard)
    return (
      <main className="min-h-[70vh] bg-[#f7f6f4] px-5 py-14">
        <div className="mx-auto max-w-4xl">
          <ErrorState
            message={error || "Dashboard data is unavailable."}
            onRetry={() => void load()}
          />
        </div>
      </main>
    );

  const firstName =
    userDTO?.firstName || userDTO?.fullName?.split(" ")[0] || "Traveler";
  const activeTrip = dashboard.upcoming[0];
  const activeBookings = bookings.filter(
    (booking) => booking.status === "PENDING" || booking.status === "CONFIRMED",
  ).length;
  const metrics: Metric[] = [
    {
      label: "Upcoming trips",
      value: dashboard.upcomingBookings,
      icon: CalendarDays,
      path: "/user/bookings",
    },
    {
      label: "Active bookings",
      value: activeBookings,
      icon: TicketCheck,
      path: "/user/bookings",
    },
    {
      label: "Completed trips",
      value: dashboard.completedTrips,
      icon: CheckCircle2,
      path: "/user/bookings?status=COMPLETED",
    },
    {
      label: "Groups",
      value: dashboard.groups,
      icon: UsersRound,
      path: "/user/groups",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f7f6f4] text-[#28221e]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <header className="relative overflow-hidden bg-[#231d19] px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
          <div className="absolute -right-16 -top-28 h-72 w-72 rounded-full border-[42px] border-white/[0.04]" />
          <div className="absolute bottom-0 right-20 hidden h-32 w-px rotate-45 bg-white/10 lg:block" />
          <div className="relative max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#dc9f98]">
              Traveler dashboard
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Good morning, {firstName}.
            </h1>
            <p className="mt-4 text-base leading-7 text-[#d2c8c1] sm:text-lg">
              Ready for your next adventure? Discover places worth traveling for
              and keep every plan in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/destinations"
                className="inline-flex items-center gap-2 bg-[#a62922] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8e211c]"
              >
                Explore Destinations <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/trips"
                className="inline-flex items-center gap-2 border border-white/30 px-5 py-3 text-sm font-semibold hover:border-white/60 hover:bg-white/[0.06]"
              >
                Plan a trip <Compass className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        <section className="mt-8" aria-labelledby="overview-heading">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a62922]">
                At a glance
              </p>
              <h2 id="overview-heading" className="mt-1 text-2xl font-bold">
                Quick overview
              </h2>
            </div>
          </div>
          <div className="grid gap-px overflow-hidden border border-[#e4dfdb] bg-[#e4dfdb] sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map(({ label, value, icon: Icon, path }) => (
              <Link
                key={label}
                to={path}
                className="group flex items-center gap-4 bg-white p-5 transition hover:bg-[#fcfaf8] sm:p-6"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center bg-[#f5efeb] text-[#a62922]">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <strong className="block text-2xl font-bold">{value}</strong>
                  <span className="text-sm text-[#736a63] group-hover:text-[#a62922]">
                    {label}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <section>
            <SectionHeader
              eyebrow="Next journey"
              title="Continue planning"
              path="/user/bookings"
              action="View trips"
            />
            {activeTrip ? (
              <ActiveTrip booking={activeTrip} />
            ) : (
              <div className="border border-[#e4dfdb] bg-white p-8 sm:p-10">
                <MapPinned className="h-8 w-8 text-[#a62922]" />
                <h3 className="mt-5 text-xl font-bold">No active trip yet</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#736a63]">
                  Start exploring Nepal and save a journey that fits your pace.
                </p>
                <Link
                  to="/trips"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#a62922]"
                >
                  Browse trips <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </section>

          <section>
            <SectionHeader
              eyebrow="Bookings"
              title="Coming up"
              path="/user/bookings"
            />
            {dashboard.upcoming.length === 0 ? (
              <EmptyState
                title="No upcoming bookings"
                description="Confirmed future bookings will appear here."
              />
            ) : (
              <div className="divide-y divide-[#ebe6e2] border border-[#e4dfdb] bg-white">
                {dashboard.upcoming.slice(0, 3).map((booking) => (
                  <UpcomingBooking key={booking.bookingId} booking={booking} />
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="mt-12">
          <SectionHeader
            eyebrow="Picked for you"
            title="Recommended for you"
            path="/user/recommendations"
            action="See all"
          />
          <RecommendationTrips
            trips={dashboard.recommendations}
            loading={false}
            emptyText="Explore a few destinations to improve your recommendations."
          />
        </section>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="bg-[#ede5df] p-7 sm:p-8">
            <UsersRound className="h-7 w-7 text-[#a62922]" />
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-[#a62922]">
              Travel together
            </p>
            <h2 className="mt-2 text-2xl font-bold">Find a group trip</h2>
            <p className="mt-3 text-sm leading-6 text-[#685e57]">
              Join travelers heading your way, share the experience, and make
              new connections.
            </p>
            <Link
              to="/grouptrips"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#8f211c]"
            >
              Explore group trips <ArrowRight className="h-4 w-4" />
            </Link>
          </section>

          <section>
            <SectionHeader
              eyebrow="Your account"
              title="Recent activity"
              path="/user/notifications"
              action="View all"
            />
            {dashboard.recentActivity.length === 0 ? (
              <EmptyState
                title="No recent activity"
                description="Booking updates, reminders, and group activity will appear here."
              />
            ) : (
              <div className="divide-y divide-[#ebe6e2] border-y border-[#ddd7d2]">
                {dashboard.recentActivity.slice(0, 5).map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => void openNotification(notification)}
                    className="flex w-full items-start gap-4 py-4 text-left hover:text-[#a62922]"
                  >
                    <span
                      className={`mt-2 h-2 w-2 shrink-0 rounded-full ${notification.read ? "bg-[#cfc7c1]" : "bg-[#a62922]"}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-4">
                        <strong className="text-sm">
                          {notification.title}
                        </strong>
                        <time className="shrink-0 text-[11px] font-normal text-[#8b817a]">
                          {formatNotificationTimestamp(notification.createdAt)}
                        </time>
                      </span>
                      <span className="mt-1 line-clamp-2 block text-xs leading-5 text-[#736a63]">
                        {notification.message}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function ActiveTrip({ booking }: { booking: DashboardUpcomingBooking }) {
  return (
    <Link
      to={`/booking/${booking.bookingId}`}
      className="group block overflow-hidden border border-[#e4dfdb] bg-white"
    >
      <div className="grid sm:grid-cols-[180px_1fr]">
        <div className="flex min-h-40 flex-col justify-between bg-[#a62922] p-6 text-white">
          <MapPinned className="h-7 w-7" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/70">
              Departure
            </p>
            <p className="mt-1 font-bold">{formatDate(booking.startDate)}</p>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wide text-[#a62922]">
            {booking.bookingReference}
          </p>
          <h3 className="mt-2 text-2xl font-bold group-hover:text-[#a62922]">
            {booking.tripTitle}
          </h3>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#6f665f]">
            <span className="inline-flex items-center gap-2">
              <UsersRound className="h-4 w-4" />
              {booking.participants} traveler
              {booking.participants === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-2">
              <TicketCheck className="h-4 w-4" />
              {booking.status}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              {booking.paymentStatus}
            </span>
          </div>
          <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#a62922]">
            Continue planning <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function UpcomingBooking({ booking }: { booking: DashboardUpcomingBooking }) {
  return (
    <Link
      to={`/booking/${booking.bookingId}`}
      className="group flex items-center gap-4 p-5 hover:bg-[#fcfaf8]"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center bg-[#f5efeb] text-[#a62922]">
        <CalendarDays className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-sm group-hover:text-[#a62922]">
          {booking.tripTitle}
        </strong>
        <span className="mt-1 block text-xs text-[#756c65]">
          {formatDate(booking.startDate)} · {booking.status}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-[#9b928b]" />
    </Link>
  );
}

function SectionHeader({
  eyebrow,
  title,
  path,
  action = "View all",
}: {
  eyebrow: string;
  title: string;
  path: string;
  action?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a62922]">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{title}</h2>
      </div>
      <Link
        to={path}
        className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-[#a62922] hover:text-[#7f1d18]"
      >
        {action}
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "Date to be confirmed";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}
