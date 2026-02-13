import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Slot } from "../../types/domain";
import type { UseMutationResult } from "@tanstack/react-query";
import type {
  CreateSlotFormValues,
  EditSlotFormValues,
} from "../../types/form-types";
import type { AxiosError } from "axios";

interface EditSlotSectionProps {
  slot: Slot;
  updateSlot: UseMutationResult<
    void,
    AxiosError<{ message?: string }>,
    {
      slotId: string;
      payload: Partial<CreateSlotFormValues> & { status?: Slot["status"] };
    }
  >;
  onCancel: () => void;
  onSuccess: () => void;
}

export const EditSlotSection: React.FC<EditSlotSectionProps> = ({
  slot,
  updateSlot,
  onCancel,
  onSuccess,
}) => {
  const { register, handleSubmit, reset } = useForm<EditSlotFormValues>({
    defaultValues: {
      code: slot.code,
      zone: slot.zone,
      level: slot.level,
      lotName: slot.lotName,
      vehicleType: slot.vehicleType,
      hourlyRate: slot.hourlyRate,
      overtimeMultiplier: 1.5,
      penaltyPerHour: 25,
      status: slot.status,
    },
  });

  useEffect(() => {
    reset({
      code: slot.code,
      zone: slot.zone,
      level: slot.level,
      lotName: slot.lotName,
      vehicleType: slot.vehicleType,
      hourlyRate: slot.hourlyRate,
      overtimeMultiplier: 1.5,
      penaltyPerHour: 25,
      status: slot.status,
    });
  }, [slot, reset]);

  const onSubmit = (values: EditSlotFormValues) => {
    updateSlot.mutate(
      {
        slotId: slot.id,
        payload: values,
      },
      {
        onSuccess: () => {
          onSuccess();
        },
      },
    );
  };

  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Edit slot</h2>
        <button
          className="rounded-lg border border-slate-300 px-3 py-1 text-sm"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>

      <form
        className="grid gap-3 md:grid-cols-2"
        onSubmit={handleSubmit(onSubmit)}
      >
        <input
          title="Slot code"
          className="rounded-lg border px-3 py-2"
          {...register("code", { required: true })}
        />
        <input
          title="Zone"
          className="rounded-lg border px-3 py-2"
          {...register("zone", { required: true })}
        />
        <input
          title="Level"
          className="rounded-lg border px-3 py-2"
          {...register("level", { required: true })}
        />
        <input
          title="Lot name"
          className="rounded-lg border px-3 py-2"
          {...register("lotName", { required: true })}
        />
        <select
          title="Vehicle type"
          className="rounded-lg border px-3 py-2"
          {...register("vehicleType", { required: true })}
        >
          <option value="car">Car</option>
          <option value="bike">Bike</option>
          <option value="suv">SUV</option>
          <option value="ev">EV</option>
        </select>
        <select
          title="Status"
          className="rounded-lg border px-3 py-2"
          {...register("status", { required: true })}
        >
          <option value="available">Available</option>
          <option value="maintenance">Maintenance</option>
          <option value="reserved">Reserved</option>
          <option value="occupied">Occupied</option>
        </select>
        <input
          title="Hourly rate"
          type="number"
          className="rounded-lg border px-3 py-2"
          {...register("hourlyRate", {
            required: true,
            valueAsNumber: true,
          })}
        />
        <input
          title="Overtime multiplier"
          type="number"
          step="0.1"
          className="rounded-lg border px-3 py-2"
          {...register("overtimeMultiplier", {
            required: true,
            valueAsNumber: true,
          })}
        />
        <input
          title="Penalty per hour"
          type="number"
          className="rounded-lg border px-3 py-2"
          {...register("penaltyPerHour", {
            required: true,
            valueAsNumber: true,
          })}
        />
        <button
          className="rounded-lg bg-slate-900 px-4 py-2 text-white md:col-span-2"
          type="submit"
          disabled={updateSlot.isPending}
        >
          {updateSlot.isPending ? "Saving..." : "Save changes"}
        </button>
      </form>
    </section>
  );
};
