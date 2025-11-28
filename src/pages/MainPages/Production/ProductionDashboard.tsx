import PageMeta from "../../../components/common/PageMeta";
import LazyLoad from "../../../components/common/LazyLoad";
import ProductionKpiSummary from "../../../components/dashboard/production/ProductionKpiSummary";
import ProductionStatusDistribution from "../../../components/dashboard/production/ProductionStatusDistribution";
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

        {/* Production Status Distribution & Production by Customer */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <LazyLoad height="400px">
            <ProductionStatusDistribution />
          </LazyLoad>
          <LazyLoad height="400px">
            <ProductionByCustomer />
          </LazyLoad>
        </div>

        {/* Production by Model & Production by divisi */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <LazyLoad height="400px">
            <ProductionByModel />
          </LazyLoad>
          <LazyLoad height="400px">
            <ProductionByDivision />
          </LazyLoad>
        </div>

        {/* Production Trend */}
        <LazyLoad height="450px">
          <ProductionTrend />
        </LazyLoad>
      </div>
    </>
  );
}
