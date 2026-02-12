import { Router } from "express";
import {
  requireAuth,
  requireCompletedProfile,
  requireVerifiedUser,
} from "../../common/middlewares/auth.middleware.js";
import { catchAsync } from "../../common/middlewares/catch.middleware.js";
import {
  listNotifications,
  markRead,
  getUnreadCount,
} from "./notification.controller.js";

export const notificationRouter = Router();
notificationRouter.use(requireAuth);
notificationRouter.use(requireVerifiedUser);
notificationRouter.use(requireCompletedProfile);
notificationRouter.get("/", catchAsync(listNotifications));
notificationRouter.get("/unread-count", catchAsync(getUnreadCount));
notificationRouter.patch("/:notificationId/read", catchAsync(markRead));
