import React, { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { productionApi } from "../../../services/api/dashboardApi";
import { useTheme } from "../../../context/ThemeContext";

interface TopNgTypeData {
  ng_name: string;
  qty: number;
}

interface ProductionTopNgTypesProps {
  divisi?: string;
  dateFrom?: string;
  dateTo?: string;
  period?: "daily" | "monthly" | "yearly";
}

const ProductionTopNgTypes: React.FC<ProductionTopNgTypesProps> = ({ divisi = "ALL", dateFrom, dateTo, period = "daily" }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const [data, setData] = useState<TopNgTypeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await productionApi.getTopNgType({
          period,
          date_from: dateFrom,
          date_to: dateTo,
          divisi: divisi !== "ALL" ? divisi : undefined,
          limit: 10,
        });
        const dataArray = Array.isArray(result) ? result : result?.data || [];
        setData(dataArray);
        setError(null);
      } catch (err) {
        console.error("Error fetching Top NG Types:", err);
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

  const chartData = data.map((item) => ({
    label: item.ng_name,
    qty: toNumber(item.qty),
  }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    const dataPoint = payload?.[0]?.payload;
    if (active && dataPoint) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-800 dark:text-white mb-2">{dataPoint.label}</p>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-300">Quantity:</p>
            <p className="text-sm font-semibold text-[#F59E0B] dark:text-[#F59E0B]">{dataPoint.qty.toLocaleString()}</p>
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
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Top 10 NG Types (Kelola)</h3>
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
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Top 10 NG Types (Kelola)</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {divisi === "ALL" ? "All Divisions" : divisi} · Top 10 by Quantity
          </p>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[400px]">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart layout="vertical" data={chartData} margin={{ top: 10, right: 30, bottom: 0, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={true} />
              <XAxis 
                type="number" 
                stroke="#9ca3af" 
                tick={{ fill: "#6b7280", fontSize: 12, fontFamily: "Outfit, sans-serif" }} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                type="category" 
                dataKey="label" 
                stroke="#9ca3af" 
                tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "Outfit, sans-serif" }} 
                tickLine={false} 
                axisLine={false}
                width={150}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: isDarkMode ? "#374151" : "#F3F4F6", opacity: 0.4 }} />
              <Legend />
              
              <Bar dataKey="qty" name="Quantity" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProductionTopNgTypes;
