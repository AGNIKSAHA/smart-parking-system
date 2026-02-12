import { useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useResetPassword } from "../features/auth/auth.hooks";

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

export const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => params.get("token") ?? "", [params]);
  const { register, handleSubmit, watch } = useForm<ResetPasswordForm>();
  const resetPassword = useResetPassword();

  return (
    <section className="mx-auto max-w-md rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Reset password</h1>
      <p className="mt-2 text-sm text-slate-600">Set a new password for your account.</p>
      <form
        className="mt-4 space-y-3"
        onSubmit={handleSubmit((values) => {
          if (!token) {
            toast.error("Missing reset token");
            return;
          }

          if (values.password !== values.confirmPassword) {
            toast.error("Passwords do not match");
            return;
          }

          resetPassword.mutate(
            { token, password: values.password },
            {
              onSuccess: () => {
                toast.success("Password reset successful. Please login.");
                navigate("/login");
              },
              onError: () => toast.error("Invalid or expired reset token")
            }
          );
        })}
      >
        <label className="block text-sm font-medium text-slate-700" htmlFor="reset-password">
          New password
        </label>
        <input
          id="reset-password"
          title="New password"
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Enter new password"
          type="password"
          {...register("password", { required: true, minLength: 8 })}
        />

        <label className="block text-sm font-medium text-slate-700" htmlFor="reset-confirm-password">
          Confirm password
        </label>
        <input
          id="reset-confirm-password"
          title="Confirm password"
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Re-enter new password"
          type="password"
          {...register("confirmPassword", {
            required: true,
            validate: (value) => value === watch("password") || "Passwords must match"
          })}
        />

        <button className="w-full rounded-lg bg-slate-900 py-2 text-white" type="submit" disabled={resetPassword.isPending}>
          {resetPassword.isPending ? "Resetting..." : "Reset password"}
        </button>
      </form>
      <Link to="/login" className="mt-3 inline-block text-sm text-blue-700">
        Back to login
      </Link>
    </section>
  );
};
