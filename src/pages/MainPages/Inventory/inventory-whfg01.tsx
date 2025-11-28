import PageMeta from "../../../components/common/PageMeta";
import LazyLoad from "../../../components/common/LazyLoad";
import InventoryKpiCards from "../../../components/dashboard/inventory/InventoryKpiCards";
import InventoryStockHealthDistribution from "../../../components/dashboard/inventory/InventoryStockHealthDistribution";
import InventoryTopCriticalItems from "../../../components/dashboard/inventory/InventoryTopCriticalItems";
import InventoryMostActiveItems from "../../../components/dashboard/inventory/InventoryMostActiveItems";
import InventoryStockAndActivityByProductType from "../../../components/dashboard/inventory/InventoryStockAndActivityByProductType";
import InventoryStockByCustomer from "../../../components/dashboard/inventory/InventoryStockByCustomer";
import InventoryLevelStock from "../../../components/dashboard/inventory/InventoryLevelStock";

const WAREHOUSE = "WHFG01";

export default function InventoryWhfg01() {
  return (
    <>
      <PageMeta title={`Inventory Dashboard ${WAREHOUSE} | SCOPE - Sanoh Indonesia`} description={`Dashboard Inventory Management & Stock Control untuk ${WAREHOUSE}`} />
      <div className="space-y-6">
        {/* Chart 1: Comprehensive KPI Cards - Full Width */}
        <InventoryKpiCards warehouse={WAREHOUSE} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <LazyLoad height="450px">
            <InventoryStockByCustomer warehouse={WAREHOUSE} />
          </LazyLoad>
          <LazyLoad height="450px">
            <InventoryStockHealthDistribution warehouse={WAREHOUSE} />
          </LazyLoad>
        </div>

        {/* Chart Inventory Level Stock */}
        <LazyLoad height="450px">
          <InventoryLevelStock warehouse={WAREHOUSE} />
        </LazyLoad>

        {/* Chart 4: Top 15 Critical Items */}
        <LazyLoad height="550px">
          <InventoryTopCriticalItems warehouse={WAREHOUSE} />
        </LazyLoad>

        {/* Chart 5: Top 15 Most Active Items */}
        <LazyLoad height="550px">
          <InventoryMostActiveItems warehouse={WAREHOUSE} />
        </LazyLoad>

        {/* Chart 6: Stock & Activity by Product Type */}
        <LazyLoad height="450px">
          <InventoryStockAndActivityByProductType warehouse={WAREHOUSE} />
        </LazyLoad>
      </div>
    </>
  );
}
