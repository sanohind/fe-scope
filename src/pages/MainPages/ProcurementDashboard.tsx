import PageMeta from "../../components/common/PageMeta";
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
        {/* Procurement KPI Cards */}
        <ProcurementKPI />

        {/* Receipt Performance & PO vs Invoice Status */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ReceiptPerformance />
          <PoVsInvoiceStatus />
        </div>

        {/* Top Suppliers by Value */}
        <TopSuppliersByValue />

        {/* Receipt Trend */}
        <ReceiptTrend />

        {/* Supplier Delivery Performance & Receipt by Item Group */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SupplierDeliveryPerformance />
          <ReceiptByItemGroup />
        </div>

        {/* Outstanding PO Analysis Table */}
        <OutstandingPoAnalysis />

        {/* Receipt Approval Rate by Supplier */}
        <ReceiptApprovalRateBySupplier />

        {/* Purchase Price Trend & Payment Status Tracking */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <PurchasePriceTrend />
          <PaymentStatusTracking />
        </div>
      </div>
    </>
  );
}
