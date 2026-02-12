import { useState } from "react";
import { useForm } from "react-hook-form";
import { PaymentModal } from "../features/payments/PaymentModal";
import {
  useConfirmSubscription,
  useCreateSubscription,
  useSubscriptions,
} from "../features/subscriptions/subscription.hooks";
import { useVehicles } from "../features/vehicles/vehicle.hooks";
import { useSlots } from "../features/slots/slot.hooks";

interface SubForm {
  vehicleId: string;
  planName: string;
  monthlyAmount: number;
  startsAt: string;
  slotId?: string;
}

export const SubscriptionsPage = () => {
  const vehicles = useVehicles();
  const subscriptions = useSubscriptions();
  const slots = useSlots(undefined, 1, 100);
  const createSubscription = useCreateSubscription();
  const confirmSubscription = useConfirmSubscription();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amountToPay, setAmountToPay] = useState(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { register, handleSubmit, watch, setValue } = useForm<SubForm>({
    defaultValues: {
      planName: "Monthly Premium",
      monthlyAmount: 3000,
      startsAt: new Date().toISOString().split("T")[0] || "",
    },
  });

  const selectedVehicleId = watch("vehicleId");
  const selectedVehicle = (vehicles.data ?? []).find(
    (v) => v.id === selectedVehicleId,
  );

  const onSubmit: import("react-hook-form").SubmitHandler<SubForm> = (
    values,
  ) => {
    createSubscription.mutate(
      {
        ...values,
        monthlyAmount: 3000,
      },
      {
        onSuccess: (data) => {
          const res = data as unknown as {
            clientSecret: string;
            amount: number;
          };
          setClientSecret(res.clientSecret);
          setAmountToPay(res.amount);
          setIsPaymentModalOpen(true);
        },
      },
    );
  };

  const onPaymentSuccess = (paymentIntentId: string) => {
    setIsPaymentModalOpen(false);
    confirmSubscription.mutate(paymentIntentId);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Start Subscription</h1>
        <p className="mt-1 text-sm text-slate-500">
          Get unlimited access for your vehicle.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="subscription-vehicle"
            >
              Select Vehicle
            </label>
            <select
              id="subscription-vehicle"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              {...register("vehicleId", { required: true })}
            >
              <option value="">Choose a vehicle...</option>
              {(vehicles.data ?? []).map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plateNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="subscription-start-date"
            >
              Start Date
            </label>
            <input
              id="subscription-start-date"
              type="date"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              min={new Date().toISOString().split("T")[0]}
              {...register("startsAt", { required: true })}
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="subscription-slot"
            >
              Select Preferred Slot (Optional)
            </label>
            <select
              id="subscription-slot"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              {...register("slotId")}
            >
              <option value="">Auto-assign / Flexible</option>
              {(slots.data?.data ?? [])
                .filter((s) => s.status === "available")
                .filter(
                  (s) =>
                    !selectedVehicle ||
                    s.vehicleType === selectedVehicle.vehicleType,
                )
                .map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.code} ({slot.vehicleType.toUpperCase()}) -{" "}
                    {slot.status}
                  </option>
                ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              If you select a slot, it will be reserved for you for the duration
              of the subscription.
            </p>
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="subscription-plan-name"
            >
              Plan Name
            </label>
            <input
              id="subscription-plan-name"
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 outline-none"
              {...register("planName")}
              readOnly
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="subscription-monthly-amount"
            >
              Monthly Fee (INR)
            </label>
            <input
              id="subscription-monthly-amount"
              type="number"
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-900 outline-none"
              {...register("monthlyAmount", { valueAsNumber: true })}
              readOnly
            />
          </div>

          <button
            className="mt-2 w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white shadow-lg shadow-slate-200 hover:bg-slate-800 disabled:opacity-50"
            type="submit"
            disabled={createSubscription.isPending}
          >
            {createSubscription.isPending
              ? "Processing..."
              : "Proceed to Payment"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Your Active Plans</h2>
        <div className="mt-6 space-y-3">
          {(subscriptions.data ?? []).length > 0 ? (
            (subscriptions.data ?? []).map((item) => (
              <div
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4"
                key={item.id}
              >
                <div>
                  <p className="font-bold text-slate-900">{item.planName}</p>
                  <p className="text-xs text-slate-500">
                    Vehicle: {item.vehicleNumber ?? "---"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Expires: {new Date(item.endsAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                      item.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {item.status}
                  </span>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    INR {item.monthlyAmount}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
              <p className="text-sm text-slate-500">
                No active subscriptions found.
              </p>
            </div>
          )}
        </div>
      </section>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        clientSecret={clientSecret ?? ""}
        amount={amountToPay}
        onSuccess={onPaymentSuccess}
        onCancel={() => setIsPaymentModalOpen(false)}
      />
    </div>
  );
};
