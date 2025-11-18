import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { inventoryRevApi } from "../../../services/api/dashboardApi";

interface ActiveItem {
  partno: string;
  description: string;
  product_type: string;
  trans_count: number;
  total_receipt: number;
  total_shipment: number;
  current_onhand: number;
  safety_stock: number;
  stock_status: string;
  activity_level: string;
}

interface InventoryMostActiveItemsProps {
  warehouse: string;
  dateFrom?: string;
  dateTo?: string;
}

const InventoryMostActiveItems: React.FC<InventoryMostActiveItemsProps> = ({ warehouse, dateFrom, dateTo }) => {
  const [data, setData] = useState<ActiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: string; to: string; days: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params: any = {};
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        const result = await inventoryRevApi.getMostActiveItems(warehouse, params);
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
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Top 15 Most Active Items</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Critical: "#DC3545",
      Low: "#FD7E14",
      Normal: "#28A745",
      Overstock: "#007BFF",
    };
    return colors[status] || "#6B7280";
  };

  const categories = data.map((item) => item.partno);
  const transCounts = data.map((item) => item.trans_count);
  const colors = data.map((item) => getStatusColor(item.stock_status));

  const options: ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "Outfit, sans-serif",
      horizontal: true,
      toolbar: {
        show: false,
      },
    },
    colors: colors,
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 5,
        borderRadiusApplication: "end",
        dataLabels: {
          position: "right",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => {
        return val.toString();
      },
    },
    xaxis: {
      categories: categories,
      title: {
        text: "Transaction Count",
        style: {
          fontSize: "14px",
          fontWeight: 500,
        },
      },
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val: number, { dataPointIndex }) => {
          const item = data[dataPointIndex];
          return `
            <div class="text-left">
              <div><strong>${item.description}</strong></div>
              <div>Transactions: ${item.trans_count}</div>
              <div>Receipt: ${item.total_receipt.toLocaleString()}</div>
              <div>Shipment: ${item.total_shipment.toLocaleString()}</div>
              <div>Onhand: ${item.current_onhand.toLocaleString()}</div>
              <div>Status: ${item.stock_status}</div>
              <div>Activity: ${item.activity_level}</div>
            </div>
          `;
        },
      },
    },
    grid: {
      borderColor: "#E4E7EC",
    },
  };

  const series = [
    {
      name: "Transaction Count",
      data: transCounts,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Top 15 Most Active Items</h3>
        {dateRange && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(dateRange.from).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - {new Date(dateRange.to).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} ({dateRange.days} days)
          </span>
        )}
      </div>
      <ReactApexChart options={options} series={series} type="bar" height={500} />
    </div>
  );
};

export default InventoryMostActiveItems;
