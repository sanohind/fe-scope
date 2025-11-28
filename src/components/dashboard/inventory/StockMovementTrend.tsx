import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { inventoryApi } from "../../../services/api/dashboardApi";

interface StockItem {
  partno: string;
  desc: string;
  onhand: string;
  allocated: string;
  available: string;
}

interface StockMovementAPIResponse {
  message?: string;
  current_data?: StockItem[];
  historical_data?: {
    period: string;
    onhand: number;
    allocated: number;
    available: number;
  }[];
  data?: ChartDataPoint[];
  results?: ChartDataPoint[];
}

interface ChartDataPoint {
  period: string;
  onhand: number;
  allocated: number;
  available: number;
}

const StockMovementTrend: React.FC = () => {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiMessage, setApiMessage] = useState<string>("");

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

        // Set API message if present
        if (result.message) {
          setApiMessage(result.message);
        }

        // Handle different response structures
        let dataArray: ChartDataPoint[] = [];

        // Priority 1: Check for historical_data (proper time series)
        if (result?.historical_data && Array.isArray(result.historical_data)) {
          dataArray = result.historical_data;
          console.log("Using historical_data");
        }
        // Priority 2: Transform current_data (snapshot) to aggregated time series
        else if (result?.current_data && Array.isArray(result.current_data)) {
          console.log("Transforming current_data to chart format");
          dataArray = transformCurrentDataToChart(result.current_data);
        }
        // Fallback: Direct array or nested data/results
        else if (Array.isArray(result)) {
          dataArray = result as ChartDataPoint[];
        } else if (result?.data && Array.isArray(result.data)) {
          dataArray = result.data;
        } else if (result?.results && Array.isArray(result.results)) {
          dataArray = result.results;
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

  // Transform current_data snapshot to aggregated chart data
  const transformCurrentDataToChart = (currentData: StockItem[]): ChartDataPoint[] => {
    // Group by partno and aggregate
    const grouped = currentData.reduce((acc, item) => {
      const key = item.partno;
      if (!acc[key]) {
        acc[key] = {
          period: item.desc || item.partno,
          onhand: 0,
          allocated: 0,
          available: 0,
          count: 0,
        };
      }
      acc[key].onhand += parseFloat(item.onhand) || 0;
      acc[key].allocated += parseFloat(item.allocated) || 0;
      acc[key].available += parseFloat(item.available) || 0;
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, { period: string; onhand: number; allocated: number; available: number; count: number }>);

    // Convert to array and take top items
    return Object.values(grouped)
      .map(({ period, onhand, allocated, available }) => ({
        period,
        onhand: Math.round(onhand * 10) / 10,
        allocated: Math.round(allocated * 10) / 10,
        available: Math.round(available * 10) / 10,
      }))
      .sort((a, b) => b.onhand - a.onhand)
      .slice(0, 20); // Limit to top 20 items
  };

  const categories = Array.isArray(data) ? data.map((item) => item.period) : [];
  const series = [
    {
      name: "Onhand",
      data: Array.isArray(data) ? data.map((item) => item.onhand) : [],
    },
    {
      name: "Allocated",
      data: Array.isArray(data) ? data.map((item) => item.allocated) : [],
    },
    {
      name: "Available",
      data: Array.isArray(data) ? data.map((item) => item.available) : [],
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
    colors: ["#465FFF", "#F79009", "#12B76A"],
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
          {apiMessage && <p className="text-warning-600 dark:text-warning-400 text-sm mb-2">ℹ️ {apiMessage}</p>}
          {!error && data.length === 0 && (
            <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">
              API berhasil fetch, tapi data kosong. Pastikan backend mengembalikan data dengan struktur:
              <code className="block mt-1 p-2 bg-white dark:bg-gray-900 rounded text-xs overflow-x-auto">
                {JSON.stringify(
                  {
                    historical_data: [{ period: "2024-01", onhand: 100, allocated: 20, available: 80 }],
                    current_data: [{ partno: "ABC", desc: "Item", onhand: "100", allocated: "20", available: "80" }],
                  },
                  null,
                  2
                )}
              </code>
            </p>
          )}
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
