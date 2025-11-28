import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { warehouseRevApi } from "../../../../services/api/dashboardApi";

interface DeliveryPerformanceData {
  closed: number;
  shipped: number;
  put_away: number;
  open: number;
  total: number;
  performance_rate: number;
  target_rate: number;
  performance_status: string;
  warehouse?: string;
  date_range?: {
    from: string;
    to: string;
    days: number;
  };
}

interface DeliveryPerformanceProps {
  warehouse: string;
}

type FilterPeriod = "daily" | "monthly";

const DeliveryPerformance: React.FC<DeliveryPerformanceProps> = ({ warehouse }) => {
  const [data, setData] = useState<DeliveryPerformanceData | null>(null);
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
          // Perbandingan antar hari dalam satu bulan (gunakan bulan terpilih di fixedYear)
          // Jika selectedMonth adalah month saat ini di tahun yang sama, gunakan hingga hari ini 23:59:59
          const firstDay = new Date(fixedYear, selectedMonth - 1, 1);
          const lastDay = new Date(fixedYear, selectedMonth, 0);
          const today = new Date();
          const isCurrentMonthYear = fixedYear === today.getFullYear() && selectedMonth === today.getMonth() + 1;

          const pad = (n: number) => String(n).padStart(2, "0");
          dateFrom = `${firstDay.getFullYear()}-${pad(firstDay.getMonth() + 1)}-${pad(firstDay.getDate())}`;
          if (isCurrentMonthYear) {
            const yyyy = today.getFullYear();
            const mm = pad(today.getMonth() + 1);
            const dd = pad(today.getDate());
            dateTo = `${yyyy}-${mm}-${dd} 23:59:59`;
          } else {
            const yyyy = lastDay.getFullYear();
            const mm = pad(lastDay.getMonth() + 1);
            const dd = pad(lastDay.getDate());
            dateTo = `${yyyy}-${mm}-${dd} 23:59:59`;
          }
        } else {
          // monthly: perbandingan antar bulan pada satu tahun (gunakan seluruh tahun 2025)
          dateFrom = `${fixedYear}-01-01`;
          dateTo = `${fixedYear}-12-31`;
        }

        const result = await warehouseRevApi.getDeliveryPerformance(warehouse, {
          date_from: dateFrom,
          date_to: dateTo,
        });

        // API returns object with new fields (performance_rate, closed, shipped, put_away, open, total)
        if (result && typeof result.performance_rate === "number") {
          setData(result);
        } else {
          console.error("DeliveryPerformance: Unexpected response:", result);
          setData(null);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouse, filterPeriod, selectedMonth]);

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

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Delivery Performance</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  // Determine color based on performance_rate
  const getColor = () => {
    if (data.performance_rate >= 95) return "#12B76A"; // Green - Excellent
    if (data.performance_rate >= 85) return "#FDB022"; // Orange - Good
    return "#F04438"; // Red - Needs Improvement
  };

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 350,
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          margin: 0,
          size: "70%",
          background: "transparent",
        },
        track: {
          background: "#f2f4f7",
          strokeWidth: "100%",
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: "16px",
            fontFamily: "Outfit",
            fontWeight: 600,
            offsetY: -10,
          },
          value: {
            show: true,
            fontSize: "36px",
            fontFamily: "Outfit",
            fontWeight: 700,
            offsetY: 10,
            formatter: (val: number) => `${val.toFixed(2)}%`,
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: [getColor()],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Warehouse Performance"],
  };

  const series = [data.performance_rate];

  const getStatusBadge = () => {
    if (data.performance_status === "excellent") {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400">Excellent</span>;
    } else if (data.performance_status === "good") {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400">Good</span>;
    } else {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-error-50 text-error-700 dark:bg-error-900/20 dark:text-error-400">Needs Improvement</span>;
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Warehouse Performance</h3>

        <div className="flex items-center gap-3">
          <div className="flex gap-2">
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
          </div>
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

          {getStatusBadge()}
        </div>
      </div>

      <div>
        <Chart options={options} series={series} type="radialBar" height={300} />
      </div>

      <div className="mt-8 grid grid-cols-4 gap-4">
        <div className="text-center p-4 rounded-lg bg-brand-50 dark:bg-brand-500/10">
          <p className="text-sm text-gray-500 dark:text-gray-400">Closed</p>
          <p className="mt-1 text-xl font-bold text-brand-500">{data.closed?.toLocaleString?.() ?? "-"}</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-success-50 dark:bg-success-900/20">
          <p className="text-sm text-gray-500 dark:text-gray-400">Shipped</p>
          <p className="mt-1 text-xl font-bold text-success-600 dark:text-success-400">{data.shipped?.toLocaleString?.() ?? "-"}</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20">
          <p className="text-sm text-gray-500 dark:text-gray-400">Put Away</p>
          <p className="mt-1 text-xl font-bold text-gray-800 dark:text-white/90">{data.put_away?.toLocaleString?.() ?? "-"}</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-error-50 dark:bg-error-900/20">
          <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
          <p className="mt-1 text-xl font-bold text-error-600 dark:text-error-400">{data.open?.toLocaleString?.() ?? "-"}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
            <span className="text-sm font-medium text-gray-800 dark:text-white/90">{data.total?.toLocaleString?.() ?? "-"}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Target Rate</span>
            <span className="text-sm font-medium text-gray-800 dark:text-white/90">{data.target_rate ?? "-"}%</span>
          </div>
        </div>
      </div>

      {/* <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Target Rate</span>
          <span className="text-sm font-medium text-gray-800 dark:text-white/90">
            {data.target_rate}%
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Total Orders</span>
          <span className="text-sm font-medium text-gray-800 dark:text-white/90">
            {data.total_orders.toLocaleString()}
          </span>
        </div>
      </div> */}
    </div>
  );
};

export default DeliveryPerformance;
