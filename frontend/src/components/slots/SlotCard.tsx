import React from "react";
import type { Slot, SessionUser } from "../../types/domain";

interface SlotCardProps {
  slot: Slot;
  user: SessionUser | null;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const SlotCard: React.FC<SlotCardProps> = ({
  slot,
  user,
  onEdit,
  onDelete,
}) => {
  return (
    <article className="rounded-xl border bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold">{slot.code}</h3>
      <p className="text-sm text-slate-600">
        {slot.lotName} | {slot.level} | {slot.zone}
      </p>
      <div className="flex items-center gap-2">
        <p className="mt-2 text-xs uppercase">{slot.status}</p>
        <span className="mt-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase text-slate-600">
          {slot.vehicleType}
        </span>
      </div>
      <p className="mt-1 text-sm font-semibold">INR {slot.hourlyRate}/hr</p>
      {user?.role === "admin" && (
        <div className="mt-3 flex gap-2">
          <button
            className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
            type="button"
            onClick={() => onEdit(slot.id)}
          >
            Edit
          </button>
          <button
            className="rounded-lg border border-rose-400 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50 transition-colors"
            type="button"
            onClick={() => onDelete(slot.id)}
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
};
