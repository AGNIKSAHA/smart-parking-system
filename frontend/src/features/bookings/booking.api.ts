import { http } from "../../api/http";
import type {
  ApiResponse,
  Booking,
  SecurityScanEvent,
} from "../../types/domain";

export const bookingApi = {
  async create(payload: {
    slotId: string;
    vehicleId: string;
    startsAt: string;
    durationMinutes: number;
  }): Promise<{
    id: string;
    qrImageDataUrl: string;
    clientSecret?: string;
    amount: number;
  }> {
    const res = await http.post<
      ApiResponse<{
        id: string;
        qrImageDataUrl: string;
        clientSecret?: string;
        amount: number;
      }>
    >("/bookings", payload);
    return res.data.data;
  },
  async listMine(
    page = 1,
    limit = 10,
  ): Promise<{ data: Booking[]; meta: ApiResponse<Booking[]>["meta"] }> {
    const res = await http.get<ApiResponse<Booking[]>>("/bookings/me", {
      params: { page, limit },
    });
    return { data: res.data.data, meta: res.data.meta };
  },
  async securityScans(): Promise<SecurityScanEvent[]> {
    const res =
      await http.get<ApiResponse<SecurityScanEvent[]>>("/bookings/scans");
    return res.data.data;
  },
  async cancel(bookingId: string): Promise<void> {
    await http.patch(`/bookings/${bookingId}/cancel`);
  },
  async scan(payload: {
    token: string;
    action: "entry" | "exit";
  }): Promise<void> {
    await http.post("/bookings/scan", payload);
  },
  async confirmPayment(
    bookingId: string,
    paymentIntentId?: string,
  ): Promise<void> {
    await http.post(`/bookings/${bookingId}/payment`, { paymentIntentId });
  },
};
