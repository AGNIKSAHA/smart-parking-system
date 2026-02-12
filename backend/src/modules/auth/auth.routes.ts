import { Router } from "express";
import { requireAuth } from "../../common/middlewares/auth.middleware.js";
import { catchAsync } from "../../common/middlewares/catch.middleware.js";
import { validateBody } from "../../common/middlewares/validate.middleware.js";
import {
  forgotPassword,
  login,
  logout,
  me,
  refresh,
  register,
  resendVerification,
  resetPassword,
  verifyEmail
} from "./auth.controller.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  resendVerificationSchema,
  verifyEmailSchema
} from "./auth.validation.js";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), catchAsync(register));
authRouter.post("/login", validateBody(loginSchema), catchAsync(login));
authRouter.post("/refresh", catchAsync(refresh));
authRouter.post("/logout", catchAsync(logout));
authRouter.post("/verify-email", validateBody(verifyEmailSchema), catchAsync(verifyEmail));
authRouter.post(
  "/resend-verification",
  validateBody(resendVerificationSchema),
  catchAsync(resendVerification)
);
authRouter.post("/forgot-password", validateBody(forgotPasswordSchema), catchAsync(forgotPassword));
authRouter.post("/reset-password", validateBody(resetPasswordSchema), catchAsync(resetPassword));
authRouter.get("/me", requireAuth, catchAsync(me));
