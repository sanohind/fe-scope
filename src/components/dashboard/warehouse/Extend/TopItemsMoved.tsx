import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { warehouseRevApi } from "../../../../services/api/dashboardApi";

interface TopItemData {
  item_code: string;
  item_desc: string;
  total_qty_moved: number;
  total_orders: number;
  avg_qty_per_order: number;
}

interface TopItemsMovedProps {
  warehouse: string;
}

const TopItemsMoved: React.FC<TopItemsMovedProps> = ({ warehouse }) => {
  const [data, setData] = useState<TopItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await warehouseRevApi.getTopItemsMoved(warehouse, { limit: 20 });

        // Ensure result is an array
        if (Array.isArray(result)) {
          setData(result);
          setError(null);
        } else if (result && Array.isArray(result.data)) {
          // Handle case where API returns { data: [...] }
          setData(result.data);
          setError(null);
        } else {
          // Handle case where result is not an array
          console.error("TopItemsMoved: API returned non-array data:", result);
          setData([]);
          setError("Invalid data format received from API");
        }
      } catch (err) {
        console.error("TopItemsMoved fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        setData([]); // Ensure data is always an array
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouse]);

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

  // Ensure data is always an array before using map
  if (error || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Top 20 Items Moved</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  const categories = data.map((item) => `${item.item_code}`);
  const quantities = data.map((item) => item.total_qty_moved);

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 500,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 5,
        borderRadiusApplication: "end",
        dataLabels: {
          position: "top",
        },
      },
    },
    colors: ["#465fff"],
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val.toLocaleString(),
      offsetX: 30,
      style: {
        fontSize: "11px",
        fontFamily: "Outfit",
        fontWeight: 600,
      },
    },
    xaxis: {
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        formatter: (val: string) => parseInt(val).toLocaleString(),
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "11px",
        },
      },
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
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        shadeIntensity: 0.25,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.85,
        stops: [0, 100],
      },
    },
    tooltip: {
      custom: ({ dataPointIndex }) => {
        const item = data[dataPointIndex];
        return `
          <div class="px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg">
            <div class="font-semibold text-gray-800 dark:text-white mb-2">${item.item_code}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">${item.item_desc}</div>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 dark:text-gray-400">Total Qty:</span>
                <span class="font-medium text-gray-800 dark:text-white">${item.total_qty_moved.toLocaleString()}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 dark:text-gray-400">Total Orders:</span>
                <span class="font-medium text-gray-800 dark:text-white">${item.total_orders.toLocaleString()}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 dark:text-gray-400">Avg per Order:</span>
                <span class="font-medium text-gray-800 dark:text-white">${item.avg_qty_per_order.toFixed(2)}</span>
              </div>
            </div>
          </div>
        `;
      },
    },
  };

  const series = [
    {
      name: "Quantity Moved",
      data: quantities,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Top 20 Items Moved</h3>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <Chart options={options} series={series} type="bar" height={500} />
        </div>
      </div>
    </div>
  );
};

export default TopItemsMoved;
