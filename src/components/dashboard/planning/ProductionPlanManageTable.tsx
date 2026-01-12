import React, { useEffect, useState } from "react";
import { productionPlanApi, ProductionPlanData } from "../../../services/productionPlanApi";
import Button from "../../ui/button/Button";

interface PaginationInfo {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

const NUMBER_FORMATTER = new Intl.NumberFormat("id-ID");

const ProductionPlanManageTable: React.FC = () => {
  const [rows, setRows] = useState<ProductionPlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [yearFilter, setYearFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");

  // Helper function to get days in month
  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month, 0).getDate();
  };

  // Helper function to generate date range from year and period
  const getDateRange = (year: string, period: string): { from: string; to: string } | null => {
    if (!year || !period) return null;

    const yearNum = parseInt(year);
    const periodNum = parseInt(period);
    const daysInMonth = getDaysInMonth(yearNum, periodNum);

    const from = `${year}-${period.padStart(2, "0")}-01`;
    const to = `${year}-${period.padStart(2, "0")}-${daysInMonth}`;

    return { from, to };
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    fetchData();
  }, [searchTerm, currentPage, perPage, yearFilter, periodFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string | number> = {
        page: currentPage,
        per_page: perPage,
      };

      if (searchTerm) params.partno = searchTerm;

      // Generate date range from year and period
      const dateRange = getDateRange(yearFilter, periodFilter);
      if (dateRange) {
        params.plan_date_from = dateRange.from;
        params.plan_date_to = dateRange.to;
      }

      const result = await productionPlanApi.getAll(params);

      if (result.success && result.data) {
        setRows(result.data.data || []);
        setPagination({
          total: result.data.total,
          per_page: result.data.per_page,
          current_page: result.data.current_page,
          last_page: result.data.last_page,
          from: result.data.from,
          to: result.data.to,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "-";
    return NUMBER_FORMATTER.format(value);
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setYearFilter("");
    setPeriodFilter("");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchInput || yearFilter || periodFilter;

  // Generate array of day numbers (1-31)
  const dayColumns = Array.from({ length: 31 }, (_, i) => i + 1);

  // Get unique years from data for dropdown (or use predefined range)
  const availableYears = [2024, 2025, 2026, 2027, 2028];
  const availablePeriods = Array.from({ length: 12 }, (_, i) => i + 1);

  const renderSkeleton = () => (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-56 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-12 rounded bg-gray-100 dark:bg-gray-900/40" />
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return renderSkeleton();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Production Plan Data</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">View production plan data</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={searchInput}
            placeholder="Search part number..."
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-56 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All Years</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select
            value={periodFilter}
            onChange={(e) => {
              setPeriodFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All Periods</option>
            {availablePeriods.map((period) => (
              <option key={period} value={period}>
                Period {period}
              </option>
            ))}
          </select>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            {[25, 50, 100, 150].map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
          {hasActiveFilters && (
            <Button size="sm" variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="max-h-[520px] overflow-auto" style={{ scrollbarWidth: "thin" }}>
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
            <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-400">
              <tr>
                <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 dark:bg-gray-900">Part Number</th>
                <th className="sticky left-[200px] z-10 bg-gray-50 px-4 py-3 dark:bg-gray-900">Division</th>
                <th className="px-4 py-3 whitespace-nowrap">Year</th>
                <th className="px-4 py-3 whitespace-nowrap">Period</th>
                {dayColumns.map((day) => (
                  <th key={day} className="px-4 py-3 text-right whitespace-nowrap">
                    Day {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm dark:divide-gray-800 dark:bg-gray-950/40">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={35} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                    No data available
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="sticky left-0 z-10 bg-white px-4 py-3 font-medium text-gray-900 dark:bg-gray-950/40 dark:text-white">
                      {row.partno || "-"}
                    </td>
                    <td className="sticky left-[200px] z-10 bg-white px-4 py-3 text-gray-600 dark:bg-gray-950/40 dark:text-gray-300">
                      {row.divisi || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.year}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.period}</td>
                    {dayColumns.map((day) => (
                      <td key={day} className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {formatNumber(row.days?.[day.toString()])}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            Showing {pagination.from} to {pagination.to} of {pagination.total} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <span className="px-2">
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(pagination.last_page, prev + 1))}
              disabled={currentPage === pagination.last_page}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionPlanManageTable;
