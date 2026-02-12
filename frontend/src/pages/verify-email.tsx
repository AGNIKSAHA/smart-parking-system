import { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useVerifyEmail } from "../features/auth/auth.hooks";

export const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token") ?? "", [params]);
  const verify = useVerifyEmail();

  const onVerify = (): void => {
    if (!token) {
      toast.error("Missing verification token");
      return;
    }

    verify.mutate(token, {
      onSuccess: () => toast.success("Email verified. You can now login."),
      onError: () => toast.error("Invalid or expired verification token")
    });
  };

  return (
    <section className="mx-auto max-w-md rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Verify email</h1>
      <p className="mt-2 text-sm text-slate-600">Complete verification to enable login and all protected parking features.</p>
      <button className="mt-4 w-full rounded-lg bg-slate-900 py-2 text-white" type="button" onClick={onVerify} disabled={verify.isPending}>
        {verify.isPending ? "Verifying..." : "Verify now"}
      </button>
      <Link to="/login" className="mt-3 inline-block text-sm text-blue-700">Back to login</Link>
    </section>
  );
};
