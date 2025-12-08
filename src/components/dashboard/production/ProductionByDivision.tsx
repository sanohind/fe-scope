import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { productionApi } from "../../../services/api/dashboardApi";

interface DivisionData {
  division: string;
  statuses: {
    [key: string]: number;
  };
  total_orders: number;
  avg_completion_rate: number;
}

interface ProductionDivisionRow {
  divisi?: string;
  division?: string;
  status?: string;
  production_volume?: number | string;
  total_orders?: number | string;
  avg_completion_rate?: number | string;
}

const ProductionByDivision: React.FC = () => {
  const [data, setData] = useState<DivisionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await productionApi.getProductionBydivisi({});
        // Handle if API returns wrapped data or direct array
        const rawArray: ProductionDivisionRow[] = Array.isArray(result) ? result : result?.data || [];

        // Transform flat rows into DivisionData with status -> production_volume mapping
        const divisionMap: Record<string, DivisionData & { _weightedRateSum?: number; _orderSum?: number }> = {};
        for (const row of rawArray) {
          const divisionKey: string = row?.divisi ?? row?.division ?? "Unknown";
          const statusKey: string = row?.status ?? "Unknown";
          const volume: number = typeof row?.production_volume === "number" ? row.production_volume : parseFloat(row?.production_volume ?? "0") || 0;
          const orders: number = typeof row?.total_orders === "number" ? row.total_orders : parseInt(String(row?.total_orders ?? 0), 10) || 0;
          const rate: number = typeof row?.avg_completion_rate === "number" ? row.avg_completion_rate : parseFloat(row?.avg_completion_rate ?? "0") || 0;

          if (!divisionMap[divisionKey]) {
            divisionMap[divisionKey] = {
              division: divisionKey,
              statuses: {},
              total_orders: 0,
              avg_completion_rate: 0,
              _weightedRateSum: 0,
              _orderSum: 0,
            };
          }

          const ref = divisionMap[divisionKey];
          ref.statuses[statusKey] = volume;
          ref.total_orders += orders;
          ref._weightedRateSum = (ref._weightedRateSum || 0) + rate * orders;
          ref._orderSum = (ref._orderSum || 0) + orders;
        }

        const dataArray: DivisionData[] = Object.values(divisionMap).map((d) => ({
          division: d.division,
          statuses: d.statuses,
          total_orders: d.total_orders,
          avg_completion_rate: d._orderSum ? (d._weightedRateSum || 0) / d._orderSum : 0,
        }));

        setData(dataArray);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categories = Array.isArray(data) ? data.map((item) => item.division) : [];

  const allStatuses = Array.from(new Set(Array.isArray(data) ? data.flatMap((item) => Object.keys(item?.statuses ?? {})) : []));

  const series = allStatuses.map((status) => ({
    name: status,
    data: Array.isArray(data) ? data.map((item) => item?.statuses?.[status] ?? 0) : [],
  }));

  const statusColors: { [key: string]: string } = {
    Completed: "#12B76A",
    Complete: "#12B76A",
    "Production Completed": "#079455",
    "In Progress": "#465FFF",
    Active: "#465FFF",
    Pending: "#F79009",
    Created: "#FDB022",
    Cancelled: "#98A2B3",
    Closed: "#667085",
    Delayed: "#F04438",
    Released: "#7F56D9",
  };

  const colors = allStatuses.map((status) => statusColors[status] || "#98A2B3");

  const options: ApexOptions = {
    chart: {
      type: "bar",
      stacked: true,
      fontFamily: "Outfit, sans-serif",
      toolbar: {
        show: false,
      },
    },
    colors: colors,
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "70%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      title: {
        text: "Production Volume",
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
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val) => {
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

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Production by Division</h3>
        </div>
        <div className="flex justify-center items-center h-[400px] animate-pulse">
          <div className="w-full h-full bg-gray-200 rounded dark:bg-gray-800"></div>
        </div>
      </div>
    );
  }

  if (error || !data.length) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Production by Division</h3>
        </div>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400 text-sm">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Production by Division</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Production volume by division and status</p>
      </div>
      <div>
        <ReactApexChart options={options} series={series} type="bar" height={425} />
      </div>
    </div>
  );
};

export default ProductionByDivision;
