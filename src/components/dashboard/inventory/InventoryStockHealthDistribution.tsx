import React, { useEffect, useState, useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { inventoryRevApi } from "../../../services/api/dashboardApi";

interface StockHealthData {
  stock_status: string;
  item_count: number;
  total_onhand: number;
  trans_count: number;
  total_shipment: number;
}

interface GroupedData {
  date?: string;
  month?: string;
  year?: string;
  data: StockHealthData[];
}

interface ApiResponse {
  data: GroupedData[];
  period: string;
  grouping: string;
  date_range: {
    from: string;
    to: string;
  };
}

interface InventoryStockHealthDistributionProps {
  warehouse: string;
  dateFrom?: string;
  dateTo?: string;
}

type PeriodType = "daily" | "monthly" | "yearly";

const InventoryStockHealthDistribution: React.FC<InventoryStockHealthDistributionProps> = ({ warehouse, dateFrom, dateTo }) => {
  const [allData, setAllData] = useState<GroupedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodType>("daily");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  // Get available months for daily period
  const availableMonths = useMemo(() => {
    if (period !== "daily") return [];
    const months = new Set<string>();
    allData.forEach((item) => {
      if (item.date) {
        const monthYear = item.date.substring(0, 7); // YYYY-MM
        months.add(monthYear);
      }
    });
    return Array.from(months).sort();
  }, [allData, period]);

  // Get available years for monthly period
  const availableYears = useMemo(() => {
    if (period !== "monthly") return [];
    const years = new Set<string>();
    allData.forEach((item) => {
      if (item.month) {
        const year = item.month.substring(0, 4); // YYYY
        years.add(year);
      }
    });
    return Array.from(years).sort();
  }, [allData, period]);

  // Initialize selected month/year when data changes
  useEffect(() => {
    if (period === "daily" && availableMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(availableMonths[availableMonths.length - 1]); // Latest month
    }
    if (period === "monthly" && availableYears.length > 0 && !selectedYear) {
      setSelectedYear(availableYears[availableYears.length - 1]); // Latest year
    }
  }, [period, availableMonths, availableYears, selectedMonth, selectedYear]);

  // Filter data based on selected month/year
  const filteredData = useMemo(() => {
    if (period === "daily") {
      return allData.filter((item) => item.date?.startsWith(selectedMonth));
    }
    if (period === "monthly") {
      return allData.filter((item) => item.month?.startsWith(selectedYear));
    }
    return allData; // yearly - show all
  }, [allData, period, selectedMonth, selectedYear]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params: any = { period };
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        const result: ApiResponse = await inventoryRevApi.getStockHealthDistribution(warehouse, params);
        setAllData(result.data || []);
        setSelectedMonth("");
        setSelectedYear("");
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouse, dateFrom, dateTo, period]);

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

  if (error || !allData || allData.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Stock Health Distribution</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  if (filteredData.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Stock Health Distribution</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">No data available for selected period</p>
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

  // Aggregate data from all dates/months in the filtered period
  const aggregatedData: Record<string, StockHealthData> = {};
  filteredData.forEach((groupItem) => {
    groupItem.data.forEach((statusItem) => {
      if (!aggregatedData[statusItem.stock_status]) {
        aggregatedData[statusItem.stock_status] = { ...statusItem };
      } else {
        aggregatedData[statusItem.stock_status].item_count += statusItem.item_count;
        aggregatedData[statusItem.stock_status].total_onhand += statusItem.total_onhand;
        aggregatedData[statusItem.stock_status].trans_count += statusItem.trans_count;
        aggregatedData[statusItem.stock_status].total_shipment += statusItem.total_shipment;
      }
    });
  });

  const data = Object.values(aggregatedData);
  const categories = data.map((item) => item.stock_status);
  const itemCounts = data.map((item) => Number(item.item_count));

  const chartColors = data.map((item) => statusColors[item.stock_status] || "#6B7280");

  const getPeriodLabel = () => {
    if (period === "daily") return `Daily - ${selectedMonth}`;
    if (period === "monthly") return `Monthly - ${selectedYear}`;
    return "Yearly";
  };

  const options: ApexOptions = {
    colors: chartColors,
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 400,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 5,
        borderRadiusApplication: "end",
        distributed: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Item Count",
      },
      labels: {
        formatter: (val: number) => val.toLocaleString(),
      },
    },
    legend: {
      show: false,
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      shared: false,
      intersect: true,
      y: {
        formatter: (_val: number, { dataPointIndex }) => {
          const item = data[dataPointIndex];
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
  };

  const series = [
    {
      name: "Item Count",
      data: itemCounts,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Stock Health Distribution</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{getPeriodLabel()}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select value={period} onChange={(e) => setPeriod(e.target.value as PeriodType)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          {period === "daily" && availableMonths.length > 0 && (
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          )}

          {period === "monthly" && availableYears.length > 0 && (
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <Chart options={options} series={series} type="bar" height={400} />
        </div>
      </div>
    </div>
  );
};

export default InventoryStockHealthDistribution;
