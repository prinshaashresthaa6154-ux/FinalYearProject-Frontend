import { EyeOff, Eye, Trash2, Star } from "lucide-react";
import { useAdminPlatform } from "../../../context/AdminPlatformContext";

export default function AdminReviews() {
  const { reviews, setReviewVisibility, deleteReview, visibleReviews } =
    useAdminPlatform();

  const avg =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const breakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold font-serif text-[#1a130e] mb-4">
            Review Analytics
          </h2>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold font-serif">
              {avg.toFixed(1)}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {reviews.length} total · {visibleReviews.length} visible
            </p>
          </div>
          <div className="space-y-2">
            {breakdown.map((row) => (
              <div key={row.stars} className="flex items-center gap-2 text-xs">
                <span className="w-8 text-gray-500">{row.stars}★</span>
                <div className="flex-1 h-2 rounded-full bg-[#f3ede8] overflow-hidden">
                  <div
                    className="h-full bg-[#b31919] rounded-full"
                    style={{
                      width: `${reviews.length ? (row.count / reviews.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="w-6 text-right text-gray-400">
                  {row.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#f0eae4]">
            <h2 className="text-lg font-bold font-serif text-[#1a130e]">
              All Reviews
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Hide inappropriate reviews or delete permanently
            </p>
          </div>
          <div className="divide-y divide-[#f5efe9]">
            {reviews.map((r) => (
              <div key={r.id} className="px-5 py-4 flex gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">{r.author}</p>
                    <span className="text-xs text-gray-400">
                      on {r.target} ({r.targetType})
                    </span>
                    {r.visibility === "Hidden" && (
                      <span className="text-[10px] font-bold uppercase bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < r.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-400 ml-2">{r.date}</span>
                  </div>
                  <p className="text-sm text-[#2c2520] mt-2">{r.text}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setReviewVisibility(
                        r.id,
                        r.visibility === "Visible" ? "Hidden" : "Visible",
                      )
                    }
                    className="p-2 text-gray-500 hover:bg-[#faf7f4] rounded-lg"
                    title={r.visibility === "Visible" ? "Hide" : "Show"}
                  >
                    {r.visibility === "Visible" ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Delete this review?")) deleteReview(r.id);
                    }}
                    className="p-2 text-[#b31919] hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
