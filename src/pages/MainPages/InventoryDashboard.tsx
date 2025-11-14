import PageMeta from "../../components/common/PageMeta";
import LazyLoad from "../../components/common/LazyLoad";
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
        {/* Stock Level Overview - KPI Cards - Load immediately */}
        <StockLevelOverview />

        {/* Stock Health by Warehouse & Stock by Customer */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <LazyLoad height="400px">
            <StockHealthByWarehouse />
          </LazyLoad>
          <LazyLoad height="400px">
            <StockByCustomer />
          </LazyLoad>
        </div>

        {/* Top Critical Items Table */}
        <LazyLoad height="500px">
          <TopCriticalItems />
        </LazyLoad>

        {/* Stock Movement Trend */}
        <LazyLoad height="450px">
          <StockMovementTrend />
        </LazyLoad>

        {/* Stock Distribution & Inventory Availability */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <LazyLoad height="400px">
            <StockDistributionByProductType />
          </LazyLoad>
          <LazyLoad height="400px">
            <InventoryAvailabilityVsDemand />
          </LazyLoad>
        </div>
      </div>
    </>
  );
}
