import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { productionApi } from "../../../services/api/dashboardApi";

interface CustomerData {
  customer: string;
  qty_ordered: number;
  qty_delivered: number;
}

interface ProductionByCustomerProps {
  divisi?: string;
}

const ProductionByCustomer: React.FC<ProductionByCustomerProps> = ({ divisi = "ALL" }) => {
  const [data, setData] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await productionApi.getProductionByCustomer(15, {
          divisi: divisi !== "ALL" ? divisi : undefined,
        });
        // Handle if API returns wrapped data or direct array
        const dataArray = Array.isArray(result) ? result : result?.data || [];
        setData(dataArray);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [divisi]);

  // Filter out invalid data and ensure numeric values
  const validData = Array.isArray(data) ? data.filter((item) => item && item.customer) : [];
  const categories = validData.map((item) => item.customer);
  const series = [
    {
      name: "Qty Delivered",
      data: validData.map((item) => Number(item.qty_delivered) || 0),
      type: "bar",
    },
    {
      name: "Qty Ordered",
      data: validData.map((item) => Number(item.qty_ordered) || 0),
      type: "line",
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      stacked: false,
      fontFamily: "Outfit, sans-serif",
      toolbar: {
        show: false,
      },
    },
    colors: ["#12B76A", "#465FFF"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: [0, 2],
      colors: ["transparent", "#465FFF"],
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          fontSize: "12px",
        },
        rotate: -45,
        rotateAlways: true,
      },
    },
    yaxis: {
      title: {
        text: "Quantity",
        style: {
          fontSize: "14px",
          fontWeight: 500,
        },
      },
      labels: {
        formatter: (val) => {
          return val.toLocaleString();
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val) => {
          return val.toLocaleString() + " units";
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "14px",
      itemMargin: {
        horizontal: 12,
      },
    },
    grid: {
      borderColor: "#E4E7EC",
    },
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Production by Customer</h3>
        </div>
        <div className="flex justify-center items-center h-[400px] animate-pulse">
          <div className="w-full h-full bg-gray-200 rounded dark:bg-gray-800"></div>
        </div>
      </div>
    );
  }

  if (error || !data.length) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Production by Customer</h3>
        </div>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400 text-sm">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Production by Customer</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Top 15 customers by production volume</p>
      </div>
      <div>
        <ReactApexChart options={options} series={series} type="bar" height={500} />
      </div>
    </div>
  );
};

export default ProductionByCustomer;
