import type { Request, Response } from "express";
import { send } from "../../common/utils/response.js";
import { AppError } from "../../common/middlewares/error.middleware.js";
import { UserModel } from "../../db/models/user.model.js";
import { adminProfileListQuerySchema } from "./profile.validation.js";
import { createQr } from "../bookings/qr.js";

export const getMyProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user?.id;
  const user = await UserModel.findById(userId)
    .select("_id name email role phoneNumber address governmentIdNumber")
    .exec();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.qrImageDataUrl) {
    const { imageDataUrl } = await createQr({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      issuedAt: Date.now(),
    });
    user.qrImageDataUrl = imageDataUrl;
    await UserModel.updateOne(
      { _id: user._id },
      { $set: { qrImageDataUrl: imageDataUrl } },
    );
  }

  send(res, 200, "Profile fetched", {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phoneNumber: user.phoneNumber ?? "",
    address: user.address ?? "",
    governmentIdNumber: user.governmentIdNumber ?? "",
    qrImageDataUrl: user.qrImageDataUrl,
  });
};

export const updateMyProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user?.id;

  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
        governmentIdNumber: req.body.governmentIdNumber,
      },
    },
    { new: true },
  )
    .select("_id name email role phoneNumber address governmentIdNumber")
    .exec();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  send(res, 200, "Profile updated", {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phoneNumber: user.phoneNumber ?? "",
    address: user.address ?? "",
    governmentIdNumber: user.governmentIdNumber ?? "",
    qrImageDataUrl: user.qrImageDataUrl,
  });
};

export const listProfilesForAdmin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const query = adminProfileListQuerySchema.parse(req.query);

  const filter: { role?: "user" | "security" } = {};
  if (query.role) {
    filter.role = query.role;
  }

  const users = await UserModel.find(filter)
    .select(
      "_id name email role phoneNumber address governmentIdNumber isActive createdAt",
    )
    .sort({ createdAt: -1 })
    .exec();

  send(
    res,
    200,
    "Profiles fetched",
    users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber ?? "",
      address: user.address ?? "",
      governmentIdNumber: user.governmentIdNumber ?? "",
      isActive: user.isActive,
    })),
  );
};

export const toggleUserStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.params.userId;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    throw new AppError("isActive must be a boolean", 400);
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: { isActive } },
    { new: true },
  ).exec();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  send(res, 200, `User ${isActive ? "activated" : "suspended"}`, {
    id: user._id.toString(),
    isActive: user.isActive,
  });
};
