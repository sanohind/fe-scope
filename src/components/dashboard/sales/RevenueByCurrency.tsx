import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { salesApi } from "../../../services/api/dashboardApi";

interface CurrencyData {
  currency: string;
  amount_original: string;
  amount_hc: string;
  invoice_count: string;
  percentage: number;
}

interface RevenueByCurrencyData {
  data: CurrencyData[];
  total_amount_hc: number;
  period?: string;
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
        // API returns object directly: { data: [...], total_amount_hc: number, period: string }
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
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">
            Revenue by Currency
          </h3>
        </div>
        <div className="flex justify-center items-center h-[300px]">
          <div className="animate-pulse">
            <div className="w-[250px] h-[250px] bg-gray-200 rounded-full dark:bg-gray-800"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data || !data.data || data.data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">
            Revenue by Currency
          </h3>
        </div>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400 text-sm">
            {error || "No data available"}
          </p>
        </div>
      </div>
    );
  }

  // Filter out any invalid data and parse string values to numbers
  const validData = data.data.filter((item) => item && item.currency && item.amount_hc != null);
  const labels = validData.map((item) => item.currency);
  // Parse amount_hc from string to number
  const series = validData.map((item) => parseFloat(item.amount_hc) || 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const options: ApexOptions = {
    colors: ["#465fff", "#0BA5EC", "#12B76A", "#FDB022", "#F04438", "#7A5AF8"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 350,
    },
    labels: labels,
    stroke: {
      show: false,
      width: 0,
    },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontFamily: "Outfit",
      fontSize: "14px",
      itemMargin: {
        horizontal: 8,
        vertical: 4,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontWeight: 500,
            },
            value: {
              show: true,
              fontSize: "22px",
              fontWeight: 700,
              formatter: (val: string) => {
                return formatCurrency(Number(val));
              },
            },
            total: {
              show: true,
              label: "Total Revenue",
              fontSize: "14px",
              fontWeight: 500,
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce(
                  (a: number, b: number) => a + b,
                  0
                );
                return formatCurrency(total);
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    tooltip: {
      y: {
        formatter: (val: number, opts) => {
          const item = validData[opts.seriesIndex];
          const invoiceCount = parseInt(item?.invoice_count || "0");
          const total = series.reduce((a, b) => a + b, 0);
          const percentage = ((val / total) * 100).toFixed(1);
          return `${formatCurrency(val)} (${percentage}%) - ${invoiceCount} invoices`;
        },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">
              Revenue by Currency
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Revenue distribution across currencies
            </p>
          </div>
          {data.period && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Period: {data.period}
            </span>
          )}
        </div>
      </div>
      <div>
        <ReactApexChart options={options} series={series} type="donut" height={350} />
      </div>
    </div>
  );
};

export default RevenueByCurrency;