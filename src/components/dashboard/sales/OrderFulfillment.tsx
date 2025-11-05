import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { salesApi } from "../../../services/api/dashboardApi";

interface FulfillmentData {
  category: string;
  delivered_qty: number;
  invoiced_qty: number;
  fulfillment_rate: number;
}

const OrderFulfillment: React.FC = () => {
  const [data, setData] = useState<FulfillmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<'period' | 'product_type'>('period');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await salesApi.getOrderFulfillment(groupBy);
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
          Sales Order Fulfillment
        </h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">
            {error || "No data available"}
          </p>
        </div>
      </div>
    );
  }

  const categories = data.map((item) => item.category);
  const deliveredData = data.map((item) => item.delivered_qty);
  const invoicedData = data.map((item) => item.invoiced_qty);
  const fulfillmentData = data.map((item) => item.fulfillment_rate);

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 400,
      type: "line",
      toolbar: {
        show: false,
      },
    },
    colors: ["#465fff", "#12B76A", "#FDB022"],
    stroke: {
      width: [0, 0, 3],
      curve: "smooth",
    },
    plotOptions: {
      bar: {
        columnWidth: "50%",
        borderRadius: 5,
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
    yaxis: [
      {
        title: {
          text: "Quantity",
        },
        labels: {
          formatter: (val: number) => val.toLocaleString(),
        },
      },
      {
        opposite: true,
        title: {
          text: "Fulfillment Rate (%)",
        },
        labels: {
          formatter: (val: number) => `${val.toFixed(1)}%`,
        },
        min: 0,
        max: 100,
      },
    ],
    legend: {
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    grid: {
      borderColor: "#f0f0f0",
      strokeDashArray: 3,
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: [
        {
          formatter: (val: number) => `${val.toLocaleString()} units`,
        },
        {
          formatter: (val: number) => `${val.toLocaleString()} units`,
        },
        {
          formatter: (val: number) => `${val.toFixed(2)}%`,
        },
      ],
    },
  };

  const series = [
    {
      name: "Delivered Qty",
      type: "column",
      data: deliveredData,
    },
    {
      name: "Invoiced Qty",
      type: "column",
      data: invoicedData,
    },
    {
      name: "Fulfillment Rate",
      type: "line",
      data: fulfillmentData,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Sales Order Fulfillment
        </h3>
        
        <div className="flex gap-2">
          <button
            onClick={() => setGroupBy('period')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              groupBy === 'period'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            By Period
          </button>
          <button
            onClick={() => setGroupBy('product_type')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              groupBy === 'product_type'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            By Product Type
          </button>
        </div>
      </div>
      
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <Chart options={options} series={series} type="line" height={400} />
        </div>
      </div>
    </div>
  );
};

export default OrderFulfillment;
