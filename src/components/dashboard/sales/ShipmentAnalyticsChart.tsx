import React, { useEffect, useState } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { SupplyChainApi } from "../../../services/api/dashboardApi";

interface BarChartData {
  year: number;
  period: number;
  total_delivery: number;
  total_po: number;
}

interface ApiResponse {
  success: boolean;
  data: BarChartData[];
  count: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: {
      period: number;
      year: number;
      [key: string]: unknown;
    };
  }>;
}

const ShipmentAnalyticsChart: React.FC = () => {
  const [data, setData] = useState<BarChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // Fetch available years on component mount
  useEffect(() => {
    const fetchAvailableYears = async () => {
      try {
        const result = await SupplyChainApi.getSalesAnalyticsBarChart({});

        let responseData: BarChartData[] = [];

        if (result && typeof result === "object" && "data" in result) {
          const apiResponse = result as ApiResponse;
          if (Array.isArray(apiResponse.data)) {
            responseData = apiResponse.data;
          }
        }

        if (responseData.length > 0) {
          // Extract unique years and sort them
          const years = Array.from(new Set(responseData.map((item) => item.year))).sort((a, b) => b - a);
          setAvailableYears(years);

          // Get current year
          const currentYear = new Date().getFullYear();
          
          // Set default year to current year if available, otherwise use the latest year
          if (years.includes(currentYear)) {
            setSelectedYear(currentYear);
          } else if (years.length > 0) {
            setSelectedYear(years[0]);
          }
        } else {
          setError("No data available");
        }
      } catch (err) {
        console.error("Error fetching available years:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      }
    };

    fetchAvailableYears();
  }, []);

  // Fetch data based on selected year
  useEffect(() => {
    const fetchDataByYear = async () => {
      if (!selectedYear) return;

      try {
        setLoading(true);
        setError(null);

        const result = await SupplyChainApi.getSalesAnalyticsBarChart({ year: selectedYear });

        let responseData: BarChartData[] = [];

        if (result && typeof result === "object" && "data" in result) {
          const apiResponse = result as ApiResponse;
          if (Array.isArray(apiResponse.data)) {
            responseData = apiResponse.data;
          }
        }

        if (responseData.length > 0) {
          setData(responseData);
          setError(null);
        } else {
          setData([]);
          setError("No data available for selected year");
        }
      } catch (err) {
        console.error("Error fetching sales analytics bar chart:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDataByYear();
  }, [selectedYear]);

  // Format period to month name
  const formatPeriod = (period: number): string => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[period - 1] || `Month ${period}`;
  };

  // Prepare chart data
  const chartData = data.map((item: BarChartData) => ({
    period: formatPeriod(item.period),
    "Total Delivery": item.total_delivery,
    "Total PO": item.total_po,
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">{payload[0].payload.period}</p>
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
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Shipment Analytics</h3>
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
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Shipment Analytics</h3>
        </div>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">No data available for selected year</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Shipment Analytics</h3>

        <div className="flex gap-3 items-center">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Year:</label>
          <select
            value={selectedYear || ""}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <ResponsiveContainer width="100%" height={450}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="period" stroke="#9ca3af" tick={{ fill: "#6b7280", fontSize: 12 }} tickLine={false} axisLine={false} />
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

export default ShipmentAnalyticsChart;