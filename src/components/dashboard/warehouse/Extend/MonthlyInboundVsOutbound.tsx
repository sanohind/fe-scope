import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { warehouseRevApi } from "../../../../services/api/dashboardApi";

interface InboundOutboundData {
  month: string;
  inbound: number;
  outbound: number;
}

interface MonthlyInboundVsOutboundProps {
  warehouse: string;
}

const MonthlyInboundVsOutbound: React.FC<MonthlyInboundVsOutboundProps> = ({ warehouse }) => {
  const [data, setData] = useState<InboundOutboundData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get data for last 6 months
        const today = new Date();
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);

        const dateFrom = sixMonthsAgo.toISOString().split("T")[0];
        const dateTo = today.toISOString().split("T")[0];

        const result = await warehouseRevApi.getMonthlyInboundVsOutbound(warehouse, {
          date_from: dateFrom,
          date_to: dateTo,
        });

        // Handle API response structure: { data: [...], warehouse: "...", date_range: {...} }
        if (result && Array.isArray(result.data)) {
          setData(result.data);
        } else if (Array.isArray(result)) {
          // Fallback for direct array response
          setData(result);
        } else {
          console.error("MonthlyInboundVsOutbound: Expected data array but got:", result);
          setData([]);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouse]);

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
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Monthly Inbound vs Outbound</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  // Transform data for chart
  const categories = data.map((item) => {
    const date = new Date(item.month + "-01");
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  });

  const inboundData = data.map((item) => item.inbound);
  const outboundData = data.map((item) => item.outbound);

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
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
    colors: ["#FDB022", "#465fff"], // Orange for Inbound, Blue for Outbound
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
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Quantity",
      },
      labels: {
        formatter: (val: number) => val.toLocaleString(),
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: number) => val.toLocaleString() + " units",
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontFamily: "Outfit, sans-serif",
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
  };

  const series = [
    {
      name: "Inbound",
      data: inboundData,
    },
    {
      name: "Outbound",
      data: outboundData,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Monthly Inbound vs Outbound</h3>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <Chart options={options} series={series} type="bar" height={350} />
        </div>
      </div>
    </div>
  );
};

export default MonthlyInboundVsOutbound;
