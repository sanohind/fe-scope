import React, { useEffect, useState } from "react";
import { inventoryApi } from "../../../services/api/dashboardApi";
import { InventoryFilterRequestParams, inventoryFiltersToQuery } from "../../../context/InventoryFilterContext";

interface GroupTypeData {
  group_type_desc: string;
  total_onhand: string;
  total_items: string;
}

interface StockByGroupData {
  data: GroupTypeData[];
  summary: {
    total_onhand: number;
    total_items: number;
    total_group_types: number;
  };
  warehouses: string[];
}

interface StockByCustomerProps {
  warehouse?: string;
  filters?: InventoryFilterRequestParams;
}

const StockByCustomer: React.FC<StockByCustomerProps> = ({ warehouse, filters }) => {
  const [data, setData] = useState<StockByGroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params: Record<string, string> = { ...(warehouse ? { warehouse } : {}) };
        Object.assign(params, inventoryFiltersToQuery(filters));
        const result = await inventoryApi.getStockByCustomer(params);
        console.log("Stock by Group API Response:", result);
        setData(result);
        setError(null);
      } catch (err) {
        console.error("Stock by Group API Error:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouse, filters]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded dark:bg-gray-800 w-48 mb-6"></div>
          <div className="h-40 bg-gray-200 rounded dark:bg-gray-800"></div>
        </div>
      </div>
    );
  }

  if (error || !data || !Array.isArray(data.data) || data.data.length === 0) {
    console.log("Showing no data. Error:", error, "Data:", data, "Is Array?:", data ? Array.isArray(data.data) : false, "Length:", data?.data?.length);
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Stock by Group Type</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  // Get selected group type data
  const selectedData =
    selectedGroup === "all"
      ? {
          group_type_desc: "All Group Types",
          total_onhand: data.summary.total_onhand?.toString() ?? "0",
          total_items: data.summary.total_items?.toString() ?? "0",
        }
      : data.data.find((item) => item.group_type_desc === selectedGroup) || data.data[0];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Stock by Group Type</h3>

        {/* Dropdown Group Type */}
        {/* <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Group Type</label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">All Group Types</option>
            {data.data.map((item, index) => (
              <option key={item.group_type_desc || `empty-${index}`} value={item.group_type_desc}>
                {item.group_type_desc || "Unknown Group Type"}
              </option>
            ))}
          </select>
        </div> */}
      </div>

      {/* Display Selected Group Type Info */}
      <div className="space-y-4">
        <div className="rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Stock On Hand</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{parseFloat(selectedData.total_onhand).toLocaleString()}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">units</p>
        </div>

        <div className="rounded-lg bg-green-50 p-6 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Items</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{parseFloat(selectedData.total_items).toLocaleString()}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">items</p>
        </div>
      </div>
    </div>
  );
};

export default StockByCustomer;
