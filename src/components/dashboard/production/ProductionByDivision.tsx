import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { productionApi } from "../../../services/api/dashboardApi";

interface DivisionData {
  divisi: string;
  qty_delivery: string;
}

interface ApiResponse {
  data: DivisionData[];
  filter_metadata: {
    period: string;
    date_field: string;
    date_from: string | null;
    date_to: string | null;
  };
  divisi_filter: {
    requested: string;
    applied: string[];
    available: string[];
    is_all: boolean;
  };
}

const ProductionByDivision: React.FC = () => {
  const [data, setData] = useState<DivisionData[]>([]);
  const [totalQty, setTotalQty] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result: ApiResponse = await productionApi.getProductionBydivisi({});

        // Extract data array from API response
        if (result && result.data) {
          setData(result.data);
          // Calculate total qty_delivery
          const total = result.data.reduce((sum, item) => {
            return sum + (parseFloat(item.qty_delivery) || 0);
          }, 0);
          setTotalQty(total);
        } else {
          setData([]);
          setTotalQty(0);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Convert string quantities to numbers for the chart
  const series = data.map((item) => parseFloat(item.qty_delivery) || 0);
  const labels = data.map((item) => item.divisi);

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
              label: "Total Delivery",
              fontSize: "14px",
              fontWeight: 500,
              formatter: function () {
                return totalQty.toLocaleString();
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
          const percentage = totalQty > 0 ? ((val / totalQty) * 100).toFixed(1) : "0.0";
          return `${val.toLocaleString()} (${percentage}%)`;
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Production by Division</h3>
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
          <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Production by Division</h3>
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
        <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Production by Division</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Delivery quantity distribution by division</p>
      </div>
      <div>
        <ReactApexChart options={options} series={series} type="donut" height={437} />
      </div>
    </div>
  );
};

export default ProductionByDivision;
