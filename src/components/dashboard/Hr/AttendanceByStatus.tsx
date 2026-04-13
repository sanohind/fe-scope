import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { hrApi } from "../../../services/api/dashboardApi";

// 13 allowed attendance status codes and their readable labels
const STATUS_LABELS: Record<string, string> = {
  ABS: "Absent",
  ANL: "Annual Leave",
  CHK: "Check",
  CIH: "Cuti Izin Hamil",
  CLJ: "Cuti Luar Jam",
  CML: "Cuti Melahirkan",
  CUU: "Cuti Urusan",
  EMS: "Emergency",
  IPC: "IP Cuti",
  IZN: "Izin",
  MPP: "MPP",
  PRS: "Present",
  SDC: "Sakit Dokter",
};

// Color palette (one per status, ordered to be visually distinct)
const STATUS_COLORS: Record<string, string> = {
  PRS: "#12B76A", // green
  ABS: "#F04438", // red
  ANL: "#0BA5EC", // sky
  IZN: "#FDB022", // amber
  SDC: "#EE46BC", // pink
  CML: "#7A5AF8", // purple
  CIH: "#C01048", // rose
  CUU: "#F79009", // orange
  CLJ: "#06AED4", // cyan
  EMS: "#D92D20", // dark red
  MPP: "#039855", // dark green
  CHK: "#667085", // slate
  IPC: "#444CE7", // indigo
};

interface StatusItem {
  status: string;
  total: number;
}

interface DailyRecord {
  date: string;
  [key: string]: string | number; // dynamic status keys
}

interface FilterMeta {
  start_date: string;
  end_date: string;
  month: number;
  year: number;
  month_name: string;
}

interface ApiResponse {
  data: StatusItem[];
  daily: DailyRecord[];
  total: number;
  statuses: string[];
  filter_metadata: FilterMeta;
}

const MONTHS = [
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

const AVAILABLE_YEARS = [2028, 2027, 2026, 2025, 2024, 2023, 2022, 2021];

const AttendanceByStatus: React.FC = () => {
  const [dailyData, setDailyData] = useState<DailyRecord[]>([]);
  const [summaryData, setSummaryData] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await hrApi.getAttendanceByStatus({
          month: selectedMonth,
          year: selectedYear,
        });

        // Unwrap nested data structure: { success, data: { data, daily, total, ... }, message }
        const payload: ApiResponse = result?.data ?? result;

        const items: StatusItem[] = Array.isArray(payload?.data) ? payload.data : [];
        const daily: DailyRecord[] = Array.isArray(payload?.daily) ? payload.daily : [];

        setSummaryData(items);
        setDailyData(daily);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        setSummaryData([]);
        setDailyData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear]);

  // ─── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded dark:bg-gray-800 w-56 mb-6" />
          <div className="h-96 bg-gray-200 rounded dark:bg-gray-800" />
        </div>
      </div>
    );
  }

  // ─── Error / empty state ──────────────────────────────────────────────────
  if (error || !dailyData || dailyData.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Attendance by Status
        </h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">
            {error || "No attendance status data available for the selected period."}
          </p>
        </div>
      </div>
    );
  }

  // ─── Build ApexCharts stacked-bar series ────────────────────────────────
  // Only plot statuses that have at least 1 record in the month
  const validStatuses = summaryData.filter((d) => d.total > 0).map((d) => d.status);

  // Group data by daily periods
  const categories = dailyData.map((d) => {
    try {
      const date = new Date(d.date);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return d.date;
    }
  });

  // Prepare series data for each status
  const series = validStatuses.map((status) => ({
    name: STATUS_LABELS[status] ?? status,
    data: dailyData.map((d) => Number(d[status] || 0)),
  }));

  const colors = validStatuses.map((status) => STATUS_COLORS[status] ?? "#465fff");

  const options: ApexOptions = {
    colors: colors,
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 400,
      stacked: true, // Stack the bars for daily breakdown
      toolbar: { show: false },
      animations: { enabled: true, speed: 600 },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        borderRadiusApplication: "end", // Make only the top valid
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        rotate: -45,
        rotateAlways: true,
        style: { fontSize: "11px" },
      },
    },
    yaxis: {
      title: { text: "Count" },
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
    },
    fill: {
      opacity: 1,
    },
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Attendance by Status
          </h3>
        </div>

        {/* Month / Year filters */}
        <div className="flex gap-3 items-center">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          >
            {AVAILABLE_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <Chart options={options} series={series} type="bar" height={400} />
        </div>
      </div>
    </div>
  );
};

export default AttendanceByStatus;
