import React, { useEffect, useState } from "react";
import { inventoryRevApi } from "../../../services/api/dashboardApi";

interface CriticalItem {
  partno: string;
  description: string;
  product_type: string;
  onhand: number;
  safety_stock: number;
  min_stock: number;
  gap: number;
  location: string;
  trans_in_period: number;
  shipment_in_period: number;
  last_trans_date: string;
  status: string;
}

interface InventoryTopCriticalItemsProps {
  warehouse: string;
  dateFrom?: string;
  dateTo?: string;
}

const InventoryTopCriticalItems: React.FC<InventoryTopCriticalItemsProps> = ({ warehouse, dateFrom, dateTo }) => {
  const [data, setData] = useState<CriticalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: string; to: string; days: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params: any = {};
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        const result = await inventoryRevApi.getTopCriticalItems(warehouse, params);
        setData(result.data || []);
        setDateRange(result.date_range || null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouse, dateFrom, dateTo]);

  const getStatusColor = (item: CriticalItem) => {
    if (item.status === "Critical") {
      return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400";
    } else if (item.status === "Low") {
      return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400";
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
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Top 15 Critical Items</h3>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5 flex flex-col h-full">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Top 15 Critical Items</h3>
        {dateRange && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(dateRange.from).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - {new Date(dateRange.to).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} ({dateRange.days} days)
          </span>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-full overflow-x-auto h-full">
          <div className="overflow-y-auto h-[500px]" style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e0 transparent" }}>
            <table className="w-full min-w-[1000px]">
              <thead className="sticky top-0 bg-white dark:bg-gray-900 z-10">
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Part No</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Product Type</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Onhand</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Safety Stock</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Min Stock</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Gap</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Location</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Trans (7d)</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Shipment (7d)</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Last Trans</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No data available
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr key={`${item.partno}-${index}`} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">{item.partno}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{item.description}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{item.product_type}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${getStatusColor(item)}`}>{item.onhand.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">{item.safety_stock.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">{item.min_stock.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-800 dark:text-white/90">{item.gap.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{item.location}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">{item.trans_in_period.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">{item.shipment_in_period.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {item.last_trans_date ? new Date(item.last_trans_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(item)}`}>{item.status}</span>
                      </td>
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

export default InventoryTopCriticalItems;
