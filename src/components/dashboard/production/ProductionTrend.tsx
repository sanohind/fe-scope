import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { productionApi } from "../../../services/api/dashboardApi";

interface TrendData {
  period: string;
  qty_pelaporan: string | number;
  qty_plan: string | number;
  total_prod_index: string | number;
}

interface ProductionTrendProps {
  divisi?: string;
  dateFrom?: string;
  dateTo?: string;
  period?: "daily" | "monthly" | "yearly";
}

const ProductionTrend: React.FC<ProductionTrendProps> = ({ divisi = "ALL", dateFrom, dateTo, period = "daily" }) => {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await productionApi.getProductionTrend({
          period,
          date_from: dateFrom,
          date_to: dateTo,
          divisi: divisi !== "ALL" ? divisi : undefined,
        });
        const dataArray = Array.isArray(result) ? result : result?.data || [];
        setData(dataArray);
        setError(null);
      } catch (err) {
        console.error("Error fetching Production Achievement:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [divisi, dateFrom, dateTo, period]);

  // Konversi string ke number dengan aman
  const toNumber = (value: string | number): number => {
    if (typeof value === "number") return value;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const categories = data.map((item) => item.period);

  const qtyPelaporanData = data.map((item) => toNumber(item.qty_pelaporan));
  const qtyPlanData = data.map((item) => toNumber(item.qty_plan));

  const series = [
    {
      name: "Qty Pelaporan",
      type: "column" as const,
      data: qtyPelaporanData,
    },
    {
      name: "Qty Plan",
      type: "line" as const,
      data: qtyPlanData,
    },
  ];

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      toolbar: {
        show: false,
      },
      height: 400,
      type: "line",
    },
    colors: ["#465FFF", "#10B981"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadius: 4,
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
        },
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
          if (val === undefined || val === null) return "0";
          return val.toLocaleString("en-US", { maximumFractionDigits: 0 });
        },
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      custom: function ({ dataPointIndex }) {
        const qtyPelaporan = qtyPelaporanData[dataPointIndex];
        const qtyPlan = qtyPlanData[dataPointIndex];
        const period = categories[dataPointIndex];

        return `<div class="px-3 py-2">
          <div class="font-semibold mb-2 text-gray-800 dark:text-gray-300">${period}</div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full" style="background-color: #465FFF"></span>
            <span class="text-sm text-gray-700 dark:text-gray-400">Qty Pelaporan: <strong>${qtyPelaporan.toLocaleString("en-US", { maximumFractionDigits: 0 })} units</strong></span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full" style="background-color: #10B981"></span>
            <span class="text-sm text-gray-700 dark:text-gray-400">Qty Plan: <strong>${qtyPlan.toLocaleString("en-US", { maximumFractionDigits: 0 })} units</strong></span>
          </div>
        </div>`;
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
          <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Production Achievement</h3>
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
          <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Production Achievement</h3>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400 text-sm">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Production Achievement</h3>
      </div>
      <div>
        <ReactApexChart options={options} series={series} type="line" height={400} />
      </div>
    </div>
  );
};

export default ProductionTrend;
