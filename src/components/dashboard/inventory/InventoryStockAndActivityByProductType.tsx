import React, { useEffect, useState } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { inventoryRevApi } from "../../../services/api/dashboardApi";
import { WarehouseFilterRequestParams } from "../../../context/WarehouseFilterContext";

interface ProductTypeData {
  product_type: string;
  sku_count: number;
  total_onhand: number;
  total_safety_stock: number;
  total_available: number;
  trans_count: number;
  total_shipment: number;
  turnover_rate: number;
}

interface InventoryStockAndActivityByProductTypeProps {
  warehouse: string;
  dateFrom?: string;
  dateTo?: string;
  filters?: WarehouseFilterRequestParams;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
    payload: {
      product_type: string;
      [key: string]: unknown;
    };
  }>;
}

const InventoryStockAndActivityByProductType: React.FC<InventoryStockAndActivityByProductTypeProps> = ({ warehouse, dateFrom, dateTo, filters }) => {
  const [data, setData] = useState<ProductTypeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: string; to: string; days: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params: any = {};
        if (filters) {
          params.date_from = filters.date_from;
          params.date_to = filters.date_to;
        } else {
          if (dateFrom) params.date_from = dateFrom;
          if (dateTo) params.date_to = dateTo;
        }
        const result = await inventoryRevApi.getStockAndActivityByProductType(warehouse, params);
        setData(result.data || []);
        setDateRange(result.date_range || null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouse, dateFrom, dateTo, filters]);

  // Prepare chart data
  const chartData = data.map((item: ProductTypeData) => ({
    product_type: item.product_type,
    Onhand: item.total_onhand,
    "Safety Stock": item.total_safety_stock,
    "Trans Count": item.trans_count,
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">{payload[0].payload.product_type}</p>
          {payload.map((entry, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm mb-1">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
              </span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
              </span>
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
          <div className="h-6 bg-gray-200 rounded dark:bg-gray-800 w-64 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded dark:bg-gray-800"></div>
        </div>
      </div>
    );
  }

  if (error || !chartData || chartData.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Stock & Activity by Product Type</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-1">Stock & Activity by Product Type</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Inventory levels and transaction metrics across product categories</p>
        </div>
        {dateRange && (
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 font-medium">
              {new Date(dateRange.from).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              })}
              {" - "}
              {new Date(dateRange.to).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg font-medium">{dateRange.days} days</span>
          </div>
        )}
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <ResponsiveContainer width="100%" height={460}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="product_type" 
                stroke="#9ca3af" 
                tick={{ fill: "#6b7280", fontSize: 12 }} 
                tickLine={false} 
                axisLine={false} 
                angle={-45} 
                textAnchor="end" 
                height={80} 
              />
              <YAxis
                yAxisId="left"
                stroke="#9ca3af"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                  return value.toLocaleString();
                }}
                label={{
                  value: "Stock Quantity",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#6b7280", fontSize: 12 },
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#9ca3af"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                  return value.toLocaleString();
                }}
                label={{
                  value: "Activity Metrics",
                  angle: 90,
                  position: "insideRight",
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
              <Bar yAxisId="left" dataKey="Onhand" fill="#10B981" name="Onhand" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="Safety Stock" fill="#F59E0B" name="Safety Stock" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" dataKey="Trans Count" stroke="#465fff" name="Trans Count" strokeWidth={2} dot={false} />

            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default InventoryStockAndActivityByProductType;
