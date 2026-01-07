import PageMeta from "../../../components/common/PageMeta";
import LazyLoad from "../../../components/common/LazyLoad";
import WarehouseOrderSummary from "../../../components/dashboard/warehouse/Extend/WarehouseOrderSummary";
import DeliveryPerformance from "../../../components/dashboard/warehouse/Extend/DeliveryPerformance";
import OrderStatusDistribution from "../../../components/dashboard/warehouse/Extend/OrderStatusDistribution";
import TopItemsMoved from "../../../components/dashboard/warehouse/Extend/TopItemsMoved";
import DailyStockTrend from "../../../components/dashboard/warehouse/Extend/DailyStockTrend";
import PlanReceiptChart from "../../../components/dashboard/warehouse/Extend/PlanReceiptChart";
import WarehouseFilterHeader from "../../../components/dashboard/warehouse/WarehouseFilterHeader";
import { WarehouseFilterProvider, useWarehouseFilters } from "../../../context/WarehouseFilterContext";

const WAREHOUSE = "RM";

export default function WarehouseAllRm() {
  return (
    <>
      <PageMeta title="Warehouse Dashboard | SCOPE - Sanoh Indonesia" description="Dashboard 2: Warehouse Operations - Monitoring operasional warehouse order dan delivery performance" />
      <WarehouseFilterProvider>
        <WarehouseAllRmContent />
      </WarehouseFilterProvider>
    </>
  );
}

const WarehouseAllRmContent = () => {
  const { requestParams, dateRange, rangeDescription, modeLabel, mode } = useWarehouseFilters();
  const { from, to } = dateRange;

  return (
    <div className="space-y-6">
      <WarehouseFilterHeader warehouseName="All RM" />

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
        <h1 className="mb-4 text-2xl font-semibold text-black dark:text-white">Balance WHRM01</h1>
        <LazyLoad height="360px">
          <DailyStockTrend warehouse="WHRM01" filters={requestParams} period={mode} rangeLabel={rangeDescription} modeLabel={modeLabel} />
        </LazyLoad>
      </div>

      <div>
        <h1 className="mb-4 text-2xl font-semibold text-black dark:text-white">Balance WHRM02</h1>
        <LazyLoad height="360px">
          <DailyStockTrend warehouse="WHRM02" filters={requestParams} period={mode} rangeLabel={rangeDescription} modeLabel={modeLabel} />
        </LazyLoad>
      </div>

      <div>
        <h1 className="mb-4 text-2xl font-semibold text-black dark:text-white">Plan Receipt WHRM01</h1>
        <LazyLoad height="480px">
          <PlanReceiptChart warehouse="WHRM01" dateFrom={from} dateTo={to} />
        </LazyLoad>
      </div>

      <div>
        <h1 className="mb-4 text-2xl font-semibold text-black dark:text-white">Plan Receipt WHRM02</h1>
        <LazyLoad height="480px">
          <PlanReceiptChart warehouse="WHRM02" dateFrom={from} dateTo={to} />
        </LazyLoad>
      </div>
    </div>
  );
};
