import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { inventoryRevApi } from "../../../services/api/dashboardApi";

interface StockHealthData {
  stock_status: string;
  item_count: number;
  total_onhand: number;
  trans_count: number;
  total_shipment: number;
}

interface InventoryStockHealthDistributionProps {
  warehouse: string;
  dateFrom?: string;
  dateTo?: string;
}

const InventoryStockHealthDistribution: React.FC<InventoryStockHealthDistributionProps> = ({ 
  warehouse, 
  dateFrom, 
  dateTo 
}) => {
  const [data, setData] = useState<StockHealthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params: any = {};
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        const result = await inventoryRevApi.getStockHealthDistribution(warehouse, params);
        setData(result.data || []);
        setDateRange(result.date_range || null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouse, dateFrom, dateTo]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded dark:bg-gray-800 w-48 mb-6"></div>
          <div className="h-80 bg-gray-200 rounded dark:bg-gray-800"></div>
        </div>
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Stock Health Distribution
        </h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">
            {error || "No data available"}
          </p>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    Critical: "#DC3545",
    "Low Stock": "#FD7E14",
    Normal: "#28A745",
    Overstock: "#007BFF",
  };

  const labels = data.map((item) => item.stock_status);
  const itemCounts = data.map((item) => Number(item.item_count));

  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Outfit, sans-serif",
      toolbar: {
        show: false,
      },
    },
    colors: data.map((item) => statusColors[item.stock_status] || "#6B7280"),
    labels: labels,
    dataLabels: {
      enabled: true,
      formatter: (val: number) => {
        return `${val.toFixed(1)}%`;
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontWeight: 600,
            },
            value: {
              show: true,
              fontSize: "16px",
              fontWeight: 700,
              formatter: (val: string) => {
                // ✅ FIX: Gunakan val langsung sebagai angka item_count
                return Number(val).toLocaleString();
              },
            },
            total: {
              show: true,
              label: "Total Items",
              fontSize: "14px",
              fontWeight: 600,
              formatter: () => {
                // ✅ FIX: Pastikan sum menggunakan Number() untuk menghindari string concatenation
                const total = data.reduce((sum, item) => sum + Number(item.item_count), 0);
                return total.toLocaleString();
              },
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val: number, { seriesIndex }) => {
          const item = data[seriesIndex];
          return `
            <div style="text-align: left; padding: 4px;">
              <div><strong>Items:</strong> ${Number(item.item_count).toLocaleString()}</div>
              <div><strong>Onhand:</strong> ${Number(item.total_onhand).toLocaleString()}</div>
              <div><strong>Transactions:</strong> ${Number(item.trans_count).toLocaleString()}</div>
              <div><strong>Shipment:</strong> ${Number(item.total_shipment).toLocaleString()}</div>
            </div>
          `;
        },
      },
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "14px",
    },
  };

  const series = itemCounts;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Stock Health Distribution
        </h3>
        {dateRange && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(dateRange.from).toLocaleDateString("id-ID", { 
              day: "numeric", 
              month: "short" 
            })}{" - "}
            {new Date(dateRange.to).toLocaleDateString("id-ID", { 
              day: "numeric", 
              month: "short", 
              year: "numeric" 
            })}
          </span>
        )}
      </div>
      <ReactApexChart 
        options={options} 
        series={series} 
        type="donut" 
        height={400} 
      />
    </div>
  );
};

export default InventoryStockHealthDistribution;