import React from "react";
import type { Booking } from "../../types/domain";

interface BookingCardProps {
  booking: Booking;
  isAdmin: boolean;
  onCancel: (id: string) => void;
  isCancelling: boolean;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  isAdmin,
  onCancel,
  isCancelling,
}) => {
  return (
    <article className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-slate-900">
              Booking #{booking.id.slice(-6)}
            </p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                booking.status === "checked_out"
                  ? "bg-emerald-100 text-emerald-700"
                  : booking.status === "cancelled"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-indigo-100 text-indigo-700"
              }`}
            >
              {booking.status}
            </span>
          </div>

          {isAdmin && (
            <div className="mt-2 grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-3 lg:grid-cols-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  User
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {booking.userName || "---"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Vehicle
                </p>
                <p className="text-sm font-bold text-emerald-700">
                  {booking.vehicleNumber || "---"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Phone
                </p>
                <p className="text-sm font-medium text-slate-600">
                  {booking.phoneNumber || "---"}
                </p>
              </div>
            </div>
          )}

          <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-slate-400">Amount</p>
              <p className="font-bold text-slate-900">
                INR {booking.amount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Overtime</p>
              <p
                className={`font-bold ${booking.overtimeMinutes > 0 ? "text-rose-600" : "text-slate-900"}`}
              >
                {booking.overtimeMinutes} min
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-slate-400">Duration</p>
              <p className="text-xs text-slate-600">
                {new Date(booking.startsAt).toLocaleString()} -{" "}
                {new Date(booking.endsAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {!isAdmin &&
          booking.qrImageDataUrl &&
          (booking.status === "reserved" ||
            booking.status === "checked_in") && (
            <div className="flex flex-col items-center gap-1 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
              <img
                src={booking.qrImageDataUrl}
                alt="Booking QR Code"
                className="h-64 w-64 object-contain mix-blend-multiply"
              />
              <span className="text-[10px] font-bold uppercase text-indigo-400">
                Digital Pass
              </span>
            </div>
          )}
      </div>

      {!isAdmin && booking.status === "reserved" && (
        <button
          className="mt-4 w-full rounded-lg border border-rose-200 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
          type="button"
          onClick={() => onCancel(booking.id)}
          disabled={isCancelling}
        >
          Cancel booking
        </button>
      )}
    </article>
  );
};
