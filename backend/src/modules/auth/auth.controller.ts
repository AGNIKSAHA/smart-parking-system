import type { Request, Response } from "express";
import { send } from "../../common/utils/response.js";
import { authService } from "./auth.service.js";

const cookieBase = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/"
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const user = await authService.register(req.body);
  send(res, 201, "Registered. Please verify your email before login.", user);
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const data = await authService.login(req.body);

  res.cookie("accessToken", data.accessToken, { ...cookieBase, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", data.refreshToken, { ...cookieBase, maxAge: 7 * 24 * 60 * 60 * 1000 });

  send(res, 200, "Logged in", { user: data.user });
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies.refreshToken as string | undefined;
  if (!token) {
    res.status(401).json({ success: false, message: "Missing refresh token" });
    return;
  }

  const data = await authService.refresh(token);
  res.cookie("accessToken", data.accessToken, { ...cookieBase, maxAge: 15 * 60 * 1000 });
  send(res, 200, "Token refreshed", { user: data.user });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies.refreshToken as string | undefined;
  await authService.logout(refreshToken);
  res.clearCookie("accessToken", cookieBase);
  res.clearCookie("refreshToken", cookieBase);
  send(res, 200, "Logged out", { ok: true });
};

export const me = async (req: Request, res: Response): Promise<void> => {
  send(res, 200, "Session", { user: req.user });
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  await authService.verifyEmail(req.body.token);
  send(res, 200, "Email verified successfully", { verified: true });
};

export const resendVerification = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.resendVerification(req.body.email);
  send(res, 200, "If this email exists and is unverified, a verification link has been sent.", result);
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.forgotPassword(req.body.email);
  send(res, 200, "If this email exists, a password reset link has been sent.", result);
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  await authService.resetPassword(req.body);
  send(res, 200, "Password reset successful. Please login with your new password.", { ok: true });
};
