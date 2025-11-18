import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { inventoryRevApi } from "../../../services/api/dashboardApi";

interface TrendDataPoint {
  date: string;
  total_receipt: number;
  total_shipment: number;
  net_movement: number;
  trans_count: number;
}

interface InventoryStockMovementTrendProps {
  warehouse: string;
  dateFrom?: string;
  dateTo?: string;
}

const InventoryStockMovementTrend: React.FC<InventoryStockMovementTrendProps> = ({ warehouse, dateFrom, dateTo }) => {
  const [data, setData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTotalOnhand, setCurrentTotalOnhand] = useState<number>(0);
  const [dateRange, setDateRange] = useState<{ from: string; to: string; days: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params: { date_from?: string; date_to?: string } = {};
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        const result = await inventoryRevApi.getStockMovementTrend(warehouse, params);
        setData(result.trend_data || []);
        setCurrentTotalOnhand(result.current_total_onhand || 0);
        setDateRange(result.date_range || null);
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
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Stock Movement Trend</h3>
        </div>
        <div className="flex justify-center items-center h-[400px] animate-pulse">
          <div className="w-full h-full bg-gray-200 rounded dark:bg-gray-800"></div>
        </div>
      </div>
    );
  }

  if (error || !data.length) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Stock Movement Trend</h3>
        </div>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400 text-sm font-medium">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  const categories = data.map((item) => {
    const date = new Date(item.date);
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  });

  const options: ApexOptions = {
    chart: {
      type: "area",
      fontFamily: "Outfit, sans-serif",
      stacked: false,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    colors: ["#12B76A", "#F04438", "#465FFF"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.6,
        opacityTo: 0.2,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          fontSize: "12px",
        },
        rotate: -45,
        rotateAlways: false,
      },
    },
    yaxis: [
      {
        title: {
          text: "Quantity",
          style: {
            fontSize: "14px",
            fontWeight: 500,
          },
        },
        labels: {
          formatter: (val) => {
            return val.toLocaleString();
          },
        },
      },
      {
        opposite: true,
        title: {
          text: "Net Movement",
          style: {
            fontSize: "14px",
            fontWeight: 500,
          },
        },
        labels: {
          formatter: (val) => {
            return val.toLocaleString();
          },
        },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val) => {
          return val.toLocaleString() + " units";
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "14px",
      itemMargin: {
        horizontal: 12,
      },
    },
    grid: {
      borderColor: "#E4E7EC",
    },
    annotations: {
      yaxis: [
        {
          y: currentTotalOnhand,
          borderColor: "#6B7280",
          borderWidth: 2,
          strokeDashArray: 5,
          label: {
            text: `Current Onhand: ${currentTotalOnhand.toLocaleString()}`,
            style: {
              color: "#6B7280",
              fontSize: "12px",
            },
            position: "right",
          },
        },
      ],
    },
  };

  const series = [
    {
      name: "Receipt",
      data: data.map((item) => item.total_receipt),
    },
    {
      name: "Shipment",
      data: data.map((item) => item.total_shipment),
    },
    {
      name: "Net Movement",
      type: "line",
      data: data.map((item) => item.net_movement),
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Stock Movement Trend</h3>
        {dateRange && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(dateRange.from).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - {new Date(dateRange.to).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} ({dateRange.days} days)
          </span>
        )}
      </div>
      <ReactApexChart options={options} series={series} type="area" height={400} />
    </div>
  );
};

export default InventoryStockMovementTrend;
