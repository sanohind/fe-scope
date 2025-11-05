import PageMeta from "../../components/common/PageMeta";
import {
  SalesOverviewKPI,
  RevenueTrend,
  TopCustomersByRevenue,
  SalesByProductType,
  ShipmentStatusTracking,
  DeliveryPerformance,
  InvoiceStatusDistribution,
  OrderFulfillment,
  TopSellingProducts,
  RevenueByCurrency,
  MonthlySalesComparison,
} from "../../components/dashboard/sales";

export default function SalesDashboard() {
  return (
    <>
      <PageMeta
        title="Sales Dashboard | SCOPE - Sanoh Indonesia"
        description="Dashboard 4: Sales & Shipment Analysis - Analisis performa penjualan dan monitoring shipment"
      />
      <div className="space-y-6">
        {/* Chart 4.1: Sales Overview KPI Cards */}
        <SalesOverviewKPI />

        {/* Chart 4.2: Revenue Trend */}
        <RevenueTrend />

        {/* Chart 4.3 & 4.4: Top Customers and Sales by Product Type */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <TopCustomersByRevenue />
          <SalesByProductType />
        </div>

        {/* Chart 4.5 & 4.6: Shipment Status Tracking and Delivery Performance */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ShipmentStatusTracking />
          <DeliveryPerformance />
        </div>

        {/* Chart 4.7: Invoice Status Distribution */}
        <InvoiceStatusDistribution />

        {/* Chart 4.8: Sales Order Fulfillment */}
        <OrderFulfillment />

        {/* Chart 4.9: Top Selling Products Table */}
        <TopSellingProducts />

        {/* Chart 4.10 & 4.11: Revenue by Currency and Monthly Sales Comparison */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <RevenueByCurrency />
          <MonthlySalesComparison />
        </div>
      </div>
    </>
  );
}
