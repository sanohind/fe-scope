import React, { useEffect, useState, useRef } from "react";
import { warehouseApi } from "../../../services/api/dashboardApi";
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
interface OrderTimelineDataAPI {
  order_no: string;
  ship_from?: string;
  ship_from_desc: string;
  ship_to?: string;
  ship_to_desc: string;
  order_date: string;
  delivery_date: string;
  receipt_date: string | null;
  status: string;
}

// Extended interface for component internal use
interface OrderTimelineData {
  order_no: string;
  order_origin?: string;
  ship_from?: string;
  ship_from_desc: string;
  ship_to?: string;
  ship_to_desc: string;
  order_date: string;
  planned_delivery_date: string;
  actual_receipt_date: string | null;
  total_order_qty?: string;
  statuses?: string;
  delivery_status: string;
  fulfillment_rate?: number;
  status_color?: string;
  days_difference?: number;
  planned_duration_days?: number;
  actual_duration_days?: number | null;
}

interface TimelineSummary {
  total_orders: number;
  on_time: number;
  delayed: number;
  pending: number;
  on_time_rate: number;
  avg_planned_duration: number;
  avg_actual_duration: number;
}

const OrderTimelineGantt: React.FC = () => {
  const [data, setData] = useState<OrderTimelineData[]>([]);
  const [summary, setSummary] = useState<TimelineSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ganttContainerRef = useRef<HTMLDivElement>(null);
  const ganttInstanceRef = useRef<ApexGanttInstance | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedOrder, setSelectedOrder] = useState<OrderTimelineData | null>(null);

  // Filter states
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [limit, setLimit] = useState<number>(100);

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

        if (selectedStatus !== "all") params.status = selectedStatus;

        const result = await warehouseApi.getOrderTimeline(params);

        // Handle both array response and object response
        let timelineData: OrderTimelineDataAPI[] = [];
        let timelineSummary: TimelineSummary | null = null;

        if (Array.isArray(result)) {
          // API returns array directly
          timelineData = result;
        } else if (result && typeof result === "object" && "data" in result) {
          // API returns object with data property
          timelineData = result.data as OrderTimelineDataAPI[];
          timelineSummary = result.summary || null;
        }

        // Transform API data to component format
        const transformedData: OrderTimelineData[] = timelineData.map((item) => {
          // Map API fields to component format
          const deliveryStatus = item.status || "pending";
          const statusColors: Record<string, string> = {
            on_time: "#10b981",
            delayed: "#ef4444",
            pending: "#f59e0b",
            early: "#3b82f6",
          };

          // Calculate days difference if dates are available
          let daysDifference: number | undefined;
          if (item.receipt_date && item.delivery_date) {
            const receipt = new Date(item.receipt_date);
            const delivery = new Date(item.delivery_date);
            daysDifference = Math.floor((receipt.getTime() - delivery.getTime()) / (1000 * 60 * 60 * 24));
          }

          // Calculate duration
          let plannedDurationDays: number | undefined;
          let actualDurationDays: number | null = null;
          if (item.order_date && item.delivery_date) {
            const orderDate = new Date(item.order_date);
            const deliveryDate = new Date(item.delivery_date);
            plannedDurationDays = Math.floor((deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
          }
          if (item.order_date && item.receipt_date) {
            const orderDate = new Date(item.order_date);
            const receiptDate = new Date(item.receipt_date);
            actualDurationDays = Math.floor((receiptDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
          }

          return {
            order_no: item.order_no,
            ship_from: item.ship_from,
            ship_from_desc: item.ship_from_desc,
            ship_to: item.ship_to,
            ship_to_desc: item.ship_to_desc,
            order_date: item.order_date,
            planned_delivery_date: item.delivery_date,
            actual_receipt_date: item.receipt_date,
            delivery_status: deliveryStatus,
            status_color: statusColors[deliveryStatus] || "#6b7280",
            days_difference: daysDifference,
            planned_duration_days: plannedDurationDays,
            actual_duration_days: actualDurationDays,
            fulfillment_rate: item.receipt_date ? 100 : deliveryStatus === "pending" ? 50 : 75,
          };
        });

        setData(transformedData);
        setSummary(timelineSummary);
        setError(null);

        // Debug logging
        console.log("Fetched timeline data:", {
          raw: timelineData.length,
          transformed: transformedData.length,
          month: selectedMonth,
          year: selectedYear,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch timeline data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear, selectedStatus, limit]);

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
    const convertToGanttSeries = (orders: OrderTimelineData[]) => {
      return orders
        .map((order) => {
          // Calculate progress based on fulfillment_rate or status
          let progress = 0;
          if (order.fulfillment_rate !== undefined) {
            progress = Math.round(order.fulfillment_rate);
          } else if (order.actual_receipt_date) {
            progress = 100; // Completed
          } else if (order.delivery_status === "pending") {
            progress = 50; // In progress
          } else {
            progress = 75; // Partially completed
          }

          // Use actual receipt date if available, otherwise use planned delivery date
          const endDate = order.actual_receipt_date || order.planned_delivery_date;

          // Ensure we have valid dates
          if (!order.order_date || !endDate) {
            console.warn(`Order ${order.order_no} has missing dates`, order);
            return null;
          }

          return {
            id: order.order_no,
            startTime: formatDateForGantt(order.order_date),
            endTime: formatDateForGantt(endDate),
            name: `${order.order_no} - ${order.ship_from_desc} → ${order.ship_to_desc}`,
            progress: progress,
            order_data: order, // Store original data for modal
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
        totalOrders: data.length,
        ganttSeriesCount: ganttSeries.length,
        sampleSeries: ganttSeries.slice(0, 3),
        containerWidth: containerRect.width,
        containerHeight: containerRect.height,
      });

      if (ganttSeries.length === 0) {
        console.warn("No valid Gantt series to render");
        return;
      }

      // Get status colors
      const statusColors: Record<string, string> = {
        on_time: "#10b981", // green
        delayed: "#ef4444", // red
        pending: "#f59e0b", // amber
        early: "#3b82f6", // blue
      };

      // Get container dimensions - ensure minimum values
      const containerWidth = Math.max(containerRect.width || 800, 800);
      const calculatedHeight = Math.max(400, ganttSeries.length * 40);

      // Configure Gantt options with styling consistent with warehouse components
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
        enableTaskDrag: false, // Disable task drag functionality (as requested)
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
          const orderData = series.order_data as OrderTimelineData;
          const statusColor = statusColors[orderData.delivery_status] || "#6b7280";

          return {
            id: series.id,
            startTime: series.startTime,
            endTime: series.endTime,
            name: series.name,
            progress: series.progress,
            color: statusColor, // Use status-based color
          };
        }),
        onTaskClick: (task: { id: string }) => {
          // Find the original order data
          const orderData = ganttSeries.find((s) => s.id === task.id)?.order_data;
          if (orderData) {
            setSelectedOrder(orderData);
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
    setSelectedStatus("all");
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

  // Generate years from 2023 to 2026 (to cover 2025 data)
  const years = Array.from({ length: 4 }, (_, i) => 2026 - i);

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
        <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90 mb-4">Warehouse Order Timeline</h3>
        <div className="flex justify-center items-center h-[400px] animate-pulse">
          <div className="w-full h-full bg-gray-200 rounded dark:bg-gray-800"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90 mb-4">Warehouse Order Timeline</h3>
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      {/* Header with Summary */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 text-lg dark:text-white/90">Warehouse Order Timeline</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gantt chart visualization showing order delivery progress and status</p>

        {/* Summary Stats */}
        {summary ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-900 px-3 py-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Orders</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">{summary.total_orders}</p>
            </div>
            <div className="rounded-lg bg-success-50 dark:bg-success-900/20 px-3 py-2">
              <p className="text-xs text-success-600 dark:text-success-400">On Time</p>
              <p className="text-lg font-semibold text-success-700 dark:text-success-300">{summary.on_time}</p>
            </div>
            <div className="rounded-lg bg-error-50 dark:bg-error-900/20 px-3 py-2">
              <p className="text-xs text-error-600 dark:text-error-400">Delayed</p>
              <p className="text-lg font-semibold text-error-700 dark:text-error-300">{summary.delayed}</p>
            </div>
            <div className="rounded-lg bg-warning-50 dark:bg-warning-900/20 px-3 py-2">
              <p className="text-xs text-warning-600 dark:text-warning-400">Pending</p>
              <p className="text-lg font-semibold text-warning-700 dark:text-warning-300">{summary.pending}</p>
            </div>
            <div className="rounded-lg bg-brand-50 dark:bg-brand-900/20 px-3 py-2">
              <p className="text-xs text-brand-600 dark:text-brand-400">On-Time Rate</p>
              <p className="text-lg font-semibold text-brand-700 dark:text-brand-300">{summary.on_time_rate.toFixed(1)}%</p>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-900 px-3 py-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg Duration</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">{summary.avg_actual_duration.toFixed(0)}d</p>
            </div>
          </div>
        ) : data.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-900 px-3 py-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Orders</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">{data.length}</p>
            </div>
            <div className="rounded-lg bg-success-50 dark:bg-success-900/20 px-3 py-2">
              <p className="text-xs text-success-600 dark:text-success-400">On Time</p>
              <p className="text-lg font-semibold text-success-700 dark:text-success-300">{data.filter((d) => d.delivery_status === "on_time").length}</p>
            </div>
            <div className="rounded-lg bg-error-50 dark:bg-error-900/20 px-3 py-2">
              <p className="text-xs text-error-600 dark:text-error-400">Delayed</p>
              <p className="text-lg font-semibold text-error-700 dark:text-error-300">{data.filter((d) => d.delivery_status === "delayed").length}</p>
            </div>
            <div className="rounded-lg bg-warning-50 dark:bg-warning-900/20 px-3 py-2">
              <p className="text-xs text-warning-600 dark:text-warning-400">Pending</p>
              <p className="text-lg font-semibold text-warning-700 dark:text-warning-300">{data.filter((d) => d.delivery_status === "pending").length}</p>
            </div>
            <div className="rounded-lg bg-brand-50 dark:bg-brand-900/20 px-3 py-2">
              <p className="text-xs text-brand-600 dark:text-brand-400">On-Time Rate</p>
              <p className="text-lg font-semibold text-brand-700 dark:text-brand-300">{data.length > 0 ? ((data.filter((d) => d.delivery_status === "on_time").length / data.length) * 100).toFixed(1) : 0}%</p>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-900 px-3 py-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg Duration</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {data.filter((d) => d.actual_duration_days !== null && d.actual_duration_days !== undefined).length > 0
                  ? Math.round(
                      data.filter((d) => d.actual_duration_days !== null && d.actual_duration_days !== undefined).reduce((sum, d) => sum + (d.actual_duration_days || 0), 0) /
                        data.filter((d) => d.actual_duration_days !== null && d.actual_duration_days !== undefined).length
                    )
                  : 0}
                d
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
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

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="all">All Status</option>
            <option value="on_time">On Time</option>
            <option value="delayed">Delayed</option>
            <option value="pending">Pending</option>
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

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={handleResetFilters}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Gantt Chart Timeline */}
      <div className="gantt-chart-container">
        {data.length === 0 && !loading ? (
          <div className="flex justify-center items-center h-96 border border-dashed border-gray-300 rounded-lg dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              No orders found for {months[selectedMonth - 1].label} {selectedYear}
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

      {/* Order Detail Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] p-6">
        {selectedOrder && (
          <div className="flex flex-col">
            <div>
              <h5 className="mb-2 font-semibold text-gray-800 text-xl dark:text-white/90">Order Details - {selectedOrder.order_no}</h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">Complete information about this warehouse order</p>
            </div>

            <div className="mt-6 space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                <span
                  className="px-3 py-1 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: `${selectedOrder.status_color}20`,
                    color: selectedOrder.status_color,
                  }}
                >
                  {selectedOrder.delivery_status.replace("_", " ").toUpperCase()}
                </span>
              </div>

              {/* Route */}
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Route:</span>
                <p className="text-sm font-medium text-gray-800 dark:text-white mt-1">
                  {selectedOrder.ship_from_desc} → {selectedOrder.ship_to_desc}
                </p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Order Date:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white mt-1">{formatDate(selectedOrder.order_date)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Planned Delivery:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white mt-1">{formatDate(selectedOrder.planned_delivery_date)}</p>
                </div>
                {selectedOrder.actual_receipt_date && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Actual Receipt:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white mt-1">{formatDate(selectedOrder.actual_receipt_date)}</p>
                  </div>
                )}
              </div>

              {/* Quantity & Fulfillment */}
              <div className="grid grid-cols-2 gap-3">
                {selectedOrder.total_order_qty && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Order Quantity:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white mt-1">{parseFloat(selectedOrder.total_order_qty).toLocaleString()} units</p>
                  </div>
                )}
                {selectedOrder.fulfillment_rate !== undefined && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Fulfillment Rate:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white mt-1">{selectedOrder.fulfillment_rate.toFixed(1)}%</p>
                  </div>
                )}
              </div>

              {/* Duration */}
              {selectedOrder.planned_duration_days && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Planned Duration:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white mt-1">{selectedOrder.planned_duration_days} days</p>
                  </div>
                  {selectedOrder.actual_duration_days && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Actual Duration:</span>
                      <p className="text-sm font-medium text-gray-800 dark:text-white mt-1">
                        {selectedOrder.actual_duration_days} days
                        {selectedOrder.days_difference !== undefined && selectedOrder.days_difference !== 0 && (
                          <span className={selectedOrder.days_difference > 0 ? "text-error-600 ml-1" : "text-success-600 ml-1"}>
                            ({selectedOrder.days_difference > 0 ? "+" : ""}
                            {selectedOrder.days_difference}d)
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}
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
          Showing {data.length} of {summary.total_orders} orders. Adjust filters or limit to view more data.
        </div>
      ) : data.length > 0 ? (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          Showing {data.length} order{data.length !== 1 ? "s" : ""}. Adjust filters or limit to view more data.
        </div>
      ) : null}
    </div>
  );
};

export default OrderTimelineGantt;
