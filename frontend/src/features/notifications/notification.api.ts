import { http } from "../../api/http";
import type { ApiResponse, NotificationItem } from "../../types/domain";

export const notificationApi = {
  async list(): Promise<NotificationItem[]> {
    const res =
      await http.get<ApiResponse<NotificationItem[]>>("/notifications");
    return res.data.data;
  },
  async markRead(notificationId: string): Promise<void> {
    await http.patch(`/notifications/${notificationId}/read`);
  },
  async unreadCount(): Promise<number> {
    const res = await http.get<ApiResponse<{ count: number }>>(
      "/notifications/unread-count",
    );
    return res.data.data.count;
  },
};
