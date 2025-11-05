import React, { useEffect, useState } from "react";
import { salesApi } from "../../../services/api/dashboardApi";
import { DollarLineIcon, BoxIconLine, FileIcon, TimeIcon, ArrowUpIcon } from "../../../icons";

interface SalesOverviewData {
  total_sales_amount: string;
  total_shipments: number;
  total_invoices: number;
  outstanding_invoices: number;
  sales_growth: number;
  period: string;
}

const SalesOverviewKPI: React.FC = () => {
  const [data, setData] = useState<SalesOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await salesApi.getSalesOverview("ytd");
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const metrics = [
    {
      id: 1,
      title: "Total Sales Amount",
      value: formatCurrency(parseFloat(data.total_sales_amount)),
      icon: DollarLineIcon,
      bgColor: "bg-brand-50 dark:bg-brand-500/10",
      iconColor: "text-brand-500",
    },
    {
      id: 2,
      title: "Total Shipments",
      value: data.total_shipments.toLocaleString(),
      icon: BoxIconLine,
      bgColor: "bg-blue-light-50 dark:bg-blue-light-500/10",
      iconColor: "text-blue-light-500",
    },
    {
      id: 3,
      title: "Total Invoices",
      value: data.total_invoices.toLocaleString(),
      icon: FileIcon,
      bgColor: "bg-success-50 dark:bg-success-500/10",
      iconColor: "text-success-500",
    },
    {
      id: 4,
      title: "Outstanding Invoices",
      value: data.outstanding_invoices.toLocaleString(),
      icon: TimeIcon,
      bgColor: "bg-warning-50 dark:bg-warning-500/10",
      iconColor: "text-warning-500",
    },
    {
      id: 5,
      title: "Sales Growth",
      value: `${data.sales_growth >= 0 ? '+' : ''}${data.sales_growth.toFixed(2)}%`,
      icon: ArrowUpIcon,
      bgColor: data.sales_growth >= 0 ? "bg-success-50 dark:bg-success-500/10" : "bg-error-50 dark:bg-error-500/10",
      iconColor: data.sales_growth >= 0 ? "text-success-500" : "text-error-500",
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

export default SalesOverviewKPI;
