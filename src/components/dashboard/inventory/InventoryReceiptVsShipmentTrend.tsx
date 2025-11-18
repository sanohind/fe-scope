import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { inventoryRevApi } from "../../../services/api/dashboardApi";

interface WeeklyTrendData {
  week_num: number;
  year: number;
  week_start: string;
  total_receipt: number;
  total_shipment: number;
  net_movement: number;
  trans_count: number;
}

interface InventoryReceiptVsShipmentTrendProps {
  warehouse: string;
  dateFrom?: string;
  dateTo?: string;
}

const InventoryReceiptVsShipmentTrend: React.FC<InventoryReceiptVsShipmentTrendProps> = ({ warehouse, dateFrom, dateTo }) => {
  const [data, setData] = useState<WeeklyTrendData[]>([]);
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
        const result = await inventoryRevApi.getReceiptVsShipmentTrend(warehouse, params);
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
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Receipt vs Shipment Trend (Weekly)</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  const categories = data.map((item) => `W${item.week_num}/${item.year}`);
  const receiptData = data.map((item) => item.total_receipt);
  const shipmentData = data.map((item) => item.total_shipment);
  const netMovementData = data.map((item) => item.net_movement);

  const options: ApexOptions = {
    chart: {
      type: "line",
      fontFamily: "Outfit, sans-serif",
      toolbar: {
        show: false,
      },
    },
    colors: ["#12B76A", "#F04438", "#465FFF"],
    stroke: {
      curve: "smooth",
      width: 3,
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          fontSize: "12px",
        },
        rotate: -45,
        rotateAlways: false,
      },
    },
    yaxis: {
      title: {
        text: "Quantity",
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
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number) => {
          return val.toLocaleString() + " units";
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "14px",
      itemMargin: {
        horizontal: 12,
      },
    },
    grid: {
      borderColor: "#E4E7EC",
    },
  };

  const series = [
    {
      name: "Receipt",
      data: receiptData,
    },
    {
      name: "Shipment",
      data: shipmentData,
    },
    {
      name: "Net Movement",
      data: netMovementData,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Receipt vs Shipment Trend (Weekly)</h3>
        {dateRange && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(dateRange.from).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - {new Date(dateRange.to).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} ({dateRange.days} days)
          </span>
        )}
      </div>
      <ReactApexChart options={options} series={series} type="line" height={400} />
    </div>
  );
};

export default InventoryReceiptVsShipmentTrend;
