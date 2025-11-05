import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { salesApi } from "../../../services/api/dashboardApi";

interface MonthlySalesData {
  month: string;
  current_year_revenue: number;
  previous_year_revenue: number;
  yoy_growth: number;
}

const MonthlySalesComparison: React.FC = () => {
  const [data, setData] = useState<MonthlySalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await salesApi.getMonthlySalesComparison({ current_year: currentYear });
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentYear]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded dark:bg-gray-800 w-48 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded dark:bg-gray-800"></div>
        </div>
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Monthly Sales Comparison (YoY)
        </h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">
            {error || "No data available"}
          </p>
        </div>
      </div>
    );
  }

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const categories = data.map((item) => monthNames[parseInt(item.month) - 1]);
  const currentYearData = data.map((item) => item.current_year_revenue);
  const previousYearData = data.map((item) => item.previous_year_revenue);
  const yoyGrowthData = data.map((item) => item.yoy_growth);

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 400,
      type: "line",
      toolbar: {
        show: false,
      },
    },
    colors: ["#465fff", "#98A2B3", "#FDB022"],
    stroke: {
      width: [0, 0, 3],
      curve: "smooth",
    },
    plotOptions: {
      bar: {
        columnWidth: "50%",
        borderRadius: 5,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: [
      {
        title: {
          text: "Revenue",
        },
        labels: {
          formatter: (val: number) => {
            return `$${(val / 1000).toFixed(0)}K`;
          },
        },
      },
      {
        opposite: true,
        title: {
          text: "YoY Growth (%)",
        },
        labels: {
          formatter: (val: number) => `${val.toFixed(1)}%`,
        },
      },
    ],
    legend: {
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    grid: {
      borderColor: "#f0f0f0",
      strokeDashArray: 3,
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: [
        {
          formatter: (val: number) => `$${val.toLocaleString()}`,
        },
        {
          formatter: (val: number) => `$${val.toLocaleString()}`,
        },
        {
          formatter: (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`,
        },
      ],
    },
  };

  const series = [
    {
      name: `${currentYear}`,
      type: "column",
      data: currentYearData,
    },
    {
      name: `${currentYear - 1}`,
      type: "column",
      data: previousYearData,
    },
    {
      name: "YoY Growth",
      type: "line",
      data: yoyGrowthData,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Monthly Sales Comparison (YoY)
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {currentYear} vs {currentYear - 1}
        </span>
      </div>
      
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <Chart options={options} series={series} type="line" height={400} />
        </div>
      </div>
    </div>
  );
};

export default MonthlySalesComparison;
