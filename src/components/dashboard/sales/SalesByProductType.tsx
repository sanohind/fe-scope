import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { salesApi } from "../../../services/api/dashboardApi";

interface ProductTypeData {
  product_type: string;
  revenue: number;
  qty_sold: number;
  invoice_count: number;
  percentage: number;
}

interface SalesByProductData {
  data: ProductTypeData[];
  total_revenue: number;
}

const SalesByProductType: React.FC = () => {
  const [data, setData] = useState<SalesByProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await salesApi.getSalesByProductType();
        // Handle if API returns wrapped data or direct format
        const processedData = result?.data ? result : { data: [], total_revenue: 0 };
        setData(processedData);
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

  if (error || !data || !data.data || data.data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Sales by Product Type
        </h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">
            {error || "No data available"}
          </p>
        </div>
      </div>
    );
  }

  // Ensure data.data is an array before mapping
  const productData = Array.isArray(data.data) ? data.data : [];
  const labels = productData.map((item) => item.product_type);
  const series = productData.map((item) => item.revenue);

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
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontFamily: "Outfit",
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: "24px",
              fontFamily: "Outfit",
              fontWeight: 600,
              offsetY: 5,
              formatter: (val: string) => {
                return formatCurrency(Number(val));
              },
            },
            total: {
              show: true,
              label: "Total Revenue",
              fontSize: "14px",
              fontFamily: "Outfit",
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
    tooltip: {
      y: {
        formatter: (val: number, opts) => {
          const item = productData[opts.seriesIndex];
          if (!item) return formatCurrency(val);
          return `${formatCurrency(val)} (${(item.percentage || 0).toFixed(1)}%) - ${(item.qty_sold || 0).toLocaleString()} units`;
        },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Sales by Product Type
        </h3>
      </div>
      <div>
        <ReactApexChart options={options} series={series} type="donut" height={350} />
      </div>
    </div>
  );
};

export default SalesByProductType;
