import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { productionApi } from "../../../services/api/dashboardApi";

interface StatusData {
  status: string;
  count: string;
  total_qty: string;
}

interface ApiResponse {
  data: StatusData[];
  total_orders: number;
  filter_metadata: {
    period: string;
    date_field: string;
    date_from: string | null;
    date_to: string | null;
  };
}

interface ProductionStatusDistributionProps {
  divisi?: string;
  dateFrom?: string;
  dateTo?: string;
  period?: "daily" | "monthly" | "yearly";
}

const ProductionStatusDistribution: React.FC<ProductionStatusDistributionProps> = ({ divisi = "ALL", dateFrom, dateTo, period = "daily" }) => {
  const [data, setData] = useState<StatusData[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result: ApiResponse = await productionApi.getProductionStatusDistribution({
          period,
          divisi: divisi !== "ALL" ? divisi : undefined,
          date_from: dateFrom,
          date_to: dateTo,
        });

        // Extract data array and total from API response
        if (result && result.data) {
          setData(result.data);
          setTotalOrders(result.total_orders || 0);
        } else {
          setData([]);
          setTotalOrders(0);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [divisi, dateFrom, dateTo, period]);

  // Convert string counts to numbers for the chart
  const series = data.map((item) => parseInt(item.count, 10));
  const labels = data.map((item) => item.status);

  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#F04438", "#5925DC", "#F79009", "#027A48", "#12B76A", "#465FFF"],
    labels: labels,
    stroke: {
      show: false,
      width: 0,
    },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
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
              formatter: (val) => {
                return Number(val).toLocaleString();
              },
            },
            total: {
              show: true,
              label: "Total Orders",
              fontSize: "14px",
              fontWeight: 500,
              formatter: function () {
                // Use the totalOrders from API instead of calculating from series
                return totalOrders.toLocaleString();
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
        formatter: (val) => {
          const percentage = totalOrders > 0 ? ((val / totalOrders) * 100).toFixed(1) : "0.0";
          return `${val.toLocaleString()} (${percentage}%)`;
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Production Status Distribution</h3>
        </div>
        <div className="flex justify-center items-center h-[300px]">
          <div className="animate-pulse">
            <div className="w-[250px] h-[250px] bg-gray-200 rounded-full dark:bg-gray-800"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data.length) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Production Status Distribution</h3>
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
        <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Production Status Distribution</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Production orders by status</p>
      </div>
      <div>
        <ReactApexChart options={options} series={series} type="donut" height={350} />
      </div>
    </div>
  );
};

export default ProductionStatusDistribution;
