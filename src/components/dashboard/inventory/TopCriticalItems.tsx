import React, { useEffect, useState } from "react";

interface CriticalItem {
  warehouse: string;
  partno: string;
  desc: string;
  onhand: number;
  safety_stock: number;
  min_stock: number;
  max_stock: number;
  location: string;
  gap: number;
}

// Import your actual API
import { inventoryApi } from "../../../services/api/dashboardApi";

const TopCriticalItems: React.FC<{ warehouse?: string }> = ({ warehouse }) => {
  const [data, setData] = useState<CriticalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"critical" | "low" | "overstock">("critical");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await inventoryApi.getTopCriticalItems(filter);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouse, filter]);

  const getStatusColor = (item: CriticalItem) => {
    if (item.onhand < item.min_stock) {
      return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400";
    } else if (item.onhand < item.safety_stock) {
      return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400";
    } else if (item.onhand > item.max_stock) {
      return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
    }
    return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400";
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded dark:bg-gray-800 w-48 mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded dark:bg-gray-800"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Top 20 Critical Items</h3>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5 flex flex-col h-full">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Top 20 Critical Items</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("critical")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === "critical" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"}`}
          >
            Critical
          </button>
          <button
            onClick={() => setFilter("low")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === "low" ? "bg-yellow-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"}`}
          >
            Low
          </button>
          <button
            onClick={() => setFilter("overstock")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === "overstock" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"}`}
          >
            Overstock
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-full overflow-x-auto h-full">
          <div
            className="overflow-y-auto h-[500px]"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#cbd5e0 transparent",
            }}
          >
            <table className="w-full min-w-[1000px]">
              <thead className="sticky top-0 bg-white dark:bg-gray-900 z-10">
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Warehouse</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Part No</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Description</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Onhand</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Safety Stock</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Min Stock</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Max Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Location</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Gap</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No data available
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr key={`${item.warehouse}-${item.partno}-${index}`} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{item.warehouse}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">{item.partno}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{item.desc}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${getStatusColor(item)}`}>{item.onhand.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">{item.safety_stock.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">{item.min_stock.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">{item.max_stock.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{item.location}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-800 dark:text-white/90">{item.gap.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopCriticalItems;
