import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Loader } from "../components/loader";
import { Layout } from "../components/layout";
import { useSessionBootstrap } from "../features/auth/auth.hooks";
import { AdminAnalyticsPage } from "../pages/admin-analytics";
import { BookingsPage } from "../pages/bookings";
import { DashboardPage } from "../pages/dashboard";
import { AdminProfilesPage } from "../pages/admin-profiles";
import { ForgotPasswordPage } from "../pages/forgot-password";
import { LoginPage } from "../pages/login";
import { NotFoundPage } from "../pages/not-found";
import { NotificationsPage } from "../pages/notifications";
import { ProfilePage } from "../pages/profile";
import { RegisterPage } from "../pages/register";
import { ResetPasswordPage } from "../pages/reset-password";
import { SecurityScanPage } from "../pages/security-scan";
import { SlotsPage } from "../pages/slots";
import { SubscriptionsPage } from "../pages/subscriptions";
import { VerifyEmailPage } from "../pages/verify-email";
import { VehiclesPage } from "../pages/vehicles";
import { RequireAuth, RequireRole } from "./guards";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
      { path: "verify-email", element: <VerifyEmailPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: "dashboard", element: <DashboardPage /> },
          { path: "bookings", element: <BookingsPage /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "notifications", element: <NotificationsPage /> },
          {
            element: <RequireRole roles={["user", "admin"]} />,
            children: [
              { path: "slots", element: <SlotsPage /> },
              { path: "vehicles", element: <VehiclesPage /> },
              { path: "subscriptions", element: <SubscriptionsPage /> }
            ]
          },
          { element: <RequireRole roles={["security", "admin"]} />, children: [{ path: "security/scan", element: <SecurityScanPage /> }] },
          {
            element: <RequireRole roles={["admin"]} />,
            children: [
              { path: "admin/analytics", element: <AdminAnalyticsPage /> },
              { path: "admin/profiles", element: <AdminProfilesPage /> }
            ]
          }
        ]
      },
      { path: "*", element: <NotFoundPage /> }
    ]
  }
]);

export const AppRouter = () => {
  const session = useSessionBootstrap();

  if (session.isLoading) {
    return <Loader label="Initializing..." />;
  }

  return <RouterProvider router={router} />;
};
