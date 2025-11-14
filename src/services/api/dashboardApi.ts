// API Service for Dashboard
const BASE_URL = "http://127.0.0.1:8000";

// Dashboard 1: Inventory Management & Stock Control
export const inventoryApi = {
  // 1.1 Stock Level Overview
  getStockLevelOverview: async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/inventory/stock-level-overview`);
    if (!response.ok) throw new Error("Failed to fetch stock level overview");
    return response.json();
  },

  // 1.2 Stock Health by Warehouse
  getStockHealthByWarehouse: async (params?: { product_type?: string; group?: string; customer?: string }) => {
    const queryParams = new URLSearchParams(params as any).toString();
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

  // 1.5 Stock by Customer
  getStockByCustomer: async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/inventory/stock-by-customer`);
    if (!response.ok) throw new Error("Failed to fetch stock by customer");
    return response.json();
  },

  // 1.6 Inventory Availability vs Demand
  getInventoryAvailabilityVsDemand: async (groupBy: "warehouse" | "product_group" = "warehouse") => {
    const response = await fetch(`${BASE_URL}/api/dashboard/inventory/inventory-availability-vs-demand?group_by=${groupBy}`);
    if (!response.ok) throw new Error("Failed to fetch inventory availability");
    return response.json();
  },

  // 1.7 Stock Movement Trend
  getStockMovementTrend: async (params?: { warehouse?: string; product_type?: string; period?: string; month?: string; year?: string; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams(params as any).toString();
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
  getSalesOverview: async (period: "mtd" | "qtd" | "ytd" = "mtd") => {
    const response = await fetch(`${BASE_URL}/api/dashboard/sales/overview-kpi?period=${period}`);
    if (!response.ok) throw new Error("Failed to fetch sales overview");
    return response.json();
  },

  // 4.2 Revenue Trend
  getRevenueTrend: async (params?: { group_by?: "daily" | "weekly" | "monthly"; customer?: string; product_type?: string; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/api/dashboard/sales/revenue-trend${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch revenue trend");
    return response.json();
  },

  // 4.3 Top Customers by Revenue
  getTopCustomers: async (limit: number = 20) => {
    const response = await fetch(`${BASE_URL}/api/dashboard/sales/top-customers-by-revenue?limit=${limit}`);
    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Failed to fetch top customers: ${response.status} ${errorText}`);
    }
    const data = await response.json();
    // Ensure we return an array
    return Array.isArray(data) ? data : data?.data || [];
  },

  // 4.4 Sales by Product Type
  getSalesByProductType: async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/sales/by-product-type`);
    if (!response.ok) throw new Error("Failed to fetch sales by product type");
    return response.json();
  },

  // 4.5 Shipment Status Tracking
  getShipmentStatusTracking: async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/sales/shipment-status-tracking`);
    if (!response.ok) throw new Error("Failed to fetch shipment status tracking");
    return response.json();
  },

  // 4.6 Delivery Performance
  getDeliveryPerformance: async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/sales/delivery-performance`);
    if (!response.ok) throw new Error("Failed to fetch delivery performance");
    return response.json();
  },

  // 4.7 Invoice Status Distribution
  getInvoiceStatusDistribution: async (groupBy: "monthly" | "customer" = "monthly") => {
    const response = await fetch(`${BASE_URL}/api/dashboard/sales/invoice-status-distribution?group_by=${groupBy}`);
    if (!response.ok) throw new Error("Failed to fetch invoice status distribution");
    return response.json();
  },

  // 4.8 Sales Order Fulfillment
  getOrderFulfillment: async (params?: { period?: "monthly" | "yearly"; date_from?: string; date_to?: string; product_type?: string; customer?: string }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/api/dashboard/sales/order-fulfillment${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch order fulfillment");
    return response.json();
  },

  // 4.9 Top Selling Products
  getTopProducts: async (params?: { limit?: number; product_type?: string; customer?: string; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/api/dashboard/sales/top-selling-products${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch top products");
    return response.json();
  },

  // 4.10 Revenue by Currency
  getRevenueByCurrency: async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/sales/revenue-by-currency`);
    if (!response.ok) throw new Error("Failed to fetch revenue by currency");
    return response.json();
  },

  // 4.11 Monthly Sales Comparison
  getMonthlySalesComparison: async (params?: { date_from?: string; date_to?: string; product_type?: string; customer?: string }) => {
    const queryParams = new URLSearchParams(params as any).toString();
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
  getProductionKpiSummary: async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/production/kpi-summary`);
    if (!response.ok) throw new Error("Failed to fetch production KPI summary");
    return response.json();
  },

  // 3.2 Production Status Distribution
  getProductionStatusDistribution: async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/production/status-distribution`);
    if (!response.ok) throw new Error("Failed to fetch production status distribution");
    return response.json();
  },

  // 3.3 Production by Customer
  getProductionByCustomer: async (limit: number = 15) => {
    const response = await fetch(`${BASE_URL}/api/dashboard/production/by-customer?limit=${limit}`);
    if (!response.ok) throw new Error("Failed to fetch production by customer");
    return response.json();
  },

  // 3.4 Production by Model
  getProductionByModel: async (limit: number = 20) => {
    const response = await fetch(`${BASE_URL}/api/dashboard/production/by-model?limit=${limit}`);
    if (!response.ok) throw new Error("Failed to fetch production by model");
    return response.json();
  },

  // 3.5 Production Schedule Timeline
  getProductionScheduleTimeline: async (params?: { date_from?: string; date_to?: string; status?: string; customer?: string; division?: string }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/api/dashboard/production/schedule-timeline${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch production schedule timeline");
    return response.json();
  },

  // 3.6 Production Outstanding Analysis
  getProductionOutstandingAnalysis: async (params?: { status?: string; customer?: string; date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}/api/dashboard/production/outstanding-analysis${queryParams ? `?${queryParams}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch production outstanding analysis");
    return response.json();
  },

  // 3.7 Production by Division
  getProductionByDivision: async () => {
    const response = await fetch(`${BASE_URL}/api/dashboard/production/by-division`);
    if (!response.ok) throw new Error("Failed to fetch production by division");
    return response.json();
  },

  // 3.8 Production Trend
  getProductionTrend: async (params?: { period?: "monthly" | "weekly"; date_from?: string; date_to?: string; customer?: string; division?: string }) => {
    const queryParams = new URLSearchParams(params as any).toString();
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
