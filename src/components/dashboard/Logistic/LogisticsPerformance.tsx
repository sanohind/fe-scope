import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { SupplyChainApi } from "../../../services/api/dashboardApi";

interface DeliveryPerformanceData {
  year: string;
  period: string;
  total_delivery: number;
  total_po: number;
  performance: number;
}

interface ApiResponse {
  success: boolean;
  data: DeliveryPerformanceData[];
  count: number;
}

const LogisticsPerformance: React.FC = () => {
  const currentDate = new Date();
  const [data, setData] = useState<DeliveryPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedPeriod, setSelectedPeriod] = useState<number>(currentDate.getMonth() + 1);
  
  // Hardcoded available years from 2021 to 2028
  const availableYears = [2028, 2027, 2026, 2025, 2024, 2023, 2022, 2021];

  // Fetch data based on selected year and period
  useEffect(() => {
    const fetchDataByYearAndPeriod = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await SupplyChainApi.getLogisticsDeliveryPerformance({ year: selectedYear, period: selectedPeriod });

        let responseData: DeliveryPerformanceData[] = [];

        if (result && typeof result === "object" && "data" in result) {
          const apiResponse = result as ApiResponse;
          if (Array.isArray(apiResponse.data) && apiResponse.data.length > 0) {
            responseData = apiResponse.data;
          }
        }

        if (responseData.length > 0) {
          setData(responseData[0]);
          setError(null);
        } else {
          setData(null);
          setError("No data available for selected year and period");
        }
      } catch (err) {
        console.error("Error fetching logistics delivery performance:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDataByYearAndPeriod();
  }, [selectedYear, selectedPeriod]);

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

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Logistics Performance</h3>
        </div>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Logistics Performance</h3>
        </div>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">No data available</p>
        </div>
      </div>
    );
  }

  // Format period to month name
  const formatPeriod = (period: number | string): string => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const periodNum = typeof period === "string" ? parseInt(period) : period;
    return months[periodNum - 1] || `Month ${period}`;
  };

  // Determine color based on performance
  const getColor = () => {
    if (data.performance >= 95) return "#12B76A"; // Green - Excellent
    if (data.performance >= 85) return "#FDB022"; // Orange - Good
    return "#F04438"; // Red - Needs Improvement
  };

  // Determine status badge based on performance
  // const getStatusBadge = () => {
  //   if (data.performance >= 95) {
  //     return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400">Excellent</span>;
  //   } else if (data.performance >= 85) {
  //     return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400">Good</span>;
  //   } else {
  //     return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-error-50 text-error-700 dark:bg-error-900/20 dark:text-error-400">Needs Improvement</span>;
  //   }
  // };

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 350,
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          margin: 0,
          size: "70%",
          background: "transparent",
        },
        track: {
          background: "#f2f4f7",
          strokeWidth: "100%",
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: "16px",
            fontFamily: "Outfit",
            fontWeight: 600,
            offsetY: -10,
          },
          value: {
            show: true,
            fontSize: "36px",
            fontFamily: "Outfit",
            fontWeight: 700,
            offsetY: 10,
            formatter: (val: number) => `${val.toFixed(2)}%`,
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: [getColor()],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Delivery Performance"],
  };

  const series = [data.performance];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Delivery Performance</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Monitoring delivery performance metrics</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Period:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {formatPeriod(month)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <Chart options={options} series={series} type="radialBar" height={380} />
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Delivery</p>
          <p className="mt-1 text-xl font-bold text-blue-600 dark:text-blue-400">{data.total_delivery.toLocaleString()}</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
          <p className="text-sm text-gray-500 dark:text-gray-400">Planning Delivery</p>
          <p className="mt-1 text-xl font-bold text-purple-600 dark:text-purple-400">{data.total_po.toLocaleString()}</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
          <p className="text-sm text-gray-500 dark:text-gray-400">Month & Year</p>
          <p className="mt-1 text-xl font-bold text-green-600 dark:text-green-400">
            {formatPeriod(data.period)} {data.year}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogisticsPerformance;
