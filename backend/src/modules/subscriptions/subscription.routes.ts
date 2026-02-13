import { Router } from "express";
import {
  requireAuth,
  requireCompletedProfile,
  requireVerifiedUser,
} from "../../common/middlewares/auth.middleware.js";
import { catchAsync } from "../../common/middlewares/catch.middleware.js";
import { requireRolePermissions } from "../../common/middlewares/role.middleware.js";
import { validateBody } from "../../common/middlewares/validate.middleware.js";
import {
  confirmSubscriptionPayment,
  createSubscription,
  mySubscriptions,
  cancelSubscription,
  getSubscriptionQr,
} from "./subscription.controller.js";
import { createSubscriptionSchema } from "./subscription.validation.js";

export const subscriptionRouter = Router();
subscriptionRouter.use(requireAuth);
subscriptionRouter.use(requireVerifiedUser);
subscriptionRouter.use(requireCompletedProfile);

subscriptionRouter.post(
  "/",
  requireRolePermissions("user", "admin"),
  validateBody(createSubscriptionSchema),
  catchAsync(createSubscription),
);

subscriptionRouter.post(
  "/confirm",
  requireRolePermissions("user", "admin"),
  catchAsync(confirmSubscriptionPayment),
);

subscriptionRouter.get(
  "/me",
  requireRolePermissions("user", "admin"),
  catchAsync(mySubscriptions),
);

subscriptionRouter.get(
  "/:subscriptionId/qr",
  requireRolePermissions("user", "admin"),
  catchAsync(getSubscriptionQr),
);

subscriptionRouter.post(
  "/:subscriptionId/cancel",
  requireRolePermissions("user", "admin"),
  catchAsync(cancelSubscription),
);
