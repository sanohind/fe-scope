import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { procurementApi } from "../../../services/api/dashboardApi";

interface PaymentStatusData {
  date: string;
  invoiced_not_paid: number;
  paid: number;
}

const PaymentStatusTracking: React.FC = () => {
  const [data, setData] = useState<PaymentStatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await procurementApi.getPaymentStatusTracking();
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
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded dark:bg-gray-800 mb-6"></div>
        <div className="h-96 bg-gray-200 rounded dark:bg-gray-800"></div>
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-error-200 bg-error-50 p-5 dark:border-error-800 dark:bg-error-900/20">
        <p className="text-error-600 dark:text-error-400">
          {error || "No data available"}
        </p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Filter out invalid data and ensure numeric values
  const validData = data.filter((item) => item && item.date);
  const categories = validData.map((item) => item.date);
  const invoicedNotPaidSeries = validData.map((item) => Number(item.invoiced_not_paid) || 0);
  const paidSeries = validData.map((item) => Number(item.paid) || 0);

  const options: ApexOptions = {
    chart: {
      type: "area",
      fontFamily: "Outfit, sans-serif",
      stacked: true,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
    },
    stroke: {
      width: 2,
      curve: "smooth",
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.5,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 100],
      },
    },
    xaxis: {
      categories: categories.length > 0 ? categories : ['No Data'],
      labels: {
        style: {
          fontSize: "11px",
        },
        rotate: -45,
        rotateAlways: true,
      },
    },
    yaxis: {
      title: {
        text: "Amount (IDR)",
        style: {
          fontSize: "12px",
          fontWeight: 500,
        },
      },
      labels: {
        formatter: (val) => {
          if (val >= 1000000000) {
            return `${(val / 1000000000).toFixed(1)}B`;
          } else if (val >= 1000000) {
            return `${(val / 1000000).toFixed(1)}M`;
          } else if (val >= 1000) {
            return `${(val / 1000).toFixed(1)}K`;
          }
          return val.toFixed(0);
        },
      },
    },
    colors: ["#F79009", "#12B76A"],
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val) => formatCurrency(val),
      },
    },
    grid: {
      borderColor: "#E4E7EC",
      strokeDashArray: 4,
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Payment Status Tracking
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Invoice and payment status over time
        </p>
      </div>

      <ReactApexChart
        options={options}
        series={[
          {
            name: "Invoiced Not Yet Paid",
            data: invoicedNotPaidSeries,
          },
          {
            name: "Paid",
            data: paidSeries,
          },
        ]}
        type="area"
        height={400}
      />

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Invoiced Not Yet Paid</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Paid</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusTracking;
