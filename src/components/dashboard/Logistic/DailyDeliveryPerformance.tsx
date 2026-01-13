import React, { useEffect, useState } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { SupplyChainApi } from "../../../services/api/dashboardApi";

interface DailyDeliveryData {
  date: string;
  total_delivery: number;
  total_po: number;
}

interface ApiResponse {
  success: boolean;
  data: DailyDeliveryData[];
  count: number;
  date_from: string;
  date_to: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: {
      date: string;
      [key: string]: unknown;
    };
  }>;
}

const DailyDeliveryPerformance: React.FC = () => {
  const [data, setData] = useState<DailyDeliveryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Calculate date_from and date_to based on selected month and year
        const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
        // Get last day of the month: day 0 of next month = last day of current month
        const nextMonthFirstDay = new Date(selectedYear, selectedMonth, 1);
        const lastDay = new Date(nextMonthFirstDay.getTime() - 1);

        // Format dates as YYYY-MM-DD using local date (not UTC)
        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        const params = {
          date_from: formatDate(firstDay),
          date_to: formatDate(lastDay),
        };

        const result = await SupplyChainApi.getDailyDeliveryPerformance(params);

        console.log("API Response:", result); // Debug log

        // Handle different response structures
        let responseData: DailyDeliveryData[] = [];

        if (result && typeof result === "object" && "data" in result) {
          // Response has a 'data' property
          const apiResponse = result as ApiResponse;
          if (Array.isArray(apiResponse.data)) {
            responseData = apiResponse.data;
          }
        } else if (Array.isArray(result)) {
          // Response is directly an array
          responseData = result;
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
        console.error("Error fetching daily delivery performance:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear]);

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

  const years = [2028, 2027, 2026, 2025, 2024, 2023, 2022, 2021];

  // Format date for display
  const formatDateDisplay = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    } catch {
      // Fallback
    }
    return dateStr;
  };

  // Prepare chart data
  const chartData = data.map((item: DailyDeliveryData) => ({
    date: formatDateDisplay(item.date),
    "Total Delivery": item.total_delivery,
    "Total PO": item.total_po,
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">{payload[0].payload.date}</p>
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
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Daily Delivery Performance</h3>
        </div>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Daily Delivery Performance</h3>
        </div>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Daily Delivery Performance</h3>

        <div className="flex gap-3 items-center">
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
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <ResponsiveContainer width="100%" height={460}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: "#6b7280", fontSize: 12 }} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={50} />
              <YAxis
                stroke="#9ca3af"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
                label={{
                  value: "Quantity",
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
              <Bar dataKey="Total Delivery" fill="#10B981" name="Total Delivery" radius={[4, 4, 0, 0]} />
              <Line dataKey="Total PO" stroke="#465fff" name="Total PO" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DailyDeliveryPerformance;
