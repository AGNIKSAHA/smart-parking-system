import { BookingModel } from "../../db/models/booking.model.js";
import { NotificationModel } from "../../db/models/notification.model.js";
import { SlotModel } from "../../db/models/slot.model.js";
import { emitBooking, emitSlot } from "../realtime/socket.js";

let timer: NodeJS.Timeout | null = null;

const run = async (): Promise<void> => {
  const now = new Date();
  const threshold = new Date(now.getTime() + 15 * 60_000);

  try {
    const expiring = await BookingModel.find({
      status: { $in: ["reserved", "checked_in"] },
      expiryWarningSent: false,
      endsAt: { $gte: now, $lte: threshold },
    }).exec();

    for (const booking of expiring) {
      await NotificationModel.create({
        userId: booking.userId,
        bookingId: booking._id,
        category: "booking",
        title: "Parking Ending Soon",
        message: `Your parking session will expire at ${booking.endsAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. Please ensure you leave on time.`,
      });

      booking.expiryWarningSent = true;
      await booking.save();
    }

    const justExpired = await BookingModel.find({
      status: "checked_in",
      expiryAlertSent: false,
      endsAt: { $lte: now },
    }).exec();

    for (const booking of justExpired) {
      await NotificationModel.create({
        userId: booking.userId,
        bookingId: booking._id,
        category: "booking",
        title: "Session Expired - Overtime",
        message:
          "Your booked time has ended. You are now in overtime and additional charges will apply.",
      });

      booking.expiryAlertSent = true;
      await booking.save();
    }

    const expiredReservations = await BookingModel.find({
      status: "reserved",
      endsAt: { $lte: now },
    }).exec();

    for (const booking of expiredReservations) {
      booking.status = "expired";
      await booking.save();

      await SlotModel.updateOne(
        { _id: booking.slotId, activeBookingId: booking._id },
        { $set: { status: "available", activeBookingId: null } },
      ).exec();

      emitSlot(booking.slotId.toString(), "available");
      emitBooking(booking.userId.toString(), booking._id.toString(), "expired");

      await NotificationModel.create({
        userId: booking.userId,
        bookingId: booking._id,
        category: "booking",
        title: "Reservation Expired",
        message:
          "Your reservation has expired as you did not check in within the allotted time.",
      });
    }
  } catch (error) {
    console.error("Error in expiry worker:", error);
  }
};

export const startExpiryWorker = (): void => {
  if (timer) {
    return;
  }

  void run();

  timer = setInterval(() => {
    void run();
  }, 60_000);
};
