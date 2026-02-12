import type { Request, Response } from "express";
import { AppError } from "../../common/middlewares/error.middleware.js";
import { VehicleModel } from "../../db/models/vehicle.model.js";
import { BookingModel } from "../../db/models/booking.model.js";
import { SubscriptionModel } from "../../db/models/subscription.model.js";
import { send } from "../../common/utils/response.js";

const toVehicleResponse = (vehicle: {
  _id: { toString(): string };
  plateNumber: string;
  make: string;
  model: string;
  color: string;
  vehicleType: "car" | "bike" | "suv" | "ev";
}) => ({
  id: vehicle._id.toString(),
  plateNumber: vehicle.plateNumber,
  make: vehicle.make,
  model: vehicle.model,
  color: vehicle.color,
  vehicleType: vehicle.vehicleType,
});

export const createVehicle = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const vehicle = await VehicleModel.create({
    userId: req.user?.id,
    ...req.body,
    plateNumber: req.body.plateNumber.toUpperCase(),
  });

  send(res, 201, "Vehicle created", toVehicleResponse(vehicle));
};

export const listVehicles = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const vehicles = await VehicleModel.find({ userId: req.user?.id })
    .sort({ createdAt: -1 })
    .exec();

  const vehiclesWithStatus = await Promise.all(
    vehicles.map(async (vehicle) => {
      const [hasActiveBooking, hasActiveSubscription] = await Promise.all([
        BookingModel.exists({
          vehicleId: vehicle._id,
          status: { $in: ["reserved", "checked_in"] },
        }),
        SubscriptionModel.exists({
          vehicleId: vehicle._id,
          status: "active",
          endsAt: { $gt: new Date() },
        }),
      ]);

      return {
        ...toVehicleResponse(vehicle),
        hasActiveBooking: !!hasActiveBooking,
        hasActiveSubscription: !!hasActiveSubscription,
      };
    }),
  );

  send(res, 200, "Vehicles", vehiclesWithStatus);
};

export const updateVehicle = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const vehicle = await VehicleModel.findOneAndUpdate(
    { _id: req.params.vehicleId, userId: req.user?.id },
    {
      ...req.body,
      plateNumber: req.body.plateNumber.toUpperCase(),
    },
    { new: true },
  ).exec();

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  send(res, 200, "Vehicle updated", toVehicleResponse(vehicle));
};

export const deleteVehicle = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const vehicle = await VehicleModel.findOne({
    _id: req.params.vehicleId,
    userId: req.user?.id,
  }).exec();
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  const hasActiveBooking = await BookingModel.exists({
    vehicleId: vehicle._id,
    status: { $in: ["reserved", "checked_in"] },
  });

  if (hasActiveBooking) {
    throw new AppError("Cannot delete vehicle with active booking", 409);
  }

  const hasActiveSubscription = await SubscriptionModel.exists({
    vehicleId: vehicle._id,
    status: "active",
    endsAt: { $gt: new Date() },
  });

  if (hasActiveSubscription) {
    throw new AppError("Cannot delete vehicle with active subscription", 409);
  }

  await VehicleModel.deleteOne({ _id: vehicle._id }).exec();
  send(res, 200, "Vehicle deleted", null);
};
