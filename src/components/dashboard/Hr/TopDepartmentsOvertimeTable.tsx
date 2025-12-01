import React, { useEffect, useState } from "react";
import { hrApi } from "../../../services/api/dashboardApi";

interface DepartmentOvertimeRow {
  rank?: number;
  department?: string;
  cost_center?: string;
  total_overtime_index?: number;
  total_employees?: number;
}

const NUMBER_FORMATTER = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

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

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

const TopDepartmentsOvertimeTable: React.FC = () => {
  const [rows, setRows] = useState<DepartmentOvertimeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [month, setMonth] = useState<number | undefined>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number | undefined>(new Date().getFullYear());
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params: Record<string, string | number> = {};
        if (month) params.month = month;
        if (year) params.year = year;

        const result = await hrApi.getTopDepartmentsOvertime(params);

        let data: DepartmentOvertimeRow[] = [];

        if (result?.data?.data) {
          data = Array.isArray(result.data.data) ? result.data.data : [];
        } else if (Array.isArray(result)) {
          data = result;
        }

        const filteredData = searchTerm ? data.filter((row) => row.department?.toLowerCase().includes(searchTerm.toLowerCase()) || row.cost_center?.toLowerCase().includes(searchTerm.toLowerCase())) : data;

        setRows(filteredData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch top departments overtime data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [month, year, searchTerm]);

  const formatNumber = (value: number) => NUMBER_FORMATTER.format(value ?? 0);

  const renderSkeleton = () => (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-56 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-12 rounded bg-gray-100 dark:bg-gray-900/40" />
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return renderSkeleton();
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Top Departments by Overtime Index</h3>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
      <div className="mb-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Top Departments by Overtime Index</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ranked by overtime performance</p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
            <select value={month || ""} onChange={(e) => setMonth(e.target.value ? Number(e.target.value) : undefined)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <option value="">All Months</option>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
            <select value={year || ""} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : undefined)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <option value="">All Years</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
            <input
              type="text"
              value={searchInput}
              placeholder="Search department..."
              onChange={(e) => setSearchInput(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="max-h-[520px] overflow-auto" style={{ scrollbarWidth: "thin" }}>
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
            <thead className="bg-gray-50 text-left text-sm font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Cost Center</th>
                <th className="px-4 py-3 text-right">Total Employees</th>
                <th className="px-4 py-3 text-right">Total Overtime Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm dark:divide-gray-800 dark:bg-gray-950/40">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                    No department overtime data available
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={`${row.department}-${row.cost_center}`} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.rank || "-"}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.department || "-"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.cost_center || "-"}</td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{formatNumber(row.total_employees || 0)}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">{formatNumber(row.total_overtime_index || 0)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {rows.length > 0 && <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">Showing {rows.length} entries</div>}
    </div>
  );
};

export default TopDepartmentsOvertimeTable;
