import React, { useEffect, useState } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { warehouseRevApi } from "../../../../services/api/dashboardApi";

interface PlanReceiptData {
  period_date: string;
  total_dn_qty: number;
  total_receipt_qty: number;
}

interface ApiResponse {
  data: PlanReceiptData[];
  count: number;
  warehouse: string;
  period: string;
  date_range: {
    from: string;
    to: string;
    days: number;
  };
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: {
      period_date: string;
      [key: string]: unknown;
    };
  }>;
}

interface PlanReceiptChartProps {
  warehouse: string;
  dateFrom?: string;
  dateTo?: string;
}

const PlanReceiptChart: React.FC<PlanReceiptChartProps> = ({ warehouse, dateFrom, dateTo }) => {
  const [data, setData] = useState<PlanReceiptData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine period based on date range
  const determinePeriod = (): "daily" | "monthly" | "yearly" => {
    if (!dateFrom || !dateTo) return "daily";

    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If range is more than 365 days, use yearly
    if (diffDays > 365) return "yearly";
    // If range is more than 90 days, use monthly
    if (diffDays > 90) return "monthly";
    // Otherwise use daily
    return "daily";
  };

  const selectedPeriod = determinePeriod();

  // Fetch data based on date range
  useEffect(() => {
    const fetchData = async () => {
      if (!warehouse) return;

      try {
        setLoading(true);
        setError(null);

        const result = await warehouseRevApi.getPlanReceipt(warehouse, {
          period: selectedPeriod,
          date_from: dateFrom,
          date_to: dateTo,
        });

        let responseData: PlanReceiptData[] = [];

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
          setError("No data available for selected period");
        }
      } catch (err) {
        console.error("Error fetching plan receipt data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouse, selectedPeriod, dateFrom, dateTo]);

  // Format date for display
  const formatDate = (dateStr: string): string => {
    if (selectedPeriod === "daily") {
      // Format: "2025-12-01" -> "1"
      const date = new Date(dateStr);
      return date.getDate().toString();
    } else if (selectedPeriod === "monthly") {
      // Format: "2025-01" -> "Jan"
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const parts = dateStr.split("-");
      const monthIndex = parseInt(parts[1]) - 1;
      return months[monthIndex] || dateStr;
    } else {
      // Format: "2025" -> "2025"
      return dateStr;
    }
  };

  // Prepare chart data
  const chartData = data.map((item: PlanReceiptData) => ({
    date: formatDate(item.period_date),
    period_date: item.period_date,
    "Total Receipt Qty": item.total_receipt_qty,
    "Total DN Qty": item.total_dn_qty,
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">{payload[0].payload.period_date}</p>
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
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Plan Receipt Performance</h3>
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
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Plan Receipt Performance</h3>
        </div>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">No data available for selected period</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Plan Receipt Performance</h3>
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
              <Bar dataKey="Total Receipt Qty" fill="#10B981" name="Total Receipt Qty" radius={[4, 4, 0, 0]} />
              <Line dataKey="Total DN Qty" stroke="#465fff" name="Total DN Qty" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PlanReceiptChart;
