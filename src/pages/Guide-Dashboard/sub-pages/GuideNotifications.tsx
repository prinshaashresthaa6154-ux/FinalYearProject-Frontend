import { useState } from 'react';
import {
  Bell,
  Calendar,
  Users,
  Wallet,
  MessageSquare,
  Star,
} from 'lucide-react';

const notifications = [
  {
    id: 1,
    icon: Calendar,
    title: 'New trip booking',
    body: 'Mark Thompson requested Annapurna Circuit starting Apr 20.',
    time: '12 min ago',
    unread: true,
  },
  {
    id: 2,
    icon: Users,
    title: 'Group join request',
    body: 'Emily Chen paid and requested to join EBC Group Trek.',
    time: '1 hour ago',
    unread: true,
  },
  {
    id: 3,
    icon: Wallet,
    title: 'Payout processed',
    body: '$1,120 for Sarah Johnson’s EBC trek was deposited.',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: 4,
    icon: MessageSquare,
    title: 'New message',
    body: 'Yuki Harada asked about the packing list.',
    time: '2 days ago',
    unread: false,
  },
  {
    id: 5,
    icon: Star,
    title: 'New review',
    body: 'James Wilson left a 4-star review for Manaslu Circuit.',
    time: '3 days ago',
    unread: false,
  },
];

export default function Notifications() {
  const [items, setItems] = useState(notifications);

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markRead = (id: number) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
  };

  const unreadCount = items.filter((n) => n.unread).length;

  return (
    <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 flex items-start justify-between gap-4 border-b border-[#f0eae4]">
        <div>
          <h2 className="text-xl font-bold text-[#1a130e] tracking-tight font-serif flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#b31919]" />
            Notifications
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'You are all caught up'}
          </p>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          className="text-sm font-medium text-[#b31919] hover:underline shrink-0"
        >
          Mark all read
        </button>
      </div>

      <div className="divide-y divide-[#f5efe9]">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => markRead(item.id)}
              className={`w-full text-left px-5 py-4 flex items-start gap-3 transition hover:bg-[#fdfcfb] ${
                item.unread ? 'bg-[#faf7f4]' : ''
              }`}
            >
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  item.unread ? 'bg-rose-50 text-rose-500' : 'bg-[#f3ede8] text-gray-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#1a130e]">{item.title}</p>
                  <span className="text-xs text-gray-400 shrink-0">{item.time}</span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{item.body}</p>
              </div>
              {item.unread && (
                <span className="w-2 h-2 rounded-full bg-[#b31919] mt-2 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
