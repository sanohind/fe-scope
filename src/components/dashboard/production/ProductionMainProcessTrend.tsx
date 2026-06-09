import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { productionApi } from "../../../services/api/dashboardApi";

interface TrendData {
  period: string;
  total_qty: number;
  [key: string]: string | number; // For dynamic main process categories
}

interface ProductionMainProcessTrendProps {
  divisi?: string;
  dateFrom?: string;
  dateTo?: string;
  period?: "daily" | "monthly" | "yearly";
}

const COLORS = [
  "#2563EB", // blue
  "#DC2626", // red
  "#16A34A", // green
  "#F59E0B", // amber
  "#7C3AED", // violet
  "#EC4899", // pink
  "#0891B2", // cyan
  "#EA580C", // orange
  "#65A30D", // lime
  "#4F46E5", // indigo
  "#BE123C", // rose
  "#0F766E", // teal
  "#9333EA", // purple
  "#CA8A04", // yellow
  "#334155",  // slate
  "#912a9eff"  // purple 2
];

const ProductionMainProcessTrend: React.FC<ProductionMainProcessTrendProps> = ({ divisi = "ALL", dateFrom, dateTo, period = "daily" }) => {
  const [data, setData] = useState<TrendData[]>([]);
  const [mainProcesses, setMainProcesses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await productionApi.getDailyProductionQtyDetail({
          period,
          date_from: dateFrom,
          date_to: dateTo,
          divisi: divisi !== "ALL" ? divisi : undefined,
        });
        const dataArray = Array.isArray(result) ? result : result?.data || [];
        setData(dataArray);
        setMainProcesses(result?.main_processes || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching Daily Production Qty Detail:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [divisi, dateFrom, dateTo, period]);

  const toNumber = (value: string | number | undefined): number => {
    if (typeof value === "number") return value;
    if (!value) return 0;
    const num = parseFloat(value.toString());
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
        total_qty: toNumber(item.total_qty),
        label,
        formattedDate,
      };

      mainProcesses.forEach((name) => {
        processedItem[name] = toNumber(item[name]);
      });

      return processedItem;
    });
  }, [data, period, mainProcesses]);

  const latestValue = chartData.length ? chartData[chartData.length - 1].total_qty : null;

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-800 dark:text-white mb-2">{dataPoint.formattedDate}</p>
          <div className="space-y-1 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
            {payload.map((entry, index) => {
              if (entry.value > 0) {
                return (
                  <div key={index} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <p className="text-sm text-gray-500 dark:text-gray-300">{entry.name}:</p>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: entry.color }}>
                      {entry.value.toLocaleString()}
                    </p>
                  </div>
                );
              }
              return null;
            })}
          </div>
          <div className="flex items-center justify-between gap-4 pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-300">Total Production:</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {dataPoint.total_qty?.toLocaleString()}
            </p>
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
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Daily Production by Main Process</h3>
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
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Daily Production by Main Process</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {divisi === "ALL" ? "All Divisions" : divisi} · {period === "daily" ? "Daily" : period === "monthly" ? "Monthly" : "Yearly"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {latestValue !== null && (
            <div className="rounded-xl bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-300">
              Today's Production: <span className="text-[#10B981] dark:text-[#10B981]">{latestValue.toLocaleString()}</span>
            </div>
          )}
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
                  value: "Quantity",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#6b7280", fontSize: 12, fontFamily: "Outfit, sans-serif" },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Stacked Bars */}
              {mainProcesses.map((name, index) => (
                <Bar 
                  key={name} 
                  dataKey={name} 
                  name={name} 
                  fill={COLORS[index % COLORS.length]} 
                  stackId="process" 
                  radius={index === mainProcesses.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} 
                  barSize={30} 
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Custom Scrollable Legend */}
      {mainProcesses.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Main Process:</p>
          <div className="max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
            <ul className="flex flex-wrap gap-x-4 gap-y-3 m-0 p-0 list-none">
              {mainProcesses.map((name, index) => (
                <li key={name} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 w-[calc(50%-1rem)] sm:w-[calc(33.33%-1rem)] lg:w-[calc(25%-1rem)]">
                  <span className="w-3 h-3 rounded-sm flex-shrink-0 shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="truncate" title={name}>{name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionMainProcessTrend;
