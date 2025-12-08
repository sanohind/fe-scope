import React from "react";
import { useWarehouseFilters, WarehouseDateMode } from "../../../context/WarehouseFilterContext";

interface WarehouseFilterHeaderProps {
  title?: string;
  warehouseName?: string;
  filters?: {
    period?: boolean;
  };
}

const MODE_OPTIONS: { value: WarehouseDateMode; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const WarehouseFilterHeader: React.FC<WarehouseFilterHeaderProps> = ({ title = "Global Filters", filters }) => {
  const { mode, setMode, months, years, rangeSummary, rangeDescription, resetFilters, daily, monthly, yearly } = useWarehouseFilters();

  const shouldShowPeriod = filters?.period !== false;

  const renderPeriodControls = () => {
    if (!shouldShowPeriod) {
      return null;
    }
    switch (mode) {
      case "daily":
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Month</label>
              <select
                value={daily.month}
                onChange={(event) => daily.setMonth(parseInt(event.target.value, 10))}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Year</label>
              <select
                value={daily.year}
                onChange={(event) => daily.setYear(parseInt(event.target.value, 10))}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      case "monthly":
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Year</label>
              <select
                value={monthly.year}
                onChange={(event) => monthly.setYear(parseInt(event.target.value, 10))}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      case "yearly":
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Start Year</label>
              <select
                value={yearly.startYear}
                onChange={(event) => yearly.setStartYear(parseInt(event.target.value, 10))}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">End Year</label>
              <select
                value={yearly.endYear}
                onChange={(event) => yearly.setEndYear(parseInt(event.target.value, 10))}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-brand-500 hover:text-brand-600 dark:border-gray-700 dark:text-gray-300"
        >
          Reset Filter
        </button>
      </div>

      {shouldShowPeriod && (
        <>
          <div className="mt-6 flex flex-wrap gap-3">
            {MODE_OPTIONS.map((option) => {
              const isActive = option.value === mode;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMode(option.value)}
                  className={`flex col-span-3 flex-col rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    isActive
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-500/10 dark:text-brand-200"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-brand-200 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                  }`}
                >
                  <span className="font-semibold col-1">{option.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6">{renderPeriodControls()}</div>
        </>
      )}

      <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
        <p className="font-semibold text-gray-800 dark:text-white">{rangeSummary}</p>
        <p>{rangeDescription}</p>
      </div>
    </div>
  );
};

export default WarehouseFilterHeader;
