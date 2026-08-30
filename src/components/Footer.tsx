import { MapPin, Phone, Globe } from "lucide-react";
import { Link } from "react-router";

const Footer = () => {
  return (
    <footer className="bg-black pt-14 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pb-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-16">
        <div>
          <h2 className="text-xl font-semibold tracking-tight mb-4">Nepal Yatra</h2>

           <p className="max-w-xs text-sm leading-7 text-white/65">
            Your trusted companion for exploring the beauty, culture, and
            adventure of Nepal.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Explore</h3>

           <ul className="space-y-2 text-sm text-white/65">
            <li><Link to="/destinations" className="transition-colors hover:text-[#1D78AF]">Destinations</Link></li>
            <li><Link to="/grouptrips" className="transition-colors hover:text-[#1D78AF]">Group Trips</Link></li>
            <li><Link to="/guide" className="transition-colors hover:text-[#1D78AF]">Local Guides</Link></li>
            <li><Link to="/destinations/1" className="transition-colors hover:text-[#1D78AF]">Trekking</Link></li>
            <li><Link to="/destinations/5" className="transition-colors hover:text-[#1D78AF]">Wildlife</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Support</h3>

           <ul className="space-y-2 text-sm text-white/65">
            <li>FAQ</li>

            <li>Safety Guide</li>

            <li>Travel Advisory</li>

            <li>Emergency SOS</li>

            <li>Contact Us</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Contact</h3>

             <div className="space-y-3 text-sm text-white/65">
            <div className="flex items-start gap-2">
              <MapPin size={18} className="mt-1" />
              <p>Balambu, Kathmandu, Nepal</p>
            </div>

            <div className="flex items-center gap-2">
              <Phone size={18} />
              <p>+977-9840007774</p>
            </div>

            <div className="flex items-center gap-2">
              <Globe size={18} />
              <p>info@nepalyatra.com</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15 py-5 text-center text-sm text-white/50">
        © 2026 Nepal Yatra. All rights reserved
      </div>
    </footer>
  );
};

export default Footer;
