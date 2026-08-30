import { Camera, ImagePlus, LoaderCircle, Save, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { getApiError } from "../../../api/axios";
import VerificationDocumentsPanel from "../../../components/VerificationDocumentsPanel";
import { useAuth, type User } from "../../../context/AuthContext";
import {
  authService,
  getAuthUser,
  MAX_PROFILE_IMAGE_SIZE,
  profileImageUrl,
} from "../../../services/authService";

type ProfileForm = {
  firstName: string;
  lastName: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const profileForm = (user?: User | null): ProfileForm => {
  const fullName = (user?.fullName ?? user?.username ?? "").trim().split(/\s+/);
  return {
    firstName: user?.firstName ?? fullName[0] ?? "",
    lastName: user?.lastName ?? fullName.slice(1).join(" "),
    phone: user?.phone ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
};

export default function AdminProfile() {
  const { token, userDTO, updateUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const userRef = useRef(userDTO);
  const updateUserRef = useRef(updateUser);
  userRef.current = userDTO;
  updateUserRef.current = updateUser;
  const [form, setForm] = useState<ProfileForm>(() => profileForm(userDTO));
  const [avatar, setAvatar] = useState(() => profileImageUrl(userDTO?.profileImage));
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    authService
      .getCurrentUser(token ?? undefined)
      .then((response) => {
        const current = getAuthUser(response.data);
        if (cancelled || !current) return;
        const merged = { ...userRef.current, ...current } as User;
        updateUserRef.current(merged);
        setForm(profileForm(merged));
        setAvatar(profileImageUrl(merged.profileImage));
      })
      .catch((error) => {
        if (!cancelled) {
          setIsError(true);
          setMessage(getApiError(error).message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const update = (key: keyof ProfileForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
  };

  const onPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (
      !file ||
      !["image/jpeg", "image/png"].includes(file.type) ||
      file.size > MAX_PROFILE_IMAGE_SIZE
    ) {
      setIsError(true);
      setMessage("Choose a JPEG or PNG image up to 10 MB.");
      return;
    }
    setAvatarFile(file);
    setAvatar(URL.createObjectURL(file));
    setMessage("");
    setIsError(false);
  };

  const removeAvatar = async () => {
    if (!userDTO) return;
    setRemovingImage(true);
    setMessage("");
    try {
      const response = await authService.deleteProfileImage();
      updateUser({ ...userDTO, ...(response.data.data ?? {}), profileImage: null });
      setAvatarFile(null);
      setAvatar("");
      setIsError(false);
      setMessage(response.data.message || "Profile image removed.");
    } catch (error) {
      setIsError(true);
      setMessage(getApiError(error).message);
    } finally {
      setRemovingImage(false);
    }
  };

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!userDTO) return;
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const phone = form.phone.trim();
    const errors: Record<string, string> = {};
    if (!firstName) errors.firstName = "First name is required.";
    if (!lastName) errors.lastName = "Last name is required.";
    if (!phone) errors.phone = "Phone is required.";
    if (form.newPassword && !form.currentPassword)
      errors.currentPassword = "Current password is required.";
    if (form.newPassword && form.newPassword !== form.confirmPassword)
      errors.confirmPassword = "New passwords do not match.";
    if (form.currentPassword && !form.newPassword)
      errors.newPassword = "Enter a new password.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setIsError(true);
      setMessage("Please check the highlighted fields.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const profileResponse = await authService.updateCurrentUser({
        firstName,
        lastName,
        phone,
      });
      let updated: User = {
        ...userDTO,
        firstName,
        lastName,
        phone,
        fullName: `${firstName} ${lastName}`,
        ...(profileResponse.data.data ?? {}),
      };
      if (avatarFile) {
        const imageResponse = await authService.uploadProfileImage(avatarFile);
        updated = { ...updated, ...(imageResponse.data.data ?? {}) };
        setAvatarFile(null);
      }
      if (form.currentPassword && form.newPassword) {
        await authService.changePassword(form.currentPassword, form.newPassword);
      }
      updateUser(updated);
      setAvatar(profileImageUrl(updated.profileImage));
      setForm((current) => ({
        ...current,
        firstName,
        lastName,
        phone,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setFieldErrors({});
      setIsError(false);
      setMessage("Profile updated successfully.");
    } catch (error) {
      const details = getApiError(error);
      setFieldErrors(details.validationErrors);
      setIsError(true);
      setMessage(details.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="grid min-h-64 place-items-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-[#b31919]" />
      </div>
    );

  const name =
    [form.firstName, form.lastName].filter(Boolean).join(" ") ||
    userDTO?.fullName ||
    "Admin";
  const initials =
    [form.firstName, form.lastName]
      .filter(Boolean)
      .map((value) => value[0])
      .join("")
      .toUpperCase() || "A";

  return (
    <div className="space-y-6">
      <form onSubmit={saveProfile} className="space-y-6">
        <div className="rounded-2xl border border-[#eae3dc] bg-white p-6 shadow-sm">
          <div className="flex flex-col items-start gap-5 sm:flex-row">
            <div className="flex flex-col items-center gap-3">
              <div className="group relative">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-[#eae3dc] bg-[#1e1611] text-2xl font-semibold text-white">
                  {avatar ? <img src={avatar} alt={name} className="h-full w-full object-cover" /> : initials}
                </div>
                <button type="button" onClick={() => fileRef.current?.click()} className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/45 text-xs text-white opacity-0 group-hover:opacity-100">
                  <Camera className="h-5 w-5" /> Change
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" className="hidden" onChange={onPhoto} />
              <div className="flex gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} disabled={saving || removingImage} className="inline-flex items-center gap-1 rounded-lg border border-[#dcd3cc] px-3 py-1.5 text-xs disabled:opacity-50">
                  <ImagePlus className="h-3.5 w-3.5" /> Upload
                </button>
                {avatar && <button type="button" onClick={() => void removeAvatar()} disabled={saving || removingImage} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-[#b31919] hover:bg-red-50 disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" /> {removingImage ? "Removing" : "Remove"}</button>}
              </div>
            </div>
            <div className="w-full flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b31919]">Admin account</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-[#1a130e]">{name}</h2>
              <p className="mt-1 text-sm text-gray-500">{userDTO?.email}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Status label="Role" value={userDTO?.role} />
                <Status label="Account" value={userDTO?.accountStatus} />
                <Status label="Verification" value={userDTO?.verificationStatus} />
              </div>
              {message && <p role={isError ? "alert" : "status"} className={`mt-4 rounded-lg px-3 py-2 text-sm ${isError ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}>{message}</p>}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#eae3dc] bg-white p-6 shadow-sm">
          <h3 className="font-display text-xl font-bold">Account details</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="First name" value={form.firstName} error={fieldErrors.firstName} onChange={(value) => update("firstName", value)} />
            <Field label="Last name" value={form.lastName} error={fieldErrors.lastName} onChange={(value) => update("lastName", value)} />
            <Field label="Phone" value={form.phone} error={fieldErrors.phone} onChange={(value) => update("phone", value)} />
            <Field label="Email" value={userDTO?.email ?? ""} readOnly />
          </div>
          <h3 className="mt-8 font-display text-xl font-bold">Change password</h3>
          <p className="mt-1 text-sm text-gray-500">Leave these fields empty to keep your current password.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Field label="Current password" type="password" value={form.currentPassword} error={fieldErrors.currentPassword} onChange={(value) => update("currentPassword", value)} />
            <Field label="New password" type="password" value={form.newPassword} error={fieldErrors.newPassword} onChange={(value) => update("newPassword", value)} />
            <Field label="Confirm password" type="password" value={form.confirmPassword} error={fieldErrors.confirmPassword} onChange={(value) => update("confirmPassword", value)} />
          </div>
          <div className="mt-6 flex justify-end">
            <button disabled={saving || removingImage} className="inline-flex items-center gap-2 rounded-lg bg-[#b31919] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#941414] disabled:opacity-50">
              <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </form>
      <VerificationDocumentsPanel />
    </div>
  );
}

function Field({ label, value, onChange, error, type = "text", readOnly = false }: { label: string; value: string; onChange?: (value: string) => void; error?: string; type?: string; readOnly?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-gray-500">
      {label}
      <input type={type} value={value} readOnly={readOnly} onChange={(event) => onChange?.(event.target.value)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none ${readOnly ? "cursor-not-allowed bg-gray-100 text-gray-500" : "bg-[#faf7f4] focus:border-[#b31919]"} ${error ? "border-red-500" : "border-[#dcd3cc]"}`} />
      {error && <span className="mt-1 block font-normal text-red-700">{error}</span>}
    </label>
  );
}

function Status({ label, value }: { label: string; value?: string | null }) {
  return <span className="rounded-full bg-[#f5eee8] px-3 py-1 text-xs font-semibold text-[#675b52]">{label}: {value || "Not provided"}</span>;
}
