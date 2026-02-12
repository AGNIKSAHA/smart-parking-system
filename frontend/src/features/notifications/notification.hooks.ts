import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../../app/query-client";
import { notificationApi } from "./notification.api";

// Main query for the notifications list - only fetched when user is on the notifications page
export const useNotifications = () =>
  useQuery({
    queryKey: ["notifications", "list"],
    queryFn: notificationApi.list,
    refetchOnMount: true, // Ensure it fetches when the page is visited
  });

// Optimized query for the unread count - used in the Layout
export const useUnreadCountQuery = () =>
  useQuery({
    queryKey: ["notifications", "count"],
    queryFn: notificationApi.unreadCount,
    staleTime: 60000, // 1 minute stale time by default
  });

export const useUnreadCount = (): number => {
  const query = useUnreadCountQuery();
  return query.data ?? 0;
};

export const useMarkRead = () =>
  useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: async () => {
      // Invalidate both count and list when someone marks a notification as read
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
