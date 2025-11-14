import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { salesApi } from "../../../services/api/dashboardApi";

interface FulfillmentData {
  period: string;
  delivered_qty: number;
}

interface FulfillmentResponse {
  data: FulfillmentData[];
  filter_metadata?: {
    period: string;
    date_field: string;
    date_from: string;
    date_to: string;
  };
}

const OrderFulfillment: React.FC = () => {
  const [data, setData] = useState<FulfillmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<FulfillmentResponse['filter_metadata'] | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Fetch available years once on mount
  useEffect(() => {
    const fetchAvailableYears = async () => {
      try {
        // Fetch all data without year filter to get available years
        const result = await salesApi.getOrderFulfillment();
        if (result.data && result.data.length > 0) {
          const years = result.data
            .map((item: FulfillmentData) => {
              const year = parseInt(item.period.split('-')[0]);
              return isNaN(year) ? null : year;
            })
            .filter((year: number | null): year is number => year !== null);
          
          const uniqueYears = Array.from(new Set<number>(years)).sort((a, b) => b - a);
          setAvailableYears(uniqueYears);
        }
      } catch (err) {
        console.error("Failed to fetch available years:", err);
      }
    };

    fetchAvailableYears();
  }, []);

  // Fetch filtered data based on selected year
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Build API parameters based on selected year
        const params: { period?: "monthly" | "yearly"; date_from?: string; date_to?: string } = {
          date_from: `${selectedYear}-01-01`,
          date_to: `${selectedYear}-12-31`
        };
        
        const result = await salesApi.getOrderFulfillment(params);
        // API returns { data: [...], filter_metadata: {...} }
        setData(result.data || []);
        setMetadata(result.filter_metadata || null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded dark:bg-gray-800 w-48 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded dark:bg-gray-800"></div>
        </div>
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Sales Order Fulfillment
        </h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">
            {error || "No data available"}
          </p>
        </div>
      </div>
    );
  }

  const categories = data.map((item) => item.period);
  const deliveredData = data.map((item) => item.delivered_qty);

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 400,
      type: "bar",
      toolbar: {
        show: false,
      },
    },
    colors: ["#465fff"],
    plotOptions: {
      bar: {
        columnWidth: "50%",
        borderRadius: 5,
      },
    },
    dataLabels: {
      enabled: false,
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
        text: "Delivered Quantity",
      },
      labels: {
        formatter: (val: number) => val.toLocaleString(),
      },
    },
    legend: {
      show: false,
    },
    grid: {
      borderColor: "#f0f0f0",
      strokeDashArray: 3,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toLocaleString()} units`,
      },
    },
  };

  const series = [
    {
      name: "Delivered Qty",
      data: deliveredData,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Sales Order Fulfillment
          </h3>
          
          {/* Year Filter Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="year-filter" className="text-sm text-gray-600 dark:text-gray-400">
              Year:
            </label>
            <select
              id="year-filter"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Delivered Quantity by Period
          {metadata && ` (${metadata.period === 'monthly' ? 'Monthly' : 'Yearly'} View)`}
        </p>
      </div>
      
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <Chart options={options} series={series} type="bar" height={400} />
        </div>
      </div>
    </div>
  );
};

export default OrderFulfillment;
