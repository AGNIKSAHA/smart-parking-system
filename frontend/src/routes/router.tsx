import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { Loader } from "../components/loader";
import { Layout } from "../layouts/Layout";
import {
  useSessionBootstrap,
  useAuthBootstrapped,
} from "../features/auth/auth.hooks";
import { RequireAuth, RequireRole, GuestGate } from "./guards";

const AdminAnalyticsPage = lazy(() =>
  import("../pages/admin-analytics").then((m) => ({
    default: m.AdminAnalyticsPage,
  })),
);
const BookingsPage = lazy(() =>
  import("../pages/bookings").then((m) => ({ default: m.BookingsPage })),
);
const DashboardPage = lazy(() =>
  import("../pages/dashboard").then((m) => ({ default: m.DashboardPage })),
);
const AdminProfilesPage = lazy(() =>
  import("../pages/admin-profiles").then((m) => ({
    default: m.AdminProfilesPage,
  })),
);
const ForgotPasswordPage = lazy(() =>
  import("../pages/forgot-password").then((m) => ({
    default: m.ForgotPasswordPage,
  })),
);
const LoginPage = lazy(() =>
  import("../pages/login").then((m) => ({ default: m.LoginPage })),
);
const NotFoundPage = lazy(() =>
  import("../pages/not-found").then((m) => ({ default: m.NotFoundPage })),
);
const NotificationsPage = lazy(() =>
  import("../pages/notifications").then((m) => ({
    default: m.NotificationsPage,
  })),
);
const ProfilePage = lazy(() =>
  import("../pages/profile").then((m) => ({ default: m.ProfilePage })),
);
const RegisterPage = lazy(() =>
  import("../pages/register").then((m) => ({ default: m.RegisterPage })),
);
const ResetPasswordPage = lazy(() =>
  import("../pages/reset-password").then((m) => ({
    default: m.ResetPasswordPage,
  })),
);
const SecurityScanPage = lazy(() =>
  import("../pages/security-scan").then((m) => ({
    default: m.SecurityScanPage,
  })),
);
const SlotsPage = lazy(() =>
  import("../pages/slots").then((m) => ({ default: m.SlotsPage })),
);
const SubscriptionsPage = lazy(() =>
  import("../pages/subscriptions").then((m) => ({
    default: m.SubscriptionsPage,
  })),
);
const VerifyEmailPage = lazy(() =>
  import("../pages/verify-email").then((m) => ({ default: m.VerifyEmailPage })),
);
const VehiclesPage = lazy(() =>
  import("../pages/vehicles").then((m) => ({ default: m.VehiclesPage })),
);

const PageLoader = () => <Loader label="Loading..." />;

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        element: <GuestGate />,
        children: [
          {
            path: "login",
            element: (
              <SuspenseWrapper>
                <LoginPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: "register",
            element: (
              <SuspenseWrapper>
                <RegisterPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: "forgot-password",
            element: (
              <SuspenseWrapper>
                <ForgotPasswordPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },
      {
        path: "reset-password",
        element: (
          <SuspenseWrapper>
            <ResetPasswordPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "verify-email",
        element: (
          <SuspenseWrapper>
            <VerifyEmailPage />
          </SuspenseWrapper>
        ),
      },
      {
        element: <RequireAuth />,
        children: [
          {
            path: "dashboard",
            element: (
              <SuspenseWrapper>
                <DashboardPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: "bookings",
            element: (
              <SuspenseWrapper>
                <BookingsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: "profile",
            element: (
              <SuspenseWrapper>
                <ProfilePage />
              </SuspenseWrapper>
            ),
          },
          {
            path: "notifications",
            element: (
              <SuspenseWrapper>
                <NotificationsPage />
              </SuspenseWrapper>
            ),
          },
          {
            element: <RequireRole roles={["user", "admin"]} />,
            children: [
              {
                path: "slots",
                element: (
                  <SuspenseWrapper>
                    <SlotsPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: "vehicles",
                element: (
                  <SuspenseWrapper>
                    <VehiclesPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: "subscriptions",
                element: (
                  <SuspenseWrapper>
                    <SubscriptionsPage />
                  </SuspenseWrapper>
                ),
              },
            ],
          },
          {
            element: <RequireRole roles={["security", "admin"]} />,
            children: [
              {
                path: "security/scan",
                element: (
                  <SuspenseWrapper>
                    <SecurityScanPage />
                  </SuspenseWrapper>
                ),
              },
            ],
          },
          {
            element: <RequireRole roles={["admin"]} />,
            children: [
              {
                path: "admin/analytics",
                element: (
                  <SuspenseWrapper>
                    <AdminAnalyticsPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: "admin/profiles",
                element: (
                  <SuspenseWrapper>
                    <AdminProfilesPage />
                  </SuspenseWrapper>
                ),
              },
            ],
          },
        ],
      },
      {
        path: "*",
        element: (
          <SuspenseWrapper>
            <NotFoundPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
]);

export const AppRouter = () => {
  useSessionBootstrap();
  const bootstrapped = useAuthBootstrapped();

  if (!bootstrapped) {
    return <Loader label="Initializing..." />;
  }

  return <RouterProvider router={router} />;
};
