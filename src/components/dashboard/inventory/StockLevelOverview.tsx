import React, { useEffect, useState } from "react";
import { inventoryApi } from "../../../services/api/dashboardApi";
import { BoxIconLine, AlertIcon, BoxIcon, AngleUpIcon } from "../../../icons";
import { InventoryFilterRequestParams, inventoryFiltersToQuery } from "../../../context/InventoryFilterContext";

interface StockLevelData {
  total_onhand: string | number;
  critical_items: number;
  items_above_max_stock: number;
  total_items: number;
  average_stock_level: number;
  snapshot_date?: string | null;
  date_range?: {
    date_from: string;
    date_to: string;
    date_from_carbon: string;
    date_to_carbon: string;
  };
  period?: string;
}

// Helper function to format numbers with comma separators
const formatNumberWithCommas = (num: string | number): string => {
  const numValue = typeof num === "string" ? parseFloat(num) : num;
  return numValue.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 20,
  });
};

interface StockLevelOverviewProps {
  warehouse?: string;
  filters?: InventoryFilterRequestParams;
}

const StockLevelOverview: React.FC<StockLevelOverviewProps> = ({ warehouse, filters }) => {
  const [data, setData] = useState<StockLevelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params: Record<string, string> = { ...(warehouse ? { warehouse } : {}) };
        Object.assign(params, inventoryFiltersToQuery(filters));
        const result = await inventoryApi.getStockLevelOverview(params);
        // Handle if API returns wrapped data { data: {...} } or direct object
        const dataObj = result?.data || result;
        setData(dataObj);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouse, filters]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse">
            <div className="h-12 w-12 bg-gray-200 rounded-xl dark:bg-gray-800"></div>
            <div className="mt-5 space-y-2">
              <div className="h-4 bg-gray-200 rounded dark:bg-gray-800 w-20"></div>
              <div className="h-8 bg-gray-200 rounded dark:bg-gray-800 w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-error-200 bg-error-50 p-5 dark:border-error-800 dark:bg-error-900/20">
        <p className="text-error-600 dark:text-error-400">{error || "Failed to load data"}</p>
      </div>
    );
  }

  const metrics = [
    {
      id: 1,
      title: "Total Onhand",
      value: formatNumberWithCommas(data.total_onhand),
      icon: BoxIconLine,
      bgColor: "bg-brand-50 dark:bg-brand-500/10",
      iconColor: "text-brand-500",
    },
    {
      id: 2,
      title: "Critical Items",
      value: data.critical_items.toLocaleString(),
      icon: AlertIcon,
      bgColor: "bg-error-50 dark:bg-error-500/10",
      iconColor: "text-error-500",
    },
    {
      id: 3,
      title: "Above Max Stock",
      value: data.items_above_max_stock.toLocaleString(),
      icon: AngleUpIcon,
      bgColor: "bg-blue-light-50 dark:bg-blue-light-500/10",
      iconColor: "text-blue-light-500",
    },
    {
      id: 4,
      title: "Total Items",
      value: data.total_items.toLocaleString(),
      icon: BoxIcon,
      bgColor: "bg-success-50 dark:bg-success-500/10",
      iconColor: "text-success-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
      {metrics.map((metric) => {
        const IconComponent = metric.icon;
        return (
          <div key={metric.id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${metric.bgColor}`}>
              <IconComponent className={`size-6 ${metric.iconColor}`} />
            </div>

            <div className="mt-5">
              <span className="text-sm text-gray-500 dark:text-gray-400">{metric.title}</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{metric.value}</h4>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StockLevelOverview;
