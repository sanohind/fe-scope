import React, { useEffect, useState } from "react";
import { procurementApi } from "../../../services/api/dashboardApi";

interface OutstandingPoData {
  po_no: string;
  bp_name: string;
  part_no: string;
  item_desc: string;
  request_qty: number;
  actual_receipt_qty: number;
  pending_qty: number;
  actual_receipt_date: string;
  days_outstanding: number;
  is_final_receipt: boolean;
}

const OutstandingPoAnalysis: React.FC = () => {
  const [data, setData] = useState<OutstandingPoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await procurementApi.getOutstandingPoAnalysis();
        const dataArray = Array.isArray(result) ? result : [];
        setData(dataArray);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded dark:bg-gray-800 mb-6"></div>
        <div className="h-96 bg-gray-200 rounded dark:bg-gray-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-error-200 bg-error-50 p-5 dark:border-error-800 dark:bg-error-900/20">
        <p className="text-error-600 dark:text-error-400">{error}</p>
      </div>
    );
  }

  const getStatusColor = (days: number) => {
    if (days > 30) return "bg-error-50 text-error-700 dark:bg-error-900/20 dark:text-error-400";
    if (days >= 15) return "bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400";
    return "bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400";
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Outstanding PO Analysis
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Purchase orders with pending receipts
        </p>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                PO No
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Item
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Request Qty
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Receipt Qty
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pending Qty
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Receipt Date
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Days Outstanding
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {data.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No outstanding PO data available
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                    {item.po_no}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {item.bp_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    <div>{item.part_no}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.item_desc}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                    {item.request_qty.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                    {item.actual_receipt_qty.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-800 dark:text-white/90">
                    {item.pending_qty.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {item.actual_receipt_date || '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.days_outstanding)}`}>
                      {item.days_outstanding} days
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.is_final_receipt
                        ? "bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400"
                        : "bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400"
                    }`}>
                      {item.is_final_receipt ? "Final" : "Partial"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OutstandingPoAnalysis;
