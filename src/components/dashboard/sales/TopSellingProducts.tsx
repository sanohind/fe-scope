import React, { useEffect, useState } from "react";
import { salesApi } from "../../../services/api/dashboardApi";

interface ProductData {
  rank: number;
  part_no: string;
  old_partno: string;
  cust_partname: string;
  total_qty_sold: number;
  total_amount: number;
  number_of_orders: number;
  avg_price: number;
}

const TopSellingProducts: React.FC = () => {
  const [data, setData] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await salesApi.getTopProducts({ limit: 10 });
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

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
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
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Top 10 Selling Products</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Top 10 Selling Products</h3>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 w-16">Rank</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Part No</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Old Part No</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Customer Part Name</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Total Qty Sold</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Orders</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Avg Price</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={`${item.part_no}-${index}`} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{item.rank}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">{item.part_no}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{item.old_partno || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{item.cust_partname || "-"}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">{item.total_qty_sold.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-800 dark:text-white/90">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(item.total_amount)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">{item.number_of_orders.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(item.avg_price)}
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

export default TopSellingProducts;
