import { BadgeCheck, Mail, Pencil, Phone, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "react-router";
import { normalizeRole } from "../auth/roles";
import { useAuth } from "../context/AuthContext";
import VerificationDocumentsPanel from "../components/VerificationDocumentsPanel";
import { profileImageUrl } from "../services/authService";

const display = (value?: string | null) => value?.trim() || "Not provided";

export default function Profile() {
  const { userDTO } = useAuth();
  const name =
    [userDTO?.firstName, userDTO?.lastName].filter(Boolean).join(" ") ||
    userDTO?.fullName ||
    userDTO?.username ||
    "User";
  const role =
    normalizeRole(userDTO?.role)?.replace("FREELANCE_GUIDE", "GUIDE") ??
    display(userDTO?.role);

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f6f1e9] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-5 rounded-3xl bg-[#251d18] p-6 text-white shadow-xl sm:flex-row sm:items-center sm:p-8">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#b31919] text-2xl font-bold">
            {userDTO?.profileImage ? (
              <img src={profileImageUrl(userDTO.profileImage)} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <p className="section-kicker !text-[#e8b6a9]">Your account</p>
            <h1 className="mt-2 font-display text-4xl">{name}</h1>
            <p className="mt-1 text-sm text-[#d7cbc3]">{role}</p>
          </div>
          <Link to="/profile/edit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#251d18] hover:bg-[#f1dfd7]">
            <Pencil className="h-4 w-4" /> Edit profile
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Info icon={<UserRound />} label="Name" value={name} />
          <Info icon={<Mail />} label="Email" value={display(userDTO?.email)} />
          <Info icon={<Phone />} label="Phone" value={display(userDTO?.phone)} />
          <Info icon={<ShieldCheck />} label="Role" value={role} />
          <Info icon={<BadgeCheck />} label="Verification status" value={display(userDTO?.verificationStatus)} />
          <Info icon={<ShieldCheck />} label="Account status" value={display(userDTO?.accountStatus)} />
        </div>
        <Link to="/profile/change-password" className="mt-6 inline-flex text-sm font-bold text-[#a62922] hover:underline">Change password</Link>
        <div className="mt-6"><VerificationDocumentsPanel /></div>
      </div>
    </main>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e4d8cf] bg-white p-5">
      <div className="flex items-center gap-3 text-[#b31919]">
        <span className="h-5 w-5">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider text-[#8b7568]">{label}</span>
      </div>
      <p className="mt-3 text-base font-semibold text-[#251d18]">{value}</p>
    </div>
  );
}
