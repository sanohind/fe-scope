import React from "react";
import { useInventoryFilters } from "../../../context/InventoryFilterContext";

const InventoryFilterStats: React.FC = () => {
  const { rangeSummary, rangeDescription } = useInventoryFilters();

  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
      <p className="font-semibold text-gray-800 dark:text-white">{rangeSummary}</p>
      <p>{rangeDescription}</p>
    </div>
  );
};

export default InventoryFilterStats;
