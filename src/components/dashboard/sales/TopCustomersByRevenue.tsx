import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { salesApi } from "../../../services/api/dashboardApi";

interface CustomerData {
  bp_name: string;
  total_revenue: number;
  number_of_orders: number;
  avg_order_value: number;
  total_qty: number;
  avg_price: number;
  revenue_contribution: number;
}

const TopCustomersByRevenue: React.FC = () => {
  const [data, setData] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await salesApi.getTopCustomers(20);
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
          <div className="h-[500px] bg-gray-200 rounded dark:bg-gray-800"></div>
        </div>
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Top 20 Customers by Revenue
        </h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">
            {error || "No data available"}
          </p>
        </div>
      </div>
    );
  }

  const categories = data.map((item) => item.bp_name);
  const revenues = data.map((item) => item.total_revenue);

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
      formatter: (val: number) => {
        return new Intl.NumberFormat('en-US', {
          notation: 'compact',
          compactDisplay: 'short',
        }).format(val);
      },
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
        formatter: (val: string) => {
          const num = parseInt(val);
          return new Intl.NumberFormat('en-US', {
            notation: 'compact',
            compactDisplay: 'short',
          }).format(num);
        },
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
      custom: ({ seriesIndex, dataPointIndex, w }) => {
        const item = data[dataPointIndex];
        return `
          <div class="px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg">
            <div class="font-semibold text-gray-800 dark:text-white mb-2">${item.bp_name}</div>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 dark:text-gray-400">Total Revenue:</span>
                <span class="font-medium text-gray-800 dark:text-white">$${item.total_revenue.toLocaleString()}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 dark:text-gray-400">Contribution:</span>
                <span class="font-medium text-gray-800 dark:text-white">${item.revenue_contribution.toFixed(2)}%</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 dark:text-gray-400">Number of Orders:</span>
                <span class="font-medium text-gray-800 dark:text-white">${item.number_of_orders.toLocaleString()}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 dark:text-gray-400">Avg Order Value:</span>
                <span class="font-medium text-gray-800 dark:text-white">$${item.avg_order_value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 dark:text-gray-400">Total Qty:</span>
                <span class="font-medium text-gray-800 dark:text-white">${item.total_qty.toLocaleString()}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 dark:text-gray-400">Avg Price:</span>
                <span class="font-medium text-gray-800 dark:text-white">$${item.avg_price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>
        `;
      },
    },
  };

  const series = [
    {
      name: "Revenue",
      data: revenues,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Top 20 Customers by Revenue
        </h3>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <Chart options={options} series={series} type="bar" height={500} />
        </div>
      </div>
    </div>
  );
};

export default TopCustomersByRevenue;
