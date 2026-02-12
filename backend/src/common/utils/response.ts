import type { Response } from "express";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const send = <T>(res: Response, status: number, message: string, data: T, meta?: PaginationMeta): void => {
  res.status(status).json({ success: true, message, data, ...(meta ? { meta } : {}) });
};
