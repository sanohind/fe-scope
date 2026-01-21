import { DeliveryPlanManageTable } from "../../../components/dashboard/planning";
import PageMeta from "../../../components/common/PageMeta";

export default function DeliveryPlanManagePage() {
  return (
    <>
      <PageMeta title="Planning Manage | Delivery Plan Management" description="Manage delivery plan data with edit and delete capabilities" />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <DeliveryPlanManageTable />
        </div>
      </div>
    </>
  );
}
