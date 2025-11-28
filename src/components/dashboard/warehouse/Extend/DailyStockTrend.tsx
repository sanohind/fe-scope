import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { warehouseRevApi } from "../../../../services/api/dashboardApi";

interface DailyStockPoint {
  date: string;
  onhand: number;
}

interface DailyStockTrendResponse {
  meta?: {
    warehouse?: string;
    from?: string;
    to?: string;
    days?: number;
  };
  data?: Array<{
    date: string;
    onhand: number | string;
  }>;
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

        const result: DailyStockTrendResponse | DailyStockPoint[] = await warehouseRevApi.getDailyStockTrend(warehouse, {
          from: format(from),
          to: format(to),
        });

        const responseData = Array.isArray((result as DailyStockTrendResponse).data) ? (result as DailyStockTrendResponse).data : Array.isArray(result) ? result : [];

        const normalizedData: DailyStockPoint[] = (responseData || []).map((item) => ({
          date: item.date,
          onhand: typeof item.onhand === "number" ? item.onhand : Number(item.onhand ?? 0),
        }));

        setData(normalizedData);
        setMeta((result as DailyStockTrendResponse).meta);
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { payload: dataPoint } = payload[0];
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-800 dark:text-white">{dataPoint.formattedDate}</p>
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">On-hand</p>
          <p className="text-lg font-semibold text-brand-600 dark:text-brand-300">{dataPoint.onhand.toLocaleString()} units</p>
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
            {meta?.warehouse || warehouse} · {months[selectedMonth - 1].label} {selectedYear}
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
              <Line type="monotone" dataKey="onhand" name="On-hand" stroke="#465fff" strokeWidth={3} dot={{ strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DailyStockTrend;
