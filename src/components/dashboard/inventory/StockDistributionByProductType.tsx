import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { inventoryApi } from "../../../services/api/dashboardApi";

interface ProductItem {
  product_type: string;
  model: string;
  partno: string;
  desc: string;
  onhand: number;
  allocated: number;
  available: number;
}

interface StockDistributionData {
  [productType: string]: {
    [model: string]: ProductItem[];
  };
}

const StockDistributionByProductType: React.FC = () => {
  const [data, setData] = useState<StockDistributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await inventoryApi.getStockDistributionByProductType();
        // Handle if API returns wrapped data { data: {...} } or direct object
        const dataObj = result?.data || result;
        setData(dataObj);
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
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded dark:bg-gray-800 w-48 mb-6"></div>
          <div className="h-80 bg-gray-200 rounded dark:bg-gray-800"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Stock Distribution by Product Type
        </h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">
            {error || "No data available"}
          </p>
        </div>
      </div>
    );
  }

  // Process data for chart
  const productTypes: string[] = [];
  const onhandValues: number[] = [];
  const allocatedValues: number[] = [];
  const availableValues: number[] = [];

  if (data && typeof data === 'object') {
    Object.entries(data).forEach(([productType, models]) => {
      let totalOnhand = 0;
      let totalAllocated = 0;
      let totalAvailable = 0;

      if (models && typeof models === 'object') {
        Object.values(models).forEach((items) => {
          if (Array.isArray(items)) {
            items.forEach((item) => {
              if (item) {
                totalOnhand += Number(item.onhand) || 0;
                totalAllocated += Number(item.allocated) || 0;
                totalAvailable += Number(item.available) || 0;
              }
            });
          }
        });
      }

      productTypes.push(productType);
      onhandValues.push(totalOnhand);
      allocatedValues.push(totalAllocated);
      availableValues.push(totalAvailable);
    });
  }

  const options: ApexOptions = {
    colors: ["#465fff", "#FDB022", "#12B76A"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
      stacked: false,
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
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: productTypes,
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
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toLocaleString()} units`,
      },
    },
  };

  const series = [
    {
      name: "Onhand",
      data: onhandValues,
    },
    {
      name: "Allocated",
      data: allocatedValues,
    },
    {
      name: "Available",
      data: availableValues,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Stock Distribution by Product Type
        </h3>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <Chart options={options} series={series} type="bar" height={350} />
        </div>
      </div>
    </div>
  );
};

export default StockDistributionByProductType;
