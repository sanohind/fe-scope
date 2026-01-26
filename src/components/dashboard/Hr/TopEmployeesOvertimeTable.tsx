import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { hrApi } from "../../../services/api/dashboardApi";

interface EmployeeOvertimeData {
  rank: number;
  emp_id: string;
  emp_no: string;
  full_name: string;
  department: string;
  cost_center: string;
  total_overtime_index: number;
  total_overtime_index_minutes: number;
  total_overtime_index_formatted: string;
}

const TopEmployeesOvertimeTable: React.FC = () => {
  const [data, setData] = useState<EmployeeOvertimeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const result = await hrApi.getTopEmployeesOvertime({
          month: selectedMonth,
          year: selectedYear,
        });

        // Handle API response structure: { success, data: { data: [...], ... }, message }
        let employeeData: EmployeeOvertimeData[] = [];
        if (result?.data?.data && Array.isArray(result.data.data)) {
          employeeData = result.data.data;
        } else if (Array.isArray(result?.data)) {
          employeeData = result.data;
        } else if (Array.isArray(result)) {
          employeeData = result;
        }

        setData(employeeData);
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
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Top Employees by Overtime</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  // Sort data by rank (ascending)
  const sortedData = [...data].sort((a, b) => a.rank - b.rank);

  // Prepare series data - use total_overtime_index (hours) as the main value
  const series = [
    {
      name: "Overtime Hours",
      data: sortedData.map((item) => item.total_overtime_index),
    },
  ];

  // Format employee names for x-axis labels
  const categories = sortedData.map((item) => {
    // Truncate long names to prevent overcrowding
    const name = item.full_name || `Employee ${item.emp_no}`;
    return name.length > 20 ? name.substring(0, 20) + "..." : name;
  });

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 400,
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
        text: "Overtime Hours",
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
      custom: ({ dataPointIndex }: { dataPointIndex: number }) => {
        const employee = sortedData[dataPointIndex];
        if (!employee) return "";

        const formatted = employee.total_overtime_index_formatted || "";
        const dept = employee.department || "N/A";
        const costCenter = employee.cost_center || "N/A";

        return `
          <div>
            <div class="font-semibold mb-1">${employee.full_name}</div>
            <div class="text-xs opacity-90">${dept} - ${costCenter}</div>
            <div class="mt-1 pt-1 border-t border-gray-700">
              <span class="font-medium">Overtime: ${formatted}</span>
            </div>
          </div>
        `;
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

  // const currentYear = new Date().getFullYear();
  const availableYears = [2028, 2027, 2026, 2025, 2024, 2023, 2022, 2021];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Top Employees by Overtime</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Top employees ranked by overtime hours</p>
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

export default TopEmployeesOvertimeTable;
