import { http } from "../../api/http";
import type { ApiResponse, NotificationItem } from "../../types/domain";

export const notificationApi = {
  async list(
    page = 1,
    limit = 20,
  ): Promise<{
    data: NotificationItem[];
    meta: ApiResponse<NotificationItem[]>["meta"];
  }> {
    const res = await http.get<ApiResponse<NotificationItem[]>>(
      "/notifications",
      {
        params: { page, limit },
      },
    );
    return { data: res.data.data, meta: res.data.meta };
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
