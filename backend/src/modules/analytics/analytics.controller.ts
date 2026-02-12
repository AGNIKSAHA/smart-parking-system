import type { Request, Response } from "express";
import { send } from "../../common/utils/response.js";
import { BookingModel } from "../../db/models/booking.model.js";
import { SlotModel } from "../../db/models/slot.model.js";
import { SubscriptionModel } from "../../db/models/subscription.model.js";

export const adminAnalytics = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const [totalSlots, occupiedOrReserved] = await Promise.all([
    SlotModel.countDocuments().exec(),
    SlotModel.countDocuments({
      status: { $in: ["occupied", "reserved"] },
    }).exec(),
  ]);

  const bookingRevenueAgg = await BookingModel.aggregate<{ total: number }>([
    { $match: { status: "checked_out" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const subscriptionRevenueAgg = await SubscriptionModel.aggregate<{
    total: number;
  }>([
    { $match: { paymentStatus: "paid" } },
    { $group: { _id: null, total: { $sum: "$monthlyAmount" } } },
  ]);

  const totalBookingRevenue = bookingRevenueAgg[0]?.total ?? 0;
  const totalSubscriptionRevenue = subscriptionRevenueAgg[0]?.total ?? 0;
  const totalRevenue = totalBookingRevenue + totalSubscriptionRevenue;

  const peakHours = await BookingModel.aggregate<{
    hour: number;
    count: number;
  }>([
    { $match: { checkInAt: { $exists: true } } },
    { $group: { _id: { $hour: "$checkInAt" }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, hour: "$_id", count: 1 } },
  ]);

  const occupancyRate =
    totalSlots === 0
      ? 0
      : Number(((occupiedOrReserved / totalSlots) * 100).toFixed(2));

  send(res, 200, "Analytics", {
    occupancyRate,
    peakHours,
    revenue: totalRevenue,
  });
};
