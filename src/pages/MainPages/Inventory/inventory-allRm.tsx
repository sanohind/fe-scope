import PageMeta from "../../../components/common/PageMeta";
import LazyLoad from "../../../components/common/LazyLoad";
import StockLevelOverview from "../../../components/dashboard/inventory/StockLevelOverview";
import StockHealthByWarehouse from "../../../components/dashboard/inventory/StockHealthByWarehouse";
import StockByCustomer from "../../../components/dashboard/inventory/StockByCustomer";
import InventoryAvailabilityVsDemand from "../../../components/dashboard/inventory/InventoryAvailabilityVsDemand";
import InventoryFilterHeader from "../../../components/dashboard/inventory/InventoryFilterHeader";
import { InventoryFilterProvider, useInventoryFilters } from "../../../context/InventoryFilterContext";

const WAREHOUSE = "RM";

export default function InventoryAllRm() {
  return (
    <>
      <PageMeta title="Inventory Dashboard | SCOPE - Sanoh Indonesia" description="Dashboard 1: Inventory Management & Stock Control - Monitoring dan analisis stock inventory" />
      <InventoryFilterProvider warehouse={WAREHOUSE}>
        <InventoryAllRmContent />
      </InventoryFilterProvider>
    </>
  );
}

const InventoryAllRmContent = () => {
  const { requestParams } = useInventoryFilters();

  return (
    <div className="space-y-6">
      {/* Stock Level Overview - KPI Cards - Load immediately */}
      <InventoryFilterHeader filters={{ customer: false }}/>
      <StockLevelOverview warehouse={WAREHOUSE} filters={requestParams} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <LazyLoad height="400px">
          <StockHealthByWarehouse warehouse={WAREHOUSE} filters={requestParams} />
        </LazyLoad>
        <LazyLoad height="400px">
          <StockByCustomer warehouse={WAREHOUSE} filters={requestParams} />
        </LazyLoad>
      </div>

      <LazyLoad height="400px">
        <InventoryAvailabilityVsDemand warehouse={WAREHOUSE} filters={requestParams} />
      </LazyLoad>
    </div>
  );
};
