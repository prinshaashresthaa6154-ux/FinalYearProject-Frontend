export interface TripDetails {
  startDate: string;
  endDate: string;
  travelers: number;
  destination: string;
  specialRequest: string;
}

export interface YourInfo {
  fullName: string;
  email: string;
  phone: string;
}

export type PaymentMethod = "esewa" | "stripe" | "card" | "bank";

export const BOOKING_STEPS = ["Trip Details", "Your Info", "Payment"] as const;

export function getDurationDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (end < start) return 0;
  return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
}
