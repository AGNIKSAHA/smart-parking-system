import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useLogin, useResendVerification } from "../features/auth/auth.hooks";

interface FormData {
  email: string;
  password: string;
}

export const LoginPage = () => {
  const { register, handleSubmit } = useForm<FormData>();
  const login = useLogin();
  const resendVerification = useResendVerification();

  return (
    <section className="mx-auto max-w-md rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit((values) => login.mutate(values))}>
        <label className="block text-sm font-medium text-slate-700" htmlFor="login-email">
          Email
        </label>
        <input
          id="login-email"
          title="Email"
          className="w-full rounded-lg border px-3 py-2"
          placeholder="you@example.com"
          {...register("email", { required: true })}
        />
        <label className="block text-sm font-medium text-slate-700" htmlFor="login-password">
          Password
        </label>
        <input
          id="login-password"
          title="Password"
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Enter password"
          type="password"
          {...register("password", { required: true })}
        />
        <button className="w-full rounded-lg bg-slate-900 py-2 text-white" type="submit" disabled={login.isPending}>
          {login.isPending ? "Signing in..." : "Sign in"}
        </button>
        <button
          className="w-full rounded-lg border border-slate-300 py-2 text-slate-700"
          type="button"
          onClick={handleSubmit((values) => {
            resendVerification.mutate(values.email, {
              onSuccess: () => toast.success("If account is unverified, verification email was resent.")
            });
          })}
          disabled={resendVerification.isPending}
        >
          {resendVerification.isPending ? "Sending..." : "Resend verification email"}
        </button>
        <Link to="/forgot-password" className="inline-block text-sm text-blue-700">
          Forgot password?
        </Link>
      </form>
    </section>
  );
};
