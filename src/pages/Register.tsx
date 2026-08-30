import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { getApiError } from "../api/axios";
import { authService } from "../services/authService";
import AdminRegistration from "./AdminRegistration";
import GuideRegistration from "./GuideRegistration";
import { Button } from "../components/ui";

type RegisterTab = "user" | "guide" | "admin";
type RegisterForm = { fullName: string; email: string; password: string };

const tabs: Array<{ id: RegisterTab; label: string }> = [
  { id: "user", label: "User" },
  { id: "guide", label: "Guide" },
  { id: "admin", label: "Admin" },
];

const isRegisterTab = (value: string | null): value is RegisterTab =>
  tabs.some((tab) => tab.id === value);

export default function Register() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("role");
  const activeTab: RegisterTab = isRegisterTab(requestedTab) ? requestedTab : "user";
  const [form, setForm] = useState<RegisterForm>({ fullName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectTab = (tab: RegisterTab) => {
    setErrorMessage("");
    setSearchParams(tab === "user" ? {} : { role: tab });
  };

  const submitUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    const email = form.email.trim();

    try {
      const response = await authService.register({
        fullName: form.fullName.trim(),
        email,
        password: form.password,
        role: "USER",
      });
      if (!response.data.success) throw new Error(response.data.message || "Registration failed");
      navigate("/verify-account", {
        state: { email, message: response.data.message, role: "USER" },
      });
    } catch (error) {
      const apiError = getApiError(error);
      setErrorMessage(Object.values(apiError.validationErrors).join(" ") || apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f8f8] px-4 py-10 text-black sm:px-6">
      <div className={`mx-auto ${activeTab === "user" ? "max-w-xl" : activeTab === "guide" ? "max-w-4xl" : "max-w-3xl"}`}>
        <header className="text-center">
          <Link to="/" className="font-display text-2xl font-bold text-black">Nepal Yatra</Link>
          <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Create your account</h1>
          <p className="mt-2 text-sm text-black/60">Choose how you will use Nepal Yatra.</p>
        </header>

        <section className="mt-8 rounded-xl border border-black/10 border-t-4 border-t-[#AF1D1D] bg-white p-5 shadow-sm sm:p-8">
          <div role="tablist" aria-label="Account type" className="grid grid-cols-3 border-b border-black/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`register-tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`register-panel-${tab.id}`}
                onClick={() => selectTab(tab.id)}
                className={`min-h-12 border-b-2 px-3 text-sm font-semibold transition ${activeTab === tab.id ? "border-[#AF1D1D] text-[#AF1D1D]" : "border-transparent text-black/55 hover:bg-black/[0.04] hover:text-black"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div id={`register-panel-${activeTab}`} role="tabpanel" aria-labelledby={`register-tab-${activeTab}`} className="mt-7">
            {activeTab === "user" && (
              <form onSubmit={submitUser} className="space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1D78AF]">Traveler account</p>
                  <h2 className="mt-2 font-display text-2xl font-bold">Start planning your journey</h2>
                </div>
                <Field icon={User} label="Full name">
                  <input name="fullName" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} autoComplete="name" required minLength={2} maxLength={150} className="auth-input" placeholder="Enter your full name" />
                </Field>
                <Field icon={Mail} label="Email">
                  <input type="email" name="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" required className="auth-input" placeholder="email@example.com" />
                </Field>
                <Field icon={Lock} label="Password">
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete="new-password" required minLength={8} maxLength={72} pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+" title="Use 8-72 characters with uppercase, lowercase, a number, and a special character." className="auth-input pr-12" placeholder="Create a strong password" />
                    <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-black/45 hover:text-black">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-black/55">Use 8-72 characters with uppercase, lowercase, a number, and a special character.</p>
                </Field>
                {errorMessage && <p role="alert" className="rounded-lg border border-[#AF1D1D]/20 bg-[#AF1D1D]/10 px-4 py-3 text-sm text-[#AF1D1D]">{errorMessage}</p>}
                <Button type="submit" loading={isSubmitting} className="min-h-12 w-full">
                  Create user account
                </Button>
                <div className="flex items-center gap-3 text-xs uppercase text-black/40"><span className="h-px flex-1 bg-black/10" /><span>or</span><span className="h-px flex-1 bg-black/10" /></div>
                <Button type="button" variant="secondary" onClick={() => authService.startGoogleOAuth()} className="min-h-12 w-full">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" className="h-5 w-5" />
                  Continue with Google
                </Button>
              </form>
            )}
            {activeTab === "guide" && <GuideRegistration embedded />}
            {activeTab === "admin" && <AdminRegistration embedded />}
          </div>

          <p className="mt-8 border-t border-black/10 pt-6 text-center text-sm text-black/60">
            Already have an account? <Link to="/login" className="font-semibold text-[#1D78AF] hover:underline">Login</Link>
          </p>
        </section>
      </div>
    </main>
  );
}

function Field({ icon: Icon, label, children }: { icon: typeof User; label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-2 flex items-center gap-2 text-sm font-semibold"><Icon size={16} aria-hidden="true" />{label}</span>{children}</label>;
}
