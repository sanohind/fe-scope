import PageMeta from "../../../components/common/PageMeta";
import LazyLoad from "../../../components/common/LazyLoad";
import ProductionKpiSummary from "../../../components/dashboard/production/ProductionKpiSummary";
import ProductionByCustomer from "../../../components/dashboard/production/ProductionByCustomer";
import ProductionByModel from "../../../components/dashboard/production/ProductionByModel";
import ProductionByDivision from "../../../components/dashboard/production/ProductionByDivision";
import ProductionTrend from "../../../components/dashboard/production/ProductionTrend";

export default function ProductionDashboard() {
  return (
    <>
      <PageMeta title="Production Dashboard | SCOPE - Sanoh Indonesia" description="Dashboard 3: Production Planning & Monitoring - Monitoring production orders dan tracking achievement" />
      <div className="space-y-6">
        {/* Production KPI Summary - 5 KPI Cards - Load immediately */}
        <ProductionKpiSummary />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="col-span-3">
            <LazyLoad height="450px">
              <ProductionTrend />
            </LazyLoad>
          </div>
          <div className="col-span-2">
            <LazyLoad height="450px">
              <ProductionByDivision />
            </LazyLoad>
          </div>
        </div>

        {/* Production Status Distribution & Production by Customer */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <LazyLoad height="400px">
            <ProductionByCustomer />
          </LazyLoad>
          <LazyLoad height="400px">
            <ProductionByModel />
          </LazyLoad>
        </div>
      </div>
    </>
  );
}
