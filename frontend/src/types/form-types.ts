import type {
  Slot,
  SessionUser,
  Vehicle,
  Booking,
  SecurityScanEvent,
} from "./domain";

export interface AnalyticsPayload {
  occupancyRate: number;
  revenue: number;
  peakHours: Array<{ hour: number; count: number }>;
}

export interface SubscriptionFormValues {
  vehicleId: string;
  planName: string;
  monthlyAmount: number;
  startsAt: string;
  slotId?: string;
}

export interface VehicleFormValues {
  plateNumber: string;
  make: string;
  model: string;
  color: string;
  vehicleType: "car" | "bike" | "suv" | "ev";
}

export interface CreateSlotFormValues {
  code: string;
  zone: string;
  level: string;
  lotName: string;
  vehicleType: "car" | "bike" | "suv" | "ev";
  hourlyRate: number;
  overtimeMultiplier: number;
  penaltyPerHour: number;
  vacantSlots: number;
}

export interface EditSlotFormValues {
  code: string;
  zone: string;
  level: string;
  lotName: string;
  vehicleType: "car" | "bike" | "suv" | "ev";
  hourlyRate: number;
  overtimeMultiplier: number;
  penaltyPerHour: number;
  status: Slot["status"];
}

export interface BookingFormValues {
  slotId: string;
  vehicleId: string;
  startsAt: string;
  durationMinutes: number;
}

export interface BookingResult {
  id: string;
  qrImageDataUrl: string;
  clientSecret?: string;
  amount: number;
}

export interface ScanFormValues {
  token: string;
  action: "entry" | "exit";
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  role: "user" | "security" | "admin";
}

export interface ResetPasswordFormValues {
  token: string;
  password: string;
}
