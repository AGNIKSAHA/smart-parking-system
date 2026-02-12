import { useForm } from "react-hook-form";
import { useRegister } from "../features/auth/auth.hooks";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "user" | "security" | "admin";
}

export const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FormData>({ defaultValues: { role: "user" } });
  const signup = useRegister();

  return (
    <section className="mx-auto max-w-md rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Create account</h1>
      <form
        className="mt-4 space-y-3"
        onSubmit={handleSubmit((values) =>
          signup.mutate({
            name: values.name,
            email: values.email,
            password: values.password,
            role: values.role
          })
        )}
      >
        <label className="block text-sm font-medium text-slate-700" htmlFor="register-name">
          Full name
        </label>
        <input id="register-name" title="Full name" className="w-full rounded-lg border px-3 py-2" placeholder="Your name" {...register("name", { required: true })} />
        <label className="block text-sm font-medium text-slate-700" htmlFor="register-email">
          Email
        </label>
        <input id="register-email" title="Email" className="w-full rounded-lg border px-3 py-2" placeholder="you@example.com" {...register("email", { required: true })} />
        <label className="block text-sm font-medium text-slate-700" htmlFor="register-password">
          Password
        </label>
        <input id="register-password" title="Password" className="w-full rounded-lg border px-3 py-2" placeholder="Create password" type="password" {...register("password", { required: true })} />
        <label className="block text-sm font-medium text-slate-700" htmlFor="register-confirm-password">
          Confirm password
        </label>
        <input
          id="register-confirm-password"
          title="Confirm password"
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Re-enter password"
          type="password"
          {...register("confirmPassword", {
            required: true,
            validate: (value) => value === watch("password") || "Passwords must match"
          })}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-rose-600">{errors.confirmPassword.message ?? "Confirm password is required"}</p>
        )}
        <label className="block text-sm font-medium text-slate-700" htmlFor="register-role">
          Role
        </label>
        <select id="register-role" title="Role" className="w-full rounded-lg border px-3 py-2" {...register("role", { required: true })}>
          <option value="user">Driver</option>
          <option value="security">Security</option>
          <option value="admin">Admin</option>
        </select>
        <button className="w-full rounded-lg bg-slate-900 py-2 text-white" type="submit" disabled={signup.isPending}>
          {signup.isPending ? "Creating..." : "Create account"}
        </button>
      </form>
    </section>
  );
};
