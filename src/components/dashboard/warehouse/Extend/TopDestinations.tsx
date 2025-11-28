import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { warehouseRevApi } from "../../../../services/api/dashboardApi";

interface DestinationData {
  ship_to: string;
  ship_to_desc: string;
  ship_to_type: string;
  order_count: number;
  total_qty: number;
}

interface TopDestinationsProps {
  warehouse: string;
}

const TopDestinations: React.FC<TopDestinationsProps> = ({ warehouse }) => {
  const [data, setData] = useState<DestinationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get data for last 30 days
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const dateFrom = thirtyDaysAgo.toISOString().split("T")[0];
        const dateTo = today.toISOString().split("T")[0];

        const result = await warehouseRevApi.getTopDestinations(warehouse, {
          date_from: dateFrom,
          date_to: dateTo,
        });

        // Handle API response structure: { data: [...], warehouse: "...", date_range: {...} }
        if (result && Array.isArray(result.data)) {
          setData(result.data);
        } else if (Array.isArray(result)) {
          // Fallback for direct array response
          setData(result);
        } else {
          console.error("TopDestinations: Expected data array but got:", result);
          setData([]);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
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

  if (error || !data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Top 10 Destinations</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  // Transform data for chart
  const categories = data.map((item) => item.ship_to);
  const quantities = data.map((item) => item.total_qty);

  // Color coding by ship_to_type
  const colors = data.map((item) => {
    switch (item.ship_to_type.toLowerCase()) {
      case "warehouse":
        return "#465fff"; // Blue for warehouses
      case "customer":
        return "#12B76A"; // Green for customers
      default:
        return "#FDB022"; // Orange for others
    }
  });

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 400,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 5,
        borderRadiusApplication: "end",
        distributed: true,
        dataLabels: {
          position: "top",
        },
      },
    },
    colors: colors,
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
            <div class="font-semibold text-gray-800 dark:text-white mb-2">${item.ship_to}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">${item.ship_to_desc}</div>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 dark:text-gray-400">Type:</span>
                <span class="font-medium text-gray-800 dark:text-white">${item.ship_to_type}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 dark:text-gray-400">Total Qty:</span>
                <span class="font-medium text-gray-800 dark:text-white">${item.total_qty.toLocaleString()}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 dark:text-gray-400">Orders:</span>
                <span class="font-medium text-gray-800 dark:text-white">${item.order_count.toLocaleString()}</span>
              </div>
            </div>
          </div>
        `;
      },
    },
    legend: {
      show: false,
    },
  };

  const series = [
    {
      name: "Total Quantity",
      data: quantities,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Top 10 Destinations</h3>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <Chart options={options} series={series} type="bar" height={400} />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Warehouse</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Customer</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Other</span>
        </div>
      </div>
    </div>
  );
};

export default TopDestinations;
