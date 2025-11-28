import PageMeta from "../../../components/common/PageMeta";
import LazyLoad from "../../../components/common/LazyLoad";
import WarehouseOrderSummary from "../../../components/dashboard/warehouse/Extend/WarehouseOrderSummary";
import DeliveryPerformance from "../../../components/dashboard/warehouse/Extend/DeliveryPerformance";
import OrderStatusDistribution from "../../../components/dashboard/warehouse/Extend/OrderStatusDistribution";
import TopItemsMoved from "../../../components/dashboard/warehouse/Extend/TopItemsMoved";
import DailyStockTrend from "../../../components/dashboard/warehouse/Extend/DailyStockTrend";
import InventoryStockMovementTrend from "../../../components/dashboard/inventory/InventoryStockMovementTrend";

const WAREHOUSE = "RM";

export default function WarehouseAllRm() {
  return (
    <>
      <PageMeta title="Warehouse Dashboard | SCOPE - Sanoh Indonesia" description="Dashboard 2: Warehouse Operations - Monitoring operasional warehouse order dan delivery performance" />
      <div className="space-y-6">
        {/* Warehouse Order Summary - KPI Cards - Load immediately */}
        <WarehouseOrderSummary warehouse={WAREHOUSE} />

        {/* Delivery Performance & Order Status Distribution */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <LazyLoad height="350px">
            <DeliveryPerformance warehouse={WAREHOUSE} />
          </LazyLoad>
          <LazyLoad height="400px">
            <TopItemsMoved warehouse={WAREHOUSE} />
          </LazyLoad>
        </div>

        <LazyLoad height="350px">
          <OrderStatusDistribution warehouse={WAREHOUSE} />
        </LazyLoad>

        <LazyLoad height="360px">
          <DailyStockTrend warehouse={WAREHOUSE} />
        </LazyLoad>

        <div>
          <h1 className="font-semibold text-black dark:text-white text-2xl mb-4">Movement WHRM01</h1>
          <LazyLoad height="450px">
            <InventoryStockMovementTrend warehouse={"WHRM01"} />
          </LazyLoad>
        </div>

        <div>
          <h1 className="font-semibold text-black dark:text-white text-2xl mb-4">Movement WHRM02</h1>
          <LazyLoad height="450px">
            <InventoryStockMovementTrend warehouse={"WHRM02"} />
          </LazyLoad>
        </div>
      </div>
    </>
  );
}
