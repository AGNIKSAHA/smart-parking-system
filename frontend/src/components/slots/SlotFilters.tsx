import React from "react";

interface SlotFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setVehicleType: (type: string | undefined) => void;
  setPage: (page: number) => void;
}

export const SlotFilters: React.FC<SlotFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  setVehicleType,
  setPage,
}) => {
  return (
    <div className="flex gap-3">
      <input
        type="text"
        placeholder="Search by lot name or code..."
        className="rounded-lg border bg-white px-3 py-2 text-sm"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setPage(1);
        }}
      />
      <div>
        <label
          className="mb-1 block text-sm font-medium text-slate-700 sr-only"
          htmlFor="slots-filter-vehicle-type"
        >
          Filter by vehicle type
        </label>
        <select
          id="slots-filter-vehicle-type"
          title="Filter by vehicle type"
          className="rounded-lg border bg-white px-3 py-2"
          onChange={(e) => {
            setVehicleType(e.target.value || undefined);
            setPage(1);
          }}
        >
          <option value="">All Types</option>
          <option value="car">Car</option>
          <option value="bike">Bike</option>
          <option value="suv">SUV</option>
          <option value="ev">EV</option>
        </select>
      </div>
    </div>
  );
};
