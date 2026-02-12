import { http } from "../../api/http";
import type { ApiResponse, Vehicle } from "../../types/domain";

export interface VehiclePayload {
  plateNumber: string;
  make: string;
  model: string;
  color: string;
  vehicleType: "car" | "bike" | "suv" | "ev";
}

export const vehicleApi = {
  async list(): Promise<Vehicle[]> {
    const res = await http.get<ApiResponse<Vehicle[]>>("/vehicles");
    return res.data.data;
  },
  async create(payload: VehiclePayload): Promise<void> {
    await http.post("/vehicles", payload);
  },
  async update(vehicleId: string, payload: VehiclePayload): Promise<void> {
    await http.patch(`/vehicles/${vehicleId}`, payload);
  },
  async remove(vehicleId: string): Promise<void> {
    await http.delete(`/vehicles/${vehicleId}`);
  }
};
