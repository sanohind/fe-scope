import PageMeta from "../../../components/common/PageMeta";
import LazyLoad from "../../../components/common/LazyLoad";
import InventoryKpiCards from "../../../components/dashboard/inventory/InventoryKpiCards";
import InventoryStockHealthDistribution from "../../../components/dashboard/inventory/InventoryStockHealthDistribution";
import InventoryStockMovementTrend from "../../../components/dashboard/inventory/InventoryStockMovementTrend";
import InventoryTopCriticalItems from "../../../components/dashboard/inventory/InventoryTopCriticalItems";
import InventoryMostActiveItems from "../../../components/dashboard/inventory/InventoryMostActiveItems";
import InventoryStockAndActivityByProductType from "../../../components/dashboard/inventory/InventoryStockAndActivityByProductType";
import InventoryStockByCustomer from "../../../components/dashboard/inventory/InventoryStockByCustomer";
import InventoryReceiptVsShipmentTrend from "../../../components/dashboard/inventory/InventoryReceiptVsShipmentTrend";
import InventoryTransactionTypeDistribution from "../../../components/dashboard/inventory/InventoryTransactionTypeDistribution";
import InventoryFastVsSlowMoving from "../../../components/dashboard/inventory/InventoryFastVsSlowMoving";
import InventoryStockTurnoverRate from "../../../components/dashboard/inventory/InventoryStockTurnoverRate";
import InventoryRecentTransactionHistory from "../../../components/dashboard/inventory/InventoryRecentTransactionHistory";

const WAREHOUSE = "WHRM01";

export default function InventoryWhmt01() {
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

        {/* Chart 3: Stock Movement Trend */}
        <LazyLoad height="450px">
          <InventoryStockMovementTrend warehouse={WAREHOUSE} />
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

        {/* Chart 8: Receipt vs Shipment Trend (Weekly) */}
        {/* <LazyLoad height="450px">
          <InventoryReceiptVsShipmentTrend warehouse={WAREHOUSE} />
        </LazyLoad> */}

        {/* Chart 9: Transaction Type Distribution */}
        {/* <LazyLoad height="450px">
          <InventoryTransactionTypeDistribution warehouse={WAREHOUSE} />
        </LazyLoad> */}

        {/* Chart 10 & 11: Fast vs Slow Moving & Stock Turnover Rate */}
        {/* <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <LazyLoad height="500px">
            <InventoryFastVsSlowMoving warehouse={WAREHOUSE} />
          </LazyLoad>
          <LazyLoad height="550px">
            <InventoryStockTurnoverRate warehouse={WAREHOUSE} />
          </LazyLoad>
        </div> */}

        {/* Chart 12: Recent Transaction History */}
        <LazyLoad height="700px">
          <InventoryRecentTransactionHistory warehouse={WAREHOUSE} />
        </LazyLoad>
      </div>
    </>
  );
}
