import { BriefcaseBusiness, Globe2, LoaderCircle, MapPin, Search, Star } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { getApiError } from "../api/axios";
import Pagination from "../components/Pagination";
import { EmptyState, ErrorState } from "../components/ui";
import { destinationService, mediaUrl, type Destination } from "../services/destinationService";
import { guideService, type GuideProfile, type GuideQuery } from "../services/guideService";

type Filters = {
  keyword: string;
  language: string;
  specialization: string;
  destinationId: string;
  availableOnly: boolean;
  sortDir: "asc" | "desc";
};

const initialFilters: Filters = {
  keyword: "",
  language: "",
  specialization: "",
  destinationId: "",
  availableOnly: false,
  sortDir: "desc",
};

export default function BookGuide() {
  const [guides, setGuides] = useState<GuideProfile[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [draft, setDraft] = useState<Filters>(initialFilters);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    destinationService.publicList({ page: 0, size: 100, sortBy: "name", sortDir: "asc" })
      .then((response) => setDestinations(response.data.data?.content ?? []))
      .catch(() => setDestinations([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const query: GuideQuery = {
      keyword: filters.keyword || undefined,
      availability: filters.availableOnly ? true : undefined,
      language: filters.language || undefined,
      specialization: filters.specialization || undefined,
      destinationId: filters.destinationId ? Number(filters.destinationId) : undefined,
      page,
      size: 20,
      sortBy: "rating",
      sortDir: filters.sortDir,
    };
    const hasSearchFilters = Boolean(query.keyword || query.availability || query.language || query.specialization || query.destinationId);
    try {
      const response = await (hasSearchFilters ? guideService.search(query) : guideService.list(query));
      setGuides(response.data.data?.content ?? []);
      setPages(response.data.data?.totalPages ?? 0);
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { void load(); }, [load]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setPage(0);
    setFilters({
      ...draft,
      keyword: draft.keyword.trim(),
      language: draft.language.trim(),
      specialization: draft.specialization.trim(),
    });
  };

  const clearFilters = () => {
    setDraft(initialFilters);
    setFilters(initialFilters);
    setPage(0);
  };

  return (
    <main className="min-h-screen bg-[#f8f8f8]">
      <header className="bg-black px-5 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#1D78AF]">Local expertise</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-bold sm:text-6xl">Meet Nepal&apos;s approved freelance guides.</h1>
          <p className="mt-5 max-w-xl leading-7 text-white/70">Discover verified profiles, destination expertise, languages, and traveler feedback.</p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <form onSubmit={submit} className="filter-surface grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-4">
          <label className="lg:col-span-2"><span className="text-sm font-semibold">Search</span><span className="field-control mt-2 flex"><Search className="ml-3 mt-3 h-5 w-5 text-black/40" /><input value={draft.keyword} onChange={(event) => setDraft((current) => ({ ...current, keyword: event.target.value }))} placeholder="Guide name, bio, or trekking" className="min-w-0 flex-1 bg-transparent px-3 py-2.5 outline-none" /></span></label>
          <FilterInput label="Language" value={draft.language} placeholder="English" onChange={(language) => setDraft((current) => ({ ...current, language }))} />
          <FilterInput label="Specialization" value={draft.specialization} placeholder="Trekking" onChange={(specialization) => setDraft((current) => ({ ...current, specialization }))} />
          <label><span className="text-sm font-semibold">Destination</span><select value={draft.destinationId} onChange={(event) => setDraft((current) => ({ ...current, destinationId: event.target.value }))} className="field-control mt-2 px-3"><option value="">All destinations</option>{destinations.map((destination) => <option key={destination.id} value={destination.id}>{destination.name}</option>)}</select></label>
          <label><span className="text-sm font-semibold">Rating order</span><select value={draft.sortDir} onChange={(event) => setDraft((current) => ({ ...current, sortDir: event.target.value as Filters["sortDir"] }))} className="field-control mt-2 px-3"><option value="desc">Highest rated</option><option value="asc">Lowest rated</option></select></label>
          <label className="flex items-end"><span className="flex min-h-11 w-full items-center gap-2 rounded-lg border border-black/15 bg-white px-3 text-sm font-semibold"><input type="checkbox" checked={draft.availableOnly} onChange={(event) => setDraft((current) => ({ ...current, availableOnly: event.target.checked }))} className="h-4 w-4 accent-[#1D78AF]" /> Available only</span></label>
          <div className="flex items-end gap-2"><button type="submit" className="min-h-11 flex-1 rounded-lg bg-[#AF1D1D] px-5 text-sm font-semibold text-white hover:bg-[#881717]">Apply filters</button><button type="button" onClick={clearFilters} className="min-h-11 rounded-lg border border-[#1D78AF] bg-white px-4 text-sm font-semibold text-[#1D78AF] hover:bg-[#1D78AF] hover:text-white">Clear</button></div>
        </form>

        <div className="pt-8">
          {error ? <ErrorState message={error} onRetry={() => void load()} /> : loading ? <div className="grid min-h-52 place-items-center"><LoaderCircle className="h-8 w-8 animate-spin text-[#a62922]" /></div> : guides.length === 0 ? <EmptyState title="No approved guides found" description="No guide profile matches the current search." /> : <><div className="grid gap-6 md:grid-cols-2">{guides.map((guide) => <GuideCard key={guide.id} guide={guide} />)}</div><Pagination page={page + 1} totalPages={pages} onPageChange={(nextPage) => setPage(nextPage - 1)} /></>}
        </div>
      </section>
    </main>
  );
}

function FilterInput({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  return <label><span className="text-sm font-semibold">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="field-control mt-2 px-3" /></label>;
}

function GuideCard({ guide }: { guide: GuideProfile }) {
  return <Link to={`/guides/${guide.id}`} className="group flex flex-col gap-5 rounded-lg border border-[#e0d7cf] bg-white p-6 shadow-sm sm:flex-row"><div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-[#eee7df]">{guide.profileImage ? <img src={mediaUrl(guide.profileImage)} alt={guide.name} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center"><BriefcaseBusiness className="h-7 w-7 text-[#9a887b]" /></div>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-display text-2xl font-bold group-hover:text-[#a62922]">{guide.name}</h2><span className={`text-xs font-bold ${guide.availability ? "text-green-700" : "text-gray-500"}`}>{guide.availability ? "Available" : "Unavailable"}</span></div><div className="mt-2 flex flex-wrap gap-4 text-xs text-[#786d63]"><span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {Number(guide.rating ?? 0).toFixed(1)}</span><span className="inline-flex items-center gap-1"><BriefcaseBusiness className="h-4 w-4" /> {guide.experience} years</span></div><p className="mt-3 line-clamp-2 text-sm leading-6 text-[#675b52]">{guide.bio}</p><div className="mt-3 flex flex-wrap gap-3 text-xs text-[#786d63]">{guide.languages.length > 0 && <span className="inline-flex items-center gap-1"><Globe2 className="h-4 w-4" /> {guide.languages.slice(0, 3).join(", ")}</span>}{guide.destinations.length > 0 && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {guide.destinations.slice(0, 2).map((item) => item.name).join(", ")}</span>}</div></div></Link>;
}
