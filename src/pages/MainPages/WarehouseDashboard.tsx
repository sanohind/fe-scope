import PageMeta from "../../components/common/PageMeta";
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
        {/* Warehouse Order Summary - KPI Cards */}
        <WarehouseOrderSummary />

        {/* Delivery Performance & Order Status Distribution */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <DeliveryPerformance />
          <OrderStatusDistribution />
        </div>

        {/* Daily Order Volume */}
        <DailyOrderVolume />

        {/* Order Fulfillment Rate & Top Items Moved */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <OrderFulfillmentRate />
          <TopItemsMoved />
        </div>
        {/* Warehouse Order Timeline */}
        <WarehouseOrderTimeline />
      </div>
    </>
  );
}
