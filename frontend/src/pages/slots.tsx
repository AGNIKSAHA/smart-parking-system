import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthUser } from "../features/auth/auth.hooks";
import {
  useCreateBooking,
  useConfirmPayment,
} from "../features/bookings/booking.hooks";
import {
  useCreateSlot,
  useDeleteSlot,
  useSlots,
  useUpdateSlot,
} from "../features/slots/slot.hooks";
import { useVehicles } from "../features/vehicles/vehicle.hooks";
import type { Slot } from "../types/domain";
import toast from "react-hot-toast";
import { PaymentModal } from "../features/payments/PaymentModal";
import { ConfirmationModal } from "../components/ConfirmationModal";

interface BookingForm {
  slotId: string;
  vehicleId: string;
  startsAt: string;
  durationMinutes: number;
}

interface CreateSlotForm {
  code: string;
  zone: string;
  level: string;
  lotName: string;
  vehicleType: "car" | "bike" | "suv" | "ev";
  hourlyRate: number;
  overtimeMultiplier: number;
  penaltyPerHour: number;
  vacantSlots: number;
}

interface EditSlotForm {
  code: string;
  zone: string;
  level: string;
  lotName: string;
  vehicleType: "car" | "bike" | "suv" | "ev";
  hourlyRate: number;
  overtimeMultiplier: number;
  penaltyPerHour: number;
  status: Slot["status"];
}

export const SlotsPage = () => {
  const user = useAuthUser();
  const [vehicleType, setVehicleType] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const slots = useSlots(vehicleType, page, 12, searchQuery);
  const vehicles = useVehicles();
  const booking = useCreateBooking();
  const createSlot = useCreateSlot();
  const updateSlot = useUpdateSlot();
  const deleteSlot = useDeleteSlot();
  const confirmPayment = useConfirmPayment();
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentClientSecret, setPaymentClientSecret] = useState<string>("");
  const [pendingBookingAmount, setPendingBookingAmount] = useState<number>(0);
  const [pendingBookingId, setPendingBookingId] = useState<string>(""); // technically used for reference or if we need to confirm manual step
  const [deleteSlotId, setDeleteSlotId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset: resetBookingForm,
  } = useForm<BookingForm>();

  const selectedVehicleId = watch("vehicleId");
  const selectedVehicle = (vehicles.data ?? []).find(
    (v) => v.id === selectedVehicleId,
  );
  const { register: registerSlot, handleSubmit: handleSubmitSlot } =
    useForm<CreateSlotForm>({
      defaultValues: {
        vehicleType: "car",
        overtimeMultiplier: 1.5,
        penaltyPerHour: 25,
        vacantSlots: 1,
      },
    });
  const {
    register: registerEditSlot,
    handleSubmit: handleSubmitEditSlot,
    reset: resetEditSlot,
  } = useForm<EditSlotForm>();

  const getTodayRange = () => {
    const now = new Date();
    const todayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
    );
    const z = (n: number) => (n < 10 ? "0" : "") + n;
    const format = (d: Date) =>
      `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(
        d.getHours(),
      )}:${z(d.getMinutes())}`;

    return { min: format(now), max: format(todayEnd) };
  };

  const { min: minDate, max: maxDate } = getTodayRange();

  useEffect(() => {
    if (!editingSlotId || !slots.data?.data) {
      return;
    }

    const selected = slots.data.data.find((slot) => slot.id === editingSlotId);
    if (!selected) {
      return;
    }

    resetEditSlot({
      code: selected.code,
      zone: selected.zone,
      level: selected.level,
      lotName: selected.lotName,
      vehicleType: selected.vehicleType,
      hourlyRate: selected.hourlyRate,
      overtimeMultiplier: 1.5,
      penaltyPerHour: 25,
      status: selected.status,
    });
  }, [editingSlotId, resetEditSlot, slots.data?.data]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Real-time Slots</h1>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search by lot name..."
            className="rounded-lg border bg-white px-3 py-2 text-sm"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1); // Reset to first page on search
            }}
          />
          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700 sr-only"
              htmlFor="slots-filter-vehicle-type"
            >
              Filter by vehicle type
            </label>
            <select
              id="slots-filter-vehicle-type"
              title="Filter by vehicle type"
              className="rounded-lg border bg-white px-3 py-2"
              onChange={(e) => {
                setVehicleType(e.target.value || undefined);
                setPage(1);
              }}
            >
              <option value="">All Types</option>
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="suv">SUV</option>
              <option value="ev">EV</option>
            </select>
          </div>
        </div>
      </div>

      {user?.role === "user" && (
        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Book slot</h2>
          {(vehicles.data ?? []).length === 0 && (
            <p className="mt-2 text-sm text-rose-600">
              You must add a vehicle first from the Vehicles tab before booking
              a slot.
            </p>
          )}
          {(slots.data?.data ?? []).filter((s) => s.status === "available")
            .length === 0 && (
            <p className="mt-2 text-sm text-rose-600">
              No available slots currently. Please try again later.
            </p>
          )}
          <form
            className="mt-4 grid gap-3 md:grid-cols-2"
            onSubmit={handleSubmit((values) =>
              booking.mutate(values, {
                onSuccess: (data) => {
                  // If clientSecret is present, open payment modal
                  if (data.clientSecret && data.amount) {
                    setPaymentClientSecret(data.clientSecret);
                    setPendingBookingAmount(data.amount);
                    setPendingBookingId(data.id);
                    setIsPaymentModalOpen(true);
                  } else {
                    // If no payment needed (e.g. 0 amount or future payment), just reset
                    resetBookingForm();
                  }
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
              {...register("slotId", { required: false })} // Not required if auto-assign
              defaultValue=""
            >
              <option value="">Auto-assign best slot</option>
              {(slots.data?.data ?? [])
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
              {(vehicles.data ?? []).map((vehicle) => (
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
              disabled={booking.isPending || (vehicles.data ?? []).length === 0}
            >
              {booking.isPending ? "Booking..." : "Reserve"}
            </button>
          </form>
        </section>
      )}

      {user?.role === "admin" && (
        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Create slot (Admin)</h2>
          <form
            className="mt-4 grid gap-3 md:grid-cols-2"
            onSubmit={handleSubmitSlot((values) => createSlot.mutate(values))}
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
                {...registerSlot("code", { required: true })}
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
                {...registerSlot("zone", { required: true })}
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
                {...registerSlot("level", { required: true })}
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
                {...registerSlot("lotName", { required: true })}
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
                {...registerSlot("vehicleType", { required: true })}
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
                {...registerSlot("hourlyRate", {
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
                {...registerSlot("overtimeMultiplier", {
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
                {...registerSlot("penaltyPerHour", {
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
                {...registerSlot("vacantSlots", {
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
      )}

      <PaymentModal
        isOpen={isPaymentModalOpen}
        clientSecret={paymentClientSecret}
        amount={pendingBookingAmount}
        onSuccess={(paymentIntentId) => {
          confirmPayment.mutate(
            { bookingId: pendingBookingId, paymentIntentId },
            {
              onSuccess: () => {
                toast.success("Payment successful! Booking confirmed.");
                setIsPaymentModalOpen(false);
                setPaymentClientSecret("");
                resetBookingForm();
              },
              onError: () => {
                toast.error(
                  "Payment processed but verification failed. Please check your history.",
                );
                setIsPaymentModalOpen(false);
                setPaymentClientSecret("");
                resetBookingForm();
              },
            },
          );
        }}
        onCancel={() => {
          toast("Payment cancelled. Slot reserved but payment pending.");
          setIsPaymentModalOpen(false);
          setPaymentClientSecret("");
          resetBookingForm();
        }}
      />

      {user?.role === "admin" && editingSlotId && (
        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Edit slot</h2>
            <button
              className="rounded-lg border border-slate-300 px-3 py-1 text-sm"
              type="button"
              onClick={() => setEditingSlotId(null)}
            >
              Cancel
            </button>
          </div>

          <form
            className="grid gap-3 md:grid-cols-2"
            onSubmit={handleSubmitEditSlot((values) => {
              if (!editingSlotId) {
                return;
              }

              updateSlot.mutate(
                {
                  slotId: editingSlotId,
                  payload: values,
                },
                {
                  onSuccess: () => setEditingSlotId(null),
                },
              );
            })}
          >
            <input
              title="Slot code"
              className="rounded-lg border px-3 py-2"
              {...registerEditSlot("code", { required: true })}
            />
            <input
              title="Zone"
              className="rounded-lg border px-3 py-2"
              {...registerEditSlot("zone", { required: true })}
            />
            <input
              title="Level"
              className="rounded-lg border px-3 py-2"
              {...registerEditSlot("level", { required: true })}
            />
            <input
              title="Lot name"
              className="rounded-lg border px-3 py-2"
              {...registerEditSlot("lotName", { required: true })}
            />
            <select
              title="Vehicle type"
              className="rounded-lg border px-3 py-2"
              {...registerEditSlot("vehicleType", { required: true })}
            >
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="suv">SUV</option>
              <option value="ev">EV</option>
            </select>
            <select
              title="Status"
              className="rounded-lg border px-3 py-2"
              {...registerEditSlot("status", { required: true })}
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
              {...registerEditSlot("hourlyRate", {
                required: true,
                valueAsNumber: true,
              })}
            />
            <input
              title="Overtime multiplier"
              type="number"
              step="0.1"
              className="rounded-lg border px-3 py-2"
              {...registerEditSlot("overtimeMultiplier", {
                required: true,
                valueAsNumber: true,
              })}
            />
            <input
              title="Penalty per hour"
              type="number"
              className="rounded-lg border px-3 py-2"
              {...registerEditSlot("penaltyPerHour", {
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
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(slots.data?.data ?? []).map((slot) => (
          <article
            key={slot.id}
            className="rounded-xl border bg-white p-4 shadow-sm"
          >
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
            <p className="mt-1 text-sm font-semibold">
              INR {slot.hourlyRate}/hr
            </p>
            {user?.role === "admin" && (
              <div className="mt-3 flex gap-2">
                <button
                  className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                  type="button"
                  onClick={() => setEditingSlotId(slot.id)}
                >
                  Edit
                </button>
                <button
                  className="rounded-lg border border-rose-400 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50 transition-colors"
                  type="button"
                  onClick={() => setDeleteSlotId(slot.id)}
                >
                  Delete
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span className="text-sm font-medium">
          Page {page} of {slots.data?.meta?.totalPages ?? 1}
        </span>
        <button
          className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= (slots.data?.meta?.totalPages ?? 1)}
        >
          Next
        </button>
      </div>

      <ConfirmationModal
        isOpen={!!deleteSlotId}
        title="Delete Slot?"
        message="Are you sure you want to delete this parking slot? This action cannot be undone and will remove the slot from the system."
        confirmLabel="Delete Slot"
        cancelLabel="Cancel"
        variant="danger"
        isProcessing={deleteSlot.isPending}
        onConfirm={() => {
          if (deleteSlotId) {
            deleteSlot.mutate(deleteSlotId, {
              onSuccess: () => setDeleteSlotId(null),
            });
          }
        }}
        onCancel={() => setDeleteSlotId(null)}
      />
    </div>
  );
};
