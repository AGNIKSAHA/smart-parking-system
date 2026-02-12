import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "ParkingBooking", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "ParkingUser", required: true },
    slotId: { type: Schema.Types.ObjectId, ref: "ParkingSlot", required: true },
    baseAmount: { type: Number, required: true },
    overtimeAmount: { type: Number, required: true },
    penaltyAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentReference: { type: String },
    paidAt: { type: Date },
    durationMinutes: { type: Number, required: true },
    bookedMinutes: { type: Number, required: true }
  },
  { timestamps: true }
);

export const LedgerModel = model("ParkingLedger", schema);
