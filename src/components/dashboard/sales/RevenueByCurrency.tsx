import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { salesApi } from "../../../services/api/dashboardApi";

interface CurrencyData {
  currency: string;
  amount_original: number;
  amount_hc: number;
  invoice_count: number;
  percentage: number;
}

interface RevenueByCurrencyData {
  data: CurrencyData[];
  total_amount_hc: number;
}

const RevenueByCurrency: React.FC = () => {
  const [data, setData] = useState<RevenueByCurrencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await salesApi.getRevenueByCurrency();
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
          Revenue by Currency
        </h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">
            {error || "No data available"}
          </p>
        </div>
      </div>
    );
  }

  const labels = data.data.map((item) => item.currency);
  const series = data.data.map((item) => item.amount_hc);

  const options: ApexOptions = {
    colors: ["#465fff", "#0BA5EC", "#12B76A", "#FDB022", "#F04438", "#7A5AF8"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "pie",
      height: 350,
    },
    labels: labels,
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontFamily: "Outfit",
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
    },
    tooltip: {
      y: {
        formatter: (val: number, opts) => {
          const item = data.data[opts.seriesIndex];
          return `$${val.toLocaleString()} (${item.invoice_count} invoices)`;
        },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Revenue by Currency
        </h3>
      </div>
      <div>
        <Chart options={options} series={series} type="pie" height={350} />
      </div>
      <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Total Revenue (Home Currency)</span>
          <span className="text-lg font-bold text-gray-800 dark:text-white/90">
            ${data.total_amount_hc.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RevenueByCurrency;
