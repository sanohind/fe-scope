import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { inventoryRevApi } from "../../../services/api/dashboardApi";

interface TransactionTypeData {
  trans_type: string;
  order_type: string;
  trans_count: number;
  total_qty: number;
  unique_parts: number;
  unique_users: number;
}

interface InventoryTransactionTypeDistributionProps {
  warehouse: string;
  dateFrom?: string;
  dateTo?: string;
}

const InventoryTransactionTypeDistribution: React.FC<InventoryTransactionTypeDistributionProps> = ({ warehouse, dateFrom, dateTo }) => {
  const [data, setData] = useState<TransactionTypeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params: { date_from?: string; date_to?: string } = {};
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        const result = await inventoryRevApi.getTransactionTypeDistribution(warehouse, params);
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
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Transaction Type Distribution</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  // Group by trans_type and order_type
  const groupedData: Record<string, Record<string, TransactionTypeData>> = {};
  data.forEach((item) => {
    if (!groupedData[item.trans_type]) {
      groupedData[item.trans_type] = {};
    }
    groupedData[item.trans_type][item.order_type] = item;
  });

  const transTypes = Object.keys(groupedData);
  const orderTypes = Array.from(new Set(data.map((item) => item.order_type)));

  const series = orderTypes.map((orderType) => ({
    name: orderType,
    data: transTypes.map((transType) => {
      const item = groupedData[transType]?.[orderType];
      return item ? item.trans_count : 0;
    }),
  }));

  const options: ApexOptions = {
    colors: ["#465FFF", "#F79009", "#12B76A", "#F04438", "#8B5CF6", "#EC4899"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    stroke: {
      width: [0, 0, 0, 0, 0, 0],
      curve: "smooth",
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
      enabled: false,
    },
    xaxis: {
      categories: transTypes,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      title: {
        text: "Transaction Count",
      },
      labels: {
        formatter: (val: number) => val.toLocaleString(),
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
      opacity: [1, 1, 1, 1, 1, 1],
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number, { seriesIndex, dataPointIndex }) => {
          const orderType = orderTypes[seriesIndex];
          const transType = transTypes[dataPointIndex];
          const item = groupedData[transType]?.[orderType];
          if (!item) return `${val} transactions`;
          return `
            <div class="text-left">
              <div><strong>${transType} - ${orderType}</strong></div>
              <div>Transactions: ${item.trans_count}</div>
              <div>Total Qty: ${item.total_qty.toLocaleString()}</div>
              <div>Unique Parts: ${item.unique_parts}</div>
              <div>Unique Users: ${item.unique_users}</div>
            </div>
          `;
        },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Transaction Type Distribution</h3>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <Chart options={options} series={series} type="bar" height={350} />
        </div>
      </div>
    </div>
  );
};

export default InventoryTransactionTypeDistribution;
