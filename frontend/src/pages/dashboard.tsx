import { useAuthUser } from "../features/auth/auth.hooks";
import { useMyProfile } from "../features/profile/profile.hooks";
import { useVehicles } from "../features/vehicles/vehicle.hooks";

export const DashboardPage = () => {
  const user = useAuthUser();
  const profile = useMyProfile();
  const vehicles = useVehicles();

  const isUser = user?.role === "user";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ring-1 ring-slate-900/5 md:col-span-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {profile.data?.name || "User"}!
          </h1>
          <p className="mt-2 text-slate-600">
            {user?.role === "admin"
              ? "System administrator dashboard. Monitor occupancy, manage users, and view analytics."
              : user?.role === "security"
                ? "Security dashboard. Validate QR codes and monitor facility access."
                : "User dashboard. Book slots, manage vehicles, and view your parking history."}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
          <p className="text-sm font-medium text-slate-500">Access Level</p>
          <p className="mt-2 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold uppercase text-indigo-700">
            {user?.role}
          </p>

          {profile.data?.qrImageDataUrl && (
            <div className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/50 p-6">
              <img
                src={profile.data.qrImageDataUrl}
                alt="Personal QR"
                className="h-48 w-48 object-contain"
              />
              <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-500">
                Digital ID Pass
              </p>
            </div>
          )}
        </article>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Personal Details
            </h2>
            <span className="text-xs font-medium text-slate-400">
              View Only
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Full Name
              </p>
              <p className="font-medium text-slate-900">
                {profile.data?.name || "---"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email Address
              </p>
              <p className="font-medium text-slate-900">
                {profile.data?.email || "---"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Phone
              </p>
              <p className="font-medium text-slate-900">
                {profile.data?.phoneNumber || "---"}
              </p>
            </div>
            {profile.data?.address && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Address
                </p>
                <p className="font-medium text-slate-900">
                  {profile.data?.address}
                </p>
              </div>
            )}
          </div>
        </section>

        {isUser && (
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Registered Vehicles
              </h2>
              <span className="text-xs font-medium text-slate-400">
                View Only
              </span>
            </div>

            {vehicles.data && vehicles.data.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {vehicles.data.map((vehicle) => (
                  <div key={vehicle.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">
                          {vehicle.plateNumber}
                        </p>
                        <p className="text-sm text-slate-500">
                          {vehicle.make} {vehicle.model} ({vehicle.color})
                        </p>
                      </div>
                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase text-slate-600">
                        {vehicle.vehicleType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">
                No vehicles registered yet.
              </p>
            )}

            <p className="mt-4 text-[10px] text-slate-400">
              * To add or edit vehicles, please visit the Vehicles tab.
            </p>
          </section>
        )}
      </div>
    </div>
  );
};
