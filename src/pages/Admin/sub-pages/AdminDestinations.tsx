import { useState } from "react";
import { Plus, Pencil, Trash2, X, Star } from "lucide-react";
import { useAdminPlatform } from "../../../context/AdminPlatformContext";
import type { PlatformDestination } from "../../../data/adminPlatform";

const emptyForm = (): PlatformDestination => ({
  id: 0,
  title: "",
  location: "",
  category: "Trekking",
  description: "",
  price: 0,
  altitude: "",
  bestSeason: "",
  status: "Active",
  featured: false,
  gallery: [],
  rating: 4.5,
  reviews: 0,
});

export default function AdminDestinations() {
  const { destinations, upsertDestination, deleteDestination } =
    useAdminPlatform();
  const [editing, setEditing] = useState<PlatformDestination | null>(null);
  const [galleryInput, setGalleryInput] = useState("");

  const openCreate = () => {
    setEditing(emptyForm());
    setGalleryInput("");
  };

  const openEdit = (dest: PlatformDestination) => {
    setEditing({ ...dest });
    setGalleryInput(dest.gallery.join("\n"));
  };

  const save = () => {
    if (!editing || !editing.title.trim()) return;
    const gallery = galleryInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const id = editing.id || Math.max(0, ...destinations.map((d) => d.id)) + 1;
    upsertDestination({ ...editing, id, gallery });
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#f0eae4]">
          <div>
            <h2 className="text-xl font-bold text-[#1a130e] font-serif">
              Destination Management
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Add, edit, feature or remove destinations shown to users
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 bg-[#b31919] hover:bg-[#941414] text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Destination
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#fcfaf7] border-b border-[#f0eae4] text-xs font-semibold text-gray-400">
                <th className="py-3.5 px-6 font-medium">Destination</th>
                <th className="py-3.5 px-6 font-medium">Category</th>
                <th className="py-3.5 px-6 font-medium">Location</th>
                <th className="py-3.5 px-6 font-medium">Price</th>
                <th className="py-3.5 px-6 font-medium">Status</th>
                <th className="py-3.5 px-6 font-medium">Featured</th>
                <th className="py-3.5 px-6 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5efe9]">
              {destinations.map((dest) => (
                <tr key={dest.id} className="hover:bg-[#fdfcfb]">
                  <td className="py-4 px-6">
                    <p className="text-sm font-semibold text-[#2c2520]">
                      {dest.title}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {dest.rating} ({dest.reviews})
                    </p>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {dest.category}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {dest.location}
                  </td>
                  <td className="py-4 px-6 text-sm font-semibold">
                    ${dest.price}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        dest.status === "Active"
                          ? "bg-[#b31919] text-white"
                          : "bg-gray-400 text-white"
                      }`}
                    >
                      {dest.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm">
                    {dest.featured ? (
                      <span className="text-[#b31919] font-medium">Yes</span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => openEdit(dest)}
                        className="text-gray-500 hover:text-[#1a130e]"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete ${dest.title}?`))
                            deleteDestination(dest.id);
                        }}
                        className="text-[#b31919] hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#eae3dc] shadow-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-[#f0eae4] flex justify-between">
              <h3 className="text-lg font-bold font-serif">
                {editing.id ? "Edit Destination" : "Add Destination"}
              </h3>
              <button type="button" onClick={() => setEditing(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  ["title", "Title"],
                  ["location", "Location"],
                  ["category", "Category"],
                  ["altitude", "Altitude"],
                  ["bestSeason", "Best Season"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block text-xs text-gray-400">
                  {label}
                  <input
                    value={editing[key] as string}
                    onChange={(e) =>
                      setEditing({ ...editing, [key]: e.target.value })
                    }
                    className="mt-1 w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg px-3 py-2 text-sm text-[#2c2520] focus:outline-none focus:border-[#b31919]"
                  />
                </label>
              ))}
              <label className="block text-xs text-gray-400">
                Price (USD)
                <input
                  type="number"
                  value={editing.price}
                  onChange={(e) =>
                    setEditing({ ...editing, price: Number(e.target.value) })
                  }
                  className="mt-1 w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#b31919]"
                />
              </label>
              <label className="block text-xs text-gray-400">
                Status
                <select
                  value={editing.status}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      status: e.target.value as "Active" | "Inactive",
                    })
                  }
                  className="mt-1 w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#b31919]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
              <label className="sm:col-span-2 block text-xs text-gray-400">
                Description
                <textarea
                  rows={3}
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  className="mt-1 w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#b31919]"
                />
              </label>
              <label className="sm:col-span-2 block text-xs text-gray-400">
                Gallery URLs (one per line)
                <textarea
                  rows={3}
                  value={galleryInput}
                  onChange={(e) => setGalleryInput(e.target.value)}
                  placeholder="https://..."
                  className="mt-1 w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#b31919]"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-[#2c2520] sm:col-span-2">
                <input
                  type="checkbox"
                  checked={editing.featured}
                  onChange={(e) =>
                    setEditing({ ...editing, featured: e.target.checked })
                  }
                  className="rounded border-[#dcd3cc]"
                />
                Featured destination
              </label>
            </div>
            <div className="p-5 border-t border-[#f0eae4] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm border border-[#dcd3cc] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                className="px-4 py-2 text-sm bg-[#b31919] text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
