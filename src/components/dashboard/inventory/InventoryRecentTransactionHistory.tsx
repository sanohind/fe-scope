import React, { useEffect, useState } from "react";
import { inventoryRevApi } from "../../../services/api/dashboardApi";

interface TransactionHistory {
  trans_date: string;
  trans_id: string;
  partno: string;
  part_desc: string;
  trans_type: string;
  order_type: string;
  order_no: string;
  receipt: number;
  shipment: number;
  qty: number;
  qty_after_trans: number;
  current_onhand: number;
  variance: number;
  location: string;
  user: string;
  lotno: string;
  movement_type: string;
}

interface PaginationInfo {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

interface InventoryRecentTransactionHistoryProps {
  warehouse: string;
  dateFrom?: string;
  dateTo?: string;
}

const InventoryRecentTransactionHistory: React.FC<InventoryRecentTransactionHistoryProps> = ({ warehouse, dateFrom, dateTo }) => {
  const [data, setData] = useState<TransactionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [transTypeFilter, setTransTypeFilter] = useState<string>("");
  const [userFilter, setUserFilter] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params: any = {
          page: currentPage,
          per_page: perPage,
        };
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (transTypeFilter) params.trans_type = transTypeFilter;
        if (userFilter) params.user = userFilter;
        const result = await inventoryRevApi.getRecentTransactionHistory(warehouse, params);
        setData(result.data || []);
        setPagination(result.pagination || null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouse, dateFrom, dateTo, currentPage, perPage, transTypeFilter, userFilter]);

  const getMovementTypeColor = (movementType: string) => {
    if (movementType === "IN") {
      return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400";
    } else if (movementType === "OUT") {
      return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400";
    }
    return "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400";
  };

  const getQtyColor = (qty: number) => {
    if (qty > 0) {
      return "text-green-600 dark:text-green-400";
    } else if (qty < 0) {
      return "text-red-600 dark:text-red-400";
    }
    return "text-gray-600 dark:text-gray-400";
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded dark:bg-gray-800 w-48 mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded dark:bg-gray-800"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Recent Transaction History</h3>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5 flex flex-col h-full">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Recent Transaction History</h3>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Filter by Trans Type"
            value={transTypeFilter}
            onChange={(e) => {
              setTransTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <input
            type="text"
            placeholder="Filter by User"
            value={userFilter}
            onChange={(e) => {
              setUserFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-full overflow-x-auto h-full">
          <div className="overflow-y-auto h-[600px]" style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e0 transparent" }}>
            <table className="w-full min-w-[1400px]">
              <thead className="sticky top-0 bg-white dark:bg-gray-900 z-10">
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Trans ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Part No</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Order No</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Receipt</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Shipment</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Qty</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Onhand</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Variance</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Lot No</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Movement</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No data available
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr key={`${item.trans_id}-${index}`} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {item.trans_date ? new Date(item.trans_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">{item.trans_id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">{item.partno}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{item.part_desc}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {item.trans_type} / {item.order_type}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{item.order_no}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">{item.receipt > 0 ? item.receipt.toLocaleString() : "-"}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">{item.shipment > 0 ? item.shipment.toLocaleString() : "-"}</td>
                      <td className={`px-4 py-3 text-right text-sm font-medium ${getQtyColor(item.qty)}`}>{item.qty >= 0 ? `+${item.qty.toLocaleString()}` : item.qty.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">{item.current_onhand.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">{item.variance !== 0 ? (item.variance > 0 ? `+${item.variance.toLocaleString()}` : item.variance.toLocaleString()) : "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{item.location}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{item.user}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{item.lotno || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getMovementTypeColor(item.movement_type)}`}>{item.movement_type}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {pagination && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {pagination.from} to {pagination.to} of {pagination.total} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(pagination.last_page, prev + 1))}
              disabled={currentPage === pagination.last_page}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryRecentTransactionHistory;
