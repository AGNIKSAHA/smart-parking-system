import { Navigate, Outlet } from "react-router-dom";
import { useAuthBootstrapped, useAuthUser } from "../features/auth/auth.hooks";
import type { UserRole } from "../types/domain";
import { Loader } from "../components/loader";

export const RequireAuth = () => {
  const bootstrapped = useAuthBootstrapped();
  const user = useAuthUser();
  if (!bootstrapped) {
    return <Loader label="Restoring session..." />;
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const GuestGate = () => {
  const bootstrapped = useAuthBootstrapped();
  const user = useAuthUser();
  if (!bootstrapped) {
    return <Loader label="Restoring session..." />;
  }
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export const RequireRole = ({ roles }: { roles: UserRole[] }) => {
  const user = useAuthUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return roles.includes(user.role) ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" replace />
  );
};
