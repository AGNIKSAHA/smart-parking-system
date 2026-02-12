import { z } from "zod";

export const createVehicleSchema = z.object({
  plateNumber: z.string().min(4).max(20),
  make: z.string().min(1).max(40),
  model: z.string().min(1).max(40),
  color: z.string().min(1).max(20),
  vehicleType: z.enum(["car", "bike", "suv", "ev"])
});

export const updateVehicleSchema = createVehicleSchema;

export const vehicleIdParamSchema = z.object({
  vehicleId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid vehicle id")
});
