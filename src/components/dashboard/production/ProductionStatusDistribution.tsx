import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { productionApi } from "../../../services/api/dashboardApi";

interface StatusData {
  status: string;
  count: number;
  percentage: number;
}

const ProductionStatusDistribution: React.FC = () => {
  const [data, setData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await productionApi.getProductionStatusDistribution();
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

  // Ensure data is an array before mapping
  const series = Array.isArray(data) ? data.map((item) => item.count) : [];
  const labels = Array.isArray(data) ? data.map((item) => item.status) : [];

  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#F04438", "#5925DC", "#F79009", "#027A48", "#12B76A", "#465FFF"],
    labels: labels,
    stroke: {
      show: false,
      width: 0,
    },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "14px",
      itemMargin: {
        horizontal: 8,
        vertical: 4,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontWeight: 500,
            },
            value: {
              show: true,
              fontSize: "22px",
              fontWeight: 700,
              formatter: (val) => {
                return Number(val).toLocaleString();
              },
            },
            total: {
              show: true,
              label: "Total Orders",
              fontSize: "14px",
              fontWeight: 500,
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce(
                  (a: number, b: number) => a + b,
                  0
                );
                return total.toLocaleString();
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    tooltip: {
      y: {
        formatter: (val) => {
          const total = series.reduce((a, b) => a + b, 0);
          const percentage = ((val / total) * 100).toFixed(1);
          return `${val.toLocaleString()} (${percentage}%)`;
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">
            Production Status Distribution
          </h3>
        </div>
        <div className="flex justify-center items-center h-[300px]">
          <div className="animate-pulse">
            <div className="w-[250px] h-[250px] bg-gray-200 rounded-full dark:bg-gray-800"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data.length) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">
            Production Status Distribution
          </h3>
        </div>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400 text-sm">
            {error || "No data available"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">
          Production Status Distribution
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Production orders by status
        </p>
      </div>
      <div>
        <ReactApexChart
          options={options}
          series={series}
          type="donut"
          height={350}
        />
      </div>
    </div>
  );
};

export default ProductionStatusDistribution;