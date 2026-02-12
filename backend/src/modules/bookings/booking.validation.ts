import { z } from "zod";

export const createBookingSchema = z.object({
  slotId: z.string().length(24).optional(),
  vehicleId: z.string().length(24),
  startsAt: z.coerce.date().refine(
    (date) => {
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0,
      );
      const endOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999,
      );

      // Check if it's today AND not in the past (with 1min buffer for network/clock skew)
      return date >= new Date(Date.now() - 60000) && date <= endOfToday;
    },
    {
      message: "Start time must be in the future and within the current day",
    },
  ),
  durationMinutes: z.number().int().min(30).max(1440),
});

export const scanSchema = z.object({
  token: z.string().min(10),
  action: z.enum(["entry", "exit"]),
});
