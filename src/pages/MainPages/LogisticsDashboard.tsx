import PageMeta from "../../components/common/PageMeta";
import LazyLoad from "../../components/common/LazyLoad";
import { ShipmentTable, ShipmentStatusComparison, LogisticsPerformance } from "../../components/dashboard/Logistic";
import { ShipmentAnalyticsChart } from "../../components/dashboard/sales";

export default function LogisticsDashboard() {
  return (
    <>
      <PageMeta title="Logistics Dashboard | SCOPE - Sanoh Indonesia" description="Dashboard 6: Logistics - Monitoring Shipment " />
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <LazyLoad height="350px">
            <ShipmentAnalyticsChart />
          </LazyLoad>
          <LazyLoad height="350px">
            <LogisticsPerformance />
          </LazyLoad>
        </div>
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
