import { z } from "zod";

export const updateMyProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  phoneNumber: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits")
    .or(z.literal(""))
    .optional(),
  address: z.string().min(5).max(240).or(z.literal("")).optional(),
  governmentIdNumber: z.string().min(4).max(64).or(z.literal("")).optional(),
});

export const updateUserProfileSchema = updateMyProfileSchema;

export const adminProfileListQuerySchema = z.object({
  role: z.enum(["user", "security"]).optional(),
});
