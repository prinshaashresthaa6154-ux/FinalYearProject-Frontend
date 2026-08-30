import { ArrowRight, CheckCircle2, Clock3, FileSearch, LogOut, RefreshCw, RotateCcw, ShieldCheck, ShieldX } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { getApprovalState } from "../auth/roles";
import { useAuth } from "../context/AuthContext";
import { authService, getAuthUser } from "../services/authService";

type Status = "PENDING" | "APPROVED" | "REJECTED" | "RESUBMISSION_REQUIRED";
type Verification = { status: Status; reason?: string; resubmissionAllowed?: boolean };

const normalizeStatus = (status?: string | null): Status => {
  const value = status?.toUpperCase().replaceAll(" ", "_");
  if (value === "APPROVED" || value === "REJECTED" || value === "RESUBMISSION_REQUIRED") return value;
  return "PENDING";
};

const statusCopy: Record<Status, { title: string; description: string; label: string }> = {
  PENDING: { title: "Application under review", description: "Verify your email using the message we sent you. Your profile and supporting documents must also be approved before guide tools become available.", label: "Pending" },
  APPROVED: { title: "You are approved", description: "Your guide profile is verified and ready to welcome travelers on Nepal Yatra.", label: "Approved" },
  REJECTED: { title: "Application rejected", description: "Your application was not approved in its current form. Review the feedback below before applying again.", label: "Rejected" },
  RESUBMISSION_REQUIRED: { title: "Resubmission required", description: "The verification team needs an updated detail or document before your guide profile can be approved.", label: "Resubmission Required" },
};

export default function GuideVerificationStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, userDTO, updateUser, logout } = useAuth();
  const navigationState = location.state as { status?: string; message?: string; email?: string; emailVerified?: boolean } | null;
  const emailVerified = userDTO?.emailVerified ?? navigationState?.emailVerified ?? false;
  const [verification, setVerification] = useState<Verification>({ status: normalizeStatus(userDTO?.verificationStatus ?? navigationState?.status), reason: userDTO?.rejectionReason, resubmissionAllowed: userDTO?.resubmissionAllowed });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  // The status page refreshes only when the authenticated token changes or the user checks manually.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const refreshStatus = useCallback(async () => {
    if (!token) return;
    setIsRefreshing(true); setError("");
    try {
      const response = await authService.getCurrentUser(token);
      const user = getAuthUser(response.data);
      if (user) updateUser(user);
      setVerification({ status: normalizeStatus(user?.verificationStatus), reason: user?.rejectionReason, resubmissionAllowed: user?.resubmissionAllowed });
      if (getApprovalState(user) === "APPROVED") navigate("/guide/dashboard", { replace: true });
    } catch { setError("Status could not be refreshed right now."); } finally { setIsRefreshing(false); }
  }, [token]);

  useEffect(() => { void refreshStatus(); }, [refreshStatus]);

  const copy = statusCopy[verification.status];
  const isActionRequired = verification.status === "REJECTED" || verification.status === "RESUBMISSION_REQUIRED";
  const Icon = verification.status === "APPROVED" ? ShieldCheck : verification.status === "REJECTED" ? ShieldX : verification.status === "RESUBMISSION_REQUIRED" ? RotateCcw : Clock3;

  return <main className="min-h-screen bg-[#f5f1eb] text-[#2b2420]"><header className="border-b border-[#ded6cf] bg-[#251d18] text-white"><div className="mx-auto flex min-h-20 max-w-5xl items-center justify-between px-5 sm:px-8"><Link to="/" className="font-display text-xl font-bold">Nepal Yatra</Link>{token && <button type="button" onClick={() => { void logout().then(() => navigate("/login")); }} className="inline-flex items-center gap-2 text-sm font-semibold text-[#ddd0c7] hover:text-white"><LogOut className="h-4 w-4" /> Sign out</button>}</div></header>
    <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20"><section className="border-t-4 border-[#a62922] bg-white px-6 py-9 shadow-[0_16px_45px_rgba(53,41,34,0.08)] sm:px-10 sm:py-12"><div className={`grid h-16 w-16 place-items-center rounded-full ${verification.status === "APPROVED" ? "bg-green-50 text-green-700" : isActionRequired ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}><Icon className="h-8 w-8" /></div><p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-[#a62922]">Guide verification</p><h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{copy.title}</h1><p className="mt-4 max-w-2xl leading-7 text-[#71655d]">{copy.description}</p>{navigationState?.message && <p role="status" className="mt-5 rounded-lg bg-[#f8f1eb] px-4 py-3 text-sm text-[#6f6158]">{navigationState.message}</p>}
      <div className="mt-9 grid gap-4 sm:grid-cols-3"><StatusItem icon={CheckCircle2} label="Email" value={emailVerified ? "Verified" : "Verification required"} complete={emailVerified} /><StatusItem icon={FileSearch} label="Documents" value={verification.status === "PENDING" ? "Under review" : "Reviewed"} complete={verification.status === "APPROVED"} /><StatusItem icon={verification.status === "APPROVED" ? ShieldCheck : Clock3} label="Guide access" value={verification.status === "APPROVED" ? "Available" : "Awaiting approval"} complete={verification.status === "APPROVED"} /></div>
      {isActionRequired && <div className="mt-8 border-l-4 border-red-700 bg-red-50 px-5 py-4"><p className="text-xs font-bold uppercase text-red-800">Reviewer feedback</p><p className="mt-2 text-sm leading-6 text-red-950">{verification.reason || "Please review your information and supporting document, then submit an updated application."}</p></div>}
      {error && <p role="alert" className="mt-6 text-sm text-red-700">{error}</p>}<div className="mt-9 flex flex-wrap items-center gap-3 border-t border-[#e5dfda] pt-6">{!emailVerified && (navigationState?.email || userDTO?.email) ? <Link to="/otp" state={{ email: navigationState?.email || userDTO?.email, role: "FREELANCE_GUIDE", verificationStatus: verification.status }} className="inline-flex items-center gap-2 rounded-md bg-[#a62922] px-5 py-3 text-sm font-bold text-white hover:bg-[#89221d]">Verify email <ArrowRight className="h-4 w-4" /></Link> : isActionRequired && (verification.resubmissionAllowed !== false) ? <Link to="/register/guide" state={{ resubmission: true }} className="inline-flex items-center gap-2 rounded-md bg-[#a62922] px-5 py-3 text-sm font-bold text-white hover:bg-[#89221d]">Update and resubmit <ArrowRight className="h-4 w-4" /></Link> : token ? <button type="button" onClick={() => void refreshStatus()} disabled={isRefreshing} className="inline-flex items-center gap-2 rounded-md bg-[#a62922] px-5 py-3 text-sm font-bold text-white disabled:bg-[#b98a86]"><RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /> {isRefreshing ? "Checking..." : "Check status"}</button> : <Link to="/login" className="inline-flex items-center gap-2 rounded-md bg-[#a62922] px-5 py-3 text-sm font-bold text-white">Sign in to check status <ArrowRight className="h-4 w-4" /></Link>}<span className="text-xs leading-5 text-[#81756d]">Verification is handled by the Nepal Yatra team.</span></div></section></div></main>;
}

function StatusItem({ icon: Icon, label, value, complete }: { icon: typeof Clock3; label: string; value: string; complete: boolean }) { return <div className="border border-[#e5dfda] p-4"><Icon className={`h-5 w-5 ${complete ? "text-[#47735b]" : "text-[#9b6c31]"}`} /><p className="mt-4 text-xs font-bold uppercase text-[#81756d]">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>; }
