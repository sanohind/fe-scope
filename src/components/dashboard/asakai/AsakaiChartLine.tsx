import React, { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { useNavigate } from "react-router-dom";
import { List } from "lucide-react";
import { asakaiApi } from "../../../services/asakaiApi";
import { AsakaiFilterRequestParams } from "../../../context/AsakaiFilterContext";

interface ChartDataPoint {
  date: string;
  period: string;
  qty: number;
  target?: number;
  label: string;
  formattedDate: string;
  has_data: boolean;
  chart_id: number | null;
  reasons: Array<{
    id: number;
    date: string;
    part_no: string;
    part_name: string;
    problem: string;
    qty: number;
    section: string;
    line: string;
    penyebab: string;
    perbaikan: string;
    user: string;
    user_id: number;
    created_at: string;
  }>;
  reasons_count: number;
}

interface AsakaiChartLineProps {
  titleId: number;
  titleName: string;
  category: string;
  filters?: AsakaiFilterRequestParams;
  descriptionLabel?: string;
  unit?: string;
}

const AsakaiChartLine: React.FC<AsakaiChartLineProps> = ({ titleId, titleName, category, filters, descriptionLabel = "Target", unit = "" }) => {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = {
          asakai_title_id: titleId,
          period: filters?.period,
          date_from: filters?.date_from,
          date_to: filters?.date_to,
        };
        
        // Fetch chart data and targets in parallel
        // We fetch targets for the relevant period. If 'daily' or 'monthly', extracting year is useful.
        const year = filters?.date_from ? new Date(filters.date_from).getFullYear() : new Date().getFullYear();
        
        const [chartRes, targetRes] = await Promise.all([
            asakaiApi.getChartData(params),
            asakaiApi.getTargets({ asakai_title_id: titleId, year, per_page: 100 })
        ]);
        
        // Create a map for targets: "YEAR-MONTH" -> target value
        const targetMap = new Map<string, number>();
        if (targetRes.success && targetRes.data?.data) {
            targetRes.data.data.forEach((t: any) => {
                targetMap.set(`${t.year}-${t.period}`, t.target);
            });
        }

        if (chartRes.success && chartRes.data) {
          const chartData: ChartDataPoint[] = chartRes.data.map((item: any) => {
            const dateObj = new Date(item.date);
            let label = "";
            let formattedDate = "";

            if (filters?.period === "daily") {
              label = dateObj.toLocaleDateString("en-US", { day: "numeric" });
              formattedDate = dateObj.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
            } else if (filters?.period === "monthly") {
              const [year, month] = item.date.split("-");
              const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
              label = monthDate.toLocaleDateString("en-US", { month: "short" });
              formattedDate = monthDate.toLocaleDateString("en-US", { year: "numeric", month: "long" });
            } else {
              label = item.date.split("-")[0];
              formattedDate = label;
            }
            
            // Determine target
            let targetVal: number | undefined = undefined;
            // Determine Year-Month key
            let key = "";
            if (filters?.period === "daily") {
                key = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}`;
            } else if (filters?.period === "monthly") {
                const [y, m] = item.date.split("-");
                key = `${parseInt(y)}-${parseInt(m)}`;
            }
            
            if (key) {
                targetVal = targetMap.get(key);
            }

            return {
              date: item.date,
              period: item.date,
              qty: item.qty,
              target: targetVal,
              label,
              formattedDate,
              has_data: item.has_data,
              chart_id: item.chart_id,
              reasons: item.reasons || [],
              reasons_count: item.reasons_count || 0,
            };
          });

          setData(chartData.sort((a, b) => a.period.localeCompare(b.period)));
        } else {
          setData([]);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch chart data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [titleId, filters]);

  /* const latestValue = data.length ? data[data.length - 1].qty : null; */
  
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;

  const todayData = data.find((item) => item.date === todayStr);
  const todayValue = todayData ? todayData.qty : 0;

  // Calculate current target for description
  let currentTarget: number | undefined = undefined;
  if (filters?.period === "monthly") {
    const currentMonthStr = `${year}-${month}`; // using year, month from above
    const currentMonthData = data.find((d) => d.date === currentMonthStr);
    currentTarget = currentMonthData?.target ?? (data.length > 0 ? data[data.length - 1].target : undefined);
  } else {
     // Daily
     currentTarget = todayData?.target ?? (data.length > 0 ? data[data.length - 1].target : undefined);
  }

  const handleShowReasons = () => {
    navigate(`/asakai-reasons/${titleId}/${encodeURIComponent(titleName)}`);
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload?: ChartDataPoint }[] }) => {
    const dataPoint = payload?.[0]?.payload;
    if (active && dataPoint) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900 max-w-md">
          <p className="text-sm font-medium text-gray-800 dark:text-white">{dataPoint.formattedDate}</p>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-300">Quantity:</p>
              <p className="text-sm font-semibold text-brand-600 dark:text-brand-300">
                {dataPoint.qty.toLocaleString()} {unit}
              </p>
            </div>
            
            {dataPoint.target !== undefined && (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-300">Target:</p>
                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                  {dataPoint.target.toLocaleString()} {unit}
                </p>
              </div>
            )}
            
            {dataPoint.reasons_count > 0 && (
              <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-2">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Reasons ({dataPoint.reasons_count}):
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {dataPoint.reasons.map((reason, index) => (
                    <div key={reason.id} className="text-xs bg-gray-50 dark:bg-gray-800 rounded p-2 space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">#{index + 1}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          {reason.section}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Part: </span>
                        <span className="text-gray-800 dark:text-white font-medium">{reason.part_no}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Name: </span>
                        <span className="text-gray-800 dark:text-white">{reason.part_name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Problem: </span>
                        <span className="text-gray-800 dark:text-white">{reason.problem}</span>
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Line: </span>
                          <span className="text-gray-800 dark:text-white">{reason.line}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Qty: </span>
                          <span className="text-gray-800 dark:text-white font-medium">{reason.qty}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Determine color based on category
  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "safety":
        return "#12B76A"; 
      case "quality":
        return "#12B76A"; 
      case "delivery":
        return "#12B76A"; 
      default:
        return "#12B76A"; 
    }
  };

  const lineColor = getCategoryColor(category);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="animate-pulse">
          <div className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-800 mb-6" />
          <div className="h-80 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-4 flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{titleName}</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">{category}</span>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
          {error || "No data available"}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{titleName}</h3>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">{descriptionLabel}: <span className="text-brand-600 dark:text-brand-400">{currentTarget !== undefined ? currentTarget.toLocaleString() : "0"} {unit}</span></p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-300">
            Today: <span className="text-brand-600 dark:text-brand-300">{todayValue.toLocaleString()} {unit}</span>
          </div>
          <button
            onClick={handleShowReasons}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            <List size={16} />
            Show BIRA
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" stroke="#9ca3af" tick={{ fill: "#6b7280", fontSize: 12, fontFamily: "Outfit, sans-serif" }} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#9ca3af"
                tick={{ fill: "#6b7280", fontSize: 12, fontFamily: "Outfit, sans-serif" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
                label={{
                  value: "Quantity",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#6b7280", fontSize: 12, fontFamily: "Outfit, sans-serif" },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="qty" name="Actual" stroke={lineColor} strokeWidth={3} dot={{ strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
              <Line type="step" dataKey="target" name="Target" stroke="#d20000ff" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AsakaiChartLine;
