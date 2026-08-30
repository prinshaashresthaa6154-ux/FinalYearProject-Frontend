/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  GROUP_TRIPS,
  createCurrentUserMember,
  createDefaultMembers,
  createDefaultMessages,
  createMemberFromBooking,
  getGroupTripByGuideId,
  type GroupChatMessage,
  type GroupTripMember,
} from "../data/groupTrips";

interface GroupTripContextValue {
  joinedTripIds: number[];
  membersByTrip: Record<number, GroupTripMember[]>;
  messagesByTrip: Record<number, GroupChatMessage[]>;
  isJoined: (tripId: number) => boolean;
  joinTrip: (tripId: number) => void;
  addMemberFromBooking: (guideId: number, fullName: string) => number | null;
  sendMessage: (tripId: number, text: string) => void;
}

const GroupTripContext = createContext<GroupTripContextValue | null>(null);

function buildInitialState() {
  const membersByTrip: Record<number, GroupTripMember[]> = {};
  const messagesByTrip: Record<number, GroupChatMessage[]> = {};

  GROUP_TRIPS.forEach((trip) => {
    membersByTrip[trip.id] = createDefaultMembers(trip);
    messagesByTrip[trip.id] = createDefaultMessages(trip);
  });

  return { membersByTrip, messagesByTrip };
}

export function GroupTripProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(() => buildInitialState(), []);
  const [joinedTripIds, setJoinedTripIds] = useState<number[]>([]);
  const [membersByTrip, setMembersByTrip] = useState(initial.membersByTrip);
  const [messagesByTrip, setMessagesByTrip] = useState(initial.messagesByTrip);

  const isJoined = useCallback(
    (tripId: number) => joinedTripIds.includes(tripId),
    [joinedTripIds],
  );

  const addMemberToTrip = useCallback(
    (tripId: number, member: GroupTripMember) => {
      setMembersByTrip((prev) => {
        const existing = prev[tripId] ?? [];
        const alreadyThere = existing.some(
          (m) =>
            m.id === member.id ||
            (member.isCurrentUser && m.isCurrentUser) ||
            m.name === member.name,
        );
        if (alreadyThere) {
          return prev;
        }
        return { ...prev, [tripId]: [...existing, member] };
      });
    },
    [],
  );

  const joinTrip = useCallback(
    (tripId: number) => {
      setJoinedTripIds((prev) =>
        prev.includes(tripId) ? prev : [...prev, tripId],
      );
      addMemberToTrip(tripId, createCurrentUserMember());
    },
    [addMemberToTrip],
  );

  const addMemberFromBooking = useCallback(
    (guideId: number, fullName: string) => {
      const trip = getGroupTripByGuideId(guideId);
      if (!trip || !fullName.trim()) return null;

      const member = createMemberFromBooking(fullName.trim(), trip.id);
      addMemberToTrip(trip.id, member);
      setJoinedTripIds((prev) =>
        prev.includes(trip.id) ? prev : [...prev, trip.id],
      );

      setMessagesByTrip((prev) => ({
        ...prev,
        [trip.id]: [
          ...(prev[trip.id] ?? []),
          {
            id: `join-${Date.now()}`,
            type: "system",
            text: `${fullName} joined the group as a member. • ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
            time: "",
          },
        ],
      }));

      return trip.id;
    },
    [addMemberToTrip],
  );

  const sendMessage = useCallback((tripId: number, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const time = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    setMessagesByTrip((prev) => ({
      ...prev,
      [tripId]: [
        ...(prev[tripId] ?? []),
        {
          id: `msg-${Date.now()}`,
          type: "message",
          senderId: "current-user",
          senderName: "You",
          text: trimmed,
          time,
          isOwn: true,
        },
      ],
    }));
  }, []);

  return (
    <GroupTripContext.Provider
      value={{
        joinedTripIds,
        membersByTrip,
        messagesByTrip,
        isJoined,
        joinTrip,
        addMemberFromBooking,
        sendMessage,
      }}
    >
      {children}
    </GroupTripContext.Provider>
  );
}
export function useGroupTrip() {
  const context = useContext(GroupTripContext);
  if (!context) {
    throw new Error("useGroupTrip must be used within GroupTripProvider");
  }
  return context;
}
