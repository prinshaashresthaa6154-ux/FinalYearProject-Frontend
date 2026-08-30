import axios from "axios";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileSearch,
  LogOut,
  RefreshCw,
  ShieldX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { getApprovalState, normalizeRole } from "../auth/roles";
import { useAuth } from "../context/AuthContext";
import {
  adminRegistrationService,
  type AdminVerificationStatus,
} from "../services/adminRegistrationService";
import { getAuthUser } from "../services/authService";

const normalizeStatus = (status?: string | null) => {
  const value = status?.trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (value === "APPROVED" || value === "VERIFIED") return "APPROVED";
  if (value === "REJECTED" || value === "RESUBMISSION_REQUIRED") return "REJECTED";
  return "PENDING";
};

export default function AdminVerificationStatusPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, userDTO, updateUser, logout } = useAuth();
  const navigationState = location.state as {
    status?: string;
    message?: string;
  } | null;
  const [verification, setVerification] = useState<AdminVerificationStatus>({
    status: normalizeStatus(userDTO?.verificationStatus ?? navigationState?.status),
    reason: userDTO?.rejectionReason,
    resubmissionAllowed: userDTO?.resubmissionAllowed,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState("");

  const refreshStatus = async () => {
    if (!token || normalizeRole(userDTO?.role) !== "ADMIN") return;
    setIsRefreshing(true);
    setRefreshError("");
    try {
      const response = await adminRegistrationService.getVerificationStatus();
      const status = getAuthUser(response.data);
      if (status) updateUser(status);
      const approvalState = getApprovalState(status);
      const normalizedStatus = approvalState === "APPROVED"
        ? "APPROVED"
        : normalizeStatus(status?.verificationStatus ?? status?.approvalStatus);
      setVerification({
        status: normalizedStatus,
        reason: status?.rejectionReason,
        resubmissionAllowed: status?.resubmissionAllowed,
      });
      if (normalizedStatus === "APPROVED") {
        navigate("/admin/dashboard", { replace: true });
      }
    } catch (error) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      setRefreshError(message || "Status could not be refreshed right now.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (verification.status === "APPROVED" && normalizeRole(userDTO?.role) === "ADMIN") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }
    void refreshStatus();
    // Refresh once when the authenticated session becomes available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userDTO?.role]);

  const isRejected = verification.status === "REJECTED";
  const Icon = isRejected ? ShieldX : Clock3;

  return (
    <main className="min-h-screen bg-[#f5f1eb] text-[#2b2420]">
      <header className="border-b border-[#ded6cf] bg-[#251d18] text-white">
        <div className="mx-auto flex min-h-20 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="font-display text-xl font-bold">Nepal Yatra</Link>
          {token && (
            <button type="button" onClick={() => { void logout().then(() => navigate("/login")); }} className="inline-flex items-center gap-2 text-sm font-semibold text-[#ddd0c7] hover:text-white">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <section className="border-t-4 border-[#a62922] bg-white px-6 py-9 shadow-[0_16px_45px_rgba(53,41,34,0.08)] sm:px-10 sm:py-12">
          <div className={`grid h-16 w-16 place-items-center rounded-full ${isRejected ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
            <Icon className="h-8 w-8" />
          </div>
          <p className="mt-7 text-xs font-bold uppercase text-[#a62922]">Admin account review</p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            {isRejected ? "APPLICATION REJECTED" : "PENDING VERIFICATION"}
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-[#71655d]">
            {isRejected
              ? "Your application needs attention before it can be approved."
              : "Your email has been verified and your admin registration with supporting documents was submitted successfully. Your account is waiting for approval, and the Admin Dashboard remains unavailable until approval."}
          </p>

          {navigationState?.message && (
            <p role="status" className="mt-5 rounded-lg bg-[#f8f1eb] px-4 py-3 text-sm text-[#6f6158]">
              {navigationState.message}
            </p>
          )}

          {isRejected && (
            <div className="mt-8 border-l-4 border-red-700 bg-red-50 px-5 py-4">
              <p className="text-xs font-bold uppercase text-red-800">Reason for rejection</p>
              <p className="mt-2 text-sm leading-6 text-red-950">
                {verification.reason || "The reviewer did not provide a reason."}
              </p>
            </div>
          )}

          {!isRejected && (
            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              <StatusItem icon={CheckCircle2} label="Application" value="Submitted" complete />
              <StatusItem icon={FileSearch} label="Documents" value="Under review" />
              <StatusItem icon={Clock3} label="Access" value="Awaiting approval" />
            </div>
          )}

          {refreshError && <p role="alert" className="mt-6 text-sm text-red-700">{refreshError}</p>}
          <div className="mt-9 flex flex-wrap items-center gap-3 border-t border-[#e5dfda] pt-6">
            {isRejected && verification.resubmissionAllowed ? (
              <Link to="/register/admin" state={{ resubmission: true }} className="inline-flex items-center gap-2 rounded-md bg-[#a62922] px-5 py-3 text-sm font-bold text-white hover:bg-[#89221d]">
                Update and resubmit <ArrowRight className="h-4 w-4" />
              </Link>
            ) : token ? (
              <button type="button" onClick={refreshStatus} disabled={isRefreshing} className="inline-flex items-center gap-2 rounded-md bg-[#a62922] px-5 py-3 text-sm font-bold text-white disabled:bg-[#b98a86]">
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /> {isRefreshing ? "Checking..." : "Check status"}
              </button>
            ) : (
              <Link to="/login" className="inline-flex items-center gap-2 rounded-md bg-[#a62922] px-5 py-3 text-sm font-bold text-white">
                Sign in to check status <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <span className="text-xs leading-5 text-[#81756d]">Approval is handled by the Nepal Yatra verification team.</span>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatusItem({ icon: Icon, label, value, complete = false }: { icon: typeof Clock3; label: string; value: string; complete?: boolean }) {
  return <div className="border border-[#e5dfda] p-4"><Icon className={`h-5 w-5 ${complete ? "text-[#47735b]" : "text-[#9b6c31]"}`} /><p className="mt-4 text-xs font-bold uppercase text-[#81756d]">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>;
}
