import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { inventoryApi } from "../../../services/api/dashboardApi";
import { InventoryFilterRequestParams, inventoryFiltersToQuery } from "../../../context/InventoryFilterContext";

interface StockHealthData {
  warehouse: string;
  critical: number;
  low: number;
  normal: number;
  overstock: number;
  undefined?: number;
}

interface StockHealthByWarehouseProps {
  warehouse?: string;
  filters?: InventoryFilterRequestParams;
}

const StockHealthByWarehouse: React.FC<StockHealthByWarehouseProps> = ({ warehouse, filters }) => {
  const [data, setData] = useState<StockHealthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params: Record<string, string> = { ...(warehouse ? { warehouse } : {}) };
        Object.assign(params, inventoryFiltersToQuery(filters));
        const result = await inventoryApi.getStockHealthByWarehouse(params);
        // Handle if API returns wrapped data or direct array
        const dataArray = Array.isArray(result) ? result : result?.data || [];
        setData(dataArray);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouse, filters]);

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
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Stock Health by Warehouse</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  const categories = data.map((item) => item.warehouse);
  const criticalData = data.map((item) => item.critical);
  const lowData = data.map((item) => item.low);
  const normalData = data.map((item) => item.normal);
  const overstockData = data.map((item) => item.overstock);
  const undefinedData = data.map((item) => item.undefined || 0);

  const options: ApexOptions = {
    colors: ["#F04438", "#FDB022", "#12B76A", "#0BA5EC", "#98A2B3", "#475467"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
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
        text: undefined,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: true,
      },
      y: {
        formatter: (val: number) => `${val} items`,
      },
    },
  };

  const series = [
    {
      name: "Critical",
      data: criticalData,
    },
    {
      name: "Low",
      data: lowData,
    },
    {
      name: "Normal",
      data: normalData,
    },
    {
      name: "Overstock",
      data: overstockData,
    },
    {
      name: "Undefined",
      data: undefinedData,
    }
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Stock Health by Warehouse</h3>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <Chart options={options} series={series} type="bar" height={350} />
        </div>
      </div>
    </div>
  );
};

export default StockHealthByWarehouse;
