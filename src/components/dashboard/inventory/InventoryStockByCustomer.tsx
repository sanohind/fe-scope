import React, { useEffect, useState } from "react";
import { inventoryRevApi } from "../../../services/api/dashboardApi";
import { InventoryFilterRequestParams, inventoryFiltersToQuery } from "../../../context/InventoryFilterContext";

interface CustomerData {
  customer: string;
  total_onhand: string;
  total_items: number;
}

interface StockByCustomerResponse {
  data: CustomerData[];
  summary: {
    total_onhand: number;
    total_items: number;
    total_customers: number;
  };
}

interface InventoryStockByCustomerProps {
  warehouse: string;
  filters?: InventoryFilterRequestParams;
}

const InventoryStockByCustomer: React.FC<InventoryStockByCustomerProps> = ({ warehouse, filters }) => {
  const [data, setData] = useState<StockByCustomerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = inventoryFiltersToQuery(filters);
        const result = await inventoryRevApi.getStockByCustomerChart(warehouse, params);
        setData(result);
        setError(null);
      } catch (err) {
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
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Stock by Customer</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  // Use summary data (respects global filter for customer if selected)
  const displayData = {
    customer: filters?.customer && filters.customer !== "all" ? filters.customer : "All Customers",
    total_onhand: data.summary.total_onhand.toString(),
    total_items: data.summary.total_items,
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Stock by Customer</h3>
        {filters?.customer && filters.customer !== "all" && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Filtered by: <span className="font-semibold">{filters.customer}</span>
          </p>
        )}
      </div>

      {/* Display Customer Info */}
      <div className="space-y-4">
        <div className="rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Stock On Hand</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{parseFloat(displayData.total_onhand).toLocaleString()}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">units</p>
        </div>

        <div className="rounded-lg bg-green-50 p-6 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Items</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{(typeof displayData.total_items === "number" ? displayData.total_items : parseInt(displayData.total_items)).toLocaleString()}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">items</p>
        </div>
      </div>
    </div>
  );
};

export default InventoryStockByCustomer;
