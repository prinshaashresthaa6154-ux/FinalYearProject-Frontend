import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Plus, Trash2 } from "lucide-react";
import { getApiError } from "../api/axios";
import { Button, FileUpload, ImageUploader, Input, Textarea } from "../components/ui";
import { authService, type VerificationDocumentType } from "../services/authService";

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/;
const documentTypes: VerificationDocumentType[] = [
  "GOVERNMENT_ID",
  "BUSINESS_REGISTRATION",
  "LICENSE",
  "CERTIFICATION",
  "PAN_VAT",
  "OWNER_IDENTITY",
  "GUIDE_CERTIFICATION",
  "GUIDE_LICENSE",
  "OTHER",
];

const steps = ["Personal", "Business", "Profile", "Documents", "Review", "Submit"];

type RegistrationForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  businessName: string;
  businessAddress: string;
  businessRegistrationNumber: string;
  businessDescription: string;
};

type DocumentEntry = {
  id: number;
  type: VerificationDocumentType;
  number: string;
  file: File | null;
};

const initialForm: RegistrationForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  businessName: "",
  businessAddress: "",
  businessRegistrationNumber: "",
  businessDescription: "",
};

let nextDocumentId = 0;
const createDocument = (): DocumentEntry => ({
  id: nextDocumentId++,
  type: "BUSINESS_REGISTRATION",
  number: "",
  file: null,
});

type AdminRegistrationProps = {
  embedded?: boolean;
};

export default function AdminRegistration({ embedded = false }: AdminRegistrationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<RegistrationForm>(initialForm);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [documents, setDocuments] = useState<DocumentEntry[]>(() => [createDocument()]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isResubmission = Boolean(location.state?.resubmission);

  const update = (name: keyof RegistrationForm, value: string) =>
    setForm((current) => ({ ...current, [name]: value }));

  const validateStep = () => {
    if (step === 0) {
      if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phone.trim()) {
        return "Complete all personal details before continuing.";
      }
      if (!passwordPattern.test(form.password)) {
        return "Password must be 8-72 characters with uppercase, lowercase, a number, and a special character.";
      }
    }
    if (step === 1 && (!form.businessName.trim() || !form.businessAddress.trim() || !form.businessRegistrationNumber.trim() || !form.businessDescription.trim())) {
      return "Complete all business details before continuing.";
    }
    if (step === 1 && (form.businessDescription.trim().length < 20 || form.businessDescription.trim().length > 2000)) {
      return "Business description must be between 20 and 2000 characters.";
    }
    if (step === 2 && !profileImage) return "Upload a profile image before continuing.";
    if (step === 3 && documents.some((entry) => !entry.number.trim() || !entry.file)) {
      return "Provide a document type, document number, and file for every document.";
    }
    return "";
  };

  const next = () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!profileImage || documents.some((entry) => !entry.file)) return;

    setIsSubmitting(true);
    try {
      const response = await authService.registerAdmin(
        {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
          businessName: form.businessName.trim(),
          businessAddress: form.businessAddress.trim(),
          businessRegistrationNumber: form.businessRegistrationNumber.trim(),
          businessDescription: form.businessDescription.trim(),
          documentTypes: documents.map((entry) => entry.type),
          documentNumbers: documents.map((entry) => entry.number.trim()),
        },
        profileImage,
        documents.map((entry) => entry.file as File),
      );
      navigate("/verify-account", {
        replace: true,
        state: {
          role: "ADMIN",
          email: form.email.trim(),
          message: response.data.message || "Your admin application was submitted for review.",
          verificationStatus: "PENDING",
        },
      });
    } catch (requestError) {
      const apiError = getApiError(requestError);
      const validationMessage = Object.entries(apiError.validationErrors)
        .map(([field, message]) => `${field}: ${message}`)
        .join(" ");
      setError(validationMessage || apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reviewRows = useMemo(
    () => [
      ["Name", `${form.firstName} ${form.lastName}`],
      ["Email", form.email],
      ["Phone", form.phone],
      ["Business", form.businessName],
      ["Address", form.businessAddress],
      ["Registration number", form.businessRegistrationNumber],
      ["Description", form.businessDescription],
      ["Profile image", profileImage?.name || "Not selected"],
      ["Documents", documents.map((entry) => `${entry.type} / ${entry.number} / ${entry.file?.name || "Not selected"}`).join("; ")],
    ],
    [documents, form, profileImage],
  );

  return (
    <main className={embedded ? "" : "min-h-screen bg-[#f6f1e9] px-4 py-10 sm:px-6"}>
      <form onSubmit={submit} className={embedded ? "" : "mx-auto max-w-3xl rounded-2xl border-t-4 border-[#a62922] bg-white p-6 shadow-sm sm:p-9"}>
        {!embedded && <Link to="/register?role=admin" className="text-sm font-bold text-[#a62922] hover:underline">Back to account registration</Link>}
        <div className={embedded ? "flex flex-wrap items-end justify-between gap-3" : "mt-5 flex flex-wrap items-end justify-between gap-3"}>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#a62922]">{isResubmission ? "Resubmission" : "Partner application"}</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-[#241f1a]">Admin registration</h1>
          </div>
          <span className="text-sm font-semibold text-[#786d63]">Step {step + 1} of {steps.length}</span>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {steps.map((label, index) => <div key={label} className={`border-t-4 pt-2 text-xs font-bold ${index <= step ? "border-[#a62922] text-[#a62922]" : "border-[#ded4cb] text-[#9a8d80]"}`}>{index + 1}. {label}</div>)}
        </div>
        <p className="mt-6 text-sm text-[#786d63]">Your application and supporting documents will be reviewed before admin tools become available.</p>

        {step === 0 && <section className="mt-8 grid gap-4 sm:grid-cols-2"><Input label="First name" value={form.firstName} onChange={(event) => update("firstName", event.target.value)} required maxLength={75} /><Input label="Last name" value={form.lastName} onChange={(event) => update("lastName", event.target.value)} required maxLength={75} /><Input label="Email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required maxLength={255} /><Input label="Phone" type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} required /><Input label="Password" type="password" value={form.password} onChange={(event) => update("password", event.target.value)} autoComplete="new-password" required /></section>}
        {step === 1 && <section className="mt-8 grid gap-4 sm:grid-cols-2"><Input label="Business name" value={form.businessName} onChange={(event) => update("businessName", event.target.value)} required maxLength={180} /><Input label="Registration number" value={form.businessRegistrationNumber} onChange={(event) => update("businessRegistrationNumber", event.target.value)} required maxLength={100} /><Textarea label="Business address" value={form.businessAddress} onChange={(event) => update("businessAddress", event.target.value)} required rows={4} /><Textarea label="Business description" value={form.businessDescription} onChange={(event) => update("businessDescription", event.target.value)} required rows={4} /></section>}
        {step === 2 && <section className="mt-8"><h2 className="font-display text-xl font-bold">Profile image</h2><p className="mt-2 text-sm text-[#786d63]">Use a clear JPG or PNG image that represents you or your business.</p><div className="mt-5 max-w-md"><ImageUploader label="Upload profile image" accept="image/jpeg,image/png" onChange={setProfileImage} /></div></section>}
        {step === 3 && <section className="mt-8 space-y-4"><div className="flex items-center justify-between gap-3"><div><h2 className="font-display text-xl font-bold">Verification documents</h2><p className="mt-1 text-sm text-[#786d63]">Each document type, number, and file is submitted at the same index.</p></div><Button type="button" variant="secondary" onClick={() => setDocuments((current) => [...current, createDocument()])} aria-label="Add another document"><Plus size={16} aria-hidden="true" />Add document</Button></div>{documents.map((entry, index) => <div key={entry.id} className="grid gap-4 rounded-xl border border-[#e5dbd3] p-4 sm:grid-cols-[1fr_1fr_1.2fr_auto] sm:items-end"><label className="block space-y-1.5"><span className="text-sm font-semibold text-[#40382f]">Document type</span><select value={entry.type} onChange={(event) => setDocuments((current) => current.map((item) => item.id === entry.id ? { ...item, type: event.target.value as VerificationDocumentType } : item))} className="min-h-10 w-full rounded-lg border border-[#d8cec0] bg-white px-3 py-2 text-sm">{documentTypes.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}</select></label><Input label="Document number" value={entry.number} onChange={(event) => setDocuments((current) => current.map((item) => item.id === entry.id ? { ...item, number: event.target.value } : item))} required /><FileUpload label="Document file" accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png" onChange={(event) => setDocuments((current) => current.map((item) => item.id === entry.id ? { ...item, file: event.target.files?.[0] ?? null } : item))} required />{documents.length > 1 && <Button type="button" variant="ghost" onClick={() => setDocuments((current) => current.filter((item) => item.id !== entry.id))} aria-label={`Remove document ${index + 1}`}><Trash2 size={18} aria-hidden="true" /></Button>}</div>)}</section>}
        {step === 4 && <section className="mt-8"><h2 className="font-display text-xl font-bold">Review your application</h2><div className="mt-5 divide-y divide-[#e9e0d9] rounded-xl border border-[#e5dbd3]">{reviewRows.map(([label, value]) => <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_1fr] sm:gap-4"><span className="text-xs font-bold uppercase tracking-wide text-[#8b7568]">{label}</span><span className="break-words text-sm font-semibold text-[#2f2621]">{value || "Not provided"}</span></div>)}</div></section>}
        {step === 5 && <section className="mt-8 rounded-xl bg-[#f8f1eb] p-6"><h2 className="font-display text-2xl font-bold">Submit application</h2><p className="mt-3 text-sm leading-6 text-[#6f6158]">By submitting, you confirm that the information and documents above are accurate. The application will be sent securely as multipart/form-data and remain pending until reviewed.</p></section>}

        {error && <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
        <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-[#e5dbd3] pt-6"><Button type="button" variant="secondary" onClick={() => { setError(""); setStep((current) => Math.max(current - 1, 0)); }} disabled={step === 0 || isSubmitting}>Back</Button>{step < steps.length - 1 ? <Button type="button" onClick={next}>Continue</Button> : <Button type="submit" loading={isSubmitting}>Submit application</Button>}</div>
      </form>
    </main>
  );
}
