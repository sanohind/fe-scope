import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { inventoryRevApi } from "../../../services/api/dashboardApi";
import { WarehouseFilterRequestParams } from "../../../context/WarehouseFilterContext";

interface APITrendDataItem {
  period: string;
  total_onhand: string | number;
  total_receipt: string | number;
  total_issue: string | number;
  warehouse_count: number;
}

interface TrendDataPoint {
  period: string;
  onhand: number;
  receipt: number;
  issue: number;
  warehouse_count: number;
}

interface InventoryStockMovementTrendProps {
  warehouse: string;
  dateFrom?: string;
  dateTo?: string;
  period?: "daily" | "monthly" | "yearly";
  filters?: WarehouseFilterRequestParams;
}

const InventoryStockMovementTrend: React.FC<InventoryStockMovementTrendProps> = ({ warehouse, dateFrom, dateTo, period, filters }) => {
  const [data, setData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: string; to: string; days: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params: { date_from?: string; date_to?: string; period?: string } = {};
        if (filters) {
          params.date_from = filters.date_from;
          params.date_to = filters.date_to;
          params.period = filters.period;
        } else {
          if (dateFrom) params.date_from = dateFrom;
          if (dateTo) params.date_to = dateTo;
          if (period) params.period = period;
        }
        const result = await inventoryRevApi.getStockMovementTrend(warehouse, params);

        // Transform API response to component data format
        const transformedData: TrendDataPoint[] = (result.trend_data || []).map((item: APITrendDataItem) => ({
          period: item.period,
          onhand: typeof item.total_onhand === "number" ? item.total_onhand : Number(item.total_onhand ?? 0),
          receipt: typeof item.total_receipt === "number" ? item.total_receipt : Number(item.total_receipt ?? 0),
          issue: typeof item.total_issue === "number" ? item.total_issue : Number(item.total_issue ?? 0),
          warehouse_count: item.warehouse_count,
        }));

        setData(transformedData);
        setDateRange(result.date_range || null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouse, dateFrom, dateTo, period, filters]);

  // Format chart data with labels - MUST be before early returns
  const chartData = useMemo(() => {
    return data.map((item) => {
      const date = new Date(item.period + "T00:00:00");
      let label = "";
      let formattedDate = "";

      if (isNaN(date.getTime())) {
        label = item.period;
        formattedDate = item.period;
      } else {
        label = date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
        formattedDate = date.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
      }

      return {
        ...item,
        label,
        formattedDate,
      };
    });
  }, [data]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="animate-pulse">
          <div className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-800 mb-6" />
          <div className="h-80 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    );
  }

  if (error || !data.length) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Stock Movement Trend</h3>
        </div>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 text-error-600 dark:border-error-800 dark:bg-error-900/20 dark:text-error-400">{error || "No stock data available"}</div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload?: (typeof chartData)[0] }[] }) => {
    const dataPoint = payload?.[0]?.payload;
    if (active && dataPoint) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-800 dark:text-white">{dataPoint.formattedDate}</p>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-300">Receipt:</p>
              <p className="text-sm font-semibold text-success-600 dark:text-success-300">{dataPoint.receipt.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-300">Issue:</p>
              <p className="text-sm font-semibold text-error-600 dark:text-error-300">{dataPoint.issue.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-300">On-hand:</p>
              <p className="text-sm font-semibold text-brand-600 dark:text-brand-300">{dataPoint.onhand.toLocaleString()}</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Stock Movement Trend</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {warehouse}
            {dateRange && ` · ${dateRange.days} days`}
          </p>
        </div>
        {dateRange && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-300">
              {new Date(dateRange.from + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - {new Date(dateRange.to + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" stroke="#9ca3af" tick={{ fill: "#6b7280", fontSize: 12, fontFamily: "Outfit, sans-serif" }} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" tick={{ fill: "#6b7280", fontSize: 12, fontFamily: "Outfit, sans-serif" }} tickLine={false} axisLine={false} tickFormatter={(value) => value.toLocaleString()} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="receipt" name="Receipt" fill="#12B76A" />
              <Bar dataKey="issue" name="Issue" fill="#F04438" />
              <Line type="monotone" dataKey="onhand" name="On-hand" stroke="#465fff" strokeWidth={3} dot={{ strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default InventoryStockMovementTrend;
