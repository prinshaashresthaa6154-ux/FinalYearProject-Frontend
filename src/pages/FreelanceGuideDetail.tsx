import { ArrowLeft, Award, BriefcaseBusiness, LoaderCircle, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getApiError } from "../api/axios";
import { ErrorState } from "../components/ui";
import { profileImageUrl } from "../services/authService";
import { freelanceGuideService, type FreelanceGuideProfile } from "../services/freelanceGuideService";

export default function FreelanceGuideDetail() {
  const { id = "" } = useParams();
  const [guide, setGuide] = useState<FreelanceGuideProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(""); try { const response = await freelanceGuideService.get(Number(id)); setGuide(response.data.data); } catch (requestError) { setError(getApiError(requestError).message); } finally { setLoading(false); } }, [id]);
  useEffect(() => { void load(); }, [load]);
  if (loading) return <main className="grid min-h-[70vh] place-items-center bg-[#f6f1e9]"><LoaderCircle className="h-8 w-8 animate-spin text-[#a62922]" /></main>;
  if (error || !guide) return <main className="min-h-[70vh] bg-[#f6f1e9] px-5 py-14"><div className="mx-auto max-w-3xl"><ErrorState message={error || "Freelance guide not found"} onRetry={() => void load()} /></div></main>;
  const name = guide.name || guide.fullName || `Guide #${guide.id}`;
  return <main className="min-h-screen bg-[#f6f1e9]"><header className="bg-[#251c17] px-5 py-10 text-white"><div className="mx-auto max-w-4xl"><Link to="/freelance-guides" className="inline-flex items-center gap-2 text-sm font-semibold text-white/80"><ArrowLeft className="h-4 w-4" /> All freelance guides</Link><div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-center"><div className="h-28 w-28 overflow-hidden rounded-full bg-white/10">{guide.profileImage ? <img src={profileImageUrl(guide.profileImage)} alt={name} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center"><BriefcaseBusiness className="h-9 w-9" /></div>}</div><div><h1 className="font-display text-4xl font-bold">{name}</h1><p className="mt-3 flex items-center gap-2 text-sm text-white/80"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {Number(guide.rating ?? 0).toFixed(1)} · {guide.experience} years experience</p><p className="mt-2 text-sm font-bold text-green-300">Available</p></div></div></div></header><div className="mx-auto grid max-w-4xl gap-8 px-5 py-10 md:grid-cols-2"><section><h2 className="font-display text-2xl font-bold">Specializations</h2><div className="mt-4 flex flex-wrap gap-2">{guide.specialization.map((item) => <span key={item} className="border border-[#d8cec0] bg-white px-4 py-2 text-sm">{item}</span>)}</div><h2 className="mt-8 font-display text-2xl font-bold">Languages</h2><p className="mt-3 text-[#675b52]">{guide.languages.join(", ")}</p></section><aside className="border-t-4 border-[#a62922] bg-white p-6 shadow-sm"><Award className="h-6 w-6 text-[#a62922]" /><h2 className="mt-4 font-display text-2xl font-bold">Certification</h2><p className="mt-3 leading-7 text-[#675b52]">{guide.certificate}</p></aside></div></main>;
}
