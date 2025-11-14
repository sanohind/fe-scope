import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { procurementApi } from "../../../services/api/dashboardApi";

interface PriceTrendData {
  item_no: string;
  item_desc: string;
  data: {
    date: string;
    average_price: number;
  }[];
}

const PurchasePriceTrend: React.FC = () => {
  const [data, setData] = useState<PriceTrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await procurementApi.getPurchasePriceTrend({ limit: 10 });
        // Handle if API returns wrapped data or direct array
        const dataArray = Array.isArray(result) ? result : (result?.data || []);
        setData(dataArray);
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
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded dark:bg-gray-800 mb-6"></div>
        <div className="h-96 bg-gray-200 rounded dark:bg-gray-800"></div>
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
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Filter out invalid data
  const validData = Array.isArray(data) ? data.filter((item) => item && item.item_no && Array.isArray(item.data)) : [];
  
  // Get all unique dates
  const allDates = Array.from(
    new Set(validData.flatMap((item) => item.data.map((d) => d.date)))
  ).sort();

  const series = validData.map((item) => ({
    name: `${item.item_no} - ${item.item_desc}`,
    data: allDates.map((date) => {
      const priceData = item.data.find((d) => d.date === date);
      return priceData ? (Number(priceData.average_price) || null) : null;
    }),
  }));

  const options: ApexOptions = {
    chart: {
      type: "line",
      fontFamily: "Outfit, sans-serif",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
    },
    stroke: {
      width: 3,
      curve: "smooth",
    },
    xaxis: {
      categories: allDates.length > 0 ? allDates : ['No Data'],
      labels: {
        style: {
          fontSize: "11px",
        },
        rotate: -45,
        rotateAlways: true,
      },
    },
    yaxis: {
      title: {
        text: "Average Unit Price (IDR)",
        style: {
          fontSize: "12px",
          fontWeight: 500,
        },
      },
      labels: {
        formatter: (val) => {
          if (val >= 1000000) {
            return `${(val / 1000000).toFixed(1)}M`;
          } else if (val >= 1000) {
            return `${(val / 1000).toFixed(1)}K`;
          }
          return val.toFixed(0);
        },
      },
    },
    colors: [
      "#465FFF",
      "#12B76A",
      "#F79009",
      "#F04438",
      "#7A5AF8",
      "#EE46BC",
      "#0BA5EC",
      "#FB6514",
      "#039855",
      "#DC6803",
    ],
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      offsetY: 0,
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val) => (val ? formatCurrency(val) : "N/A"),
      },
    },
    grid: {
      borderColor: "#E4E7EC",
      strokeDashArray: 4,
    },
    markers: {
      size: 4,
      hover: {
        size: 6,
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Purchase Price Trend
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Top 10 items price tracking over time
        </p>
      </div>

      <ReactApexChart options={options} series={series} type="line" height={450} />
    </div>
  );
};

export default PurchasePriceTrend;
