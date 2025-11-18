import React, { useEffect, useState } from "react";
import { inventoryRevApi } from "../../../services/api/dashboardApi";
import { BoxIconLine, AlertIcon, ArrowUpIcon, BoxIcon, AngleUpIcon, TimeIcon } from "../../../icons";

interface KpiData {
  total_sku: number;
  total_onhand: number;
  critical_items: number;
  trans_in_period: number;
  net_movement: number;
  date_range: {
    from: string;
    to: string;
    days: number;
  };
}

interface InventoryKpiCardsProps {
  warehouse: string;
  dateFrom?: string;
  dateTo?: string;
}

const InventoryKpiCards: React.FC<InventoryKpiCardsProps> = ({ warehouse, dateFrom, dateTo }) => {
  const [data, setData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params: any = {};
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        const result = await inventoryRevApi.getKpi(warehouse, params);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouse, dateFrom, dateTo]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
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

  const formatDateRange = () => {
    if (!data.date_range) return "";
    const from = new Date(data.date_range.from).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    const to = new Date(data.date_range.to).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    return `${from} - ${to}`;
  };

  const metrics = [
    {
      id: 1,
      title: "Total SKU",
      value: data.total_sku.toLocaleString(),
      icon: BoxIcon,
      bgColor: "bg-brand-50 dark:bg-brand-500/10",
      iconColor: "text-brand-500",
    },
    {
      id: 2,
      title: "Total Onhand",
      value: data.total_onhand.toLocaleString(),
      icon: BoxIconLine,
      bgColor: "bg-success-50 dark:bg-success-500/10",
      iconColor: "text-success-500",
    },
    {
      id: 3,
      title: "Critical Items",
      value: data.critical_items.toLocaleString(),
      icon: AlertIcon,
      bgColor: data.critical_items > 0 ? "bg-error-50 dark:bg-error-500/10" : "bg-warning-50 dark:bg-warning-500/10",
      iconColor: data.critical_items > 0 ? "text-error-500" : "text-warning-500",
    },
    {
      id: 4,
      title: "Today's Transactions",
      value: data.trans_in_period.toLocaleString(),
      icon: TimeIcon,
      bgColor: "bg-blue-light-50 dark:bg-blue-light-500/10",
      iconColor: "text-blue-light-500",
    },
    {
      id: 5,
      title: "Net Movement (30d)",
      value: data.net_movement >= 0 ? `+${data.net_movement.toLocaleString()}` : data.net_movement.toLocaleString(),
      icon: data.net_movement >= 0 ? ArrowUpIcon : AngleUpIcon,
      bgColor: data.net_movement >= 0 ? "bg-success-50 dark:bg-success-500/10" : "bg-error-50 dark:bg-error-500/10",
      iconColor: data.net_movement >= 0 ? "text-success-500" : "text-error-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-5">
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

export default InventoryKpiCards;
