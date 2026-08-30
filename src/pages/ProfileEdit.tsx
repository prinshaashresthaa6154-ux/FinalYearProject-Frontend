import { useRef, useState } from "react";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { getApiError } from "../api/axios";
import { useAuth, type User } from "../context/AuthContext";
import {
  authService,
  MAX_PROFILE_IMAGE_SIZE,
  profileImageUrl,
} from "../services/authService";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { userDTO, updateUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(() => {
    const names = [userDTO?.firstName, userDTO?.lastName].filter(Boolean);
    const fallback = (userDTO?.fullName ?? "").trim().split(/\s+/);
    return {
      firstName: names[0] ?? fallback[0] ?? "",
      lastName: names[1] ?? fallback.slice(1).join(" "),
      phone: userDTO?.phone ?? "",
    };
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(
    profileImageUrl(userDTO?.profileImage),
  );
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const onImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (
      !file ||
      !["image/jpeg", "image/png"].includes(file.type) ||
      file.size > MAX_PROFILE_IMAGE_SIZE
    ) {
      setMessage("Choose a JPEG or PNG image up to 10 MB.");
      setIsError(true);
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string" && setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
    setProfileImage(file);
    setMessage("");
    setIsError(false);
  };

  const deleteImage = async () => {
    if (!userDTO) return;
    setIsDeletingImage(true);
    setMessage("");
    setIsError(false);
    try {
      const response = await authService.deleteProfileImage();
      const returned = response.data.data;
      updateUser({ ...userDTO, ...(returned ?? {}), profileImage: null });
      setProfileImage(null);
      setPreviewUrl("");
      if (fileRef.current) fileRef.current.value = "";
      setMessage(response.data.message || "Profile image removed.");
    } catch (error) {
      setIsError(true);
      setMessage(getApiError(error).message);
    } finally {
      setIsDeletingImage(false);
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userDTO) return;

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const phone = form.phone.trim();
    const errors: Record<string, string> = {};
    const namePattern = /^\p{L}[\p{L} .'-]*$/u;
    const phonePattern = /^\+?[0-9][0-9 ()-]{6,19}$/;
    if (!firstName) errors.firstName = "First name is required.";
    else if (firstName.length > 75 || !namePattern.test(firstName))
      errors.firstName =
        "Use letters, spaces, periods, apostrophes, or hyphens only.";
    if (!lastName) errors.lastName = "Last name is required.";
    else if (lastName.length > 75 || !namePattern.test(lastName))
      errors.lastName =
        "Use letters, spaces, periods, apostrophes, or hyphens only.";
    if (!phone) errors.phone = "Phone is required.";
    else if (!phonePattern.test(phone))
      errors.phone = "Enter a valid phone number.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setIsError(true);
      setMessage("Please check the highlighted fields.");
      return;
    }

    const fullName = `${firstName} ${lastName}`.trim();
    const nextUser: User = {
      ...userDTO,
      firstName,
      lastName,
      phone,
      profileImage: userDTO.profileImage,
      fullName,
      username: fullName || userDTO.username,
    };

    try {
      setIsSaving(true);
      setMessage("");
      setIsError(false);
      setFieldErrors({});
      const response = await authService.updateCurrentUser({
        firstName,
        lastName,
        phone,
      });
      const returned = response.data.data;
      let updatedUser: User = {
        ...nextUser,
        ...(returned && typeof returned === "object" ? returned : {}),
      };
      if (profileImage) {
        const imageResponse =
          await authService.uploadProfileImage(profileImage);
        updatedUser = { ...updatedUser, ...(imageResponse.data.data ?? {}) };
      }
      updateUser(updatedUser);
      setPreviewUrl(profileImageUrl(updatedUser.profileImage));
      setMessage("Profile updated successfully.");
      setProfileImage(null);
    } catch (error) {
      const details = getApiError(error);
      setIsError(true);
      setFieldErrors(details.validationErrors);
      setMessage(
        details.kind === "validation"
          ? "Please check the highlighted fields."
          : details.kind === "unauthorized"
            ? "Your session has expired. Please log in again."
            : details.kind === "server"
              ? "Unable to save your profile right now. Please try again."
              : details.message,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f6f1e9] px-4 py-10 sm:px-6">
      <form
        onSubmit={save}
        className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-lg sm:p-9"
      >
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#765f52]"
        >
          <ArrowLeft className="h-4 w-4" /> Profile
        </button>
        <h1 className="font-display text-4xl text-[#251d18]">Edit profile</h1>
        <p className="mt-2 text-sm text-[#8b7568]">
          Keep your contact information current.
        </p>
        <div className="mt-8 flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#b31919] text-xl font-bold text-white">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile preview"
                className="h-full w-full object-cover"
              />
            ) : (
              (form.firstName[0] ?? "U") + (form.lastName[0] ?? "")
            )}
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,.jpg,.jpeg,.png"
              onChange={onImage}
              className="hidden"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={isDeletingImage}
                className="rounded-xl border border-[#d8c9bf] px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                Upload profile image
              </button>
              {previewUrl && (
                <button
                  type="button"
                  onClick={() => void deleteImage()}
                  disabled={isDeletingImage || isSaving}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeletingImage ? "Removing..." : "Remove"}
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-[#9b887d]">JPG or PNG, max 10 MB</p>
          </div>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {(
            [
              ["firstName", "First name"],
              ["lastName", "Last name"],
              ["phone", "Phone"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="text-sm font-semibold text-[#5c493e]">
              {label}
              <input
                value={form[key]}
                onChange={(event) => {
                  update(key, event.target.value);
                  setFieldErrors((current) => ({ ...current, [key]: "" }));
                }}
                maxLength={key === "phone" ? 20 : 75}
                required
                className={`mt-2 w-full rounded-xl border ${fieldErrors[key] ? "border-red-500" : "border-[#d8c9bf]"} bg-[#fcfaf8] px-4 py-3 font-normal outline-none focus:border-[#b31919]`}
              />
              {fieldErrors[key] && (
                <span className="mt-1 block text-xs font-normal text-red-700">
                  {fieldErrors[key]}
                </span>
              )}
            </label>
          ))}
          <ReadOnly label="Email" value={userDTO?.email ?? ""} />
          <ReadOnly label="Role" value={userDTO?.role ?? ""} />
          <ReadOnly
            label="Verification status"
            value={userDTO?.verificationStatus ?? "Not provided"}
          />
        </div>
        {message && (
          <p
            role={isError ? "alert" : "status"}
            className={`mt-5 rounded-xl px-4 py-3 text-sm ${isError ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}
          >
            {message}
          </p>
        )}
        <button
          disabled={isSaving}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#b31919] px-5 py-3 text-sm font-bold text-white hover:bg-[#941414] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </main>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <label className="text-sm font-semibold text-[#5c493e]">
      {label}
      <input
        value={value}
        readOnly
        className="mt-2 w-full rounded-xl border border-[#e4d8cf] bg-[#f3eeea] px-4 py-3 font-normal text-[#8b7568]"
      />
    </label>
  );
}
