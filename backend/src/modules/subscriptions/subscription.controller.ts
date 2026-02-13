import type { Request, Response } from "express";
import { AppError } from "../../common/middlewares/error.middleware.js";
import { send } from "../../common/utils/response.js";
import { SubscriptionModel } from "../../db/models/subscription.model.js";
import { VehicleModel } from "../../db/models/vehicle.model.js";
import { SlotModel } from "../../db/models/slot.model.js";
import { stripe } from "../payments/stripe.js";
import { createQr } from "../bookings/qr.js";

const SUBSCRIPTION_FEE = 3000;

export const createSubscription = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const vehicle = await VehicleModel.findOne({
    _id: req.body.vehicleId,
    userId: req.user?.id,
  }).exec();
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  const existing = await SubscriptionModel.findOne({
    vehicleId: req.body.vehicleId,
    status: "active",
    paymentStatus: "paid",
    endsAt: { $gt: new Date() },
  }).exec();

  if (existing) {
    throw new AppError("This vehicle already has an active subscription", 400);
  }

  if (req.body.slotId) {
    const slot = await SlotModel.findOne({
      _id: req.body.slotId,
      status: "available",
      activeBookingId: null,
    }).exec();

    if (!slot) {
      throw new AppError("Selected slot is not available", 409);
    }
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(SUBSCRIPTION_FEE * 100),
    currency: "inr",
    metadata: {
      userId: req.user?.id ?? "",
      vehicleId: req.body.vehicleId,
      slotId: req.body.slotId ?? "",
      startsAt: req.body.startsAt
        ? new Date(req.body.startsAt).toISOString()
        : new Date().toISOString(),
      type: "subscription",
      fee: SUBSCRIPTION_FEE.toString(),
    },
    automatic_payment_methods: { enabled: true },
  });

  send(res, 201, "Subscription payment initiated", {
    clientSecret: paymentIntent.client_secret,
    amount: SUBSCRIPTION_FEE,
  });
};

export const confirmSubscriptionPayment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { paymentIntentId } = req.body;
  if (!paymentIntentId) {
    throw new AppError("Payment Intent ID is required", 400);
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (paymentIntent.status !== "succeeded") {
    throw new AppError(`Payment status: ${paymentIntent.status}`, 400);
  }

  const {
    vehicleId,
    userId,
    startsAt: startsAtStr,
    slotId,
  } = paymentIntent.metadata;

  const startsAt = startsAtStr ? new Date(startsAtStr) : new Date();
  const endsAt = new Date(startsAt);
  endsAt.setMonth(endsAt.getMonth() + 1);

  if (slotId) {
    await SlotModel.findByIdAndUpdate(slotId, {
      status: "reserved",
    }).exec();
  }

  const subscription = await SubscriptionModel.create({
    userId,
    vehicleId,
    slotId: slotId || undefined,
    planName: "Monthly Premium",
    monthlyAmount: SUBSCRIPTION_FEE,
    startsAt,
    endsAt,
    status: "active",
    paymentStatus: "paid",
    stripePaymentIntentId: paymentIntentId,
  });

  send(res, 200, "Subscription activated", {
    id: subscription._id.toString(),
    planName: subscription.planName,
    endsAt: subscription.endsAt,
  });
};

export const mySubscriptions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const items = await SubscriptionModel.find({ userId: req.user?.id })
    .populate("vehicleId", "plateNumber")
    .populate("slotId", "code")
    .sort({ createdAt: -1 })
    .exec();

  send(
    res,
    200,
    "Subscriptions",
    items.map((item) => {
      const vehicleId = item.vehicleId;
      const vehicleNumber =
        typeof vehicleId === "object" && vehicleId && "plateNumber" in vehicleId
          ? (vehicleId.plateNumber as string)
          : "-";

      const slotId = item.slotId;
      const slotCode =
        typeof slotId === "object" && slotId && "code" in slotId
          ? (slotId.code as string)
          : undefined;

      return {
        id: item._id.toString(),
        vehicleNumber,
        slotCode,
        planName: item.planName,
        monthlyAmount: item.monthlyAmount,
        startsAt: item.startsAt,
        endsAt: item.endsAt,
        status: item.status,
        paymentStatus: item.paymentStatus,
      };
    }),
  );
};

export const cancelSubscription = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const subscriptionId = req.params.subscriptionId;
  const subscription = await SubscriptionModel.findOne({
    _id: subscriptionId,
    userId: req.user?.id,
  }).exec();

  if (!subscription) {
    throw new AppError("Subscription not found", 404);
  }

  if (subscription.status !== "active") {
    throw new AppError("Subscription is not active", 400);
  }

  subscription.status = "cancelled";
  await subscription.save();

  if (subscription.slotId) {
    await SlotModel.findByIdAndUpdate(subscription.slotId, {
      status: "available",
    }).exec();
  }

  send(res, 200, "Subscription cancelled", {
    id: subscription._id.toString(),
    status: subscription.status,
  });
};

export const getSubscriptionQr = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const subscriptionId = req.params.subscriptionId;
  const subscription = await SubscriptionModel.findOne({
    _id: subscriptionId,
    userId: req.user?.id,
  }).exec();

  if (!subscription) {
    throw new AppError("Subscription not found", 404);
  }

  if (subscription.status !== "active") {
    throw new AppError("Subscription is not active", 400);
  }

  const { imageDataUrl } = await createQr({
    userId: req.user?.id ?? "",
    subscriptionId: subscription._id.toString(),
    vehicleId: subscription.vehicleId.toString(),
    issuedAt: Date.now(),
  });

  send(res, 200, "Subscription QR generated", { imageDataUrl });
};
