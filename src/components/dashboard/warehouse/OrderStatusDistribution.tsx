import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { warehouseApi } from "../../../services/api/dashboardApi";

interface StatusItem {
  trx_type: string;
  line_status: string | null;
  count: number;
  percentage: number;
}

interface OrderStatusData {
  [trxType: string]: StatusItem[];
}

const OrderStatusDistribution: React.FC = () => {
  const [data, setData] = useState<OrderStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await warehouseApi.getOrderStatusDistribution();
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

  if (error || !data || Object.keys(data).length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Order Status Distribution
        </h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">
            {error || "No data available"}
          </p>
        </div>
      </div>
    );
  }

  // Extract all unique statuses from data
  const allStatuses = new Set<string>();
  Object.values(data).forEach((items) => {
    items.forEach((item) => {
      allStatuses.add(item.line_status || "Unknown");
    });
  });

  const statuses = Array.from(allStatuses);
  const trxTypes = Object.keys(data);

  // Define color mapping for common statuses
  const statusColors: { [key: string]: string } = {
    "Shipped": "#12B76A",
    "Open": "#FDB022",
    "Staged": "#6172F3",
    "Adviced": "#8098F9",
    "Released": "#36BFFA",
    "Unknown": "#98A2B3",
  };

  // Generate colors for all statuses
  const colors = statuses.map((status) => statusColors[status] || "#D0D5DD");

  const seriesData = statuses.map((status) => {
    return {
      name: status,
      data: trxTypes.map((trxType) => {
        const item = data[trxType].find(
          (d) => (d.line_status || "Unknown") === status
        );
        return item ? item.percentage : 0;
      }),
    };
  });

  const options: ApexOptions = {
    colors: colors,
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
      stacked: true,
      stackType: "100%",
      toolbar: {
        show: false,
      },
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
      enabled: true,
      formatter: (val: number) => {
        // Only show label if percentage is >= 5%
        return val >= 5 ? `${val.toFixed(0)}%` : "";
      },
      style: {
        fontSize: "12px",
        fontFamily: "Outfit",
        fontWeight: 600,
      },
    },
    xaxis: {
      categories: trxTypes,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Percentage",
      },
      labels: {
        formatter: (val: number) => `${val.toFixed(0)}%`,
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
      opacity: 1,
    },
    tooltip: {
      shared: true,
      intersect: false,
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const trxType = trxTypes[dataPointIndex];
        const statusItems = data[trxType];
        
        let tooltipContent = `
          <div style="padding: 12px; font-family: Outfit, sans-serif;">
            <div class="text-gray-800 dark:text-gray-200">
              ${trxType}
            </div>
        `;
        
        // Sort by percentage descending
        const sortedItems = [...statusItems].sort((a, b) => b.percentage - a.percentage);
        
        sortedItems.forEach((item) => {
          const statusName = item.line_status || "Unknown";
          const statusIndex = statuses.indexOf(statusName);
          const color = colors[statusIndex] || "#D0D5DD";
          
          tooltipContent += `
            <div style="display: flex; align-items: center; margin-bottom: 6px;">
              <span style="display: inline-block; width: 10px; height: 10px; background-color: ${color}; border-radius: 2px; margin-right: 8px;"></span>
              <span class="text-gray-500 dark:text-gray-500">${statusName}:</span>
              <span class="text-gray-800 dark:text-gray-200 ml-2">
                 ${item.percentage.toFixed(2)}% (${item.count.toLocaleString()})
              </span>
            </div>
          `;
        });
        
        // Calculate total
        const totalCount = statusItems.reduce((sum, item) => sum + item.count, 0);
        
        tooltipContent += `
            <div class="border-t border-gray-200 dark:border-gray-800">
              <div class="flex justify-between mt-2">
                <span class="text-gray-500 dark:text-gray-500">Total:</span>
                <span class="text-gray-800 dark:text-gray-200">${totalCount.toLocaleString()} orders</span>
              </div>
            </div>
          </div>
        `;
        
        return tooltipContent;
      }
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Order Status Distribution
        </h3>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <Chart options={options} series={seriesData} type="bar" height={350} />
        </div>
      </div>
    </div>
  );
};

export default OrderStatusDistribution;