import { Router } from "express";
import { requireAuth, requireCompletedProfile, requireVerifiedUser } from "../../common/middlewares/auth.middleware.js";
import { catchAsync } from "../../common/middlewares/catch.middleware.js";
import { requireRolePermissions } from "../../common/middlewares/role.middleware.js";
import { adminAnalytics } from "./analytics.controller.js";

export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);
analyticsRouter.use(requireVerifiedUser);
analyticsRouter.use(requireCompletedProfile);
analyticsRouter.get("/admin", requireRolePermissions("admin"), catchAsync(adminAnalytics));
