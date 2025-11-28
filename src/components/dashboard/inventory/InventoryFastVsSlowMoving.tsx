import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { inventoryRevApi } from "../../../services/api/dashboardApi";

interface FastSlowMovingItem {
  partno: string;
  description: string;
  product_type: string;
  onhand: number;
  safety_stock: number;
  max_stock: number;
  gap_from_safety: number;
  trans_count: number;
  total_shipment: number;
  turnover_rate: number;
  stock_status: string;
  classification: string;
}

interface InventoryFastVsSlowMovingProps {
  warehouse: string;
  dateFrom?: string;
  dateTo?: string;
}

const InventoryFastVsSlowMoving: React.FC<InventoryFastVsSlowMovingProps> = ({ warehouse, dateFrom, dateTo }) => {
  const [data, setData] = useState<FastSlowMovingItem[]>([]);
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
        const result = await inventoryRevApi.getFastVsSlowMoving(warehouse, params);
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
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Fast vs Slow Moving Items</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  const getClassificationColor = (classification: string) => {
    const colors: Record<string, string> = {
      Healthy: "#12B76A",
      "High Risk": "#F04438",
      "Slow Moving": "#F79009",
      Review: "#6B7280",
    };
    return colors[classification] || "#6B7280";
  };

  const scatterData = data.map((item) => ({
    x: item.trans_count,
    y: item.onhand,
    z: item.turnover_rate,
    fillColor: getClassificationColor(item.classification),
    partno: item.partno,
    description: item.description,
    classification: item.classification,
    stock_status: item.stock_status,
  }));

  const options: ApexOptions = {
    chart: {
      type: "scatter",
      fontFamily: "Outfit, sans-serif",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: true,
        type: "xy",
      },
    },
    colors: scatterData.map((item) => item.fillColor),
    xaxis: {
      title: {
        text: "Transaction Count (Frequency)",
        style: {
          fontSize: "14px",
          fontWeight: 500,
        },
      },
      labels: {
        formatter: (val) => {
          return val.toLocaleString();
        },
      },
    },
    yaxis: {
      title: {
        text: "Onhand Stock",
        style: {
          fontSize: "14px",
          fontWeight: 500,
        },
      },
      labels: {
        formatter: (val) => {
          return val.toLocaleString();
        },
      },
    },
    tooltip: {
      custom: ({ dataPointIndex }) => {
        const item = scatterData[dataPointIndex];
        return `
          <div class="p-3 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
            <div class="text-sm font-semibold mb-2">${item.partno}</div>
            <div class="text-xs mb-1">${item.description}</div>
            <div class="text-xs mt-2 space-y-1">
              <div>Classification: <span class="font-medium">${item.classification}</span></div>
              <div>Status: <span class="font-medium">${item.stock_status}</span></div>
              <div>Transactions: <span class="font-medium">${item.x}</span></div>
              <div>Onhand: <span class="font-medium">${item.y.toLocaleString()}</span></div>
              <div>Turnover: <span class="font-medium">${item.z.toFixed(2)}</span></div>
            </div>
          </div>
        `;
      },
    },
    legend: {
      show: false,
    },
    grid: {
      borderColor: "#E4E7EC",
    },
  };

  const series = [
    {
      name: "Items",
      data: scatterData.map((item) => ({
        x: item.x,
        y: item.y,
        z: item.z,
      })),
    },
  ];

  // Create legend data
  const classifications = Array.from(new Set(data.map((item) => item.classification)));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Fast vs Slow Moving Items</h3>
        {dateRange && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(dateRange.from).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - {new Date(dateRange.to).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} ({dateRange.days} days)
          </span>
        )}
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {classifications.map((classification) => (
          <div key={classification} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getClassificationColor(classification) }}></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">{classification}</span>
          </div>
        ))}
      </div>
      <ReactApexChart options={options} series={series} type="scatter" height={400} />
    </div>
  );
};

export default InventoryFastVsSlowMoving;
