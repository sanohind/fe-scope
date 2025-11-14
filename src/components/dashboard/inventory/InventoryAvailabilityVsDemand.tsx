import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { inventoryApi } from "../../../services/api/dashboardApi";

interface AvailabilityData {
  warehouse?: string;
  group?: string;
  total_onhand: string | number;
  total_allocated: string | number;
  total_onorder: string | number;
  available_to_promise: string | number;
}

const InventoryAvailabilityVsDemand: React.FC = () => {
  const [data, setData] = useState<AvailabilityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<"warehouse" | "product_group">("warehouse");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await inventoryApi.getInventoryAvailabilityVsDemand(groupBy);
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
  }, [groupBy]);

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

  if (error || !data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Inventory Available to Promise
        </h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">
            {error || "No data available"}
          </p>
        </div>
      </div>
    );
  }

  const categories = data.map((item) => item.warehouse || item.group || "");
  const onhandData = data.map((item) => parseFloat(item.total_onhand.toString()));
  const allocatedData = data.map((item) => parseFloat(item.total_allocated.toString()));
  const onorderData = data.map((item) => parseFloat(item.total_onorder.toString()));
  const availableToPromise = data.map((item) => parseFloat(item.available_to_promise.toString()));

  const options: ApexOptions = {
    colors: ["#465fff", "#FDB022", "#12B76A", "#F04438"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    stroke: {
      width: [0, 0, 0, 0],
      curve: "smooth",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Quantity",
      },
      labels: {
        formatter: (val: number) => val.toLocaleString(),
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: [1, 1, 1, 1],
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number) => `${val.toLocaleString()} units`,
      },
    },
  };

  const series = [
    {
      name: "Onhand",
      type: "column",
      data: onhandData,
    },
    {
      name: "Allocated",
      type: "column",
      data: allocatedData,
    },
    {
      name: "On Order",
      type: "column",
      data: onorderData,
    },
    {
      name: "Available to Promise",
      type: "column",
      data: availableToPromise,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Inventory Availability vs Demand
        </h3>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <Chart options={options} series={series} type="bar" height={350} />
        </div>
      </div>
    </div>
  );
};

export default InventoryAvailabilityVsDemand;
