import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from "recharts";
import { warehouseApi } from "../../../services/api/dashboardApi";

interface DailyVolumeData {
  order_date: string;
  total_order_qty: string;
  total_ship_qty: string;
  gap_qty: string;
  order_count: number;
}

const DailyOrderVolume: React.FC = () => {
  const [data, setData] = useState<DailyVolumeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Calculate date range for selected month
        const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
        const lastDay = new Date(selectedYear, selectedMonth, 0);
        
        const dateFrom = firstDay.toISOString().split('T')[0];
        const dateTo = lastDay.toISOString().split('T')[0];
        
        const result = await warehouseApi.getDailyOrderVolume({
          date_from: dateFrom,
          date_to: dateTo,
        });
        
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear]);

  const months = [
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
  ];

  const years = Array.from({ length: 3 }, (_, i) => currentDate.getFullYear() - i);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      // Get the full date from payload
      const dateString = payload[0].payload.date;
      const date = new Date(dateString);
      const formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-800 dark:text-white mb-2">{formattedDate}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm mb-1">
              <span className="flex items-center gap-2">
                <span 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                ></span>
                <span className="text-gray-600 dark:text-gray-300">{entry.name}:</span>
              </span>
              <span className="font-medium text-gray-800 dark:text-white">
                {parseFloat(entry.value).toLocaleString()} units
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

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
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Daily Order Volume
          </h3>
          
          <div className="flex gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">
            {error || "No data available"}
          </p>
        </div>
      </div>
    );
  }

  // Transform data for chart - convert string to number
  const chartData = data.map((item) => ({
    date: item.order_date,
    day: new Date(item.order_date).getDate(),
    "Order Qty": parseFloat(item.total_order_qty),
    "Ship Qty": parseFloat(item.total_ship_qty),
    "Gap": parseFloat(item.gap_qty),
  }));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Daily Order Volume
        </h3>
        
        <div className="flex gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOrderQty" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#465fff" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#465fff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="day" 
                stroke="#9ca3af"
                tick={{ fill: '#6b7280', fontSize: 12, fontFamily: 'Outfit, sans-serif' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#9ca3af"
                tick={{ fill: '#6b7280', fontSize: 12, fontFamily: 'Outfit, sans-serif' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
                label={{ 
                  value: 'Quantity', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: '#6b7280', fontSize: 12, fontFamily: 'Outfit, sans-serif' }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ 
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '14px',
                  paddingTop: '10px'
                }}
                iconType="line"
              />
              <Area
                type="monotone"
                dataKey="Order Qty"
                stroke="#465fff"
                strokeWidth={2}
                fill="url(#colorOrderQty)"
                fillOpacity={1}
              />
              <Line 
                type="monotone" 
                dataKey="Ship Qty" 
                stroke="#12B76A" 
                strokeWidth={3}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="Gap" 
                stroke="#F04438" 
                strokeWidth={3}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DailyOrderVolume;