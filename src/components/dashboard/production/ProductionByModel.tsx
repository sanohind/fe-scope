import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { productionApi } from "../../../services/api/dashboardApi";

interface ModelData {
  model: string;
  customer: string;
  total_qty: string;
  total_orders: number;
}

interface ProductionByModelProps {
  divisi?: string;
  dateFrom?: string;
  dateTo?: string;
  period?: "daily" | "monthly" | "yearly";
}

const ProductionByModel: React.FC<ProductionByModelProps> = ({ divisi = "ALL", dateFrom, dateTo, period = "daily" }) => {
  const [data, setData] = useState<ModelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching production by model data...");
        const result = await productionApi.getProductionByModel(20, {
          period,
          divisi: divisi !== "ALL" ? divisi : undefined,
          date_from: dateFrom,
          date_to: dateTo,
        });
        console.log("Production by model API response:", result);

        // Handle various response formats
        let dataArray: ModelData[] = [];

        if (Array.isArray(result)) {
          dataArray = result;
        } else if (result?.data && Array.isArray(result.data)) {
          dataArray = result.data;
        } else if (result?.success && Array.isArray(result.items)) {
          dataArray = result.items;
        } else {
          console.warn("Unexpected API response format:", result);
        }

        // Filter out entries with empty model names
        dataArray = dataArray.filter((item) => item.model && item.model.trim() !== "");

        console.log("Processed data array:", dataArray);
        console.log("Data length:", dataArray.length);

        setData(dataArray);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch data";
        console.error("Error fetching production by model:", err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [divisi, dateFrom, dateTo, period]);

  // Create categories with model and customer info
  const categories = Array.isArray(data) ? data.map((item) => `${item.model} (${item.customer})`) : [];

  const series = [
    {
      name: "Production Volume",
      data: Array.isArray(data) ? data.map((item) => parseFloat(item.total_qty)) : [],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "Outfit, sans-serif",
      toolbar: {
        show: false,
      },
    },
    colors: ["#465FFF"],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: "70%",
        distributed: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: categories,
      labels: {
        formatter: (val) => {
          return Number(val).toLocaleString();
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
      custom: function ({ series, seriesIndex, dataPointIndex }) {
        const item = data[dataPointIndex];
        const value = series[seriesIndex][dataPointIndex];

        return `
          <div class="text-black font-bold dark:text-white" style="font-weight: 600; font-size: 13px; margin-bottom: 8px;">
            ${item?.model || "N/A"}
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 24px;">
              <span class="text-black dark:text-white" style="font-size: 12px;">Production Volume:</span>
              <span class="text-black dark:text-white" style="font-weight: 600; font-size: 12px;">${value.toLocaleString()} units</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 24px;">
              <span class="text-black dark:text-white" style="font-size: 12px;">Customer:</span>
              <span class="text-black dark:text-white" style="font-weight: 600; font-size: 12px;">${item?.customer || "N/A"}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 24px;">
              <span class="text-black dark:text-white" style="font-size: 12px;">Orders:</span>
              <span class="text-black dark:text-white" style="font-weight: 600; font-size: 12px;">${item?.total_orders || 0}</span>
            </div>
          </div>
        `;
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
          <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Production by Model</h3>
        </div>
        <div className="flex justify-center items-center h-[500px] animate-pulse">
          <div className="w-full h-full bg-gray-200 rounded dark:bg-gray-800"></div>
        </div>
      </div>
    );
  }

  if (error || !data.length) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Production by Model</h3>
        </div>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400 text-sm font-medium mb-2">{error || "No data available"}</p>
          {!error && (
            <p className="text-gray-600 dark:text-gray-400 text-xs">
              The API endpoint might not be implemented or returning empty data.
              <br />
              Check console for more details.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Production by Model</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Top 20 models by production volume</p>
      </div>
      <div>
        <ReactApexChart options={options} series={series} type="bar" height={500} />
      </div>
    </div>
  );
};

export default ProductionByModel;
