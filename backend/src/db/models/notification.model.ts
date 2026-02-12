import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "ParkingUser",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    category: {
      type: String,
      enum: ["booking", "billing", "system", "payment"],
      required: true,
    },
    isRead: { type: Boolean, required: true, default: false },
    bookingId: { type: Schema.Types.ObjectId, ref: "ParkingBooking" },
  },
  { timestamps: true },
);

schema.post("save", function (doc) {
  // Import dynamically to avoid circular dependency if any
  import("../../modules/realtime/socket.js").then((m) => {
    m.emitNotification(doc.userId.toString());
  });
});

export const NotificationModel = model("ParkingNotification", schema);
