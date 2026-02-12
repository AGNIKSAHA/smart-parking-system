import { http } from "../../api/http";
import type { ApiResponse, Slot } from "../../types/domain";

interface CreateSlotPayload {
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

export const slotApi = {
  async list(
    vehicleType?: string,
    page = 1,
    limit = 12,
    lotName?: string,
  ): Promise<{ data: Slot[]; meta: ApiResponse<Slot[]>["meta"] }> {
    const res = await http.get<ApiResponse<Slot[]>>("/slots", {
      params: { vehicleType, page, limit, lotName },
    });
    return { data: res.data.data, meta: res.data.meta };
  },
  async create(payload: CreateSlotPayload): Promise<void> {
    await http.post("/slots", payload);
  },
  async update(
    slotId: string,
    payload: Partial<CreateSlotPayload> & { status?: Slot["status"] },
  ): Promise<void> {
    await http.patch(`/slots/${slotId}`, payload);
  },
  async remove(slotId: string): Promise<void> {
    await http.delete(`/slots/${slotId}`);
  },
};
