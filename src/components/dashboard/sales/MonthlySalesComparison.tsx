import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { salesApi } from "../../../services/api/dashboardApi";
import { useSalesFilters } from "../../../context/SalesFilterContext";

interface SalesData {
  period: string;
  revenue: string;
  previous_month_revenue: string | null;
  mom_growth: number | null;
}

const MonthlySalesComparison: React.FC = () => {
  const { requestParams } = useSalesFilters();
  const [data, setData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await salesApi.getMonthlySalesComparison(requestParams);
        // Handle both wrapped and direct response
        const dataArray = result?.data || result || [];
        setData(dataArray);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [requestParams]);

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

  if (error || !data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Monthly Sales Comparison (MoM)</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  // Use all data without filtering
  const categories = data.map((item) => {
    const [year, month] = item.period.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  });

  const revenueData = data.map(
    (item) => parseFloat(item.revenue) / 1000000000 // Convert to billions
  );

  const momGrowthData = data.map((item) => (item.mom_growth !== null ? item.mom_growth : null));

  const options: ApexOptions = {
    colors: ["#465fff", "#12B76A"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 400,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    stroke: {
      width: [4, 2],
      curve: ["straight", "straight"],
      dashArray: [0, 5],
    },
    plotOptions: {
      bar: {
        columnWidth: "60%",
        borderRadius: 5,
        borderRadiusApplication: "end",
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
          text: "Revenue (Billion IDR)",
          style: {
            fontSize: "12px",
            fontWeight: 500,
          },
        },
        labels: {
          formatter: (val: number) => val.toFixed(1),
        },
      },
      {
        opposite: true,
        title: {
          text: "MoM Growth (%)",
          style: {
            fontSize: "12px",
            fontWeight: 500,
          },
        },
        labels: {
          formatter: (val: number) => val.toFixed(1) + "%",
        },
      },
    ],
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
      markers: {
        size: 10,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 0,
        right: 10,
        bottom: 0,
        left: 10,
      },
    },
    fill: {
      opacity: [1, 1],
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: [
        {
          formatter: (val: number) => `Rp ${val.toFixed(2)}B`,
        },
        {
          formatter: (val: number) => (val !== null ? `${val.toFixed(2)}%` : "N/A"),
        },
      ],
    },
  };

  const series = [
    {
      name: "Revenue",
      type: "column",
      data: revenueData,
    },
    {
      name: "MoM Growth",
      type: "line",
      data: momGrowthData,
    },
  ];

  // Calculate summary stats
  const totalRevenue = revenueData.reduce((sum, val) => sum + val, 0);
  const avgRevenue = totalRevenue / revenueData.length;
  const avgGrowth = momGrowthData.filter((val) => val !== null).reduce((sum, val) => sum + (val as number), 0) / momGrowthData.filter((val) => val !== null).length;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Monthly Sales Comparison (MoM)</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Year-over-year monthly revenue comparison</p>
        </div>
        <div className="flex gap-4 flex-wrap items-end">
          {/* Summary Stats */}
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Revenue</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                notation: "compact",
                compactDisplay: "short",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(avgRevenue * 1000000000)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Growth</p>
            <p className={`text-lg font-semibold ${avgGrowth >= 0 ? "text-success-600 dark:text-success-400" : "text-error-600 dark:text-error-400"}`}>{avgGrowth.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[700px]">
          <Chart options={options} series={series} type="line" height={400} />
        </div>
      </div>
    </div>
  );
};

export default MonthlySalesComparison;
