import { LoaderCircle, Save } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { getApiError } from "../../../api/axios";
import { Button, Input } from "../../../components/ui";
import { freelanceGuideService, type FreelanceGuideProfileInput } from "../../../services/freelanceGuideService";

const split = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

export default function LegacyFreelanceProfile() {
  const [exists, setExists] = useState(false);
  const [experience, setExperience] = useState(0);
  const [languages, setLanguages] = useState("");
  const [certificate, setCertificate] = useState("");
  const [availability, setAvailability] = useState(true);
  const [specialization, setSpecialization] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    freelanceGuideService.me().then((response) => {
      const profile = response.data.data;
      if (!profile) return;
      setExists(true);
      setExperience(profile.experience);
      setLanguages(profile.languages.join(", "));
      setCertificate(profile.certificate);
      setAvailability(profile.availability);
      setSpecialization(profile.specialization.join(", "));
      setApprovalStatus(profile.approvalStatus ?? "");
    }).catch((requestError) => {
      if (getApiError(requestError).status !== 404) setError(getApiError(requestError).message);
    }).finally(() => setLoading(false));
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const input: FreelanceGuideProfileInput = {
      experience,
      languages: split(languages),
      certificate: certificate.trim(),
      availability,
      specialization: split(specialization),
    };
    try {
      const response = await (exists ? freelanceGuideService.update(input) : freelanceGuideService.create(input));
      setExists(true);
      setApprovalStatus(response.data.data?.approvalStatus ?? "PENDING");
      setNotice(response.data.message || (exists ? "Freelance profile updated and resubmitted." : "Freelance profile submitted."));
    } catch (requestError) {
      const apiError = getApiError(requestError);
      setError(Object.values(apiError.validationErrors).join(" ") || apiError.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="grid min-h-52 place-items-center"><LoaderCircle className="h-8 w-8 animate-spin text-[#b31919]" /></div>;

  return <form onSubmit={submit} className="mx-auto max-w-3xl rounded-lg border border-[#e2d9d1] bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-[#b31919]">Legacy profile</p><h2 className="mt-2 font-display text-3xl font-bold">Freelance guide submission</h2><p className="mt-2 text-sm text-[#786d63]">{exists ? "Updating this profile resubmits it for approval." : "Create your legacy freelance profile for approval."}</p></div>{approvalStatus && <span className="border border-[#d8cec0] px-3 py-1 text-xs font-bold">{approvalStatus}</span>}</div><div className="mt-7 grid gap-4 sm:grid-cols-2"><Input label="Experience (years)" type="number" min="0" max="80" value={experience} onChange={(event) => setExperience(Number(event.target.value))} required /><Input label="Certificate" value={certificate} onChange={(event) => setCertificate(event.target.value)} placeholder="Government Licensed Trekking Guide" required /><Input label="Languages" value={languages} onChange={(event) => setLanguages(event.target.value)} placeholder="Nepali, English, Hindi" required /><Input label="Specializations" value={specialization} onChange={(event) => setSpecialization(event.target.value)} placeholder="Trekking, Cultural Tours" required /><label className="flex items-center gap-3 rounded-lg border border-[#d8cec0] p-4 text-sm font-semibold sm:col-span-2"><input type="checkbox" checked={availability} onChange={(event) => setAvailability(event.target.checked)} className="h-4 w-4 accent-[#b31919]" /> Available for guide assignments</label></div><p className="mt-3 text-xs text-[#897b70]">Separate multiple languages and specializations with commas.</p>{error && <p role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}{notice && <p role="status" className="mt-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p>}<div className="mt-6 flex justify-end"><Button type="submit" loading={saving}><Save className="h-4 w-4" /> {exists ? "Update and resubmit" : "Submit profile"}</Button></div></form>;
}
