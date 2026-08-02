import { useMemo, useState } from "react";
import { Search, Check, Ban, Eye, X } from "lucide-react";
import { useAdminPlatform } from "../../../context/AdminPlatformContext";
import type { GuideRecord, GuideStatus } from "../../../data/adminPlatform";
import { getGuideById } from "../../../data/guides";
import { getAvatarForGuideId } from "../../../utils/guideAvatar";

export default function AdminGuides() {
  const { guides, updateGuideStatus } = useAdminPlatform();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | GuideStatus>("All");
  const [selected, setSelected] = useState<GuideRecord | null>(null);

  const filtered = useMemo(() => {
    return guides
      .filter((g) =>
        statusFilter === "All" ? true : g.status === statusFilter,
      )
      .filter(
        (g) =>
          g.name.toLowerCase().includes(query.toLowerCase()) ||
          g.location.toLowerCase().includes(query.toLowerCase()),
      );
  }, [guides, query, statusFilter]);

  const detail = selected ? getGuideById(selected.id) : undefined;
  const avatar = selected ? getAvatarForGuideId(selected.id) : null;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#f0eae4]">
          <div>
            <h2 className="text-xl font-bold text-[#1a130e] font-serif">
              Guide Management
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Approve, suspend, and review freelance guides
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative sm:w-64">
              <input
                type="text"
                placeholder="Search guides..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-[#b31919]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "All" | GuideStatus)
              }
              className="bg-[#faf7f4] border border-[#dcd3cc] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#b31919]"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#fcfaf7] border-b border-[#f0eae4] text-xs font-semibold text-gray-400">
                <th className="py-3.5 px-6 font-medium">Guide</th>
                <th className="py-3.5 px-6 font-medium">Location</th>
                <th className="py-3.5 px-6 font-medium">Experience</th>
                <th className="py-3.5 px-6 font-medium">Languages</th>
                <th className="py-3.5 px-6 font-medium">Rating</th>
                <th className="py-3.5 px-6 font-medium">Status</th>
                <th className="py-3.5 px-6 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5efe9]">
              {filtered.map((guide) => (
                <tr key={guide.id} className="hover:bg-[#fdfcfb]">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#1e2a44] text-white text-xs font-semibold flex items-center justify-center overflow-hidden">
                        {guide.id === 1 && getAvatarForGuideId(1) ? (
                          <img
                            src={getAvatarForGuideId(1)!}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          guide.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#2c2520]">
                          {guide.name}
                        </p>
                        <p className="text-xs text-gray-400">{guide.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {guide.location}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {guide.experience}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {guide.languages.join(", ")}
                  </td>
                  <td className="py-4 px-6 text-sm font-semibold">
                    {guide.rating} ({guide.reviews})
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        guide.status === "Active"
                          ? "bg-[#b31919] text-white"
                          : guide.status === "Pending"
                            ? "bg-[#1e2a44] text-white"
                            : "bg-gray-400 text-white"
                      }`}
                    >
                      {guide.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setSelected(guide)}
                        className="p-1.5 text-gray-500 hover:text-[#1a130e]"
                        title="Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {guide.status === "Pending" && (
                        <button
                          type="button"
                          onClick={() => updateGuideStatus(guide.id, "Active")}
                          className="inline-flex items-center gap-1 bg-[#b31919] text-white px-2.5 py-1 rounded-md text-xs font-medium"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                      )}
                      {guide.status === "Active" && (
                        <button
                          type="button"
                          onClick={() =>
                            updateGuideStatus(guide.id, "Suspended")
                          }
                          className="inline-flex items-center gap-1 text-[#b31919] text-xs font-medium hover:underline"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Suspend
                        </button>
                      )}
                      {guide.status === "Suspended" && (
                        <button
                          type="button"
                          onClick={() => updateGuideStatus(guide.id, "Active")}
                          className="text-xs font-medium text-emerald-700 hover:underline"
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#eae3dc] shadow-lg max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="p-5 border-b border-[#f0eae4] flex justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1e2a44] overflow-hidden flex items-center justify-center text-white font-semibold">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    selected.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif">
                    {selected.name}
                  </h3>
                  <p className="text-sm text-gray-400">{selected.location}</p>
                </div>
              </div>
              <button type="button" onClick={() => setSelected(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <p>
                <span className="text-gray-400">Experience:</span>{" "}
                {selected.experience}
              </p>
              <p>
                <span className="text-gray-400">Languages:</span>{" "}
                {selected.languages.join(", ")}
              </p>
              <p>
                <span className="text-gray-400">Trips:</span> {selected.trips} ·{" "}
                <span className="text-gray-400">Rating:</span> {selected.rating}{" "}
                ({selected.reviews} reviews)
              </p>
              <p>
                <span className="text-gray-400">Availability:</span>{" "}
                {selected.available ? "Available" : "Unavailable"}
              </p>
              {detail && (
                <>
                  <p className="text-gray-500 leading-relaxed">
                    {detail.about}
                  </p>
                  <div>
                    <p className="font-semibold mb-1">Availability calendar</p>
                    <ul className="space-y-1">
                      {detail.availability.map((a) => (
                        <li
                          key={a.month}
                          className="flex justify-between bg-[#faf7f4] rounded-lg px-3 py-2 text-xs"
                        >
                          <span>{a.month}</span>
                          <span
                            className={
                              a.status === "Available"
                                ? "text-emerald-600 font-medium"
                                : "text-[#b31919] font-medium"
                            }
                          >
                            {a.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
