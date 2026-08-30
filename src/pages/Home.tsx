import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Compass,
  MapPin,
  Mountain,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { Link } from "react-router";
import { useLocation } from "react-router";
import { useEffect, useState } from "react";
import bhaktapur from "../assets/Bhaktapur.jpg";
import chitwan from "../assets/Chitwan.jpg";
import everest from "../assets/Everest-base.jpeg";
import hero from "../assets/Herosection.jpg";
import kathmandu from "../assets/Kathmandu.jpg";
import pokhara from "../assets/Pokhara.jpg";
import sonam from "../assets/sonam.jpg";
import guidePhoto from "../assets/guide.jpg";
import { DESTINATIONS } from "../data/destinations";
import { GROUP_TRIPS } from "../data/groupTrips";
import { GUIDES } from "../data/guides";
import RecommendationTrips, { type RecommendationCardTrip } from "../components/RecommendationTrips";
import { recommendationService } from "../services/recommendationService";
import { tripService } from "../services/tripService";

const destinationImages: Record<number, string> = {
  1: everest,
  2: pokhara,
  5: chitwan,
  6: bhaktapur,
};

const guideImages: Record<number, string> = {
  1: sonam,
  2: guidePhoto,
};

const experiences = [
  {
    title: "High Himalayan trails",
    description: "Trek with licensed local experts through Nepal's most iconic mountain regions.",
    icon: Mountain,
    to: "/destinations",
  },
  {
    title: "Living heritage",
    description: "Step into temple courtyards, old cities, and traditions shaped over centuries.",
    icon: Compass,
    to: "/destinations",
  },
  {
    title: "Travel together",
    description: "Join a small group, meet fellow travelers, and share the road across Nepal.",
    icon: Users,
    to: "/grouptrips",
  },
];

export default function Home() {
  const location = useLocation();
  const userDashboard = location.pathname === "/user/dashboard";
  const [recommended, setRecommended] = useState<RecommendationCardTrip[]>([]);
  const [popular, setPopular] = useState<RecommendationCardTrip[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [popularLoading, setPopularLoading] = useState(true);
  useEffect(() => {
    recommendationService.trips(0, 6).then((response) => setRecommended(response.data.data?.content ?? [])).catch(() => setRecommended([])).finally(() => setRecommendationsLoading(false));
    tripService.popular(6).then((response) => setPopular(response.data.data?.content ?? [])).catch(() => setPopular([])).finally(() => setPopularLoading(false));
  }, []);
  const featuredDestinations = DESTINATIONS.filter((destination) =>
    [1, 2, 5, 6].includes(destination.id),
  );
  const featuredGuides = GUIDES.slice(0, 2);
  const nextTrip = GROUP_TRIPS[0];

  return (
    <main className="overflow-hidden bg-[#f6f1e9] text-[#241f1a]">
      <section className="relative isolate min-h-[calc(100vh-72px)] overflow-hidden">
        <img
          src={hero}
          alt="Himalayan valley in Nepal"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(20,17,14,.88)_0%,rgba(20,17,14,.62)_45%,rgba(20,17,14,.14)_78%),linear-gradient(0deg,rgba(20,17,14,.65)_0%,transparent_45%)]" />

        <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center px-5 py-20 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <p className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-[#f4c66d] sm:text-sm">
              <span className="h-px w-9 bg-[#f4c66d]" />
              Journey through Nepal
            </p>
            <h1 className="max-w-2xl font-display text-5xl font-bold leading-[0.98] text-white sm:text-6xl lg:text-[5.4rem]">
              Find the Nepal that stays with you.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
              From quiet monastery mornings to high mountain passes, plan a journey shaped by local knowledge and real connection.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/destinations"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#b62f26] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#cf3b31] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Explore destinations
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/guide"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/50 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white hover:text-[#241f1a]"
              >
                Find a local guide
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 right-0 hidden border-l border-t border-white/15 bg-[#251d18]/85 px-8 py-5 text-white backdrop-blur-md md:block lg:px-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#f4c66d]">Featured journey</p>
          <div className="mt-2 flex items-center gap-7">
            <div>
              <p className="font-display text-xl font-bold">Everest Base Camp</p>
              <p className="mt-1 text-xs text-white/65">Solukhumbu · 5,364m</p>
            </div>
            <Link to="/destinations/1" aria-label="View Everest Base Camp" className="rounded-full border border-white/30 p-3 transition hover:bg-white hover:text-[#241f1a]">
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="section-kicker">Ways to wander</p>
            <h2 className="mt-4 max-w-md font-display text-4xl font-bold leading-tight sm:text-5xl">
              One country. Countless journeys.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-[#6e6258] lg:justify-self-end lg:text-lg">
            Nepal rewards curiosity. Choose a path that feels like yours, with thoughtful routes and trusted people at every step.
          </p>
        </div>

        <div className="mt-12 grid border-y border-[#d8cec0] md:grid-cols-3">
          {experiences.map(({ title, description, icon: Icon, to }, index) => (
            <Link
              key={title}
              to={to}
              className={`group py-8 md:px-8 md:py-10 ${index > 0 ? "border-t border-[#d8cec0] md:border-l md:border-t-0" : ""}`}
            >
              <div className="flex items-start justify-between">
                <Icon className="h-7 w-7 text-[#a62922]" strokeWidth={1.6} />
                <span className="text-xs text-[#9a8d80]">0{index + 1}</span>
              </div>
              <h3 className="mt-8 font-display text-2xl font-bold">{title}</h3>
              <p className="mt-3 max-w-xs text-sm leading-6 text-[#786d63]">{description}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#a62922]">
                Discover <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="section-kicker">Chosen by the platform</p>
            <h2 className="mt-4 font-display text-4xl font-bold sm:text-5xl">{userDashboard ? "Recommended For You" : "Recommended Trips"}</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#6e6258]">{userDashboard ? "Based on your backend travel history, bookings, and viewed trips." : "Backend-selected journeys for exploring Nepal right now."}</p>
          </div>
          <Link to="/trips" className="inline-flex items-center gap-2 text-sm font-bold text-[#a62922]">Browse all trips <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-10"><RecommendationTrips trips={recommended} loading={recommendationsLoading} emptyText="No recommended trips are available yet." /></div>
      </section>

      <section className="bg-[#eee7df] py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <p className="section-kicker">Most discovered</p>
          <h2 className="mt-4 font-display text-4xl font-bold sm:text-5xl">Popular Trips</h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#6e6258]">Ordered by backend popularity signals. React displays the result without calculating rankings.</p>
          <div className="mt-10"><RecommendationTrips trips={popular} loading={popularLoading} emptyText="No popular trips are available yet." /></div>
        </div>
      </section>

      <section className="bg-[#2a211b] py-20 text-white lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="section-kicker text-[#e9b85f]">Across the country</p>
              <h2 className="mt-4 font-display text-4xl font-bold sm:text-5xl">Places worth the journey</h2>
            </div>
            <Link to="/destinations" className="inline-flex items-center gap-2 text-sm font-bold text-[#f1c775] hover:text-white">
              View all destinations <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {featuredDestinations.map((destination, index) => (
              <Link
                key={destination.id}
                to={`/destinations/${destination.id}`}
                className={`group relative min-h-[410px] overflow-hidden rounded-[1.4rem] ${index === 0 ? "lg:col-span-2" : ""}`}
              >
                <img
                  src={destinationImages[destination.id]}
                  alt={destination.title}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <span className="rounded-full border border-white/30 bg-black/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                    {destination.categoryLabel}
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-bold">{destination.title}</h3>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-white/70">
                    <MapPin className="h-3.5 w-3.5" /> {destination.location}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-28">
        <div className="relative min-h-[520px] overflow-hidden rounded-[1.75rem]">
          <img src={kathmandu} alt="Kathmandu heritage architecture" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 p-7 text-white sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f1c775]">Local perspective</p>
            <p className="mt-3 max-w-md font-display text-3xl font-bold leading-tight sm:text-4xl">
              More than a route. A story you step into.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <p className="section-kicker">Travel with confidence</p>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl">Meet Nepal through people who know it best.</h2>
          <p className="mt-6 text-base leading-7 text-[#6e6258]">
            Our local guides bring depth, safety, and genuine hospitality to every journey, whether you are crossing a high pass or exploring a hidden courtyard.
          </p>
          <ul className="mt-8 space-y-4 text-sm font-semibold text-[#40382f]">
            <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-[#a62922]" /> Licensed and identity-verified guides</li>
            <li className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-[#a62922]" /> Safety-first planning and local support</li>
            <li className="flex items-center gap-3"><Compass className="h-5 w-5 text-[#a62922]" /> Experiences matched to your travel style</li>
          </ul>

          <div className="mt-9 grid gap-3 sm:grid-cols-2">
            {featuredGuides.map((guide) => (
              <Link key={guide.id} to={`/guideprofile/${guide.id}`} className="group flex items-center gap-4 rounded-2xl border border-[#d8cec0] bg-white/60 p-4 transition hover:border-[#a62922]/40 hover:bg-white">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[#ded3c6]">
                  {guideImages[guide.id] ? <img src={guideImages[guide.id]} alt={guide.name} className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center font-bold">{guide.initials}</span>}
                </div>
                <div className="min-w-0">
                  <p className="font-bold">{guide.name}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-[#786d63]"><Star className="h-3.5 w-3.5 fill-[#d79b2e] text-[#d79b2e]" /> {guide.rating} · {guide.categoryExpert}</p>
                </div>
              </Link>
            ))}
          </div>
          <Link to="/guide" className="mt-7 inline-flex w-fit items-center gap-2 text-sm font-bold text-[#a62922]">
            Browse all guides <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] bg-[#a62922] text-white">
          <div className="grid lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="p-8 sm:p-12 lg:p-14">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f1c775]">Next group departure</p>
              <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold sm:text-4xl">{nextTrip.title}</h2>
              <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/80">
                <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {nextTrip.date}</span>
                <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {nextTrip.spotsLeft} places left</span>
                <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {nextTrip.location}</span>
              </div>
            </div>
            <div className="border-t border-white/20 p-8 lg:border-l lg:border-t-0 lg:p-14">
              <Link to="/grouptrips" className="inline-flex whitespace-nowrap items-center gap-2 rounded-full bg-[#f7e8c7] px-7 py-3.5 text-sm font-bold text-[#6f1915] transition hover:bg-white">
                See group trips <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
