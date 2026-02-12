import { z } from "zod";

export const createSlotSchema = z.object({
  code: z.string().min(2).max(20),
  zone: z.string().min(1).max(40),
  level: z.string().min(1).max(40),
  lotName: z.string().min(1).max(80),
  vehicleType: z.enum(["car", "bike", "suv", "ev"]),
  hourlyRate: z.number().positive(),
  overtimeMultiplier: z.number().min(1),
  penaltyPerHour: z.number().min(0),
  vacantSlots: z.number().int().min(1).max(200).default(1)
});

export const updateSlotSchema = z.object({
  code: z.string().min(2).max(20).optional(),
  zone: z.string().min(1).max(40).optional(),
  level: z.string().min(1).max(40).optional(),
  lotName: z.string().min(1).max(80).optional(),
  vehicleType: z.enum(["car", "bike", "suv", "ev"]).optional(),
  status: z.enum(["available", "reserved", "occupied", "maintenance"]).optional(),
  hourlyRate: z.number().positive().optional(),
  overtimeMultiplier: z.number().min(1).optional(),
  penaltyPerHour: z.number().min(0).optional()
});
