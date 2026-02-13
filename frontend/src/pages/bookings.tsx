import { useAuthUser } from "../features/auth/auth.hooks";
import {
  useBookings,
  useCancelBooking,
  useSecurityScanEvents,
} from "../features/bookings/booking.hooks";
import { useState } from "react";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { ScanEventCard } from "../components/bookings/ScanEventCard";
import { BookingCard } from "../components/bookings/BookingCard";
import { BookingsHeader } from "../components/bookings/BookingsHeader";

export const BookingsPage = () => {
  const user = useAuthUser();
  const isSecurity = user?.role === "security";
  const isAdmin = user?.role === "admin";
  const [page, setPage] = useState(1);
  const bookings = useBookings(page);
  const securityScans = useSecurityScanEvents(isSecurity);
  const cancelBooking = useCancelBooking();
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredScans = (securityScans.data ?? []).filter((event) => {
    const query = searchQuery.toLowerCase();
    return (
      event.vehicleNumber.toLowerCase().includes(query) ||
      event.userName.toLowerCase().includes(query)
    );
  });

  const filteredBookings = (bookings.data?.data ?? []).filter((booking) => {
    const query = searchQuery.toLowerCase();
    const vehicleMatch =
      booking.vehicleNumber?.toLowerCase().includes(query) ?? false;
    const nameMatch = booking.userName?.toLowerCase().includes(query) ?? false;
    const idMatch = booking.id.toLowerCase().includes(query);
    return vehicleMatch || nameMatch || idMatch;
  });

  const downloadLedger = () => {
    import("jspdf").then((jsPDF) => {
      import("jspdf-autotable").then((autoTable) => {
        const doc = new jsPDF.default();
        doc.text("Parking Ledger", 14, 15);

        const listToExport = filteredBookings;

        const tableData = listToExport.map((booking) => [
          booking.id,
          booking.userName ?? "-",
          booking.vehicleNumber ?? "-",
          booking.phoneNumber ?? "-",
          booking.status,
          `INR ${booking.amount.toFixed(2)}`,
          new Date(booking.startsAt).toLocaleString(),
          new Date(booking.endsAt).toLocaleString(),
          booking.overtimeMinutes > 0 ? `${booking.overtimeMinutes} min` : "-",
        ]);

        autoTable.default(doc, {
          head: [
            [
              "ID",
              "Name",
              "Vehicle No",
              "Phone",
              "Status",
              "Amount",
              "Start Time",
              "End Time",
              "Overtime",
            ],
          ],
          body: tableData,
          startY: 20,
        });

        doc.save(`parking-ledger${searchQuery ? "-filtered" : ""}.pdf`);
      });
    });
  };

  if (isSecurity) {
    return (
      <div className="space-y-6">
        <BookingsHeader
          title="Scan Activity"
          subtitle="Real-time entry & exit logs"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Filter by name or plate number..."
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 11h20" />
              <path d="m9 15 3-3 3 3" />
              <path d="m9 9 3 3 3-3" />
            </svg>
          }
        />

        <div className="grid gap-3">
          {securityScans.isPending ? (
            [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl bg-slate-100"
              />
            ))
          ) : filteredScans.length > 0 ? (
            filteredScans.map((event, index) => (
              <ScanEventCard
                key={`${event.bookingId}-${event.action}-${event.timestamp}-${index}`}
                event={event}
              />
            ))
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="text-slate-500">
                No scan events found matching your search.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BookingsHeader
        title="Parking Ledger"
        subtitle="Transaction & booking archives"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onDownloadPdf={downloadLedger}
        placeholder="Search by name, plate number, or ID..."
      />

      <div className="grid gap-3">
        {bookings.isPending ? (
          [...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-slate-100"
            />
          ))
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              isAdmin={isAdmin}
              onCancel={setCancelBookingId}
              isCancelling={cancelBooking.isPending}
            />
          ))
        ) : (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <p className="text-slate-500 font-medium">
              No results matched your search query.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-2 text-indigo-600 text-sm font-bold hover:underline"
            >
              Clear filter
            </button>
          </div>
        )}
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
          Page {page} of {bookings.data?.meta?.totalPages ?? 1}
        </span>
        <button
          className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= (bookings.data?.meta?.totalPages ?? 1)}
        >
          Next
        </button>
      </div>

      <ConfirmationModal
        isOpen={!!cancelBookingId}
        title="Cancel Booking?"
        message="Are you sure you want to cancel this booking? Only 50% of your payment will be refunded as per our cancellation policy."
        confirmLabel="Confirm Cancellation"
        cancelLabel="Keep Booking"
        variant="danger"
        isProcessing={cancelBooking.isPending}
        onConfirm={() => {
          if (cancelBookingId) {
            cancelBooking.mutate(cancelBookingId, {
              onSuccess: () => setCancelBookingId(null),
            });
          }
        }}
        onCancel={() => setCancelBookingId(null)}
      />
    </div>
  );
};
