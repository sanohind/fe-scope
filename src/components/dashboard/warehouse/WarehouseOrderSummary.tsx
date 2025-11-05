import React, { useEffect, useState } from "react";
import { warehouseApi } from "../../../services/api/dashboardApi";

interface StatusBreakdown {
  staged: number;
  null_status: number;
  adviced: number;
  released: number;
  open: number;
  shipped: number;
}

interface OrderSummaryData {
  total_order_lines: number;
  pending_deliveries: number;
  completed_orders: number;
  average_fulfillment_rate: number;
  status_breakdown: StatusBreakdown;
}

const WarehouseOrderSummary: React.FC = () => {
  const [data, setData] = useState<OrderSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await warehouseApi.getOrderSummary();
        setData(result);
        setError(null);
      } catch (err) {
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl dark:bg-gray-800"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Status Breakdown
        </h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">
            {error || "Failed to load data"}
          </p>
        </div>
      </div>
    );
  }

  const statusBreakdownItems = [
    {
      label: "Shipped",
      value: data.status_breakdown.shipped,
      color: "bg-success-500",
    },
    {
      label: "Open",
      value: data.status_breakdown.open,
      color: "bg-warning-500",
    },
    {
      label: "Adviced",
      value: data.status_breakdown.adviced,
      color: "bg-blue-light-500",
    },
    {
      label: "Staged",
      value: data.status_breakdown.staged,
      color: "bg-brand-500",
    },
    {
      label: "Unknown",
      value: data.status_breakdown.null_status,
      color: "bg-gray-500",
    },
    {
      label: "Released",
      value: data.status_breakdown.released,
      color: "bg-purple-500",
    },
  ];

  const totalBreakdown = Object.values(data.status_breakdown).reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Status Breakdown
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Total: {totalBreakdown.toLocaleString()} lines
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statusBreakdownItems.map((item) => {
          const percentage = totalBreakdown > 0 ? (item.value / totalBreakdown) * 100 : 0;
          
          return (
            <div
              key={item.label}
              className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.02]"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.label}
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {percentage.toFixed(1)}%
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-800 dark:text-white/90">
                  {item.value.toLocaleString()}
                </div>
                
                {/* Progress Bar */}
                <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WarehouseOrderSummary;