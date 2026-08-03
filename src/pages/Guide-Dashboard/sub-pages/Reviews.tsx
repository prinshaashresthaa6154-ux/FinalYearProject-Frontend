<<<<<<< HEAD
import { Star } from "lucide-react";

const summary = {
  rating: "4.9",
=======
import { Star } from 'lucide-react';

const summary = {
  rating: '4.9',
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
  total: 245,
  breakdown: [
    { stars: 5, percent: 82 },
    { stars: 4, percent: 12 },
    { stars: 3, percent: 4 },
    { stars: 2, percent: 1 },
    { stars: 1, percent: 1 },
  ],
};

const reviews = [
  {
    id: 1,
<<<<<<< HEAD
    initials: "SJ",
    name: "Sarah Johnson",
    trip: "Everest Base Camp Trek",
    rating: 5,
    date: "Mar 18, 2026",
    text: "Pemba was an outstanding guide. Safety-focused, knowledgeable, and made the whole trek memorable.",
  },
  {
    id: 2,
    initials: "YH",
    name: "Yuki Harada",
    trip: "Langtang Valley Trek",
    rating: 5,
    date: "Feb 28, 2026",
    text: "Excellent pacing and great local insights. Highly recommend for first-time trekkers.",
  },
  {
    id: 3,
    initials: "JW",
    name: "James Wilson",
    trip: "Manaslu Circuit",
    rating: 4,
    date: "Jan 12, 2026",
    text: "Professional throughout. Weather was tough but Pemba handled logistics perfectly.",
  },
  {
    id: 4,
    initials: "EC",
    name: "Emily Chen",
    trip: "Annapurna Circuit",
    rating: 5,
    date: "Dec 20, 2025",
    text: "Warm, reliable, and always looking after the group. Would book again.",
=======
    initials: 'SJ',
    name: 'Sarah Johnson',
    trip: 'Everest Base Camp Trek',
    rating: 5,
    date: 'Mar 18, 2026',
    text: 'Pemba was an outstanding guide. Safety-focused, knowledgeable, and made the whole trek memorable.',
  },
  {
    id: 2,
    initials: 'YH',
    name: 'Yuki Harada',
    trip: 'Langtang Valley Trek',
    rating: 5,
    date: 'Feb 28, 2026',
    text: 'Excellent pacing and great local insights. Highly recommend for first-time trekkers.',
  },
  {
    id: 3,
    initials: 'JW',
    name: 'James Wilson',
    trip: 'Manaslu Circuit',
    rating: 4,
    date: 'Jan 12, 2026',
    text: 'Professional throughout. Weather was tough but Pemba handled logistics perfectly.',
  },
  {
    id: 4,
    initials: 'EC',
    name: 'Emily Chen',
    trip: 'Annapurna Circuit',
    rating: 5,
    date: 'Dec 20, 2025',
    text: 'Warm, reliable, and always looking after the group. Would book again.',
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
<<<<<<< HEAD
            i < count ? "fill-amber-400 text-amber-400" : "text-gray-300"
=======
            i < count ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
          }`}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#1a130e] font-serif mb-4">
            Rating Overview
          </h2>
          <div className="text-center mb-5">
            <div className="text-4xl font-bold font-serif text-[#1a130e]">
              {summary.rating}
            </div>
            <div className="flex justify-center mt-1">
              <Stars count={5} />
            </div>
<<<<<<< HEAD
            <p className="text-xs text-gray-400 mt-1">
              {summary.total} reviews
            </p>
=======
            <p className="text-xs text-gray-400 mt-1">{summary.total} reviews</p>
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
          </div>
          <div className="space-y-2">
            {summary.breakdown.map((row) => (
              <div key={row.stars} className="flex items-center gap-2 text-xs">
                <span className="w-8 text-gray-500">{row.stars}★</span>
                <div className="flex-1 h-2 rounded-full bg-[#f3ede8] overflow-hidden">
                  <div
                    className="h-full bg-[#b31919] rounded-full"
                    style={{ width: `${row.percent}%` }}
                  />
                </div>
<<<<<<< HEAD
                <span className="w-8 text-right text-gray-400">
                  {row.percent}%
                </span>
=======
                <span className="w-8 text-right text-gray-400">{row.percent}%</span>
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#f0eae4]">
            <h2 className="text-lg font-bold text-[#1a130e] font-serif">
              Recent Reviews
            </h2>
          </div>
          <div className="divide-y divide-[#f5efe9]">
            {reviews.map((review) => (
              <div key={review.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#1e2a44] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                      {review.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1a130e]">
                        {review.name}
                      </p>
<<<<<<< HEAD
                      <p className="text-xs text-gray-400 mt-0.5">
                        {review.trip}
                      </p>
=======
                      <p className="text-xs text-gray-400 mt-0.5">{review.trip}</p>
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
                      <div className="mt-1.5">
                        <Stars count={review.rating} />
                      </div>
                      <p className="text-sm text-[#2c2520] mt-2 leading-relaxed">
                        {review.text}
                      </p>
                    </div>
                  </div>
<<<<<<< HEAD
                  <span className="text-xs text-gray-400 shrink-0">
                    {review.date}
                  </span>
=======
                  <span className="text-xs text-gray-400 shrink-0">{review.date}</span>
>>>>>>> e43b886b4ee54d59044348a1a82e3a98435d9cbb
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
