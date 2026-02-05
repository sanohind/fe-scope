import PageMeta from "../../../components/common/PageMeta";
import LazyLoad from "../../../components/common/LazyLoad";
import AsakaiFilterHeader from "../../../components/dashboard/asakai/AsakaiFilterHeader";
import AsakaiChartLine from "../../../components/dashboard/asakai/AsakaiChartLine";
import { AsakaiFilterProvider, useAsakaiFilters } from "../../../context/AsakaiFilterContext";

// 13 Asakai Titles based on the image provided
const ASAKAI_TITLES = [
  { id: 1, title: "Safety - Fatal Accident", category: "Safety", descriptionLabel: "Target Maximum", unit: "qty" },
  { id: 2, title: "Safety - Lost Working Day", category: "Safety", descriptionLabel: "Target Maximum", unit: "qty" },
  { id: 3, title: "Quality - Customer Claim", category: "Quality", descriptionLabel: "Target Maximum", unit: "ppm" },
  { id: 4, title: "Quality - Warranty Claim", category: "Quality", descriptionLabel: "Target Maximum", unit: "ppm" },
  { id: 5, title: "Quality - Service Part", category: "Quality", descriptionLabel: "Target Maximum", unit: "ppm" },
  { id: 6, title: "Quality - Export Part", category: "Quality", descriptionLabel: "Target Maximum", unit: "ppm" },
  { id: 7, title: "Quality - Local Supplier", category: "Quality", descriptionLabel: "Target Maximum", unit: "ppm" },
  { id: 8, title: "Quality - Overseas Supplier", category: "Quality", descriptionLabel: "Target Maximum", unit: "ppm" },
  { id: 9, title: "Delivery - Shortage", category: "Delivery", descriptionLabel: "Target Maximum", unit: "ppm" },
  { id: 10, title: "Delivery - Miss Part", category: "Delivery", descriptionLabel: "Target Maximum", unit: "ppm" },
  { id: 11, title: "Delivery - Line Stop", category: "Delivery", descriptionLabel: "Target Maximum", unit: "minutes" },
  { id: 12, title: "Delivery - On Time Delivery", category: "Delivery", descriptionLabel: "Target Minimum", unit: "%" },
  { id: 13, title: "Delivery - Criple", category: "Delivery", descriptionLabel: "Target Maximum", unit: "unit" },
  { id: 14, title: "Maintenance - Downtime", category: "Maintenance", descriptionLabel: "Target Maximum", unit: "qty case over 4 hours" },
  { id: 15, title: "Maintenance - Mean Time to Repair", category: "Maintenance", descriptionLabel: "Target Maximum", unit: "minutes" },
  { id: 16, title: "Production  - Efficiency Nylon", category: "Productivity", descriptionLabel: "Target Minimum", unit: "pcs/man hours" },
  { id: 17, title: "Production  - Efficiency Chassis", category: "Productivity", descriptionLabel: "Target Minimum", unit: "pcs/man hours" },
  { id: 18, title: "Production  - Efficiency Brazzing", category: "Productivity", descriptionLabel: "Target Minimum", unit: "pcs/man hours" },
  { id: 19, title: "Production  - Productivity Nylon", category: "Productivity", descriptionLabel: "Target Minimum", unit: "%" },
  { id: 20, title: "Production  - Productivity Chassis", category: "Productivity", descriptionLabel: "Target Minimum", unit: "%" },
  { id: 21, title: "Production  - Productivity Brazzing", category: "Productivity", descriptionLabel: "Target Minimum", unit: "%" },
  { id: 22, title: "Quality - InHouse Reject Nylon", category: "Quality", descriptionLabel: "Target Maximum", unit: "ppm" },
  { id: 23, title: "Quality - InHouse Reject Chassis", category: "Quality", descriptionLabel: "Target Maximum", unit: "ppm" },
  { id: 24, title: "Quality - InHouse Reject Brazing", category: "Quality", descriptionLabel: "Target Maximum", unit: "ppm" },
  { id: 25, title: "Safety - Non Lost Working Day", category: "Safety", descriptionLabel: "Target Minimum", unit: "qty" },
  { id: 26, title: "Safety - CO2 Reduction", category: "Safety", descriptionLabel: "Target Maximum", unit: "tCO2" },
];

export default function AsakaiBoard() {
  return (
    <>
      <PageMeta title="Asakai Board | SCOPE - Sanoh Indonesia" description="Asakai Board - Monitoring Safety, Quality, and Delivery metrics" />
      <AsakaiFilterProvider>
        <AsakaiBoardContent />
      </AsakaiFilterProvider>
    </>
  );
}

const AsakaiBoardContent = () => {
  const { requestParams } = useAsakaiFilters();

  return (
    <div className="space-y-6">
      <AsakaiFilterHeader />

      {/* Safety Charts */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Safety</h2>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {ASAKAI_TITLES.filter((t) => t.category === "Safety").map((title) => (
            <LazyLoad key={title.id} height="450px">
<AsakaiChartLine titleId={title.id} titleName={title.title} category={title.category} filters={requestParams} descriptionLabel={title.descriptionLabel} unit={title.unit} />
            </LazyLoad>
          ))}
        </div>
      </div>

      {/* Quality Charts */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quality</h2>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {ASAKAI_TITLES.filter((t) => t.category === "Quality").map((title) => (
            <LazyLoad key={title.id} height="450px">
              <AsakaiChartLine titleId={title.id} titleName={title.title} category={title.category} filters={requestParams} descriptionLabel={title.descriptionLabel} unit={title.unit} />
            </LazyLoad>
          ))}
        </div>
      </div>

      {/* Delivery Charts */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Delivery</h2>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {ASAKAI_TITLES.filter((t) => t.category === "Delivery").map((title) => (
            <LazyLoad key={title.id} height="450px">
              <AsakaiChartLine titleId={title.id} titleName={title.title} category={title.category} filters={requestParams} descriptionLabel={title.descriptionLabel} unit={title.unit} />
            </LazyLoad>
          ))}
        </div>
      </div>

      {/* Production Charts */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Production</h2>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {ASAKAI_TITLES.filter((t) => t.category === "Productivity").map((title) => (
            <LazyLoad key={title.id} height="450px">
              <AsakaiChartLine titleId={title.id} titleName={title.title} category={title.category} filters={requestParams} descriptionLabel={title.descriptionLabel} unit={title.unit} />
            </LazyLoad>
          ))}
        </div>
      </div>

      {/* Maintenance Charts */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance</h2>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {ASAKAI_TITLES.filter((t) => t.category === "Maintenance").map((title) => (
            <LazyLoad key={title.id} height="450px">
              <AsakaiChartLine titleId={title.id} titleName={title.title} category={title.category} filters={requestParams} descriptionLabel={title.descriptionLabel} unit={title.unit} />
            </LazyLoad>
          ))}
        </div>
      </div>
    </div>
  );
};
