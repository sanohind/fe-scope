import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { warehouseApi } from "../../../services/api/dashboardApi";

interface FulfillmentItem {
  ship_from: string;
  total_order_qty: number;
  total_ship_qty: number;
  fulfillment_rate: number;
}

interface FulfillmentData {
  data: FulfillmentItem[];
  target_rate: number;
}

const OrderFulfillmentRate: React.FC = () => {
  const [data, setData] = useState<FulfillmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await warehouseApi.getOrderFulfillmentRate();
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

  if (error || !data || data.data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Order Fulfillment Rate
        </h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">
            {error || "No data available"}
          </p>
        </div>
      </div>
    );
  }

  const categories = data.data.map((item) => item.ship_from);
  const fulfillmentRates = data.data.map((item) => item.fulfillment_rate);
  
  // Create colors based on achievement vs target
  const colors = fulfillmentRates.map((rate) => {
    if (rate >= data.target_rate) return "#12B76A"; // Green - meets target
    if (rate >= data.target_rate * 0.9) return "#FDB022"; // Orange - close to target
    return "#F04438"; // Red - below target
  });

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
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
        distributed: true,
      },
    },
    colors: colors,
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
      style: {
        fontSize: "12px",
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
    },
    yaxis: {
      title: {
        text: "Fulfillment Rate (%)",
      },
      labels: {
        formatter: (val: number) => `${val.toFixed(0)}%`,
      },
      min: 0,
      max: 110,
    },
    legend: {
      show: false,
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    annotations: {
      yaxis: [
        {
          y: data.target_rate,
          borderColor: "#465fff",
          strokeDashArray: 5,
          label: {
            borderColor: "#465fff",
            style: {
              color: "#fff",
              background: "#465fff",
              fontSize: "12px",
              fontFamily: "Outfit",
            },
            text: `Target: ${data.target_rate}%`,
          },
        },
      ],
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toFixed(2)}%`,
      },
    },
  };

  const series = [
    {
      name: "Fulfillment Rate",
      data: fulfillmentRates,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Order Fulfillment Rate by Warehouse
        </h3>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <Chart options={options} series={series} type="bar" height={350} />
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Meets Target</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Close to Target</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-error-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Below Target</span>
        </div>
      </div>
    </div>
  );
};

export default OrderFulfillmentRate;
