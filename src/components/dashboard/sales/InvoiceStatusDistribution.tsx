import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { salesApi } from "../../../services/api/dashboardApi";

interface InvoiceStatusData {
  category: string;
  invoice_status: string;
  count: number;
}

const InvoiceStatusDistribution: React.FC = () => {
  const [data, setData] = useState<InvoiceStatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<'monthly' | 'customer'>('monthly');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await salesApi.getInvoiceStatusDistribution(groupBy);
        setData(result);
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
          <div className="h-96 bg-gray-200 rounded dark:bg-gray-800"></div>
        </div>
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Invoice Status Distribution
        </h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">
            {error || "No data available"}
          </p>
        </div>
      </div>
    );
  }

  // Get unique categories and statuses
  const categories = Array.from(new Set(data.map((item) => item.category)));
  const statuses = Array.from(new Set(data.map((item) => item.invoice_status)));

  // Define color mapping
  const statusColors: { [key: string]: string } = {
    "Paid": "#12B76A",
    "Outstanding": "#FDB022",
    "Overdue": "#F04438",
    "Cancelled": "#98A2B3",
  };

  const colors = statuses.map((status) => statusColors[status] || "#D0D5DD");

  // Transform data for stacked bar chart (100%)
  const seriesData = statuses.map((status) => ({
    name: status,
    data: categories.map((category) => {
      const categoryData = data.filter((item) => item.category === category);
      const totalCount = categoryData.reduce((sum, item) => sum + item.count, 0);
      const statusItem = categoryData.find((item) => item.invoice_status === status);
      return statusItem && totalCount > 0 ? (statusItem.count / totalCount) * 100 : 0;
    }),
  }));

  const options: ApexOptions = {
    colors: colors,
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 400,
      stacked: true,
      stackType: "100%",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 5,
        borderRadiusApplication: "end",
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
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => {
        return val >= 5 ? `${val.toFixed(0)}%` : "";
      },
      style: {
        fontSize: "12px",
        fontFamily: "Outfit",
        fontWeight: 600,
      },
    },
    grid: {
      borderColor: "#f0f0f0",
      strokeDashArray: 3,
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number, opts) => {
          const category = categories[opts.dataPointIndex];
          const categoryData = data.filter((item) => item.category === category);
          const status = statuses[opts.seriesIndex];
          const statusItem = categoryData.find((item) => item.invoice_status === status);
          return statusItem 
            ? `${val.toFixed(2)}% (${statusItem.count.toLocaleString()} invoices)`
            : `${val.toFixed(2)}%`;
        },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Invoice Status Distribution
        </h3>
        
        <div className="flex gap-2">
          <button
            onClick={() => setGroupBy('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              groupBy === 'monthly'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setGroupBy('customer')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              groupBy === 'customer'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            By Customer
          </button>
        </div>
      </div>
      
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <Chart options={options} series={seriesData} type="bar" height={400} />
        </div>
      </div>
    </div>
  );
};

export default InvoiceStatusDistribution;
