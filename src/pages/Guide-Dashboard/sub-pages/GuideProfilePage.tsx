import { useRef, useState } from "react";
import {
  MapPin,
  Languages,
  BadgeCheck,
  Save,
  Camera,
  ImagePlus,
  Trash2,
} from "lucide-react";
import { useGuideAvatar } from "../GuideAvatarContext";

export default function GuideProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { avatarUrl, setAvatarUrl } = useGuideAvatar();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "Pemba Sherpa",
    email: "pemba@guide.com",
    phone: "+977 9800000000",
    location: "Namche Bazaar, Nepal",
    languages: "English, Nepali, Sherpa",
    experience: "12",
    bio: "Licensed mountain guide specializing in Everest and Annapurna region treks. Focused on safety, culture, and memorable highland experiences.",
    specialties: "Everest Base Camp, Annapurna Circuit, Langtang Valley",
    dayRate: "80",
    available: true,
  });

  const update = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, or WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setAvatarUrl(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex flex-col items-center sm:items-start gap-3 shrink-0">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-[#1e1611] text-[#f5efe9] flex items-center justify-center text-2xl font-semibold border-2 border-[#eae3dc]">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  "PS"
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-white text-xs font-medium transition"
                aria-label="Change profile photo"
              >
                <Camera className="w-5 h-5" />
                Change
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 border border-[#dcd3cc] text-[#6e5e54] hover:bg-[#faf7f4] px-3 py-1.5 rounded-lg text-xs font-medium transition"
              >
                <ImagePlus className="w-3.5 h-3.5" />
                Upload photo
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="inline-flex items-center gap-1.5 text-[#b31919] hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
            </div>
            {error && (
              <p className="text-xs text-[#b31919] max-w-[200px] text-center sm:text-left">
                {error}
              </p>
            )}
            <p className="text-[11px] text-gray-400 max-w-[200px] text-center sm:text-left">
              JPG, PNG or WebP · max 5 MB
            </p>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-[#1a130e] font-serif">
                {form.name}
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700">
                <BadgeCheck className="w-3 h-3" />
                Verified Guide
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {form.location}
            </p>
            <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5" />
              {form.languages}
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-[#2c2520] shrink-0">
            <button
              type="button"
              role="switch"
              aria-checked={form.available}
              onClick={() => update("available", !form.available)}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                form.available ? "bg-[#b31919]" : "bg-[#d4ccc4]"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                  form.available ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            Available for bookings
          </label>
        </div>
      </div>

      <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-[#1a130e] font-serif mb-5">
          Profile Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(
            [
              ["name", "Full Name", "text"],
              ["email", "Email", "email"],
              ["phone", "Phone", "text"],
              ["location", "Location", "text"],
              ["languages", "Languages", "text"],
              ["experience", "Years of Experience", "number"],
              ["specialties", "Specialties", "text"],
              ["dayRate", "Day Rate (USD)", "number"],
            ] as const
          ).map(([key, label, type]) => (
            <label key={key} className="block">
              <span className="text-xs font-medium text-gray-400">{label}</span>
              <input
                type={type}
                value={form[key] as string}
                onChange={(e) => update(key, e.target.value)}
                className="mt-1.5 w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#b31919] transition"
              />
            </label>
          ))}
          <label className="block md:col-span-2">
            <span className="text-xs font-medium text-gray-400">Bio</span>
            <textarea
              value={form.bio}
              onChange={(e) => update("bio", e.target.value)}
              rows={4}
              className="mt-1.5 w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#b31919] transition resize-y"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 bg-[#b31919] hover:bg-[#941414] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
