import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { salesApi } from "../../../services/api/dashboardApi";
import { useSalesFilters } from "../../../context/SalesFilterContext";

interface ProductTypeData {
  product_type: string;
  revenue: string | number;
  qty_sold: string | number;
  invoice_count: string | number;
  percentage: number;
}

interface SalesByProductData {
  data: ProductTypeData[];
  total_revenue: number;
  period?: string;
}

const SalesByProductType: React.FC = () => {
  const { requestParams } = useSalesFilters();
  const [data, setData] = useState<SalesByProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await salesApi.getSalesByProductType(requestParams);
        console.log("API Result:", result); // Debug log
        // API returns object directly
        setData(result);
        setError(null);
      } catch (err) {
        console.error("Fetch error:", err); // Debug log
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [requestParams]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">
            Sales by Product Type
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
            Sales by Product Type
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

  // Ensure data.data is an array and parse values
  const productData = Array.isArray(data.data) ? data.data : [];
  const labels = productData.map((item) => item.product_type);
  // Parse revenue from string to number
  const series = productData.map((item) => {
    const revenue = typeof item.revenue === 'string' ? parseFloat(item.revenue) : item.revenue;
    return revenue || 0;
  });

  console.log("Chart data:", { labels, series }); // Debug log

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const options: ApexOptions = {
    colors: ["#465fff", "#0BA5EC", "#12B76A", "#FDB022", "#F04438", "#7A5AF8", "#EE46BC"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 350,
    },
    labels: labels,
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
    stroke: {
      show: false,
      width: 0,
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
              fontFamily: "Outfit",
              fontWeight: 500,
            },
            value: {
              show: true,
              fontSize: "22px",
              fontFamily: "Outfit",
              fontWeight: 700,
              formatter: (val: string) => {
                return formatCurrency(Number(val));
              },
            },
            total: {
              show: true,
              label: "Total Revenue",
              fontSize: "14px",
              fontFamily: "Outfit",
              fontWeight: 500,
              formatter: () => {
                return formatCurrency(data.total_revenue || 0);
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
          const item = productData[opts.seriesIndex];
          if (!item) return formatCurrency(val);
          const qtySold = typeof item.qty_sold === 'string' ? parseInt(item.qty_sold) : item.qty_sold;
          const total = series.reduce((a, b) => a + b, 0);
          const percentage = ((val / total) * 100).toFixed(1);
          return `${formatCurrency(val)} (${percentage}%) - ${(qtySold || 0).toLocaleString()} units`;
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
              Sales by Product Type
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Revenue distribution by product category
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

export default SalesByProductType;