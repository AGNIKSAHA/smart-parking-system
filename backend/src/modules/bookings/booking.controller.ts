import type { Request, Response } from "express";
import { BookingModel } from "../../db/models/booking.model.js";
import { send } from "../../common/utils/response.js";
import { AppError } from "../../common/middlewares/error.middleware.js";
import { bookingService } from "./booking.service.js";

export const createBooking = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await bookingService.create({
    userId: req.user?.id ?? "",
    slotId: req.body.slotId,
    vehicleId: req.body.vehicleId,
    startsAt: new Date(req.body.startsAt),
    durationMinutes: Number(req.body.durationMinutes),
  });

  send(res, 201, "Payment initiated", {
    id: result.id,
    status: result.status,
    amount: result.amount,
    clientSecret: result.clientSecret,
  });
};

export const scanBooking = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await bookingService.scan(req.body);
  send(res, 200, "Scan processed", {
    id: result.booking._id.toString(),
    status: result.booking.status,
    amount: result.booking.amount,
    payment: result.payment,
  });
};

export const myHistory = async (req: Request, res: Response): Promise<void> => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (req.user?.role !== "admin") {
    filter.userId = req.user?.id;
  }

  const [items, total] = await Promise.all([
    BookingModel.find(filter)
      .populate("vehicleId", "plateNumber")
      .populate("userId", "name phoneNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    BookingModel.countDocuments(filter).exec(),
  ]);

  send(
    res,
    200,
    "Booking history",
    items.map((item) => {
      const vehicleDoc = item.vehicleId as { plateNumber?: string } | null;
      const userDoc = item.userId as {
        name?: string;
        phoneNumber?: string;
      } | null;
      return {
        id: item._id.toString(),
        status: item.status,
        startsAt: item.startsAt,
        endsAt: item.endsAt,
        amount: item.amount,
        overtimeMinutes: item.overtimeMinutes,
        checkInAt: item.checkInAt,
        checkOutAt: item.checkOutAt,
        qrImageDataUrl: item.qrImageDataUrl,
        vehicleNumber: vehicleDoc?.plateNumber ?? "-",
        userName: userDoc?.name ?? "-",
        phoneNumber: userDoc?.phoneNumber ?? "-",
      };
    }),
    { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  );
};

export const cancelMyBooking = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const bookingId = req.params.bookingId;
  if (!bookingId) {
    throw new Error("Booking ID is required");
  }

  const booking = await bookingService.cancelBooking({
    bookingId,
    userId: req.user?.id ?? "",
  });

  send(res, 200, "Booking cancelled", {
    id: booking._id.toString(),
    status: booking.status,
  });
};

export const confirmPayment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const bookingId = req.params.bookingId;
  if (!bookingId) {
    throw new Error("Booking ID is required");
  }
  const { paymentIntentId } = req.body;
  const booking = await bookingService.confirmPayment(
    bookingId,
    paymentIntentId,
  );
  if (!booking) {
    throw new AppError("Payment verification failed or booking not found", 400);
  }
  send(res, 200, "Payment confirmed", {
    id: booking._id.toString(),
    status: booking.status,
    paymentStatus: booking.paymentStatus,
  });
};

export const securityScanHistory = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const items = await BookingModel.find({
    $or: [{ checkInAt: { $exists: true } }, { checkOutAt: { $exists: true } }],
  })
    .populate("vehicleId", "plateNumber")
    .populate("userId", "name phoneNumber")
    .sort({ updatedAt: -1 })
    .limit(200)
    .exec();

  const scanEvents = items.flatMap((item) => {
    const vehicleDoc = item.vehicleId as { plateNumber?: string } | null;
    const userDoc = item.userId as {
      name?: string;
      phoneNumber?: string;
    } | null;
    const vehicleNumber = vehicleDoc?.plateNumber ?? "-";
    const phoneNumber = userDoc?.phoneNumber ?? "-";
    const userName = userDoc?.name ?? "-";
    const events: Array<{
      bookingId: string;
      action: "entry" | "exit";
      timestamp: Date;
      vehicleNumber: string;
      phoneNumber: string;
      userName: string;
    }> = [];

    if (item.checkInAt) {
      events.push({
        bookingId: item._id.toString(),
        action: "entry",
        timestamp: item.checkInAt,
        vehicleNumber,
        phoneNumber,
        userName,
      });
    }

    if (item.checkOutAt) {
      events.push({
        bookingId: item._id.toString(),
        action: "exit",
        timestamp: item.checkOutAt,
        vehicleNumber,
        phoneNumber,
        userName,
      });
    }

    return events;
  });

  send(
    res,
    200,
    "Security scan history",
    scanEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
  );
};
