import React, { useEffect, useState } from "react";
import { inventoryRevApi } from "../../../services/api/dashboardApi";
import { InventoryFilterRequestParams, inventoryFiltersToQuery } from "../../../context/InventoryFilterContext";
import { useNavigate } from "react-router-dom";

interface StockLevelRow {
  group_type_desc: string;
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
  daily_use: number;
  estimatedConsumption: number;
}

interface PaginationInfo {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

interface InventoryLevelStockProps {
  warehouse: string;
  filters?: InventoryFilterRequestParams;
}

const NUMBER_FORMATTER = new Intl.NumberFormat("id-ID");

// Fungsi untuk menentukan status berdasarkan Estimated Consumption
const getStatus = (estimatedConsumption: number, dailyUse: number): "critical" | "low" | "normal" | "overstock" | "undefined" => {
  if (dailyUse === 0 && estimatedConsumption === 0) return "undefined";
  if (estimatedConsumption <= 0) return "critical";
  if (estimatedConsumption <= 3) return "low";
  if (estimatedConsumption <= 9) return "normal";
  return "overstock";
};

// Fungsi untuk mendapatkan styling berdasarkan status
const getStatusStyle = (status: string) => {
  switch (status) {
    case "undefined":
      return {
        bg: "bg-gray-50 dark:bg-gray-800",
        text: "text-gray-700 dark:text-gray-400",
        label: "Undefined",
      };
    case "critical":
      return {
        bg: "bg-red-50 dark:bg-red-900/20",
        text: "text-red-700 dark:text-red-400",
        label: "Critical",
      };
    case "low":
      return {
        bg: "bg-orange-50 dark:bg-orange-900/20",
        text: "text-orange-700 dark:text-orange-400",
        label: "Low",
      };
    case "normal":
      return {
        bg: "bg-green-50 dark:bg-green-900/20",
        text: "text-green-700 dark:text-green-400",
        label: "Normal",
      };
    case "overstock":
      return {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        text: "text-blue-700 dark:text-blue-400",
        label: "Overstock",
      };

    default:
      return {
        bg: "bg-gray-50 dark:bg-gray-800",
        text: "text-gray-700 dark:text-gray-400",
        label: "Unknown",
      };
  }
};

const InventoryLevelStock: React.FC<InventoryLevelStockProps> = ({ warehouse, filters }) => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<StockLevelRow[]>([]);
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

        // Adjust date range based on period
        const adjustedFilters: InventoryFilterRequestParams = filters || {
          period: "daily",
          date_from: new Date().toISOString().split("T")[0],
          date_to: new Date().toISOString().split("T")[0],
        };

        if (adjustedFilters.period === "daily") {
          // Set date_from and date_to to today for daily period
          const today = new Date().toISOString().split("T")[0];
          adjustedFilters.date_from = today;
          adjustedFilters.date_to = today;
        } else if (adjustedFilters.period === "monthly") {
          // Set date_from to 1st of current month and date_to to last day of current month
          const now = new Date();
          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
          const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
          adjustedFilters.date_from = firstDay;
          adjustedFilters.date_to = lastDay;
        }

        const params: Record<string, string | number> = {
          page: currentPage,
          per_page: perPage,
        };
        if (searchTerm) params.search = searchTerm;

        // Use adjusted filters for query
        Object.assign(params, inventoryFiltersToQuery(adjustedFilters));

        const result = await inventoryRevApi.getStockLevelTable(warehouse, params);
        setRows(result.data || []);
        setPagination(result.pagination || null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch stock level");
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
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Stock Level Overview</h3>
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
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Stock Level by Group Type</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Warehouse {warehouse}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate(`/inventory/${warehouse.toLowerCase()}/stock-detail`)}
            className="rounded-lg border border-brand-500 bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 dark:border-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700"
          >
            Stock Detail
          </button>
          <input
            type="text"
            value={searchInput}
            placeholder="Search group type..."
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
                <th className="px-4 py-3">Group Type</th>
                <th className="px-4 py-3 text-right">Total Items</th>
                <th className="px-4 py-3 text-right">Onhand</th>
                <th className="px-4 py-3 text-right">Daily Use</th>
                <th className="px-4 py-3 text-right">Estimated Consumption</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm dark:divide-gray-800 dark:bg-gray-950/40">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                    No stock data available
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const status = getStatus(row.estimatedConsumption, row.daily_use);
                  const statusStyle = getStatusStyle(status);

                  return (
                    <tr key={row.group_type_desc} className="hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.group_type_desc || "-"}</td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{formatNumber(row.total_items)}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">{formatNumber(row.total_onhand)}</td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{formatNumber(row.daily_use)}</td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{formatNumber(row.estimatedConsumption)} days</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>{statusStyle.label}</span>
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

export default InventoryLevelStock;
