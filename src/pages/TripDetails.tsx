import { useState } from 'react';

import { Check } from 'lucide-react';
import { NavLink } from 'react-router';

export default function EverestBooking() {
  const [travelDate, setTravelDate] = useState<string>('');
  const [travelers, setTravelers] = useState<number>(2);
  const [specialRequest, setSpecialRequest] = useState<string>('');


  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#2d2d2d] font-sans antialiased">
      
      {/* Hero Banner Section */}
      <div className="relative h-64 sm:h-80 md:h-[400px] w-full overflow-hidden">
        <img 
          src="https://source.unsplash.com/1600x900/?everest" 
          alt="Everest Base Camp" 
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Destination Badge */}
        <div className="absolute top-6 left-6 md:top-12 md:left-24 bg-white/90 backdrop-blur-md px-6 py-4 rounded-xl shadow-lg border border-white/40">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">
            Everest Base Camp
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Solukhumbu, Koshi Province
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-10 relative z-10 pb-20">
        
        {/* Multi-step Progress Bar Indicator */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 max-w-2xl mx-auto py-4 px-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#b81d24] text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-red-200">
              1
            </span>
            <span className="text-sm font-semibold text-slate-800">Details</span>
          </div>
          <div className="h-[2px] bg-slate-200 flex-1 mx-4" />
          <div className="flex items-center gap-3 opacity-40">
            <span className="w-8 h-8 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm">
              2
            </span>
            <span className="text-sm font-medium text-slate-600">Travelers</span>
          </div>
          <div className="h-[2px] bg-slate-200 flex-1 mx-4" />
          <div className="flex items-center gap-3 opacity-40">
            <span className="w-8 h-8 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm">
              3
            </span>
            <span className="text-sm font-medium text-slate-600">Payment</span>
          </div>
        </div>

        {/* Form and Summary Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Trip Details Form Panel */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-8">
              Trip Details
            </h2>
            
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Travel Date Selection Field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Travel Date
                  </label>
                  <div className="relative">
                    <input 
                      type="date"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium outline-none focus:border-slate-400 focus:bg-white transition-all appearance-none"
                    />
                  </div>
                </div>

                {/* Number of Travelers Input Field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Number of Travelers
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    value={travelers}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      setTravelers(Number.isNaN(next) ? 1 : next);
                    }}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium outline-none focus:border-slate-400 focus:bg-white transition-all"
                    placeholder="2"
                  />
                </div>
              </div>

              {/* Special Requests Textarea Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Special Request
                </label>
                <textarea 
                  rows={3}

                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium outline-none focus:border-slate-400 focus:bg-white transition-all resize-none"
                  placeholder="Any dietary needs, accessibility requirements..."
                />
              </div>

              {/* Form Navigation Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                
                <button 
                  type="button"
                  className="px-6 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  Back
                </button>

                <NavLink to="/travelerinfo">
                <button 
                  type="button"
                  className="px-8 py-3 rounded-xl bg-[#b81d24] text-white font-bold shadow-md shadow-red-100 hover:bg-[#9c181e] active:scale-[0.98] transition-all"
                >
                  Continue
                </button>
                </NavLink>
              </div>
            </form>
          </div>

          {/* Dynamic Order Summary Sidebar */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6">
              Order Summary
            </h3>
            
            {/* Meta Parameters Panel */}
            <div className="space-y-4 pb-6 border-b border-slate-100 text-sm font-medium">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-400 font-normal">Package</span>
                <span className="text-slate-800 text-right max-w-[180px] font-semibold">Everest Base Camp Trek</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-normal">Duration</span>
                <span className="text-slate-800 font-semibold">14 Days/13 Nights</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-normal">Difficulty</span>
                <span className="bg-[#1e3a8a] text-white text-[11px] font-bold tracking-wide px-3 py-1 rounded-full uppercase">
                  Challenges
                </span>
              </div>
            </div>

            {/* Inclusions Feature List */}
            <div className="py-6 space-y-3.5 text-sm text-slate-600 font-medium">
              {[
                "Tea house lodging",
                "All meals on trek",
                "Domestic flights",
                "Permits",
                "Guide & porters"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Aggregate Pricing Panel */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-800 font-bold text-base">Total</span>
              <span className="text-2xl md:text-3xl font-black text-[#b81d24]">
                $1,200
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
