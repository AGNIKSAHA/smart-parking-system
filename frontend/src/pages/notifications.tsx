import { useMarkRead, useNotifications } from "../features/notifications/notification.hooks";

export const NotificationsPage = () => {
  const notifications = useNotifications();
  const markRead = useMarkRead();

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Notifications</h1>
      {(notifications.data ?? []).map((item) => (
        <article className="rounded-xl border bg-white p-4 shadow-sm" key={item.id}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{item.title}</h2>
            {!item.isRead && <button className="rounded border px-2 py-1 text-xs" onClick={() => markRead.mutate(item.id)} type="button">Mark read</button>}
          </div>
          <p className="mt-1 text-sm text-slate-700">{item.message}</p>
        </article>
      ))}
    </div>
  );
};
