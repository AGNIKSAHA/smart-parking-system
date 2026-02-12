import { Router } from "express";
import { requireAuth, requireCompletedProfile, requireVerifiedUser } from "../../common/middlewares/auth.middleware.js";
import { catchAsync } from "../../common/middlewares/catch.middleware.js";
import { validateBody, validateParams } from "../../common/middlewares/validate.middleware.js";
import { createVehicle, deleteVehicle, listVehicles, updateVehicle } from "./vehicle.controller.js";
import { createVehicleSchema, updateVehicleSchema, vehicleIdParamSchema } from "./vehicle.validation.js";

export const vehicleRouter = Router();
vehicleRouter.use(requireAuth);
vehicleRouter.use(requireVerifiedUser);
vehicleRouter.use(requireCompletedProfile);
vehicleRouter.get("/", catchAsync(listVehicles));
vehicleRouter.post("/", validateBody(createVehicleSchema), catchAsync(createVehicle));
vehicleRouter.patch("/:vehicleId", validateParams(vehicleIdParamSchema), validateBody(updateVehicleSchema), catchAsync(updateVehicle));
vehicleRouter.delete("/:vehicleId", validateParams(vehicleIdParamSchema), catchAsync(deleteVehicle));
