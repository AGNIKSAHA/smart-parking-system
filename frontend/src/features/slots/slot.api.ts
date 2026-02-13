import { http } from "../../api/http";
import type { ApiResponse, Slot } from "../../types/domain";
import type { CreateSlotFormValues } from "../../types/form-types";

export const slotApi = {
  async list(
    vehicleType?: string,
    page = 1,
    limit = 12,
    search?: string,
  ): Promise<{ data: Slot[]; meta: ApiResponse<Slot[]>["meta"] }> {
    const res = await http.get<ApiResponse<Slot[]>>("/slots", {
      params: { vehicleType, page, limit, search },
    });
    return { data: res.data.data, meta: res.data.meta };
  },
  async create(payload: CreateSlotFormValues): Promise<void> {
    await http.post("/slots", payload);
  },
  async update(
    slotId: string,
    payload: Partial<CreateSlotFormValues> & { status?: Slot["status"] },
  ): Promise<void> {
    await http.patch(`/slots/${slotId}`, payload);
  },
  async remove(slotId: string): Promise<void> {
    await http.delete(`/slots/${slotId}`);
  },
};
