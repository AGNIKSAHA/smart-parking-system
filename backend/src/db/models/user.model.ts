import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "security", "user"],
      required: true,
      default: "user",
    },
    phoneNumber: { type: String, trim: true },
    address: { type: String, trim: true },
    governmentIdNumber: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false, index: true },
    emailVerificationTokenHash: { type: String },
    emailVerificationExpiresAt: { type: Date },
    passwordResetTokenHash: { type: String },
    passwordResetExpiresAt: { type: Date },
    qrImageDataUrl: { type: String },
  },
  { timestamps: true },
);

export const UserModel = model("ParkingUser", schema);
