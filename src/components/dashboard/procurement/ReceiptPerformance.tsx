import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { procurementApi } from "../../../services/api/dashboardApi";

interface ReceiptPerformanceData {
  receipt_fulfillment_rate: number;
  approval_rate: number;
  target_fulfillment: number;
  target_approval: number;
}

const ReceiptPerformance: React.FC = () => {
  const [data, setData] = useState<ReceiptPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await procurementApi.getReceiptPerformance();
        // Handle if API returns wrapped data { data: {...} } or direct object
        const dataObj = result?.data || result;
        setData(dataObj);
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
        <div className="h-64 bg-gray-200 rounded dark:bg-gray-800"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-error-200 bg-error-50 p-5 dark:border-error-800 dark:bg-error-900/20">
        <p className="text-error-600 dark:text-error-400">
          {error || "Failed to load data"}
        </p>
      </div>
    );
  }

  const getColor = (value: number, target: number) => {
    if (value >= target) return "#12B76A"; // Green
    if (value >= 90) return "#F79009"; // Yellow
    return "#F04438"; // Red
  };

  const fulfillmentOptions: ApexOptions = {
    chart: {
      type: "radialBar",
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          size: "60%",
        },
        track: {
          background: "#F2F4F7",
          strokeWidth: "100%",
        },
        dataLabels: {
          name: {
            fontSize: "14px",
            color: "#667085",
            offsetY: -10,
          },
          value: {
            fontSize: "24px",
            fontWeight: 700,
            color: "#101828",
            offsetY: 5,
            formatter: (val) => `${Number(val).toFixed(1)}%`,
          },
        },
      },
    },
    fill: {
      colors: [getColor(data.receipt_fulfillment_rate, data.target_fulfillment)],
    },
    labels: ["Fulfillment Rate"],
    stroke: {
      lineCap: "round",
    },
  };

  const approvalOptions: ApexOptions = {
    chart: {
      type: "radialBar",
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          size: "60%",
        },
        track: {
          background: "#F2F4F7",
          strokeWidth: "100%",
        },
        dataLabels: {
          name: {
            fontSize: "14px",
            color: "#667085",
            offsetY: -10,
          },
          value: {
            fontSize: "24px",
            fontWeight: 700,
            color: "#101828",
            offsetY: 5,
            formatter: (val) => `${Number(val).toFixed(1)}%`,
          },
        },
      },
    },
    fill: {
      colors: [getColor(data.approval_rate, data.target_approval)],
    },
    labels: ["Approval Rate"],
    stroke: {
      lineCap: "round",
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Receipt Performance
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Monitoring fulfillment and approval rates
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <ReactApexChart
            options={fulfillmentOptions}
            series={[data.receipt_fulfillment_rate]}
            type="radialBar"
            height={280}
          />
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Target: {data.target_fulfillment}%
            </div>
            <div className={`text-xs mt-1 font-medium ${
              data.receipt_fulfillment_rate >= data.target_fulfillment
                ? "text-success-600"
                : data.receipt_fulfillment_rate >= 90
                ? "text-warning-600"
                : "text-error-600"
            }`}>
              {data.receipt_fulfillment_rate >= data.target_fulfillment
                ? "Above Target"
                : data.receipt_fulfillment_rate >= 90
                ? "Warning"
                : "Below Target"}
            </div>
          </div>
        </div>

        <div>
          <ReactApexChart
            options={approvalOptions}
            series={[data.approval_rate]}
            type="radialBar"
            height={280}
          />
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Target: {data.target_approval}%
            </div>
            <div className={`text-xs mt-1 font-medium ${
              data.approval_rate >= data.target_approval
                ? "text-success-600"
                : data.approval_rate >= 90
                ? "text-warning-600"
                : "text-error-600"
            }`}>
              {data.approval_rate >= data.target_approval
                ? "Above Target"
                : data.approval_rate >= 90
                ? "Warning"
                : "Below Target"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPerformance;
