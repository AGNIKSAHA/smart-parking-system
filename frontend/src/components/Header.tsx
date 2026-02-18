import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthUser, useLogout } from "../features/auth/auth.hooks";
import { useUnreadCount } from "../features/notifications/notification.hooks";
import { ConfirmationModal } from "./ConfirmationModal";
import { useAppDispatch } from "../app/redux-hooks";
import { setUser, setAuthBootstrapped } from "../features/auth/auth.slice";
import { writeStoredAuthUser } from "../features/auth/auth.storage";
import { useQueryClient } from "@tanstack/react-query";

const linkClass = ({ isActive }: { isActive: boolean }): string =>
  `rounded-md px-3 py-1.5 text-sm ${isActive ? "bg-slate-900 text-white" : "hover:bg-slate-100"}`;

export const Header = () => {
  const user = useAuthUser();
  const unread = useUnreadCount();
  const logout = useLogout();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    dispatch(setUser(null));
    dispatch(setAuthBootstrapped(true));
    writeStoredAuthUser(null);
    queryClient.clear();
    setIsLogoutModalOpen(false);

    // Then trigger background logout
    logout.mutate(undefined, {
      onSettled: () => {
        navigate("/login", { replace: true });
      },
    });
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <span className="text-xl font-black">ParkSphere</span>
          <nav className="flex items-center gap-2">
            {user ? (
              <>
                <NavLink to="/dashboard" className={linkClass}>
                  Dashboard
                </NavLink>
                {(user.role === "user" || user.role === "admin") && (
                  <NavLink to="/slots" className={linkClass}>
                    Slots
                  </NavLink>
                )}
                <NavLink to="/bookings" className={linkClass}>
                  Bookings
                </NavLink>
                <NavLink to="/profile" className={linkClass}>
                  myProfile
                </NavLink>
                {user.role === "user" && (
                  <>
                    <NavLink to="/vehicles" className={linkClass}>
                      Vehicles
                    </NavLink>
                    <NavLink to="/subscriptions" className={linkClass}>
                      Subscriptions
                    </NavLink>
                  </>
                )}
                {(user.role === "security" || user.role === "admin") && (
                  <NavLink to="/security/scan" className={linkClass}>
                    Entry/Exit
                  </NavLink>
                )}
                {user.role === "admin" && (
                  <>
                    <NavLink to="/admin/analytics" className={linkClass}>
                      Analytics
                    </NavLink>
                    <NavLink to="/admin/profiles" className={linkClass}>
                      Profiles
                    </NavLink>
                  </>
                )}
                <NavLink to="/notifications" className={linkClass}>
                  Notifications ({unread})
                </NavLink>
                <button
                  className="rounded-md bg-rose-600 px-3 py-1.5 text-sm text-white"
                  onClick={() => setIsLogoutModalOpen(true)}
                  type="button"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>
                  Login
                </NavLink>
                <NavLink to="/register" className={linkClass}>
                  Signup
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
        confirmLabel="Logout"
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
        isProcessing={logout.isPending}
        variant="danger"
      />
    </>
  );
};
