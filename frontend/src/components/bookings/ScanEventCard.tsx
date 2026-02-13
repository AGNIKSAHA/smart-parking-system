import React from "react";
import type { SecurityScanEvent } from "../../types/domain";

interface ScanEventCardProps {
  event: SecurityScanEvent;
}

export const ScanEventCard: React.FC<ScanEventCardProps> = ({ event }) => {
  return (
    <article className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="font-bold uppercase text-indigo-600">{event.action}</p>
        <p className="text-xs text-slate-400">
          {new Date(event.timestamp).toLocaleString()}
        </p>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            User Name
          </p>
          <p className="text-sm font-semibold text-slate-900">
            {event.userName}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Vehicle No
          </p>
          <p className="text-sm font-semibold text-slate-900">
            {event.vehicleNumber}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Phone
          </p>
          <p className="text-sm text-slate-600">{event.phoneNumber}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Booking ID
          </p>
          <p className="text-[10px] font-mono text-slate-500">
            {event.bookingId}
          </p>
        </div>
      </div>
    </article>
  );
};
