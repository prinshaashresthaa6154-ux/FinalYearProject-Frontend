import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCheck,
  LoaderCircle,
  MessageSquare,
  FileText,
  Paperclip,
  RefreshCw,
  Send,
  X,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { getApiError } from "../api/axios";
import { EmptyState, ErrorState } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useSearchParams } from "react-router";
import {
  chatService,
  chatSocketUrl,
  validateChatMessage,
  type Conversation,
  type ConversationMessage,
  type DirectChatMessage,
  type ChatParticipant,
} from "../services/chatService";
import { mediaUrl } from "../services/destinationService";

type ConnectionState = "connecting" | "connected" | "disconnected";
type ConversationSummary = { latest?: ConversationMessage; unread: number };
type ReadReceipt = { messageId: number; readerId: number; readAt: string };
type TypingEvent = { senderId?: number; userId?: number; typing: boolean };

export default function MessagesPage() {
  const { token, userDTO } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedConversationId = Number(searchParams.get("conversationId") || 0);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<
    Record<number, ConversationMessage[]>
  >({});
  const [summaries, setSummaries] = useState<
    Record<number, ConversationSummary>
  >({});
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");
  const [conversationError, setConversationError] = useState("");
  const [connection, setConnection] = useState<ConnectionState>("disconnected");
  const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(new Set());
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [typingUserIds, setTypingUserIds] = useState<Set<number>>(new Set());
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<number, StompSubscription>>(new Map());
  const receivedMessageIdsRef = useRef<Set<string>>(new Set());
  const activeIdRef = useRef<number | null>(null);
  const conversationsRef = useRef<Conversation[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const attachmentRef = useRef<HTMLInputElement>(null);
  const isProvider = ["ADMIN", "GUIDE", "FREELANCE_GUIDE"].includes(
    userDTO?.role?.toUpperCase().replaceAll("-", "_") ?? "",
  );
  activeIdRef.current = activeId;
  conversationsRef.current = conversations;
  const receive = useCallback(
    async (rawIncoming: ConversationMessage) => {
      const incoming = normalizeIncomingMessage(rawIncoming, userDTO?.id);
      if (!incoming) return;
      if (!conversationsRef.current.some((conversation) => conversation.id === incoming.conversationId)) {
        try {
          const response = await chatService.conversation(incoming.conversationId);
          const conversation = response.data.data;
          if (conversation) {
            setConversations((current) =>
              current.some((item) => item.id === conversation.id)
                ? current
                : [conversation, ...current],
            );
            conversationsRef.current = [conversation, ...conversationsRef.current];
          }
        } catch {
          // Ignore events for conversations the current account cannot access.
        }
      }
      const messageKey = `${incoming.conversationId}:${incoming.id}`;
      if (receivedMessageIdsRef.current.has(messageKey)) return;
      receivedMessageIdsRef.current.add(messageKey);
      setMessages((current) => {
        const list = current[incoming.conversationId] ?? [];
        const withoutOptimistic = list.filter(
          (message) =>
            !(
              message.optimistic &&
              message.content === incoming.content &&
              message.sender.id === incoming.sender.id
            ),
        );
        return {
          ...current,
          [incoming.conversationId]: [
            ...withoutOptimistic.filter(
              (message) => message.id !== incoming.id,
            ),
            incoming,
          ].sort(
            (a, b) =>
              new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
          ),
        };
      });
      setSummaries((current) => ({
        ...current,
        [incoming.conversationId]: {
          latest: incoming,
          unread:
            incoming.sender.id !== userDTO?.id &&
            activeIdRef.current !== incoming.conversationId
              ? (current[incoming.conversationId]?.unread ?? 0) + 1
              : current[incoming.conversationId]?.unread ?? 0,
        },
      }));
      if (
        incoming.sender.id !== userDTO?.id &&
        activeIdRef.current !== incoming.conversationId
      ) {
        setUnreadTotal((current) => current + 1);
      }
      if (
        activeIdRef.current === incoming.conversationId &&
        incoming.sender.id !== userDTO?.id
      ) {
        void chatService
          .markRead(incoming.conversationId)
          .then(() => chatService.unreadCount())
          .then((response) => setUnreadTotal(response.data.data ?? 0))
          .catch(() => {
            // The next inbox refresh reconciles a transient read failure.
          });
        const client = clientRef.current;
        if (client?.connected && typeof incoming.id === "number")
          client.publish({
            destination: "/app/chat.read",
            body: JSON.stringify({ messageId: incoming.id }),
          });
      }
    },
    [userDTO?.id],
  );
  const subscribeAll = useCallback(
    (client: Client, rows: Conversation[]) => {
      subscriptionsRef.current.forEach((subscription) =>
        subscription.unsubscribe(),
      );
      subscriptionsRef.current.clear();
      rows.filter((conversation) => conversation.id > 0).forEach((conversation) => {
        const subscription = client.subscribe(
          `/topic/conversation/${conversation.id}`,
          (frame: IMessage) => {
            try {
              receive(JSON.parse(frame.body) as ConversationMessage);
            } catch {
              // Ignore malformed broker frames without breaking the subscription.
            }
          },
        );
        subscriptionsRef.current.set(conversation.id, subscription);
      });
      const receipts = client.subscribe(
        "/user/queue/read-receipts",
        (frame: IMessage) => {
          const receipt = JSON.parse(frame.body) as ReadReceipt;
          setMessages((current) =>
            Object.fromEntries(
              Object.entries(current).map(([id, list]) => [
                id,
                list.map((message) =>
                  message.id === receipt.messageId
                    ? {
                        ...message,
                        status: "READ" as const,
                        readAt: receipt.readAt,
                      }
                    : message,
                ),
              ]),
            ),
          );
        },
      );
      subscriptionsRef.current.set(-1, receipts);
      const directMessages = client.subscribe(
        "/user/queue/messages",
        (frame: IMessage) => {
          try {
            receive(JSON.parse(frame.body) as ConversationMessage);
          } catch {
            // Ignore malformed broker frames without breaking the subscription.
          }
        },
      );
      subscriptionsRef.current.set(-4, directMessages);
      const typing = client.subscribe("/user/queue/typing", (frame: IMessage) => {
        const event = JSON.parse(frame.body) as TypingEvent;
        const userId = event.senderId ?? event.userId;
        if (!userId) return;
        setTypingUserIds((current) => {
          const next = new Set(current);
          if (event.typing) next.add(userId);
          else next.delete(userId);
          return next;
        });
      });
      subscriptionsRef.current.set(-3, typing);
      const presence = client.subscribe("/topic/online-users", (frame: IMessage) => {
        const users = JSON.parse(frame.body) as Array<{ id: number }>;
        setOnlineUserIds(new Set(users.map((user) => user.id)));
      });
      subscriptionsRef.current.set(-2, presence);
    },
    [receive],
  );
  const syncMessages = useCallback(async (rows: Conversation[]) => {
    const histories = await Promise.allSettled(
      rows.map((conversation) => conversation.id > 0
        ? chatService.conversationMessages(conversation.id)
        : chatService.directHistory(otherParticipant(conversation, userDTO?.id)?.id ?? 0)),
    );
    const historyByConversation = new Map<number, ConversationMessage[]>();
    const historyIds = new Set<string>();
    rows.forEach((conversation, index) => {
      const result = histories[index];
      if (result.status !== "fulfilled") return;
      const history = [...(result.value.data.data?.content ?? [])]
        .map((message) => normalizeIncomingMessage(message, userDTO?.id))
        .filter((message): message is ConversationMessage => message !== null);
      historyByConversation.set(conversation.id, history);
      history.forEach((message) => historyIds.add(`${conversation.id}:${message.id}`));
    });
    setMessages((current) => {
      const next = { ...current };
      rows.forEach((conversation) => {
        const combined = [...(historyByConversation.get(conversation.id) ?? []), ...(current[conversation.id] ?? [])];
        next[conversation.id] = deduplicateMessages(combined);
      });
      return next;
    });
    setSummaries((current) => {
      const next = { ...current };
      rows.forEach((conversation) => {
        const latest = current[conversation.id]?.latest;
        const list = deduplicateMessages([
          ...(historyByConversation.get(conversation.id) ?? []),
          ...(latest ? [latest] : []),
        ]);
        next[conversation.id] = {
          latest: list.at(-1),
          unread: list.filter((message) => message.sender.id !== userDTO?.id && message.status === "SENT").length,
        };
      });
      return next;
    });
    receivedMessageIdsRef.current = new Set([
      ...receivedMessageIdsRef.current,
      ...historyIds,
    ]);
    try {
      const unreadResponse = await chatService.unreadCount();
      setUnreadTotal(unreadResponse.data.data ?? 0);
    } catch {
      // Live delivery remains usable if unread reconciliation is unavailable.
    }
  }, [userDTO?.id]);
  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError("");
    setConversationError("");
    try {
      // The conversation list is required to render the active chat. Presence
      // and unread counts are auxiliary and must not hide an otherwise usable
      // conversation when either endpoint is temporarily unavailable.
      let rows: Conversation[] = [];
      let listError = "";
      try {
        const response = await chatService.conversations(0, 100);
        rows = response.data.data?.content ?? [];
      } catch (requestError) {
        listError = getApiError(requestError).message;
      }
      if (
        requestedConversationId > 0 &&
        !rows.some((item) => Number(item.id) === requestedConversationId)
      ) {
        try {
          const requested = (await chatService.conversation(requestedConversationId)).data.data;
          if (requested) rows = [requested, ...rows];
          else setConversationError(`Conversation ${requestedConversationId} was not found.`);
        } catch (requestError) {
          setConversationError(getApiError(requestError).message);
        }
      }
      if (rows.length === 0 && listError) setError(listError);
      if (isProvider) {
        try {
          const inbox = (await chatService.inbox()).data.data?.content ?? [];
          rows = mergeDirectInbox(rows, inbox, userDTO?.id);
        } catch {
          // Direct inbox is supplementary to conversation-based chat.
        }
      }
      setConversations(rows);
      setActiveId((current) => {
        const requested = rows.find(
          (item) => Number(item.id) === requestedConversationId,
        );
        if (requested) return requested.id;
        if (requestedConversationId > 0) return null;
        if (rows.some((item) => item.id === current)) return current;
        return rows[0]?.id ?? null;
      });
      const [onlineResult, unreadResult] = await Promise.allSettled([
        chatService.onlineUsers(),
        chatService.unreadCount(),
      ]);
      if (onlineResult.status === "fulfilled") {
        setOnlineUserIds(new Set((onlineResult.value.data.data ?? []).map((user) => user.id)));
      }
      if (unreadResult.status === "fulfilled") {
        setUnreadTotal(unreadResult.value.data.data ?? 0);
      }
      await syncMessages(rows);
      if (clientRef.current?.connected) subscribeAll(clientRef.current, rows);
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
    }
    }, [isProvider, requestedConversationId, subscribeAll, syncMessages, userDTO?.id]);
  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);
  useEffect(() => {
    if (!token) return;
    const client = new Client({
      brokerURL: chatSocketUrl,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setConnection("connected");
        subscribeAll(client, conversationsRef.current);
        void syncMessages(conversationsRef.current);
      },
      onWebSocketClose: () => setConnection("disconnected"),
      onStompError: () => setConnection("disconnected"),
      onWebSocketError: () => setConnection("disconnected"),
      beforeConnect: () => setConnection("connecting"),
    });
    clientRef.current = client;
    const subscriptions = subscriptionsRef.current;
    client.activate();
    return () => {
      subscriptions.forEach((subscription) =>
        subscription.unsubscribe(),
      );
      subscriptions.clear();
      void client.deactivate();
      clientRef.current = null;
    };
  }, [token, subscribeAll, syncMessages]);
  useEffect(() => {
    if (clientRef.current?.connected)
      subscribeAll(clientRef.current, conversations);
  }, [conversations, subscribeAll]);
  const selectConversation = async (id: number) => {
    setConversationError("");
    setActiveId(id);
    activeIdRef.current = id;
    setSummaries((current) => ({
      ...current,
      [id]: { ...current[id], unread: 0 },
    }));
    setHistoryLoading(true);
    try {
      const activeConversation = conversationsRef.current.find((item) => item.id === id);
      const directUserId = id < 0 ? otherParticipant(activeConversation!, userDTO?.id)?.id : null;
      const response = directUserId
        ? await chatService.directHistory(directUserId)
        : await chatService.conversationMessages(id);
      const history = (response.data.data?.content ?? [])
        .map((message) => normalizeIncomingMessage(message, userDTO?.id))
        .filter((message): message is ConversationMessage => message !== null);
      setMessages((current) => ({
        ...current,
        [id]: deduplicateMessages([...(current[id] ?? []), ...history]),
      }));
      history.forEach((message) => {
        receivedMessageIdsRef.current.add(`${id}:${message.id}`);
      });
      if (id < 0) {
        await Promise.all(
          history
            .filter((message) => message.sender.id !== userDTO?.id && typeof message.id === "number" && message.status === "SENT")
            .map((message) => chatService.markMessageRead(message.id as number)),
        );
      } else {
        await chatService.markRead(id);
      }
      const unreadResponse = await chatService.unreadCount();
      setUnreadTotal(unreadResponse.data.data ?? 0);
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setHistoryLoading(false);
    }
  };
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, messages]);
  const send = (event: FormEvent) => {
    event.preventDefault();
    if (attachment) {
      void sendAttachment();
      return;
    }
    const content = draft.trim();
    const client = clientRef.current;
    const activeConversation = conversationsRef.current.find((item) => item.id === activeId);
    if (!content) return;
    if (!activeId || !userDTO) {
      setError("This conversation is not available for messaging.");
      return;
    }
    if (!client?.connected) {
      setError("Chat is reconnecting. Your message is still here; try sending again in a moment.");
      return;
    }
    const recipient = activeConversation ? otherParticipant(activeConversation, userDTO.id) : null;
    const isDirect = activeId < 0;
    const validationError = isDirect
      ? validateDirectMessage({ recipientId: recipient?.id, content })
      : validateChatMessage({ recipientId: recipient?.id, conversationId: activeId, content });
    if (validationError) { setError(validationError); return; }
    setError("");
    const optimistic: ConversationMessage = {
      id: `pending-${Date.now()}`,
      conversationId: activeId,
      sender: {
        id: userDTO.id,
        name: userDTO.fullName || userDTO.email,
        profileImage: userDTO.profileImage,
      },
      content,
      messageType: "TEXT",
      sentAt: new Date().toISOString(),
      status: "SENDING",
      optimistic: true,
    };
    setMessages((current) => ({
      ...current,
      [activeId]: [...(current[activeId] ?? []), optimistic],
    }));
    setSummaries((current) => ({
      ...current,
      [activeId]: { latest: optimistic, unread: 0 },
    }));
    setDraft("");
    try {
      client.publish({
        destination: "/app/chat.send",
        // The server authorizes the conversation and resolves its recipient.
        body: JSON.stringify(isDirect ? { recipientId: recipient?.id, content } : { conversationId: activeId, content }),
      });
    } catch {
      setMessages((current) => ({
        ...current,
        [activeId]: (current[activeId] ?? []).map((message) =>
          message.id === optimistic.id
            ? { ...message, status: "FAILED" }
            : message,
        ),
      }));
    }
  };
  const chooseAttachment = (file?: File) => {
    if (!file) return;
    if (!["application/pdf", "image/jpeg"].includes(file.type)) {
      setError("Only PDF and JPEG attachments are supported.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Attachment must be 10 MB or smaller.");
      return;
    }
    setAttachment(file);
    setError("");
  };
  const sendAttachment = async () => {
    if (!activeId || !attachment || uploading) return;
    setUploading(true);
    setError("");
    try {
      const response = await chatService.sendAttachment(activeId, attachment);
      const sent = response.data.data;
      if (sent) receive(sent);
      setAttachment(null);
      if (attachmentRef.current) attachmentRef.current.value = "";
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setUploading(false);
    }
  };
  const publishTyping = (typing: boolean) => {
    const client = clientRef.current;
    const activeConversation = conversationsRef.current.find((item) => item.id === activeIdRef.current);
    const recipient = activeConversation ? otherParticipant(activeConversation, userDTO?.id) : null;
    if (!client?.connected || !recipient) return;
    client.publish({ destination: "/app/chat.typing", body: JSON.stringify({ recipientId: recipient.id, typing }) });
  };
  const changeDraft = (value: string) => {
    setDraft(value);
    publishTyping(Boolean(value.trim()));
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => publishTyping(false), 1200);
  };
  const retry = () => {
    if (clientRef.current?.active)
      void clientRef.current
        .deactivate()
        .then(() => clientRef.current?.activate());
    else clientRef.current?.activate();
  };
  const active = conversations.find(
    (conversation) => conversation.id === activeId,
  );
  const participant = active ? otherParticipant(active, userDTO?.id) : null;
  const activeMessages = activeId ? (messages[activeId] ?? []) : [];
  const showConversationPanel = Boolean(active || conversationError);
  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-[#f6f1e9] p-4 sm:p-6">
      <div className="mx-auto grid h-[calc(100dvh-7rem)] min-h-[560px] max-w-7xl overflow-hidden rounded-2xl border border-[#e5ddd6] bg-white shadow-sm lg:h-[calc(100dvh-8rem)] lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className={`min-h-0 overflow-y-auto border-r border-[#eae3dc] ${showConversationPanel ? "hidden lg:block" : "block"}`}>
          <div className="flex items-center justify-between border-b border-[#eae3dc] p-5">
            <div>
              <h1 className="font-display text-2xl font-bold">Messages</h1>
              <ConnectionBadge state={connection} />
            </div>
              <div className="flex items-center gap-2"><span className="text-xs font-semibold text-gray-500">{unreadTotal} unread</span>{connection === "disconnected" && (
              <button
                type="button"
                onClick={retry}
                title="Retry connection"
                className="rounded-lg p-2 text-[#a62922] hover:bg-red-50"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
             )}</div>
           </div>
          {error && !conversations.length ? (
            <div className="p-4">
              <ErrorState
                message={error}
                onRetry={() => void loadConversations()}
              />
            </div>
          ) : loading ? (
            <div className="grid min-h-48 place-items-center">
              <LoaderCircle className="h-7 w-7 animate-spin text-[#a62922]" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No conversations"
                description="Conversations with travelers and providers will appear here."
              />
            </div>
          ) : (
            <div className="overflow-y-auto">
              {conversations.map((conversation) => {
                const other = otherParticipant(conversation, userDTO?.id);
                const summary = summaries[conversation.id];
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => void selectConversation(conversation.id)}
                    className={`flex w-full gap-3 border-b border-[#f2ece7] p-4 text-left ${activeId === conversation.id ? "bg-[#fff7f5]" : "hover:bg-[#fcfaf8]"}`}
                  >
                    <Avatar participant={other} />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <b className="truncate text-sm">
                          {other?.name ?? "Conversation"}
                        </b>
                        <time className="shrink-0 text-[10px] text-gray-400">
                          {formatTime(
                            summary?.latest?.sentAt ?? conversation.updatedAt,
                          )}
                        </time>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] font-semibold text-[#a62922]">
                        {conversation.trip?.title ?? "General conversation"}
                      </p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="truncate text-xs text-gray-500">
                          {summary?.latest?.content ?? "No messages yet"}
                        </p>
                        {Boolean(summary?.unread) && (
                          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#a62922] px-1 text-[10px] font-bold text-white">
                            {summary.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>
        <section className={`min-h-0 flex-col overflow-hidden ${showConversationPanel ? "flex" : "hidden lg:flex"}`}>
          {!active ? (
            <div className="grid flex-1 place-items-center p-6 text-center text-gray-500">
              {conversationError ? (
                <div className="w-full max-w-lg">
                  <ErrorState
                    message={`Conversation ${requestedConversationId} could not be opened: ${conversationError}`}
                    onRetry={() => void loadConversations()}
                  />
                  {conversations.length > 0 && (
                    <>
                      <p className="mt-4 text-xs">
                        Select another conversation from the inbox to continue messaging.
                      </p>
                      <button
                        type="button"
                        onClick={() => setConversationError("")}
                        className="mt-4 rounded-lg border border-[#d8cec0] px-4 py-2 text-sm font-semibold text-[#6f6259] lg:hidden"
                      >
                        Back to conversations
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <MessageSquare className="mx-auto h-10 w-10" />
                  <p className="mt-3 text-sm">Select a conversation to begin.</p>
                </div>
              )}
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 border-b border-[#eae3dc] p-4">
                <button
                  type="button"
                  onClick={() => setActiveId(null)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#e2d8d0] text-[#6f6259] lg:hidden"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar participant={participant} />
                <div>
                  <h2 className="font-semibold">{participant?.name}</h2>
                  <p className="text-xs text-gray-500">
                     {participant && typingUserIds.has(participant.id)
                       ? "Typing..."
                       : participant && onlineUserIds.has(participant.id)
                         ? "Online"
                         : active.trip?.title ?? "General conversation"}
                  </p>
                </div>
              </header>
              <div className="min-h-0 flex-1 overflow-y-auto bg-[#fdfbf9] p-4 sm:p-6">
                {historyLoading ? (
                  <div className="grid h-full place-items-center">
                    <LoaderCircle className="h-6 w-6 animate-spin text-[#a62922]" />
                  </div>
                ) : activeMessages.length === 0 ? (
                  <div className="grid h-full place-items-center text-sm text-gray-500">
                    No messages yet. Start the conversation.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeMessages.map((message) => {
                      const own = message.sender.id === userDTO?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${own ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${own ? "rounded-br-sm bg-[#a62922] text-white" : "rounded-bl-sm border bg-white text-[#2c2520]"}`}
                          >
                             {message.messageType === "TEXT" ? (
                               <p className="whitespace-pre-wrap break-words">{message.content}</p>
                             ) : (
                               <AttachmentMessage message={message} own={own} />
                             )}
                            <div
                              className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${own ? "text-white/70" : "text-gray-400"}`}
                            >
                              <time>{formatTime(message.sentAt)}</time>
                              {own && <MessageState status={message.status} />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={endRef} />
                  </div>
                )}
              </div>
              <form onSubmit={send} className="shrink-0 border-t border-[#eae3dc] bg-white p-4">
                {error && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
                {attachment && (
                  <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-[#e2d8d0] bg-[#fcfaf8] px-3 py-2 text-sm">
                    <span className="inline-flex min-w-0 items-center gap-2"><FileText className="h-4 w-4 shrink-0 text-[#a62922]" /><span className="truncate">{attachment.name}</span><small className="shrink-0 text-gray-500">{formatSize(attachment.size)}</small></span>
                    <button type="button" onClick={() => setAttachment(null)} disabled={uploading} aria-label="Remove attachment"><X className="h-4 w-4" /></button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input ref={attachmentRef} type="file" accept="application/pdf,image/jpeg,.pdf,.jpg,.jpeg" className="hidden" onChange={(event) => chooseAttachment(event.target.files?.[0])} />
                  <button type="button" onClick={() => attachmentRef.current?.click()} disabled={uploading} title="Attach PDF or JPEG" className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[#d8cec0] text-[#a62922] disabled:opacity-50"><Paperclip className="h-5 w-5" /></button>
                  <input
                    value={draft}
                    onChange={(event) => changeDraft(event.target.value)}
                    disabled={Boolean(attachment) || uploading}
                    maxLength={4000}
                    placeholder="Type a message..."
                    aria-label="Message"
                    className="min-w-0 flex-1 rounded-xl border border-[#d8cec0] bg-[#fcfaf8] px-4 py-3 text-sm outline-none focus:border-[#a62922] disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={(!draft.trim() && !attachment) || uploading}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#a62922] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                     {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                     <span className="hidden sm:inline">{uploading ? "Sending..." : "Send"}</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
function otherParticipant(conversation: Conversation, currentId?: number) {
  return (
    [conversation.user, conversation.admin, conversation.guide].find(
      (participant) => participant && participant.id !== currentId,
    ) ??
    conversation.admin ??
    conversation.guide ??
    conversation.user
  );
}

function normalizeIncomingMessage(
  message: ConversationMessage | DirectChatMessage | null | undefined,
  currentUserId?: number,
): ConversationMessage | null {
  if (!message || !message.sender) return null;
  if (!("conversationId" in message) || message.conversationId == null) {
    const direct = message as DirectChatMessage;
    if (!direct || direct.id == null || !direct.sender || !direct.recipient) return null;
    const sender = normalizeParticipant(direct.sender);
    const recipient = normalizeParticipant(direct.recipient);
    if (!sender || !recipient || !currentUserId) return null;
    return {
      id: direct.id,
      conversationId: -(sender.id === currentUserId ? recipient.id : sender.id),
      sender,
      senderId: sender.id,
      receiverId: recipient.id,
      content: direct.content,
      messageType: "TEXT",
      sentAt: direct.sentAt,
      readAt: direct.readAt,
      status: direct.status,
    };
  }
  const conversationId = Number(message.conversationId);
  if (!Number.isInteger(conversationId) || conversationId <= 0) return null;
  const senderId = Number(message.sender.id ?? message.senderId);
  if (!Number.isInteger(senderId) || senderId <= 0) return null;
  return {
    ...(message as ConversationMessage),
    id: typeof message.id === "string" && /^\d+$/.test(message.id) ? Number(message.id) : message.id,
    conversationId,
    sender: { ...message.sender, id: senderId },
    senderId,
    receiverId: message.receiverId == null ? undefined : Number(message.receiverId),
  };
}

function normalizeParticipant(
  participant: (ChatParticipant & { fullName?: string }) | null | undefined,
) {
  if (!participant || !Number.isInteger(Number(participant.id))) return null;
  return {
    id: Number(participant.id),
    name: participant.name || participant.fullName || participant.email || "User",
    email: participant.email,
    profileImage: participant.profileImage,
  };
}

function mergeDirectInbox(
  rows: Conversation[],
  inbox: DirectChatMessage[],
  currentUserId?: number,
) {
  const directRows = new Map<number, Conversation>();
  inbox.forEach((raw) => {
    const message = normalizeIncomingMessage(raw, currentUserId);
    if (!message) return;
    const other = message.sender.id === currentUserId ? raw.recipient : raw.sender;
    const participant = normalizeParticipant(other);
    if (!participant) return;
    directRows.set(message.conversationId, {
      id: message.conversationId,
      user: currentUserId === message.sender.id ? participant : participant,
      admin: null,
      guide: null,
      trip: null,
      createdAt: message.sentAt,
      updatedAt: message.sentAt,
    });
  });
  return [...rows, ...[...directRows.values()].filter((row) => !rows.some((item) => item.id === row.id))];
}

function validateDirectMessage(input: { recipientId?: number; content: string }) {
  if (!Number.isInteger(input.recipientId) || (input.recipientId ?? 0) <= 0) return "A valid recipient is required.";
  if (!input.content.trim()) return "Message content is required.";
  if (input.content.length > 4000) return "Message content must be 4000 characters or fewer.";
  return "";
}

function deduplicateMessages(list: ConversationMessage[]) {
  const byId = new Map<string, ConversationMessage>();
  list.forEach((message) => {
    const key = `${message.conversationId}:${message.id}`;
    const previous = byId.get(key);
    // Prefer the persisted event over an optimistic placeholder.
    if (!previous || (previous.optimistic && !message.optimistic)) byId.set(key, message);
  });
  return [...byId.values()].sort(
    (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
  );
}

function Avatar({
  participant,
}: {
  participant?: { name: string; profileImage?: string | null } | null;
}) {
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#251c17] text-xs font-bold text-white">
      {participant?.profileImage ? (
        <img
          src={mediaUrl(participant.profileImage)}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        participant?.name
          ?.split(/\s+/)
          .map((part) => part[0])
          .slice(0, 2)
          .join("") || "?"
      )}
    </div>
  );
}
function AttachmentMessage({
  message,
  own,
}: {
  message: ConversationMessage;
  own: boolean;
}) {
  const [url, setUrl] = useState("");
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    if (typeof message.id !== "number" || !message.attachmentDownloadUrl) return;
    let objectUrl = "";
    let cancelled = false;
    chatService
      .attachment(message.id)
      .then((response) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(response.data);
        setUrl(objectUrl);
      })
      .catch((requestError) => {
        if (!cancelled) setLoadError(getApiError(requestError).message);
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [message.attachmentDownloadUrl, message.id]);

  if (message.messageType === "IMAGE") {
    return (
      <div className="space-y-2">
        {url ? (
          <a href={url} download={message.attachmentName ?? "image.jpg"}>
            <img src={url} alt={message.attachmentName ?? "Chat attachment"} className="max-h-64 max-w-full rounded-lg object-contain" />
          </a>
        ) : (
          <div className={`grid h-32 w-52 place-items-center rounded-lg ${own ? "bg-white/10" : "bg-gray-100"}`}>
            {loadError ? <span className="px-3 text-center text-xs">{loadError}</span> : <LoaderCircle className="h-5 w-5 animate-spin" />}
          </div>
        )}
        <p className="break-all text-xs">{message.attachmentName ?? message.content}</p>
      </div>
    );
  }

  return (
    <a href={url || undefined} download={message.attachmentName ?? "attachment.pdf"} aria-disabled={!url} className={`flex items-center gap-3 rounded-lg border p-3 ${own ? "border-white/30 bg-white/10" : "border-[#e2d8d0] bg-[#fcfaf8]"} ${url ? "" : "pointer-events-none opacity-70"}`}>
      {loadError ? <AlertCircle className="h-6 w-6 shrink-0" /> : url ? <FileText className="h-6 w-6 shrink-0" /> : <LoaderCircle className="h-5 w-5 shrink-0 animate-spin" />}
      <span className="min-w-0"><b className="block truncate">{message.attachmentName ?? message.content}</b><small>{loadError || formatSize(message.attachmentSize ?? 0)}</small></span>
    </a>
  );
}
function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function formatTime(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
function ConnectionBadge({ state }: { state: ConnectionState }) {
  return (
    <p
      className={`mt-1 inline-flex items-center gap-1 text-xs ${state === "connected" ? "text-green-700" : state === "connecting" ? "text-amber-700" : "text-red-700"}`}
    >
      {state === "connected" ? (
        <Wifi className="h-3 w-3" />
      ) : (
        <WifiOff className="h-3 w-3" />
      )}{" "}
      {state}
    </p>
  );
}
function MessageState({ status }: { status: ConversationMessage["status"] }) {
  if (status === "SENDING")
    return <LoaderCircle className="h-3 w-3 animate-spin" />;
  if (status === "FAILED")
    return <AlertCircle className="h-3 w-3 text-amber-200" />;
  if (status === "READ") return <CheckCheck className="h-3 w-3" />;
  return <Check className="h-3 w-3" />;
}
