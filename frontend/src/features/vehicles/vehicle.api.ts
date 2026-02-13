import { http } from "../../api/http";
import type { ApiResponse, Vehicle } from "../../types/domain";
import type { VehicleFormValues } from "../../types/form-types";

export const vehicleApi = {
  async list(): Promise<Vehicle[]> {
    const res = await http.get<ApiResponse<Vehicle[]>>("/vehicles");
    return res.data.data;
  },
  async create(payload: VehicleFormValues): Promise<void> {
    await http.post("/vehicles", payload);
  },
  async update(vehicleId: string, payload: VehicleFormValues): Promise<void> {
    await http.patch(`/vehicles/${vehicleId}`, payload);
  },
  async remove(vehicleId: string): Promise<void> {
    await http.delete(`/vehicles/${vehicleId}`);
  },
};
