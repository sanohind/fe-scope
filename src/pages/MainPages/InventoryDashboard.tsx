import PageMeta from "../../components/common/PageMeta";
import StockLevelOverview from "../../components/dashboard/inventory/StockLevelOverview";
import StockHealthByWarehouse from "../../components/dashboard/inventory/StockHealthByWarehouse";
import TopCriticalItems from "../../components/dashboard/inventory/TopCriticalItems";
import StockByCustomer from "../../components/dashboard/inventory/StockByCustomer";
import StockDistributionByProductType from "../../components/dashboard/inventory/StockDistributionByProductType";
import InventoryAvailabilityVsDemand from "../../components/dashboard/inventory/InventoryAvailabilityVsDemand";
import StockMovementTrend from "../../components/dashboard/inventory/StockMovementTrend";

export default function InventoryDashboard() {
  return (
    <>
      <PageMeta
        title="Inventory Dashboard | SCOPE - Sanoh Indonesia"
        description="Dashboard 1: Inventory Management & Stock Control - Monitoring dan analisis stock inventory"
      />
      <div className="space-y-6">
        {/* Stock Level Overview - KPI Cards */}
        <StockLevelOverview />

        {/* Stock Health by Warehouse & Stock by Customer */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <StockHealthByWarehouse />
          <StockByCustomer />
        </div>

        {/* Top Critical Items Table */}
        <TopCriticalItems />

        {/* Stock Movement Trend */}
        <StockMovementTrend />

        {/* Stock Distribution & Inventory Availability */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <StockDistributionByProductType />
          <InventoryAvailabilityVsDemand />
        </div>
      </div>
    </>
  );
}
