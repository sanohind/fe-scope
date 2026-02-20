import React, { useEffect, useState, useCallback } from "react";
import { inventoryRevApi } from "../../../services/api/dashboardApi";
import { useNavigate } from "react-router-dom";
// import DatePicker from "../../form/date-picker";

interface FgStockItem {
  partno: string;
  desc: string;
  location: string;
  customer: string;
  warehouse: string;
  onhand: number;
  min_stock: number;
  max_stock: number;
  qty_delivery: number;
  estimated_consumption: number;
  stock_status: string;
}

interface PaginationInfo {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

interface FinishGoodStockLevelTableProps {
  warehouse: string;
}

const NUMBER_FORMATTER = new Intl.NumberFormat("id-ID");

// Fungsi untuk mendapatkan styling berdasarkan status
const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
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
    case "low stock":
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
        label: status,
      };
  }
};

const FinishGoodStockLevelTable: React.FC<FinishGoodStockLevelTableProps> = ({ warehouse }) => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<FgStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  // Date filter (default to today)
  // const [selectedDate, setSelectedDate] = useState(() => {
  //   const now = new Date();
  //   const year = now.getFullYear();
  //   const month = String(now.getMonth() + 1).padStart(2, "0");
  //   const day = String(now.getDate()).padStart(2, "0");
  //   return `${year}-${month}-${day}`;
  // });

  const [selectedDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  // Customer filter (dikirim ke API)
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [availableCustomers, setAvailableCustomers] = useState<string[]>([]);

  // Debounce search input → searchTerm, reset page ke 1
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch data dari API setiap kali filter atau pagination berubah
  const fetchData = useCallback(async () => {
    if (!selectedDate) return;
    try {
      setLoading(true);
      setError(null);

      // Kirim semua parameter filter + pagination ke API
      const params: Record<string, string | number> = {
        page: currentPage,
        per_page: perPage,
        date_from: selectedDate,
        date_to: selectedDate,
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedCustomer) params.customer = selectedCustomer;

      const result = await inventoryRevApi.getFgStockLevelDetail(warehouse, params);

      if (result.data) {
        setRows(result.data || []);
        // Ekstrak daftar customer unik dari data yang di-fetch
        const uniqueCustomers = Array.from(
          new Set(
            (result.data as FgStockItem[])
              .map((item) => item.customer)
              .filter(Boolean)
          )
        ).sort() as string[];
        setAvailableCustomers(uniqueCustomers);
      }

      // Gunakan pagination dari response API
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [warehouse, currentPage, perPage, searchTerm, selectedCustomer, selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Finish Good Stock Level Detail</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Warehouse {warehouse}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Stock Level Data</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Detailed finish good stock information</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <input
              type="text"
              value={searchInput}
              placeholder="Search part number or description..."
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            {/* Date Picker (disabled) */}
            {/* <div className="w-64">
              <DatePicker
                id="date-picker-finish-good"
                mode="single"
                value={selectedDate.split("-").reverse().join("-")}
                defaultDate={selectedDate.split("-").reverse().join("-")}
                onChange={(selectedDates: Date[]) => {
                  if (selectedDates && selectedDates.length > 0) {
                    const date = selectedDates[0];
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    setSelectedDate(`${year}-${month}-${day}`);
                    setCurrentPage(1);
                  }
                }}
                placeholder="Select date"
              />
            </div> */}
            {/* Customer Filter */}
            <select
              value={selectedCustomer}
              onChange={(e) => {
                setSelectedCustomer(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Customers</option>
              {availableCustomers.map((customer) => (
                <option key={customer} value={customer}>
                  {customer}
                </option>
              ))}
            </select>
            {/* Per Page Selector */}
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {[25, 50, 100, 150, 200].map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
          <div className="max-h-[600px] overflow-auto" style={{ scrollbarWidth: "thin" }}>
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
              <thead className="bg-gray-50 text-left text-sm font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-400 sticky top-0">
                <tr>
                  <th className="px-4 py-3">Part Number</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3 text-right">Onhand</th>
                  <th className="px-4 py-3 text-right">Min Stock</th>
                  <th className="px-4 py-3 text-right">Max Stock</th>
                  <th className="px-4 py-3 text-right">Qty Delivery</th>
                  <th className="px-4 py-3 text-right">Est. Consumption</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-sm dark:divide-gray-800 dark:bg-gray-950/40">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                      No data available
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => {
                    const statusStyle = getStatusStyle(row.stock_status);
                    return (
                      <tr key={`${row.partno}-${index}`} className="hover:bg-gray-50 dark:hover:bg-white/5">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.partno || "-"}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.desc || "-"}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.location || "-"}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.customer || "-"}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">{formatNumber(row.onhand)}</td>
                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{formatNumber(row.min_stock)}</td>
                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{formatNumber(row.max_stock)}</td>
                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{formatNumber(row.qty_delivery)}</td>
                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{formatNumber(row.estimated_consumption)} days</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                            {statusStyle.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination dari API */}
        {pagination && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              Showing {pagination.from} to {pagination.to} of {pagination.total} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={pagination.current_page <= 1}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <span className="px-2">
                Page {pagination.current_page} of {pagination.last_page}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(pagination.last_page, prev + 1))}
                disabled={pagination.current_page >= pagination.last_page}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinishGoodStockLevelTable;
