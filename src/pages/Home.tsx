import {
  Star,
  ArrowRight,
  Shield,
  MapPin,
  Users,
  Phone,
  Mountain,
  Compass,
} from "lucide-react";
import { Link } from "react-router";

import hero from "../assets/Herosection.jpg";
import everest from "../assets/Everest-base.jpeg";
import pokhara from "../assets/Pokhara.jpg";
import pashupatinath from "../assets/Pashupatinath.jpg";
import lumbini from "../assets/Lumbini.jpg";
import chitwan from "../assets/Chitwan.jpg";
import bhaktapur from "../assets/Bhaktapur.jpg";
import kathmandu from "../assets/Kathmandu.jpg";
import pilgrimage from "../assets/pilgrimage.jpg";
import para from "../assets/Para.jpg";
import sonam from "../assets/sonam.jpg";
import guide from "../assets/guide.jpg";
import image from "../assets/Image.jpg";

const Home = () => {
  const categories = [
    { id: 1, icon: "🏔️", label: "Adventure", count: 12 },
    { id: 2, icon: "🛕", label: "Religious", count: 8 },
    { id: 3, icon: "🏛️", label: "Cultural", count: 15 },
    { id: 4, icon: "🪂", label: "Activities", count: 10 },
    { id: 5, icon: "🌿", label: "Nature", count: 9 },
  ];

  const destinations = [
    {
      id: 1,
      title: "Everest Base Camp",
      image: "src/assets/Everest-base.jpeg",
      location: "Solukhumbu, Koshi Province",
      description:
        "Trek to the foot of the world's highest peak through stunning Sherpa villages...",
      season: "Mar-May, Sep-Nov",
      price: "$1,300",
    },
    {
      id: 2,
      title: "Pokhara Lakeside",
      image: "src/assets/Pokhara.jpg",
      location: "Kaski, Gandaki Province",
      description:
        "Nepal's adventure capital with stunning lakes, mountain views, and...",
      season: "Oct-Apr",
      price: "$350",
    },
    {
      id: 3,
      title: "Pashupatinath Temple",
      image: "src/assets/pashupatinath.jpg",
      location: "Kathmandu, Bagmati Province",
      description:
        "Sacred Hindu temple complex and UNESCO World Heritage Site on the...",
      season: "Year-round",
      price: "$25",
    },
    {
      id: 4,
      title: "Lumbini",
      image: "src/assets/Lumbini.jpg",
      location: "Rupandehi, Lumbini Province",
      description:
        "Birthplace of Lord Buddha and a UNESCO World Heritage Site with monasteries for...",
      season: "Oct-Mar",
      price: "$40",
    },
    {
      id: 5,
      title: "Chitwan National Park",
      image: "src/assets/Chitwan.jpg",
      location: "Chitwan, Bagmati Province",
      description:
        "Nepal's first national park and UNESCO site home to one-horned rhinos, tiger...",
      season: "Oct-Mar",
      price: "$180",
    },
    {
      id: 6,
      title: "Bhaktapur Durbar Square",
      image: "src/assets/Bhaktapur.jpg",
      location: "Bhaktapur, Bagmati Province",
      description:
        "Ancient Newari city with medieval architecture, pottery square, and...",
      season: "Year-round",
      price: "$30",
    },
  ];

  const tourPackages = [
    {
      id: 1,
      title: "Kathmandu Valley Cultural Tour",
      image: "src/assets/Kathmandu.jpg",
      description:
        "Explore the ancient cities of the Kathmandu Valley-Kathmandu, Patan and Bhaktapur.....",
      duration: "5 Days/ 4 Nights",
      groupSize: "2-15",
      oldPrice: "$599",
      newPrice: "$599",
    },
    {
      id: 2,
      title: "Everest Base Camp Trek",
      image: "src/assets/Everest-base.jpeg",
      description:
        "The iconic trek to the base of the world's tallest peak through dramatic Himalayan.....",
      duration: "14 Days/ 13 Nights",
      groupSize: "2-15",
      oldPrice: "$1599",
      newPrice: "$1299",
    },
    {
      id: 3,
      title: "Nepal Religious Pilgrimage",
      image: "src/assets/Pilgrimage.jpg",
      description:
        "Visit Nepal's most sacred Hindu and Buddha sites including Pashupatinath, Muktinath......",
      duration: "7 Days/ 4 Nights", // Keeping layout values exact to image text constraints
      groupSize: "2-30",
      oldPrice: "$899",
      newPrice: "$680",
    },
    {
      id: 4,
      title: "Pokhara Adventure Packages",
      image: "src/assets/Para.jpg",
      description:
        "Paragliding, zip-lining, bungee jumping, and white-water rafting in Nepal's most...",
      duration: "4 Days/ 3 Nights",
      groupSize: "2-15",
      oldPrice: "$676",
      newPrice: "$599",
    },
  ];

  const guides = [
    {
      id: 1,
      name: "Pemba Sherpa",
      specialty: "High Altitude Trekking",
      experience: "12 years experience",
      trips: "340",
      rating: "4.2",
      image: "src/assets/sonam.jpg", // Substitute with actual assets
    },
    {
      id: 2,
      name: "Tenzing Bhote",
      specialty: "Cultural Tours Heritage",
      experience: "12 years experience",
      trips: "340",
      rating: "4.2",
      image: "src/assets/guide.jpg",
    },
    {
      id: 3,
      name: "Ram Lama",
      specialty: "Wildlife Safari Adventure",
      experience: "12 years experience",
      trips: "340",
      rating: "4.2",
      image: "src/assets/Image.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center">
        <img
          src={hero}
          alt="Nepal"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
          <div className="max-w-3xl">
            <div className="inline-block bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-4 py-2 rounded-full mb-6">
              🏔️ Discover the Land of the Himalayas
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 font-display">
              Experience the Magic of{" "}
              <span className="text-orange-400">Nepal</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-200 max-w-xl mb-8 leading-relaxed">
              From the peaks of Everest to ancient temples and vibrant festivals
              — plan your perfect Nepal adventure with Nepal Yatra.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/destinations"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg flex items-center gap-2 transition"
              >
                Explore Destinations
                <ArrowRight className="h-5 w-5" />
              </Link>

              <button className="border border-white text-white hover:bg-white hover:text-black px-8 py-3 rounded-lg transition">
                View Packages
              </button>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-md border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              {
                label: "Destinations",
                value: "75+",
                icon: MapPin,
              },
              {
                label: "Happy Tourists",
                value: "12K+",
                icon: Users,
              },
              {
                label: "Tour Packages",
                value: "40+",
                icon: Compass,
              },
              {
                label: "Expert Guides",
                value: "200+",
                icon: Mountain,
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="flex items-center justify-center gap-3"
              >
                <stat.icon className="h-5 w-5 text-yellow-400" />

                <div className="text-left">
                  <h3 className="text-xl font-bold text-white">{stat.value}</h3>

                  <p className="text-xs text-gray-300">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 font-display">
              Explore by Category
            </h2>

            <p className="text-gray-500 max-w-lg mx-auto">
              Discover Nepal through its diverse tourism offerings
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="group p-6 rounded-xl bg-white border border-gray-200 text-center shadow-sm hover:shadow-lg transition"
              >
                <span className="text-4xl block mb-3">{cat.icon}</span>

                <h3 className="font-semibold group-hover:text-orange-500 transition">
                  {cat.label}
                </h3>

                <p className="text-sm text-gray-500 mt-1">{cat.count} places</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-[#F6EFEA] min-h-screen py-16 px-6 md:px-10 font-sans flex flex-col items-center">
        {/* Header Section */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-2 font-serif">
            Top Destinations
          </h1>
          <p className="text-base text-gray-500 tracking-wide">
            Must visit- place in Nepal
          </p>
        </header>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9 max-w-6xl w-full">
          {destinations.map((destination) => (
            <Link
              key={destination.id}
              to={`/destinations/${destination.id}`}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 flex flex-col cursor-pointer"
            >
              <div className="w-full h-56 overflow-hidden relative">
                <img
                  src={destination.image}
                  alt={destination.title}
                  className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="bg-white text-gray-900 font-medium px-5 py-2.5 rounded-full shadow-md transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 ease-out text-sm tracking-wide group-hover:bg-[#A84430] group-hover:text-white">
                    Explore Details
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-2 font-serif group-hover:text-[#A84430] transition-colors duration-200">
                  {destination.title}
                </h2>

                <div className="flex items-center gap-1 mb-4">
                  <svg
                    className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-xs md:text-sm text-gray-400 font-normal">
                    {destination.location}
                  </span>
                </div>

                <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-grow">
                  {destination.description}
                </p>

                <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-auto">
                  <span className="text-xs md:text-sm text-gray-400">
                    {destination.season}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-[#A84430] font-medium">
                      From
                    </span>
                    <span className="text-lg text-[#A84430] font-bold">
                      {destination.price}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-[#F9F7F5] min-h-screen py-16 px-6 md:px-10 font-sans flex flex-col items-center">
        {/* Header Section */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-12 font-serif">
            Popular Tour Packages
          </h1>
          <p className="text-sm md:text-base text-gray-500 tracking-wide font-normal">
            Curated experience for every type of traveler
          </p>
        </header>

        {/* Grid Layout (2 columns for desktop, 1 column for mobile/tablet) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full">
          {tourPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="group bg-white rounded-2xl border border-gray-100/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row h-auto sm:h-52 cursor-pointer"
            >
              {/* Card Left: Image Media Area */}
              <div className="w-full sm:w-2/5 h-48 sm:h-full overflow-hidden relative flex-shrink-0">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                />
              </div>

              {/* Card Right: Typography & Meta Content Area */}
              <div className="p-5 flex flex-col justify-between flex-grow">
                <div>
                  <h2 className="text-[17px] font-bold text-[#A84430] mb-2 font-serif tracking-tight line-clamp-1">
                    {pkg.title}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-400 font-normal leading-relaxed line-clamp-2">
                    {pkg.description}
                  </p>
                </div>

                {/* Card Meta Row (Duration, Group Size, Pricing System) */}
                <div className="flex flex-wrap items-center justify-between border-t border-gray-100 pt-3 mt-4 gap-2">
                  <div className="flex items-center gap-3 text-gray-400 text-xs">
                    {/* Calendar/Duration Icon */}
                    <div className="flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>{pkg.duration}</span>
                    </div>

                    {/* Group Size Icon */}
                    <div className="flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span>{pkg.groupSize}</span>
                    </div>
                  </div>

                  {/* Price Presentation Tags */}
                  <div className="flex items-center gap-1.5 text-xs">
                    {pkg.oldPrice !== pkg.newPrice && (
                      <span className="text-gray-400 line-through font-normal">
                        {pkg.oldPrice}
                      </span>
                    )}
                    <span className="text-sm text-[#A84430] font-bold">
                      {pkg.newPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#F3F0EE] min-h-screen py-16 px-6 md:px-10 font-sans flex flex-col items-center">
        {/* Header Section */}
        <header className="text-center mb-12">
          <p className="text-xs md:text-sm text-[#A84430] uppercase tracking-widest font-bold mb-2">
            Local Experts
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-3 font-serif">
            Meet Our Guides
          </h1>
          <p className="text-sm md:text-base text-gray-500 font-normal">
            Experienced Professional who know every trail, temples
          </p>
        </header>

        {/* Guides Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full mb-12">
          {guides.map((guide) => (
            <div
              key={guide.id}
              className="group relative bg-white rounded-xl border border-gray-100 p-8 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1.5"
            >
              {/* Circular Profile Image Area with hover effects */}
              <div className="w-28 h-28 rounded-full overflow-hidden mb-6 relative ring-4 ring-transparent group-hover:ring-[#A84430]/10 transition-all duration-300">
                <img
                  src={guide.image}
                  alt={guide.name}
                  className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                />
                {/* Overlay badge element that fades in on hover */}
                <div className="absolute inset-0 bg-[#A84430]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="bg-white/90 text-[10px] uppercase font-bold tracking-wider text-[#A84430] px-2 py-0.5 rounded shadow-sm">
                    Active
                  </span>
                </div>
              </div>

              {/* Typography Identity Section */}
              <h2 className="text-lg font-bold text-[#0F2942] mb-1 font-sans group-hover:text-[#A84430] transition-colors duration-200">
                {guide.name}
              </h2>
              <p className="text-sm font-semibold text-[#C0764D] mb-1">
                {guide.specialty}
              </p>
              <p className="text-xs text-gray-400 font-normal mb-6">
                {guide.experience}
              </p>

              {/* Divider Line */}
              <div className="w-full border-t border-gray-200/80 mb-5" />

              {/* Metrics Row */}
              <div className="grid grid-cols-2 w-full mb-6">
                <div className="border-r border-gray-100 flex flex-col items-center">
                  <span className="text-sm font-bold text-gray-700">
                    {guide.trips}
                  </span>
                  <span className="text-xs text-gray-400">Trips</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1">
                    {/* Star Rating Icon */}
                    <svg
                      className="w-3.5 h-3.5 text-amber-400 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <span className="text-sm font-bold text-gray-700">
                      {guide.rating}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">Rating</span>
                </div>
              </div>

              {/* Action Interactive Component with explicit state updates on card hover */}
              <button className="w-full bg-[#EAE3DC] text-gray-700 hover:text-white hover:bg-[#A84430] font-medium text-xs py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-none">
                {/* Message/Chat SVG icon */}
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Contact Guide
              </button>
            </div>
          ))}
        </div>

        {/* Secondary Bottom Navigation Element */}
        <button className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold text-sm py-3 px-6 rounded-lg flex items-center gap-2 transition-all duration-200 hover:shadow-sm">
          Browse all guide
          <svg
            className="w-4 h-4 text-gray-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* WHY CHOOSE US */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12 font-display">
            Why Choose Nepal Yatra?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Safe & Secure",
                desc: "24/7 SOS support and verified guides for your safety",
              },
              {
                icon: Users,
                title: "Expert Guides",
                desc: "Licensed and experienced local tour guides",
              },
              {
                icon: Phone,
                title: "24/7 Support",
                desc: "Emergency assistance available anytime, anywhere",
              },
              {
                icon: Star,
                title: "Best Prices",
                desc: "Competitive prices with no hidden charges",
              },
            ].map((f, index) => (
              <div key={index} className="p-6">
                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="h-7 w-7 text-yellow-400" />
                </div>

                <h3 className="font-semibold text-white text-lg mb-2">
                  {f.title}
                </h3>

                <p className="text-white/70 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 font-display">
            Ready to Explore Nepal?
          </h2>

          <p className="text-gray-500 mb-8">
            Sign up today and start planning your dream Nepali adventure with
            personalized itineraries and local insights.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg transition">
              Get Started Free
            </button>

            <button className="border border-gray-300 hover:bg-gray-100 px-8 py-3 rounded-lg transition">
              Browse Packages
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
