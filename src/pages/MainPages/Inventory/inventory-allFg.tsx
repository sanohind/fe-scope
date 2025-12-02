import PageMeta from "../../../components/common/PageMeta";
import LazyLoad from "../../../components/common/LazyLoad";
import StockLevelOverview from "../../../components/dashboard/inventory/StockLevelOverview";
import StockHealthByWarehouse from "../../../components/dashboard/inventory/StockHealthByWarehouse";
import StockByCustomer from "../../../components/dashboard/inventory/StockByCustomer";
import InventoryAvailabilityVsDemand from "../../../components/dashboard/inventory/InventoryAvailabilityVsDemand";

const WAREHOUSE = "FG";

export default function InventoryAllFg() {
  const warehouse = WAREHOUSE;

  return (
    <>
      <PageMeta title="Inventory Dashboard | SCOPE - Sanoh Indonesia" description="Dashboard 1: Inventory Management & Stock Control - Monitoring dan analisis stock inventory" />
      <div className="space-y-6">
        {/* Stock Level Overview - KPI Cards - Load immediately */}
        <StockLevelOverview warehouse={warehouse} />

        {/* Stock Health by Warehouse & Stock by Customer */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <LazyLoad height="400px">
            <StockHealthByWarehouse warehouse={warehouse} />
          </LazyLoad>
          <LazyLoad height="400px">
            <StockByCustomer warehouse={warehouse} />
          </LazyLoad>
        </div>

        <LazyLoad height="400px">
          <InventoryAvailabilityVsDemand warehouse={warehouse} />
        </LazyLoad>
      </div>
    </>
  );
}
