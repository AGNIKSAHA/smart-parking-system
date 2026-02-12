import type { NextFunction, Request, Response } from "express";
import { UserModel } from "../../db/models/user.model.js";
import { RefreshTokenModel } from "../../db/models/refresh-token.model.js";
import { signAccess, verifyAccess, verifyRefresh } from "../utils/jwt.js";
import { env } from "../config/env.js";
import { AppError } from "./error.middleware.js";

export const requireAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const bearer = req.headers.authorization;
  const headerToken = bearer?.startsWith("Bearer ") ? bearer.slice(7) : undefined;
  const token = req.cookies.accessToken ?? headerToken;

  const authorizeByRefreshToken = async (): Promise<boolean> => {
    const refreshToken = req.cookies.refreshToken as string | undefined;
    if (!refreshToken) {
      return false;
    }

    try {
      const refreshPayload = verifyRefresh(refreshToken);
      const refreshRow = await RefreshTokenModel.findOne({
        tokenId: refreshPayload.tokenId,
        revokedAt: { $exists: false },
        expiresAt: { $gt: new Date() }
      }).exec();

      if (!refreshRow) {
        return false;
      }

      const user = await UserModel.findById(refreshPayload.sub).select("isActive email role").exec();
      if (!user || !user.isActive) {
        return false;
      }

      const accessToken = signAccess({
        sub: user._id.toString(),
        email: user.email,
        role: user.role
      });

      _res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60 * 1000
      });

      req.user = {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      };

      return true;
    } catch {
      return false;
    }
  };

  if (!token) {
    const restored = await authorizeByRefreshToken();
    if (restored) {
      next();
      return;
    }
    next(new AppError("Unauthorized", 401));
    return;
  }

  try {
    const payload = verifyAccess(token);
    const user = await UserModel.findById(payload.sub).select("isActive").exec();
    if (!user || !user.isActive) {
      next(new AppError("Unauthorized", 401));
      return;
    }

    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    const restored = await authorizeByRefreshToken();
    if (restored) {
      next();
      return;
    }
    next(new AppError("Invalid access token", 401));
  }
};

export const requireVerifiedUser = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    next(new AppError("Unauthorized", 401));
    return;
  }

  const user = await UserModel.findById(userId).select("isActive isEmailVerified").exec();
  if (!user || !user.isActive) {
    next(new AppError("Unauthorized", 401));
    return;
  }

  if (!user.isEmailVerified) {
    next(new AppError("Email verification required", 403));
    return;
  }

  next();
};

export const requireCompletedProfile = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    next(new AppError("Unauthorized", 401));
    return;
  }

  const user = await UserModel.findById(userId)
    .select("isActive name phoneNumber address governmentIdNumber")
    .exec();

  if (!user || !user.isActive) {
    next(new AppError("Unauthorized", 401));
    return;
  }

  const hasName = typeof user.name === "string" && user.name.trim().length >= 2;
  const hasPhoneNumber = typeof user.phoneNumber === "string" && user.phoneNumber.trim().length >= 7;
  const hasAddress = typeof user.address === "string" && user.address.trim().length >= 5;
  const hasGovernmentId = typeof user.governmentIdNumber === "string" && user.governmentIdNumber.trim().length >= 4;

  if (!hasName || !hasPhoneNumber || !hasAddress || !hasGovernmentId) {
    next(new AppError("Complete profile first from Profile tab", 403));
    return;
  }

  next();
};
