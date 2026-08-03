<<<<<<< HEAD
import { useState } from "react";
import { Send } from "lucide-react";
=======
import { useState } from 'react';
import { Send } from 'lucide-react';
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb

const conversations = [
  {
    id: 1,
<<<<<<< HEAD
    initials: "SJ",
    name: "Sarah Johnson",
    preview: "Looking forward to the EBC trek!",
    time: "10:24 AM",
=======
    initials: 'SJ',
    name: 'Sarah Johnson',
    preview: 'Looking forward to the EBC trek!',
    time: '10:24 AM',
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
    unread: 2,
  },
  {
    id: 2,
<<<<<<< HEAD
    initials: "MT",
    name: "Mark Thompson",
    preview: "Can we adjust the start date?",
    time: "Yesterday",
=======
    initials: 'MT',
    name: 'Mark Thompson',
    preview: 'Can we adjust the start date?',
    time: 'Yesterday',
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
    unread: 0,
  },
  {
    id: 3,
<<<<<<< HEAD
    initials: "YH",
    name: "Yuki Harada",
    preview: "Thank you for the packing list.",
    time: "Mon",
=======
    initials: 'YH',
    name: 'Yuki Harada',
    preview: 'Thank you for the packing list.',
    time: 'Mon',
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
    unread: 0,
  },
  {
    id: 4,
<<<<<<< HEAD
    initials: "EC",
    name: "Emily Chen",
    preview: "Payment completed for group trek.",
    time: "Sun",
=======
    initials: 'EC',
    name: 'Emily Chen',
    preview: 'Payment completed for group trek.',
    time: 'Sun',
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
    unread: 1,
  },
];

const sampleMessages = [
  {
    id: 1,
    fromMe: false,
<<<<<<< HEAD
    text: "Hi Pemba! Excited for the Everest Base Camp trek.",
    time: "10:12 AM",
=======
    text: 'Hi Pemba! Excited for the Everest Base Camp trek.',
    time: '10:12 AM',
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
  },
  {
    id: 2,
    fromMe: true,
<<<<<<< HEAD
    text: "Welcome Sarah! I will send the gear checklist today.",
    time: "10:18 AM",
=======
    text: 'Welcome Sarah! I will send the gear checklist today.',
    time: '10:18 AM',
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
  },
  {
    id: 3,
    fromMe: false,
<<<<<<< HEAD
    text: "Looking forward to the EBC trek!",
    time: "10:24 AM",
=======
    text: 'Looking forward to the EBC trek!',
    time: '10:24 AM',
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
  },
];

export default function Messages() {
  const [activeId, setActiveId] = useState(1);
<<<<<<< HEAD
  const [draft, setDraft] = useState("");
  const active =
    conversations.find((c) => c.id === activeId) ?? conversations[0];
=======
  const [draft, setDraft] = useState('');
  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb

  return (
    <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-[280px_1fr] min-h-[480px]">
      <div className="border-b lg:border-b-0 lg:border-r border-[#f0eae4]">
        <div className="p-4 border-b border-[#f0eae4]">
<<<<<<< HEAD
          <h2 className="text-lg font-bold text-[#1a130e] font-serif">
            Messages
          </h2>
=======
          <h2 className="text-lg font-bold text-[#1a130e] font-serif">Messages</h2>
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
          <p className="text-xs text-gray-400 mt-0.5">Chat with your clients</p>
        </div>
        <div className="divide-y divide-[#f5efe9]">
          {conversations.map((chat) => (
            <button
              key={chat.id}
              type="button"
              onClick={() => setActiveId(chat.id)}
              className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition ${
<<<<<<< HEAD
                activeId === chat.id ? "bg-[#faf7f4]" : "hover:bg-[#fdfcfb]"
=======
                activeId === chat.id ? 'bg-[#faf7f4]' : 'hover:bg-[#fdfcfb]'
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#1e2a44] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                {chat.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-[#1a130e] truncate">
                    {chat.name}
                  </span>
<<<<<<< HEAD
                  <span className="text-[11px] text-gray-400 shrink-0">
                    {chat.time}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-xs text-gray-400 truncate">
                    {chat.preview}
                  </p>
=======
                  <span className="text-[11px] text-gray-400 shrink-0">{chat.time}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-xs text-gray-400 truncate">{chat.preview}</p>
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
                  {chat.unread > 0 && (
                    <span className="shrink-0 w-5 h-5 rounded-full bg-[#b31919] text-white text-[10px] font-bold flex items-center justify-center">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col min-h-[360px]">
        <div className="px-5 py-4 border-b border-[#f0eae4] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1e2a44] text-white flex items-center justify-center text-xs font-semibold">
            {active.initials}
          </div>
          <div>
<<<<<<< HEAD
            <p className="text-sm font-semibold text-[#1a130e]">
              {active.name}
            </p>
=======
            <p className="text-sm font-semibold text-[#1a130e]">{active.name}</p>
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
            <p className="text-xs text-gray-400">Active client</p>
          </div>
        </div>

        <div className="flex-1 p-5 space-y-3 overflow-y-auto bg-[#fdfbf9]">
          {sampleMessages.map((msg) => (
            <div
              key={msg.id}
<<<<<<< HEAD
              className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}
=======
              className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.fromMe
<<<<<<< HEAD
                    ? "bg-[#b31919] text-white rounded-br-md"
                    : "bg-white border border-[#eae3dc] text-[#2c2520] rounded-bl-md"
=======
                    ? 'bg-[#b31919] text-white rounded-br-md'
                    : 'bg-white border border-[#eae3dc] text-[#2c2520] rounded-bl-md'
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
                }`}
              >
                <p>{msg.text}</p>
                <p
                  className={`text-[10px] mt-1 ${
<<<<<<< HEAD
                    msg.fromMe ? "text-white/70" : "text-gray-400"
=======
                    msg.fromMe ? 'text-white/70' : 'text-gray-400'
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        <form
          className="p-4 border-t border-[#f0eae4] flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
<<<<<<< HEAD
            setDraft("");
=======
            setDraft('');
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
          }}
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#faf7f4] border border-[#dcd3cc] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#b31919] transition"
          />
          <button
            type="submit"
            className="bg-[#b31919] hover:bg-[#941414] text-white p-2.5 rounded-lg transition"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
