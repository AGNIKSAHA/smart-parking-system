import { useEffect, useRef } from "react";
import {
  useMarkRead,
  useNotifications,
} from "../features/notifications/notification.hooks";

export const NotificationsPage = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useNotifications(10);
  const markRead = useMarkRead();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allNotifications = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-20 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Stay updated with your parking alerts
          </p>
        </div>
        {status === "success" && allNotifications.length > 0 && (
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {allNotifications.length} TOTAL
          </div>
        )}
      </div>

      {status === "pending" ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div className="flex animate-pulse items-start gap-4">
                <div className="h-8 w-8 rounded-xl bg-slate-200" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-1/4 rounded-lg bg-slate-200" />
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded-lg bg-slate-200" />
                    <div className="h-3 w-2/3 rounded-lg bg-slate-200" />
                  </div>
                  <div className="h-2 w-20 rounded-lg bg-slate-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : status === "error" ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-bold text-rose-900">
            Oops! Something went wrong
          </h2>
          <p className="mt-1 text-rose-600">
            Failed to load notifications. Please try again.
          </p>
        </div>
      ) : allNotifications.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 italic text-slate-300">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-xl font-bold text-slate-800">
            Clear for now!
          </h2>
          <p className="mt-2 text-slate-500">
            You don't have any notifications yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {allNotifications.map((item) => (
            <article
              key={item.id}
              className={`group relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg ${!item.isRead ? "border-indigo-100 ring-2 ring-indigo-50/50" : "border-slate-100 hover:border-indigo-50"}`}
            >
              {!item.isRead && (
                <div className="absolute left-0 top-0 h-full w-1.5 bg-indigo-600" />
              )}
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold uppercase tracking-wider ${
                        item.category === "booking"
                          ? "bg-emerald-100 text-emerald-700"
                          : item.category === "billing"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      {item.category[0]}
                    </span>
                    <h2
                      className={`text-lg font-bold tracking-tight text-slate-900 ${!item.isRead ? "text-indigo-950" : ""}`}
                    >
                      {item.title}
                    </h2>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {item.message}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      {new Date(item.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                {!item.isRead && (
                  <button
                    onClick={() => markRead.mutate(item.id)}
                    className="shrink-0 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-100 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-indigo-200 active:translate-y-0"
                  >
                    READ
                  </button>
                )}
              </div>
            </article>
          ))}

          <div ref={loadMoreRef} className="flex flex-col gap-4 py-10">
            {isFetchingNextPage ? (
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all">
                <div className="flex animate-pulse items-start gap-4">
                  <div className="h-8 w-8 rounded-xl bg-slate-200" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-1/4 rounded-lg bg-slate-200" />
                    <div className="h-3 w-full rounded-lg bg-slate-200" />
                  </div>
                </div>
              </div>
            ) : hasNextPage ? (
              <div className="flex justify-center">
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300"></div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="h-px w-12 bg-slate-200"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                  END OF UPDATES
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
