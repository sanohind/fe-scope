import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { inventoryRevApi } from "../../../services/api/dashboardApi";

interface ProductTypeData {
  product_type: string;
  sku_count: number;
  total_onhand: number;
  total_safety_stock: number;
  total_available: number;
  trans_count: number;
  total_shipment: number;
  turnover_rate: number;
}

interface InventoryStockAndActivityByProductTypeProps {
  warehouse: string;
  dateFrom?: string;
  dateTo?: string;
}

const InventoryStockAndActivityByProductType: React.FC<InventoryStockAndActivityByProductTypeProps> = ({ warehouse, dateFrom, dateTo }) => {
  const [data, setData] = useState<ProductTypeData[]>([]);
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
        const result = await inventoryRevApi.getStockAndActivityByProductType(warehouse, params);
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
          <div className="h-6 bg-gray-200 rounded dark:bg-gray-800 w-64 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded dark:bg-gray-800"></div>
        </div>
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Stock & Activity by Product Type</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  const categories = data.map((item) => item.product_type);
  const onhandData = data.map((item) => Number(item.total_onhand));
  const safetyStockData = data.map((item) => Number(item.total_safety_stock));
  const availableData = data.map((item) => Number(item.total_available));
  const transCountData = data.map((item) => Number(item.trans_count));
  const turnoverData = data.map((item) => Number(item.turnover_rate));

  const options: ApexOptions = {
    chart: {
      type: "line",
      fontFamily: "Outfit, sans-serif",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: false,
          reset: true,
        },
      },
      zoom: {
        enabled: true,
      },
    },
    colors: ["#465FFF", "#F79009", "#12B76A", "#F04438", "#8B5CF6"],
    stroke: {
      width: [0, 0, 0, 3, 3],
      curve: "smooth",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "70%",
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          fontSize: "12px",
          fontWeight: 500,
          colors: "#667085",
        },
        rotate: -45,
        rotateAlways: categories.length > 6,
        hideOverlappingLabels: true,
        trim: true,
        maxHeight: 80,
      },
      axisBorder: {
        show: true,
        color: "#E4E7EC",
      },
      axisTicks: {
        show: true,
        color: "#E4E7EC",
      },
    },
    yaxis: [
      {
        seriesName: "Onhand",
        title: {
          text: "Stock Quantity",
          style: {
            fontSize: "13px",
            fontWeight: 600,
            color: "#344054",
          },
        },
        labels: {
          style: {
            fontSize: "12px",
            colors: "#667085",
          },
          formatter: (val) => {
            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
            if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
            return val.toFixed(0);
          },
        },
        min: 0,
      },
      {
        seriesName: "Onhand",
        show: false,
      },
      {
        seriesName: "Onhand",
        show: false,
      },
      {
        opposite: true,
        seriesName: "Trans Count",
        title: {
          text: "Activity Metrics",
          style: {
            fontSize: "13px",
            fontWeight: 600,
            color: "#344054",
          },
        },
        labels: {
          style: {
            fontSize: "12px",
            colors: "#667085",
          },
          formatter: (val) => {
            if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
            return val.toFixed(0);
          },
        },
        min: 0,
      },
      {
        opposite: true,
        seriesName: "Trans Count",
        show: false,
      },
    ],
    fill: {
      opacity: [1, 1, 1, 0.3, 0.3],
      type: ["solid", "solid", "solid", "gradient", "gradient"],
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: undefined,
        inverseColors: true,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 100],
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      followCursor: true,
      theme: "light",
      style: {
        fontSize: "12px",
      },
      x: {
        show: true,
        formatter: (_val, opts) => {
          return `<strong>${categories[opts.dataPointIndex]}</strong>`;
        },
      },
      y: {
        formatter: (val: number, opts) => {
          const seriesName = opts.w.globals.seriesNames[opts.seriesIndex];
          if (seriesName === "Turnover Rate") {
            return `${val.toFixed(2)}x`;
          }
          return val.toLocaleString();
        },
      },
      marker: {
        show: true,
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "13px",
      fontWeight: 500,
      offsetY: 0,
      markers: {
        size: 12,
      },
      itemMargin: {
        horizontal: 12,
        vertical: 8,
      },
    },
    grid: {
      borderColor: "#F2F4F7",
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 0,
        right: 20,
        bottom: 0,
        left: 10,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          plotOptions: {
            bar: {
              columnWidth: "80%",
            },
          },
          xaxis: {
            labels: {
              rotate: -45,
              rotateAlways: true,
            },
          },
        },
      },
    ],
  };

  const series = [
    {
      name: "Onhand",
      type: "column",
      data: onhandData,
    },
    {
      name: "Safety Stock",
      type: "column",
      data: safetyStockData,
    },
    {
      name: "Available",
      type: "column",
      data: availableData,
    },
    {
      name: "Trans Count",
      type: "line",
      data: transCountData,
    },
    {
      name: "Turnover Rate",
      type: "line",
      data: turnoverData,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-1">Stock & Activity by Product Type</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Inventory levels and transaction metrics across product categories</p>
        </div>
        {dateRange && (
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 font-medium">
              {new Date(dateRange.from).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              })}
              {" - "}
              {new Date(dateRange.to).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg font-medium">{dateRange.days} days</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <ReactApexChart options={options} series={series} type="line" height={450} />
      </div>
    </div>
  );
};

export default InventoryStockAndActivityByProductType;
