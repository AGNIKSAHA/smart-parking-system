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
    },
    planName: { type: String, required: true },
    monthlyAmount: { type: Number, required: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      required: true,
      default: "active",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      required: true,
      default: "pending",
    },
    stripePaymentIntentId: { type: String },
  },
  { timestamps: true },
);

export const SubscriptionModel = model("ParkingSubscription", schema);
