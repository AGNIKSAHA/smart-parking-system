import { useState } from "react";
import {
  useAdminProfiles,
  useToggleUserStatus,
} from "../features/profile/profile.hooks";
import type { Profile } from "../types/domain";
import { ConfirmationModal } from "../components/ConfirmationModal";

export const AdminProfilesPage = () => {
  const [tab, setTab] = useState<"user" | "security">("user");
  const [profileToToggle, setProfileToToggle] = useState<Profile | null>(null);

  const profiles = useAdminProfiles(tab);
  const toggleStatus = useToggleUserStatus();

  const handleToggleClick = (profile: Profile) => {
    setProfileToToggle(profile);
  };

  const confirmToggle = () => {
    if (profileToToggle) {
      toggleStatus.mutate(
        { userId: profileToToggle.id, isActive: !profileToToggle.isActive },
        {
          onSuccess: () => setProfileToToggle(null),
        },
      );
    }
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">User & Security Profiles</h1>

      <div className="flex gap-2">
        <button
          className={`rounded-lg px-3 py-2 text-sm ${tab === "user" ? "bg-slate-900 text-white" : "border"}`}
          type="button"
          onClick={() => setTab("user")}
        >
          Users
        </button>
        <button
          className={`rounded-lg px-3 py-2 text-sm ${tab === "security" ? "bg-slate-900 text-white" : "border"}`}
          type="button"
          onClick={() => setTab("security")}
        >
          Security
        </button>
      </div>

      <div className="space-y-3">
        {(profiles.data ?? []).map((profile) => (
          <article
            key={profile.id}
            className="flex justify-between rounded-xl border bg-white p-4 shadow-sm"
          >
            <div>
              <p className="text-sm text-slate-500">
                DB ID: <span className="font-mono">{profile.id}</span>
              </p>
              <p className="mt-1 font-semibold">{profile.name}</p>
              <p className="text-sm text-slate-700">Role: {profile.role}</p>
              <p className="text-sm text-slate-700">
                Phone: {profile.phoneNumber || "-"}
              </p>
              <p className="text-sm text-slate-700">
                Address: {profile.address || "-"}
              </p>
              <p className="text-sm text-slate-700">
                Govt ID: {profile.governmentIdNumber || "-"}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`rounded-full px-2 py-1 text-xs font-bold uppercase ${
                  profile.isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {profile.isActive ? "Active" : "Suspended"}
              </span>

              <button
                className={`rounded px-3 py-1 text-xs font-semibold text-white ${
                  profile.isActive
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
                onClick={() => handleToggleClick(profile)}
                disabled={toggleStatus.isPending}
              >
                {profile.isActive ? "Suspend" : "Activate"}
              </button>
            </div>
          </article>
        ))}
      </div>

      <ConfirmationModal
        isOpen={!!profileToToggle}
        title={profileToToggle?.isActive ? "Suspend User" : "Activate User"}
        message={`Are you sure you want to ${
          profileToToggle?.isActive ? "suspend" : "activate"
        } this user? ${
          profileToToggle?.isActive
            ? "They will not be able to log in or make bookings."
            : "They will regain access to the system."
        }`}
        confirmLabel={profileToToggle?.isActive ? "Suspend" : "Activate"}
        cancelLabel="Cancel"
        onConfirm={confirmToggle}
        onCancel={() => setProfileToToggle(null)}
        variant={profileToToggle?.isActive ? "danger" : "info"}
        isProcessing={toggleStatus.isPending}
      />
    </section>
  );
};
