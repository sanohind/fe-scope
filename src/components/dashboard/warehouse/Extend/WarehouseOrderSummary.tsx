import React, { useEffect, useMemo, useState } from "react";
import { warehouseRevApi } from "../../../../services/api/dashboardApi";
import { WarehouseFilterRequestParams, warehouseFiltersToQuery } from "../../../../context/WarehouseFilterContext";

interface StatusBreakdown {
  planned?: number;
  null_status?: number;
  put_away?: number;
  received?: number;
  modified?: number;
  open?: number;
  shipped?: number;
  close?: number;
  warehouse_orders?: number;
}

interface OrderSummaryData {
  total_order_lines: number;
  pending_deliveries: number;
  completed_orders: number;
  status_breakdown: StatusBreakdown;
}

interface WarehouseOrderSummaryProps {
  warehouse: string;
  period?: "daily" | "monthly" | "yearly";
  rangeLabel?: string;
  modeLabel?: string;
  filters?: WarehouseFilterRequestParams;
}

const WarehouseOrderSummary: React.FC<WarehouseOrderSummaryProps> = ({ warehouse, period = "monthly", rangeLabel, modeLabel, filters }) => {
  const [data, setData] = useState<OrderSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const effectiveRangeLabel = useMemo(() => {
    if (rangeLabel) return rangeLabel;
    // Fallback ringkasan sederhana jika tidak ada label dari header
    if (period === "daily") return "Per tanggal (bulan berjalan)";
    if (period === "monthly") return "Per bulan (tahun berjalan)";
    return "Per tahun (beberapa tahun terakhir)";
  }, [period, rangeLabel]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = filters ? warehouseFiltersToQuery(filters) : { period };
        const result = await warehouseRevApi.getOrderSummary(warehouse, params);

        // API returns direct object with summary data
        if (result && typeof result.total_order_lines === "number") {
          setData(result);
        } else {
          console.error("WarehouseOrderSummary: Expected summary data but got:", result);
          setData(null);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouse, period, filters]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Status Breakdown Loading */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded dark:bg-gray-800 w-48 mb-6"></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl dark:bg-gray-800"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-error-200 bg-error-50 p-5 dark:border-error-800 dark:bg-error-900/20">
        <p className="text-error-600 dark:text-error-400">{error || "Failed to load data"}</p>
      </div>
    );
  }

  const statusBreakdownItems = [
    {
      label: "Closed",
      value: data.status_breakdown.close ?? 0,
      color: "bg-success-500",
      showPercentage: true,
    },
    {
      label: "Open",
      value: data.status_breakdown.open ?? 0,
      color: "bg-warning-500",
      showPercentage: true,
    },
    {
      label: "Warehouse Orders",
      value: data.status_breakdown.warehouse_orders ?? 0,
      color: "bg-purple-500",
      showPercentage: false,
    },
  ];

  // Calculate total only for items with percentage
  const totalForPercentage = statusBreakdownItems.filter((item) => item.showPercentage).reduce((sum, item) => sum + item.value, 0);
  const unknownStatus = data.status_breakdown.null_status ?? 0;

  return (
    <div>
      {/* Status Breakdown */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Status Breakdown</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">Unknown status: {unknownStatus.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-start gap-1 text-sm text-gray-600 dark:text-gray-300 lg:items-end">
            <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-700 dark:bg-gray-800 dark:text-white">{modeLabel ?? "Custom Range"}</span>
            <span>{effectiveRangeLabel}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statusBreakdownItems.map((item) => {
            const percentage = item.showPercentage && totalForPercentage > 0 ? (item.value / totalForPercentage) * 100 : 0;

            return (
              <div key={item.label} className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                  </div>
                  {item.showPercentage && <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{percentage.toFixed(1)}%</span>}
                </div>

                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white/90">{item.value.toLocaleString()}</div>

                  {/* Progress Bar */}
                  {item.showPercentage && (
                    <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                      <div className={`h-full ${item.color} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WarehouseOrderSummary;
