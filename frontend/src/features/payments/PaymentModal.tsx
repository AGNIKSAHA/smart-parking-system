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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 text-center">
        <p className="text-lg font-semibold">Pay INR {amount.toFixed(2)}</p>
      </div>
      <PaymentElement onReady={() => setIsReady(true)} />
      {errorMessage && (
        <div className="text-sm text-red-500">{errorMessage}</div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing || !isReady}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {isProcessing ? "Processing..." : isReady ? "Pay Now" : "Loading..."}
        </button>
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
  if (!isOpen || !clientSecret) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold">Complete Payment</h2>
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
  );
};
