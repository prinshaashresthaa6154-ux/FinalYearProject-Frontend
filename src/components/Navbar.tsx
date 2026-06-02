import React, { useState } from 'react';
import { NavLink } from 'react-router';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const[token, setToken] = useState(localStorage.getItem("token") || null);

  return (


    <nav className="w-full bg-[#251D18] text-[#F9F7F5] font-poppins px-6 py-4 md:px-16">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo / Brand Name */}
        <div className="text-xl font-bold tracking-wide cursor-pointer">
          Nepal Yatra
        </div>
 
        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-10 text-sm font-semibold tracking-wider">
          <NavLink to="/homepage" className="hover:text-gray-400 transition-colors">Home</NavLink>
          <NavLink to="/destinations" className="hover:text-gray-400 transition-colors">Destinations</NavLink>
          <NavLink to="/packages" className="hover:text-gray-400 transition-colors">Packages</NavLink>
          <NavLink to="/guide" className="hover:text-gray-400 transition-colors">Guide</NavLink>
        </div>

        {/* Desktop Buttons */}
        {token ? (
          <div className="hidden md:flex items-center space-x-4 text-sm font-semibold">
          <NavLink to="/" className="border border-white/60 px-5 py-1.5 rounded-full hover:bg-white/10 transition-colors">
            Logout
          </NavLink>
        </div>
        ) : (

        <div className="hidden md:flex items-center space-x-4 text-sm font-semibold">
          <NavLink to="/login" className="border border-white/60 px-5 py-1.5 rounded-full hover:bg-white/10 transition-colors">
            Login
          </NavLink>
          <NavLink to="/register" className="bg-gradient-to-r from-red-600 to-blue-800 px-5 py-1.5 rounded-md hover:opacity-90 transition-opacity">
            Sign Up
          </NavLink>
        </div>
        )}

        {/* Mobile Hamburger Menu Button */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-white/10 flex flex-col space-y-4 text-sm font-semibold">
          <a href="#home" className="hover:text-gray-300">Home</a>
          <a href="#destinations" className="hover:text-gray-300">Destinations</a>
          <a href="#packages" className="hover:text-gray-300">Packages</a>
          <a href="#guide" className="hover:text-gray-300">Guide</a>
          <hr className="border-white/10" />
          <div className="flex flex-col space-y-2">
            <button className="w-full border border-white/60 py-2 rounded-full hover:bg-white/10">
              Login
            </button>
            <button className="w-full bg-gradient-to-r from-red-600 to-blue-800 py-2 rounded-md">
              Sign Up
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
