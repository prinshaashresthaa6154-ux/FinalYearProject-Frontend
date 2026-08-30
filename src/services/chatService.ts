import api, { API_BASE_URL } from "../api/axios";
import type { ApiResponse, PageResponse } from "../types/api";
import type { Booking } from "./bookingService";
import { tripService } from "./tripService";

export type ChatParticipant = { id: number; name: string; email?: string; profileImage?: string | null };
export type Conversation = { id: number; user: ChatParticipant; admin?: ChatParticipant | null; guide?: ChatParticipant | null; trip?: { id: number; title: string; slug: string } | null; createdAt: string; updatedAt: string };
export type MessageStatus = "SENDING" | "SENT" | "READ" | "FAILED";
export type ConversationMessage = { id: number | string; conversationId: number; sender: ChatParticipant; senderId?: number; receiverId?: number; content: string; messageType: "TEXT" | "IMAGE" | "DOCUMENT" | "SYSTEM"; attachmentName?: string | null; attachmentContentType?: string | null; attachmentSize?: number | null; attachmentDownloadUrl?: string | null; sentAt: string; readAt?: string | null; status: MessageStatus; optimistic?: boolean };
export type ConversationCreateInput = { userId: number; adminId?: number | null; guideId?: number | null; tripId?: number | null };
export type DirectChatMessage = { id: number; sender: ChatParticipant & { fullName?: string; email?: string }; recipient: ChatParticipant & { fullName?: string; email?: string }; content: string; sentAt: string; readAt?: string | null; status: MessageStatus };
export type OnlineUser = { id: number; fullName: string; email: string; profileImage?: string | null };
export type ChatMessageInput = { recipientId?: number | null; conversationId: number; content: string };
export type TypingInput = { recipientId: number; typing: boolean };
export type ReadInput = { messageId: number };
export const CHAT_ENDPOINTS = {
  conversations: "/api/chat/conversations",
  conversationMessages: (id: number) => `/api/chat/conversations/${id}/messages`,
  unreadCount: "/api/chat/unread-count",
  onlineUsers: "/api/chat/online-users",
} as const;
export const chatSocketUrl =
  import.meta.env.VITE_WEBSOCKET_URL ??
  `${API_BASE_URL.replace(/^http/, "ws")}/ws-native`;
export const nativeChatSocketUrl = `${API_BASE_URL.replace(/^http/, "ws")}/ws-native`;
export const stompChatSocketUrl = `${API_BASE_URL.replace(/^http/, "ws")}/ws`;

export const validateConversationInput = (input: ConversationCreateInput) => {
  if (!Number.isInteger(input.userId) || input.userId <= 0) return "A valid user ID is required.";
  const providers = [input.adminId, input.guideId].filter((value) => value != null);
  if (providers.length !== 1) return "Select exactly one admin or guide provider.";
  if (input.adminId != null && (!Number.isInteger(input.adminId) || input.adminId <= 0)) return "A valid admin ID is required.";
  if (input.guideId != null && (!Number.isInteger(input.guideId) || input.guideId <= 0)) return "A valid guide ID is required.";
  if (input.tripId != null && (!Number.isInteger(input.tripId) || input.tripId <= 0)) return "Trip ID must be positive.";
  return "";
};

export const validateChatMessage = (input: ChatMessageInput) => {
  if (input.recipientId != null && (!Number.isInteger(input.recipientId) || input.recipientId <= 0)) return "Recipient ID must be positive.";
  if (!Number.isInteger(input.conversationId) || input.conversationId <= 0) return "Conversation ID must be positive.";
  if (!input.content.trim()) return "Message content is required.";
  if (input.content.length > 4000) return "Message content must be 4000 characters or fewer.";
  return "";
};

export const chatService = {
  conversations(page = 0, size = 20) { return api.get<ApiResponse<PageResponse<Conversation>>>(CHAT_ENDPOINTS.conversations, { params: { page, size } }); },
  conversation(id: number) { return api.get<ApiResponse<Conversation>>(`${CHAT_ENDPOINTS.conversations}/${id}`); },
  createConversation(input: ConversationCreateInput) { const error = validateConversationInput(input); if (error) throw new Error(error); return api.post<ApiResponse<Conversation>>(CHAT_ENDPOINTS.conversations, input); },
  conversationMessages(id: number, page = 0, size = 50) { return api.get<ApiResponse<PageResponse<ConversationMessage>>>(CHAT_ENDPOINTS.conversationMessages(id), { params: { page, size } }); },
  messages(id: number, page = 0, size = 50) { return this.conversationMessages(id, page, size); },
  markRead(id: number) { return api.post<ApiResponse<number>>(`${CHAT_ENDPOINTS.conversations}/${id}/read`); },
  sendAttachment(id: number, file: File) {
    const form = new FormData();
    form.append("file", file);
    return api.post<ApiResponse<ConversationMessage>>(`${CHAT_ENDPOINTS.conversations}/${id}/attachments`, form);
  },
  attachment(messageId: number) {
    return api.get<Blob>(`/api/chat/messages/${messageId}/attachment`, { responseType: "blob" });
  },
  history(otherUserId: number, page = 0, size = 50) { return api.get<ApiResponse<PageResponse<DirectChatMessage>>>(`/api/chat/history/${otherUserId}`, { params: { page, size } }); },
  directHistory(otherUserId: number, page = 0, size = 50) { return api.get<ApiResponse<PageResponse<DirectChatMessage>>>(`/api/chat/messages/with/${otherUserId}`, { params: { page, size } }); },
  inbox(page = 0, size = 100) { return api.get<ApiResponse<PageResponse<DirectChatMessage>>>("/api/chat/messages/inbox", { params: { page, size } }); },
  markMessageRead(messageId: number) { return api.post<ApiResponse<DirectChatMessage>>(`/api/chat/messages/${messageId}/read`); },
  unreadCount() { return api.get<ApiResponse<number>>(CHAT_ENDPOINTS.unreadCount); },
  onlineUsers() { return api.get<ApiResponse<OnlineUser[]>>(CHAT_ENDPOINTS.onlineUsers); },
};

/** Return the existing trip conversation or create it after a paid booking. */
export async function getOrCreateBookingConversation(booking: Pick<Booking, "bookingId" | "user" | "travelPackage">) {
  let adminId = booking.travelPackage.adminId ?? booking.travelPackage.provider?.adminId;
  if (!adminId) {
    // Older booking responses omit adminId; the public trip response still exposes it.
    const trip = (await tripService.publicById(booking.travelPackage.id)).data.data;
    adminId = trip?.provider?.adminId;
  }
  if (!adminId) throw new Error("This trip is not connected to an administrator yet.");

  const conversations = (await chatService.conversations(0, 100)).data.data?.content ?? [];
  const existing = conversations.find(
    (conversation) =>
      conversation.trip?.id === booking.travelPackage.id &&
      conversation.user.id === booking.user.id &&
      conversation.admin?.id === adminId,
  );
  if (existing) return existing;

  const response = await chatService.createConversation({
    userId: booking.user.id,
    adminId,
    tripId: booking.travelPackage.id,
  });
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "The booking conversation could not be created.");
  }
  return response.data.data;
}
