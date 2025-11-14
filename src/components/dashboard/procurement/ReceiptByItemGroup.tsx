import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { procurementApi } from "../../../services/api/dashboardApi";

interface ItemGroupData {
  item_group: string;
  item_type: string;
  item_no: string;
  receipt_value: number;
}

const ReceiptByItemGroup: React.FC = () => {
  const [data, setData] = useState<ItemGroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await procurementApi.getReceiptByItemGroup();
        // Handle if API returns wrapped data or direct array
        const dataArray = Array.isArray(result) ? result : (result?.data || []);
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

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded dark:bg-gray-800 mb-6"></div>
        <div className="h-96 bg-gray-200 rounded dark:bg-gray-800"></div>
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-error-200 bg-error-50 p-5 dark:border-error-800 dark:bg-error-900/20">
        <p className="text-error-600 dark:text-error-400">
          {error || "No data available"}
        </p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Filter out invalid data and ensure numeric values
  const validData = data.filter((item) => item && item.item_group && item.receipt_value != null);
  const series = validData.map((item) => ({
    x: `${item.item_group} - ${item.item_type}`,
    y: Number(item.receipt_value) || 0,
  }));

  const options: ApexOptions = {
    chart: {
      type: "treemap",
      fontFamily: "Outfit, sans-serif",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
    },
    colors: ["#465FFF", "#7592FF", "#9CB9FF", "#C2D6FF", "#DDE9FF"],
    plotOptions: {
      treemap: {
        distributed: true,
        enableShades: true,
        shadeIntensity: 0.5,
        reverseNegativeShade: true,
        colorScale: {
          ranges: [],
        },
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "12px",
        fontWeight: 600,
      },
      formatter: (text: string | number) => {
        return text;
      },
      offsetY: -4,
    },
    tooltip: {
      custom: ({ dataPointIndex }) => {
        const item = data[dataPointIndex];
        return `
          <div class="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-800 shadow-lg">
            <div class="font-semibold text-gray-800 dark:text-white/90 mb-2">${item.item_group}</div>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 dark:text-gray-400">Item Type:</span>
                <span class="font-medium text-gray-800 dark:text-white/90">${item.item_type}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 dark:text-gray-400">Item No:</span>
                <span class="font-medium text-gray-800 dark:text-white/90">${item.item_no}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 dark:text-gray-400">Receipt Value:</span>
                <span class="font-medium text-gray-800 dark:text-white/90">${formatCurrency(item.receipt_value)}</span>
              </div>
            </div>
          </div>
        `;
      },
    },
    legend: {
      show: false,
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Receipt by Item Group
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Receipt value distribution by item group and type
        </p>
      </div>

      <ReactApexChart
        options={options}
        series={[
          {
            data: series,
          },
        ]}
        type="treemap"
        height={450}
      />
    </div>
  );
};

export default ReceiptByItemGroup;
