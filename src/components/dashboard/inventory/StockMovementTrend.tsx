import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { inventoryApi } from "../../../services/api/dashboardApi";

interface TrendDataItem {
  period: string;
  total_onhand: string | number;
  total_receipt: string | number;
  total_issue: string | number;
  warehouse_count: number;
}

interface StockMovementAPIResponse {
  trend_data?: TrendDataItem[];
  date_range?: {
    date_from: string;
    date_to: string;
  };
  period?: string;
  granularity?: string;
}

interface ChartDataPoint {
  period: string;
  onhand: number;
  receipt: number;
  issue: number;
}

const StockMovementTrend: React.FC = () => {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedWarehouse] = useState<string>("all");
  const [selectedProductType] = useState<string>("all");
  const [selectedPeriod] = useState<string>("monthly");
  const [selectedMonth] = useState<string>("");
  const [selectedYear] = useState<string>(new Date().getFullYear().toString());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params: any = {};

        if (selectedWarehouse !== "all") {
          params.warehouse = selectedWarehouse;
        }
        if (selectedProductType !== "all") {
          params.product_type = selectedProductType;
        }
        if (selectedPeriod) {
          params.period = selectedPeriod;
        }
        if (selectedMonth) {
          params.month = selectedMonth;
        }
        if (selectedYear) {
          params.year = selectedYear;
        }

        console.log("Stock Movement Trend - API Params:", params);
        const result: StockMovementAPIResponse = await inventoryApi.getStockMovementTrend(params);
        console.log("Stock Movement Trend - Raw API Response:", result);

        // Handle trend_data from new API format
        let dataArray: ChartDataPoint[] = [];

        if (result?.trend_data && Array.isArray(result.trend_data)) {
          dataArray = result.trend_data.map((item) => ({
            period: item.period,
            onhand: typeof item.total_onhand === "number" ? item.total_onhand : Number(item.total_onhand ?? 0),
            receipt: typeof item.total_receipt === "number" ? item.total_receipt : Number(item.total_receipt ?? 0),
            issue: typeof item.total_issue === "number" ? item.total_issue : Number(item.total_issue ?? 0),
          }));
          console.log("Using trend_data from API");
        }

        console.log("Stock Movement Trend - Processed Data Array:", dataArray);
        console.log("Stock Movement Trend - Data Length:", dataArray.length);

        setData(dataArray);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedWarehouse, selectedProductType, selectedPeriod, selectedMonth, selectedYear]);

  // Format categories for display
  const categories = Array.isArray(data)
    ? data.map((item) => {
        // Format: 2025-12-01 -> Dec 1
        const date = new Date(item.period + "T00:00:00");
        if (isNaN(date.getTime())) {
          return item.period; // Fallback if date is invalid
        }
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      })
    : [];

  const series = [
    {
      name: "On-hand",
      data: Array.isArray(data) ? data.map((item) => item.onhand) : [],
    },
    {
      name: "Receipt",
      data: Array.isArray(data) ? data.map((item) => item.receipt) : [],
    },
    {
      name: "Issue",
      data: Array.isArray(data) ? data.map((item) => item.issue) : [],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "area",
      fontFamily: "Outfit, sans-serif",
      stacked: true,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    colors: ["#465FFF", "#12B76A", "#F04438"],
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
    yaxis: {
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
  };

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
          <p className="text-error-600 dark:text-error-400 text-sm font-medium mb-2">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Stock Movement Trend</h3>
        {/* {apiMessage && (
          <div className="mt-2 rounded-lg border border-warning-200 bg-warning-50 px-3 py-2 dark:border-warning-800 dark:bg-warning-900/20">
            <p className="text-warning-700 dark:text-warning-300 text-xs">
              ℹ️ {apiMessage}
            </p>
          </div>
        )} */}
      </div>

      {/* Chart */}
      <div>
        <ReactApexChart options={options} series={series} type="area" height={400} />
      </div>
    </div>
  );
};

export default StockMovementTrend;
