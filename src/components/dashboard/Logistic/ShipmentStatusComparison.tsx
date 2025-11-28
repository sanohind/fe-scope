import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { SupplyChainApi } from "../../../services/api/dashboardApi";

interface ShipmentStatusData {
  period: string;
  total_shipment: number;
  approved_count: number;
  released_count: number;
  invoiced_count: number;
  processed_count: number;
}

interface ApiResponse {
  data: ShipmentStatusData[];
  filter_metadata?: {
    period: string;
    date_field: string;
    date_from: string | null;
    date_to: string | null;
  };
}

type PeriodType = "daily" | "monthly";

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

const ShipmentStatusBarChart: React.FC = () => {
  const [data, setData] = useState<ShipmentStatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodType>("monthly");

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Calculate date_from and date_to based on period
        // Build params object, only include date_from and date_to if they have values
        const params: { period: string; date_from?: string; date_to?: string } = {
          period,
        };

        if (period === "daily") {
          // For daily period, set date range for the selected month
          const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
          const lastDay = new Date(selectedYear, selectedMonth, 0);

          params.date_from = firstDay.toISOString().split("T")[0]; // Format: YYYY-MM-DD
          params.date_to = lastDay.toISOString().split("T")[0]; // Format: YYYY-MM-DD
        }
        // For monthly period, date_from and date_to are not included in params

        const result = await SupplyChainApi.getShipmentStatusComparison(params);

        console.log("API Response:", result); // Debug log

        // Handle different response structures
        let responseData: ShipmentStatusData[] = [];

        if (Array.isArray(result)) {
          // Response is directly an array
          responseData = result;
        } else if (result && typeof result === "object" && "data" in result) {
          // Response has a 'data' property
          const apiResponse = result as ApiResponse;
          if (Array.isArray(apiResponse.data)) {
            responseData = apiResponse.data;
          }
        }

        if (responseData.length > 0) {
          setData(responseData);
          setError(null);
        } else {
          console.warn("No data received from API:", result);
          setData([]);
          setError(null); // Don't show error if data is just empty
        }
      } catch (err) {
        console.error("Error fetching shipment status comparison:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period, selectedMonth, selectedYear]);

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

  const years = [currentDate.getFullYear() - 1, currentDate.getFullYear()];

  // Format period for display
  const formatPeriod = (periodStr: string): string => {
    if (period === "daily") {
      try {
        const date = new Date(periodStr);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }
      } catch {
        // Fallback
      }
      return periodStr;
    } else {
      try {
        const [year, month] = periodStr.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      } catch {
        return periodStr;
      }
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const periodStr = data.period || "";

      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">{period === "daily" ? new Date(periodStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : formatPeriod(periodStr)}</p>
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
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Shipment Status by Period</h3>
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
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Shipment Status by Period</h3>
        </div>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">No data available</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = data.map((item) => ({
    period: item.period,
    "Total Shipment": item.total_shipment,
    Approved: item.approved_count,
    Released: item.released_count,
    Invoiced: item.invoiced_count,
    Processed: item.processed_count,
  }));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Shipment Status by Period</h3>

        <div className="flex gap-3 items-center">
          <div className="flex gap-2">
            <button onClick={() => setPeriod("daily")} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${period === "daily" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300"}`}>
              Daily
            </button>
            <button onClick={() => setPeriod("monthly")} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${period === "monthly" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300"}`}>
              Monthly
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
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="period" stroke="#9ca3af" tick={{ fill: "#6b7280", fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={formatPeriod} />
              <YAxis
                stroke="#9ca3af"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
                label={{
                  value: "Count",
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
              <Bar dataKey="Total Shipment" fill="#465fff" name="Total Shipment" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Approved" fill="#FDB022" name="Approved" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Released" fill="#F04438" name="Released" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Invoiced" fill="#6B7280" name="Invoiced" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Processed" fill="#10B981" name="Processed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ShipmentStatusBarChart;