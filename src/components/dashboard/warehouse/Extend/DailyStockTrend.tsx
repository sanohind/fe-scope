import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { warehouseRevApi } from "../../../../services/api/dashboardApi";

interface DailyStockPoint {
  date: string;
  onhand: number;
  receipt?: number;
  issue?: number;
}

interface StockDataItem {
  period_start: string;
  period_end: string;
  granularity: string;
  warehouse: string;
  onhand: number | string;
  receipt: number | string;
  issue: number | string;
}

interface DailyStockTrendResponse {
  meta?: {
    warehouse_filter?: string;
    warehouses_queried?: string[];
    period_start_filter?: string | null;
    period_end_filter?: string | null;
    total_records?: number;
  };
  data?: StockDataItem[];
  warehouses?: {
    [warehouseId: string]: {
      data: StockDataItem[];
    };
  };
}

interface DailyStockTrendProps {
  warehouse: string;
}

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 4 }, (_, idx) => currentYear - 1 + idx);

const DailyStockTrend: React.FC<DailyStockTrendProps> = ({ warehouse }) => {
  const [data, setData] = useState<DailyStockPoint[]>([]);
  const [meta, setMeta] = useState<DailyStockTrendResponse["meta"]>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const from = new Date(selectedYear, selectedMonth - 1, 1);
        const to = new Date(selectedYear, selectedMonth, 0);
        const format = (d: Date) => d.toISOString().split("T")[0];

        const result: DailyStockTrendResponse = await warehouseRevApi.getDailyStockTrend(warehouse, {
          from: format(from),
          to: format(to),
        });

        // Extract data from the new nested structure or fallback to old format
        let responseData: StockDataItem[] = [];
        const normalizedWarehouse = warehouse?.toUpperCase();

        if (result?.warehouses) {
          if (normalizedWarehouse && normalizedWarehouse !== "ALL") {
            const exactMatch = result.warehouses[normalizedWarehouse];
            if (exactMatch?.data) {
              responseData = exactMatch.data;
            } else {
              const fallbackKey = Object.keys(result.warehouses).find((key) => key.toLowerCase() === normalizedWarehouse.toLowerCase());
              responseData = fallbackKey ? result.warehouses[fallbackKey].data || [] : [];
            }
          } else {
            responseData = Object.values(result.warehouses).flatMap((entry) => entry.data || []);
          }
        } else if (result?.data) {
          // Fallback to old format
          responseData = result.data;
        }

        // Filter data to only include five-minute granularity records
        const filteredData = responseData.filter((item) => item.granularity === "five-minute");

        const normalizedData: DailyStockPoint[] = filteredData.map((item) => {
          // Extract date from period_start (format: "2025-11-28 11:25:00")
          const dateStr = item.period_start.split(" ")[0];
          return {
            date: dateStr,
            onhand: typeof item.onhand === "number" ? item.onhand : Number(item.onhand ?? 0),
            receipt: typeof item.receipt === "number" ? item.receipt : Number(item.receipt ?? 0),
            issue: typeof item.issue === "number" ? item.issue : Number(item.issue ?? 0),
          };
        });

        setData(normalizedData);
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
  }, [warehouse, selectedMonth, selectedYear]);

  const chartData = useMemo(() => {
    return data
      .map((item) => {
        const dateObj = new Date(item.date);
        return {
          ...item,
          label: dateObj.toLocaleDateString("en-US", { day: "numeric" }),
          formattedDate: dateObj.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
            {dataPoint.receipt !== undefined && (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-300">Receipt:</p>
                <p className="text-sm font-semibold text-success-600 dark:text-success-300">{dataPoint.receipt.toLocaleString()}</p>
              </div>
            )}
            {dataPoint.issue !== undefined && (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-300">Issue:</p>
                <p className="text-sm font-semibold text-error-600 dark:text-error-300">{dataPoint.issue.toLocaleString()}</p>
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
          <div className="flex gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
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
            {meta?.warehouse_filter || warehouse} · {months[selectedMonth - 1].label} {selectedYear}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {latestValue !== null && (
            <div className="rounded-xl bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-300">
              Latest On-hand: <span className="text-brand-600 dark:text-brand-300">{latestValue.toLocaleString()}</span>
            </div>
          )}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
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
              <Line type="monotone" dataKey="receipt" name="Receipt" stroke="#12B76A" strokeWidth={2} dot={{ strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="issue" name="Issue" stroke="#F04438" strokeWidth={2} dot={{ strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="onhand" name="On-hand" stroke="#465fff" strokeWidth={3} dot={{ strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DailyStockTrend;
