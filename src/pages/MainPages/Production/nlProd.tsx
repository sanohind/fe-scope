import PageMeta from "../../../components/common/PageMeta";
import LazyLoad from "../../../components/common/LazyLoad";
import ProductionKpiSummary from "../../../components/dashboard/production/ProductionKpiSummary";
import ProductionStatusDistribution from "../../../components/dashboard/production/ProductionStatusDistribution";
import ProductionByCustomer from "../../../components/dashboard/production/ProductionByCustomer";
import ProductionByModel from "../../../components/dashboard/production/ProductionByModel";
import ProductionTrend from "../../../components/dashboard/production/ProductionTrend";
import ProductionFilterHeader from "../../../components/dashboard/production/ProductionFilterHeader";
import { ProductionFilterProvider, useProductionFilters } from "../../../context/ProductionFilterContext";
import ProductionTrendKelola from "../../../components/dashboard/production/ProductionTrendKelola";
import ProductionTrendOdoo from "../../../components/dashboard/production/ProductionTrendOdoo";
import ProductionNgTrend from "../../../components/dashboard/production/ProductionNgTrend";
import ProductionTopNgTypes from "../../../components/dashboard/production/ProductionTopNgTypes";
import BreakdownCauseDistributionChart from "../../../components/dashboard/production/BreakdownCauseDistributionChart";

const DIVISI = "NL";

export default function ProductionNl() {
  return (
    <>
      <PageMeta title="Production Dashboard | SCOPE - Sanoh Indonesia" description="Dashboard 3: Production Planning & Monitoring - Monitoring production orders dan tracking achievement" />
      <ProductionFilterProvider defaultDivisi={DIVISI}>
        <ProductionNlContent />
      </ProductionFilterProvider>
    </>
  );
}

const ProductionNlContent = () => {
  const { requestParams, dateRange } = useProductionFilters();
  const { from, to } = dateRange;

  return (
    <div className="space-y-6">
      <ProductionFilterHeader filters={{ divisi: false }} />

      {/* Production KPI Summary - 5 KPI Cards - Load immediately */}
      <ProductionKpiSummary dateFrom={from} dateTo={to} divisi={requestParams.divisi} period={requestParams.period} />

      <LazyLoad height="450px">
        <ProductionTrend dateFrom={from} dateTo={to} divisi={requestParams.divisi} period={requestParams.period} />
      </LazyLoad>
      
      {/* Odoo Charts */}
      <LazyLoad height="450px">
        <ProductionTrendOdoo dateFrom={from} dateTo={to} period={requestParams.period} />
      </LazyLoad>

      {/* Kelola Charts */}
      <LazyLoad height="450px">
        <ProductionTrendKelola dateFrom={from} dateTo={to} divisi={requestParams.divisi} period={requestParams.period} />
      </LazyLoad>

      <LazyLoad height="450px">
        <BreakdownCauseDistributionChart dateFrom={from} dateTo={to} divisi={requestParams.divisi} period={requestParams.period} metric="duration" />
      </LazyLoad>
      <LazyLoad height="450px">
        <BreakdownCauseDistributionChart dateFrom={from} dateTo={to} divisi={requestParams.divisi} period={requestParams.period} metric="count" />
      </LazyLoad>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <LazyLoad height="400px">
          <ProductionNgTrend dateFrom={from} dateTo={to} divisi={requestParams.divisi} period={requestParams.period} />
        </LazyLoad>
        <LazyLoad height="400px">
          <ProductionTopNgTypes dateFrom={from} dateTo={to} divisi={requestParams.divisi} period={requestParams.period} />
        </LazyLoad>
      </div>

      {/* Production Status Distribution & Production by Customer */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <LazyLoad height="400px">
          <ProductionStatusDistribution dateFrom={from} dateTo={to} divisi={requestParams.divisi} period={requestParams.period} />
        </LazyLoad>
        <LazyLoad height="400px">
          <ProductionByModel dateFrom={from} dateTo={to} divisi={requestParams.divisi} period={requestParams.period} />
        </LazyLoad>
      </div>

      <LazyLoad height="400px">
        <ProductionByCustomer dateFrom={from} dateTo={to} divisi={requestParams.divisi} period={requestParams.period} />
      </LazyLoad>
    </div>
  );
};
