import PageMeta from "../../components/common/PageMeta";
import ProductionKpiSummary from "../../components/dashboard/production/ProductionKpiSummary";
import ProductionStatusDistribution from "../../components/dashboard/production/ProductionStatusDistribution";
import ProductionByCustomer from "../../components/dashboard/production/ProductionByCustomer";
import ProductionByModel from "../../components/dashboard/production/ProductionByModel";
import ProductionByDivision from "../../components/dashboard/production/ProductionByDivision";
import ProductionTrend from "../../components/dashboard/production/ProductionTrend";
import ProductionScheduleTimeline from "../../components/dashboard/production/ProductionScheduleTimeline";

export default function ProductionDashboard() {
  return (
    <>
      <PageMeta title="Production Dashboard | SCOPE - Sanoh Indonesia" description="Dashboard 3: Production Planning & Monitoring - Monitoring production orders dan tracking achievement" />
      <div className="space-y-6">
        {/* Production KPI Summary - 5 KPI Cards */}
        <ProductionKpiSummary />

        {/* Production Status Distribution & Production by Customer */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ProductionStatusDistribution />
          <ProductionByCustomer />
        </div>

        {/* Production Outstanding Analysis Table */}
        {/* <ProductionOutstandingAnalysis /> */}

        {/* Production by Model & Production by Division */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ProductionByModel />
          <ProductionByDivision />
        </div>

        {/* Production Trend */}
        <ProductionTrend />

        {/* Production Schedule Timeline Table */}
        <ProductionScheduleTimeline />
      </div>
    </>
  );
}
