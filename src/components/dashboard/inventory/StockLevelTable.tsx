import React, { useEffect, useMemo, useState } from "react";
import { inventoryApi } from "../../../services/api/dashboardApi";

interface StockLevelRow {
  partno: string;
  part_name: string;
  unit: string;
  warehouse: string;
  onhand: number;
  min_stock: number;
  safety_stock: number;
  max_stock: number;
  status: "Critical" | "Low" | "Normal" | "Overstock";
}

interface PaginationInfo {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

const STATUS_OPTIONS: Array<{ label: string; value: string | null }> = [
  { label: "All Status", value: null },
  { label: "Critical", value: "Critical" },
  { label: "Low", value: "Low" },
  { label: "Normal", value: "Normal" },
  { label: "Overstock", value: "Overstock" },
];

const NUMBER_FORMATTER = new Intl.NumberFormat("id-ID");

const StockLevelTable: React.FC<{ warehouse?: string }> = ({ warehouse }) => {
  const [rows, setRows] = useState<StockLevelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(50);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params: Record<string, string | number> = {
          page: currentPage,
          per_page: perPage,
        };
        if (warehouse) params.warehouse = warehouse;
        if (statusFilter) params.status = statusFilter;
        if (searchTerm) params.search = searchTerm;

        const result = await inventoryApi.getStockLevelTable(params);
        setRows(result.data || []);
        setPagination(result.pagination || null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch stock level data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouse, statusFilter, searchTerm, currentPage, perPage]);

  const statusStyles = useMemo(
    () => ({
      Critical: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
      Low: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
      Normal: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
      Overstock: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    }),
    []
  );

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
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Global Stock Level Detail</h3>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Stock Level Detail</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">All monitored warehouses</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={searchInput}
            placeholder="Search part no or name..."
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-56 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <select
            value={statusFilter ?? ""}
            onChange={(e) => {
              setStatusFilter(e.target.value || null);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.label} value={option.value ?? ""}>
                {option.label}
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
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="max-h-[520px] overflow-auto" style={{ scrollbarWidth: "thin" }}>
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
            <thead className="bg-gray-50 text-left text-sm font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Warehouse</th>
                <th className="px-4 py-3">Part Number</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3 text-right">Onhand</th>
                <th className="px-4 py-3 text-right">Safety Stock</th>
                <th className="px-4 py-3 text-right">Min Stock</th>
                <th className="px-4 py-3 text-right">Max Stock</th>
                <th className="px-4 py-3 text-right">Gap to Safety</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm dark:divide-gray-800 dark:bg-gray-950/40">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                    No stock data available
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const gapToSafety = row.safety_stock - row.onhand;
                  return (
                    <tr key={`${row.partno}-${row.warehouse}`} className="hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.warehouse}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.partno}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.part_name || "-"}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.unit || "-"}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">{formatNumber(row.onhand)}</td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{formatNumber(row.safety_stock)}</td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{formatNumber(row.min_stock)}</td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{formatNumber(row.max_stock)}</td>
                      <td className={`px-4 py-3 text-right font-medium ${gapToSafety > 0 ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-300"}`}>
                        {gapToSafety > 0 ? `-${formatNumber(Math.abs(gapToSafety))}` : formatNumber(Math.abs(gapToSafety))}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[row.status]}`}>{row.status}</span>
                      </td>
                    </tr>
                  );
                })
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

export default StockLevelTable;
