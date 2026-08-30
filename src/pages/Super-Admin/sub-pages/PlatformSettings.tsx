import { LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { getApiError } from "../../../api/axios";
import { Button, ErrorState } from "../../../components/ui";
import { superadminService } from "../../../services/superadminService";

export default function PlatformSettings() {
  const [commission, setCommission] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await superadminService.platformCommission();
      setCommission(String(response.data.data?.commissionPercentage ?? 0));
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const value = Number(commission);
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      setError("Platform commission must be between 0 and 100.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await superadminService.updatePlatformCommission(value);
      const saved = response.data.data?.commissionPercentage ?? value;
      setCommission(String(saved));
      setNotice(response.data.message || `Platform commission updated to ${saved}%.`);
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-[#b31919]">Financial configuration</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Platform Settings</h1>
        <p className="mt-2 text-sm text-gray-500">Configure the commission captured when an Admin transaction is processed.</p>
      </header>

      {loading ? (
        <div className="grid min-h-52 place-items-center rounded-2xl border bg-white">
          <LoaderCircle className="h-8 w-8 animate-spin text-[#b31919]" />
        </div>
      ) : error && commission === "" ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <form onSubmit={save} className="rounded-2xl border border-[#eae3dc] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <label className="block flex-1">
              <span className="text-sm font-semibold text-[#1a130e]">Platform Commission</span>
              <span className="mt-1 block text-sm text-gray-500">The backend records this percentage and applies it to new Admin transactions.</span>
              <span className="mt-4 flex max-w-xs items-center overflow-hidden rounded-lg border border-[#d8cec0] bg-white focus-within:ring-2 focus-within:ring-[#b31919]/20">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  required
                  value={commission}
                  onChange={(event) => { setCommission(event.target.value); setError(""); setNotice(""); }}
                  className="min-w-0 flex-1 px-3 py-2.5 outline-none"
                />
                <span className="border-l px-3 py-2.5 font-bold text-gray-500">%</span>
              </span>
              <span className="mt-2 block text-xs text-gray-500">Accepted range: 0.00% to 100.00%.</span>
            </label>
            <Button type="submit" disabled={saving || commission === ""}>
              {saving ? "Saving..." : "Save commission"}
            </Button>
          </div>
          {notice && <p role="status" className="mt-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p>}
          {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
        </form>
      )}
    </div>
  );
}
