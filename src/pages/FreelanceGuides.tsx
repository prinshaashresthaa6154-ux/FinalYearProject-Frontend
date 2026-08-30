import { Award, BriefcaseBusiness, LoaderCircle, Search, Star } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { getApiError } from "../api/axios";
import Pagination from "../components/Pagination";
import { EmptyState, ErrorState } from "../components/ui";
import { profileImageUrl } from "../services/authService";
import { freelanceGuideService, type FreelanceGuideProfile } from "../services/freelanceGuideService";

export default function FreelanceGuides() {
  const [guides, setGuides] = useState<FreelanceGuideProfile[]>([]);
  const [draft, setDraft] = useState({ keyword: "", language: "", specialization: "", availability: false });
  const [filters, setFilters] = useState(draft);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await freelanceGuideService.list({ keyword: filters.keyword || undefined, language: filters.language || undefined, specialization: filters.specialization || undefined, availability: filters.availability ? true : undefined, page, size: 20, sortBy: "rating", sortDir: "desc" });
      setGuides(response.data.data?.content ?? []);
      setPages(response.data.data?.totalPages ?? 0);
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { void load(); }, [load]);
  const submit = (event: FormEvent) => { event.preventDefault(); setPage(0); setFilters({ ...draft, keyword: draft.keyword.trim(), language: draft.language.trim(), specialization: draft.specialization.trim() }); };

  return <main className="min-h-screen bg-[#f6f1e9]"><header className="bg-[#251c17] px-5 py-14 text-white"><div className="mx-auto max-w-6xl"><p className="text-xs font-bold uppercase tracking-[0.25em] text-[#e3a49e]">Legacy directory</p><h1 className="mt-3 font-display text-5xl font-bold">Freelance guides</h1><p className="mt-4 text-[#d4c8c0]">Search approved legacy guide profiles.</p></div></header><section className="mx-auto max-w-6xl px-5 py-10"><form onSubmit={submit} className="grid gap-3 border-b border-[#ddd2c9] pb-7 md:grid-cols-4"><label className="flex min-h-11 rounded-lg border border-[#d8cec0] bg-white"><Search className="ml-3 mt-3 h-5 w-5 text-gray-400" /><input value={draft.keyword} onChange={(event) => setDraft((current) => ({ ...current, keyword: event.target.value }))} placeholder="Guide name" className="min-w-0 flex-1 bg-transparent px-3 outline-none" /></label><input value={draft.language} onChange={(event) => setDraft((current) => ({ ...current, language: event.target.value }))} placeholder="Language" className="min-h-11 rounded-lg border border-[#d8cec0] bg-white px-3 outline-none" /><input value={draft.specialization} onChange={(event) => setDraft((current) => ({ ...current, specialization: event.target.value }))} placeholder="Specialization" className="min-h-11 rounded-lg border border-[#d8cec0] bg-white px-3 outline-none" /><div className="flex gap-2"><label className="flex min-h-11 flex-1 items-center gap-2 rounded-lg border border-[#d8cec0] bg-white px-3 text-sm"><input type="checkbox" checked={draft.availability} onChange={(event) => setDraft((current) => ({ ...current, availability: event.target.checked }))} className="accent-[#a62922]" /> Available</label><button className="rounded-lg bg-[#a62922] px-4 text-sm font-bold text-white">Search</button></div></form><div className="pt-8">{error ? <ErrorState message={error} onRetry={() => void load()} /> : loading ? <div className="grid min-h-52 place-items-center"><LoaderCircle className="h-8 w-8 animate-spin text-[#a62922]" /></div> : guides.length === 0 ? <EmptyState title="No approved freelance guides found" /> : <><div className="grid gap-5 md:grid-cols-2">{guides.map((guide) => <Link key={guide.id} to={`/freelance-guides/${guide.id}`} className="flex gap-5 rounded-lg border border-[#e0d7cf] bg-white p-5 shadow-sm"><div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[#eee7df]">{guide.profileImage ? <img src={profileImageUrl(guide.profileImage)} alt={guide.name || guide.fullName || "Guide"} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center"><BriefcaseBusiness className="h-6 w-6 text-[#8c7c70]" /></div>}</div><div><h2 className="font-display text-xl font-bold">{guide.name || guide.fullName || `Guide #${guide.id}`}</h2><p className="mt-1 flex items-center gap-1 text-xs text-[#786d63]"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {Number(guide.rating ?? 0).toFixed(1)} · {guide.experience} years</p><p className="mt-3 text-sm text-[#675b52]">{guide.specialization.join(", ")}</p><p className="mt-2 flex items-center gap-1 text-xs text-[#786d63]"><Award className="h-4 w-4" /> {guide.certificate}</p></div></Link>)}</div><Pagination page={page + 1} totalPages={pages} onPageChange={(nextPage) => setPage(nextPage - 1)} /></>}</div></section></main>;
}
