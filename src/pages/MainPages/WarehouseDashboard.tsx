import PageMeta from "../../components/common/PageMeta";
import LazyLoad from "../../components/common/LazyLoad";
import WarehouseOrderSummary from "../../components/dashboard/warehouse/WarehouseOrderSummary";
import DeliveryPerformance from "../../components/dashboard/warehouse/DeliveryPerformance";
import OrderStatusDistribution from "../../components/dashboard/warehouse/OrderStatusDistribution";
import DailyOrderVolume from "../../components/dashboard/warehouse/DailyOrderVolume";
import OrderFulfillmentRate from "../../components/dashboard/warehouse/OrderFulfillmentRate";
import TopItemsMoved from "../../components/dashboard/warehouse/TopItemsMoved";
import WarehouseOrderTimeline from "../../components/dashboard/warehouse/WarehouseOrderTimeline";

export default function WarehouseDashboard() {
  return (
    <>
      <PageMeta
        title="Warehouse Dashboard | SCOPE - Sanoh Indonesia"
        description="Dashboard 2: Warehouse Operations - Monitoring operasional warehouse order dan delivery performance"
      />
      <div className="space-y-6">
        {/* Warehouse Order Summary - KPI Cards - Load immediately */}
        <WarehouseOrderSummary />

        {/* Delivery Performance & Order Status Distribution */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <LazyLoad height="350px">
            <DeliveryPerformance />
          </LazyLoad>
          <LazyLoad height="350px">
            <OrderStatusDistribution />
          </LazyLoad>
        </div>

        {/* Daily Order Volume */}
        <LazyLoad height="450px">
          <DailyOrderVolume />
        </LazyLoad>

        {/* Order Fulfillment Rate & Top Items Moved */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <LazyLoad height="400px">
            <OrderFulfillmentRate />
          </LazyLoad>
          <LazyLoad height="400px">
            <TopItemsMoved />
          </LazyLoad>
        </div>
        {/* Warehouse Order Timeline */}
        <LazyLoad height="500px">
          <WarehouseOrderTimeline />
        </LazyLoad>
      </div>
    </>
  );
}
