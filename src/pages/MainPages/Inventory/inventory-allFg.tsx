import PageMeta from "../../../components/common/PageMeta";
import LazyLoad from "../../../components/common/LazyLoad";
import StockLevelOverview from "../../../components/dashboard/inventory/StockLevelOverview";
import StockHealthByWarehouse from "../../../components/dashboard/inventory/StockHealthByWarehouse";
import InventoryAvailabilityVsDemand from "../../../components/dashboard/inventory/InventoryAvailabilityVsDemand";
import InventoryStockByCustomer from "../../../components/dashboard/inventory/InventoryStockByCustomer";
import InventoryFilterHeader from "../../../components/dashboard/inventory/InventoryFilterHeader";
import { InventoryFilterProvider, useInventoryFilters } from "../../../context/InventoryFilterContext";

const WAREHOUSE = "FG";

export default function InventoryAllFg() {
  return (
    <>
      <PageMeta title="Inventory Dashboard | SCOPE - Sanoh Indonesia" description="Dashboard 1: Inventory Management & Stock Control - Monitoring dan analisis stock inventory" />
      <InventoryFilterProvider warehouse={WAREHOUSE}>
        <InventoryAllFgContent />
      </InventoryFilterProvider>
    </>
  );
}

const InventoryAllFgContent = () => {
  const { requestParams } = useInventoryFilters();

  return (
    <div className="space-y-6">
      <InventoryFilterHeader filters={{ groupType: false }}/>

      {/* Stock Level Overview - KPI Cards - Load immediately */}
      <StockLevelOverview warehouse={WAREHOUSE} filters={requestParams} />

      {/* Stock Health by Warehouse & Stock by Customer */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <LazyLoad height="400px">
          <StockHealthByWarehouse warehouse={WAREHOUSE} filters={requestParams} />
        </LazyLoad>
        <LazyLoad height="400px">
          <InventoryStockByCustomer warehouse={WAREHOUSE} filters={requestParams} />
        </LazyLoad>
      </div>

      <LazyLoad height="400px">
        <InventoryAvailabilityVsDemand warehouse={WAREHOUSE} filters={requestParams} />
      </LazyLoad>
    </div>
  );
};
