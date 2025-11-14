import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { salesApi } from "../../../services/api/dashboardApi";

interface DeliveryPerformanceData {
  on_time_delivery_rate: number;
  early_delivery_percentage: number;
  on_time_delivery_percentage: number;
  late_delivery_percentage: number;
  total_deliveries: number;
  target: number;
}

const DeliveryPerformance: React.FC = () => {
  const [data, setData] = useState<DeliveryPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await salesApi.getDeliveryPerformance();
        // Handle if API returns wrapped data { data: {...} } or direct object
        const dataObj = result?.data || result;
        setData(dataObj);
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
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded dark:bg-gray-800 w-48 mb-6"></div>
          <div className="h-80 bg-gray-200 rounded dark:bg-gray-800"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Delivery Performance
        </h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">
            {error || "No data available"}
          </p>
        </div>
      </div>
    );
  }

  const getColor = (rate: number | undefined) => {
    const safeRate = rate || 0;
    if (safeRate >= 95) return "#12B76A";
    if (safeRate >= 85) return "#FDB022";
    return "#F04438";
  };

  const options: ApexOptions = {
    chart: {
      type: "radialBar",
      fontFamily: "Outfit, sans-serif",
      height: 300,
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          margin: 0,
          size: "70%",
          background: "transparent",
        },
        track: {
          background: "#f0f0f0",
          strokeWidth: "100%",
          margin: 0,
        },
        dataLabels: {
          show: true,
          name: {
            offsetY: -10,
            show: true,
            color: "#888",
            fontSize: "14px",
            fontFamily: "Outfit",
          },
          value: {
            formatter: (val: number) => `${val.toFixed(1)}%`,
            color: "#111",
            fontSize: "36px",
            fontWeight: 600,
            show: true,
            offsetY: 5,
          },
        },
      },
    },
    fill: {
      colors: [getColor(data.on_time_delivery_rate)],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["On-Time Delivery"],
  };

  const series = [data.on_time_delivery_rate || 0];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Delivery Performance
        </h3>
      </div>

      <div className="flex justify-center">
        <Chart options={options} series={series} type="radialBar" height={300} />
      </div>

      <div className="mt-10 grid grid-cols-3 gap-4">
        <div className="text-center p-4 rounded-lg bg-success-50 dark:bg-success-900/20">
          <p className="text-sm text-gray-500 dark:text-gray-400">Early</p>
          <p className="mt-1 text-xl font-bold text-success-600 dark:text-success-400">
            {(data.early_delivery_percentage || 0).toFixed(1)}%
          </p>
        </div>
        <div className="text-center p-4 rounded-lg bg-brand-50 dark:bg-brand-900/20">
          <p className="text-sm text-gray-500 dark:text-gray-400">On-Time</p>
          <p className="mt-1 text-xl font-bold text-brand-600 dark:text-brand-400">
            {(data.on_time_delivery_percentage || 0).toFixed(1)}%
          </p>
        </div>
        <div className="text-center p-4 rounded-lg bg-error-50 dark:bg-error-900/20">
          <p className="text-sm text-gray-500 dark:text-gray-400">Late</p>
          <p className="mt-1 text-xl font-bold text-error-600 dark:text-error-400">
            {(data.late_delivery_percentage || 0).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">Target Rate</span>
          <span className="text-sm font-medium text-gray-800 dark:text-white/90">
            {data.target || 0}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Total Deliveries</span>
          <span className="text-sm font-medium text-gray-800 dark:text-white/90">
            {(data.total_deliveries || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPerformance;
