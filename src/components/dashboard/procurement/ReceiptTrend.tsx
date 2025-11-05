import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { procurementApi } from "../../../services/api/dashboardApi";

interface ReceiptTrendData {
  date: string;
  receipt_amount: number;
  receipt_count: number;
}

const ReceiptTrend: React.FC = () => {
  const [data, setData] = useState<ReceiptTrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("monthly");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await procurementApi.getReceiptTrend({ period });
        const dataArray = Array.isArray(result) ? result : [];
        setData(dataArray);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded dark:bg-gray-800 mb-6"></div>
        <div className="h-80 bg-gray-200 rounded dark:bg-gray-800"></div>
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-error-200 bg-error-50 p-5 dark:border-error-800 dark:bg-error-900/20">
        <p className="text-error-600 dark:text-error-400">
          {error || "No data available"}
        </p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    } else if (absValue >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (absValue >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  };

  const categories = data.map((item) => item.date);
  const amountSeries = data.map((item) => item.receipt_amount);
  const countSeries = data.map((item) => item.receipt_count);

  const options: ApexOptions = {
    chart: {
      type: "line",
      fontFamily: "Outfit, sans-serif",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
    },
    stroke: {
      width: [0, 3],
      curve: "smooth",
    },
    fill: {
      type: ["gradient", "solid"],
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.5,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 100],
      },
    },
    colors: ["#465FFF", "#FB6514"],
    xaxis: {
      categories: categories,
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: [
      {
        title: {
          text: "Receipt Amount (IDR)",
          style: {
            fontSize: "12px",
            fontWeight: 500,
          },
        },
        labels: {
          formatter: (val) => formatCurrency(val),
        },
      },
      {
        opposite: true,
        title: {
          text: "Receipt Count",
          style: {
            fontSize: "12px",
            fontWeight: 500,
          },
        },
        labels: {
          formatter: (val) => val.toFixed(0),
        },
      },
    ],
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
    grid: {
      borderColor: "#E4E7EC",
      strokeDashArray: 4,
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: [
        {
          formatter: (val) => {
            return new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(val);
          },
        },
        {
          formatter: (val) => `${val.toFixed(0)} receipts`,
        },
      ],
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Receipt Trend
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Receipt volume and amount over time
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod("daily")}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
              period === "daily"
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setPeriod("weekly")}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
              period === "weekly"
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setPeriod("monthly")}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
              period === "monthly"
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      <ReactApexChart
        options={options}
        series={[
          {
            name: "Receipt Amount",
            type: "area",
            data: amountSeries,
          },
          {
            name: "Receipt Count",
            type: "line",
            data: countSeries,
          },
        ]}
        type="line"
        height={350}
      />
    </div>
  );
};

export default ReceiptTrend;
