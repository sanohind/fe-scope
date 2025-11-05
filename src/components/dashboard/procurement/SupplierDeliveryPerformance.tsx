import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { procurementApi } from "../../../services/api/dashboardApi";

interface SupplierPerformanceData {
  bp_name: string;
  delivery_time_variance: number;
  receipt_accuracy_rate: number;
  total_receipt_value: number;
}

const SupplierDeliveryPerformance: React.FC = () => {
  const [data, setData] = useState<SupplierPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await procurementApi.getSupplierDeliveryPerformance();
        const dataArray = Array.isArray(result) ? result : [];
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

  const series = data.map((item) => ({
    x: item.delivery_time_variance,
    y: item.receipt_accuracy_rate,
    z: item.total_receipt_value / 1000000, // Convert to millions for bubble size
    name: item.bp_name,
  }));

  const options: ApexOptions = {
    chart: {
      type: "bubble",
      fontFamily: "Outfit, sans-serif",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      opacity: 0.8,
    },
    colors: ["#465FFF", "#12B76A", "#F79009", "#F04438"],
    xaxis: {
      title: {
        text: "Delivery Time Variance (days)",
        style: {
          fontSize: "12px",
          fontWeight: 500,
        },
      },
      tickAmount: 12,
      labels: {
        formatter: (val) => parseFloat(val).toFixed(0),
      },
    },
    yaxis: {
      title: {
        text: "Receipt Accuracy Rate (%)",
        style: {
          fontSize: "12px",
          fontWeight: 500,
        },
      },
      min: 0,
      max: 100,
      tickAmount: 5,
    },
    annotations: {
      xaxis: [
        {
          x: 0,
          borderColor: "#667085",
          strokeDashArray: 5,
          label: {
            text: "On-time",
            style: {
              color: "#fff",
              background: "#667085",
              fontSize: "11px",
            },
          },
        },
      ],
      yaxis: [
        {
          y: 95,
          borderColor: "#12B76A",
          strokeDashArray: 5,
          label: {
            text: "Target 95%",
            style: {
              color: "#fff",
              background: "#12B76A",
              fontSize: "11px",
            },
          },
        },
      ],
    },
    tooltip: {
      custom: ({ dataPointIndex }) => {
        const supplier = data[dataPointIndex];
        return `
          <div class="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-800 shadow-lg">
            <div class="font-semibold text-gray-800 dark:text-white/90 mb-2">${supplier.bp_name}</div>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 dark:text-gray-400">Delivery Variance:</span>
                <span class="font-medium text-gray-800 dark:text-white/90">${supplier.delivery_time_variance.toFixed(1)} days</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 dark:text-gray-400">Accuracy Rate:</span>
                <span class="font-medium text-gray-800 dark:text-white/90">${supplier.receipt_accuracy_rate.toFixed(2)}%</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 dark:text-gray-400">Total Value:</span>
                <span class="font-medium text-gray-800 dark:text-white/90">${formatCurrency(supplier.total_receipt_value)}</span>
              </div>
            </div>
          </div>
        `;
      },
    },
    legend: {
      show: false,
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
          Supplier Delivery Performance
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Delivery time vs accuracy rate (bubble size = receipt value)
        </p>
      </div>

      <ReactApexChart
        options={options}
        series={[
          {
            name: "Suppliers",
            data: series,
          },
        ]}
        type="bubble"
        height={450}
      />

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Good Performance (Right of 0, Above 95%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Needs Improvement</span>
        </div>
      </div>
    </div>
  );
};

export default SupplierDeliveryPerformance;
