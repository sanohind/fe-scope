import React, { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { warehouseRevApi } from "../../../../services/api/dashboardApi";
import { WarehouseFilterRequestParams, warehouseFiltersToQuery } from "../../../../context/WarehouseFilterContext";

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
  period?: "daily" | "monthly" | "yearly";
  modeLabel?: string;
  rangeLabel?: string;
  filters?: WarehouseFilterRequestParams;
}

const DeliveryPerformance: React.FC<DeliveryPerformanceProps> = ({ warehouse, period = "monthly", modeLabel, rangeLabel, filters }) => {
  const [data, setData] = useState<DeliveryPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const effectiveRangeLabel = useMemo(() => {
    if (rangeLabel) return rangeLabel;
    if (period === "daily") return "Per tanggal (bulan berjalan)";
    if (period === "monthly") return "Per bulan (tahun berjalan)";
    return "Per tahun (beberapa tahun terakhir)";
  }, [period, rangeLabel]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = filters ? warehouseFiltersToQuery(filters) : { period };
        const result = await warehouseRevApi.getDeliveryPerformance(warehouse, params);

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
  }, [warehouse, period, filters]);

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
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Warehouse Performance</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Monitoring delivery rate & fulfillment quality</p>
        </div>
        <div className="flex flex-col items-start gap-1 text-sm text-gray-600 dark:text-gray-300 lg:items-end">
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-700 dark:bg-gray-800 dark:text-white">
            {getStatusBadge()} <span>{modeLabel ?? "Custom Range"}</span>
          </span>
          <span>{effectiveRangeLabel}</span>
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
