import { z } from "zod";

export const createSubscriptionSchema = z.object({
  vehicleId: z.string().length(24),
  planName: z.string().min(3).max(80),
  monthlyAmount: z.number().positive(),
  startsAt: z.coerce.date().refine(
    (date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    },
    { message: "Start date must be today or in the future" },
  ),
  slotId: z.string().length(24).optional(),
});
