import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { warehouseApi } from "../../../services/api/dashboardApi";

interface DeliveryPerformanceData {
  on_time_delivery_rate: number;
  target_rate: number;
  early_deliveries: number;
  on_time_deliveries: number;
  late_deliveries: number;
  total_orders: number;
  performance_status: string;
}

const DeliveryPerformance: React.FC = () => {
  const [data, setData] = useState<DeliveryPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await warehouseApi.getDeliveryPerformance();
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

  // Determine color based on performance
  const getColor = () => {
    if (data.on_time_delivery_rate >= 95) return "#12B76A"; // Green - Excellent
    if (data.on_time_delivery_rate >= 85) return "#FDB022"; // Orange - Good
    return "#F04438"; // Red - Needs Improvement
  };

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 350,
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
          background: "#f2f4f7",
          strokeWidth: "100%",
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: "16px",
            fontFamily: "Outfit",
            fontWeight: 600,
            offsetY: -10,
          },
          value: {
            show: true,
            fontSize: "36px",
            fontFamily: "Outfit",
            fontWeight: 700,
            offsetY: 10,
            formatter: (val: number) => `${val.toFixed(1)}%`,
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: [getColor()],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["On-Time Delivery"],
  };

  const series = [data.on_time_delivery_rate];

  const getStatusBadge = () => {
    if (data.performance_status === "excellent") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400">
          Excellent
        </span>
      );
    } else if (data.performance_status === "good") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400">
          Good
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-error-50 text-error-700 dark:bg-error-900/20 dark:text-error-400">
          Needs Improvement
        </span>
      );
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Delivery Performance
        </h3>
        {getStatusBadge()}
      </div>
      
      <div>
        <Chart options={options} series={series} type="radialBar" height={300} />
      </div>

      <div className="mt-10 grid grid-cols-3 gap-4">
        <div className="text-center p-4 rounded-lg bg-success-50 dark:bg-success-900/20">
          <p className="text-sm text-gray-500 dark:text-gray-400">Early</p>
          <p className="mt-1 text-xl font-bold text-success-600 dark:text-success-400">
            {data.early_deliveries.toLocaleString()}
          </p>
        </div>
        <div className="text-center p-4 rounded-lg bg-brand-50 dark:bg-brand-500/10">
          <p className="text-sm text-gray-500 dark:text-gray-400">On-Time</p>
          <p className="mt-1 text-xl font-bold text-brand-500">
            {data.on_time_deliveries.toLocaleString()}
          </p>
        </div>
        <div className="text-center p-4 rounded-lg bg-error-50 dark:bg-error-900/20">
          <p className="text-sm text-gray-500 dark:text-gray-400">Late</p>
          <p className="mt-1 text-xl font-bold text-error-600 dark:text-error-400">
            {data.late_deliveries.toLocaleString()}
          </p>
        </div>
      </div>

      {/* <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Target Rate</span>
          <span className="text-sm font-medium text-gray-800 dark:text-white/90">
            {data.target_rate}%
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Total Orders</span>
          <span className="text-sm font-medium text-gray-800 dark:text-white/90">
            {data.total_orders.toLocaleString()}
          </span>
        </div>
      </div> */}
    </div>
  );
};

export default DeliveryPerformance;
