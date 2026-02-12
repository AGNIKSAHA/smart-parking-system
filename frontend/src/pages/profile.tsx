import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  useMyProfile,
  useUpdateMyProfile,
} from "../features/profile/profile.hooks";

interface ProfileForm {
  name: string;
  phoneNumber: string;
  address: string;
  governmentIdNumber: string;
}

export const ProfilePage = () => {
  const myProfile = useMyProfile();
  const updateProfile = useUpdateMyProfile();
  const [isEdit, setIsEdit] = useState(false);

  const { register, handleSubmit, reset } = useForm<ProfileForm>();

  useEffect(() => {
    if (!myProfile.data) {
      return;
    }

    reset({
      name: myProfile.data.name,
      phoneNumber: myProfile.data.phoneNumber,
      address: myProfile.data.address,
      governmentIdNumber: myProfile.data.governmentIdNumber,
    });
  }, [myProfile.data, reset]);

  const profile = myProfile.data;

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <button
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          type="button"
          onClick={() => setIsEdit((prev) => !prev)}
        >
          {isEdit ? "Cancel" : "Edit"}
        </button>
      </div>

      {profile && (
        <div className="mt-6 flex flex-col items-center gap-4 md:flex-row md:items-start">
          <div className="flex-1 space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              User ID: <span className="font-mono">{profile.id}</span>
            </div>
          </div>

          {profile.qrImageDataUrl && (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/30 p-6 shadow-sm">
              <img
                src={profile.qrImageDataUrl}
                alt="Personal QR ID"
                className="h-64 w-64 object-contain"
              />
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                Personal Digital ID
              </span>
            </div>
          )}
        </div>
      )}

      <form
        className="mt-4 space-y-3"
        onSubmit={handleSubmit((values) => {
          updateProfile.mutate(values, {
            onSuccess: () => setIsEdit(false),
          });
        })}
      >
        <label
          className="block text-sm font-medium text-slate-700"
          htmlFor="profile-name"
        >
          Name
        </label>
        <input
          id="profile-name"
          title="Name"
          className="w-full rounded-lg border px-3 py-2"
          disabled={!isEdit}
          {...register("name", { required: true })}
        />

        <label
          className="block text-sm font-medium text-slate-700"
          htmlFor="profile-phone"
        >
          Phone No
        </label>
        <input
          id="profile-phone"
          title="Phone Number"
          className="w-full rounded-lg border px-3 py-2"
          disabled={!isEdit}
          {...register("phoneNumber", { required: true })}
        />

        <label
          className="block text-sm font-medium text-slate-700"
          htmlFor="profile-address"
        >
          Address
        </label>
        <input
          id="profile-address"
          title="Address"
          className="w-full rounded-lg border px-3 py-2"
          disabled={!isEdit}
          {...register("address", { required: true })}
        />

        <label
          className="block text-sm font-medium text-slate-700"
          htmlFor="profile-govt-id"
        >
          Govt. ID Number
        </label>
        <input
          id="profile-govt-id"
          title="Government ID Number"
          className="w-full rounded-lg border px-3 py-2"
          disabled={!isEdit}
          {...register("governmentIdNumber", { required: true })}
        />

        {isEdit && (
          <button
            className="w-full rounded-lg bg-slate-900 py-2 text-white"
            type="submit"
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? "Saving..." : "Save profile"}
          </button>
        )}
      </form>
    </section>
  );
};
