import { useState } from "react";
import { useAuthUser } from "../features/auth/auth.hooks";
import {
  useConfirmPayment,
  useCreateBooking,
} from "../features/bookings/booking.hooks";
import {
  useCreateSlot,
  useDeleteSlot,
  useSlots,
  useUpdateSlot,
} from "../features/slots/slot.hooks";
import { useVehicles } from "../features/vehicles/vehicle.hooks";
import toast from "react-hot-toast";
import { PaymentModal } from "../features/payments/PaymentModal";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { SlotFilters } from "../components/slots/SlotFilters";
import { SlotCard } from "../components/slots/SlotCard";
import { BookingSection } from "../components/slots/BookingSection";
import { CreateSlotSection } from "../components/slots/CreateSlotSection";
import { EditSlotSection } from "../components/slots/EditSlotSection";
import type { BookingResult } from "../types/form-types";

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

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentClientSecret, setPaymentClientSecret] = useState<string>("");
  const [pendingBookingAmount, setPendingBookingAmount] = useState<number>(0);
  const [pendingBookingId, setPendingBookingId] = useState<string>("");
  const [deleteSlotId, setDeleteSlotId] = useState<string | null>(null);

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

  const handleBookingSuccess = (data: BookingResult) => {
    if (data.clientSecret && data.amount) {
      setPaymentClientSecret(data.clientSecret);
      setPendingBookingAmount(data.amount);
      setPendingBookingId(data.id);
      setIsPaymentModalOpen(true);
    }
  };

  const selectedEditingSlot = (slots.data?.data ?? []).find(
    (s) => s.id === editingSlotId,
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Real-time Slots</h1>
        <SlotFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setVehicleType={setVehicleType}
          setPage={setPage}
        />
      </div>

      {user?.role === "user" && (
        <BookingSection
          vehicles={vehicles.data ?? []}
          slots={slots.data?.data ?? []}
          createBooking={booking}
          onSuccess={handleBookingSuccess}
          minDate={minDate}
          maxDate={maxDate}
        />
      )}

      {user?.role === "admin" && <CreateSlotSection createSlot={createSlot} />}

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
              },
              onError: () => {
                toast.error(
                  "Payment processed but verification failed. Please check your history.",
                );
                setIsPaymentModalOpen(false);
                setPaymentClientSecret("");
              },
            },
          );
        }}
        onCancel={() => {
          toast("Payment cancelled. Slot reserved but payment pending.");
          setIsPaymentModalOpen(false);
          setPaymentClientSecret("");
        }}
      />

      {user?.role === "admin" && editingSlotId && selectedEditingSlot && (
        <EditSlotSection
          slot={selectedEditingSlot}
          updateSlot={updateSlot}
          onCancel={() => setEditingSlotId(null)}
          onSuccess={() => setEditingSlotId(null)}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {slots.isPending
          ? [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-xl bg-slate-100"
              />
            ))
          : (slots.data?.data ?? []).map((slot) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                user={user}
                onEdit={setEditingSlotId}
                onDelete={setDeleteSlotId}
              />
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
