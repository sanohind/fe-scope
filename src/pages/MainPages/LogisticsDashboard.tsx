import PageMeta from "../../components/common/PageMeta";
import LazyLoad from "../../components/common/LazyLoad";
import { ShipmentTable, ShipmentStatusComparison, LogisticsPerformance, DailyDeliveryPerformance } from "../../components/dashboard/Logistic";
import { ShipmentAnalyticsChart } from "../../components/dashboard/sales";

export default function LogisticsDashboard() {
  return (
    <>
      <PageMeta title="Logistics Dashboard | SCOPE - Sanoh Indonesia" description="Dashboard 6: Logistics - Monitoring Shipment " />
      <div className="space-y-6">
        <div className="grid grid-cols-10 gap-4">
          <div className="col-span-5">
            <LazyLoad height="350px">
              <ShipmentAnalyticsChart />
            </LazyLoad>
          </div>
          <div className="col-span-5">
            <LazyLoad height="350px">
              <LogisticsPerformance />
            </LazyLoad>
          </div>
        </div>
        <LazyLoad height="500px">
          <DailyDeliveryPerformance />
        </LazyLoad>
        <LazyLoad height="500px">
          <ShipmentStatusComparison />
        </LazyLoad>
        <LazyLoad height="350px">
          <ShipmentTable />
        </LazyLoad>
      </div>
    </>
  );
}
