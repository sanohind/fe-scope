import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { warehouseApi } from "../../../services/api/dashboardApi";

interface FulfillmentItem {
  ship_from: string;
  total_order_qty: number;
  total_ship_qty: number;
  fulfillment_rate: number;
}

interface FulfillmentData {
  data: FulfillmentItem[];
  target_rate: number;
}

type FilterPeriod = "daily" | "monthly";

const OrderFulfillmentRate: React.FC = () => {
  const [data, setData] = useState<FulfillmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("monthly");
  const fixedYear = 2025;
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Calculate date range based on filter period (warehouse: no yearly)
        let dateFrom: string;
        let dateTo: string;
        if (filterPeriod === "daily") {
          // perbandingan antar hari dalam satu bulan (bulan terpilih 2025)
          const firstDay = new Date(fixedYear, selectedMonth - 1, 1);
          const lastDay = new Date(fixedYear, selectedMonth, 0);
          dateFrom = firstDay.toISOString().split("T")[0];
          dateTo = lastDay.toISOString().split("T")[0];
        } else {
          // monthly: perbandingan antar bulan dalam satu tahun (2025)
          dateFrom = `${fixedYear}-01-01`;
          dateTo = `${fixedYear}-12-31`;
        }

        const result = await warehouseApi.getOrderFulfillmentRate({
          date_from: dateFrom,
          date_to: dateTo,
        });

        // Normalize response so state always matches FulfillmentData shape
        // Expected documented shape:
        // { data: FulfillmentItem[], target_rate: number, filter_metadata?: {...} }
        let normalized: FulfillmentData | null = null;

        if (result && Array.isArray(result.data)) {
          normalized = {
            data: result.data,
            target_rate: typeof result.target_rate === "number" ? result.target_rate : 100,
          };
        } else if (Array.isArray(result)) {
          // Fallback if API directly returns an array
          normalized = {
            data: result,
            target_rate: 100,
          };
        }

        setData(normalized);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterPeriod, selectedMonth]);

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

  if (error || !data || !Array.isArray(data.data) || data.data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Order Fulfillment Rate</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  const categories = data.data.map((item) => item.ship_from);
  const fulfillmentRates = data.data.map((item) => item.fulfillment_rate);

  // Create colors based on achievement vs target
  const colors = fulfillmentRates.map((rate) => {
    if (rate >= data.target_rate) return "#12B76A"; // Green - meets target
    if (rate >= data.target_rate * 0.9) return "#FDB022"; // Orange - close to target
    return "#F04438"; // Red - below target
  });

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
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
    colors: colors,
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
      style: {
        fontSize: "12px",
        fontFamily: "Outfit",
        fontWeight: 600,
      },
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
        text: "Fulfillment Rate (%)",
      },
      labels: {
        formatter: (val: number) => `${val.toFixed(0)}%`,
      },
      min: 0,
      max: 110,
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
    annotations: {
      yaxis: [
        {
          y: data.target_rate,
          borderColor: "#465fff",
          strokeDashArray: 5,
          label: {
            borderColor: "#465fff",
            style: {
              color: "#fff",
              background: "#465fff",
              fontSize: "12px",
              fontFamily: "Outfit",
            },
            text: `Target: ${data.target_rate}%`,
          },
        },
      ],
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toFixed(2)}%`,
      },
    },
  };

  const series = [
    {
      name: "Fulfillment Rate",
      data: fulfillmentRates,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Order Fulfillment Rate by Warehouse</h3>

        <div className="flex gap-2 items-center">
          <button
            onClick={() => setFilterPeriod("daily")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filterPeriod === "daily" ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setFilterPeriod("monthly")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filterPeriod === "monthly" ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Monthly
          </button>
          {filterPeriod === "daily" && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-white text-sm"
            >
              {[
                { value: 1, label: "January" },
                { value: 2, label: "February" },
                { value: 3, label: "March" },
                { value: 4, label: "April" },
                { value: 5, label: "May" },
                { value: 6, label: "June" },
                { value: 7, label: "July" },
                { value: 8, label: "August" },
                { value: 9, label: "September" },
                { value: 10, label: "October" },
                { value: 11, label: "November" },
                { value: 12, label: "December" },
              ].map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <Chart options={options} series={series} type="bar" height={350} />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Meets Target</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Close to Target</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-error-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Below Target</span>
        </div>
      </div>
    </div>
  );
};

export default OrderFulfillmentRate;
