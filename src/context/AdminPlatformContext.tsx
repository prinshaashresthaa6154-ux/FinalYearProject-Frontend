import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ADMIN_STORAGE_KEY,
  SEED_BOOKINGS,
  SEED_DESTINATIONS,
  SEED_GUIDES,
  SEED_NOTIFICATIONS,
  SEED_REVIEWS,
  SEED_TRIPS,
  SEED_USERS,
  type BookingStatus,
  type GuideRecord,
  type GuideStatus,
  type PaymentStatus,
  type PlatformBooking,
  type PlatformDestination,
  type PlatformNotification,
  type PlatformReview,
  type PlatformTrip,
  type PlatformUser,
  type ReviewVisibility,
  type TripStatus,
  type UserStatus,
} from "../data/adminPlatform";

interface AdminPlatformState {
  users: PlatformUser[];
  guides: GuideRecord[];
  destinations: PlatformDestination[];
  trips: PlatformTrip[];
  bookings: PlatformBooking[];
  reviews: PlatformReview[];
  notifications: PlatformNotification[];
}

interface AdminPlatformContextValue extends AdminPlatformState {
  // Users
  updateUserStatus: (id: string, status: UserStatus) => void;
  deleteUser: (id: string) => void;
  // Guides
  updateGuideStatus: (id: number, status: GuideStatus) => void;
  isGuideBookable: (guideId: number) => boolean;
  // Destinations
  upsertDestination: (dest: PlatformDestination) => void;
  deleteDestination: (id: number) => void;
  getFeaturedDestinations: () => PlatformDestination[];
  getDestinationById: (id: number) => PlatformDestination | undefined;
  // Trips
  upsertTrip: (trip: PlatformTrip) => void;
  deleteTrip: (id: number) => void;
  // Bookings
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  updatePaymentStatus: (id: string, payment: PaymentStatus) => void;
  // Reviews
  setReviewVisibility: (id: number, visibility: ReviewVisibility) => void;
  deleteReview: (id: number) => void;
  visibleReviews: PlatformReview[];
  // Notifications
  addNotification: (n: Omit<PlatformNotification, "id">) => void;
  deleteNotification: (id: number) => void;
  markNotificationSent: (id: number) => void;
}

const AdminPlatformContext = createContext<AdminPlatformContextValue | null>(
  null,
);

function loadState(): AdminPlatformState {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AdminPlatformState;
  } catch {
    // ignore
  }
  return {
    users: SEED_USERS,
    guides: SEED_GUIDES,
    destinations: SEED_DESTINATIONS,
    trips: SEED_TRIPS,
    bookings: SEED_BOOKINGS,
    reviews: SEED_REVIEWS,
    notifications: SEED_NOTIFICATIONS,
  };
}

function persist(state: AdminPlatformState) {
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function AdminPlatformProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminPlatformState>(() => loadState());

  const commit = useCallback(
    (updater: (prev: AdminPlatformState) => AdminPlatformState) => {
      setState((prev) => {
        const next = updater(prev);
        persist(next);
        return next;
      });
    },
    [],
  );

  const updateUserStatus = useCallback(
    (id: string, status: UserStatus) => {
      commit((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === id ? { ...u, status } : u)),
      }));
    },
    [commit],
  );

  const deleteUser = useCallback(
    (id: string) => {
      commit((prev) => ({
        ...prev,
        users: prev.users.filter((u) => u.id !== id),
      }));
    },
    [commit],
  );

  const updateGuideStatus = useCallback(
    (id: number, status: GuideStatus) => {
      commit((prev) => ({
        ...prev,
        guides: prev.guides.map((g) =>
          g.id === id ? { ...g, status, available: status === "Active" } : g,
        ),
      }));
    },
    [commit],
  );

  const isGuideBookable = useCallback(
    (guideId: number) => {
      const guide = state.guides.find((g) => g.id === guideId);
      return !!guide && guide.status === "Active";
    },
    [state.guides],
  );

  const upsertDestination = useCallback(
    (dest: PlatformDestination) => {
      commit((prev) => {
        const exists = prev.destinations.some((d) => d.id === dest.id);
        return {
          ...prev,
          destinations: exists
            ? prev.destinations.map((d) => (d.id === dest.id ? dest : d))
            : [...prev.destinations, dest],
        };
      });
    },
    [commit],
  );

  const deleteDestination = useCallback(
    (id: number) => {
      commit((prev) => ({
        ...prev,
        destinations: prev.destinations.filter((d) => d.id !== id),
      }));
    },
    [commit],
  );

  const getFeaturedDestinations = useCallback(
    () => state.destinations.filter((d) => d.featured && d.status === "Active"),
    [state.destinations],
  );

  const getDestinationById = useCallback(
    (id: number) => state.destinations.find((d) => d.id === id),
    [state.destinations],
  );

  const upsertTrip = useCallback(
    (trip: PlatformTrip) => {
      commit((prev) => {
        const exists = prev.trips.some((t) => t.id === trip.id);
        return {
          ...prev,
          trips: exists
            ? prev.trips.map((t) => (t.id === trip.id ? trip : t))
            : [...prev.trips, trip],
        };
      });
    },
    [commit],
  );

  const deleteTrip = useCallback(
    (id: number) => {
      commit((prev) => ({
        ...prev,
        trips: prev.trips.filter((t) => t.id !== id),
      }));
    },
    [commit],
  );

  const updateBookingStatus = useCallback(
    (id: string, status: BookingStatus) => {
      commit((prev) => ({
        ...prev,
        bookings: prev.bookings.map((b) =>
          b.id === id ? { ...b, status } : b,
        ),
      }));
    },
    [commit],
  );

  const updatePaymentStatus = useCallback(
    (id: string, payment: PaymentStatus) => {
      commit((prev) => ({
        ...prev,
        bookings: prev.bookings.map((b) =>
          b.id === id ? { ...b, payment } : b,
        ),
      }));
    },
    [commit],
  );

  const setReviewVisibility = useCallback(
    (id: number, visibility: ReviewVisibility) => {
      commit((prev) => ({
        ...prev,
        reviews: prev.reviews.map((r) =>
          r.id === id ? { ...r, visibility } : r,
        ),
      }));
    },
    [commit],
  );

  const deleteReview = useCallback(
    (id: number) => {
      commit((prev) => ({
        ...prev,
        reviews: prev.reviews.filter((r) => r.id !== id),
      }));
    },
    [commit],
  );

  const addNotification = useCallback(
    (n: Omit<PlatformNotification, "id">) => {
      commit((prev) => {
        const nextId = Math.max(0, ...prev.notifications.map((x) => x.id)) + 1;
        return {
          ...prev,
          notifications: [{ ...n, id: nextId }, ...prev.notifications],
        };
      });
    },
    [commit],
  );

  const deleteNotification = useCallback(
    (id: number) => {
      commit((prev) => ({
        ...prev,
        notifications: prev.notifications.filter((n) => n.id !== id),
      }));
    },
    [commit],
  );

  const markNotificationSent = useCallback(
    (id: number) => {
      commit((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) =>
          n.id === id ? { ...n, sent: true } : n,
        ),
      }));
    },
    [commit],
  );

  const visibleReviews = useMemo(
    () => state.reviews.filter((r) => r.visibility === "Visible"),
    [state.reviews],
  );

  const value: AdminPlatformContextValue = {
    ...state,
    updateUserStatus,
    deleteUser,
    updateGuideStatus,
    isGuideBookable,
    upsertDestination,
    deleteDestination,
    getFeaturedDestinations,
    getDestinationById,
    upsertTrip,
    deleteTrip,
    updateBookingStatus,
    updatePaymentStatus,
    setReviewVisibility,
    deleteReview,
    visibleReviews,
    addNotification,
    deleteNotification,
    markNotificationSent,
  };

  return (
    <AdminPlatformContext.Provider value={value}>
      {children}
    </AdminPlatformContext.Provider>
  );
}

export function useAdminPlatform() {
  const ctx = useContext(AdminPlatformContext);
  if (!ctx) {
    throw new Error(
      "useAdminPlatform must be used within AdminPlatformProvider",
    );
  }
  return ctx;
}

export function useAdminPlatformOptional() {
  return useContext(AdminPlatformContext);
}

// silence unused type import warnings for TripStatus re-export usage in pages
export type { TripStatus, PlatformTrip, PlatformDestination };
