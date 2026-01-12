import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { inventoryRevApi } from "../../../services/api/dashboardApi";
import { InventoryFilterRequestParams, inventoryFiltersToQuery } from "../../../context/InventoryFilterContext";
import { useTheme } from "../../../context/ThemeContext";

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

interface NonActiveItem extends ActiveItem {
  days_since_last_trans: number;
}

interface InventoryMostActiveItemsProps {
  warehouse: string;
  dateFrom?: string;
  dateTo?: string;
  filters?: InventoryFilterRequestParams;
}

const InventoryMostActiveItems: React.FC<InventoryMostActiveItemsProps> = ({ warehouse, dateFrom, dateTo, filters }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const [activeData, setActiveData] = useState<ActiveItem[]>([]);
  const [nonActiveData, setNonActiveData] = useState<NonActiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: string; to: string; days: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params: Record<string, string> = {};
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        Object.assign(params, inventoryFiltersToQuery(filters));
        const result = await inventoryRevApi.getMostActiveItems(warehouse, params);
        setActiveData(result.most_active_items || result.data || []);
        setNonActiveData(result.most_non_active_items || []);
        setDateRange(result.date_range || null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [warehouse, dateFrom, dateTo, filters]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded dark:bg-gray-800 w-48 mb-6"></div>
              <div className="h-80 bg-gray-200 rounded dark:bg-gray-800"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Active VS Non-active</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error}</p>
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
      "At Risk": "#DC3545",
    };
    return colors[status] || "#6B7280";
  };

  // Active Items Chart Options
  const activeCategories = activeData.map((item) => item.partno);
  const activeTransCounts = activeData.map((item) => Number(item.trans_count));
  const activeColors = activeData.map((item) => getStatusColor(item.stock_status));

  const activeOptions: ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },
    colors: activeColors,
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 5,
        borderRadiusApplication: "end",
        distributed: true,
        dataLabels: { position: "right" },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val.toString(),
      style: {
        fontSize: "11px",
        colors: [isDarkMode ? "#ffffff" : "#000000"],
      },
    },
    legend: { show: false },
    xaxis: {
      categories: activeCategories,
      title: { text: "Transaction Count", style: { fontSize: "12px", fontWeight: 500 } },
      labels: { style: { fontSize: "10px" } },
    },
    yaxis: {
      labels: { style: { fontSize: "10px" }, maxWidth: 150 },
    },
    tooltip: {
      custom: ({ dataPointIndex }) => {
        const item = activeData[dataPointIndex];
        return `
          <div class="p-3 text-sm">
            <div class="font-bold mb-1 text-gray-600 dark:text-gray-300">${item.description}</div>
            <div class='text-gray-600 dark:text-gray-400'>Part No: ${item.partno}</div>
            <div class='text-gray-600 dark:text-gray-400'>Transactions: ${item.trans_count}</div>
            <div class='text-gray-600 dark:text-gray-400'>Receipt: ${Number(item.total_receipt).toLocaleString()}</div>
            <div class='text-gray-600 dark:text-gray-400'>Shipment: ${Number(item.total_shipment).toLocaleString()}</div>
            <div class='text-gray-600 dark:text-gray-400'>Onhand: ${Number(item.current_onhand).toLocaleString()}</div>
            <div class='text-gray-600 dark:text-gray-400'>Status: <span style="color:${getStatusColor(item.stock_status)}">${item.stock_status}</span></div>
            <div class='text-gray-600 dark:text-gray-400'>Activity: ${item.activity_level}</div>
          </div>
        `;
      },
    },
    grid: { borderColor: "#E4E7EC" },
  };

  const activeSeries = [{ name: "Transaction Count", data: activeTransCounts }];

  // Non-Active Items Chart Options
  const nonActiveCategories = nonActiveData.map((item) => item.partno);
  const nonActiveDays = nonActiveData.map((item) => Number(item.days_since_last_trans));

  const nonActiveOptions: ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },
    colors: ["#DC3545"],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 5,
        borderRadiusApplication: "end",
        dataLabels: { position: "right" },
      },
    },
    dataLabels: {
    enabled: true,
      formatter: (val: number) => `${val} days`,
      style: {
        fontSize: "11px",
        colors: [isDarkMode ? "#ffffff" : "#000000"],
      },
    },
    legend: { show: false },
    xaxis: {
      categories: nonActiveCategories,
      title: { text: "Days Since Last Transaction", style: { fontSize: "12px", fontWeight: 500 } },
      labels: { style: { fontSize: "10px" } },
    },
    yaxis: {
      labels: { style: { fontSize: "10px" }, maxWidth: 150 },
    },
    tooltip: {
      custom: ({ dataPointIndex }) => {
        const item = nonActiveData[dataPointIndex];
        return `
          <div class="p-3 text-sm">
            <div class="font-bold mb-1 text-gray-600 dark:text-gray-300">${item.description}</div>
            <div class='text-gray-600 dark:text-gray-400'>Part No: ${item.partno}</div>
            <div class='text-gray-600 dark:text-gray-400'>Days Inactive: ${item.days_since_last_trans} days</div>
            <div class='text-gray-600 dark:text-gray-400'>Onhand: ${Number(item.current_onhand).toLocaleString()}</div>
            <div class='text-gray-600 dark:text-gray-400'>Safety Stock: ${Number(item.safety_stock).toLocaleString()}</div>
            <div class='text-gray-600 dark:text-gray-400'>Status: <span style="color:${getStatusColor(item.stock_status)}">${item.stock_status}</span></div>
            <div class='text-gray-600 dark:text-gray-400'>Activity: ${item.activity_level}</div>
          </div>
        `;
      },
    },
    grid: { borderColor: "#E4E7EC" },
  };

  const nonActiveSeries = [{ name: "Days Inactive", data: nonActiveDays }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Most Active Items */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Top 15 Most Active Items</h3>
          </div>
          {dateRange && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(dateRange.from).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - {new Date(dateRange.to).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} (
              {Math.round(dateRange.days)} days)
            </span>
          )}
        </div>
        {activeData.length > 0 ? <ReactApexChart options={activeOptions} series={activeSeries} type="bar" height={500} /> : <div className="flex items-center justify-center h-80 text-gray-500">No active items data available</div>}
      </div>

      {/* Most Non-Active Items */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Top 15 Most Non-Active Items</h3>
          </div>
          {dateRange && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(dateRange.from).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - {new Date(dateRange.to).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} (
              {Math.round(dateRange.days)} days)
            </span>
          )}
        </div>
        {nonActiveData.length > 0 ? (
          <ReactApexChart options={nonActiveOptions} series={nonActiveSeries} type="bar" height={500} />
        ) : (
          <div className="flex items-center justify-center h-80 text-gray-500">No non-active items data available</div>
        )}
      </div>
    </div>
  );
};

export default InventoryMostActiveItems;
