import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { procurementApi } from "../../../services/api/dashboardApi";

interface SupplierApprovalData {
  bp_name: string;
  approval_rate: number;
  total_receipts: number;
  approved_qty: number;
  actual_receipt_qty: number;
  rejected_qty: number;
}

const ReceiptApprovalRateBySupplier: React.FC = () => {
  const [data, setData] = useState<SupplierApprovalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await procurementApi.getReceiptApprovalRateBySupplier(20);
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

  // Filter out invalid data and ensure numeric values
  const validData = data.filter((item) => item && item.bp_name && item.approval_rate != null);
  const categories = validData.map((item) => item.bp_name);
  const series = validData.map((item) => Number(item.approval_rate) || 0);

  const options: ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 6,
        dataLabels: {
          position: "top",
        },
        distributed: false,
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: {
        fontSize: "11px",
        colors: ["#667085"],
      },
      formatter: (val) => `${parseFloat(val.toString()).toFixed(1)}%`,
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
        text: "Approval Rate (%)",
        style: {
          fontSize: "12px",
          fontWeight: 500,
        },
      },
      min: 0,
      max: 100,
      tickAmount: 5,
    },
    colors: ["#465FFF"],
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.25,
        opacityFrom: 1,
        opacityTo: 0.85,
        stops: [0, 100],
      },
    },
    annotations: {
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
                <span class="text-gray-500 dark:text-gray-400">Approval Rate:</span>
                <span class="font-medium text-gray-800 dark:text-white/90">${supplier.approval_rate.toFixed(2)}%</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 dark:text-gray-400">Total Receipts:</span>
                <span class="font-medium text-gray-800 dark:text-white/90">${supplier.total_receipts.toLocaleString()}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 dark:text-gray-400">Approved Qty:</span>
                <span class="font-medium text-gray-800 dark:text-white/90">${supplier.approved_qty.toLocaleString()}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 dark:text-gray-400">Rejected Qty:</span>
                <span class="font-medium text-gray-800 dark:text-white/90">${supplier.rejected_qty.toLocaleString()}</span>
              </div>
            </div>
          </div>
        `;
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
          Receipt Approval Rate by Supplier
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Top 20 suppliers by volume with approval rates
        </p>
      </div>

      <ReactApexChart
        options={options}
        series={[
          {
            name: "Approval Rate",
            data: series,
          },
        ]}
        type="bar"
        height={450}
      />

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success-500"></div>
          <span className="text-gray-600 dark:text-gray-400">&gt;95% (Good)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning-500"></div>
          <span className="text-gray-600 dark:text-gray-400">90-95% (Warning)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-error-500"></div>
          <span className="text-gray-600 dark:text-gray-400">&lt;90% (Poor)</span>
        </div>
      </div>
    </div>
  );
};

export default ReceiptApprovalRateBySupplier;
