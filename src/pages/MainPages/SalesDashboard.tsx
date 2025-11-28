import PageMeta from "../../components/common/PageMeta";
import LazyLoad from "../../components/common/LazyLoad";
import {
  SalesOverviewKPI,
  TopCustomersByRevenue,
  SalesByProductType,
  OrderFulfillment,
  TopSellingProducts,
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
        {/* Chart 4.1: Sales Overview KPI Cards - Load immediately */}
        <SalesOverviewKPI />

        {/* Chart 4.3 & 4.4: Top Customers and Sales by Product Type */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <LazyLoad height="400px">
            <TopCustomersByRevenue />
          </LazyLoad>
          <LazyLoad height="400px">
            <SalesByProductType />
          </LazyLoad>
        </div>

        {/* Chart 4.8: Sales Order Fulfillment */}
        <LazyLoad height="400px">
          <OrderFulfillment />
        </LazyLoad>

        {/* Chart 4.9: Top Selling Products Table */}
        <LazyLoad height="500px">
          <TopSellingProducts />
        </LazyLoad>

        {/* Chart 4.10 & 4.11: Revenue by Currency and Monthly Sales Comparison */}
        <LazyLoad height="400px">
          <MonthlySalesComparison />
        </LazyLoad>
      </div>
    </>
  );
}
