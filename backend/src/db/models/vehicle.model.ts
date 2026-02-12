import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "ParkingUser", required: true, index: true },
    plateNumber: { type: String, required: true, unique: true, uppercase: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    color: { type: String, required: true },
    vehicleType: { type: String, enum: ["car", "bike", "suv", "ev"], required: true }
  },
  { timestamps: true }
);

export const VehicleModel = model("ParkingVehicle", schema);
