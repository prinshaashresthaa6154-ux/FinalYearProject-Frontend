import { ArrowLeft } from "lucide-react";
import {
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import { getGuideById } from "../../data/guides";
import BookingStepper from "./BookingStepper";
import { GuideBookingProvider } from "./GuideBookingContext";

function GuideBookingLayoutContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const guide = getGuideById(Number(id));

  const currentStep = location.pathname.endsWith("/your-info") ? 2 : 1;

  if (!guide) {
    return (
      <div className="min-h-screen bg-[#F7F3F0] flex items-center justify-center font-sans">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Guide not found.</p>
          <button
            onClick={() => navigate("/guide")}
            className="text-[#A51C1C] font-medium hover:underline"
          >
            Back to Guides
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3F0] font-sans">
      <header className="bg-gradient-to-r from-[#A51C1C] to-[#2D3748] px-6 md:px-16 py-8 md:py-10">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(`/guide/${guide.id}`)}
            className="flex items-center gap-1.5 text-white/90 text-sm hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Guide Profile
          </button>

          <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
            Book Freelance Guide
          </h1>
          <p className="text-white/85 text-sm md:text-base">
            Complete your booking with {guide.name}
          </p>
        </div>
      </header>

      <main className="px-6 md:px-16 py-8">
        <div className="max-w-7xl mx-auto">
          <BookingStepper currentStep={currentStep} />
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function GuideBookingLayout() {
  const { id } = useParams();
  const guide = getGuideById(Number(id));

  if (!guide) {
    return <Navigate to="/guide" replace />;
  }

  return (
    <GuideBookingProvider>
      <GuideBookingLayoutContent />
    </GuideBookingProvider>
  );
}
