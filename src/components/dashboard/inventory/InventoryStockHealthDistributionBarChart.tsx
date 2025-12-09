import React, { useEffect, useMemo, useState } from "react";
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { inventoryRevApi } from "../../../services/api/dashboardApi";
import { InventoryFilterRequestParams, inventoryFiltersToQuery } from "../../../context/InventoryFilterContext";

interface StockHealthData {
  stock_status: string;
  item_count: number;
  total_onhand: number;
  trans_count: number;
  total_shipment: number;
}

interface GroupedData {
  date?: string;
  month?: string;
  year?: string;
  data: StockHealthData[];
}

interface ApiResponse {
  data: GroupedData[];
  date_range: {
    from: string;
    to: string;
  };
  period: string;
  grouping: string;
}

type PeriodType = "daily" | "monthly" | "yearly";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: {
      period: string;
      [key: string]: unknown;
    };
  }>;
}

interface InventoryStockHealthDistributionBarChartProps {
  warehouse: string;
  dateFrom?: string;
  dateTo?: string;
  filters?: InventoryFilterRequestParams;
}

const InventoryStockHealthDistributionBarChart: React.FC<InventoryStockHealthDistributionBarChartProps> = ({ warehouse, dateFrom, dateTo, filters }) => {
  const [data, setData] = useState<GroupedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodType>("monthly");

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const shouldUseExternalFilters = Boolean(filters);
  const effectivePeriod = filters?.period ?? period;

  const requestParams = useMemo(() => {
    if (shouldUseExternalFilters) {
      return { ...inventoryFiltersToQuery(filters) };
    }

    const params: { period: string; date_from?: string; date_to?: string } = {
      period,
    };

    if (effectivePeriod === "daily") {
      const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
      const lastDay = new Date(selectedYear, selectedMonth, 0);
      params.date_from = firstDay.toISOString().split("T")[0];
      params.date_to = lastDay.toISOString().split("T")[0];
    } else if (effectivePeriod === "monthly") {
      params.date_from = `${selectedYear}-01-01`;
      params.date_to = `${selectedYear}-12-31`;
    } else {
      const startYear = selectedYear - 1;
      const endYear = selectedYear + 1;
      params.date_from = `${startYear}-01-01`;
      params.date_to = `${endYear}-12-31`;
    }

    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;

    return params;
  }, [filters, shouldUseExternalFilters, period, effectivePeriod, selectedMonth, selectedYear, dateFrom, dateTo]);

  const requestKey = useMemo(() => JSON.stringify(requestParams), [requestParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = shouldUseExternalFilters ? requestParams : { ...requestParams, period: effectivePeriod };
        if (shouldUseExternalFilters) {
          params.period = filters?.period ?? "daily";
        }

        const result: ApiResponse = await inventoryRevApi.getStockHealthDistribution(warehouse, params);

        console.log("API Response:", result); // Debug log

        if (result && result.data && Array.isArray(result.data)) {
          setData(result.data);
          setError(null);
        } else {
          console.warn("No data received from API:", result);
          setData([]);
          setError(null); // Don't show error if data is just empty
        }
      } catch (err) {
        console.error("Error fetching stock health distribution:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouse, requestKey, requestParams, shouldUseExternalFilters, effectivePeriod, filters]);

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

  const years = [currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1];

  // Format period for display
  const formatPeriod = (periodStr: string): string => {
    if (effectivePeriod === "daily") {
      try {
        const date = new Date(periodStr);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }
      } catch {
        // Fallback
      }
      return periodStr;
    } else if (effectivePeriod === "monthly") {
      try {
        const [year, month] = periodStr.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      } catch {
        return periodStr;
      }
    } else {
      // yearly
      return periodStr;
    }
  };

  // Transform data for chart
  const transformChartData = () => {
    const chartData: Array<{
      period: string;
      Critical: number;
      "Low Stock": number;
      Normal: number;
      Overstock: number;
    }> = [];

    data.forEach((groupItem) => {
      const periodKey = groupItem.date || groupItem.month || groupItem.year || "";
      const chartItem: {
        period: string;
        Critical: number;
        "Low Stock": number;
        Normal: number;
        Overstock: number;
      } = {
        period: periodKey,
        Critical: 0,
        "Low Stock": 0,
        Normal: 0,
        Overstock: 0,
      };

      groupItem.data.forEach((statusItem) => {
        const status = statusItem.stock_status;
        if (status === "Critical") {
          chartItem.Critical = statusItem.item_count;
        } else if (status === "Low Stock") {
          chartItem["Low Stock"] = statusItem.item_count;
        } else if (status === "Normal") {
          chartItem.Normal = statusItem.item_count;
        } else if (status === "Overstock") {
          chartItem.Overstock = statusItem.item_count;
        }
      });

      chartData.push(chartItem);
    });

    return chartData.sort((a, b) => a.period.localeCompare(b.period));
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const periodStr = data.period || "";

      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            {effectivePeriod === "daily" ? new Date(periodStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : effectivePeriod === "monthly" ? formatPeriod(periodStr) : periodStr}
          </p>
          {payload.map((entry, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm mb-1">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
              </span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded dark:bg-gray-800 w-48 mb-6"></div>
          <div className="h-80 bg-gray-200 rounded dark:bg-gray-800"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Stock Health Distribution</h3>
        </div>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Stock Health Distribution</h3>
        </div>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">No data available</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = transformChartData();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Stock Health Distribution</h3>

        {!shouldUseExternalFilters && (
          <div className="flex gap-3 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod("daily")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${period === "daily" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300"}`}
              >
                Daily
              </button>
              <button
                onClick={() => setPeriod("monthly")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${period === "monthly" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setPeriod("yearly")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${period === "yearly" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300"}`}
              >
                Yearly
              </button>
            </div>

            {period === "daily" && (
              <>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </>
            )}

            {period === "monthly" && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            )}

            {period === "yearly" && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <ResponsiveContainer width="100%" height={450}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="period" stroke="#9ca3af" tick={{ fill: "#6b7280", fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={formatPeriod} angle={-45} textAnchor="end" height={50} />
              <YAxis
                stroke="#9ca3af"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
                label={{
                  value: "Item Count",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#6b7280", fontSize: 12 },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  fontSize: "14px",
                  paddingTop: "10px",
                }}
                iconType="rect"
              />
              <Bar dataKey="Critical" fill="#DC3545" name="Critical" stackId="health" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Low Stock" fill="#FD7E14" name="Low Stock" stackId="health" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Normal" fill="#28A745" name="Normal" stackId="health" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Overstock" fill="#007BFF" name="Overstock" stackId="health" radius={[4, 4, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default InventoryStockHealthDistributionBarChart;
