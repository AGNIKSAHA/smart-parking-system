import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useForgotPassword } from "../features/auth/auth.hooks";

interface ForgotPasswordForm {
  email: string;
}

export const ForgotPasswordPage = () => {
  const { register, handleSubmit } = useForm<ForgotPasswordForm>();
  const forgotPassword = useForgotPassword();

  return (
    <section className="mx-auto max-w-md rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Forgot password</h1>
      <p className="mt-2 text-sm text-slate-600">Enter your verified email to get a reset link.</p>
      <form
        className="mt-4 space-y-3"
        onSubmit={handleSubmit((values) => {
          forgotPassword.mutate(values.email, {
            onSuccess: () => toast.success("If account exists, reset email has been sent.")
          });
        })}
      >
        <label className="block text-sm font-medium text-slate-700" htmlFor="forgot-email">
          Email
        </label>
        <input
          id="forgot-email"
          title="Email"
          className="w-full rounded-lg border px-3 py-2"
          placeholder="you@example.com"
          {...register("email", { required: true })}
        />
        <button className="w-full rounded-lg bg-slate-900 py-2 text-white" type="submit" disabled={forgotPassword.isPending}>
          {forgotPassword.isPending ? "Sending..." : "Send reset link"}
        </button>
      </form>
      <Link to="/login" className="mt-3 inline-block text-sm text-blue-700">
        Back to login
      </Link>
    </section>
  );
};
