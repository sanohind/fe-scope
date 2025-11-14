import PageMeta from "../../components/common/PageMeta";
import LazyLoad from "../../components/common/LazyLoad";
import ProcurementKPI from "../../components/dashboard/procurement/ProcurementKPI";
import ReceiptPerformance from "../../components/dashboard/procurement/ReceiptPerformance";
import TopSuppliersByValue from "../../components/dashboard/procurement/TopSuppliersByValue";
import ReceiptTrend from "../../components/dashboard/procurement/ReceiptTrend";
import SupplierDeliveryPerformance from "../../components/dashboard/procurement/SupplierDeliveryPerformance";
import ReceiptByItemGroup from "../../components/dashboard/procurement/ReceiptByItemGroup";
import PoVsInvoiceStatus from "../../components/dashboard/procurement/PoVsInvoiceStatus";
import OutstandingPoAnalysis from "../../components/dashboard/procurement/OutstandingPoAnalysis";
import ReceiptApprovalRateBySupplier from "../../components/dashboard/procurement/ReceiptApprovalRateBySupplier";
import PurchasePriceTrend from "../../components/dashboard/procurement/PurchasePriceTrend";
import PaymentStatusTracking from "../../components/dashboard/procurement/PaymentStatusTracking";

export default function ProcurementDashboard() {
  return (
    <>
      <PageMeta
        title="Procurement Dashboard | SCOPE - Sanoh Indonesia"
        description="Dashboard 5: Procurement & Receipt Analysis - Monitoring purchase order receipt, supplier performance, and procurement efficiency"
      />
      <div className="space-y-6">
        {/* Procurement KPI Cards - Load immediately */}
        <ProcurementKPI />

        {/* Receipt Performance & PO vs Invoice Status */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <LazyLoad height="350px">
            <ReceiptPerformance />
          </LazyLoad>
          <LazyLoad height="350px">
            <PoVsInvoiceStatus />
          </LazyLoad>
        </div>

        {/* Top Suppliers by Value */}
        <LazyLoad height="400px">
          <TopSuppliersByValue />
        </LazyLoad>

        {/* Receipt Trend */}
        <LazyLoad height="450px">
          <ReceiptTrend />
        </LazyLoad>

        {/* Supplier Delivery Performance & Receipt by Item Group */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <LazyLoad height="350px">
            <SupplierDeliveryPerformance />
          </LazyLoad>
          <LazyLoad height="350px">
            <ReceiptByItemGroup />
          </LazyLoad>
        </div>

        {/* Outstanding PO Analysis Table */}
        <LazyLoad height="500px">
          <OutstandingPoAnalysis />
        </LazyLoad>

        {/* Receipt Approval Rate by Supplier */}
        <LazyLoad height="400px">
          <ReceiptApprovalRateBySupplier />
        </LazyLoad>

        {/* Purchase Price Trend & Payment Status Tracking */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <LazyLoad height="450px">
            <PurchasePriceTrend />
          </LazyLoad>
          <LazyLoad height="450px">
            <PaymentStatusTracking />
          </LazyLoad>
        </div>
      </div>
    </>
  );
}
