import PageMeta from "../../../components/common/PageMeta";
import LazyLoad from "../../../components/common/LazyLoad";
import AsakaiFilterHeader from "../../../components/dashboard/asakai/AsakaiFilterHeader";
import AsakaiChartLine from "../../../components/dashboard/asakai/AsakaiChartLine";
import { AsakaiFilterProvider, useAsakaiFilters } from "../../../context/AsakaiFilterContext";

// 13 Asakai Titles based on the image provided
const ASAKAI_TITLES = [
  { id: 1, title: "Safety - Fatal Accident", category: "Safety" },
  { id: 2, title: "Safety - Lost Working Day", category: "Safety" },
  { id: 3, title: "Quality - Customer Claim", category: "Quality" },
  { id: 4, title: "Quality - Warranty Claim", category: "Quality" },
  { id: 5, title: "Quality - Service Part", category: "Quality" },
  { id: 6, title: "Quality - Export Part", category: "Quality" },
  { id: 7, title: "Quality - Local Supplier", category: "Quality" },
  { id: 8, title: "Quality - Overseas Supplier", category: "Quality" },
  { id: 9, title: "Delivery - Shortage", category: "Delivery" },
  { id: 10, title: "Delivery - Miss Part", category: "Delivery" },
  { id: 11, title: "Delivery - Line Stop", category: "Delivery" },
  { id: 12, title: "Delivery - On Time Delivery", category: "Delivery" },
  { id: 13, title: "Delivery - Criple", category: "Delivery" },
  { id: 14, title: "Maintenance - Downtime", category: "Maintenance" },
  { id: 15, title: "Maintenance - Mean Time to Repair", category: "Maintenance" },
  { id: 16, title: "Productivity - Efficiency Nylon", category: "Productivity" },
  { id: 17, title: "Productivity - Efficiency Chassis", category: "Productivity" },
  { id: 18, title: "Productivity - Efficiency Brazzing", category: "Productivity" },
  { id: 19, title: "Productivity - Pcs/WH Nylon", category: "Productivity" },
  { id: 20, title: "Productivity - Pcs/WH Chassis", category: "Productivity" },
  { id: 21, title: "Productivity - Pcs/WH Brazzing", category: "Productivity" },
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
              <AsakaiChartLine titleId={title.id} titleName={title.title} category={title.category} filters={requestParams} />
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
              <AsakaiChartLine titleId={title.id} titleName={title.title} category={title.category} filters={requestParams} />
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
              <AsakaiChartLine titleId={title.id} titleName={title.title} category={title.category} filters={requestParams} />
            </LazyLoad>
          ))}
        </div>
      </div>

      {/* Productivity Charts */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Productivity</h2>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {ASAKAI_TITLES.filter((t) => t.category === "Productivity").map((title) => (
            <LazyLoad key={title.id} height="450px">
              <AsakaiChartLine titleId={title.id} titleName={title.title} category={title.category} filters={requestParams} />
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
              <AsakaiChartLine titleId={title.id} titleName={title.title} category={title.category} filters={requestParams} />
            </LazyLoad>
          ))}
        </div>
      </div>
    </div>
  );
};
