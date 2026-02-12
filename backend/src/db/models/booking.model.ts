import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "ParkingUser",
      required: true,
      index: true,
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "ParkingVehicle",
      required: true,
    },
    slotId: {
      type: Schema.Types.ObjectId,
      ref: "ParkingSlot",
      required: true,
      index: true,
    },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    expectedDurationMinutes: { type: Number, required: true },
    status: {
      type: String,
      enum: ["reserved", "checked_in", "checked_out", "cancelled", "expired"],
      required: true,
      default: "reserved",
      index: true,
    },
    qrToken: { type: String, required: true },
    qrImageDataUrl: { type: String, required: true },
    checkInAt: { type: Date },
    checkOutAt: { type: Date },
    amount: { type: Number, required: true, default: 0 },
    overtimeMinutes: { type: Number, required: true, default: 0 },
    penaltyAmount: { type: Number, required: true, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      required: true,
      default: "pending",
    },
    stripePaymentIntentId: { type: String },
    expiryWarningSent: { type: Boolean, default: false },
    expiryAlertSent: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const BookingModel = model("ParkingBooking", schema);
