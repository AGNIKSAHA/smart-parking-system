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
  cancelMyBooking,
  createBooking,
  myHistory,
  scanBooking,
  securityScanHistory,
  confirmPayment,
} from "./booking.controller.js";
import { createBookingSchema, scanSchema } from "./booking.validation.js";

export const bookingRouter = Router();
bookingRouter.use(requireAuth);
bookingRouter.use(requireVerifiedUser);
bookingRouter.use(requireCompletedProfile);
bookingRouter.post(
  "/",
  requireRolePermissions("user", "admin"),
  validateBody(createBookingSchema),
  catchAsync(createBooking),
);
bookingRouter.post(
  "/scan",
  requireRolePermissions("security", "admin"),
  validateBody(scanSchema),
  catchAsync(scanBooking),
);
bookingRouter.get(
  "/me",
  requireRolePermissions("user", "admin", "security"),
  catchAsync(myHistory),
);
bookingRouter.patch(
  "/:bookingId/cancel",
  requireRolePermissions("user", "admin"),
  catchAsync(cancelMyBooking),
);
bookingRouter.post(
  "/:bookingId/payment",
  requireRolePermissions("user", "admin"),
  catchAsync(confirmPayment),
);
bookingRouter.get(
  "/scans",
  requireRolePermissions("security", "admin"),
  catchAsync(securityScanHistory),
);
