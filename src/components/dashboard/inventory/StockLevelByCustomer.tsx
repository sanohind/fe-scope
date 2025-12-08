import React, { useEffect, useState } from "react";
import { inventoryRevApi } from "../../../services/api/dashboardApi";
import { InventoryFilterRequestParams, inventoryFiltersToQuery } from "../../../context/InventoryFilterContext";

interface StockLevelByCustomerRow {
  customer: string;
  total_items: number;
  total_onhand: number;
  total_min_stock: number;
  total_safety_stock: number;
  total_max_stock: number;
  critical_count: number;
  low_count: number;
  normal_count: number;
  overstock_count: number;
  gap_from_safety: number;
}

interface PaginationInfo {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

interface StockLevelByCustomerProps {
  warehouse: string;
  filters?: InventoryFilterRequestParams;
}

const NUMBER_FORMATTER = new Intl.NumberFormat("id-ID");

const StockLevelByCustomer: React.FC<StockLevelByCustomerProps> = ({ warehouse, filters }) => {
  const [rows, setRows] = useState<StockLevelByCustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

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
        if (searchTerm) params.search = searchTerm;
        Object.assign(params, inventoryFiltersToQuery(filters));

        const result = await inventoryRevApi.getStockLevelByCustomer(warehouse, params);

        // Convert string values to numbers
        const processedData = (result.data || []).map((row: any) => ({
          ...row,
          total_onhand: typeof row.total_onhand === "string" ? parseFloat(row.total_onhand) : row.total_onhand,
          total_min_stock: typeof row.total_min_stock === "string" ? parseFloat(row.total_min_stock) : row.total_min_stock,
          total_safety_stock: typeof row.total_safety_stock === "string" ? parseFloat(row.total_safety_stock) : row.total_safety_stock,
          total_max_stock: typeof row.total_max_stock === "string" ? parseFloat(row.total_max_stock) : row.total_max_stock,
          gap_from_safety: typeof row.gap_from_safety === "string" ? parseFloat(row.gap_from_safety) : row.gap_from_safety,
        }));

        setRows(processedData);
        setPagination(result.pagination || null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch stock level by customer");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouse, searchTerm, currentPage, perPage, filters]);

  const formatNumber = (value: number) => NUMBER_FORMATTER.format(value ?? 0);

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

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Stock Level by Customer</h3>
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
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Stock Level by Customer</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Warehouse {warehouse}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={searchInput}
            placeholder="Search customer..."
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-56 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
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
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3 text-right">Total Items</th>
                <th className="px-4 py-3 text-right">Onhand</th>
                <th className="px-4 py-3 text-right">Min Stock</th>
                <th className="px-4 py-3 text-right">Safety Stock</th>
                <th className="px-4 py-3 text-right">Max Stock</th>
                <th className="px-4 py-3 text-right">Gap from Safety</th>
                <th className="px-4 py-3 text-center">Critical</th>
                <th className="px-4 py-3 text-center">Low</th>
                <th className="px-4 py-3 text-center">Normal</th>
                <th className="px-4 py-3 text-center">Overstock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm dark:divide-gray-800 dark:bg-gray-950/40">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                    No stock data available
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.customer} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.customer || "-"}</td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{formatNumber(row.total_items)}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">{formatNumber(row.total_onhand)}</td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{formatNumber(row.total_min_stock)}</td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{formatNumber(row.total_safety_stock)}</td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{formatNumber(row.total_max_stock)}</td>
                    <td className={`px-4 py-3 text-right font-medium ${row.gap_from_safety > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>{formatNumber(row.gap_from_safety)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">{row.critical_count}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">{row.low_count}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">{row.normal_count}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">{row.overstock_count}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div></div>
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

export default StockLevelByCustomer;
