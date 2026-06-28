import { createContext, useContext, useState, type ReactNode } from "react";
import type { TripDetails, YourInfo } from "./types";

interface GuideBookingContextValue {
  tripDetails: TripDetails;
  setTripDetails: (details: TripDetails) => void;
  yourInfo: YourInfo;
  setYourInfo: (info: YourInfo) => void;
}

const defaultTripDetails: TripDetails = {
  startDate: "",
  endDate: "",
  travelers: 1,
  destination: "",
  specialRequest: "",
};

const defaultYourInfo: YourInfo = {
  fullName: "",
  email: "",
  phone: "",
};

const GuideBookingContext = createContext<GuideBookingContextValue | null>(
  null,
);

export function GuideBookingProvider({ children }: { children: ReactNode }) {
  const [tripDetails, setTripDetails] =
    useState<TripDetails>(defaultTripDetails);
  const [yourInfo, setYourInfo] = useState<YourInfo>(defaultYourInfo);

  return (
    <GuideBookingContext.Provider
      value={{ tripDetails, setTripDetails, yourInfo, setYourInfo }}
    >
      {children}
    </GuideBookingContext.Provider>
  );
}

export function useGuideBooking() {
  const context = useContext(GuideBookingContext);
  if (!context) {
    throw new Error("useGuideBooking must be used within GuideBookingProvider");
  }
  return context;
}
