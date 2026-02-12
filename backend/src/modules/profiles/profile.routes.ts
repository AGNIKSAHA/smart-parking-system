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
  getMyProfile,
  listProfilesForAdmin,
  updateMyProfile,
  toggleUserStatus,
} from "./profile.controller.js";
import { updateMyProfileSchema } from "./profile.validation.js";

export const profileRouter = Router();

profileRouter.use(requireAuth);
profileRouter.use(requireVerifiedUser);

profileRouter.get("/me", catchAsync(getMyProfile));
profileRouter.patch(
  "/me",
  validateBody(updateMyProfileSchema),
  catchAsync(updateMyProfile),
);
profileRouter.get(
  "/admin",
  requireCompletedProfile,
  requireRolePermissions("admin"),
  catchAsync(listProfilesForAdmin),
);

profileRouter.patch(
  "/admin/:userId/status",
  requireCompletedProfile,
  requireRolePermissions("admin"),
  catchAsync(toggleUserStatus),
);
