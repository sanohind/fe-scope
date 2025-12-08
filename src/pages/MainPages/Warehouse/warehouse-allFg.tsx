import PageMeta from "../../../components/common/PageMeta";
import LazyLoad from "../../../components/common/LazyLoad";
import WarehouseOrderSummary from "../../../components/dashboard/warehouse/Extend/WarehouseOrderSummary";
import DeliveryPerformance from "../../../components/dashboard/warehouse/Extend/DeliveryPerformance";
import OrderStatusDistribution from "../../../components/dashboard/warehouse/Extend/OrderStatusDistribution";
import TopItemsMoved from "../../../components/dashboard/warehouse/Extend/TopItemsMoved";
import DailyStockTrend from "../../../components/dashboard/warehouse/Extend/DailyStockTrend";
import InventoryStockMovementTrend from "../../../components/dashboard/inventory/InventoryStockMovementTrend";
import WarehouseFilterHeader from "../../../components/dashboard/warehouse/WarehouseFilterHeader";
import { WarehouseFilterProvider, useWarehouseFilters } from "../../../context/WarehouseFilterContext";

const WAREHOUSE = "FG";

export default function WarehouseAllFg() {
  return (
    <>
      <PageMeta title="Warehouse Dashboard | SCOPE - Sanoh Indonesia" description="Dashboard 2: Warehouse Operations - Monitoring operasional warehouse order dan delivery performance" />
      <WarehouseFilterProvider>
        <WarehouseAllFgContent />
      </WarehouseFilterProvider>
    </>
  );
}

const WarehouseAllFgContent = () => {
  const { requestParams, dateRange, rangeDescription, modeLabel, mode } = useWarehouseFilters();
  const { from, to } = dateRange;

  return (
    <div className="space-y-6">
      <WarehouseFilterHeader warehouseName="All FG" />

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

      <div>
        <h1 className="mb-4 text-2xl font-semibold text-black dark:text-white">Balance WHFG01</h1>
        <LazyLoad height="360px">
          <DailyStockTrend warehouse="WHFG01" filters={requestParams} period={mode} rangeLabel={rangeDescription} modeLabel={modeLabel} />
        </LazyLoad>
      </div>

      <div>
        <h1 className="mb-4 text-2xl font-semibold text-black dark:text-white">Balance WHFG02</h1>
        <LazyLoad height="360px">
          <DailyStockTrend warehouse="WHFG02" filters={requestParams} period={mode} rangeLabel={rangeDescription} modeLabel={modeLabel} />
        </LazyLoad>
      </div>

      <div>
        <h1 className="mb-4 text-2xl font-semibold text-black dark:text-white">Movement WHFG01</h1>
        <LazyLoad height="450px">
          <InventoryStockMovementTrend warehouse="WHFG01" filters={requestParams} dateFrom={from} dateTo={to} />
        </LazyLoad>
      </div>

      <div>
        <h1 className="mb-4 text-2xl font-semibold text-black dark:text-white">Movement WHFG02</h1>
        <LazyLoad height="450px">
          <InventoryStockMovementTrend warehouse="WHFG02" filters={requestParams} dateFrom={from} dateTo={to} />
        </LazyLoad>
      </div>
    </div>
  );
};
