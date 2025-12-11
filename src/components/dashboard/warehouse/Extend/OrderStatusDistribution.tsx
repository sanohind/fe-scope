import React, { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { warehouseRevApi } from "../../../../services/api/dashboardApi";
import { WarehouseFilterRequestParams, warehouseFiltersToQuery } from "../../../../context/WarehouseFilterContext";

interface StatusItem {
  order_origin: string;
  status_desc: string;
  count: string;
  percentage: number;
}

interface OrderStatusData {
  data?: {
    [trxType: string]: StatusItem[];
  };
  [trxType: string]: StatusItem[] | any;
}

interface OrderStatusDistributionProps {
  warehouse: string;
  period?: "daily" | "monthly" | "yearly";
  modeLabel?: string;
  rangeLabel?: string;
  filters?: WarehouseFilterRequestParams;
}

const OrderStatusDistribution: React.FC<OrderStatusDistributionProps> = ({ warehouse, period = "monthly", modeLabel, rangeLabel, filters }) => {
  const [data, setData] = useState<OrderStatusData | null>(null);
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
        const result = await warehouseRevApi.getOrderStatusDistribution(warehouse, params);
        // Handle if API returns wrapped data { data: {...} } or direct object
        // API guide shows: { data: { Transfer: [...], Sales: [...] } }
        let dataObj = result;
        if (result && result.data && typeof result.data === "object" && !Array.isArray(result.data)) {
          dataObj = result.data;
        } else if (result && typeof result === "object" && !Array.isArray(result) && !result.data) {
          // Direct object with trx_type keys
          dataObj = result;
        }
        setData(dataObj);
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

  if (error || !data || Object.keys(data).length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Order Status Distribution</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  // Extract all unique statuses from data
  const allStatuses = new Set<string>();
  Object.values(data).forEach((items) => {
    items.forEach((item: StatusItem) => {
      allStatuses.add(item.status_desc || "Unknown");
    });
  });

  const statuses = Array.from(allStatuses);
  const trxTypes = Object.keys(data);

  // Define color mapping for common statuses
  const statusColors: { [key: string]: string } = {
    Shipped: "#12B76A",
    Open: "#FDB022",
    Staged: "#6172F3",
    Adviced: "#8098F9",
    Released: "#36BFFA",
    Unknown: "#98A2B3",
    dn_qty: "#6172F3",
    receipt_qty: "#8098F9"
  };

  // Generate colors for all statuses
  const colors = statuses.map((status) => statusColors[status] || "#D0D5DD");

  const seriesData = statuses.map((status) => {
    return {
      name: status,
      data: trxTypes.map((trxType) => {
        const item = data[trxType].find((d: any) => (d.status_desc || "Unknown") === status);
        return item ? item.percentage : 0;
      }),
    };
  });

  const options: ApexOptions = {
    colors: colors,
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
      stacked: true,
      stackType: "100%",
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
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => {
        // Only show label if percentage is >= 5%
        return val >= 5 ? `${val.toFixed(0)}%` : "";
      },
      style: {
        fontSize: "12px",
        fontFamily: "Outfit",
        fontWeight: 600,
      },
    },
    xaxis: {
      categories: trxTypes,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Percentage",
      },
      labels: {
        formatter: (val: number) => `${val.toFixed(0)}%`,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
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
      shared: true,
      intersect: false,
      custom: function ({ series: _series, seriesIndex: _seriesIndex, dataPointIndex, w: _w }) {
        const trxType = trxTypes[dataPointIndex];
        const statusItems = data[trxType];

        let tooltipContent = `
          <div style="padding: 12px; font-family: Outfit, sans-serif;">
            <div class="text-gray-800 dark:text-gray-200">
              ${trxType}
            </div>
        `;

        // Sort by percentage descending
        const sortedItems = [...statusItems].sort((a, b) => b.percentage - a.percentage);

        sortedItems.forEach((item) => {
          const statusName = item.status_desc || "Unknown";
          const statusIndex = statuses.indexOf(statusName);
          const color = colors[statusIndex] || "#D0D5DD";
          const count = typeof item.count === "string" ? parseInt(item.count, 10) : item.count;

          tooltipContent += `
            <div style="display: flex; align-items: center; margin-bottom: 6px;">
              <span style="display: inline-block; width: 10px; height: 10px; background-color: ${color}; border-radius: 2px; margin-right: 8px;"></span>
              <span class="text-gray-500 dark:text-gray-500">${statusName}:</span>
              <span class="text-gray-800 dark:text-gray-200 ml-2">
                 ${item.percentage.toFixed(2)}% (${count.toLocaleString()})
              </span>
            </div>
          `;
        });

        // Calculate total
        const totalCount = statusItems.reduce((sum: number, item: StatusItem) => {
          const count = typeof item.count === "string" ? parseInt(item.count, 10) : item.count;
          return sum + count;
        }, 0);

        tooltipContent += `
            <div class="border-t border-gray-200 dark:border-gray-800">
              <div class="flex justify-between mt-2">
                <span class="text-gray-500 dark:text-gray-500">Total:</span>
                <span class="text-gray-800 dark:text-gray-200">${totalCount.toLocaleString()} orders</span>
              </div>
            </div>
          </div>
        `;

        return tooltipContent;
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Order Status Distribution</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Perbandingan persentase status untuk setiap tipe transaksi</p>
        </div>
        <div className="flex flex-col items-start gap-1 text-sm text-gray-600 dark:text-gray-300 lg:items-end">
          <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-700 dark:bg-gray-800 dark:text-white">{modeLabel ?? "Custom Range"}</span>
          <span>{effectiveRangeLabel}</span>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <Chart options={options} series={seriesData} type="bar" height={350} />
        </div>
      </div>
    </div>
  );
};

export default OrderStatusDistribution;
