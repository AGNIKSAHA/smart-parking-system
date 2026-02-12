import { Router } from "express";
import { requireAuth, requireCompletedProfile, requireVerifiedUser } from "../../common/middlewares/auth.middleware.js";
import { catchAsync } from "../../common/middlewares/catch.middleware.js";
import { requireRolePermissions } from "../../common/middlewares/role.middleware.js";
import { validateBody } from "../../common/middlewares/validate.middleware.js";
import { createSlot, deleteSlot, listSlots, updateSlot } from "./slot.controller.js";
import { createSlotSchema, updateSlotSchema } from "./slot.validation.js";

export const slotRouter = Router();
slotRouter.use(requireAuth);
slotRouter.use(requireVerifiedUser);
slotRouter.use(requireCompletedProfile);
slotRouter.get("/", catchAsync(listSlots));
slotRouter.post(
  "/",
  requireRolePermissions("admin"),
  validateBody(createSlotSchema),
  catchAsync(createSlot)
);
slotRouter.patch(
  "/:slotId",
  requireRolePermissions("admin"),
  validateBody(updateSlotSchema),
  catchAsync(updateSlot)
);
slotRouter.delete("/:slotId", requireRolePermissions("admin"), catchAsync(deleteSlot));
