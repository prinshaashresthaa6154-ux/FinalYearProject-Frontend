import { Check } from "lucide-react";
import { BOOKING_STEPS } from "./types";

interface BookingStepperProps {
  currentStep: number;
}

export default function BookingStepper({ currentStep }: BookingStepperProps) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8 max-w-2xl mx-auto">
      {BOOKING_STEPS.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;

        return (
          <div key={step} className="flex items-center">
            <div className="flex items-center gap-2">
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  isCompleted
                    ? "bg-[#A51C1C] text-white"
                    : isActive
                      ? "bg-[#2D3748] text-white"
                      : "bg-gray-200 text-gray-400"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
              </span>
              <span
                className={`text-sm whitespace-nowrap ${
                  isActive
                    ? "font-semibold text-[#1A1A1A]"
                    : isCompleted
                      ? "text-[#1A1A1A]"
                      : "text-gray-400"
                }`}
              >
                {step}
              </span>
            </div>
            {index < BOOKING_STEPS.length - 1 && (
              <div
                className={`w-12 sm:w-20 h-px mx-3 sm:mx-4 ${
                  stepNumber < currentStep ? "bg-[#A51C1C]" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
