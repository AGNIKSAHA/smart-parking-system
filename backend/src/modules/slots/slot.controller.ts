import type { Request, Response } from "express";
import { AppError } from "../../common/middlewares/error.middleware.js";
import { SlotModel } from "../../db/models/slot.model.js";
import { send } from "../../common/utils/response.js";

export const createSlot = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    code,
    zone,
    level,
    lotName,
    vehicleType,
    hourlyRate,
    overtimeMultiplier,
    penaltyPerHour,
    vacantSlots,
  } = req.body as {
    code: string;
    zone: string;
    level: string;
    lotName: string;
    vehicleType: "car" | "bike" | "suv" | "ev";
    hourlyRate: number;
    overtimeMultiplier: number;
    penaltyPerHour: number;
    vacantSlots: number;
  };

  const payload = Array.from({ length: vacantSlots }, (_value, index) => ({
    code: vacantSlots === 1 ? code : `${code}-${index + 1}`,
    zone,
    level,
    lotName,
    vehicleType,
    hourlyRate,
    overtimeMultiplier,
    penaltyPerHour,
    status: "available" as const,
  }));

  const createdSlots = await SlotModel.insertMany(payload, { ordered: true });
  send(res, 201, "Slots created", {
    count: createdSlots.length,
    ids: createdSlots.map((slot) => slot._id.toString()),
    codes: createdSlots.map((slot) => slot.code),
  });
};

export const listSlots = async (req: Request, res: Response): Promise<void> => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const status =
    typeof req.query.status === "string" ? req.query.status : undefined;
  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;
  const vehicleType =
    typeof req.query.vehicleType === "string"
      ? req.query.vehicleType
      : undefined;

  const query: Record<string, unknown> = {};

  if (status) {
    query.status = status;
  }
  if (vehicleType) {
    query.vehicleType = vehicleType;
  }
  if (search) {
    query.$or = [
      { lotName: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    SlotModel.find(query).sort({ code: 1 }).skip(skip).limit(limit).exec(),
    SlotModel.countDocuments(query).exec(),
  ]);

  send(
    res,
    200,
    "Slots",
    items.map((slot) => ({
      id: slot._id.toString(),
      code: slot.code,
      zone: slot.zone,
      level: slot.level,
      lotName: slot.lotName,
      vehicleType: slot.vehicleType,
      status: slot.status,
      hourlyRate: slot.hourlyRate,
    })),
    { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  );
};

export const updateSlot = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const slotId = req.params.slotId;

  const slot = await SlotModel.findByIdAndUpdate(
    slotId,
    { $set: req.body },
    { new: true },
  ).exec();
  if (!slot) {
    throw new AppError("Slot not found", 404);
  }

  send(res, 200, "Slot updated", {
    id: slot._id.toString(),
    code: slot.code,
    zone: slot.zone,
    level: slot.level,
    lotName: slot.lotName,
    vehicleType: slot.vehicleType,
    status: slot.status,
    hourlyRate: slot.hourlyRate,
  });
};

export const deleteSlot = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const slotId = req.params.slotId;
  const slot = await SlotModel.findById(slotId).exec();
  if (!slot) {
    throw new AppError("Slot not found", 404);
  }

  if (
    slot.activeBookingId ||
    slot.status === "reserved" ||
    slot.status === "occupied"
  ) {
    throw new AppError("Cannot delete active slot", 409);
  }

  await SlotModel.deleteOne({ _id: slotId }).exec();
  send(res, 200, "Slot deleted", { id: slotId });
};
