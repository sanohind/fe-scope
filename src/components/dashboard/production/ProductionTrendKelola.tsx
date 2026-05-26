import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { productionApi } from "../../../services/api/dashboardApi";

interface TrendData {
  period: string;
  qty_ok: number;
  qty_ng: number;
  total_qty: number;
  qty_plan?: number;
}

interface ProductionTrendKelolaProps {
  divisi?: string;
  dateFrom?: string;
  dateTo?: string;
  period?: "daily" | "monthly" | "yearly";
}

const ProductionTrendKelola: React.FC<ProductionTrendKelolaProps> = ({ divisi = "ALL", dateFrom, dateTo, period = "daily" }) => {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await productionApi.getDailyProductionQty({
          period,
          date_from: dateFrom,
          date_to: dateTo,
          divisi: divisi !== "ALL" ? divisi : undefined,
        });
        const dataArray = Array.isArray(result) ? result : result?.data || [];
        setData(dataArray);
        setError(null);
      } catch (err) {
        console.error("Error fetching Production Trend Kelola:", err);
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

      return {
        ...item,
        qty_ok: toNumber(item.qty_ok),
        qty_ng: toNumber(item.qty_ng),
        total_qty: toNumber(item.total_qty),
        qty_plan: toNumber(item.qty_plan),
        label,
        formattedDate,
      };
    });
  }, [data, period]);

  const latestValue = chartData.length ? chartData[chartData.length - 1].total_qty : null;

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    const dataPoint = payload?.[0]?.payload;
    if (active && dataPoint) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-800 dark:text-white">{dataPoint.formattedDate}</p>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-300">Qty OK:</p>
              <p className="text-sm font-semibold text-[#10B981] dark:text-[#10B981]">{dataPoint.qty_ok.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-300">Qty NG:</p>
              <p className="text-sm font-semibold text-[#EF4444] dark:text-[#EF4444]">{dataPoint.qty_ng.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-300">Qty Plan:</p>
              <p className="text-sm font-semibold text-[#465FFF] dark:text-[#465FFF]">{dataPoint.qty_plan.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-300">Total Qty:</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{dataPoint.total_qty.toLocaleString()}</p>
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
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Production Achievement (Kelola)</h3>
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
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Production Achievement (Kelola)</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {divisi === "ALL" ? "All Divisions" : divisi} · {period === "daily" ? "Daily" : period === "monthly" ? "Monthly" : "Yearly"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {latestValue !== null && (
            <div className="rounded-xl bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-300">
              Today's Total Qty: <span className="text-gray-800 dark:text-gray-200">{latestValue.toLocaleString()}</span>
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
              <Legend />
              
              {/* Stacked Bars */}
              <Bar dataKey="qty_ok" name="Qty OK" fill="#10B981" stackId="status" radius={[0, 0, 0, 0]} barSize={20} />
              <Bar dataKey="qty_ng" name="Qty NG" fill="#EF4444" stackId="status" radius={[4, 4, 0, 0]} />

              {/* Line for Qty Plan */}
              <Line type="monotone" dataKey="qty_plan" name="Qty Plan" stroke="#465FFF" strokeWidth={3} dot={{ strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProductionTrendKelola;;
