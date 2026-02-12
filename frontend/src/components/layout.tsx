import { NavLink, Outlet } from "react-router-dom";
import { useAuthUser } from "../features/auth/auth.hooks";
import { useLogout } from "../features/auth/auth.hooks";
import { useUnreadCount } from "../features/notifications/notification.hooks";
import { useRealtime } from "../features/realtime/realtime.hook";

const linkClass = ({ isActive }: { isActive: boolean }): string =>
  `rounded-md px-3 py-1.5 text-sm ${isActive ? "bg-slate-900 text-white" : "hover:bg-slate-100"}`;

export const Layout = () => {
  useRealtime();
  const user = useAuthUser();
  const unread = useUnreadCount();
  const logout = useLogout();

  return (
    <div className="min-h-screen">
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
                  onClick={() => logout.mutate()}
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
                  Register
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};
