import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { procurementApi } from "../../../services/api/dashboardApi";

interface SupplierData {
  bp_name: string;
  total_receipt_amount: number;
  po_count: number;
  receipt_count: number;
  average_po_value: number;
}

const TopSuppliersByValue: React.FC = () => {
  const [data, setData] = useState<SupplierData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await procurementApi.getTopSuppliersByValue(20);
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

  const categories = data.map((item) => item.bp_name);
  const series = data.map((item) => item.total_receipt_amount);

  const options: ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        dataLabels: {
          position: "top",
        },
        distributed: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: categories,
      labels: {
        formatter: (val) => {
          const num = parseFloat(val);
          if (num >= 1000000000) {
            return `${(num / 1000000000).toFixed(1)}B`;
          } else if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
          } else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
          }
          return num.toFixed(0);
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    colors: ["#465FFF"],
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        shadeIntensity: 0.25,
        opacityFrom: 1,
        opacityTo: 0.85,
        stops: [0, 100],
      },
    },
    tooltip: {
      custom: ({ dataPointIndex }) => {
        const supplier = data[dataPointIndex];
        return `
          <div class="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-800 shadow-lg">
            <div class="font-semibold text-gray-800 dark:text-white/90 mb-2">${supplier.bp_name}</div>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 dark:text-gray-400">Total Value:</span>
                <span class="font-medium text-gray-800 dark:text-white/90">${formatCurrency(supplier.total_receipt_amount)}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 dark:text-gray-400">PO Count:</span>
                <span class="font-medium text-gray-800 dark:text-white/90">${supplier.po_count.toLocaleString()}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 dark:text-gray-400">Receipt Count:</span>
                <span class="font-medium text-gray-800 dark:text-white/90">${supplier.receipt_count.toLocaleString()}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 dark:text-gray-400">Avg PO Value:</span>
                <span class="font-medium text-gray-800 dark:text-white/90">${formatCurrency(supplier.average_po_value)}</span>
              </div>
            </div>
          </div>
        `;
      },
    },
    grid: {
      borderColor: "#E4E7EC",
      strokeDashArray: 4,
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
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Top Suppliers by Value
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Top 20 suppliers by total receipt amount
        </p>
      </div>

      <ReactApexChart
        options={options}
        series={[{ name: "Receipt Amount", data: series }]}
        type="bar"
        height={600}
      />
    </div>
  );
};

export default TopSuppliersByValue;
