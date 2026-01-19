import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { warehouseRevApi } from "../../../../services/api/dashboardApi";
import { dailyUseWhApi, DailyUseWhMinMaxData } from "../../../../services/dailyUseWhApi";
import { WarehouseFilterRequestParams } from "../../../../context/WarehouseFilterContext";

interface DailyStockPoint {
  date: string;
  period: string;
  granularity: string;
  onhand: number;
  receipt?: number;
  issue?: number;
  adjustment?: number;
  min_stock?: number;
  max_stock?: number;
}

interface StockDataItem {
  period_start: string;
  period_end: string;
  granularity: string;
  warehouse: string;
  onhand: number | string;
  receipt: number | string;
  issue: number | string;
  adjustment: number | string;
}

interface WarehouseDataEntry {
  warehouse: string;
  data: StockDataItem[];
}

interface DailyStockTrendResponse {
  meta?: {
    warehouse_filter?: string;
    warehouses_queried?: string[];
    period_start_filter?: string | null;
    period_end_filter?: string | null;
    date_from_filter?: string | null;
    date_to_filter?: string | null;
    period?: string;
    granularity?: string;
    total_records?: number;
  };
  data?: StockDataItem[];
  warehouses?: WarehouseDataEntry[];
}

interface DailyStockTrendProps {
  warehouse: string;
  period?: "daily" | "monthly" | "yearly";
  rangeLabel?: string;
  modeLabel?: string;
  filters?: WarehouseFilterRequestParams;
}

const DailyStockTrend: React.FC<DailyStockTrendProps> = ({ warehouse, period = "daily", rangeLabel, modeLabel, filters }) => {
  const [data, setData] = useState<DailyStockPoint[]>([]);
  const [meta, setMeta] = useState<DailyStockTrendResponse["meta"]>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const effectiveRangeLabel = useMemo(() => {
    if (rangeLabel) return rangeLabel;
    if (period === "daily") return "Per tanggal (periode default sistem)";
    if (period === "monthly") return "Per bulan (periode default sistem)";
    return "Per tahun (periode default sistem)";
  }, [period, rangeLabel]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = filters ? { period: filters.period, date_from: filters.date_from, date_to: filters.date_to } : { period };
        
        // Fetch stock trend data
        const result: DailyStockTrendResponse = await warehouseRevApi.getDailyStockTrend(warehouse, params);

        // Extract data from the new nested structure or fallback to old format
        let responseData: StockDataItem[] = [];
        const normalizedWarehouse = warehouse?.toUpperCase();

        if (result?.warehouses && Array.isArray(result.warehouses)) {
          // New format: warehouses is an array
          if (normalizedWarehouse && normalizedWarehouse !== "ALL") {
            const warehouseEntry = result.warehouses.find((entry) => entry.warehouse?.toUpperCase() === normalizedWarehouse);
            responseData = warehouseEntry?.data || [];
          } else {
            // Combine data from all warehouses
            responseData = result.warehouses.flatMap((entry) => entry.data || []);
          }
        } else if (result?.data) {
          // Fallback to old format
          responseData = result.data;
        }

        // Normalize all data first
        const basicData = responseData.map((item) => {
          const periodStr = (item as any).period || item.period_start.split(" ")[0];
          return {
            date: periodStr,
            period: periodStr,
            granularity: item.granularity,
            onhand: typeof item.onhand === "number" ? item.onhand : Number(item.onhand ?? 0),
            receipt: typeof item.receipt === "number" ? item.receipt : Number(item.receipt ?? 0),
            issue: typeof item.issue === "number" ? item.issue : Number(item.issue ?? 0),
            adjustment: typeof item.adjustment === "number" ? item.adjustment : Number(item.adjustment ?? 0),
          };
        });

        // Determine years involved to fetch Min/Max data
        const years = new Set<number>();
        basicData.forEach(item => {
          const d = new Date(item.date);
          if (!isNaN(d.getTime())) {
            years.add(d.getFullYear());
          }
        });

        // Fetch Min/Max data for each year found
        const minMaxMap = new Map<string, DailyUseWhMinMaxData>();
        
        // Only fetch min/max if we have a specific warehouse (not ALL)
        if (normalizedWarehouse && normalizedWarehouse !== "ALL" && years.size > 0) {
          const uniqueYears = Array.from(years);
          const minMaxPromises = uniqueYears.map(year => 
            dailyUseWhApi.getMinMax({ warehouse, year, per_page: 100 })
          );
          
          try {
            const minMaxResults = await Promise.all(minMaxPromises);
            minMaxResults.forEach(res => {
              if(res.success && res.data?.data) {
                res.data.data.forEach(mm => {
                  // Key: "YEAR-PERIOD" e.g., "2026-1"
                  minMaxMap.set(`${mm.year}-${mm.period}`, mm);
                });
              }
            });
          } catch (err) {
            console.error("Failed to fetch Min/Max data:", err);
            // Continue without min/max data if it fails
          }
        }

        // Group by date and merge Min/Max
        const groupedByDate = new Map<string, DailyStockPoint>();
        basicData.forEach((item) => {
          // Determine Min/Max for this date
          let minStock: number | undefined;
          let maxStock: number | undefined;
          
          const d = new Date(item.date);
          if (!isNaN(d.getTime())) {
            const year = d.getFullYear();
            const month = d.getMonth() + 1; // 1-12
            const key = `${year}-${month}`;
            const mm = minMaxMap.get(key);
            if (mm) {
              minStock = mm.min_onhand;
              maxStock = mm.max_onhand;
            }
          }

          const existing = groupedByDate.get(item.date);
          if (existing) {
            // If strictly grouping by date, min/max should be the same for the same date.
            // If aggregating multiple warehouses (ALL), min/max might not simple sum, 
            // but we skipped fetching min/max if warehouse is ALL above.
            groupedByDate.set(item.date, {
              date: item.date,
              period: item.period,
              granularity: item.granularity,
              onhand: existing.onhand + item.onhand,
              receipt: (existing.receipt ?? 0) + (item.receipt ?? 0),
              issue: (existing.issue ?? 0) + (item.issue ?? 0),
              adjustment: (existing.adjustment ?? 0) + (item.adjustment ?? 0),
              min_stock: minStock, // Keep the last found or existing? Usually same per date
              max_stock: maxStock,
            });
          } else {
            groupedByDate.set(item.date, {
              ...item,
              min_stock: minStock,
              max_stock: maxStock
            });
          }
        });

        const mergedData = Array.from(groupedByDate.values());
        setData(mergedData);
        setMeta(result?.meta);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch daily stock data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouse, period, filters]);

  const chartData = useMemo(() => {
    return data
      .map((item) => {
        let label = "";
        let formattedDate = "";

        if (item.granularity === "daily") {
          // Daily: show day number (e.g., "1", "2", "3")
          const dateObj = new Date(item.date);
          label = dateObj.toLocaleDateString("en-US", { day: "numeric" });
          formattedDate = dateObj.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
        } else if (item.granularity === "monthly") {
          // Monthly: show month name (e.g., "Jan", "Feb", "Mar")
          const [year, month] = item.period.split("-");
          const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
          label = dateObj.toLocaleDateString("en-US", { month: "short" });
          formattedDate = dateObj.toLocaleDateString("en-US", { year: "numeric", month: "long" });
        } else if (item.granularity === "yearly") {
          // Yearly: show year (e.g., "2025")
          label = item.period;
          formattedDate = item.period;
        }

        return {
          ...item,
          label,
          formattedDate,
        };
      })
      .sort((a, b) => a.period.localeCompare(b.period));
  }, [data]);

  const latestValue = chartData.length ? chartData[chartData.length - 1].onhand : null;

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload?: DailyStockPoint & { formattedDate: string } }[] }) => {
    const dataPoint = payload?.[0]?.payload;
    if (active && dataPoint) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-800 dark:text-white">{dataPoint.formattedDate}</p>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-300">On-hand:</p>
              <p className="text-sm font-semibold text-brand-600 dark:text-brand-300">{dataPoint.onhand.toLocaleString()}</p>
            </div>
            {dataPoint.min_stock !== undefined && (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-300">Min Stock:</p>
                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">{dataPoint.min_stock.toLocaleString()}</p>
              </div>
            )}
            {dataPoint.max_stock !== undefined && (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-300">Max Stock:</p>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{dataPoint.max_stock.toLocaleString()}</p>
              </div>
            )}
            {dataPoint.receipt !== undefined && dataPoint.receipt !== 0 && (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-300">Receipt:</p>
                <p className="text-sm font-semibold text-success-600 dark:text-success-300">{dataPoint.receipt.toLocaleString()}</p>
              </div>
            )}
            {dataPoint.issue !== undefined && dataPoint.issue !== 0 && (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-300">Issue:</p>
                <p className="text-sm font-semibold text-error-600 dark:text-error-300">{dataPoint.issue.toLocaleString()}</p>
              </div>
            )}
            {dataPoint.adjustment !== undefined && dataPoint.adjustment !== 0 && (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-300">Adjustment:</p>
                <p className="text-sm font-semibold text-warning-600 dark:text-warning-300">{dataPoint.adjustment.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

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

  if (error || chartData.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Daily Stock Level</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">{effectiveRangeLabel}</span>
        </div>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 text-error-600 dark:border-error-800 dark:bg-error-900/20 dark:text-error-400">{error || "No stock data available"}</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Daily Stock Level</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {meta?.warehouse_filter || warehouse} · {modeLabel ?? "Custom Range"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {latestValue !== null && (
            <div className="rounded-xl bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-300">
              Latest On-hand: <span className="text-brand-600 dark:text-brand-300">{latestValue.toLocaleString()}</span>
            </div>
          )}
          <div className="rounded-xl bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-300">{effectiveRangeLabel}</div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" stroke="#9ca3af" tick={{ fill: "#6b7280", fontSize: 12, fontFamily: "Outfit, sans-serif" }} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#9ca3af"
                tick={{ fill: "#6b7280", fontSize: 12, fontFamily: "Outfit, sans-serif" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
                label={{
                  value: "Units",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#6b7280", fontSize: 12, fontFamily: "Outfit, sans-serif" },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {/* Reference Lines for Min/Max - Using Line component to show in legend and tooltip properly */}
              <Line type="step" dataKey="min_stock" name="Min Stock" stroke="#ea580c" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} connectNulls />
              <Line type="step" dataKey="max_stock" name="Max Stock" stroke="#0284c7" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} connectNulls />
              
              <Line type="monotone" dataKey="receipt" name="Receipt" stroke="#12B76A" strokeWidth={2} dot={{ strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="issue" name="Issue" stroke="#F04438" strokeWidth={2} dot={{ strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="adjustment" name="Adjustment" stroke="#F79009" strokeWidth={2} dot={{ strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="onhand" name="On-hand" stroke="#465fff" strokeWidth={3} dot={{ strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DailyStockTrend;
