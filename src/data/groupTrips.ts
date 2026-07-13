export interface GroupTripMember {
  id: string;
  name: string;
  initials: string;
  role: "Guide" | "Tourist";
  online: boolean;
  isCurrentUser?: boolean;
}

export interface GroupChatMessage {
  id: string;
  type: "system" | "message" | "announcement";
  senderId?: string;
  senderName?: string;
  isGuide?: boolean;
  text: string;
  time: string;
  isOwn?: boolean;
}

export interface GroupTrip {
  id: number;
  title: string;
  initials: string;
  location: string;
  description: string;
  date: string;
  duration: string;
  guide: string;
  guideId: number;
  tags: string[];
  joined: number;
  capacity: number;
  difficulty: string;
  price: number;
  spotsLeft: number;
}

export const GROUP_TRIPS: GroupTrip[] = [
  {
    id: 1,
    title: "Everest Base Camp Group Trek",
    initials: "EB",
    location: "Everest Region",
    description:
      "Join fellow trekkers on the iconic journey to Everest Base Camp with an expert Sherpa guide.",
    date: "April 5–18, 2026",
    duration: "14 days",
    guide: "Pemba Sherpa",
    guideId: 1,
    tags: ["Namche Bazaar", "Tengboche Monastery"],
    joined: 8,
    capacity: 12,
    difficulty: "Moderate",
    price: 1100,
    spotsLeft: 4,
  },
  {
    id: 2,
    title: "Annapurna Circuit Group Tour",
    initials: "AC",
    location: "Annapurna Region",
    description:
      "Circle the Annapurna massif with a diverse group of adventurers through varied landscapes.",
    date: "May 10–22, 2026",
    duration: "12 days",
    guide: "Ang Sherpa",
    guideId: 6,
    tags: ["Thorong La Pass", "Manang Valley"],
    joined: 7,
    capacity: 12,
    difficulty: "Moderate",
    price: 950,
    spotsLeft: 5,
  },
  {
    id: 3,
    title: "Kathmandu Cultural Walk",
    initials: "KC",
    location: "Kathmandu Valley",
    description:
      "Explore UNESCO heritage sites and hidden alleys of the Kathmandu Valley with a local historian.",
    date: "March 15–17, 2026",
    duration: "3 days",
    guide: "Sita Gurung",
    guideId: 2,
    tags: ["Pashupatinath", "Patan Durbar Square"],
    joined: 8,
    capacity: 12,
    difficulty: "Easy",
    price: 280,
    spotsLeft: 4,
  },
  {
    id: 4,
    title: "Chitwan Safari Group",
    initials: "CS",
    location: "Chitwan National Park",
    description:
      "Spot rhinos, elephants, and exotic birds on a shared jungle safari adventure.",
    date: "June 1–5, 2026",
    duration: "4 days",
    guide: "Maya Karki",
    guideId: 5,
    tags: ["Jungle Safari", "Canoe Ride"],
    joined: 7,
    capacity: 12,
    difficulty: "Easy",
    price: 420,
    spotsLeft: 5,
  },
];

export function getGroupTripById(id: number): GroupTrip | undefined {
  return GROUP_TRIPS.find((trip) => trip.id === id);
}

export function getGroupTripByGuideId(guideId: number): GroupTrip | undefined {
  return GROUP_TRIPS.find((trip) => trip.guideId === guideId);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function createDefaultMembers(trip: GroupTrip): GroupTripMember[] {
  const touristsByTrip: Record<number, { name: string; online: boolean }[]> = {
    1: [
      { name: "Michael Johnson", online: true },
      { name: "Sarah Lee", online: true },
      { name: "Emma Wilson", online: false },
      { name: "David Brown", online: true },
      { name: "Lisa Wang", online: true },
      { name: "James Taylor", online: false },
      { name: "Anna Martinez", online: true },
    ],
    2: [
      { name: "Robert Chen", online: true },
      { name: "Helen Park", online: false },
      { name: "Tom Anderson", online: true },
      { name: "Nina Patel", online: true },
      { name: "Chris Evans", online: false },
      { name: "Yuki Tanaka", online: true },
    ],
    3: [
      { name: "Laura Smith", online: true },
      { name: "Rajesh Kumar", online: true },
      { name: "Sophie Martin", online: false },
      { name: "Kevin O'Brien", online: true },
      { name: "Priya Sharma", online: true },
      { name: "Mark Hughes", online: false },
      { name: "Julia Rossi", online: true },
    ],
    4: [
      { name: "Ben Carter", online: true },
      { name: "Olivia Green", online: false },
      { name: "Sam Wilson", online: true },
      { name: "Hannah Kim", online: true },
      { name: "Daniel Lee", online: false },
      { name: "Grace Miller", online: true },
    ],
  };

  const guide: GroupTripMember = {
    id: `guide-${trip.guideId}`,
    name: trip.guide,
    initials: getInitials(trip.guide),
    role: "Guide",
    online: true,
  };

  const tourists = (touristsByTrip[trip.id] ?? []).map((t, i) => ({
    id: `tourist-${trip.id}-${i}`,
    name: t.name,
    initials: getInitials(t.name),
    role: "Tourist" as const,
    online: t.online,
  }));

  return [guide, ...tourists];
}

export function createDefaultMessages(trip: GroupTrip): GroupChatMessage[] {
  const welcomeByTrip: Record<number, string> = {
    1: "Welcome everyone! Looking forward to trekking with you all. Feel free to ask any questions here.",
    2: "Welcome to the Annapurna Circuit group! I'll share packing tips and route updates here.",
    3: "Welcome to our cultural walk! Ask me anything about Kathmandu Valley heritage sites.",
    4: "Welcome to the Chitwan Safari group! I'll post wildlife spotting tips and safari schedules here.",
  };

  const firstTouristReplies: Record<number, string> = {
    1: "Can't wait for this trek! 🏔️",
    2: "So excited for the Annapurna Circuit!",
    3: "Looking forward to exploring the heritage sites!",
    4: "Can't wait to see the wildlife!",
  };

  const members = createDefaultMembers(trip);
  const firstTourist = members.find((m) => m.role === "Tourist");

  return [
    {
      id: `system-${trip.id}`,
      type: "system",
      text: `Group chat created for ${trip.title}. • Mar 20`,
      time: "",
    },
    {
      id: `msg-${trip.id}-1`,
      type: "message",
      senderId: `guide-${trip.guideId}`,
      senderName: trip.guide,
      isGuide: true,
      text: welcomeByTrip[trip.id] ?? "Welcome to the group chat!",
      time: "10:30 AM",
    },
    ...(firstTourist
      ? [
          {
            id: `msg-${trip.id}-2`,
            type: "message" as const,
            senderId: firstTourist.id,
            senderName: firstTourist.name,
            text: firstTouristReplies[trip.id] ?? "Excited to be here!",
            time: "10:45 AM",
          },
        ]
      : []),
    {
      id: `msg-${trip.id}-3`,
      type: "announcement",
      senderId: `guide-${trip.guideId}`,
      senderName: trip.guide,
      isGuide: true,
      text: "Reminder: Please upload your travel insurance documents before the trip start date.",
      time: "11:00 AM",
    },
  ];
}

export function createMemberFromBooking(
  fullName: string,
  tripId: number,
): GroupTripMember {
  return {
    id: `booked-${tripId}-${fullName.replace(/\s+/g, "-").toLowerCase()}`,
    name: fullName,
    initials: getInitials(fullName),
    role: "Tourist",
    online: true,
    isCurrentUser: true,
  };
}

export function createCurrentUserMember(): GroupTripMember {
  return {
    id: "current-user",
    name: "You",
    initials: "ME",
    role: "Tourist",
    online: true,
    isCurrentUser: true,
  };
}
