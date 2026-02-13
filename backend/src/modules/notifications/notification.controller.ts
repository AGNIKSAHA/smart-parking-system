import type { Request, Response } from "express";
import { NotificationModel } from "../../db/models/notification.model.js";
import { send } from "../../common/utils/response.js";

export const listNotifications = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    NotificationModel.find({ userId: req.user?.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    NotificationModel.countDocuments({ userId: req.user?.id }).exec(),
  ]);

  send(
    res,
    200,
    "Notifications",
    items.map((item) => ({
      id: item._id.toString(),
      title: item.title,
      message: item.message,
      category: item.category,
      isRead: item.isRead,
      createdAt: item.createdAt,
    })),
    {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  );
};

export const markRead = async (req: Request, res: Response): Promise<void> => {
  await NotificationModel.updateOne(
    { _id: req.params.notificationId, userId: req.user?.id },
    { $set: { isRead: true } },
  ).exec();
  send(res, 200, "Notification updated", { ok: true });
};

export const getUnreadCount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const count = await NotificationModel.countDocuments({
    userId: req.user?.id,
    isRead: false,
  }).exec();
  send(res, 200, "Unread count", { count });
};
