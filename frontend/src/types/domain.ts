export type UserRole = "admin" | "security" | "user";

export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phoneNumber: string;
  address: string;
  governmentIdNumber: string;
  qrImageDataUrl?: string;
  isActive: boolean;
}

export interface Slot {
  id: string;
  code: string;
  zone: string;
  level: string;
  lotName: string;
  vehicleType: "car" | "bike" | "suv" | "ev";
  status: "available" | "reserved" | "occupied" | "maintenance";
  hourlyRate: number;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  color: string;
  vehicleType: "car" | "bike" | "suv" | "ev";
  hasActiveBooking?: boolean;
  hasActiveSubscription?: boolean;
}

export interface Booking {
  id: string;
  status: "reserved" | "checked_in" | "checked_out" | "cancelled" | "expired";
  startsAt: string;
  endsAt: string;
  amount: number;
  overtimeMinutes: number;
  qrImageDataUrl?: string;
  vehicleNumber?: string;
  phoneNumber?: string;
  userName?: string;
}

export interface SecurityScanEvent {
  bookingId: string;
  action: "entry" | "exit";
  timestamp: string;
  vehicleNumber: string;
  phoneNumber: string;
  userName: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: "booking" | "billing" | "system";
  isRead: boolean;
  createdAt: string;
}
