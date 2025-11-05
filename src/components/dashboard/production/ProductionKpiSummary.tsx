import React, { useEffect, useState } from "react";
import { productionApi } from "../../../services/api/dashboardApi";
import { BoxIconLine, CheckCircleIcon, TimeIcon, AlertIcon, PieChartIcon } from "../../../icons";

interface ProductionKpiData {
  total_production_orders: number;
  total_qty_ordered: number;
  total_qty_delivered: number;
  total_outstanding_qty: number;
  completion_rate: number;
}

const ProductionKpiSummary: React.FC = () => {
  const [data, setData] = useState<ProductionKpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await productionApi.getProductionKpiSummary();
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
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
      title: "Total Production Orders",
      value: (data.total_production_orders || 0).toLocaleString(),
      icon: BoxIconLine,
      bgColor: "bg-brand-50 dark:bg-brand-500/10",
      iconColor: "text-brand-500",
    },
    {
      id: 2,
      title: "Total Qty Ordered",
      value: (data.total_qty_ordered || 0).toLocaleString(),
      icon: TimeIcon,
      bgColor: "bg-blue-light-50 dark:bg-blue-light-500/10",
      iconColor: "text-blue-light-500",
    },
    {
      id: 3,
      title: "Total Qty Delivered",
      value: (data.total_qty_delivered || 0).toLocaleString(),
      icon: CheckCircleIcon,
      bgColor: "bg-success-50 dark:bg-success-500/10",
      iconColor: "text-success-500",
    },
    {
      id: 4,
      title: "Outstanding Qty",
      value: (data.total_outstanding_qty || 0).toLocaleString(),
      icon: AlertIcon,
      bgColor: "bg-orange-50 dark:bg-orange-500/10",
      iconColor: "text-orange-500",
    },
    {
      id: 5,
      title: "Completion Rate",
      value: `${(data.completion_rate || 0).toFixed(1)}%`,
      icon: PieChartIcon,
      bgColor: "bg-success-50 dark:bg-success-500/10",
      iconColor: "text-success-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-5">
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

export default ProductionKpiSummary;
