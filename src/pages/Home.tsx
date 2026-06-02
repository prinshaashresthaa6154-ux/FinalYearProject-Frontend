import React from "react";
import {
  Star,
  ArrowRight,
  Shield,
  MapPin,
  Users,
  Phone,
  Mountain,
  Compass,
  Calendar,
} from "lucide-react";

import hero from "../assets/Herosection.jpg";

function HomePage() {
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
      name: "Everest Base Camp",
      image:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      desc: "Experience the beauty of the Himalayas.",
    },
    {
      id: 2,
      name: "Pokhara",
      image:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      desc: "City of lakes and adventure sports.",
    },
    {
      id: 3,
      name: "Lumbini",
      image:
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c",
      desc: "Birthplace of Lord Buddha.",
    },
  ];

  const tourPackages = [
    {
      id: 1,
      name: "Everest Trek",
      type: "trekking",
      difficulty: "Hard",
      rating: 4.9,
      duration: "12 Days",
      groupSize: "10 People",
      originalPrice: 1500,
      price: 1200,
      description: "Explore the amazing Everest region.",
    },
    {
      id: 2,
      name: "Pokhara Adventure",
      type: "adventure",
      difficulty: "Medium",
      rating: 4.7,
      duration: "5 Days",
      groupSize: "8 People",
      originalPrice: 900,
      price: 699,
      description: "Adventure activities in beautiful Pokhara.",
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
              From the peaks of Everest to ancient temples and vibrant
              festivals — plan your perfect Nepal adventure with Nepal
              Yatra.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg flex items-center gap-2 transition">
                Explore Destinations
                <ArrowRight className="h-5 w-5" />
              </button>

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
                  <h3 className="text-xl font-bold text-white">
                    {stat.value}
                  </h3>

                  <p className="text-xs text-gray-300">
                    {stat.label}
                  </p>
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
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
                <span className="text-4xl block mb-3">
                  {cat.icon}
                </span>

                <h3 className="font-semibold group-hover:text-orange-500 transition">
                  {cat.label}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {cat.count} places
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">
                Top Destinations
              </h2>

              <p className="text-gray-500">
                Must-visit places in Nepal
              </p>
            </div>

            <button className="text-orange-500 flex items-center gap-1 hover:underline">
              View All
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition"
              >
                <img
                  src={d.image}
                  alt={d.name}
                  className="w-full h-60 object-cover"
                />

                <div className="p-5">
                  <h3 className="text-xl font-bold mb-2">
                    {d.name}
                  </h3>

                  <p className="text-gray-500">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOUR PACKAGES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              Popular Tour Packages
            </h2>

            <p className="text-gray-500 max-w-lg mx-auto">
              Curated experiences for every type of traveler
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tourPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="flex flex-col sm:flex-row rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-lg transition"
              >
                <div className="sm:w-2/5 h-48 sm:h-auto bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                  <div className="text-center p-6">
                    <span className="text-5xl">
                      {pkg.type === "trekking"
                        ? "🏔️"
                        : pkg.type === "cultural"
                        ? "🏛️"
                        : pkg.type === "religious"
                        ? "🛕"
                        : "🪂"}
                    </span>

                    <p className="text-white/80 text-sm mt-2 capitalize">
                      {pkg.type} Tour
                    </p>
                  </div>
                </div>

                <div className="p-6 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-gray-100 text-xs px-2 py-1 rounded">
                      {pkg.difficulty}
                    </span>

                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {pkg.rating}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold hover:text-orange-500 transition">
                    {pkg.name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-2">
                    {pkg.description}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {pkg.duration}
                      </span>

                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {pkg.groupSize}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs line-through text-gray-400">
                        ${pkg.originalPrice}
                      </span>

                      <span className="ml-2 font-bold text-lg text-orange-500">
                        ${pkg.price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12">
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

                <p className="text-white/70 text-sm">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Explore Nepal?
          </h2>

          <p className="text-gray-500 mb-8">
            Sign up today and start planning your dream Nepali
            adventure with personalized itineraries and local insights.
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
}

export default HomePage;