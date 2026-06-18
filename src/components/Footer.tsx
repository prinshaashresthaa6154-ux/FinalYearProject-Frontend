import React from "react";
import { MapPin, Phone, Globe } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#221513] text-white pt-14">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-34 pb-12">
        <div>
          <h2 className="text-xl font-semibold mb-4">Nepal Yatra</h2>

          <p className="text-gray-300 leading-7">
            Your trusted companion for exploring the beauty, culture, and
            adventure of Nepal.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Explore</h3>

          <ul className="space-y-2 text-gray-300">
            <li className="hover:text-white cursor-pointer">Destinations</li>

            <li className="hover:text-white cursor-pointer">Packages</li>

            <li className="hover:text-white cursor-pointer">Culture</li>

            <li className="hover:text-white cursor-pointer">Trekking</li>

            <li className="hover:text-white cursor-pointer">Wildlife</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Support</h3>

          <ul className="space-y-2 text-gray-300">
            <li className="hover:text-white cursor-pointer">FAQ</li>

            <li className="hover:text-white cursor-pointer">Safety Guide</li>

            <li className="hover:text-white cursor-pointer">Travel Advisory</li>

            <li className="hover:text-white cursor-pointer">Emergency SOS</li>

            <li className="hover:text-white cursor-pointer">Contact Us</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Contact</h3>

          <div className="space-y-3 text-gray-300">
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

      <div className="border-t border-gray-700 py-5 text-center text-gray-400 text-sm">
        © 2026 Nepal Yatra. All rights reserved
      </div>
    </footer>
  );
};

export default Footer;
