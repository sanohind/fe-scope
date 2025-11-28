import React, { useEffect, useState } from "react";
import { productionApi } from "../../../services/api/dashboardApi";

interface OutstandingData {
  prod_no: string;
  planning_date: string;
  item: string;
  description: string;
  customer: string;
  qty_order: number;
  qty_delivery: number;
  qty_os: number;
  completion_percentage: number;
  status: string;
  divisi: string;
}

interface ProductionOutstandingAnalysisProps {
  divisi?: string;
}

const ProductionOutstandingAnalysis: React.FC<ProductionOutstandingAnalysisProps> = () => {
  const [data, setData] = useState<OutstandingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await productionApi.getProductionOutstandingAnalysis();
        // Handle if API returns wrapped data or direct array
        const dataArray = Array.isArray(result) ? result : result?.data || [];
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

  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return "bg-error-500";
    if (percentage >= 50 && percentage < 90) return "bg-warning-500";
    return "bg-success-500";
  };

  const getProgressBgColor = (percentage: number) => {
    if (percentage < 50) return "bg-error-100 dark:bg-error-900/20";
    if (percentage >= 50 && percentage < 90) return "bg-warning-100 dark:bg-warning-900/20";
    return "bg-success-100 dark:bg-success-900/20";
  };

  const getStatusBadgeColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("complete")) return "bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400";
    if (statusLower.includes("progress") || statusLower.includes("process")) return "bg-blue-light-100 text-blue-light-700 dark:bg-blue-light-900/20 dark:text-blue-light-400";
    if (statusLower.includes("pending")) return "bg-warning-100 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400";
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Production Outstanding Analysis</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded dark:bg-gray-800"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data.length) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Production Outstanding Analysis</h3>
        </div>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400 text-sm">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Production Outstanding Analysis</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Production orders with completion progress</p>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Prod No</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Item</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Customer</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Ordered</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Delivered</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Outstanding</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Progress</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">divisi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                <td className="px-4 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{item.prod_no || "-"}</td>
                <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{item.planning_date ? new Date(item.planning_date).toLocaleDateString() : "-"}</td>
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-800 dark:text-white/90">{item.item || "-"}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.description || "-"}</div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{item.customer || "-"}</td>
                <td className="px-4 py-4 text-sm text-right text-gray-800 dark:text-white/90">{(item.qty_order || 0).toLocaleString()}</td>
                <td className="px-4 py-4 text-sm text-right text-gray-800 dark:text-white/90">{(item.qty_delivery || 0).toLocaleString()}</td>
                <td className="px-4 py-4 text-sm text-right text-gray-800 dark:text-white/90">{(item.qty_os || 0).toLocaleString()}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 h-2 rounded-full ${getProgressBgColor(item.completion_percentage || 0)}`}>
                      <div className={`h-full rounded-full ${getProgressColor(item.completion_percentage || 0)}`} style={{ width: `${item.completion_percentage || 0}%` }}></div>
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[45px]">{(item.completion_percentage || 0).toFixed(1)}%</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(item.status || "")}`}>{item.status || "-"}</span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{item.divisi || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductionOutstandingAnalysis;
