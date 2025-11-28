import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { inventoryRevApi } from "../../../services/api/dashboardApi";

interface TurnoverItem {
  partno: string;
  description: string;
  product_type: string;
  onhand: number;
  safety_stock: number;
  total_shipment: number;
  turnover_rate: number;
  days_of_stock: number;
  movement_category: string;
  recommendation: string;
}

interface InventoryStockTurnoverRateProps {
  warehouse: string;
  dateFrom?: string;
  dateTo?: string;
}

const InventoryStockTurnoverRate: React.FC<InventoryStockTurnoverRateProps> = ({ warehouse, dateFrom, dateTo }) => {
  const [data, setData] = useState<TurnoverItem[]>([]);
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
        const result = await inventoryRevApi.getStockTurnoverRate(warehouse, params);
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
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Stock Turnover Rate (Top 20)</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Fast Moving": "#12B76A",
      "Medium Moving": "#F79009",
      "Slow Moving": "#6B7280",
    };
    return colors[category] || "#6B7280";
  };

  // const categories = data.map((item) => item.partno);
  const turnoverRates = data.map((item) => item.turnover_rate);
  const colors = data.map((item) => getCategoryColor(item.movement_category));

  const options: ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "Outfit, sans-serif",
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
      formatter: (val: number, { dataPointIndex }) => {
        const item = data[dataPointIndex];
        return `${val.toFixed(2)} (${item.days_of_stock}d)`;
      },
    },
    xaxis: {
      title: {
        text: "Turnover Rate",
        style: {
          fontSize: "14px",
          fontWeight: 500,
        },
      },
      labels: {
        formatter: (val) => {
          return parseFloat(val).toFixed(2);
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
        formatter: (_val: number, { dataPointIndex }) => {
          const item = data[dataPointIndex];
          return `
            <div class="text-left">
              <div><strong>${item.description}</strong></div>
              <div>Part No: ${item.partno}</div>
              <div>Product Type: ${item.product_type}</div>
              <div>Turnover Rate: ${item.turnover_rate.toFixed(2)}</div>
              <div>Days of Stock: ${item.days_of_stock}</div>
              <div>Onhand: ${item.onhand.toLocaleString()}</div>
              <div>Safety Stock: ${item.safety_stock.toLocaleString()}</div>
              <div>Shipment: ${item.total_shipment.toLocaleString()}</div>
              <div>Category: ${item.movement_category}</div>
              <div>Recommendation: ${item.recommendation}</div>
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
      name: "Turnover Rate",
      data: turnoverRates,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Stock Turnover Rate (Top 20)</h3>
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

export default InventoryStockTurnoverRate;
