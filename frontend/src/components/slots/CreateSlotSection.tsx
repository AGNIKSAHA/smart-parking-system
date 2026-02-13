import React from "react";
import { useForm } from "react-hook-form";

import type { UseMutationResult } from "@tanstack/react-query";
import type { CreateSlotFormValues } from "../../types/form-types";
import type { AxiosError } from "axios";

interface CreateSlotSectionProps {
  createSlot: UseMutationResult<
    void,
    AxiosError<{ message?: string }>,
    CreateSlotFormValues
  >;
}

export const CreateSlotSection: React.FC<CreateSlotSectionProps> = ({
  createSlot,
}) => {
  const { register, handleSubmit, reset } = useForm<CreateSlotFormValues>({
    defaultValues: {
      vehicleType: "car",
      overtimeMultiplier: 1.5,
      penaltyPerHour: 25,
      vacantSlots: 1,
    },
  });

  const onSubmit = (values: CreateSlotFormValues) => {
    createSlot.mutate(values, {
      onSuccess: () => reset(),
    });
  };

  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Create slot (Admin)</h2>
      <form
        className="mt-4 grid gap-3 md:grid-cols-2"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <label
            className="mb-1 block text-sm font-medium text-slate-700"
            htmlFor="admin-slot-code"
          >
            Code
          </label>
          <input
            id="admin-slot-code"
            title="Slot code"
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Code (A-101)"
            {...register("code", { required: true })}
          />
        </div>
        <div>
          <label
            className="mb-1 block text-sm font-medium text-slate-700"
            htmlFor="admin-slot-zone"
          >
            Zone
          </label>
          <input
            id="admin-slot-zone"
            title="Zone"
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Zone"
            {...register("zone", { required: true })}
          />
        </div>
        <div>
          <label
            className="mb-1 block text-sm font-medium text-slate-700"
            htmlFor="admin-slot-level"
          >
            Level
          </label>
          <input
            id="admin-slot-level"
            title="Level"
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Level"
            {...register("level", { required: true })}
          />
        </div>
        <div>
          <label
            className="mb-1 block text-sm font-medium text-slate-700"
            htmlFor="admin-slot-lot-name"
          >
            Lot name
          </label>
          <input
            id="admin-slot-lot-name"
            title="Lot name"
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Lot name"
            {...register("lotName", { required: true })}
          />
        </div>
        <div>
          <label
            className="mb-1 block text-sm font-medium text-slate-700"
            htmlFor="admin-slot-vehicle-type"
          >
            Vehicle type
          </label>
          <select
            id="admin-slot-vehicle-type"
            title="Vehicle type"
            className="w-full rounded-lg border px-3 py-2"
            {...register("vehicleType", { required: true })}
          >
            <option value="car">Car</option>
            <option value="bike">Bike</option>
            <option value="suv">SUV</option>
            <option value="ev">EV</option>
          </select>
        </div>
        <div>
          <label
            className="mb-1 block text-sm font-medium text-slate-700"
            htmlFor="admin-slot-hourly-rate"
          >
            Hourly rate
          </label>
          <input
            id="admin-slot-hourly-rate"
            title="Hourly rate"
            type="number"
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Hourly rate"
            {...register("hourlyRate", {
              required: true,
              valueAsNumber: true,
            })}
          />
        </div>
        <div>
          <label
            className="mb-1 block text-sm font-medium text-slate-700"
            htmlFor="admin-slot-overtime-multiplier"
          >
            Overtime multiplier
          </label>
          <input
            id="admin-slot-overtime-multiplier"
            title="Overtime multiplier"
            type="number"
            step="0.1"
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Overtime multiplier"
            {...register("overtimeMultiplier", {
              required: true,
              valueAsNumber: true,
            })}
          />
        </div>
        <div>
          <label
            className="mb-1 block text-sm font-medium text-slate-700"
            htmlFor="admin-slot-penalty-per-hour"
          >
            Penalty per hour
          </label>
          <input
            id="admin-slot-penalty-per-hour"
            title="Penalty per hour"
            type="number"
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Penalty per hour"
            {...register("penaltyPerHour", {
              required: true,
              valueAsNumber: true,
            })}
          />
        </div>
        <div>
          <label
            className="mb-1 block text-sm font-medium text-slate-700"
            htmlFor="admin-slot-vacant-count"
          >
            No. of vacant slots
          </label>
          <input
            id="admin-slot-vacant-count"
            title="Number of vacant slots"
            type="number"
            min={1}
            className="w-full rounded-lg border px-3 py-2"
            placeholder="1"
            {...register("vacantSlots", {
              required: true,
              valueAsNumber: true,
              min: 1,
            })}
          />
        </div>
        <button
          className="rounded-lg bg-slate-900 px-4 py-2 text-white md:col-span-2"
          type="submit"
          disabled={createSlot.isPending}
        >
          {createSlot.isPending ? "Creating..." : "Create slot"}
        </button>
      </form>
    </section>
  );
};
