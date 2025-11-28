import PageMeta from "../../../components/common/PageMeta";
import LazyLoad from "../../../components/common/LazyLoad";
import ProductionKpiSummary from "../../../components/dashboard/production/ProductionKpiSummary";
import ProductionStatusDistribution from "../../../components/dashboard/production/ProductionStatusDistribution";
import ProductionByCustomer from "../../../components/dashboard/production/ProductionByCustomer";
import ProductionByModel from "../../../components/dashboard/production/ProductionByModel";
import ProductionTrend from "../../../components/dashboard/production/ProductionTrend";

const DIVISI = "PS";

export default function ProductionPs() {
  return (
    <>
      <PageMeta title="Production Dashboard | SCOPE - Sanoh Indonesia" description="Dashboard 3: Production Planning & Monitoring - Monitoring production orders dan tracking achievement" />
      <div className="space-y-6">
        {/* Production KPI Summary - 5 KPI Cards - Load immediately */}
        <ProductionKpiSummary divisi={DIVISI} />

        {/* Production Status Distribution & Production by Customer */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <LazyLoad height="400px">
            <ProductionStatusDistribution divisi={DIVISI} />
          </LazyLoad>
          <LazyLoad height="400px">
            <ProductionByModel divisi={DIVISI} />
          </LazyLoad>
        </div>

        <LazyLoad height="400px">
          <ProductionByCustomer divisi={DIVISI} />
        </LazyLoad>

        {/* Production Trend */}
        <LazyLoad height="450px">
          <ProductionTrend divisi={DIVISI} />
        </LazyLoad>
      </div>
    </>
  );
}
