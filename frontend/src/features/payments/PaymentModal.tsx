import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { env } from "../../utils/env";

const stripePromise = loadStripe(env.viteStripePublishableKey);

const PaymentForm = ({
  clientSecret,
  onSuccess,
  onCancel,
  amount,
}: {
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
  amount: number;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isReady, setIsReady] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !isReady) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message ?? "Payment failed");
      toast.error(error.message ?? "Payment failed");
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess(paymentIntent.id);
    } else {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl bg-slate-50 p-5 text-center ring-1 ring-slate-100">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
          Total Amount
        </p>
        <p className="mt-1 text-3xl font-black text-slate-900">
          ₹{amount.toFixed(2)}
        </p>
      </div>

      <div className="min-h-[280px]">
        <PaymentElement onReady={() => setIsReady(true)} />
      </div>

      {errorMessage && (
        <div className="flex gap-2 rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-600 ring-1 ring-rose-100">
          <svg
            className="h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="order-2 w-full rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 sm:order-1 sm:w-1/3"
        >
          Go Back
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing || !isReady}
          className="order-1 w-full rounded-2xl bg-indigo-600 py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 hover:shadow-indigo-200 disabled:opacity-50 sm:order-2 sm:flex-1"
        >
          {isProcessing
            ? "Processing..."
            : isReady
              ? "Confirm & Pay"
              : "Loading Secure Box..."}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 opacity-40">
        <div className="h-px w-8 bg-slate-300"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Secure Stripe Payment
        </span>
        <div className="h-px w-8 bg-slate-300"></div>
      </div>
    </form>
  );
};

export const PaymentModal = ({
  isOpen,
  clientSecret,
  onSuccess,
  onCancel,
  amount,
}: {
  isOpen: boolean;
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
  amount: number;
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !clientSecret) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm transition-all sm:items-center sm:p-4">
      <div className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-[2.5rem] bg-white shadow-2xl ring-1 ring-white/10 sm:max-w-md sm:rounded-[2.5rem]">
        <div className="absolute right-6 top-6 z-10">
          <button
            onClick={onCancel}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-8 pt-10 scrollbar-hide">
          <div className="mb-8">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Secure Checkout
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Finish your booking payment below
            </p>
          </div>

          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm
              clientSecret={clientSecret}
              onSuccess={onSuccess}
              onCancel={onCancel}
              amount={amount}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};
