import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { salesApi } from "../../../services/api/dashboardApi";
import { useSalesFilters } from "../../../context/SalesFilterContext";

interface FulfillmentData {
  period: string;
  delivered_qty: string | number;
  invoice_qty: string | number;
}

interface FulfillmentResponse {
  data: FulfillmentData[];
  filter_metadata?: {
    period: string;
    date_field: string;
    date_from: string;
    date_to: string;
  };
}

const OrderFulfillment: React.FC = () => {
  const { requestParams } = useSalesFilters();
  const [data, setData] = useState<FulfillmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<FulfillmentResponse["filter_metadata"] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await salesApi.getOrderFulfillment(requestParams);
        // API returns { data: [...], filter_metadata: {...} }
        setData(result.data || []);
        setMetadata(result.filter_metadata || null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [requestParams]);

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
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Sales Order Fulfillment</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  // Parse string values to numbers
  const categories = data.map((item) => item.period);
  const deliveredData = data.map((item) => {
    const value = typeof item.delivered_qty === 'string' ? parseFloat(item.delivered_qty) : item.delivered_qty;
    return value || 0;
  });
  const invoiceData = data.map((item) => {
    const value = typeof item.invoice_qty === 'string' ? parseFloat(item.invoice_qty) : item.invoice_qty;
    return value || 0;
  });

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 400,
      type: "bar",
      toolbar: {
        show: false,
      },
      stacked: false,
    },
    colors: ["#465fff", "#10B981"],
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
    },
    grid: {
      borderColor: "#f0f0f0",
      strokeDashArray: 3,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toLocaleString()} units`,
      },
    },
  };

  const series = [
    {
      name: "Delivered Qty",
      data: deliveredData,
    },
    {
      name: "Invoice Qty",
      data: invoiceData,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Sales Order Fulfillment</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Delivered Quantity vs Invoice Quantity by Period
          {metadata && ` (${metadata.period.charAt(0).toUpperCase() + metadata.period.slice(1)} View)`}
        </p>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <Chart options={options} series={series} type="bar" height={400} />
        </div>
      </div>
    </div>
  );
};

export default OrderFulfillment;
