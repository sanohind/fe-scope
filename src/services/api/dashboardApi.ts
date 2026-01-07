import { API_CONFIG } from "../../config/apiConfig";

const BASE_URL = API_CONFIG.BASE_URL;

// Helper function to filter out undefined/null values from params
const cleanParams = (params?: Record<string, any>): Record<string, any> => {
  if (!params) return {};
  return Object.fromEntries(Object.entries(params).filter(([_, value]) => value !== undefined && value !== null));
};

type InventoryFilterParams = {
  period?: string;
  date_from?: string;
  date_to?: string;
  customer?: string;
  group_type_desc?: string;
};

// Dashboard 1: Inventory Management & Stock Control
export const inventoryApi = {
  // 1.1 Stock Level Overview
  getStockLevelOverview: async (params?: { warehouse?: string } & InventoryFilterParams) => {
    const queryParams = new URLSearchParams(cleanParams(params) as any).toString();
    const url = `${BASE_URL}/api/dashboard/inventory/stock-level-overview${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch stock level overview");
    return response.json();
  },

  // 1.1b Stock Level Detail Table (All warehouses)
  getStockLevelTable: async (params?: { status?: string; search?: string; page?: number; per_page?: number }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/api/dashboard/inventory/stock-level${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch stock level data");
    return response.json();
  },

  // 1.2 Stock Health by Warehouse
  getStockHealthByWarehouse: async (params?: { warehouse?: string; product_type?: string; group?: string; customer?: string } & InventoryFilterParams) => {
    const queryParams = new URLSearchParams(cleanParams(params) as any).toString();
    const url = `${BASE_URL}/api/dashboard/inventory/stock-health-by-warehouse${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch stock health by warehouse");
    return response.json();
  },

  // 1.3 Top Critical Items
  getTopCriticalItems: async (status?: "critical" | "low" | "overstock") => {
    const url = `${BASE_URL}/api/dashboard/inventory/top-critical-items${status ? `?status=${status}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch top critical items");
    return response.json();
  },

  // 1.4 Stock Distribution by Product Type
  getStockDistributionByProductType: async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/inventory/stock-distribution-by-product-type`);
    if (!response.ok) throw new Error("Failed to fetch stock distribution");
    return response.json();
  },

  // 1.5 Stock by Customer (Group Type)
  getStockByCustomer: async (params?: { warehouse?: string } & InventoryFilterParams) => {
    const queryParams = new URLSearchParams(cleanParams(params) as any).toString();
    const url = `${BASE_URL}/api/dashboard/inventory/stock-by-customer${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch stock by group type");
    return response.json();
  },

  // 1.6 Inventory Availability vs Demand
  getInventoryAvailabilityVsDemand: async (groupBy: "warehouse" | "product_group" = "warehouse", params?: { warehouse?: string } & InventoryFilterParams) => {
    const queryParams = new URLSearchParams(cleanParams({ group_by: groupBy, ...params }) as any).toString();
    const url = `${BASE_URL}/api/dashboard/inventory/inventory-availability-vs-demand${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch inventory availability");
    return response.json();
  },

  // 1.7 Stock Movement Trend
  getStockMovementTrend: async (params?: { warehouse?: string; product_type?: string; period?: string; month?: string; year?: string } & InventoryFilterParams) => {
    const queryParams = new URLSearchParams(cleanParams(params) as any).toString();
    const url = `${BASE_URL}/api/dashboard/inventory/stock-movement-trend${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch stock movement trend");
    return response.json();
  },

  // Get all dashboard data
  getAllData: async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/inventory/all-data`);
    if (!response.ok) throw new Error("Failed to fetch all dashboard data");
    return response.json();
  },
};

// Dashboard 1 Revision: Inventory Dashboard by Warehouse
type InventoryRevParams = InventoryFilterParams & Record<string, any>;

export const inventoryRevApi = {
  // Chart 1: Comprehensive KPI Cards
  getKpi: async (warehouse: string, params?: InventoryRevParams) => {
    const queryParams = new URLSearchParams({ warehouse, ...cleanParams(params) } as any).toString();
    const url = `${BASE_URL}/api/dashboard/inventory-rev/kpi?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch KPI");
    return response.json();
  },

  // Chart 2: Stock Health Distribution + Activity
  getStockHealthDistribution: async (warehouse: string, params?: InventoryRevParams) => {
    const queryParams = new URLSearchParams({ warehouse, ...cleanParams(params) } as any).toString();
    const url = `${BASE_URL}/api/dashboard/inventory-rev/stock-health-distribution?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch stock health distribution");
    return response.json();
  },

  // Chart 3: Stock Movement Trend
  getStockMovementTrend: async (warehouse: string, params?: InventoryRevParams) => {
    const queryParams = new URLSearchParams({ warehouse, ...cleanParams(params) } as any).toString();
    const url = `${BASE_URL}/api/dashboard/inventory/stock-movement-trend?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch stock movement trend");
    return response.json();
  },

  // Chart 4: Top 15 Critical Items
  getTopCriticalItems: async (warehouse: string, params?: InventoryRevParams) => {
    const queryParams = new URLSearchParams({ warehouse, ...cleanParams(params) } as any).toString();
    const url = `${BASE_URL}/api/dashboard/inventory-rev/top-critical-items?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch top critical items");
    return response.json();
  },

  // Chart 5: Top 15 Most Active Items
  getMostActiveItems: async (warehouse: string, params?: InventoryRevParams) => {
    const queryParams = new URLSearchParams({ warehouse, ...cleanParams(params) } as any).toString();
    const url = `${BASE_URL}/api/dashboard/inventory-rev/most-active-items?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch most active items");
    return response.json();
  },

  // Chart 6: Stock & Activity by Product Type
  getStockAndActivityByProductType: async (warehouse: string, params?: InventoryRevParams) => {
    const queryParams = new URLSearchParams({ warehouse, ...cleanParams(params) } as any).toString();
    const url = `${BASE_URL}/api/dashboard/inventory-rev/stock-and-activity-by-product-type?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch stock and activity by product type");
    return response.json();
  },

  // Chart 7: Stock by Customer (Treemap)
  getStockByCustomer: async (warehouse: string, params?: InventoryRevParams) => {
    const queryParams = new URLSearchParams({ warehouse, ...cleanParams(params) } as any).toString();
    const url = `${BASE_URL}/api/dashboard/inventory-rev/stock-by-group?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch stock by group");
    return response.json();
  },

  // Chart 7b: Stock by Group Type
  getStockByGroup: async (warehouse: string, params?: InventoryRevParams) => {
    const queryParams = new URLSearchParams({ warehouse, ...cleanParams(params) } as any).toString();
    const url = `${BASE_URL}/api/dashboard/inventory-rev/stock-by-group?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch stock by group");
    return response.json();
  },

  // Chart 8: Receipt vs Shipment Trend (Weekly)
  getReceiptVsShipmentTrend: async (warehouse: string, params?: InventoryRevParams) => {
    const queryParams = new URLSearchParams({ warehouse, ...cleanParams(params) } as any).toString();
    const url = `${BASE_URL}/api/dashboard/inventory-rev/receipt-vs-shipment-trend?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch receipt vs shipment trend");
    return response.json();
  },

  // Chart 9: Transaction Type Distribution
  getTransactionTypeDistribution: async (warehouse: string, params?: InventoryRevParams) => {
    const queryParams = new URLSearchParams({ warehouse, ...cleanParams(params) } as any).toString();
    const url = `${BASE_URL}/api/dashboard/inventory-rev/transaction-type-distribution?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch transaction type distribution");
    return response.json();
  },

  // Chart 10: Fast vs Slow Moving Items
  getFastVsSlowMoving: async (warehouse: string, params?: InventoryRevParams) => {
    const queryParams = new URLSearchParams({ warehouse, ...cleanParams(params) } as any).toString();
    const url = `${BASE_URL}/api/dashboard/inventory-rev/fast-vs-slow-moving?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch fast vs slow moving items");
    return response.json();
  },

  // Chart 11: Stock Turnover Rate (Top 20)
  getStockTurnoverRate: async (warehouse: string, params?: InventoryRevParams) => {
    const queryParams = new URLSearchParams({ warehouse, ...cleanParams(params) } as any).toString();
    const url = `${BASE_URL}/api/dashboard/inventory-rev/stock-turnover-rate?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch stock turnover rate");
    return response.json();
  },

  // Chart 12: Recent Transaction History
  getRecentTransactionHistory: async (warehouse: string, params?: InventoryRevParams) => {
    const queryParams = new URLSearchParams({ warehouse, ...cleanParams(params) } as any).toString();
    const url = `${BASE_URL}/api/dashboard/inventory-rev/recent-transaction-history?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch recent transaction history");
    return response.json();
  },

  // Table: Stock Level Detail
  getStockLevelTable: async (warehouse: string, params?: InventoryRevParams) => {
    const queryParams = new URLSearchParams({ warehouse, ...cleanParams(params) } as any).toString();
    const url = `${BASE_URL}/api/dashboard/inventory-rev/stock-level?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch stock level data");
    return response.json();
  },

  // Table: Stock Level by Customer
  getStockLevelByCustomer: async (warehouse: string, params?: InventoryRevParams) => {
    const queryParams = new URLSearchParams({ warehouse, ...cleanParams(params) } as any).toString();
    const url = `${BASE_URL}/api/dashboard/inventory-rev/stock-level-by-customer?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch stock level by customer data");
    return response.json();
  },

  // Chart: Stock by Customer
  getStockByCustomerChart: async (warehouse: string, params?: InventoryRevParams) => {
    const queryParams = new URLSearchParams({ warehouse, ...cleanParams(params) } as any).toString();
    const url = `${BASE_URL}/api/dashboard/inventory/stock-by-customer?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch stock by customer");
    return response.json();
  },

  // Bulk endpoint: Get all data (Chart 1-11)
  getAllData: async (warehouse: string, params?: InventoryRevParams) => {
    const queryParams = new URLSearchParams({ warehouse, ...cleanParams(params) } as any).toString();
    const url = `${BASE_URL}/api/dashboard/inventory-rev/all-data?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch all inventory revision data");
    return response.json();
  },
};

// Dashboard 2: Warehouse Operations
export const warehouseApi = {
  // 2.1 Warehouse Order Summary
  getOrderSummary: async (params?: { date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/api/dashboard/warehouse/order-summary${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch order summary");
    return response.json();
  },

  // 2.2 Order Flow Analysis
  getOrderFlowAnalysis: async (params?: { date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/api/dashboard/warehouse/order-flow-analysis${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch order flow analysis");
    return response.json();
  },

  // 2.3 Delivery Performance
  getDeliveryPerformance: async (params?: { date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/api/dashboard/warehouse/delivery-performance${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch delivery performance");
    return response.json();
  },

  // 2.4 Order Status Distribution
  getOrderStatusDistribution: async (params?: { ship_from?: string; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/api/dashboard/warehouse/order-status-distribution${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch order status distribution");
    return response.json();
  },

  // 2.5 Daily Order Volume
  getDailyOrderVolume: async (params?: { trx_type?: string; ship_from?: string; date_from?: string; date_to?: string; period?: string }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/api/dashboard/warehouse/daily-order-volume${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) {
      // Check if response is HTML (Laravel error page)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        throw new Error(`Failed to fetch daily order volume: ${response.status} Server Error`);
      }
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Failed to fetch daily order volume: ${response.status} ${errorText.substring(0, 100)}`);
    }
    const responseData = await response.json();
    // API returns { data: [...], filter_metadata: {...} }
    // Extract the data array from response
    if (Array.isArray(responseData)) {
      return responseData;
    }
    if (responseData && Array.isArray(responseData.data)) {
      return responseData.data;
    }
    // Fallback to empty array if structure is unexpected
    console.warn("Daily Order Volume: Unexpected response format", responseData);
    return [];
  },

  // 2.6 Order Fulfillment Rate
  getOrderFulfillmentRate: async (params?: { date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/api/dashboard/warehouse/order-fulfillment-rate${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch order fulfillment rate");
    return response.json();
  },

  // 2.7 Top Items Moved
  getTopItemsMoved: async (limit: number = 20) => {
    const response = await fetch(`${BASE_URL}/api/dashboard/warehouse/top-items-moved?limit=${limit}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch top items moved: ${response.status} ${errorText}`);
    }
    const data = await response.json();
    // Ensure we return an array
    return Array.isArray(data) ? data : data?.data || [];
  },

  // 2.8 Warehouse Order Timeline
  getOrderTimeline: async (params?: { date_from?: string; date_to?: string; status?: string; ship_from?: string; ship_to?: string; limit?: number }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/api/dashboard/warehouse/order-timeline${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch order timeline");
    return response.json();
  },

  // 2.8.1 Get Order Timeline Filters
  getOrderTimelineFilters: async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/warehouse/order-timeline/filters`);
    if (!response.ok) throw new Error("Failed to fetch order timeline filters");
    return response.json();
  },

  // 2.8.2 Get Order Timeline Detail
  getOrderTimelineDetail: async (orderNo: string) => {
    const response = await fetch(`${BASE_URL}/api/dashboard/warehouse/order-timeline/${orderNo}`);
    if (!response.ok) throw new Error("Failed to fetch order timeline detail");
    return response.json();
  },

  // Get all dashboard data
  getAllData: async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/warehouse/all-data`);
    if (!response.ok) throw new Error("Failed to fetch all warehouse dashboard data");
    return response.json();
  },
};

// Dashboard 4: Sales & Shipment Analysis
export const salesApi = {
  // 4.1 Sales Overview KPI
  getSalesOverview: async (params?: { period?: "daily" | "monthly" | "yearly"; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams(cleanParams(params) as any).toString();
    const url = `${BASE_URL}/api/dashboard/sales/overview-kpi${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch sales overview");
    return response.json();
  },

  // 4.2 Revenue Trend
  getRevenueTrend: async (params?: { period?: "daily" | "monthly" | "yearly"; customer?: string; product_type?: string; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams(cleanParams(params) as any).toString();
    const url = `${BASE_URL}/api/dashboard/sales/revenue-trend${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch revenue trend");
    return response.json();
  },

  // 4.3 Top Customers by Revenue
  getTopCustomers: async (params?: { limit?: number; period?: "daily" | "monthly" | "yearly"; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams(cleanParams(params) as any).toString();
    const url = `${BASE_URL}/api/dashboard/sales/top-customers-by-revenue${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Failed to fetch top customers: ${response.status} ${errorText}`);
    }
    const data = await response.json();
    // Ensure we return an array
    return Array.isArray(data) ? data : data?.data || [];
  },

  // 4.4 Sales by Product Type
  getSalesByProductType: async (params?: { period?: "daily" | "monthly" | "yearly"; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams(cleanParams(params) as any).toString();
    const url = `${BASE_URL}/api/dashboard/sales/by-product-type${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch sales by product type");
    return response.json();
  },

  // 4.5 Shipment Status Tracking
  getShipmentStatusTracking: async (params?: { period?: "daily" | "monthly" | "yearly"; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams(cleanParams(params) as any).toString();
    const url = `${BASE_URL}/api/dashboard/sales/shipment-status-tracking${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch shipment status tracking");
    return response.json();
  },

  // 4.6 Delivery Performance
  getDeliveryPerformance: async (params?: { period?: "daily" | "monthly" | "yearly"; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams(cleanParams(params) as any).toString();
    const url = `${BASE_URL}/api/dashboard/sales/delivery-performance${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch delivery performance");
    return response.json();
  },

  // 4.7 Invoice Status Distribution
  getInvoiceStatusDistribution: async (params?: { group_by?: "daily" | "monthly" | "yearly" | "customer"; period?: "daily" | "monthly" | "yearly"; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams(cleanParams(params) as any).toString();
    const url = `${BASE_URL}/api/dashboard/sales/invoice-status-distribution${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch invoice status distribution");
    return response.json();
  },

  // 4.8 Sales Order Fulfillment
  getOrderFulfillment: async (params?: { period?: "daily" | "monthly" | "yearly"; date_from?: string; date_to?: string; product_type?: string; customer?: string }) => {
    const queryParams = new URLSearchParams(cleanParams(params) as any).toString();
    const url = `${BASE_URL}/api/dashboard/sales/order-fulfillment${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch order fulfillment");
    return response.json();
  },

  // 4.9 Top Selling Products
  getTopProducts: async (params?: { limit?: number; period?: "daily" | "monthly" | "yearly"; product_type?: string; customer?: string; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams(cleanParams(params) as any).toString();
    const url = `${BASE_URL}/api/dashboard/sales/top-selling-products${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch top products");
    return response.json();
  },

  // 4.10 Revenue by Currency
  getRevenueByCurrency: async (params?: { period?: "daily" | "monthly" | "yearly"; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams(cleanParams(params) as any).toString();
    const url = `${BASE_URL}/api/dashboard/sales/revenue-by-currency${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch revenue by currency");
    return response.json();
  },

  // 4.11 Monthly Sales Comparison
  getMonthlySalesComparison: async (params?: { period?: "daily" | "monthly" | "yearly"; date_from?: string; date_to?: string; product_type?: string; customer?: string }) => {
    const queryParams = new URLSearchParams(cleanParams(params) as any).toString();
    const url = `${BASE_URL}/api/dashboard/sales/monthly-sales-comparison${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch monthly sales comparison");
    return response.json();
  },

  // Get all dashboard data
  getAllData: async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/sales/all-data`);
    if (!response.ok) throw new Error("Failed to fetch all sales dashboard data");
    return response.json();
  },
};

// Dashboard 3: Production Planning & Monitoring
export const productionApi = {
  // 3.1 Production KPI Summary
  getProductionKpiSummary: async (params?: { period?: "daily" | "monthly" | "yearly"; divisi?: string; date_from?: string; date_to?: string }) => {
    const cleaned = cleanParams(params);
    const queryParams = new URLSearchParams(cleaned as any).toString();
    const url = `${BASE_URL}/api/dashboard/production/kpi-summary${queryParams ? `?${queryParams}` : ""}`;
    console.log("getProductionKpiSummary - params:", params, "cleaned:", cleaned, "URL:", url);
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch production KPI summary");
    return response.json();
  },

  // 3.2 Production Status Distribution
  getProductionStatusDistribution: async (params?: { period?: "daily" | "monthly" | "yearly"; divisi?: string; date_from?: string; date_to?: string }) => {
    const cleaned = cleanParams(params);
    const queryParams = new URLSearchParams(cleaned as any).toString();
    const url = `${BASE_URL}/api/dashboard/production/status-distribution${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch production status distribution");
    return response.json();
  },

  // 3.3 Production by Customer
  getProductionByCustomer: async (limit: number = 15, params?: { period?: "daily" | "monthly" | "yearly"; divisi?: string; date_from?: string; date_to?: string }) => {
    const cleaned = cleanParams({ limit: limit.toString(), ...params });
    const queryParams = new URLSearchParams(cleaned as any).toString();
    const url = `${BASE_URL}/api/dashboard/production/by-customer?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch production by customer");
    return response.json();
  },

  // 3.4 Production by Model
  getProductionByModel: async (limit: number = 20, params?: { period?: "daily" | "monthly" | "yearly"; divisi?: string; date_from?: string; date_to?: string }) => {
    const cleaned = cleanParams({ limit: limit.toString(), ...params });
    const queryParams = new URLSearchParams(cleaned as any).toString();
    const url = `${BASE_URL}/api/dashboard/production/by-model?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch production by model");
    return response.json();
  },

  // 3.5 Production Schedule Timeline
  getProductionScheduleTimeline: async (params?: { date_from?: string; date_to?: string; status?: string; customer?: string; divisi?: string }) => {
    const cleaned = cleanParams(params);
    const queryParams = new URLSearchParams(cleaned as any).toString();
    const url = `${BASE_URL}/api/dashboard/production/schedule-timeline${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch production schedule timeline");
    return response.json();
  },

  // 3.6 Production Outstanding Analysis
  getProductionOutstandingAnalysis: async (params?: { status?: string; customer?: string; date_from?: string; date_to?: string }) => {
    const cleaned = cleanParams(params);
    const queryParams = new URLSearchParams(cleaned as any).toString();
    const url = `${BASE_URL}/api/dashboard/production/outstanding-analysis${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch production outstanding analysis");
    return response.json();
  },

  // 3.7 Production by divisi
  getProductionBydivisi: async (params?: { period?: "daily" | "monthly" | "yearly"; date_from?: string; date_to?: string }) => {
    const cleaned = cleanParams(params);
    const queryParams = new URLSearchParams(cleaned as any).toString();
    const url = `${BASE_URL}/api/dashboard/production/by-division${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch production by divisi");
    return response.json();
  },

  // 3.8 Production Trend
  getProductionTrend: async (params?: { period?: "daily" | "monthly" | "yearly"; date_from?: string; date_to?: string; customer?: string; divisi?: string }) => {
    const cleaned = cleanParams(params);
    const queryParams = new URLSearchParams(cleaned as any).toString();
    const url = `${BASE_URL}/api/dashboard/production/trend${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch production trend");
    return response.json();
  },

  // 3.9 Production by Warehouse
  getProductionByWarehouse: async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/production/by-warehouse`);
    if (!response.ok) throw new Error("Failed to fetch production by warehouse");
    return response.json();
  },

  // Get all dashboard data
  getAllData: async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/production/all-data`);
    if (!response.ok) throw new Error("Failed to fetch all production dashboard data");
    return response.json();
  },
};

// Dashboard 5: Procurement & Receipt Analysis
export const procurementApi = {
  // 5.1 Procurement KPI
  getProcurementKpi: async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/procurement/kpi`);
    if (!response.ok) throw new Error("Failed to fetch procurement KPI");
    return response.json();
  },

  // 5.2 Receipt Performance
  getReceiptPerformance: async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/procurement/receipt-performance`);
    if (!response.ok) throw new Error("Failed to fetch receipt performance");
    return response.json();
  },

  // 5.3 Top Suppliers by Value
  getTopSuppliersByValue: async (limit: number = 20) => {
    const response = await fetch(`${BASE_URL}/api/dashboard/procurement/top-suppliers-by-value?limit=${limit}`);
    if (!response.ok) throw new Error("Failed to fetch top suppliers by value");
    return response.json();
  },

  // 5.4 Receipt Trend
  getReceiptTrend: async (params?: { period?: "daily" | "weekly" | "monthly"; supplier?: string; item_group?: string; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/api/dashboard/procurement/receipt-trend${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch receipt trend");
    return response.json();
  },

  // 5.5 Supplier Delivery Performance
  getSupplierDeliveryPerformance: async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/procurement/supplier-delivery-performance`);
    if (!response.ok) throw new Error("Failed to fetch supplier delivery performance");
    return response.json();
  },

  // 5.6 Receipt by Item Group
  getReceiptByItemGroup: async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/procurement/receipt-by-item-group`);
    if (!response.ok) throw new Error("Failed to fetch receipt by item group");
    return response.json();
  },

  // 5.7 PO vs Invoice Status
  getPoVsInvoiceStatus: async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/procurement/po-vs-invoice-status`);
    if (!response.ok) throw new Error("Failed to fetch PO vs invoice status");
    return response.json();
  },

  // 5.8 Outstanding PO Analysis
  getOutstandingPoAnalysis: async (params?: { status?: string; supplier?: string; days_outstanding?: number }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/api/dashboard/procurement/outstanding-po-analysis${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch outstanding PO analysis");
    return response.json();
  },

  // 5.9 Receipt Approval Rate by Supplier
  getReceiptApprovalRateBySupplier: async (limit: number = 20) => {
    const response = await fetch(`${BASE_URL}/api/dashboard/procurement/receipt-approval-rate-by-supplier?limit=${limit}`);
    if (!response.ok) throw new Error("Failed to fetch receipt approval rate by supplier");
    return response.json();
  },

  // 5.10 Purchase Price Trend
  getPurchasePriceTrend: async (params?: { items?: string[]; supplier?: string; date_from?: string; date_to?: string; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.items) {
      params.items.forEach((item) => queryParams.append("items", item));
    }
    if (params?.supplier) queryParams.append("supplier", params.supplier);
    if (params?.date_from) queryParams.append("date_from", params.date_from);
    if (params?.date_to) queryParams.append("date_to", params.date_to);
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const url = `${BASE_URL}/api/dashboard/procurement/purchase-price-trend${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch purchase price trend");
    return response.json();
  },

  // 5.11 Payment Status Tracking
  getPaymentStatusTracking: async (params?: { supplier?: string; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/api/dashboard/procurement/payment-status-tracking${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch payment status tracking");
    return response.json();
  },

  // Get all dashboard data
  getAllData: async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/procurement/all-data`);
    if (!response.ok) throw new Error("Failed to fetch all procurement dashboard data");
    return response.json();
  },
};

// Supply Chain APIs
export const SupplyChainApi = {
  // Logistics Shipment Table
  getShipmentTable: async (params?: { status?: string; supplier?: string; date_from?: string; date_to?: string; page?: number; per_page?: number; search?: string; sort_by?: string; sort_order?: string }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/api/dashboard/supply-chain/shipment-table${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch shipment table data");
    return response.json();
  },

  // Shipment Status Comparison - Chart 6.10
  getShipmentStatusComparison: async (params?: { period?: string; date_from?: string; date_to?: string }) => {
    // Filter out undefined and null values before creating query params
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "undefined" && value !== "null") {
          cleanParams[key] = value;
        }
      });
    }
    const queryParams = new URLSearchParams(cleanParams).toString();
    const url = `${BASE_URL}/api/dashboard/supply-chain/shipment-status-comparison${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch shipment status comparison data");
    return response.json();
  },

  // Sales Analytics Bar Chart
  getSalesAnalyticsBarChart: async (params?: { year?: number }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/api/dashboard/sales-analytics/bar-chart${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch sales analytics bar chart data");
    return response.json();
  },

  // Logistics Delivery Performance
  getLogisticsDeliveryPerformance: async (params?: { year?: number; period?: number }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/api/dashboard/sales-analytics/delivery-performance${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch Logistics Delivery Performance data");
    return response.json();
  },
};

// Dashboard 2 Revision: Warehouse Operations by Warehouse
export const warehouseRevApi = {
  // 1. Warehouse Order Summary - KPI Cards
  getOrderSummary: async (warehouse: string, params?: { period?: string; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams({ warehouse, ...params } as any).toString();
    const url = `${BASE_URL}/api/dashboard/warehouse-rev/order-summary?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch warehouse order summary");
    return response.json();
  },

  // 2. Delivery Performance - Gauge Chart
  getDeliveryPerformance: async (warehouse: string, params?: { period?: string; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams({ warehouse, ...params } as any).toString();
    const url = `${BASE_URL}/api/dashboard/warehouse-rev/delivery-performance?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch delivery performance");
    return response.json();
  },

  // 3. Order Status Distribution - Stacked Bar Chart
  getOrderStatusDistribution: async (warehouse: string, params?: { period?: string; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams({ warehouse, ...params } as any).toString();
    const url = `${BASE_URL}/api/dashboard/warehouse-rev/order-status-distribution?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch order status distribution");
    return response.json();
  },

  // 4. Daily Order Volume - Line Chart with Area
  getDailyOrderVolume: async (warehouse: string, params?: { period?: string; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams({ warehouse, ...params } as any).toString();
    const url = `${BASE_URL}/api/dashboard/warehouse-rev/daily-order-volume?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch daily order volume");
    return response.json();
  },

  // 5. Order Fulfillment by Transaction Type - Bar Chart
  getOrderFulfillmentByTransactionType: async (warehouse: string, params?: { period?: string; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams({ warehouse, ...params } as any).toString();
    const url = `${BASE_URL}/api/dashboard/warehouse-rev/order-fulfillment-by-transaction-type?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch order fulfillment by transaction type");
    return response.json();
  },

  // 6. Top Items Moved - Horizontal Bar Chart
  getTopItemsMoved: async (warehouse: string, params?: { period?: string; limit?: number; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams({ warehouse, ...params } as any).toString();
    const url = `${BASE_URL}/api/dashboard/warehouse-rev/top-items-moved?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch top items moved");
    return response.json();
  },

  // 7. Monthly Inbound vs Outbound - Grouped Bar Chart
  getMonthlyInboundVsOutbound: async (warehouse: string, params?: { period?: string; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams({ warehouse, ...params } as any).toString();
    const url = `${BASE_URL}/api/dashboard/warehouse-rev/monthly-inbound-vs-outbound?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch monthly inbound vs outbound");
    return response.json();
  },

  // 8. Top Destinations - Horizontal Bar Chart
  getTopDestinations: async (warehouse: string, params?: { period?: string; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams({ warehouse, ...params } as any).toString();
    const url = `${BASE_URL}/api/dashboard/warehouse-rev/top-destinations?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch top destinations");
    return response.json();
  },

  // 9. Get All Data - Combined Response
  getAllData: async (warehouse: string, params?: { period?: string; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams({ warehouse, ...params } as any).toString();
    const url = `${BASE_URL}/api/dashboard/warehouse-rev/all-data?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch all warehouse revision data");
    return response.json();
  },

  // 10. Daily Stock Trend
  getDailyStockTrend: async (warehouse: string, params?: { period?: string; from?: string; to?: string }) => {
    const queryParams = new URLSearchParams(cleanParams({ warehouse, ...params }) as any).toString();
    const url = `${BASE_URL}/api/stock/daily?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch daily stock trend");
    return response.json();
  },

  // 11. Plan Receipt Chart
  getPlanReceipt: async (warehouse: string, params?: { period?: string; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams({ warehouse, ...cleanParams(params) } as any).toString();
    const url = `${BASE_URL}/api/dashboard/warehouse-rev/dn-plan-receipt?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch plan receipt data");
    return response.json();
  },
};

// Dashboard 6: HR Dashboard
export const hrApi = {
  // 6.1 Active Employees Count
  getActiveEmployeesCount: async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/hr/active-employees-count`);
    if (!response.ok) throw new Error("Failed to fetch active employees count");
    return response.json();
  },

  // 6.2 Employment Status Comparison
  getEmploymentStatusComparison: async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/hr/employment-status-comparison`);
    if (!response.ok) throw new Error("Failed to fetch employment status comparison");
    return response.json();
  },

  // 6.3 Present Attendance by Shift
  getPresentAttendanceByShift: async (params?: { period?: string; startDate?: string; endDate?: string }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/api/dashboard/hr/present-attendance-by-shift${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch present attendance by shift");
    return response.json();
  },

  // 6.4 Top Employees by Overtime Index
  getTopEmployeesOvertime: async (params?: { month?: number; year?: number; page?: number; per_page?: number }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/api/dashboard/hr/top-employees-overtime${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch top employees overtime");
    return response.json();
  },

  // 6.5 Top Departments by Overtime Index
  getTopDepartmentsOvertime: async (params?: { month?: number; year?: number; page?: number; per_page?: number }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/api/dashboard/hr/top-departments-overtime${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch top departments overtime");
    return response.json();
  },

  // 6.6 Overtime Per Day
  getOvertimePerDay: async (params?: { month?: number; year?: number }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/api/dashboard/hr/overtime-per-day${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch overtime per day");
    return response.json();
  },

  // Get all dashboard data
  getAllData: async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/hr/all-data`);
    if (!response.ok) throw new Error("Failed to fetch all HR dashboard data");
    return response.json();
  },
};
