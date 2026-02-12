import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../types/auth.js";
import { AppError } from "./error.middleware.js";

export const requireRolePermissions = (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const role = req.user?.role;
    if (!role) {
      next(new AppError("Unauthorized", 401));
      return;
    }

    if (!roles.includes(role)) {
      next(new AppError("Forbidden", 403));
      return;
    }

    next();
  };
