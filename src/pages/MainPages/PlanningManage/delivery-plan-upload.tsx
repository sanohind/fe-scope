import { DeliveryPlanManage } from "../../../components/dashboard/planning";
import PageMeta from "../../../components/common/PageMeta";

export default function DeliveryPlanUploadPage() {
  return (
    <>
      <PageMeta title="Planning Manage | Delivery Plan Upload" description="Manage delivery plan data with import capabilities" />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <DeliveryPlanManage />
        </div>
      </div>
    </>
  );
}
