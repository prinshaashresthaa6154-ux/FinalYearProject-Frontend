import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { getApiError } from "../api/axios";
import { Button, Input } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/;

export default function ChangePassword() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (newPassword !== confirmation) return setError("New passwords do not match.");
    if (!passwordPattern.test(newPassword)) return setError("Use 8-72 characters with uppercase, lowercase, a number, and a special character.");
    setIsSubmitting(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      await logout();
      navigate("/login", { replace: true, state: { message: "Password changed successfully. Please sign in again." } });
    } catch (requestError) {
      const apiError = getApiError(requestError);
      setError(Object.values(apiError.validationErrors).join(" ") || apiError.message);
    } finally { setIsSubmitting(false); }
  };

  return <main className="min-h-[calc(100vh-72px)] bg-[#f6f1e9] px-4 py-10"><form onSubmit={submit} className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm"><h1 className="font-display text-3xl font-bold">Change password</h1><p className="mt-2 text-sm text-[#786d63]">Changing your password signs out all active sessions.</p><div className="mt-6 space-y-4"><Input label="Current password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required /><Input label="New password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" required /><Input label="Confirm new password" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" required /></div>{error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}<div className="mt-6 flex items-center justify-between gap-3"><Link to="/profile" className="text-sm font-bold text-[#786d63]">Cancel</Link><Button type="submit" loading={isSubmitting}>Change password</Button></div></form></main>;
}
