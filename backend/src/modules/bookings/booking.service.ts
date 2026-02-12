import { Types } from "mongoose";
import Stripe from "stripe";
import { BookingModel } from "../../db/models/booking.model.js";
import { LedgerModel } from "../../db/models/ledger.model.js";
import { SlotModel } from "../../db/models/slot.model.js";
import { UserModel } from "../../db/models/user.model.js";
import { VehicleModel } from "../../db/models/vehicle.model.js";
import { SubscriptionModel } from "../../db/models/subscription.model.js";
import { AppError } from "../../common/middlewares/error.middleware.js";
import { stripe } from "../payments/stripe.js";
import { computeBill } from "../billing/billing.js";
import { createQr, verifyQr } from "./qr.js";
import { emitBooking, emitSlot } from "../realtime/socket.js";
import { NotificationModel } from "../../db/models/notification.model.js";
import { sendEmail, triggerEvent } from "../notifications/notify.js";

export const bookingService = {
  async create(input: {
    userId: string;
    slotId?: string;
    vehicleId: string;
    startsAt: Date;
    durationMinutes: number;
  }) {
    const vehicle = await VehicleModel.findOne({
      _id: input.vehicleId,
      userId: input.userId,
    }).exec();
    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    const bookingId = new Types.ObjectId();

    let reservedSlot;
    if (input.slotId) {
      reservedSlot = await SlotModel.findOneAndUpdate(
        {
          _id: input.slotId,
          status: "available",
          activeBookingId: null,
        },
        { $set: { status: "reserved", activeBookingId: bookingId } },
        { new: true },
      ).exec();
    } else {
      reservedSlot = await SlotModel.findOneAndUpdate(
        {
          vehicleType: vehicle.vehicleType,
          status: "available",
          activeBookingId: null,
        },
        { $set: { status: "reserved", activeBookingId: bookingId } },
        { new: true },
      ).exec();
    }

    if (!reservedSlot) {
      throw new AppError("Slot unavailable", 409);
    }

    input.slotId = reservedSlot._id.toString();
    const bookedHours = Math.ceil(input.durationMinutes / 60);
    const amount = bookedHours * reservedSlot.hourlyRate;

    if (amount < 50) {
      await SlotModel.findByIdAndUpdate(input.slotId, {
        status: "available",
        activeBookingId: null,
      });
      emitSlot(input.slotId, "available");

      throw new AppError(
        "Stripe requires a minimum payment of INR 50. Please increase your booking duration or select a slot with a higher rate.",
        400,
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "inr",
      metadata: {
        bookingId: bookingId.toString(),
        slotId: input.slotId,
        userId: input.userId,
        vehicleId: input.vehicleId,
        startsAt: input.startsAt.toISOString(),
        durationMinutes: input.durationMinutes.toString(),
      },
      automatic_payment_methods: { enabled: true },
    });

    emitSlot(input.slotId, "reserved");

    return {
      id: bookingId.toString(),
      amount,
      clientSecret: paymentIntent.client_secret,
      status: "pending_payment",
    };
  },

  async fulfillPayment(paymentIntent: Stripe.PaymentIntent) {
    const { bookingId, slotId, userId, vehicleId, startsAt, durationMinutes } =
      paymentIntent.metadata;

    if (
      !bookingId ||
      !slotId ||
      !userId ||
      !vehicleId ||
      !startsAt ||
      !durationMinutes
    ) {
      throw new AppError("Missing required metadata in payment intent", 400);
    }

    let booking = await BookingModel.findById(bookingId).exec();
    if (booking) {
      if (booking.paymentStatus !== "paid") {
        booking.paymentStatus = "paid";
        booking.stripePaymentIntentId = paymentIntent.id;
        await booking.save();
      }
      return booking;
    }

    const startsAtDate = new Date(startsAt);
    const durationCount = parseInt(durationMinutes);
    const endsAt = new Date(startsAtDate.getTime() + durationCount * 60_000);

    const qr = await createQr({
      bookingId: bookingId,
      slotId: slotId,
      userId: userId,
      issuedAt: Date.now(),
    });

    booking = await BookingModel.create({
      _id: bookingId,
      userId: new Types.ObjectId(userId),
      slotId: new Types.ObjectId(slotId),
      vehicleId: new Types.ObjectId(vehicleId),
      startsAt: startsAtDate,
      endsAt,
      expectedDurationMinutes: durationCount,
      status: "reserved",
      qrToken: qr.token,
      qrImageDataUrl: qr.imageDataUrl,
      amount: paymentIntent.amount / 100,
      paymentStatus: "paid",
      stripePaymentIntentId: paymentIntent.id,
    });

    emitBooking(userId, booking._id.toString(), "reserved");

    await NotificationModel.create({
      userId: userId,
      category: "payment",
      title: "Payment Successful",
      message: `Your booking #${bookingId} is confirmed and paid. Amount: INR ${(paymentIntent.amount / 100).toFixed(2)}`,
      bookingId: booking._id,
    });

    const adminAndSecurityUsers = await UserModel.find({
      role: { $in: ["admin", "security"] },
    })
      .select("_id")
      .exec();

    await Promise.all(
      adminAndSecurityUsers.map((user) =>
        NotificationModel.create({
          userId: user._id,
          category: "booking",
          title: "New Confirmed Booking",
          message: `Booking #${bookingId} has been paid and confirmed.`,
          bookingId: booking._id,
        }),
      ),
    );

    await triggerEvent("booking.created", {
      bookingId: bookingId,
      userId: userId,
      endsAt: endsAt.toISOString(),
    });

    const user = await UserModel.findById(userId).exec();
    if (user) {
      await sendEmail(
        user.email,
        "Booking Confirmed & Paid",
        `Your booking #${bookingId} is confirmed. Amount: INR ${(paymentIntent.amount / 100).toFixed(2)} has been received.`,
      );
    }

    return booking;
  },

  async confirmPayment(bookingId: string, paymentIntentId?: string) {
    let paymentIntent;

    if (paymentIntentId) {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    } else {
      const searchResponse = await stripe.paymentIntents.search({
        query: `metadata["bookingId"]:"${bookingId}"`,
      });
      paymentIntent = searchResponse.data[0];
    }

    if (!paymentIntent) {
      throw new AppError("No payment intent found for this booking ID", 404);
    }

    if (paymentIntent.status === "succeeded") {
      return await this.fulfillPayment(paymentIntent);
    }

    throw new AppError(
      `Payment not successful (Status: ${paymentIntent.status})`,
      400,
    );
  },

  async scan(input: { token: string; action: "entry" | "exit" }) {
    const payload = await verifyQr(input.token);

    if ("email" in payload) {
      return await this.handleSubscriptionScan(payload.userId, input.action);
    }

    const booking = await BookingModel.findById(payload.bookingId).exec();

    if (!booking) {
      throw new AppError("Invalid or expired booking", 404);
    }

    if (booking.paymentStatus !== "paid") {
      throw new AppError("Payment not completed for this booking", 403);
    }

    const slot = await SlotModel.findById(booking.slotId).exec();
    if (!slot) {
      throw new AppError("Slot not found", 404);
    }

    if (input.action === "entry") {
      if (booking.status !== "reserved") {
        throw new AppError(
          `Cannot check-in from status: ${booking.status}`,
          400,
        );
      }

      booking.status = "checked_in";
      booking.checkInAt = new Date();
      await booking.save();

      slot.status = "occupied";
      await slot.save();

      emitSlot(slot._id.toString(), "occupied");
      emitBooking(
        booking.userId.toString(),
        booking._id.toString(),
        "checked_in",
      );

      await NotificationModel.create({
        userId: booking.userId,
        category: "booking",
        title: "Checked In",
        message: `You have checked into slot ${slot.code}`,
        bookingId: booking._id,
      });

      return { booking, payment: null };
    } else {
      if (booking.status !== "checked_in") {
        throw new AppError(
          `Cannot check-out from status: ${booking.status}`,
          400,
        );
      }

      const checkOutAt = new Date();
      const parkedMinutes = Math.ceil(
        (checkOutAt.getTime() - (booking.checkInAt?.getTime() ?? Date.now())) /
          60_000,
      );

      const bill = computeBill({
        bookedMinutes: booking.expectedDurationMinutes,
        parkedMinutes,
        hourlyRate: slot.hourlyRate,
        overtimeMultiplier: slot.overtimeMultiplier,
        penaltyPerHour: slot.penaltyPerHour,
      });

      let amountToCharge = 0;
      if (booking.paymentStatus === "paid") {
        amountToCharge = bill.overtimeAmount + bill.penaltyAmount;
      } else {
        amountToCharge = bill.totalAmount;
      }

      let paymentIntent = null;
      if (amountToCharge >= 50) {
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amountToCharge * 100),
          currency: "inr",
          metadata: {
            bookingId: booking._id.toString(),
            type: "overtime",
          },
          automatic_payment_methods: { enabled: true },
        });
      }

      booking.status = "checked_out";
      booking.checkOutAt = checkOutAt;
      booking.overtimeMinutes = bill.overtimeMinutes;
      booking.amount += amountToCharge;
      if (amountToCharge > 0 && amountToCharge < 50) {
      }
      await booking.save();

      slot.status = "available";
      slot.activeBookingId = null;
      await slot.save();

      await LedgerModel.create({
        bookingId: booking._id,
        userId: booking.userId,
        slotId: booking.slotId,
        baseAmount: bill.baseAmount,
        overtimeAmount: bill.overtimeAmount,
        penaltyAmount: bill.penaltyAmount,
        totalAmount: bill.totalAmount,
        durationMinutes: parkedMinutes,
        bookedMinutes: booking.expectedDurationMinutes,
      });

      emitSlot(slot._id.toString(), "available");
      emitBooking(
        booking.userId.toString(),
        booking._id.toString(),
        "checked_out",
      );

      await NotificationModel.create({
        userId: booking.userId,
        category: "billing",
        title: "Booking Completed",
        message: `Checked out. Total amount: INR ${booking.amount.toFixed(2)} (No refunds for early exit).`,
        bookingId: booking._id,
      });

      return {
        booking,
        payment: paymentIntent
          ? {
              clientSecret: paymentIntent.client_secret,
              amount: amountToCharge,
            }
          : null,
      };
    }
  },

  async listMine(userId: string) {
    return await BookingModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  },

  async cancelBooking(input: { bookingId: string; userId: string }) {
    const booking = await BookingModel.findOne({
      _id: input.bookingId,
      userId: input.userId,
    }).exec();

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    if (booking.status !== "reserved") {
      throw new AppError("Cannot cancel booking in current status", 400);
    }

    booking.status = "cancelled";
    await booking.save();

    const slot = await SlotModel.findById(booking.slotId).exec();
    if (slot) {
      slot.status = "available";
      slot.activeBookingId = null;
      await slot.save();
      emitSlot(slot._id.toString(), "available");
    }

    if (booking.paymentStatus === "paid" && booking.stripePaymentIntentId) {
      try {
        const amountToRefund = Math.floor(booking.amount * 100 * 0.5);

        if (amountToRefund > 0) {
          await stripe.refunds.create({
            payment_intent: booking.stripePaymentIntentId,
            amount: amountToRefund,
            reason: "requested_by_customer",
          });
        }
      } catch (error) {
        console.error("Refund failed for booking cancellation:", error);
      }
    }

    emitBooking(booking.userId.toString(), booking._id.toString(), "cancelled");

    await NotificationModel.create({
      userId: booking.userId,
      category: "booking",
      title: "Booking Cancelled",
      message: `Your booking #${booking._id} has been cancelled.`,
      bookingId: booking._id,
    });

    return booking;
  },

  async securityScans() {
    return await BookingModel.find({
      $or: [
        { checkInAt: { $exists: true } },
        { checkOutAt: { $exists: true } },
      ],
    })
      .populate("vehicleId", "plateNumber")
      .sort({ updatedAt: -1 })
      .limit(100)
      .exec();
  },

  async handleSubscriptionScan(userId: string, action: "entry" | "exit") {
    const subscription = await SubscriptionModel.findOne({
      userId,
      status: "active",
      endsAt: { $gt: new Date() },
    }).exec();

    if (!subscription) {
      throw new AppError("No active subscription found for this user", 403);
    }

    if (action === "entry") {
      const existing = await BookingModel.findOne({
        userId,
        status: "checked_in",
      }).exec();

      if (existing) {
        throw new AppError("You are already checked in", 400);
      }

      const bookingId = new Types.ObjectId();
      let slot;

      if (subscription.slotId) {
        slot = await SlotModel.findOneAndUpdate(
          { _id: subscription.slotId },
          {
            $set: {
              status: "occupied",
              activeBookingId: bookingId,
            },
          },
          { new: true },
        ).exec();
      } else {
        slot = await SlotModel.findOneAndUpdate(
          { status: "available" },
          {
            $set: {
              status: "occupied",
              activeBookingId: bookingId,
            },
          },
          { new: true },
        ).exec();
      }

      if (!slot) {
        throw new AppError(
          "No parking slots available or your slot is blocked",
          409,
        );
      }

      const booking = await BookingModel.create({
        _id: bookingId,
        userId,
        slotId: slot._id,
        vehicleId: subscription.vehicleId,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        expectedDurationMinutes: 1440,
        status: "checked_in",
        checkInAt: new Date(),
        amount: 0,
        paymentStatus: "paid",
        qrToken: "subscription-entry",
        qrImageDataUrl: "subscription-entry",
        expiryWarningSent: true,
        expiryAlertSent: true,
      });

      emitSlot(slot._id.toString(), "occupied");

      await NotificationModel.create({
        userId,
        category: "booking",
        title: "Subscription Entry",
        message: `Welcome back! Checked into slot ${slot.code}`,
        bookingId: booking._id,
      });

      return { booking, payment: null };
    } else {
      const booking = await BookingModel.findOne({
        userId,
        status: "checked_in",
      })
        .sort({ checkInAt: -1 })
        .exec();

      if (!booking) {
        throw new AppError("No active check-in found to exit from", 404);
      }

      const slot = await SlotModel.findById(booking.slotId).exec();

      booking.status = "checked_out";
      booking.checkOutAt = new Date();
      booking.amount = 0;
      await booking.save();

      if (slot) {
        slot.status = "available";
        slot.activeBookingId = null;
        await slot.save();
        emitSlot(slot._id.toString(), "available");
      }

      const durationMinutes = Math.ceil(
        (booking.checkOutAt!.getTime() - booking.checkInAt!.getTime()) / 60000,
      );
      await LedgerModel.create({
        bookingId: booking._id,
        userId,
        slotId: booking.slotId,
        baseAmount: 0,
        overtimeAmount: 0,
        penaltyAmount: 0,
        totalAmount: 0,
        durationMinutes,
        bookedMinutes: 0,
      });

      await NotificationModel.create({
        userId,
        category: "booking",
        title: "Subscription Exit",
        message: "Have a safe drive! Visit again.",
        bookingId: booking._id,
      });

      return { booking, payment: null };
    }
  },
};
