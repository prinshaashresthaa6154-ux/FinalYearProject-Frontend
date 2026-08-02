import { useRef, useState } from "react";
import { Camera, ImagePlus, Save, Trash2 } from "lucide-react";

const AVATAR_KEY = "nepal-yatra-admin-avatar";

export default function AdminProfile() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(() => {
    try {
      return localStorage.getItem(AVATAR_KEY);
    } catch {
      return null;
    }
  });
  const [form, setForm] = useState({
    name: "Admin Kathmandu",
    email: "admin@ktm.com",
    phone: "+977 9801112233",
    region: "Kathmandu Valley",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  const saveAvatar = (url: string | null) => {
    setAvatar(url);
    try {
      if (url) localStorage.setItem(AVATAR_KEY, url);
      else localStorage.removeItem(AVATAR_KEY);
    } catch {
      // ignore
    }
  };

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (
      !file ||
      !file.type.startsWith("image/") ||
      file.size > 5 * 1024 * 1024
    ) {
      setMessage("Please choose an image under 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") saveAvatar(reader.result);
    };
    reader.readAsDataURL(file);
    setMessage(null);
  };

  const saveProfile = () => {
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }
    setMessage("Profile updated successfully.");
    setForm((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-[#1e1611] text-white flex items-center justify-center text-2xl font-semibold border-2 border-[#eae3dc]">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Admin"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  "AK"
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs"
              >
                <Camera className="w-5 h-5" />
                Change
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={onPhoto}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1 text-xs border border-[#dcd3cc] px-3 py-1.5 rounded-lg"
              >
                <ImagePlus className="w-3.5 h-3.5" />
                Upload
              </button>
              {avatar && (
                <button
                  type="button"
                  onClick={() => saveAvatar(null)}
                  className="inline-flex items-center gap-1 text-xs text-[#b31919] px-3 py-1.5 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 w-full">
            <h2 className="text-xl font-bold font-serif text-[#1a130e]">
              Admin Profile
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Update your information, password, and profile picture
            </p>
            {message && (
              <p className="mt-3 text-sm text-[#b31919] bg-rose-50 px-3 py-2 rounded-lg">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-bold font-serif mb-4">Account Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(
            [
              ["name", "Full Name"],
              ["email", "Email"],
              ["phone", "Phone"],
              ["region", "Region"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-xs text-gray-400">
              {label}
              <input
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="mt-1.5 w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#b31919]"
              />
            </label>
          ))}
        </div>

        <h3 className="text-lg font-bold font-serif mt-8 mb-4">
          Change Password
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(
            [
              ["currentPassword", "Current Password"],
              ["newPassword", "New Password"],
              ["confirmPassword", "Confirm Password"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-xs text-gray-400">
              {label}
              <input
                type="password"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="mt-1.5 w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#b31919]"
              />
            </label>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={saveProfile}
            className="inline-flex items-center gap-1.5 bg-[#b31919] hover:bg-[#941414] text-white px-5 py-2.5 rounded-lg text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
