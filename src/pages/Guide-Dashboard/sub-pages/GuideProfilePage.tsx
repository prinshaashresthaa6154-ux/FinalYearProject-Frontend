import {
  BadgeCheck,
  LoaderCircle,
  Mail,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router";
import { getApiError } from "../../../api/axios";
import { Button, Input, Textarea } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import {
  destinationService,
  mediaUrl,
  type Destination,
} from "../../../services/destinationService";
import {
  guideService,
  type GuideProfile,
} from "../../../services/guideService";

const split = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const display = (value?: string | null) => value?.trim() || "Not provided";

export default function GuideProfilePage() {
  const { userDTO } = useAuth();
  const [profile, setProfile] = useState<GuideProfile | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState(0);
  const [specialization, setSpecialization] = useState("");
  const [languages, setLanguages] = useState("");
  const [certifications, setCertifications] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [rateCurrency, setRateCurrency] = useState("NPR");
  const [destinationIds, setDestinationIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    Promise.all([
      guideService.me(),
      destinationService.publicList({
        page: 0,
        size: 100,
        sortBy: "name",
        sortDir: "asc",
      }),
    ])
      .then(([guideResponse, destinationResponse]) => {
        const value = guideResponse.data.data;
        if (value) {
          setProfile(value);
          setBio(value.bio);
          setExperience(value.experience);
          setSpecialization(value.specialization.join(", "));
          setLanguages(value.languages.join(", "));
          setCertifications(value.certifications.join(", "));
          setDestinationIds(value.destinations.map((item) => item.id));
          setDailyRate(Number.isFinite(Number(value.dailyRate)) && Number(value.dailyRate) > 0 ? String(value.dailyRate) : "");
          setRateCurrency(value.rateCurrency || "NPR");
        }
        setDestinations(destinationResponse.data.data?.content ?? []);
      })
      .catch((requestError) => setError(getApiError(requestError).message))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const rate = Number(dailyRate);
    if (!Number.isFinite(rate) || rate < 1) {
      setError("Daily service rate must be at least 1.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await guideService.update({
        bio: bio.trim(),
        experience,
        specialization: split(specialization),
        destinations: destinationIds,
        languages: split(languages),
        certifications: split(certifications),
        dailyRate: rate,
        rateCurrency,
      });
      setProfile(response.data.data ?? profile);
      setNotice(response.data.message || "Guide profile updated.");
    } catch (requestError) {
      const details = getApiError(requestError);
      setError(
        details.message === "Request contains invalid or unsupported JSON"
          ? "The running backend is using the previous guide-profile contract. Restart the backend application, then save again."
          : details.message,
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="grid min-h-52 place-items-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-[#b31919]" />
      </div>
    );

  const personalName =
    [userDTO?.firstName, userDTO?.lastName].filter(Boolean).join(" ") ||
    userDTO?.fullName ||
    userDTO?.username ||
    profile?.name ||
    "Guide";

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="rounded-2xl border border-[#eae3dc] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {profile?.profileImage ? (
            <img
              src={mediaUrl(profile.profileImage)}
              alt={personalName}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="grid h-24 w-24 place-items-center rounded-full bg-[#1e1611] text-xl font-bold text-white">
              {personalName
                .split(/\s+/)
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-[#b31919]">
              Freelance guide account
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold">
              {personalName}
            </h1>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {Number(profile?.rating ?? 0).toFixed(1)}
              </span>
              <span className="font-semibold text-[#b31919]">
                {profile?.availability ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>
          <Link
            to="/profile/edit"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#d8cec0] px-4 py-2.5 text-sm font-bold text-[#40382f] hover:bg-[#faf7f4]"
          >
            <Pencil className="h-4 w-4" /> Edit personal details
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border border-[#eae3dc] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#b31919]">
              Private account information
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold">
              Personal details
            </h2>
          </div>
          <p className="text-xs text-gray-500">
            These details are not part of your public guide biography.
          </p>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <PersonalDetail icon={<UserRound />} label="Full name" value={personalName} />
          <PersonalDetail icon={<Mail />} label="Email" value={display(userDTO?.email)} />
          <PersonalDetail icon={<Phone />} label="Phone" value={display(userDTO?.phone)} />
          <PersonalDetail icon={<ShieldCheck />} label="Role" value={display(userDTO?.role)} />
          <PersonalDetail icon={<BadgeCheck />} label="Verification" value={display(userDTO?.verificationStatus ?? userDTO?.guideApprovalStatus)} />
          <PersonalDetail icon={<ShieldCheck />} label="Account status" value={display(userDTO?.accountStatus)} />
        </div>
      </section>

      <section className="rounded-2xl border border-[#eae3dc] bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl font-bold">Professional profile</h2>
        <p className="mt-1 text-sm text-gray-500">
          This information appears on your public guide profile.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Textarea
            label="Bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            minLength={20}
            maxLength={2000}
            rows={6}
            required
            className="sm:col-span-2"
          />
          <Input
            label="Experience (years)"
            type="number"
            min="0"
            max="80"
            value={experience}
            onChange={(event) => setExperience(Number(event.target.value))}
            required
          />
          <Input
            label="Daily service rate"
            type="number"
            min="1"
            step="0.01"
            value={dailyRate}
            onChange={(event) => setDailyRate(event.target.value)}
            placeholder="For example, 5000"
            required
          />
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold">Rate currency</span>
            <select value={rateCurrency} onChange={(event) => setRateCurrency(event.target.value)} className="min-h-11 w-full rounded-lg border border-[#d8cec0] bg-white px-3 py-2.5 text-sm">
              <option value="NPR">NPR</option>
              <option value="USD">USD</option>
            </select>
          </label>
          <Input
            label="Specializations"
            value={specialization}
            onChange={(event) => setSpecialization(event.target.value)}
            required
          />
          <Input
            label="Languages"
            value={languages}
            onChange={(event) => setLanguages(event.target.value)}
            required
          />
          <Input
            label="Certifications"
            value={certifications}
            onChange={(event) => setCertifications(event.target.value)}
            required
          />
          <fieldset className="sm:col-span-2">
            <legend className="text-sm font-semibold">Destination expertise</legend>
            <div className="mt-2 grid gap-2 rounded-xl border border-[#d8cec0] p-3 sm:grid-cols-2">
              {destinations.map((destination) => (
                <label
                  key={destination.id}
                  className="flex gap-2 rounded-lg p-2 text-sm hover:bg-[#faf7f4]"
                >
                  <input
                    type="checkbox"
                    checked={destinationIds.includes(destination.id)}
                    onChange={(event) =>
                      setDestinationIds((current) =>
                        event.target.checked
                          ? [...current, destination.id]
                          : current.filter((id) => id !== destination.id),
                      )
                    }
                  />
                  {destination.name}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        {error && (
          <p role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="mt-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
            {notice}
          </p>
        )}
        <div className="mt-6 flex justify-end">
          <Button type="submit" loading={saving}>
            <Save className="h-4 w-4" /> Save professional profile
          </Button>
        </div>
      </section>
    </form>
  );
}

function PersonalDetail({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#e9e1da] bg-[#fcfaf7] p-4">
      <div className="flex items-center gap-2 text-[#b31919]">
        <span className="h-4 w-4">{icon}</span>
        <p className="text-xs font-bold uppercase tracking-wide text-[#897b70]">
          {label}
        </p>
      </div>
      <p className="mt-3 break-words text-sm font-semibold text-[#2c2520]">
        {value}
      </p>
    </div>
  );
}
