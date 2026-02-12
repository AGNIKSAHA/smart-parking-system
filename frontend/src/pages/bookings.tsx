import { useAuthUser } from "../features/auth/auth.hooks";
import {
  useBookings,
  useCancelBooking,
  useSecurityScanEvents,
} from "../features/bookings/booking.hooks";
import { useState } from "react";
import { ConfirmationModal } from "../components/ConfirmationModal";

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

  if (isSecurity) {
    return (
      <div className="space-y-6">
        <header className="sticky top-0 z-10 -mx-4 mb-6 bg-slate-50/80 px-4 pb-4 pt-1 backdrop-blur-md">
          <div className="rounded-2xl border border-slate-200 bg-white/50 p-4 shadow-sm ring-1 ring-slate-900/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
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
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">
                      Scan Activity
                    </h1>
                    <p className="text-xs font-medium text-slate-500">
                      Real-time entry & exit logs
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Filter by name or plate number..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 pl-11 py-3 text-sm shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="grid gap-3">
          {filteredScans.length > 0 ? (
            filteredScans.map((event, index) => (
              <article
                key={`${event.bookingId}-${event.action}-${event.timestamp}-${index}`}
                className="rounded-xl border bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold uppercase text-indigo-600">
                    {event.action}
                  </p>
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
                    <p className="text-sm text-slate-600">
                      {event.phoneNumber}
                    </p>
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

  const downloadLedger = () => {
    import("jspdf").then((jsPDF) => {
      import("jspdf-autotable").then((autoTable) => {
        const doc = new jsPDF.default();
        doc.text("Parking Ledger", 14, 15);

        // Download filtered list if searching, otherwise all
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

  return (
    <div className="space-y-6">
      <header className="sticky top-0 z-10 -mx-4 mb-6 bg-slate-50/80 px-4 pb-4 pt-1 backdrop-blur-md">
        <div className="rounded-2xl border border-slate-200 bg-white/50 p-4 shadow-sm ring-1 ring-slate-900/5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200">
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
                  <path d="M12 2v20" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  Parking Ledger
                </h1>
                <p className="text-xs font-medium text-slate-500">
                  Transaction & booking archives
                </p>
              </div>
            </div>
            <button
              onClick={downloadLedger}
              className="group flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-200 transition-all hover:bg-slate-800 hover:shadow-xl active:scale-95"
            >
              <svg
                className="transition-transform group-hover:-translate-y-0.5"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download PDF
            </button>
          </div>

          <div className="mt-6 relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, plate number, or ID..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 pl-11 py-3 text-sm shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="grid gap-3">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <article
              key={booking.id}
              className="rounded-xl border bg-white p-4 shadow-sm"
            >
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
                      <p className="text-xs font-medium text-slate-400">
                        Amount
                      </p>
                      <p className="font-bold text-slate-900">
                        INR {booking.amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Overtime
                      </p>
                      <p
                        className={`font-bold ${booking.overtimeMinutes > 0 ? "text-rose-600" : "text-slate-900"}`}
                      >
                        {booking.overtimeMinutes} min
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs font-medium text-slate-400">
                        Duration
                      </p>
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
                  onClick={() => setCancelBookingId(booking.id)}
                  disabled={cancelBooking.isPending}
                >
                  Cancel booking
                </button>
              )}
            </article>
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
