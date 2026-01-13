import React, { useEffect, useState, useMemo } from "react";
import { SupplyChainApi } from "../../../services/api/dashboardApi";

interface ShipmentRow {
  shipment: string;
  shipment_status: string;
  customer_po: string;
  delivery_date: string;
  shipment_reference: string;
  product_type?: string;
  lead_time: number;
}

interface PaginationInfo {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

interface Filters {
  search: string;
  sort_by: string;
  sort_order: string;
  shipment_status: string;
}

interface LeadTimeKPI {
  current: number;
  range_4_7: number;
  range_7_12: number;
  over_12: number;
}

const NUMBER_FORMATTER = new Intl.NumberFormat("id-ID");

const ShipmentTable: React.FC = () => {
  const [rows, setRows] = useState<ShipmentRow[]>([]);
  const [allRows, setAllRows] = useState<ShipmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [filters, setFilters] = useState<Filters | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sortBy, setSortBy] = useState("lead_time");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch all data for KPI calculation
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const result = await SupplyChainApi.getShipmentTable({
          page: 1,
          per_page: "all" as any,
        });

        setAllRows(result.data || []);
      } catch (err) {
        console.error("Error fetching all shipment data for KPI:", err);
        setAllRows([]);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const result = await SupplyChainApi.getShipmentTable({
          page: currentPage,
          per_page: perPage,
          sort_by: sortBy,
          sort_order: sortOrder,
          ...(searchTerm && { search: searchTerm }),
        });

        setRows(result.data || []);
        setPagination(result.pagination || null);
        setFilters(result.filters || null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch shipment data");
        setRows([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTerm, currentPage, perPage, sortBy, sortOrder]);

  const formatNumber = (value: number) => NUMBER_FORMATTER.format(value ?? 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const getLeadTimeColor = (leadTime: number) => {
    if (leadTime <= 7) return "text-green-600 dark:text-green-400";
    if (leadTime <= 14) return "text-yellow-600 dark:text-yellow-400";
    if (leadTime <= 21) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  // Calculate lead time KPI from all rows
  const leadTimeKPI = useMemo(() => {
    const kpi: LeadTimeKPI = {
      current: 0,
      range_4_7: 0,
      range_7_12: 0,
      over_12: 0,
    };

    allRows.forEach((row) => {
      if (row.lead_time <= 3) kpi.current++;
      else if (row.lead_time >= 4 && row.lead_time <= 7) kpi.range_4_7++;
      else if (row.lead_time > 7 && row.lead_time <= 12) kpi.range_7_12++;
      else if (row.lead_time > 12) kpi.over_12++;
    });

    return kpi;
  }, [allRows]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) {
      return (
        <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortOrder === "asc" ? (
      <svg className="ml-1 h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="ml-1 h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

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
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Shipment Overview</h3>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lead Time KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Current (≤3 days) */}
        <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
          <div className="text-left">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">≤ 3 days</p>
            <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">{formatNumber(leadTimeKPI.current)}</p>
          </div>
        </div>

        {/* 4-7 days */}
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
          <div className="text-left">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">4-7 Days</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">4 - 7 days</p>
            <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(leadTimeKPI.range_4_7)}</p>
          </div>
        </div>

        {/* 7-12 days */}
        <div className="rounded-xl border-2 border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-900/20">
          <div className="text-left">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">7-12 Days</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">7 - 12 days</p>
            <p className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-400">{formatNumber(leadTimeKPI.range_7_12)}</p>
          </div>
        </div>

        {/* Over 12 days */}
        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <div className="text-left">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Over 12 Days</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">&gt; 12 days</p>
            <p className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">{formatNumber(leadTimeKPI.over_12)}</p>
          </div>
        </div>
      </div>

      {/* Shipment Table */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Shipment Detail</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Status: <span className="font-medium text-green-600 dark:text-green-400">{filters?.shipment_status || "Approved"}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              value={searchInput}
              placeholder="Search shipment or PO..."
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-56 rounded-lg border border-gray-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
          <div className="max-h-[600px] overflow-auto" style={{ scrollbarWidth: "thin" }}>
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
              <thead className="sticky top-0 bg-gray-50 text-left text-sm font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                <tr>
                  <th className="cursor-pointer px-4 py-3 transition hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort("shipment")}>
                    <div className="flex items-center">
                      Shipment
                      {renderSortIcon("shipment")}
                    </div>
                  </th>
                  <th className="px-4 py-3">Status</th>
                  <th className="cursor-pointer px-4 py-3 transition hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort("customer_po")}>
                    <div className="flex items-center">
                      Customer PO
                      {renderSortIcon("customer_po")}
                    </div>
                  </th>
                  <th className="px-4 py-3">Product Type</th>
                  <th className="px-4 py-3">Shipment Reference</th>
                  <th className="cursor-pointer px-4 py-3 transition hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort("delivery_date")}>
                    <div className="flex items-center">
                      Delivery Date
                      {renderSortIcon("delivery_date")}
                    </div>
                  </th>
                  <th className="cursor-pointer px-4 py-3 transition hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort("lead_time")}>
                    <div className="flex items-center justify-center">
                      Lead Time
                      {renderSortIcon("lead_time")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-sm dark:divide-gray-800 dark:bg-gray-950/40">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                      No shipment data available
                    </td>
                  </tr>
                ) : (
                  rows.map((row: ShipmentRow) => (
                    <tr key={row.shipment} className="transition hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.shipment}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">{row.shipment_status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.customer_po}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.product_type ?? "-"}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.shipment_reference ?? "-"}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatDate(row.delivery_date)}</td>
                      <td className={`px-4 py-3 text-center font-semibold ${getLeadTimeColor(row.lead_time)}`}>{formatNumber(row.lead_time)} days</td>
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
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <span className="px-2">
                Page {pagination.current_page} of {pagination.last_page}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(pagination.last_page, prev + 1))}
                disabled={currentPage === pagination.last_page}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
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

export default ShipmentTable;
