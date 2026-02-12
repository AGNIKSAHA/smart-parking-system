import type { Request, Response } from "express";
import { NotificationModel } from "../../db/models/notification.model.js";
import { send } from "../../common/utils/response.js";

export const listNotifications = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const items = await NotificationModel.find({ userId: req.user?.id })
    .sort({ createdAt: -1 })
    .limit(100)
    .exec();
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
