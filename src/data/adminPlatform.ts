/** Shared platform data for Admin ↔ User ↔ Guide integration */

export type UserStatus = "Active" | "Suspended";
export type GuideStatus = "Active" | "Pending" | "Suspended";
export type TripStatus =
  | "Draft"
  | "Published"
  | "Ongoing"
  | "Completed"
  | "Cancelled";
export type BookingStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Cancelled"
  | "Completed";
export type PaymentStatus = "Unpaid" | "Paid" | "Refunded";
export type ReviewVisibility = "Visible" | "Hidden";

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: "Tourist" | "Guide" | "Admin";
  status: UserStatus;
  joined: string;
  trips: number;
  reviews: number;
}

export interface PlatformDestination {
  id: number;
  title: string;
  location: string;
  category: string;
  description: string;
  price: number;
  altitude: string;
  bestSeason: string;
  status: "Active" | "Inactive";
  featured: boolean;
  gallery: string[];
  rating: number;
  reviews: number;
}

export interface PlatformTrip {
  id: number;
  title: string;
  destinationId: number;
  destination: string;
  guideId: number | null;
  guideName: string;
  startDate: string;
  endDate: string;
  duration: string;
  capacity: number;
  booked: number;
  price: number;
  status: TripStatus;
}

export interface PlatformBooking {
  id: string;
  tourist: string;
  trip: string;
  guide: string;
  date: string;
  amount: string;
  status: BookingStatus;
  payment: PaymentStatus;
}

export interface PlatformReview {
  id: number;
  author: string;
  target: string;
  targetType: "Guide" | "Trip" | "Destination";
  rating: number;
  text: string;
  date: string;
  visibility: ReviewVisibility;
}

export interface PlatformNotification {
  id: number;
  title: string;
  body: string;
  audience: "All" | "Tourists" | "Guides";
  createdAt: string;
  sent: boolean;
}

export interface GuideRecord {
  id: number;
  name: string;
  email: string;
  location: string;
  experience: string;
  languages: string[];
  rating: number;
  reviews: number;
  trips: number;
  status: GuideStatus;
  available: boolean;
}

export const SEED_USERS: PlatformUser[] = [
  {
    id: "U001",
    name: "Sarah Johnson",
    email: "sarah@tourist.com",
    role: "Tourist",
    status: "Active",
    joined: "2025-11-12",
    trips: 3,
    reviews: 2,
  },
  {
    id: "U002",
    name: "Mark Thompson",
    email: "mark@tourist.com",
    role: "Tourist",
    status: "Active",
    joined: "2026-01-05",
    trips: 1,
    reviews: 0,
  },
  {
    id: "U003",
    name: "Yuki Harada",
    email: "yuki@tourist.com",
    role: "Tourist",
    status: "Active",
    joined: "2025-09-20",
    trips: 2,
    reviews: 1,
  },
  {
    id: "U004",
    name: "Emily Chen",
    email: "emily@tourist.com",
    role: "Tourist",
    status: "Active",
    joined: "2026-02-14",
    trips: 1,
    reviews: 1,
  },
  {
    id: "U005",
    name: "Blocked User",
    email: "blocked@user.com",
    role: "Tourist",
    status: "Suspended",
    joined: "2025-06-01",
    trips: 0,
    reviews: 0,
  },
  {
    id: "A001",
    name: "Admin Kathmandu",
    email: "admin@ktm.com",
    role: "Admin",
    status: "Active",
    joined: "2024-01-10",
    trips: 0,
    reviews: 0,
  },
];

export const SEED_GUIDES: GuideRecord[] = [
  {
    id: 1,
    name: "Pemba Sherpa",
    email: "pemba@guide.com",
    location: "Namche Bazar",
    experience: "12 years",
    languages: ["English", "Nepali", "Tibetan"],
    rating: 4.9,
    reviews: 245,
    trips: 380,
    status: "Active",
    available: true,
  },
  {
    id: 2,
    name: "Sita Gurung",
    email: "sita@guide.com",
    location: "Pokhara",
    experience: "8 years",
    languages: ["English", "Nepali"],
    rating: 4.8,
    reviews: 128,
    trips: 210,
    status: "Active",
    available: true,
  },
  {
    id: 3,
    name: "Dorje Tamang",
    email: "dorje@guide.com",
    location: "Kathmandu",
    experience: "5 years",
    languages: ["English", "Nepali", "Hindi"],
    rating: 4.6,
    reviews: 64,
    trips: 95,
    status: "Pending",
    available: false,
  },
  {
    id: 4,
    name: "Ang Sherpa",
    email: "ang@guide.com",
    location: "Lukla",
    experience: "15 years",
    languages: ["English", "Nepali", "Sherpa"],
    rating: 4.9,
    reviews: 310,
    trips: 420,
    status: "Active",
    available: true,
  },
];

export const SEED_DESTINATIONS: PlatformDestination[] = [
  {
    id: 1,
    title: "Everest Base Camp",
    location: "Solukhumbu, Koshi Province",
    category: "Trekking",
    description:
      "The Everest Base Camp trek is the ultimate adventure for mountain lovers. Follow the footsteps of legendary mountaineers through the Khumbu region.",
    price: 1200,
    altitude: "5,364m",
    bestSeason: "Mar-May, Sep-Nov",
    status: "Active",
    featured: true,
    gallery: [],
    rating: 4.9,
    reviews: 2847,
  },
  {
    id: 2,
    title: "Annapurna Circuit",
    location: "Annapurna Region",
    category: "Trekking",
    description:
      "Circle the Annapurna massif through varied landscapes, from subtropical valleys to high alpine passes.",
    price: 950,
    altitude: "5,416m",
    bestSeason: "Mar-May, Oct-Nov",
    status: "Active",
    featured: true,
    gallery: [],
    rating: 4.8,
    reviews: 1920,
  },
  {
    id: 3,
    title: "Chitwan National Park",
    location: "Chitwan, Bagmati",
    category: "Wildlife",
    description:
      "Jungle safari experience with one-horned rhinos, tigers, and river canoe rides.",
    price: 320,
    altitude: "150m",
    bestSeason: "Oct-Mar",
    status: "Active",
    featured: false,
    gallery: [],
    rating: 4.7,
    reviews: 1104,
  },
  {
    id: 4,
    title: "Lumbini",
    location: "Rupandehi, Lumbini Province",
    category: "Religious",
    description:
      "Birthplace of Lord Buddha — peaceful monasteries and international peace zones.",
    price: 180,
    altitude: "150m",
    bestSeason: "Year-round",
    status: "Active",
    featured: false,
    gallery: [],
    rating: 4.6,
    reviews: 860,
  },
];

export const SEED_TRIPS: PlatformTrip[] = [
  {
    id: 1,
    title: "EBC Classic Trek",
    destinationId: 1,
    destination: "Everest Base Camp",
    guideId: 1,
    guideName: "Pemba Sherpa",
    startDate: "2026-04-05",
    endDate: "2026-04-18",
    duration: "14 days",
    capacity: 12,
    booked: 8,
    price: 1200,
    status: "Published",
  },
  {
    id: 2,
    title: "Annapurna Circuit Adventure",
    destinationId: 2,
    destination: "Annapurna Circuit",
    guideId: 4,
    guideName: "Ang Sherpa",
    startDate: "2026-05-10",
    endDate: "2026-05-22",
    duration: "12 days",
    capacity: 12,
    booked: 7,
    price: 950,
    status: "Published",
  },
  {
    id: 3,
    title: "Chitwan Safari Weekend",
    destinationId: 3,
    destination: "Chitwan National Park",
    guideId: 2,
    guideName: "Sita Gurung",
    startDate: "2026-03-20",
    endDate: "2026-03-23",
    duration: "3 days",
    capacity: 20,
    booked: 15,
    price: 320,
    status: "Completed",
  },
  {
    id: 4,
    title: "Lumbini Heritage Tour",
    destinationId: 4,
    destination: "Lumbini",
    guideId: null,
    guideName: "Unassigned",
    startDate: "2026-06-01",
    endDate: "2026-06-03",
    duration: "3 days",
    capacity: 15,
    booked: 0,
    price: 180,
    status: "Draft",
  },
];

export const SEED_BOOKINGS: PlatformBooking[] = [
  {
    id: "B001",
    tourist: "Sarah Johnson",
    trip: "EBC Classic Trek",
    guide: "Pemba Sherpa",
    date: "2026-03-28",
    amount: "$1,200",
    status: "Approved",
    payment: "Paid",
  },
  {
    id: "B002",
    tourist: "Mark Thompson",
    trip: "Annapurna Circuit Adventure",
    guide: "Ang Sherpa",
    date: "2026-03-25",
    amount: "$950",
    status: "Pending",
    payment: "Unpaid",
  },
  {
    id: "B003",
    tourist: "Yuki Harada",
    trip: "Chitwan Safari Weekend",
    guide: "Sita Gurung",
    date: "2026-03-10",
    amount: "$320",
    status: "Completed",
    payment: "Paid",
  },
  {
    id: "B004",
    tourist: "Emily Chen",
    trip: "EBC Classic Trek",
    guide: "Pemba Sherpa",
    date: "2026-03-22",
    amount: "$1,200",
    status: "Pending",
    payment: "Paid",
  },
  {
    id: "B005",
    tourist: "James Wilson",
    trip: "Annapurna Circuit Adventure",
    guide: "Ang Sherpa",
    date: "2026-02-18",
    amount: "$950",
    status: "Cancelled",
    payment: "Refunded",
  },
];

export const SEED_REVIEWS: PlatformReview[] = [
  {
    id: 1,
    author: "Sarah Johnson",
    target: "Pemba Sherpa",
    targetType: "Guide",
    rating: 5,
    text: "Outstanding guide — safe, knowledgeable, and warm.",
    date: "Mar 18, 2026",
    visibility: "Visible",
  },
  {
    id: 2,
    author: "Yuki Harada",
    target: "Chitwan Safari Weekend",
    targetType: "Trip",
    rating: 5,
    text: "Well organized safari with great wildlife sightings.",
    date: "Mar 24, 2026",
    visibility: "Visible",
  },
  {
    id: 3,
    author: "Mark Thompson",
    target: "Everest Base Camp",
    targetType: "Destination",
    rating: 4,
    text: "Breathtaking views. Tough but worth every step.",
    date: "Feb 12, 2026",
    visibility: "Visible",
  },
  {
    id: 4,
    author: "Spam Account",
    target: "Pemba Sherpa",
    targetType: "Guide",
    rating: 1,
    text: "Inappropriate review content.",
    date: "Mar 01, 2026",
    visibility: "Hidden",
  },
];

export const SEED_NOTIFICATIONS: PlatformNotification[] = [
  {
    id: 1,
    title: "Spring trek season open",
    body: "Book early for April–May Everest and Annapurna departures.",
    audience: "All",
    createdAt: "2026-03-01",
    sent: true,
  },
  {
    id: 2,
    title: "Guide verification reminder",
    body: "Please upload updated license documents before April.",
    audience: "Guides",
    createdAt: "2026-03-10",
    sent: true,
  },
  {
    id: 3,
    title: "New payment options",
    body: "eSewa and Khalti now accepted for all bookings.",
    audience: "Tourists",
    createdAt: "2026-03-20",
    sent: false,
  },
];

export const ADMIN_STORAGE_KEY = "nepal-yatra-admin-platform";
