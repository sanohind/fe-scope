import PageMeta from "../../../components/common/PageMeta";
import LazyLoad from "../../../components/common/LazyLoad";
import WarehouseOrderSummary from "../../../components/dashboard/warehouse/Extend/WarehouseOrderSummary";
import DeliveryPerformance from "../../../components/dashboard/warehouse/Extend/DeliveryPerformance";
import OrderStatusDistribution from "../../../components/dashboard/warehouse/Extend/OrderStatusDistribution";
import TopItemsMoved from "../../../components/dashboard/warehouse/Extend/TopItemsMoved";
import InventoryStockMovementTrend from "../../../components/dashboard/inventory/InventoryStockMovementTrend";
import { ExtendWDailyStockTrend } from "../../../components/dashboard/warehouse";
import InventoryStockAndActivityByProductType from "../../../components/dashboard/inventory/InventoryStockAndActivityByProductType";
import WarehouseFilterHeader from "../../../components/dashboard/warehouse/WarehouseFilterHeader";
import { WarehouseFilterProvider, useWarehouseFilters } from "../../../context/WarehouseFilterContext";

const WAREHOUSE = "WHFG01";

export default function WarehouseWhfg01() {
  return (
    <>
      <PageMeta title="Warehouse Dashboard | SCOPE - Sanoh Indonesia" description="Dashboard 2: Warehouse Operations - Monitoring operasional warehouse order dan delivery performance" />
      <WarehouseFilterProvider>
        <WarehouseWhfg01Content />
      </WarehouseFilterProvider>
    </>
  );
}

const WarehouseWhfg01Content = () => {
  const { requestParams, dateRange, rangeDescription, modeLabel, mode } = useWarehouseFilters();
  const { from, to } = dateRange;

  return (
    <div className="space-y-6">
      <WarehouseFilterHeader warehouseName={WAREHOUSE} />

      <WarehouseOrderSummary warehouse={WAREHOUSE} filters={requestParams} period={mode} rangeLabel={rangeDescription} modeLabel={modeLabel} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <LazyLoad height="350px">
          <DeliveryPerformance warehouse={WAREHOUSE} filters={requestParams} period={mode} rangeLabel={rangeDescription} modeLabel={modeLabel} />
        </LazyLoad>
        <LazyLoad height="400px">
          <TopItemsMoved warehouse={WAREHOUSE} filters={requestParams} period={mode} rangeLabel={rangeDescription} modeLabel={modeLabel} />
        </LazyLoad>
      </div>

      <LazyLoad height="350px">
        <OrderStatusDistribution warehouse={WAREHOUSE} filters={requestParams} period={mode} rangeLabel={rangeDescription} modeLabel={modeLabel} />
      </LazyLoad>

      <LazyLoad height="360px">
        <ExtendWDailyStockTrend warehouse={WAREHOUSE} filters={requestParams} period={mode} rangeLabel={rangeDescription} modeLabel={modeLabel} />
      </LazyLoad>

      <div>
        <LazyLoad height="450px">
          <InventoryStockMovementTrend warehouse={WAREHOUSE} filters={requestParams} dateFrom={from} dateTo={to} />
        </LazyLoad>
      </div>

      <LazyLoad height="450px">
        <InventoryStockAndActivityByProductType warehouse={WAREHOUSE} filters={requestParams} dateFrom={from} dateTo={to} />
      </LazyLoad>
    </div>
  );
};
