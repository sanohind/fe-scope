import React, { useEffect, useState } from "react";
import { inventoryApi } from "../../../services/api/dashboardApi";

interface CustomerData {
  customer: string;
  total_onhand: string;
  total_items: string;
}

interface StockByCustomerData {
  data: CustomerData[];
  total_onhand: number;
  total_items: number;
}

const StockByCustomer: React.FC = () => {
  const [data, setData] = useState<StockByCustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await inventoryApi.getStockByCustomer();
        console.log("Stock by Customer API Response:", result);
        // API returns { data: [...], total_onhand: number, total_items: number }
        setData(result);
        setError(null);
      } catch (err) {
        console.error("Stock by Customer API Error:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Stock by Customer
        </h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">
            {error || "No data available"}
          </p>
        </div>
      </div>
    );
  }

  // Get selected customer data
  const selectedData = selectedCustomer === "all" 
    ? {
        customer: "All Customers",
        total_onhand: data.total_onhand.toString(),
        total_items: data.total_items.toString()
      }
    : data.data.find(item => item.customer === selectedCustomer) || data.data[0];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Stock by Customer
        </h3>
        
        {/* Dropdown Customer */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Customer
          </label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">All Customers</option>
            {data.data.map((item, index) => (
              <option key={item.customer || `empty-${index}`} value={item.customer}>
                {item.customer || "Unknown Customer"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Display Selected Customer Info */}
      <div className="space-y-4">
        <div className="rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Stock On Hand</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {parseFloat(selectedData.total_onhand).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">units</p>
        </div>

        <div className="rounded-lg bg-green-50 p-6 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Items</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {parseFloat(selectedData.total_items).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">items</p>
        </div>
      </div>
    </div>
  );
};

export default StockByCustomer;