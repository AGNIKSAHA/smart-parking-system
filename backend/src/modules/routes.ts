import { Router } from "express";
import { analyticsRouter } from "./analytics/analytics.routes.js";
import { authRouter } from "./auth/auth.routes.js";
import { bookingRouter } from "./bookings/booking.routes.js";
import { notificationRouter } from "./notifications/notification.routes.js";
import { profileRouter } from "./profiles/profile.routes.js";
import { slotRouter } from "./slots/slot.routes.js";
import { subscriptionRouter } from "./subscriptions/subscription.routes.js";
import { vehicleRouter } from "./vehicles/vehicle.routes.js";

export const apiRouter = Router();
apiRouter.use("/auth", authRouter);
apiRouter.use("/vehicles", vehicleRouter);
apiRouter.use("/slots", slotRouter);
apiRouter.use("/bookings", bookingRouter);
apiRouter.use("/profiles", profileRouter);
apiRouter.use("/subscriptions", subscriptionRouter);
apiRouter.use("/notifications", notificationRouter);
apiRouter.use("/analytics", analyticsRouter);
