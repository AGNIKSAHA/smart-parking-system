import React from "react";
import { useForm } from "react-hook-form";
import type { Slot, Vehicle } from "../../types/domain";
import type { UseMutationResult } from "@tanstack/react-query";
import type { BookingFormValues, BookingResult } from "../../types/form-types";
import type { AxiosError } from "axios";

interface BookingSectionProps {
  vehicles: Vehicle[];
  slots: Slot[];
  createBooking: UseMutationResult<
    BookingResult,
    AxiosError<{ message?: string }>,
    BookingFormValues
  >;
  onSuccess: (data: BookingResult) => void;
  minDate: string;
  maxDate: string;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  vehicles,
  slots,
  createBooking,
  onSuccess,
  minDate,
  maxDate,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    reset: resetBookingForm,
  } = useForm<BookingFormValues>();

  const selectedVehicleId = watch("vehicleId");
  const selectedVehicle = (vehicles ?? []).find(
    (v) => v.id === selectedVehicleId,
  );

  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Book slot</h2>
      {(vehicles ?? []).length === 0 && (
        <p className="mt-2 text-sm text-rose-600">
          You must add a vehicle first from the Vehicles tab before booking a
          slot.
        </p>
      )}
      {(slots ?? []).filter((s) => s.status === "available").length === 0 && (
        <p className="mt-2 text-sm text-rose-600">
          No available slots currently. Please try again later.
        </p>
      )}
      <form
        className="mt-4 grid gap-3 md:grid-cols-2"
        onSubmit={handleSubmit((values) =>
          createBooking.mutate(values, {
            onSuccess: (data: BookingResult) => {
              onSuccess(data);
              resetBookingForm();
            },
          }),
        )}
      >
        <label
          className="block text-sm font-medium text-slate-700"
          htmlFor="booking-slot"
        >
          Slot
        </label>
        <select
          id="booking-slot"
          title="Slot"
          className="rounded-lg border px-3 py-2"
          {...register("slotId", { required: false })}
          defaultValue=""
        >
          <option value="">Auto-assign best slot</option>
          {(slots ?? [])
            .filter((s) => s.status === "available")
            .filter(
              (s) =>
                !selectedVehicle ||
                s.vehicleType === selectedVehicle.vehicleType,
            )
            .map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.code} ({slot.vehicleType.toUpperCase()})
              </option>
            ))}
        </select>
        <label
          className="block text-sm font-medium text-slate-700"
          htmlFor="booking-vehicle"
        >
          Vehicle
        </label>
        <select
          id="booking-vehicle"
          title="Vehicle"
          className="rounded-lg border px-3 py-2"
          {...register("vehicleId", { required: true })}
        >
          <option value="">Select vehicle</option>
          {(vehicles ?? [])
            .filter((v) => !v.hasActiveSubscription)
            .map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.plateNumber}
              </option>
            ))}
        </select>
        <label
          className="block text-sm font-medium text-slate-700"
          htmlFor="booking-start-at"
        >
          Start date & time
        </label>
        <input
          id="booking-start-at"
          title="Start date and time"
          type="datetime-local"
          className="rounded-lg border px-3 py-2"
          min={minDate}
          max={maxDate}
          {...register("startsAt", { required: true })}
        />
        <label
          className="block text-sm font-medium text-slate-700"
          htmlFor="booking-duration"
        >
          Duration (minutes)
        </label>
        <input
          id="booking-duration"
          title="Duration in minutes"
          type="number"
          className="rounded-lg border px-3 py-2"
          {...register("durationMinutes", {
            required: true,
            valueAsNumber: true,
          })}
        />
        <button
          className="rounded-lg bg-emerald-600 px-4 py-2 text-white md:col-span-2"
          type="submit"
          disabled={createBooking.isPending || (vehicles ?? []).length === 0}
        >
          {createBooking.isPending ? "Booking..." : "Reserve"}
        </button>
      </form>
    </section>
  );
};
