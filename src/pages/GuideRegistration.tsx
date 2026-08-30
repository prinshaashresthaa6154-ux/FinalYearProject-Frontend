import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Plus, Trash2 } from "lucide-react";
import api, { getApiError } from "../api/axios";
import { Button, FileUpload, ImageUploader, Input, Textarea } from "../components/ui";
import { authService, type VerificationDocumentType } from "../services/authService";
import type { ApiResponse, PageResponse } from "../types/api";

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/;
const documentTypes: VerificationDocumentType[] = ["GOVERNMENT_ID", "BUSINESS_REGISTRATION", "LICENSE", "CERTIFICATION", "PAN_VAT", "OWNER_IDENTITY", "GUIDE_CERTIFICATION", "GUIDE_LICENSE", "OTHER"];
const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
const MAX_REQUEST_SIZE = 50 * 1024 * 1024;

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  bio: string;
  experience: string;
  specialization: string;
  languages: string;
  certifications: string;
};

type DocumentEntry = {
  id: number;
  type: VerificationDocumentType;
  number: string;
  file: File | null;
};

const initialForm: FormState = {
  firstName: "", lastName: "", email: "", phone: "", password: "", bio: "", experience: "",
  specialization: "", languages: "", certifications: "",
};

const splitList = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);
const phonePattern = /^\+?[0-9][0-9\s().-]{6,24}$/;
type DestinationOption = { id: number; name: string; province?: string; district?: string };
let nextDocumentId = 0;
const createDocument = (): DocumentEntry => ({ id: nextDocumentId++, type: "GUIDE_LICENSE", number: "", file: null });

type GuideRegistrationProps = {
  embedded?: boolean;
};

export default function GuideRegistration({ embedded = false }: GuideRegistrationProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialForm);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [documents, setDocuments] = useState<DocumentEntry[]>(() => [createDocument()]);
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [destinationIds, setDestinationIds] = useState<number[]>([]);
  const [destinationsLoading, setDestinationsLoading] = useState(true);
  const [destinationsError, setDestinationsError] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (name: keyof FormState, value: string) => setForm((current) => ({ ...current, [name]: value }));

  useEffect(() => {
    let cancelled = false;
    api.get<ApiResponse<PageResponse<DestinationOption>>>("/api/destinations", { params: { page: 0, size: 100, sortBy: "name", sortDir: "asc" } })
      .then((response) => {
        if (!cancelled) setDestinations(response.data.data?.content ?? []);
      })
      .catch((requestError) => {
        if (!cancelled) setDestinationsError(getApiError(requestError).message);
      })
      .finally(() => {
        if (!cancelled) setDestinationsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const toggleDestination = (id: number) => setDestinationIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!profileImage) return setError("Upload a profile image.");
    if (profileImage.size > MAX_PROFILE_IMAGE_SIZE) return setError("Profile image must be 5 MB or smaller.");
    if (documents.some((entry) => !entry.number.trim() || !entry.file)) return setError("Provide a document type, number, and file for every document.");
    if (documents.some((entry) => (entry.file?.size ?? 0) > MAX_DOCUMENT_SIZE)) return setError("Each verification document must be 10 MB or smaller.");
    const uploadSize = profileImage.size + documents.reduce((total, entry) => total + (entry.file?.size ?? 0), 0);
    if (uploadSize > MAX_REQUEST_SIZE) return setError("The complete upload must be 50 MB or smaller.");
    if (!form.firstName.trim() || form.firstName.trim().length > 75) return setError("First name is required and must be 75 characters or fewer.");
    if (!form.lastName.trim() || form.lastName.trim().length > 75) return setError("Last name is required and must be 75 characters or fewer.");
    if (!phonePattern.test(form.phone.trim())) return setError("Enter a valid phone number.");
    if (!passwordPattern.test(form.password)) return setError("Password must be 8-72 characters with uppercase, lowercase, a number, and a special character.");
    if (form.bio.trim().length < 20 || form.bio.trim().length > 2000) return setError("Bio must be between 20 and 2000 characters.");
    const specializations = splitList(form.specialization);
    const languages = splitList(form.languages);
    const certifications = splitList(form.certifications);
    if (specializations.length < 1 || specializations.length > 20) return setError("Enter between 1 and 20 specializations.");
    if (languages.length < 1 || languages.length > 20) return setError("Enter between 1 and 20 languages.");
    if (certifications.length < 1 || certifications.length > 20) return setError("Enter between 1 and 20 certifications.");
    if (destinationIds.length > 30) return setError("Select no more than 30 destinations.");
    const experience = Number(form.experience);
    if (!Number.isInteger(experience) || experience < 0 || experience > 80) return setError("Experience must be a whole number between 0 and 80.");

    try {
      setIsSubmitting(true);
      const response = await authService.registerGuide({
        firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), phone: form.phone.trim(), password: form.password,
        bio: form.bio.trim(), experience, specializations, destinationExpertise: destinationIds,
        languages, certifications, documentTypes: documents.map((entry) => entry.type), documentNumbers: documents.map((entry) => entry.number.trim()),
      }, profileImage, documents.map((entry) => entry.file as File));
      if (!response.data.success || !response.data.data) throw new Error(response.data.message || "Guide registration failed.");
      navigate("/otp", { replace: true, state: { email: form.email.trim(), role: "FREELANCE_GUIDE", verificationStatus: response.data.data?.verificationStatus || "PENDING", message: response.data.message || "Your guide application was submitted. Verify your email to continue." } });
    } catch (requestError) {
      const apiError = getApiError(requestError);
      setError(Object.values(apiError.validationErrors).join(" ") || apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={embedded ? "" : "min-h-screen bg-[#f6f1e9] px-4 py-10 sm:px-6"}>
      <form onSubmit={submit} className={embedded ? "" : "mx-auto max-w-4xl rounded-2xl border-t-4 border-[#a62922] bg-white p-6 shadow-sm sm:p-9"}>
        {!embedded && <Link to="/register?role=guide" className="text-sm font-bold text-[#a62922] hover:underline">Back to account registration</Link>}
        <p className={embedded ? "text-xs font-bold uppercase tracking-[0.2em] text-[#a62922]" : "mt-7 text-xs font-bold uppercase tracking-[0.2em] text-[#a62922]"}>Partner application</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-[#241f1a] sm:text-4xl">Become a freelance guide</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#786d63]">Tell travelers what makes your Nepal experience special. Your profile and documents will be reviewed before you can accept bookings.</p>

        <section className="mt-9 border-t border-[#e9e0d9] pt-7">
          <SectionHeading number="01" title="Personal details" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Input label="First name" value={form.firstName} onChange={(event) => update("firstName", event.target.value)} required maxLength={75} />
            <Input label="Last name" value={form.lastName} onChange={(event) => update("lastName", event.target.value)} required maxLength={75} />
            <Input label="Email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required maxLength={255} />
            <Input label="Phone" type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} required />
            <Input label="Create password" type="password" value={form.password} onChange={(event) => update("password", event.target.value)} autoComplete="new-password" required />
          </div>
        </section>

        <section className="mt-9 border-t border-[#e9e0d9] pt-7">
          <SectionHeading number="02" title="Professional profile" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Textarea label="Bio" value={form.bio} onChange={(event) => update("bio", event.target.value)} placeholder="Share your approach to guiding travelers in Nepal." required minLength={20} rows={5} className="sm:col-span-2" maxLength={2000} />
            <Input label="Experience (years)" type="number" min="0" max="80" value={form.experience} onChange={(event) => update("experience", event.target.value)} required />
            <Input label="Specialization" value={form.specialization} onChange={(event) => update("specialization", event.target.value)} placeholder="Trekking, culture, wildlife" required />
            <Input label="Languages" value={form.languages} onChange={(event) => update("languages", event.target.value)} placeholder="Nepali, English, Hindi" required />
            <Input label="Certifications" value={form.certifications} onChange={(event) => update("certifications", event.target.value)} placeholder="NMA license, First Aid" required />
           <fieldset className="sm:col-span-2"><legend className="text-sm font-semibold text-[#40382f]">Destinations <span className="font-normal text-[#897b70]">(optional)</span></legend>{destinationsLoading ? <p className="mt-2 text-sm text-[#786d63]">Loading available destinations...</p> : destinationsError ? <p className="mt-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">Destinations could not be loaded. You can continue without selecting any.</p> : destinations.length === 0 ? <p className="mt-2 rounded-lg border border-[#e5dbd3] bg-[#faf7f3] px-4 py-3 text-sm text-[#786d63]">No destinations are available to select yet.</p> : <div className="mt-2 grid gap-2 rounded-lg border border-[#d8cec0] p-3 sm:grid-cols-2">{destinations.map((destination) => <label key={destination.id} className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 hover:bg-[#f8f3ed]"><input type="checkbox" checked={destinationIds.includes(destination.id)} onChange={() => toggleDestination(destination.id)} className="mt-0.5 h-4 w-4 accent-[#a62922]" /><span><span className="block text-sm font-semibold text-[#40382f]">{destination.name}</span>{(destination.district || destination.province) && <span className="block text-xs text-[#897b70]">{[destination.district, destination.province].filter(Boolean).join(", ")}</span>}</span></label>)}</div>}</fieldset>
          </div>
          <p className="mt-3 text-xs text-[#897b70]">Separate multiple specializations, languages, or certifications with commas.</p>
        </section>

        <section className="mt-9 border-t border-[#e9e0d9] pt-7">
          <SectionHeading number="03" title="Photo and documents" />
          <div className="mt-5 max-w-md">
            <ImageUploader label="Profile image (JPG or PNG, maximum 5 MB)" accept="image/jpeg,image/png,.jpg,.jpeg,.png" onChange={setProfileImage} />
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-display text-lg font-bold text-[#241f1a]">Verification documents</h3><p className="mt-1 text-xs text-[#897b70]">PDF, JPG, or PNG. Maximum 10 MB per document.</p></div><Button type="button" variant="secondary" onClick={() => setDocuments((current) => [...current, createDocument()])}><Plus size={16} aria-hidden="true" />Add document</Button></div>
          <div className="mt-4 space-y-4">{documents.map((entry, index) => <div key={entry.id} className="grid gap-4 rounded-xl border border-[#e5dbd3] p-4 sm:grid-cols-[1fr_1fr_1.2fr_auto] sm:items-end"><label className="block space-y-1.5"><span className="text-sm font-semibold text-[#40382f]">Document type</span><select value={entry.type} onChange={(event) => setDocuments((current) => current.map((item) => item.id === entry.id ? { ...item, type: event.target.value as VerificationDocumentType } : item))} className="min-h-10 w-full rounded-lg border border-[#d8cec0] bg-white px-3 py-2 text-sm">{documentTypes.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}</select></label><Input label="Document number" value={entry.number} onChange={(event) => setDocuments((current) => current.map((item) => item.id === entry.id ? { ...item, number: event.target.value } : item))} required /><div><FileUpload label="Document file" accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png" onChange={(event) => setDocuments((current) => current.map((item) => item.id === entry.id ? { ...item, file: event.target.files?.[0] ?? null } : item))} required />{entry.file && <p className="mt-1 break-all text-xs font-semibold text-[#47735b]">{entry.file.name}</p>}</div>{documents.length > 1 && <Button type="button" variant="ghost" onClick={() => setDocuments((current) => current.filter((item) => item.id !== entry.id))} aria-label={`Remove document ${index + 1}`}><Trash2 size={18} aria-hidden="true" /></Button>}</div>)}</div>
        </section>

        {error && <p role="alert" className="mt-7 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
         <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-[#e9e0d9] pt-6"><p className="max-w-md text-xs leading-5 text-[#897b70]">By submitting, you confirm that the information and uploaded documents are accurate.</p><Button type="submit" loading={isSubmitting} disabled={destinationsLoading}>Submit application</Button></div>
      </form>
    </main>
  );
}

function SectionHeading({ number, title }: { number: string; title: string }) {
  return <div className="flex items-center gap-3"><span className="text-xs font-bold tracking-widest text-[#a62922]">{number}</span><h2 className="font-display text-xl font-bold text-[#241f1a]">{title}</h2></div>;
}
