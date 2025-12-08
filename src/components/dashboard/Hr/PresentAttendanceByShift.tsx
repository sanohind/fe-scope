import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { hrApi } from "../../../services/api/dashboardApi";

interface AttendanceData {
  shiftdailyCode: string;
  period: string;
  count: number;
}

const PresentAttendanceByShift: React.FC = () => {
  const [data, setData] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Calculate date range for selected month
        const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
        const lastDay = new Date(selectedYear, selectedMonth, 0);

        // Format dates as YYYY-MM-DD using local date (not UTC)
        const startDate = firstDay.toLocaleDateString("en-CA");
        const endDate = lastDay.toLocaleDateString("en-CA");

        const result = await hrApi.getPresentAttendanceByShift({
          period: "daily",
          startDate,
          endDate,
        });

        // Handle API response structure: { success, data: { data: [...], ... }, message }
        // Or direct: { data: [...], ... }
        let attendanceData: AttendanceData[] = [];
        if (result?.data?.data && Array.isArray(result.data.data)) {
          attendanceData = result.data.data;
        } else if (Array.isArray(result?.data)) {
          attendanceData = result.data;
        } else if (Array.isArray(result)) {
          attendanceData = result;
        }

        setData(attendanceData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear]);

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
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Present Attendance by Shift</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  // Group data by shift code and period
  const shiftCodes = Array.from(new Set(data.map((item) => item.shiftdailyCode)));
  const periods = Array.from(new Set(data.map((item) => item.period))).sort();

  // Prepare series data for each shift
  const series = shiftCodes.map((shiftCode) => ({
    name: shiftCode,
    data: periods.map((period) => {
      const item = data.find((d) => d.period === period && d.shiftdailyCode === shiftCode);
      return item?.count || 0;
    }),
  }));

  // Format period labels for display
  const categories = periods.map((period) => {
    try {
      const date = new Date(period);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return period;
    }
  });

  // Color palette for shifts
  const colors = ["#465fff", "#0BA5EC", "#12B76A", "#FDB022", "#F04438", "#7A5AF8", "#EE46BC"];

  const options: ApexOptions = {
    colors: colors.slice(0, shiftCodes.length),
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 400,
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
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
      labels: {
        rotate: -45,
        rotateAlways: true,
        style: {
          fontSize: "11px",
        },
      },
    },
    yaxis: {
      title: {
        text: "Count",
      },
      labels: {
        formatter: (val: number) => val.toLocaleString(),
      },
    },
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
      y: {
        formatter: (val: number) => val.toLocaleString(),
      },
    },
    fill: {
      opacity: 1,
    },
  };

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Present Attendance by Shift</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Daily attendance breakdown by shift code</p>
        </div>

        <div className="flex gap-3 items-center">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <Chart options={options} series={series} type="bar" height={400} />
        </div>
      </div>
    </div>
  );
};

export default PresentAttendanceByShift;
