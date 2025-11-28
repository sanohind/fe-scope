import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { productionApi } from "../../../services/api/dashboardApi";

interface TrendData {
  period: string;
  qty_pelaporan: string | number;
  total_prod_index: string | number;
}

interface ProductionTrendProps {
  divisi?: string;
}

type TrendPeriod = "daily" | "monthly" | "yearly";

const ProductionTrend: React.FC<ProductionTrendProps> = ({ divisi = "ALL" }) => {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<TrendPeriod>("monthly");
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Calculate date range based on period
        let dateFrom: string | undefined;
        let dateTo: string | undefined;
        if (period === "daily") {
          const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
          const lastDay = new Date(selectedYear, selectedMonth, 0);
          dateFrom = firstDay.toISOString().split("T")[0];
          dateTo = lastDay.toISOString().split("T")[0];
        } else if (period === "monthly") {
          dateFrom = `${selectedYear}-01-01`;
          dateTo = `${selectedYear}-12-31`;
        } else {
          // yearly: banding antar tahun, biarkan API aggregate per year dengan range lebar
          // (gunakan rentang 3 tahun mengelilingi selectedYear untuk perbandingan)
          const startYear = selectedYear - 1;
          const endYear = selectedYear + 1;
          dateFrom = `${startYear}-01-01`;
          dateTo = `${endYear}-12-31`;
        }

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
        console.error("Error fetching production trend:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period, selectedYear, selectedMonth, divisi]);

  // Konversi string ke number dengan aman
  const toNumber = (value: string | number): number => {
    if (typeof value === "number") return value;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const categories = data.map((item) => item.period);

  const qtyPelaporanData = data.map((item) => toNumber(item.qty_pelaporan));

  const series = [
    {
      name: "Qty Pelaporan",
      type: "column" as const,
      data: qtyPelaporanData,
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
    colors: ["#465FFF"],
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
      custom: function ({ dataPointIndex}) {
        const qtyPelaporan = qtyPelaporanData[dataPointIndex];
        const period = categories[dataPointIndex];

        return `<div class="px-3 py-2">
          <div class="font-semibold mb-2 text-gray-800 dark:text-gray-300">${period}</div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full" style="background-color: #465FFF"></span>
            <span class="text-sm text-gray-700 dark:text-gray-400">Qty Pelaporan: <strong>${qtyPelaporan.toLocaleString("en-US", { maximumFractionDigits: 0 })} units</strong></span>
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
          <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Production Trend</h3>
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
          <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Production Trend</h3>
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
        <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Production Trend</h3>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            <button onClick={() => setPeriod("daily")} className={`px-3 py-1.5 text-sm rounded-lg ${period === "daily" ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>
              Daily
            </button>
            <button onClick={() => setPeriod("monthly")} className={`px-3 py-1.5 text-sm rounded-lg ${period === "monthly" ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>
              Monthly
            </button>
            <button onClick={() => setPeriod("yearly")} className={`px-3 py-1.5 text-sm rounded-lg ${period === "yearly" ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>
              Yearly
            </button>
          </div>
          {period === "daily" && (
            <div className="flex items-center gap-2">
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
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-white text-sm"
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}
          {period === "monthly" && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-white text-sm"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}
          {period === "yearly" && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-white text-sm"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      <div>
        <ReactApexChart options={options} series={series} type="line" height={400} />
      </div>
    </div>
  );
};

export default ProductionTrend;
