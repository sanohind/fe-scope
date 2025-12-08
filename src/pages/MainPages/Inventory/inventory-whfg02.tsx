import PageMeta from "../../../components/common/PageMeta";
import LazyLoad from "../../../components/common/LazyLoad";
import InventoryKpiCards from "../../../components/dashboard/inventory/InventoryKpiCards";
import InventoryStockHealthDistributionBarChart from "../../../components/dashboard/inventory/InventoryStockHealthDistributionBarChart";
import InventoryTopCriticalItems from "../../../components/dashboard/inventory/InventoryTopCriticalItems";
import InventoryMostActiveItems from "../../../components/dashboard/inventory/InventoryMostActiveItems";
import InventoryStockByCustomer from "../../../components/dashboard/inventory/InventoryStockByCustomer";
import StockLevelByCustomer from "../../../components/dashboard/inventory/StockLevelByCustomer";
import InventoryFilterHeader from "../../../components/dashboard/inventory/InventoryFilterHeader";
import { InventoryFilterProvider, useInventoryFilters } from "../../../context/InventoryFilterContext";

const WAREHOUSE = "WHFG02";

export default function InventoryWhfg02() {
  return (
    <>
      <PageMeta title={`Inventory Dashboard ${WAREHOUSE} | SCOPE - Sanoh Indonesia`} description={`Dashboard Inventory Management & Stock Control untuk ${WAREHOUSE}`} />
      <InventoryFilterProvider warehouse={WAREHOUSE}>
        <InventoryWhfg02Content />
      </InventoryFilterProvider>
    </>
  );
}

const InventoryWhfg02Content = () => {
  const { requestParams } = useInventoryFilters();

  return (
    <div className="space-y-6">
      {/* Chart 1: Comprehensive KPI Cards - Full Width */}
      <InventoryFilterHeader filters={{ groupType: false }}/>
      <InventoryKpiCards warehouse={WAREHOUSE} filters={requestParams} />

      <LazyLoad height="450px">
        <InventoryStockByCustomer warehouse={WAREHOUSE} filters={requestParams} />
      </LazyLoad>

      <LazyLoad height="450px">
        <InventoryStockHealthDistributionBarChart warehouse={WAREHOUSE} filters={requestParams} />
      </LazyLoad>

      {/* Chart Inventory Level Stock */}
      <LazyLoad height="450px">
        <StockLevelByCustomer warehouse={WAREHOUSE} filters={requestParams} />
      </LazyLoad>

      {/* Chart 4: Top 15 Critical Items */}
      <LazyLoad height="550px">
        <InventoryTopCriticalItems warehouse={WAREHOUSE} filters={requestParams} />
      </LazyLoad>

      {/* Chart 5: Top 15 Most Active Items */}
      <LazyLoad height="550px">
        <InventoryMostActiveItems warehouse={WAREHOUSE} filters={requestParams} />
      </LazyLoad>
    </div>
  );
};
