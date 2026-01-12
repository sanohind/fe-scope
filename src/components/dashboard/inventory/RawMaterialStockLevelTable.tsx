import React, { useEffect, useState } from "react";
import { inventoryRevApi } from "../../../services/api/dashboardApi";
import { useNavigate } from "react-router-dom";

interface RmStockItem {
  partno: string;
  desc: string;
  location: string;
  group_type_desc: string;
  warehouse: string;
  onhand: number;
  min_stock: number;
  max_stock: number;
  daily_use: number;
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

interface RawMaterialStockLevelTableProps {
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

const RawMaterialStockLevelTable: React.FC<RawMaterialStockLevelTableProps> = ({ warehouse }) => {
  const navigate = useNavigate();
  const [allRows, setAllRows] = useState<RmStockItem[]>([]); // Store all data from API
  const [filteredRows, setFilteredRows] = useState<RmStockItem[]>([]); // Filtered data for display
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  
  // Separate month and year filters
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  
  // Group type filter
  const [selectedGroupType, setSelectedGroupType] = useState("");
  const [availableGroupTypes, setAvailableGroupTypes] = useState<string[]>([]);

  // Generate month options (1-12)
  const monthOptions = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Generate year options (current year and 2 years back)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i <= 2; i++) {
      years.push((currentYear - i).toString());
    }
    return years;
  };

  const yearOptions = generateYearOptions();

  // Set default to current month and year
  useEffect(() => {
    const now = new Date();
    setSelectedMonth((now.getMonth() + 1).toString().padStart(2, "0"));
    setSelectedYear(now.getFullYear().toString());
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    if (!selectedMonth || !selectedYear) return;
    fetchData();
  }, [warehouse, searchTerm, selectedMonth, selectedYear]);

  // Apply frontend filters whenever allRows or filters change
  useEffect(() => {
    applyFilters();
  }, [allRows, selectedGroupType, currentPage, perPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date_from and date_to from selected month and year
      const firstDay = `${selectedYear}-${selectedMonth}-01`;
      const lastDay = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).toISOString().split("T")[0];

      const params: Record<string, string | number> = {
        page: 1,
        per_page: 9999, // Get all data for frontend filtering
        date_from: firstDay,
        date_to: lastDay,
      };

      if (searchTerm) params.search = searchTerm;

      const result = await inventoryRevApi.getRmStockLevelDetail(warehouse, params);

      if (result.data) {
        setAllRows(result.data || []);
        
        // Extract unique group types
        const uniqueGroupTypes = Array.from(new Set(result.data.map((item: RmStockItem) => item.group_type_desc).filter(Boolean))) as string[];
        setAvailableGroupTypes(uniqueGroupTypes.sort());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allRows];

    // Apply group type filter
    if (selectedGroupType) {
      filtered = filtered.filter((row) => row.group_type_desc === selectedGroupType);
    }

    // Calculate pagination
    const total = filtered.length;
    const lastPage = Math.ceil(total / perPage);
    const from = (currentPage - 1) * perPage + 1;
    const to = Math.min(currentPage * perPage, total);

    // Apply pagination
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedData = filtered.slice(startIndex, endIndex);

    setFilteredRows(paginatedData);
    setPagination({
      total,
      per_page: perPage,
      current_page: currentPage,
      last_page: lastPage,
      from: from > total ? 0 : from,
      to,
    });
  };

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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Raw Material Stock Level Detail</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Warehouse {warehouse}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Stock Level Data</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Detailed raw material stock information</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              value={searchInput}
              placeholder="Search part number or description..."
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={selectedGroupType}
              onChange={(e) => {
                setSelectedGroupType(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Group Types</option>
              {availableGroupTypes.map((groupType) => (
                <option key={groupType} value={groupType}>
                  {groupType}
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
                  <th className="px-4 py-3">Group Type</th>
                  <th className="px-4 py-3 text-right">Onhand</th>
                  <th className="px-4 py-3 text-right">Min Stock</th>
                  <th className="px-4 py-3 text-right">Max Stock</th>
                  <th className="px-4 py-3 text-right">Daily Use</th>
                  <th className="px-4 py-3 text-right">Est. Consumption</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-sm dark:divide-gray-800 dark:bg-gray-950/40">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                      No data available
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, index) => {
                    const statusStyle = getStatusStyle(row.stock_status);
                    return (
                      <tr key={`${row.partno}-${index}`} className="hover:bg-gray-50 dark:hover:bg-white/5">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.partno || "-"}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.desc || "-"}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.location || "-"}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.group_type_desc || "-"}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">{formatNumber(row.onhand)}</td>
                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{formatNumber(row.min_stock)}</td>
                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{formatNumber(row.max_stock)}</td>
                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{formatNumber(row.daily_use)}</td>
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
    </div>
  );
};

export default RawMaterialStockLevelTable;
