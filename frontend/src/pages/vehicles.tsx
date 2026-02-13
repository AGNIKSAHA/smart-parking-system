import { useState } from "react";
import { useForm, type UseFormRegister } from "react-hook-form";
import {
  useCreateVehicle,
  useDeleteVehicle,
  useVehicles,
} from "../features/vehicles/vehicle.hooks";
import type { Vehicle } from "../types/domain";
import type { VehicleFormValues } from "../types/form-types";
import { ConfirmationModal } from "../components/ConfirmationModal";

interface VehicleFormFieldsProps {
  idPrefix: string;
  register: UseFormRegister<VehicleFormValues>;
}

const VehicleFormFields = ({ idPrefix, register }: VehicleFormFieldsProps) => (
  <>
    <label
      className="block text-sm font-medium text-slate-700"
      htmlFor={`${idPrefix}-plate`}
    >
      Plate number
    </label>
    <input
      id={`${idPrefix}-plate`}
      title="Plate number"
      className="w-full rounded-lg border px-3 py-2"
      placeholder="AB12CD3456"
      {...register("plateNumber", { required: true })}
    />

    <label
      className="block text-sm font-medium text-slate-700"
      htmlFor={`${idPrefix}-make`}
    >
      Make
    </label>
    <input
      id={`${idPrefix}-make`}
      title="Make"
      className="w-full rounded-lg border px-3 py-2"
      placeholder="Toyota"
      {...register("make", { required: true })}
    />

    <label
      className="block text-sm font-medium text-slate-700"
      htmlFor={`${idPrefix}-model`}
    >
      Model
    </label>
    <input
      id={`${idPrefix}-model`}
      title="Model"
      className="w-full rounded-lg border px-3 py-2"
      placeholder="Corolla"
      {...register("model", { required: true })}
    />

    <label
      className="block text-sm font-medium text-slate-700"
      htmlFor={`${idPrefix}-color`}
    >
      Color
    </label>
    <input
      id={`${idPrefix}-color`}
      title="Color"
      className="w-full rounded-lg border px-3 py-2"
      placeholder="White"
      {...register("color", { required: true })}
    />

    <label
      className="block text-sm font-medium text-slate-700"
      htmlFor={`${idPrefix}-type`}
    >
      Vehicle type
    </label>
    <select
      id={`${idPrefix}-type`}
      title="Vehicle type"
      className="w-full rounded-lg border px-3 py-2"
      {...register("vehicleType", { required: true })}
    >
      <option value="car">Car</option>
      <option value="bike">Bike</option>
      <option value="suv">SUV</option>
      <option value="ev">EV</option>
    </select>
  </>
);

export const VehiclesPage = () => {
  const { register, handleSubmit } = useForm<VehicleFormValues>({
    defaultValues: { vehicleType: "car" },
  });
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const vehicles = useVehicles();
  const createVehicle = useCreateVehicle();
  const deleteVehicle = useDeleteVehicle();

  const handleConfirmDelete = () => {
    if (vehicleToDelete) {
      deleteVehicle.mutate(vehicleToDelete.id, {
        onSuccess: () => setVehicleToDelete(null),
      });
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold">Register vehicle</h1>
        <form
          className="mt-4 space-y-3"
          onSubmit={handleSubmit((values) => createVehicle.mutate(values))}
        >
          <VehicleFormFields idPrefix="create-vehicle" register={register} />
          <button
            className="w-full rounded-lg bg-slate-900 py-2 text-white"
            type="submit"
            disabled={createVehicle.isPending}
          >
            {createVehicle.isPending ? "Adding..." : "Add"}
          </button>
        </form>
      </section>
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">My vehicles</h2>
        <div className="mt-3 space-y-2">
          {(vehicles.data ?? []).map((vehicle) => (
            <div className="rounded-lg border p-3" key={vehicle.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{vehicle.plateNumber}</p>
                  <p className="text-sm text-slate-600">
                    {vehicle.make} {vehicle.model} | {vehicle.color} |{" "}
                    {vehicle.vehicleType.toUpperCase()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`rounded-lg border px-3 py-1.5 text-sm ${
                      vehicle.hasActiveBooking || vehicle.hasActiveSubscription
                        ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "border-rose-300 text-rose-700 hover:bg-rose-50"
                    }`}
                    type="button"
                    title={
                      vehicle.hasActiveBooking
                        ? "Cannot delete active booking"
                        : vehicle.hasActiveSubscription
                          ? "Cannot delete active subscription"
                          : "Delete vehicle"
                    }
                    onClick={() => setVehicleToDelete(vehicle)}
                    disabled={
                      deleteVehicle.isPending ||
                      vehicle.hasActiveBooking ||
                      vehicle.hasActiveSubscription
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ConfirmationModal
        isOpen={!!vehicleToDelete}
        title="Delete Vehicle"
        message={`Are you sure you want to delete ${vehicleToDelete?.plateNumber}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setVehicleToDelete(null)}
        isProcessing={deleteVehicle.isPending}
      />
    </div>
  );
};
