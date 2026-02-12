import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  public readonly statusCode: number;

  public constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error("DEBUG ERROR:", err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  if (err instanceof ZodError) {
    res
      .status(422)
      .json({
        success: false,
        message: "Validation failed",
        issues: err.issues,
      });
    return;
  }

  const mongoError = err as {
    code?: number;
    keyPattern?: Record<string, unknown>;
  };
  if (mongoError.code === 11000) {
    const duplicateField = mongoError.keyPattern
      ? Object.keys(mongoError.keyPattern)[0]
      : "field";
    res
      .status(409)
      .json({ success: false, message: `Duplicate ${duplicateField}` });
    return;
  }

  res.status(500).json({ success: false, message: "Internal server error" });
};
