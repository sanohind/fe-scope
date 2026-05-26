import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { productionApi } from "../../../services/api/dashboardApi";

interface TrendData {
  period: string;
  total_duration_minutes: number;
  total_count: number;
  [key: string]: string | number; // For dynamic causes
}

interface BreakdownCauseDistributionChartProps {
  divisi?: string;
  dateFrom?: string;
  dateTo?: string;
  period?: "daily" | "monthly" | "yearly";
  metric?: "duration" | "count";
}

const COLORS = [
  "#465FFF", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", 
  "#EC4899", "#14B8A6", "#F97316", "#06B6D4", "#6366F1", 
  "#84CC16", "#D946EF", "#EAB308", "#22C55E", "#3B82F6"
];

const BreakdownCauseDistributionChart: React.FC<BreakdownCauseDistributionChartProps> = ({ 
  divisi = "ALL", 
  dateFrom, 
  dateTo, 
  period = "daily",
  metric = "duration" 
}) => {
  const [data, setData] = useState<TrendData[]>([]);
  const [causes, setCauses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await productionApi.getBreakdownCauseDistribution({
          period,
          date_from: dateFrom,
          date_to: dateTo,
          divisi: divisi !== "ALL" ? divisi : undefined,
          metric,
        });
        setData(result?.data || []);
        setCauses(result?.causes || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching Breakdown Cause Distribution:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [divisi, dateFrom, dateTo, period, metric]);

  const toNumber = (value: string | number | undefined): number => {
    if (typeof value === "number") return value;
    if (!value) return 0;
    const num = parseFloat(value?.toString() || "0");
    return isNaN(num) ? 0 : num;
  };

  const chartData = useMemo(() => {
    return data.map((item) => {
      let label = "";
      let formattedDate = "";

      if (period === "daily") {
        const dateObj = new Date(item.period);
        label = isNaN(dateObj.getTime()) ? item.period : dateObj.toLocaleDateString("en-US", { day: "numeric" });
        formattedDate = isNaN(dateObj.getTime()) ? item.period : dateObj.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
      } else if (period === "monthly") {
        const parts = item.period.split("-");
        if (parts.length === 2) {
          const [year, month] = parts;
          const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
          label = isNaN(dateObj.getTime()) ? item.period : dateObj.toLocaleDateString("en-US", { month: "short" });
          formattedDate = isNaN(dateObj.getTime()) ? item.period : dateObj.toLocaleDateString("en-US", { year: "numeric", month: "long" });
        } else {
          label = item.period;
          formattedDate = item.period;
        }
      } else {
        label = item.period;
        formattedDate = item.period;
      }

      const processedItem: any = {
        ...item,
        label,
        formattedDate,
      };

      causes.forEach((cause) => {
        processedItem[cause] = toNumber(item[cause]);
      });

      return processedItem;
    });
  }, [data, period, causes]);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-800 dark:text-white mb-2">{dataPoint.formattedDate}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => {
              if (entry.value > 0) {
                return (
                  <div key={index} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <p className="text-sm text-gray-500 dark:text-gray-300">{entry.name}:</p>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: entry.color }}>
                      {entry.value.toLocaleString()} {metric === "duration" ? "mins" : ""}
                    </p>
                  </div>
                );
              }
              return null;
            })}
            <div className="flex items-center justify-between gap-4 pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-300">Total {metric === "duration" ? "Duration" : "Count"}:</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {metric === "duration" 
                  ? dataPoint.total_duration_minutes?.toLocaleString() + " mins" 
                  : dataPoint.total_count?.toLocaleString()}
              </p>
            </div>
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
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Breakdown Cause Distribution ({metric === "duration" ? "Duration" : "Count"})
          </h3>
        </div>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 text-error-600 dark:border-error-800 dark:bg-error-900/20 dark:text-error-400">
          {error || "No data available"}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Breakdown Cause Distribution ({metric === "duration" ? "Duration" : "Count"})
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {divisi === "ALL" ? "All Divisions" : divisi} · {period === "daily" ? "Daily" : period === "monthly" ? "Monthly" : "Yearly"}
          </p>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" stroke="#9ca3af" tick={{ fill: "#6b7280", fontSize: 12, fontFamily: "Outfit, sans-serif" }} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#9ca3af"
                tick={{ fill: "#6b7280", fontSize: 12, fontFamily: "Outfit, sans-serif" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
                label={{
                  value: metric === "duration" ? "Duration (Mins)" : "Count",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#6b7280", fontSize: 12, fontFamily: "Outfit, sans-serif" },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px", fontFamily: "Outfit, sans-serif", paddingTop: "10px" }} />
              
              {/* Stacked Bars */}
              {causes.map((cause, index) => (
                <Bar 
                  key={cause} 
                  dataKey={cause} 
                  name={cause} 
                  fill={COLORS[index % COLORS.length]} 
                  stackId="cause" 
                  radius={index === causes.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} 
                  barSize={30} 
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default BreakdownCauseDistributionChart;
