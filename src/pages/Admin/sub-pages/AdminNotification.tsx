import { useState } from "react";
import { Plus, Send, Trash2, X } from "lucide-react";
import { useAdminPlatform } from "../../../context/AdminPlatformContext";

export default function AdminNotifications() {
  const {
    notifications,
    addNotification,
    deleteNotification,
    markNotificationSent,
  } = useAdminPlatform();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<"All" | "Tourists" | "Guides">(
    "All",
  );

  const create = (sendNow: boolean) => {
    if (!title.trim() || !body.trim()) return;
    addNotification({
      title: title.trim(),
      body: body.trim(),
      audience,
      createdAt: new Date().toISOString().slice(0, 10),
      sent: sendNow,
    });
    setTitle("");
    setBody("");
    setAudience("All");
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#f0eae4]">
          <div>
            <h2 className="text-xl font-bold text-[#1a130e] font-serif">
              Notifications
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Create announcements and send platform notifications
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 bg-[#b31919] text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        </div>

        <div className="divide-y divide-[#f5efe9]">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-[#1a130e]">
                    {n.title}
                  </p>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#f3ede8] text-gray-600">
                    {n.audience}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      n.sent
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {n.sent ? "Sent" : "Draft"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{n.body}</p>
                <p className="text-xs text-gray-400 mt-1">{n.createdAt}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!n.sent && (
                  <button
                    type="button"
                    onClick={() => markNotificationSent(n.id)}
                    className="inline-flex items-center gap-1 bg-[#b31919] text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete notification "${n.title}"?`)) {
                      deleteNotification(n.id);
                    }
                  }}
                  className="p-2 text-[#b31919] hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#eae3dc] max-w-md w-full">
            <div className="p-5 border-b border-[#f0eae4] flex justify-between">
              <h3 className="text-lg font-bold font-serif">
                Create Announcement
              </h3>
              <button type="button" onClick={() => setOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <label className="block text-xs text-gray-400">
                Title
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs text-gray-400">
                Message
                <textarea
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="mt-1 w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs text-gray-400">
                Audience
                <select
                  value={audience}
                  onChange={(e) =>
                    setAudience(e.target.value as "All" | "Tourists" | "Guides")
                  }
                  className="mt-1 w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg px-3 py-2 text-sm"
                >
                  <option value="All">All</option>
                  <option value="Tourists">Tourists</option>
                  <option value="Guides">Guides</option>
                </select>
              </label>
            </div>
            <div className="p-5 border-t border-[#f0eae4] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => create(false)}
                className="px-4 py-2 text-sm border border-[#dcd3cc] rounded-lg"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => create(true)}
                className="px-4 py-2 text-sm bg-[#b31919] text-white rounded-lg"
              >
                Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
