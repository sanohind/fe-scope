import React, { useEffect, useState, useRef } from "react";
import { productionApi } from "../../../services/api/dashboardApi";
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";

// Declare ApexGantt as global type (loaded from CDN)
interface ApexGanttInstance {
  render: () => void;
  destroy?: () => void;
}

interface ApexGanttConstructor {
  new (container: HTMLElement, options: unknown): ApexGanttInstance;
}

declare global {
  interface Window {
    ApexGantt: ApexGanttConstructor;
  }
}

// API response structure (actual)
interface ScheduleTimelineDataAPI {
  prod_no: string;
  planning_date: string;
  status: string;
  customer: string;
  divisi: string;
  qty_os: string;
  timeline_status: string;
}

// Extended interface for component internal use
interface ScheduleTimelineData {
  prod_no: string;
  planning_date: string;
  status: string;
  customer: string;
  divisi: string;
  qty_os: number;
  timeline_status: string;
  status_color?: string;
  estimated_end_date?: string;
}

interface TimelineSummary {
  total_orders: number;
  on_time: number;
  delayed: number;
  pending: number;
  on_time_rate: number;
}

const ProductionScheduleTimeline: React.FC = () => {
  const [data, setData] = useState<ScheduleTimelineData[]>([]);
  const [summary, setSummary] = useState<TimelineSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ganttContainerRef = useRef<HTMLDivElement>(null);
  const ganttInstanceRef = useRef<ApexGanttInstance | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleTimelineData | null>(null);

  // Filter states
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedTimelineStatus, setSelectedTimelineStatus] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("all");
  const [selectedDivision, setSelectedDivision] = useState<string>("all");
  const [limit, setLimit] = useState<number>(100);
  const [rawData, setRawData] = useState<ScheduleTimelineData[]>([]); // Store unfiltered data

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Calculate date range for selected month
        const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
        const lastDay = new Date(selectedYear, selectedMonth, 0);

        const params: Record<string, string | number> = {
          date_from: firstDay.toISOString().split("T")[0],
          date_to: lastDay.toISOString().split("T")[0],
          limit,
        };

        // Note: timeline_status is not supported by API, will filter client-side
        if (selectedCustomer !== "all") params.customer = selectedCustomer;
        if (selectedDivision !== "all") params.division = selectedDivision;

        const result = await productionApi.getProductionScheduleTimeline(params);

        // Handle both array response and object response
        let timelineData: ScheduleTimelineDataAPI[] = [];
        let timelineSummary: TimelineSummary | null = null;

        if (Array.isArray(result)) {
          // API returns array directly
          timelineData = result;
        } else if (result && typeof result === "object" && "data" in result) {
          // API returns object with data property
          timelineData = result.data as ScheduleTimelineDataAPI[];
          timelineSummary = result.summary || null;
        }

        // Transform API data to component format
        const transformedData: ScheduleTimelineData[] = timelineData.map((item) => {
          // Map timeline_status to colors
          const timelineStatus = item.timeline_status || "pending";
          const statusColors: Record<string, string> = {
            on_time: "#10b981", // green
            delayed: "#ef4444", // red
            pending: "#f59e0b", // amber
            early: "#3b82f6", // blue
            completed: "#059669", // emerald green (different from on_time)
            active: "#6366f1", // indigo (different from early)
          };

          // Calculate estimated end date based on status
          // If Complete/Closed, use planning_date + 30 days, otherwise + 60 days
          let estimatedEndDate: string;
          const planningDate = new Date(item.planning_date);
          if (item.status === "Complete" || item.status === "Closed") {
            estimatedEndDate = new Date(planningDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
          } else {
            estimatedEndDate = new Date(planningDate.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
          }

          return {
            prod_no: item.prod_no,
            planning_date: item.planning_date,
            status: item.status,
            customer: item.customer,
            divisi: item.divisi,
            qty_os: parseFloat(item.qty_os || "0"),
            timeline_status: timelineStatus,
            status_color: statusColors[timelineStatus] || "#6b7280",
            estimated_end_date: estimatedEndDate,
          };
        });

        // Store raw data for client-side filtering
        setRawData(transformedData);
        
        // Apply client-side timeline_status filter
        const filteredData = selectedTimelineStatus === "all" 
          ? transformedData 
          : transformedData.filter(item => item.timeline_status === selectedTimelineStatus);
        
        setData(filteredData);
        setSummary(timelineSummary);
        setError(null);

        // Debug logging
        console.log("Fetched timeline data:", {
          raw: timelineData.length,
          transformed: transformedData.length,
          filtered: filteredData.length,
          timelineStatusFilter: selectedTimelineStatus,
          month: selectedMonth,
          year: selectedYear,
          statusBreakdown: {
            on_time: filteredData.filter(d => d.timeline_status === "on_time").length,
            delayed: filteredData.filter(d => d.timeline_status === "delayed").length,
            pending: filteredData.filter(d => d.timeline_status === "pending").length,
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch timeline data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear, selectedTimelineStatus, selectedCustomer, selectedDivision, limit]);

  // Initialize and render Gantt chart
  useEffect(() => {
    if (!ganttContainerRef.current || !data.length || loading) {
      return;
    }

    // Format date to MM-DD-YYYY format for ApexGantt
    const formatDateForGantt = (dateString: string | null): string => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      return `${month}-${day}-${year}`;
    };

    // Convert API data to Gantt chart series
    const convertToGanttSeries = (schedules: ScheduleTimelineData[]) => {
      return schedules
        .map((schedule) => {
          // Use estimated end date
          const endDate = schedule.estimated_end_date || schedule.planning_date;

          // Ensure we have valid dates
          if (!schedule.planning_date || !endDate) {
            console.warn(`Schedule ${schedule.prod_no} has missing dates`, schedule);
            return null;
          }

          return {
            id: schedule.prod_no,
            startTime: formatDateForGantt(schedule.planning_date),
            endTime: formatDateForGantt(endDate),
            name: `${schedule.prod_no} - ${schedule.customer} (${schedule.divisi}) [${schedule.timeline_status}]`,
            schedule_data: schedule, // Store original data for modal
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    };

    function renderGanttChart() {
      if (!ganttContainerRef.current || !window.ApexGantt) return;

      // Ensure container has dimensions
      const container = ganttContainerRef.current;
      const containerRect = container.getBoundingClientRect();

      if (containerRect.width === 0 || containerRect.height === 0) {
        console.warn("Container has no dimensions, waiting for layout...");
        // Retry after a short delay
        setTimeout(() => renderGanttChart(), 100);
        return;
      }

      // Clear previous instance
      if (ganttInstanceRef.current) {
        try {
          ganttInstanceRef.current.destroy?.();
        } catch {
          // Ignore destroy errors
        }
      }

      // Clear container
      container.innerHTML = "";

      // Convert data to Gantt series
      const ganttSeries = convertToGanttSeries(data);

      // Debug logging
      console.log("Gantt series:", {
        totalSchedules: data.length,
        ganttSeriesCount: ganttSeries.length,
        sampleSeries: ganttSeries.slice(0, 3),
        containerWidth: containerRect.width,
        containerHeight: containerRect.height,
      });

      if (ganttSeries.length === 0) {
        console.warn("No valid Gantt series to render");
        return;
      }

      // Get status colors - ensure each timeline_status has a distinct color
      const statusColors: Record<string, string> = {
        on_time: "#10b981", // green
        delayed: "#ef4444", // red
        pending: "#f59e0b", // amber
        early: "#3b82f6", // blue
        completed: "#059669", // emerald green (different from on_time)
        active: "#6366f1", // indigo (different from early)
      };

      // Get container dimensions - ensure minimum values
      const containerWidth = Math.max(containerRect.width || 800, 800);
      const calculatedHeight = Math.max(400, ganttSeries.length * 40);

      // Configure Gantt options with styling consistent with production components
      const ganttOptions = {
        width: containerWidth, // Use actual container width
        height: calculatedHeight, // Dynamic height based on data
        canvasStyle: "border: 1px solid #e4e7ec; box-sizing: border-box; border-radius: 8px;",
        viewMode: "month" as const, // View mode
        arrowColor: "#465fff", // Brand color for dependency arrows
        rowHeight: 32, // Height for timeline row
        rowBackgroundColors: ["#ffffff", "#f9fafb"], // Alternate row colors matching theme
        barBackgroundColor: "#465fff", // Default bar color (will be overridden per task)
        barBorderRadius: "4px", // Border radius matching theme
        barMargin: 4, // Top and bottom margin for timeline bar
        barTextColor: "#ffffff", // Text color for timeline bar
        enableToolbar: false, // Disable toolbar for cleaner look
        enableResize: false, // Disable sidebar resize
        enableExport: false, // Disable export options
        enableTaskDrag: false, // Disable task drag functionality
        enableTaskEdit: false, // Disable task editing
        enableTaskResize: false, // Disable task resize functionality
        headerBackground: "#f9fafb", // Background color for header matching gray-50
        inputDateFormat: "MM-DD-YYYY", // Input date format
        tasksContainerWidth: 440, // Task sidebar container width
        tooltipId: "apexgantt-tooltip-container", // Tooltip container id
        tooltipBorderColor: "#e4e7ec", // Border color matching gray-200
        tooltipBGColor: "#ffffff", // Background color
        fontSize: "14px", // Font size
        fontFamily: "Outfit, sans-serif", // Font family matching theme
        fontWeight: "400", // Font weight
        fontColor: "#344054", // Font color matching gray-700
        annotationBgColor: "#f9fafb", // Annotation background
        annotationBorderColor: "#e4e7ec", // Annotation border
        annotationBorderDashArray: [], // Border dash array
        annotationBorderWidth: 1, // Border width
        annotationOrientation: "horizontal" as const, // Orientation
        annotationTextColor: "#344054", // Text color
        series: ganttSeries.map((series) => {
          const scheduleData = series.schedule_data as ScheduleTimelineData;
          const statusColor = statusColors[scheduleData.timeline_status] || "#6b7280";

          return {
            id: series.id,
            startTime: series.startTime,
            endTime: series.endTime,
            name: series.name,
            barBackgroundColor: statusColor, // Use timeline_status-based color per ApexGantt spec
          };
        }),
        onTaskClick: (task: { id: string }) => {
          // Find the original schedule data
          const scheduleData = ganttSeries.find((s) => s.id === task.id)?.schedule_data;
          if (scheduleData) {
            setSelectedSchedule(scheduleData);
            openModal();
          }
        },
      };

      // Create and render Gantt chart
      try {
        console.log("Rendering Gantt chart with options:", {
          seriesCount: ganttOptions.series.length,
          chartHeight: ganttOptions.height,
          chartWidth: ganttOptions.width,
        });

        // Ensure container is ready
        if (!container || !container.parentElement) {
          throw new Error("Container element is not available");
        }

        const gantt = new window.ApexGantt(container, ganttOptions);
        gantt.render();
        ganttInstanceRef.current = gantt;

        console.log("Gantt chart rendered successfully");
      } catch (error) {
        console.error("Error rendering Gantt chart:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Full error details:", error);
        setError(`Failed to render Gantt chart: ${errorMessage}`);
      }
    }

    // Small delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(() => {
      if (!ganttContainerRef.current) return;

      // Wait for ApexGantt to be available from CDN
      if (typeof window === "undefined" || !window.ApexGantt) {
        // Check if script is loaded
        const checkApexGantt = setInterval(() => {
          if (window.ApexGantt) {
            clearInterval(checkApexGantt);
            renderGanttChart();
          }
        }, 100);

        return () => {
          clearInterval(checkApexGantt);
        };
      }

      renderGanttChart();
    }, 50);

    // Cleanup on unmount
    return () => {
      clearTimeout(timeoutId);
      if (ganttInstanceRef.current) {
        try {
          ganttInstanceRef.current.destroy?.();
        } catch {
          // Ignore destroy errors
        }
        ganttInstanceRef.current = null;
      }
    };
  }, [data, loading, openModal]);

  const handleResetFilters = () => {
    const today = new Date();
    setSelectedMonth(today.getMonth() + 1);
    setSelectedYear(today.getFullYear());
    setSelectedTimelineStatus("all");
    setSelectedCustomer("all");
    setSelectedDivision("all");
    setLimit(100);
  };

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

  // Generate years from 2023 to 2026
  const years = Array.from({ length: 4 }, (_, i) => 2026 - i);

  // Get unique customers, divisions from raw data (before timeline_status filter)
  const uniqueCustomers = Array.from(new Set(rawData.map((d) => d.customer).filter(Boolean))).sort();
  const uniqueDivisions = Array.from(new Set(rawData.map((d) => d.divisi).filter(Boolean))).sort();
  const uniqueTimelineStatuses = Array.from(new Set(rawData.map((d) => d.timeline_status).filter(Boolean))).sort();
  
  // If no data yet, show all possible timeline statuses
  const allPossibleStatuses = ["on_time", "delayed", "pending", "early", "completed", "active"];
  const timelineStatusOptions = uniqueTimelineStatuses.length > 0 ? uniqueTimelineStatuses : allPossibleStatuses;

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading && !data.length) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90 mb-4">Production Schedule Timeline</h3>
        <div className="flex justify-center items-center h-[400px] animate-pulse">
          <div className="w-full h-full bg-gray-200 rounded dark:bg-gray-800"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90 mb-4">Production Schedule Timeline</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      {/* Header*/}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Production Schedule Timeline</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gantt chart visualization showing production schedule progress and status</p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Month Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Timeline Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timeline Status</label>
          <select
            value={selectedTimelineStatus}
            onChange={(e) => setSelectedTimelineStatus(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="all">All Timeline Status</option>
            {timelineStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Customer Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer</label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="all">All Customers</option>
            {uniqueCustomers.map((customer) => (
              <option key={customer} value={customer}>
                {customer}
              </option>
            ))}
          </select>
        </div>

        {/* Division Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Division</label>
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="all">All Divisions</option>
            {uniqueDivisions.map((division) => (
              <option key={division} value={division}>
                {division}
              </option>
            ))}
          </select>
        </div>

        {/* Limit Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Limit</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value={20}>20 Orders</option>
            <option value={50}>50 Orders</option>
            <option value={100}>100 Orders</option>
          </select>
        </div>
      </div>

      {/* Reset Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={handleResetFilters}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Reset Filters
        </button>
      </div>

      {/* Timeline Status Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Timeline Status Legend:</span>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded" style={{ backgroundColor: "#10b981" }}></span>
            <span className="text-xs text-gray-600 dark:text-gray-400">On Time</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded" style={{ backgroundColor: "#ef4444" }}></span>
            <span className="text-xs text-gray-600 dark:text-gray-400">Delayed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded" style={{ backgroundColor: "#f59e0b" }}></span>
            <span className="text-xs text-gray-600 dark:text-gray-400">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded" style={{ backgroundColor: "#3b82f6" }}></span>
            <span className="text-xs text-gray-600 dark:text-gray-400">Early</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded" style={{ backgroundColor: "#059669" }}></span>
            <span className="text-xs text-gray-600 dark:text-gray-400">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded" style={{ backgroundColor: "#6366f1" }}></span>
            <span className="text-xs text-gray-600 dark:text-gray-400">Active</span>
          </div>
        </div>
      </div>

      {/* Gantt Chart Timeline */}
      <div className="gantt-chart-container">
        {data.length === 0 && !loading ? (
          <div className="flex justify-center items-center h-96 border border-dashed border-gray-300 rounded-lg dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              No production schedules found for {months[selectedMonth - 1].label} {selectedYear}
            </p>
          </div>
        ) : (
          <div
            ref={ganttContainerRef}
            id="gantt-container"
            className="w-full min-h-[400px] rounded-lg border border-gray-200 dark:border-gray-800 overflow-auto bg-white dark:bg-gray-900"
            style={{
              fontFamily: "Outfit, sans-serif",
            }}
          />
        )}
      </div>

      {/* Schedule Detail Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] p-6">
        {selectedSchedule && (
          <div className="flex flex-col">
            <div>
              <h5 className="mb-2 font-semibold text-gray-800 text-xl dark:text-white/90">Schedule Details - {selectedSchedule.prod_no}</h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">Complete information about this production schedule</p>
            </div>

            <div className="mt-6 space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Timeline Status:</span>
                <span
                  className="px-3 py-1 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: `${selectedSchedule.status_color}20`,
                    color: selectedSchedule.status_color,
                  }}
                >
                  {selectedSchedule.timeline_status.replace("_", " ").toUpperCase()}
                </span>
              </div>

              {/* Production Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Production Status:</span>
                <span className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">{selectedSchedule.status}</span>
              </div>

              {/* Customer & Division */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Customer:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white mt-1">{selectedSchedule.customer}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Division:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white mt-1">{selectedSchedule.divisi}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Planning Date:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white mt-1">{formatDate(selectedSchedule.planning_date)}</p>
                </div>
                {selectedSchedule.estimated_end_date && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Estimated End Date:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white mt-1">{formatDate(selectedSchedule.estimated_end_date)}</p>
                  </div>
                )}
              </div>

              {/* Quantity Outstanding */}
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Quantity Outstanding:</span>
                <p className="text-sm font-medium text-gray-800 dark:text-white mt-1">{selectedSchedule.qty_os.toLocaleString()} units</p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={closeModal}
                type="button"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Footer Note */}
      {summary ? (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          Showing {data.length} of {summary.total_orders} schedules. Adjust filters or limit to view more data.
        </div>
      ) : data.length > 0 ? (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          Showing {data.length} schedule{data.length !== 1 ? "s" : ""}. Adjust filters or limit to view more data.
        </div>
      ) : null}
    </div>
  );
};

export default ProductionScheduleTimeline;
