import React, { useEffect, useState } from "react";
import { inventoryApi } from "../../../services/api/dashboardApi";
import { BoxIconLine, AlertIcon, ArrowUpIcon, BoxIcon, AngleUpIcon } from "../../../icons";

interface StockLevelData {
  total_onhand: number;
  items_below_safety_stock: number;
  items_above_max_stock: number;
  total_items: number;
  average_stock_level: number;
}

const StockLevelOverview: React.FC = () => {
  const [data, setData] = useState<StockLevelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await inventoryApi.getStockLevelOverview();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse"
          >
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
        <p className="text-error-600 dark:text-error-400">
          {error || "Failed to load data"}
        </p>
      </div>
    );
  }

  const metrics = [
    {
      id: 1,
      title: "Total Onhand",
      value: data.total_onhand.toLocaleString(),
      icon: BoxIconLine,
      bgColor: "bg-brand-50 dark:bg-brand-500/10",
      iconColor: "text-brand-500",
    },
    {
      id: 2,
      title: "Below Safety Stock",
      value: data.items_below_safety_stock.toLocaleString(),
      icon: AlertIcon,
      bgColor: "bg-warning-50 dark:bg-warning-500/10",
      iconColor: "text-warning-500",
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
          <div
            key={metric.id}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
          >
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-xl ${metric.bgColor}`}
            >
              <IconComponent className={`size-6 ${metric.iconColor}`} />
            </div>

            <div className="mt-5">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {metric.title}
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {metric.value}
              </h4>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StockLevelOverview;
