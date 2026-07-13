import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Bell,
  Phone,
  UserPlus,
  MoreVertical,
  MapPin,
  Calendar,
  User,
  Megaphone,
  Paperclip,
  Image,
  Smile,
  Send,
} from "lucide-react";
import { getGroupTripById } from "../data/groupTrips";
import { useGroupTrip } from "../context/GroupTripContext";

export default function GroupChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tripId = Number(id);
  const trip = getGroupTripById(tripId);
  const { isJoined, membersByTrip, messagesByTrip, sendMessage } =
    useGroupTrip();

  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const members = membersByTrip[tripId] ?? [];
  const messages = messagesByTrip[tripId] ?? [];
  const onlineCount = members.filter((m) => m.online).length;

  useEffect(() => {
    if (!trip) {
      navigate("/group-trips", { replace: true });
      return;
    }
    if (!isJoined(tripId)) {
      navigate("/group-trips", { replace: true });
    }
  }, [trip, tripId, isJoined, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!trip || !isJoined(tripId)) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage(tripId, message);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-[#F7F3F0] font-sans flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <button
                onClick={() => navigate("/group-trips")}
                className="mt-1 text-gray-500 hover:text-gray-700 md:hidden"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-11 h-11 rounded-full bg-[#A51C1C] flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-semibold">
                  {trip.initials}
                </span>
              </div>
              <div className="min-w-0">
                <h1 className="font-display font-bold text-[#1A1A1A] text-base md:text-lg leading-tight truncate">
                  {trip.title}
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {members.length} members • {onlineCount} online
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {trip.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {trip.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    Guide: {trip.guide}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-1">
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                  <UserPlus className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => navigate("/group-trips")}
                className="text-xs text-[#A51C1C] font-medium hover:underline hidden md:block"
              >
                View trip details →
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full flex min-h-0">
        <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200 bg-white">
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-4">
            {messages.map((msg) => {
              if (msg.type === "system") {
                return (
                  <div key={msg.id} className="flex justify-center">
                    <span className="text-xs text-gray-500 bg-gray-100 px-4 py-1.5 rounded-full">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              if (msg.type === "announcement") {
                return (
                  <div key={msg.id} className="max-w-md">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-[#1A1A1A]">
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] font-medium bg-[#A51C1C] text-white px-2 py-0.5 rounded-full">
                        Guide
                      </span>
                    </div>
                    <div className="bg-[#FCEAEA] border border-[#A51C1C]/20 rounded-xl px-4 py-3">
                      <div className="flex items-start gap-2">
                        <Megaphone className="w-4 h-4 text-[#A51C1C] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-semibold text-[#A51C1C] uppercase tracking-wide">
                            Announcement
                          </span>
                          <p className="text-sm text-gray-700 mt-1">
                            {msg.text}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{msg.time}</p>
                  </div>
                );
              }

              if (msg.isOwn) {
                return (
                  <div key={msg.id} className="flex flex-col items-end">
                    <div className="bg-[#A51C1C] text-white rounded-xl rounded-br-sm px-4 py-2.5 max-w-md">
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{msg.time}</p>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="max-w-md">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-[#1A1A1A]">
                      {msg.senderName}
                    </span>
                    {msg.isGuide && (
                      <span className="text-[10px] font-medium bg-[#2D3748] text-white px-2 py-0.5 rounded-full">
                        Guide
                      </span>
                    )}
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl rounded-tl-sm px-4 py-2.5">
                    <p className="text-sm text-gray-700">{msg.text}</p>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{msg.time}</p>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSend}
            className="border-t border-gray-200 px-4 md:px-6 py-4 shrink-0"
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Image className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message the group..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm outline-none focus:border-gray-300"
              />
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-[#A51C1C] text-white text-sm font-medium px-4 py-2.5 rounded-full hover:bg-[#8e1818] transition-colors"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-3">
              Be respectful. Messages are visible to all group members and the
              guide.
            </p>
          </form>
        </div>

        <aside className="hidden lg:flex w-72 xl:w-80 flex-col bg-white shrink-0">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-[#1A1A1A]">Members</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {members.length} total • {onlineCount} online
            </p>
          </div>

          <ul className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between gap-2 px-2 py-2.5 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${
                        member.isCurrentUser
                          ? "bg-[#A51C1C] text-white"
                          : member.role === "Guide"
                            ? "bg-[#FCEAEA] text-[#A51C1C]"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {member.initials}
                    </div>
                    {member.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">
                      {member.isCurrentUser ? "You" : member.name}
                    </p>
                    <p className="text-xs text-gray-400">{member.role}</p>
                  </div>
                </div>
                {member.role === "Guide" && (
                  <span className="text-[10px] font-medium bg-[#2D3748] text-white px-2 py-0.5 rounded-full shrink-0">
                    Guide
                  </span>
                )}
              </li>
            ))}
          </ul>

          <div className="p-4 border-t border-gray-100">
            <button className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <UserPlus className="w-4 h-4" />
              Invite Members
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
