import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    zone: { type: String, required: true },
    level: { type: String, required: true },
    lotName: { type: String, required: true },
    vehicleType: { type: String, enum: ["car", "bike", "suv", "ev"], required: true },
    status: {
      type: String,
      enum: ["available", "reserved", "occupied", "maintenance"],
      required: true,
      default: "available",
      index: true
    },
    activeBookingId: { type: Schema.Types.ObjectId, ref: "ParkingBooking" },
    hourlyRate: { type: Number, required: true },
    overtimeMultiplier: { type: Number, required: true },
    penaltyPerHour: { type: Number, required: true }
  },
  { timestamps: true }
);

export const SlotModel = model("ParkingSlot", schema);
