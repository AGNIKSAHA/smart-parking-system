import { useForm } from "react-hook-form";
import { useScanBooking } from "../features/bookings/booking.hooks";
import toast from "react-hot-toast";

interface ScanForm {
  token: string;
  action: "entry" | "exit";
}

export const SecurityScanPage = () => {
  const { register, handleSubmit, reset } = useForm<ScanForm>({
    defaultValues: { action: "entry" },
  });
  const scan = useScanBooking();

  const onScan = (values: ScanForm) => {
    scan.mutate(values, {
      onSuccess: () => {
        toast.success(
          values.action === "entry" ? "Entry successful!" : "Exit successful!",
        );
        reset({ token: "", action: values.action });
      },
      onError: (err: any) => {
        const message = err?.response?.data?.message || "Scan failed";
        toast.error(message);
      },
    });
  };

  return (
    <section className="mx-auto max-w-2xl rounded-xl border bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-bold">Entry/Exit QR Scan</h1>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit(onScan)}>
        <label
          className="block text-sm font-medium text-slate-700"
          htmlFor="scan-token"
        >
          QR token
        </label>
        <textarea
          id="scan-token"
          title="QR token"
          className="h-36 w-full rounded-lg border p-2 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all"
          {...register("token", { required: true })}
          placeholder="Paste QR token here..."
        />

        <label
          className="block text-sm font-medium text-slate-700"
          htmlFor="scan-action"
        >
          Scan action
        </label>
        <select
          id="scan-action"
          title="Scan action"
          className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all"
          {...register("action", { required: true })}
        >
          <option value="entry">Entry</option>
          <option value="exit">Exit</option>
        </select>

        <button
          className="w-full rounded-lg bg-slate-900 py-2.5 text-white font-semibold shadow-lg hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-[0.98]"
          type="submit"
          disabled={scan.isPending}
        >
          {scan.isPending ? "Processing..." : "Process Scan"}
        </button>
      </form>
    </section>
  );
};
